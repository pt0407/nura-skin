// Minimal stroke icon set — inherits currentColor.
type P = { size?: number };
const base = (size = 24) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const SunIcon = ({ size }: P) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

export const ScanIcon = ({ size }: P) => (
  <svg {...base(size)}>
    <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
    <circle cx="12" cy="12" r="3" />
    <path d="M7 12h.01M17 12h.01" />
  </svg>
);

export const DropIcon = ({ size }: P) => (
  <svg {...base(size)}>
    <path d="M12 3s6 5.5 6 10a6 6 0 0 1-12 0c0-4.5 6-10 6-10Z" />
    <path d="M9.5 14a2.5 2.5 0 0 0 2.5 2.5" />
  </svg>
);

export const LeafIcon = ({ size }: P) => (
  <svg {...base(size)}>
    <path d="M11 20A7 7 0 0 1 4 13c0-6 7-9 16-9 0 9-3 16-9 16Z" />
    <path d="M4 20c2-5 6-8 12-9" />
  </svg>
);

export const LockIcon = ({ size }: P) => (
  <svg {...base(size)}>
    <rect x="4" y="11" width="16" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    <circle cx="12" cy="15.5" r="1" />
  </svg>
);

export const CpuIcon = ({ size }: P) => (
  <svg {...base(size)}>
    <rect x="6" y="6" width="12" height="12" rx="2" />
    <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" />
    <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
  </svg>
);

export const NoCloudIcon = ({ size }: P) => (
  <svg {...base(size)}>
    <path d="M17.5 19H7a4 4 0 0 1-.7-7.9 5 5 0 0 1 9.2-1.6" />
    <path d="M3 3l18 18" />
  </svg>
);

export const SparkIcon = ({ size }: P) => (
  <svg {...base(size)}>
    <path d="M12 3l1.6 4.8L18 9.4l-4.4 1.6L12 16l-1.6-5L6 9.4l4.4-1.6L12 3Z" />
    <path d="M19 14l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" />
  </svg>
);

export const ArrowIcon = ({ size }: P) => (
  <svg {...base(size)} className="btn-arrow">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const CheckIcon = ({ size }: P) => (
  <svg {...base(size)}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const RefreshIcon = ({ size }: P) => (
  <svg {...base(size)}>
    <path d="M21 12a9 9 0 1 1-2.6-6.4M21 4v4h-4" />
  </svg>
);

export const CameraIcon = ({ size }: P) => (
  <svg {...base(size)}>
    <path d="M4 8a2 2 0 0 1 2-2h1.5l1-1.5h5l1 1.5H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z" />
    <circle cx="12" cy="12.5" r="3.2" />
  </svg>
);
