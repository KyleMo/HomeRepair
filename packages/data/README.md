# Data Table Structure Outline — Appliance Repair Booking Widget

Naming convention used throughout: **company** = your client (the repair business), **customer** = the homeowner/person booking. Avoid "client" in the schema entirely — it collides with "customer" in conversation and in code. Every tenant-owned table carries `company_id`; global catalog tables carry none.

---

## 1. Tenancy & identity

### organizations

The umbrella for multi-location groups (franchise groups, PE roll-ups).

- id, name, billing_email, plan, created_at
  **Design decision:** rather than making `company.organization_id` nullable ("a client can exist on its own"), auto-create a single-company organization for every signup. Every company always belongs to exactly one org. This costs one extra row per solo shop and buys you: no null-handling in permission checks, a frictionless upgrade path when a solo shop opens location #2, and org-level billing/reporting that works identically for 1 or 50 locations.

### companies

One physical location / brand instance. The core tenant.

- id, organization_id (FK, required), name, slug (hosted page URL), phone, email, timezone
- business_type (independent / franchise_location / branch)
- warranty_days (e.g. 30 — displayed on portal and confirmations as a trust element)
- status (trial / active / paused / churned), created_at

### users

People who log into the admin dashboard.

- id, email, password_hash / auth_provider, name, phone, last_login_at

### memberships

Joins users to what they can manage. Solves "always related to a company" while also supporting org-level admins who oversee every location.

- id, user_id, scope_type (organization | company), scope_id, role (owner / admin / staff)

---

## 2. Catalogs (system-owned defaults + company-defined extensions)

Both catalog tables are _scoped_: `company_id` null = system-owned entry visible to everyone; `company_id` set = a custom entry that company created, visible only to them. One table, one FK shape everywhere downstream — brand_rules, intakes, and customer_appliances reference the same table whether the entry is global or custom.

### appliance_types

- id, company_id (nullable — null = system), name, icon, sort_order, has_digital_display (drives error-code field), active
- Custom types (espresso machines, wine cellars, ice machines for restaurants) come with obligations the UI must walk the shop through: pick an icon, define at least a few symptoms (or accept a generic starter set: "Won't turn on / Not working right / Making noise / Leaking / Something else"), and optionally set a tag-location hint and job duration.

### brands

- id, company_id (nullable — null = system), name, aliases (JSON — "GE" / "General Electric"), popularity_rank, active
- On custom-brand creation, fuzzy-match against system brands + aliases first and suggest the existing entry — otherwise every tenant creates their own duplicate "General Electric" and your cross-company analytics fragment.
  **Promotion path:** track custom-entry creation. When many companies independently add the same brand or type, promote it to a system entry and merge references (keep a `merged_into_id` on retired rows). Custom entries are also your cheapest market research — they tell you which adjacent verticals your customers are already pulling you toward.

### symptoms

Default taxonomy shipped with the product; company_symptoms (section 3) handles per-company additions, including full symptom sets for custom appliance types.

- id, appliance_type_id, label (customer-facing), code (internal, stable), sort_order, safety_flag (null | gas | electrical | fire — triggers safety interstitial)

### brand_appliance_types

Optional many-to-many mapping of which brands manufacture which appliance types. Used to _rank_, never to _restrict_: the brand picker surfaces mapped brands as top chips for the selected appliance type, but the full searchable brand list stays available underneath — a missing mapping row must never block a legitimate booking (customer picks "Not sure" and you lose diagnostic data, the worse failure). Seed lazily from booking data rather than curating 60+ brands upfront: every confirmed intake is evidence of a real brand × type pairing.

- id, brand_id, appliance_type_id, popularity_rank (per-type — Sub-Zero ranks high for refrigerators, absent for washers), source (curated | observed)

### model_tag_locations

Where the model tag lives, for the photo-capture step. Same scoping pattern so shops can supply hints for custom types/brands.

- id, company_id (nullable — null = system), appliance_type_id, brand_id (nullable — null = default for the type), description, illustration_asset_id
  Global catalogs mean every new company gets a working taxonomy with zero setup, and a taxonomy improvement ships to all tenants at once. Company-level customization happens through the override tables below, never by editing the catalog.

---

## 3. Company service configuration ("Service Operations")

### company_services

Which appliance types this company repairs, plus per-type operational settings.

- id, company_id, appliance_type_id, enabled
- job*duration_minutes (the \_default* duration for this appliance type — feeds capacity math later)
- custom_instructions (shown to customer after selecting this appliance)

### company_service_duration_overrides

Duration exceptions at finer grain than appliance type. Resolution: most specific match wins — (type + brand + symptom) → (type + brand) → (type + symptom) → company_services default.

- id, company_service_id, brand_id (nullable), symptom_id (nullable), duration_minutes
- At least one of brand_id / symptom_id must be set (a row with neither is just the default and belongs on company_services)
- Symptom is included in the shape because it's often the _bigger_ duration driver than brand — "refrigerator not cooling" (possible sealed-system work) vs. "door seal problem" is a wider spread than Whirlpool vs. GE. Ship the UI for brand overrides and symptom overrides as simple exception lists ("add an exception…"), never as a matrix to fill in — shops will configure five exceptions, not five hundred, and that's correct usage.
- Future (Phase 3+): once bookings capture completion timestamps, suggest overrides from observed actuals ("Your Sub-Zero refrigerator jobs average 140 min vs. your 60 min setting — update?"). The table is where learned durations land; the schema needs nothing extra now.

### brand_rules

Allow/block by brand, optionally scoped to an appliance type. Covers "services Whirlpool everything, LG except refrigerators."

- id, company_id, brand_id, appliance_type_id (nullable = all types), rule (allow | block)
- rejection_message (shown on block), custom_instructions (your "custom instructions per fridge > brand" — shown on allow, e.g. "For Sub-Zero units, please also photograph the compressor sticker")

### job_type_policies

- id, company_id, job_type (cod | manufacturer_warranty | home_warranty | landlord_pm), accepted (bool), display_mode (hide | show_grayed), message (instructions if accepted, rejection copy if not)

---

## 4. Geography & routing

### service_areas

- id, company_id, zip_code, zone_id (nullable), source (manual | radius_import)

### zones

Groups of ZIPs with scheduling constraints ("north side Tuesdays/Thursdays").

- id, company_id, name, color

### zone_schedules

- id, zone_id, weekday (0–6)

### routing_settings (one row per company)

Your "how should availability display" question, kept extensible:

- id, company_id
- availability_display_mode (all_windows | zone_filtered | proximity_weighted)
- proximity_weighted is the Phase 3+ mode: rank windows higher when an existing booking that day is within N miles — needs geocoded bookings (lat/lng below) before it can ship, but the schema shouldn't block it
- min_lead_time_minutes, booking_horizon_days, reschedule_cutoff_minutes
- use_job_durations (bool — when true, capacity consumes duration from company_services instead of flat slot counts)

---

## 5. Availability

### availability_windows

Template of recurring weekly windows.

- id, company_id, weekday, label ("Morning"), start_time, end_time, capacity, zone_id (nullable = all zones), active

### blackouts

- id, company_id, date, availability_window_id (nullable = whole day), reason

### window_holds

Short-lived reservation during checkout (the double-booking guard).

- id, company_id, availability_window_id, date, session_id, expires_at

---

## 6. Customers & their world

### customers

Scoped per company (no cross-tenant identity).

- id, company_id, first_name, last_name, email, phone, sms_consent (bool + consented_at), customer_type (homeowner | landlord | property_manager | business), notes, created_at
  customer_type matters more than it looks: property management companies book repeatedly across many addresses and often pay by mailed check on emailed invoices — a different relationship your clients already navigate. Modeling it now enables PM-specific flows later (multi-property booking, bill-to separation).

### customer_addresses

One customer, many properties (critical for landlords/PMs).

- id, customer_id, label ("Home", "Unit 4B"), street, unit, city, state, zip, lat, lng (geocode at creation — cheap now, required for proximity routing later), access_notes, is_default

### customer_appliances

The registry of units we've seen — built passively from bookings.

- id, customer_id, customer_address_id, appliance_type_id, brand_id, model_number, serial_number, age_bracket, first_seen_booking_id
- Enables the magic repeat experience: "Booking for your Whirlpool washer again?" — one tap skips four screens. Also the anchor for future service history and warranty tracking.

---

## 7. Bookings & intake

### bookings

- id, company_id, customer_id, customer_address_id, customer_appliance_id (nullable)
- status (held | confirmed | completed | canceled | no_show)
- date, availability_window_id, job_type
- source (hosted_page | embed | manual | api), source_detail (future QR/GBP attribution)
- management_token (tokenized reschedule/cancel link), internal_notes
- created_at, canceled_at, cancel_reason, cancel_actor (customer | company)

### booking_intakes (1:1 with booking)

The diagnostic payload, immutable snapshot at submission time.

- id, booking_id, appliance_type_id, brand_id, error_code, age_bracket, model_number_entered, customer_notes

### booking_symptoms

- booking_id, symptom_id (or company_symptom_id), free_text (for "something else")

### form_submissions

Your "Customer Form Submission" — every session, including abandoned ones.

- id, company_id, session_id, status (in_progress | completed | abandoned | rejected), current_step, payload (JSON of answers so far), started_at, last_activity_at, booking_id (nullable)
- This is the funnel analytics source _and_ the Phase 2 abandoned-booking recovery source. Keeping partial payloads as JSON avoids schema churn while the flow iterates.

### rejection_events

- id, company_id, form_submission_id, gate (zip | brand | appliance_type | job_type | no_availability), reason_value (the zip/brand/etc. that failed), created_at
- Feeds the turned-away demand report.

### media_assets (polymorphic)

- id, company_id, owner_type (booking_intake | customer_appliance | company_branding | model_tag_location), owner_id, kind (model_tag_photo | problem_photo | problem_video | logo | portal_image | illustration), storage_key, content_type, created_at

---

## 8. Payments (schema now, features later)

### payment_settings (one row per company)

- id, company_id, diagnostic_fee_cents, fee_explainer_text, fee_mode (display_only | card_on_file | charge_upfront)
- accepted_methods (JSON: card, cash, check, cash_app, financing — display-only trust element on the portal: "We accept…")
- processor (none | square | stripe), processor_account_ref

### payment_transactions

Empty in Phase 1; ready when fee_mode graduates past display_only.

- id, booking_id, type (hold | charge | refund), amount_cents, processor, processor_txn_id, status, created_at
  **On Square specifically:** a large share of solo/small shops already run their whole money life through Square (invoicing, itemized labor/parts, mailed-check tracking for PM accounts, tax printouts). Do not rebuild any of that — it's exactly the "huge suite" you're avoiding. The right shape is: (a) Phase 1, display accepted methods and the fee; (b) later, a Square integration that creates a draft Square invoice or customer record from a completed booking, keeping Square as their system of record. That's why processor is an enum, not an assumption.

---

## 9. Branding & portal ("Portal Configuration")

### portal_configurations (one row per company)

- id, company_id, logo_asset_id, primary_color, accent_color, display_name_override
- trust_badges (JSON: years_in_business, license_number, insured, review_rating, review_count)
- hero_text, confirmation_message, show_warranty_badge (pulls warranty_days from company)
- attribution_removed (bool — plan-gated)

### portal_copy_overrides

Every customizable string in one place instead of columns that multiply forever.

- id, company_id, copy_key (rejection_zip | rejection_brand | rejection_job_type | no_availability | fee_explainer | ...), text

---

## 10. Notifications

### notification_settings

- id, company_id, channel_prefs (JSON per event: booking_created, canceled, rescheduled, daily_digest → sms/email/both/off), notify_phone, notify_email

### notification_templates

System defaults with per-company overrides, same pattern as copy overrides.

- id, company_id (nullable = system default), event, channel, body_template

### notification_log

- id, company_id, booking_id (nullable), recipient, channel, event, status (queued | sent | delivered | failed), provider_message_id, created_at
- Non-negotiable for support: "did the customer get the reminder?" must be answerable in one query.

---

## 11. Cross-cutting

### audit_log

- id, company_id, user_id (nullable = customer/system action), action, entity_type, entity_id, diff (JSON), created_at
- Matters early because bookings get disputed ("we never got that job") and settings get "mysteriously" changed.

### funnel_events

- id, company_id, session_id, step, event (viewed | completed | abandoned), metadata (JSON), created_at
- Can live in your analytics tool (PostHog) instead of Postgres — keep it out of the operational DB if volume grows.

---

## Relationship map (abbreviated)

```
organizations 1—* companies 1—* users (via memberships; org-scoped memberships too)
companies 1—* company_services *—1 appliance_types
company_services 1—* company_service_duration_overrides (*—1 brands, symptoms — nullable dims)
companies 1—* brand_rules *—1 brands
brands *—* appliance_types (via brand_appliance_types — ranking only, not restriction)
companies 1—* service_areas *—1 zones 1—* zone_schedules
companies 1—* availability_windows 1—* window_holds / blackouts
companies 1—* customers 1—* customer_addresses
customers 1—* customer_appliances *—1 (appliance_types, brands)
companies 1—* bookings *—1 (customers, customer_addresses, availability_windows)
bookings 1—1 booking_intakes 1—* booking_symptoms
companies 1—* form_submissions 1—* rejection_events
companies 1—1 (routing_settings, payment_settings, portal_configurations, notification_settings)
media_assets — polymorphic to intakes, appliances, branding, catalog illustrations
```

## Notes for the build

- **Multi-tenancy discipline:** every query goes through company_id (or org_id for roll-up reporting). Add composite indexes leading with company_id on all hot tables (bookings, customers, form_submissions).
- **Scoped catalog + override pattern** (appliance types, brands, symptoms, templates, copy, tag locations) is the taxonomy-swap engine: entering garage doors or water heaters later means seeding new system catalog rows, not new tables — and company-scoped custom entries let individual shops extend the catalog today without waiting on you. Enforce uniqueness per scope (system names unique globally; custom names unique per company) and always query catalogs as `WHERE company_id IS NULL OR company_id = :current`.
- **Snapshot vs. reference:** booking_intakes stores what the customer actually said at booking time; customer_appliances stores current best knowledge. Don't merge them — intakes are immutable records, appliance records evolve.
- **JSON where the shape is still moving** (form payloads, trust badges, channel prefs), **columns where you'll query it** (status, dates, gate types). Promote JSON fields to columns the first time a report needs them.
