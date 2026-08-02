import type { SVGProps } from "react";

// Outline appliance icons. Color comes from `currentColor`, size from the
// wrapping element (all share a 24x24 viewBox and rounded strokes).
const base: SVGProps<SVGSVGElement> = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
};

export const VerifiedCheck = (props: SVGProps<SVGSVGElement>) => {
    return (
        <svg {...base} {...props}>
            <path d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
        </svg>
    );
};

export const PhoneIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...props}>
        <path d="M6.6 3.5 8.9 3.9 9.9 7 8.3 8.6a12 12 0 0 0 5.1 5.1L15 12.1l3.1 1 .4 2.3a1.6 1.6 0 0 1-1.6 1.9A13.3 13.3 0 0 1 4.7 5.1 1.6 1.6 0 0 1 6.6 3.5Z" />
    </svg>
);

export const CloseIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...props}>
        <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
    </svg>
);

export const ChevronLeftIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...props}>
        <path d="m15 6-6 6 6 6" />
    </svg>
);

export const RefrigeratorIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...props}>
        <rect x="6" y="3" width="12" height="18" rx="2" />
        <line x1="6" y1="9" x2="18" y2="9" />
        <line x1="9" y1="5.5" x2="9" y2="7.3" />
        <line x1="9" y1="11" x2="9" y2="14" />
    </svg>
);

export const WasherIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...props}>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <circle cx="12" cy="13" r="4.3" />
        <circle cx="12" cy="13" r="1.6" />
        <line x1="7.5" y1="6" x2="9" y2="6" />
        <circle cx="15.5" cy="6" r="0.4" />
    </svg>
);

export const DryerIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...props}>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <circle cx="12" cy="13" r="4.3" />
        <path d="M9.8 13.6 C10.8 11.7, 13.2 11.7, 14.2 13.6" />
        <circle cx="15.5" cy="6" r="0.4" />
    </svg>
);

export const DishwasherIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...props}>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <line x1="5" y1="8" x2="19" y2="8" />
        <circle cx="8" cy="5.5" r="0.4" />
        <line x1="11" y1="5.5" x2="16" y2="5.5" />
        <circle cx="12" cy="14" r="3.6" />
    </svg>
);

export const RangeIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...props}>
        <rect x="5" y="4" width="14" height="16" rx="2" />
        <circle cx="9" cy="8" r="1.2" />
        <circle cx="15" cy="8" r="1.2" />
        <rect x="8" y="12" width="8" height="5" rx="1" />
        <line x1="10" y1="14.5" x2="14" y2="14.5" />
    </svg>
);

export const OvenIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...props}>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <line x1="5" y1="8" x2="19" y2="8" />
        <circle cx="8" cy="5.5" r="0.4" />
        <circle cx="10.5" cy="5.5" r="0.4" />
        <rect x="8" y="11" width="8" height="7" rx="1" />
        <line x1="10" y1="11" x2="14" y2="11" />
    </svg>
);

export const MicrowaveIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...props}>
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <rect x="5.5" y="8.5" width="9" height="7" rx="1" />
        <circle cx="17" cy="9.5" r="0.4" />
        <line x1="16" y1="13" x2="18.5" y2="13" />
    </svg>
);

export const IceMakerIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...props}>
        <rect x="8.5" y="4.5" width="6.5" height="6.5" rx="1.6" />
        <rect x="4" y="12.5" width="6.5" height="6.5" rx="1.6" />
        <rect x="12" y="12.5" width="6.5" height="6.5" rx="1.6" />
    </svg>
);

export const GarbageDisposalIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...props}>
        <path d="M7 4 h10 l-1.4 4 h-7.2 z" />
        <path d="M8.6 8 h6.8 v4 a3.4 3.4 0 0 1 -6.8 0 z" />
    </svg>
);

export const WineCoolerIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...props}>
        <rect x="6" y="3" width="12" height="18" rx="2" />
        <line x1="6" y1="8" x2="18" y2="8" />
        <line x1="6" y1="12" x2="18" y2="12" />
        <line x1="6" y1="16" x2="18" y2="16" />
        <line x1="9" y1="18.6" x2="12" y2="18.6" />
    </svg>
);
