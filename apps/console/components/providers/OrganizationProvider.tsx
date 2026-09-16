"use client";

import { CompanyId, OrganizationWithCompanies } from "@/types/organization";
import {
    Dispatch,
    PropsWithChildren,
    SetStateAction,
    createContext,
    useState,
} from "react";

export const OrganizationContext = createContext<{
    org: OrganizationWithCompanies | undefined;
    companyQuery: CompanyId[];
    currentName: string;
    currentPhone: string | null;
    /**
     * IANA zone the visible page reads times in. Mirrors the rule the booking
     * API groups days by — the selected company's zone, the org's when the
     * filter spans several — so the caption can't disagree with the rows.
     */
    currentTimezone: string;
    organizations: OrganizationWithCompanies[];
    companyFilter: CompanyId;
    setCompanyFilter: Dispatch<SetStateAction<CompanyId>>;
}>({
    org: undefined,
    companyQuery: [],
    currentName: "",
    currentPhone: "",
    currentTimezone: "UTC",
    organizations: [],
    companyFilter: "",
    setCompanyFilter: () => {
        return;
    },
});

const OrganizationProvider = (
    props: PropsWithChildren & { orgs: OrganizationWithCompanies[] },
) => {
    const [companyFilter, setCompanyFilter] = useState<string>("all");
    const currentOrg = props.orgs[0];
    if (!currentOrg) throw new Error("Failed to load current organization");

    const currentCompany = currentOrg.companies.find(
        (c) => c.id == companyFilter,
    );

    const currentName = currentCompany ? currentCompany.name : currentOrg.name;
    const currentPhone = currentCompany
        ? currentCompany.phone
        : currentOrg.phone;
    const currentTimezone = currentCompany
        ? currentCompany.timezone
        : currentOrg.timezone;

    let companyQuery = [];
    if (companyFilter === "all")
        companyQuery = currentOrg.companies.flatMap((c) => c.id);
    else companyQuery = [companyFilter];

    return (
        <OrganizationContext.Provider
            value={{
                org: currentOrg as OrganizationWithCompanies,
                companyQuery,
                currentName,
                currentPhone,
                currentTimezone,
                organizations: props.orgs,
                companyFilter: companyFilter,
                setCompanyFilter: setCompanyFilter,
            }}
        >
            {props.children}
        </OrganizationContext.Provider>
    );
};

export default OrganizationProvider;
