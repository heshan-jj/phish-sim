export function GoogleLogo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.083 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.64 6.053 29.082 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.64 6.053 29.082 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.083 0-9.654-3.343-11.303-8H6.306C9.656 39.663 16.318 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

export function MicrosoftLogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="1" y="1" width="10" height="10" fill="#f25022" />
      <rect x="13" y="1" width="10" height="10" fill="#7fba00" />
      <rect x="1" y="13" width="10" height="10" fill="#00a4ef" />
      <rect x="13" y="13" width="10" height="10" fill="#ffb900" />
    </svg>
  );
}

export function TeamsLogo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <rect width="48" height="48" rx="8" fill="#6264A7" />
      <path
        fill="#fff"
        d="M18 14h12v8H18V14zm0 12h12v8H18v-8z"
        opacity="0.9"
      />
      <circle cx="34" cy="16" r="6" fill="#fff" opacity="0.85" />
    </svg>
  );
}

export function SlackLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 44" className={className} aria-hidden>
      <rect x="18" y="2" width="8" height="18" rx="4" fill="#36C5F0" />
      <rect x="24" y="18" width="18" height="8" rx="4" fill="#2EB67D" />
      <rect x="18" y="24" width="8" height="18" rx="4" fill="#ECB22E" />
      <rect x="2" y="18" width="18" height="8" rx="4" fill="#E01E5A" />
    </svg>
  );
}

export function DropboxLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path fill="#0061FF" d="M12 8 24 16 36 8 24 0 12 8zm24 8L24 24 12 16l12 8 12-8zM12 32l12 8 12-8-12-8-12 8zm24-8-12 8 12 8 12-8-12-8z" />
    </svg>
  );
}

export function LinkedInLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <rect width="48" height="48" rx="4" fill="#0A66C2" />
      <path
        fill="#fff"
        d="M14 20h6v18h-6V20zm3-9a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zm8 9h6v2.5c.9-1.6 3.1-3.3 6.4-3.3 4.8 0 8 3.1 8 9.6V38h-6V27.5c0-2.8-1-4.7-3.4-4.7-1.9 0-3 1.3-3.5 2.5-.2.5-.2 1.2-.2 1.9V38h-6V20z"
      />
    </svg>
  );
}

export function DocusignLogo({ className = "h-7 w-[140px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 28" className={className} aria-hidden>
      <text x="0" y="22" fill="#4A00E0" fontSize="22" fontFamily="Arial, sans-serif" fontWeight="600">
        DocuSign
      </text>
    </svg>
  );
}

export function WorkdayLogo({ className = "h-7 w-[120px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 30" className={className} aria-hidden>
      <path d="M14 20a16 16 0 0 1 32 0" fill="none" stroke="#F36F21" strokeWidth="4" />
      <text x="54" y="21" fill="#1F3B63" fontSize="14" fontFamily="Arial, sans-serif" fontWeight="600">
        workday
      </text>
    </svg>
  );
}

export function SsoShieldLogo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path
        fill="#2563EB"
        d="M24 4 8 12v10c0 10 6.5 18.4 16 22 9.5-3.6 16-12 16-22V12L24 4z"
      />
      <path fill="#fff" d="M20 24l-3-3 2-2 5 5 9-9 2 2-11 11z" />
    </svg>
  );
}

export function VpnLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <rect width="48" height="48" rx="6" fill="#1e293b" />
      <path
        fill="#94a3b8"
        d="M12 28h24v4H12v-4zm4-8 8-10 8 10h-4v6h-8v-6h-4z"
      />
    </svg>
  );
}

export function HelpdeskLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <rect width="48" height="48" rx="8" fill="#81B5A1" />
      <text x="8" y="32" fill="#fff" fontSize="20" fontFamily="Arial" fontWeight="700">
        SN
      </text>
    </svg>
  );
}

export function MfaLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <rect width="48" height="48" rx="8" fill="#0078D4" />
      <path
        fill="#fff"
        d="M24 10a8 8 0 0 0-8 8v4h4v-4a4 4 0 1 1 8 0v4h4v-4a8 8 0 0 0-8-8zm-10 14v14h20V24H14z"
      />
    </svg>
  );
}

export function BenefitsLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <rect width="48" height="48" rx="8" fill="#0F766E" />
      <path fill="#fff" d="M14 32V18h6v14h-6zm8-8v8h6V16h-6v8zm8-4v12h6V12h-6z" />
    </svg>
  );
}

export function ShippingLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <rect width="48" height="48" rx="6" fill="#7C3AED" />
      <path fill="#fff" d="M10 28h22l4-8H14l-4 8zm26 2a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM16 30a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
    </svg>
  );
}

export function SoftwareLicenseLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <rect width="48" height="48" rx="8" fill="#111827" />
      <text x="10" y="32" fill="#fff" fontSize="18" fontFamily="Arial" fontWeight="700">
        Cc
      </text>
    </svg>
  );
}
