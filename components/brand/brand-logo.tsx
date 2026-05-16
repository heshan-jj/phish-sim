import Image from "next/image";
import { cn } from "@/lib/utils";

const VARIANTS = {
  full: {
    src: "/images/logo.svg",
    width: 200,
    height: 64,
    defaultClassName: "h-16 w-auto",
  },
  lockup: {
    src: "/images/logo-lockup.svg",
    width: 1500,
    height: 620,
    defaultClassName: "h-11 w-auto",
  },
  icon: {
    src: "/images/logo-icon.svg",
    width: 48,
    height: 32,
    defaultClassName: "h-8 w-auto",
  },
} as const;

export type BrandLogoVariant = keyof typeof VARIANTS;

type BrandLogoProps = {
  variant: BrandLogoVariant;
  className?: string;
  priority?: boolean;
};

export function BrandLogo({ variant, className, priority }: BrandLogoProps) {
  const config = VARIANTS[variant];
  return (
    <Image
      src={config.src}
      alt="PhishSim"
      width={config.width}
      height={config.height}
      priority={priority}
      unoptimized
      className={cn("object-contain shrink-0", config.defaultClassName, className)}
    />
  );
}
