import type { LandingPageType } from "@/lib/campaign-templates";
import type { SimulationVariantProps } from "@/components/simulations/types";
import { BenefitsVariant } from "@/components/simulations/variants/benefits";
import { DocusignVariant } from "@/components/simulations/variants/docusign";
import { DropboxVariant } from "@/components/simulations/variants/dropbox";
import { GenericSsoVariant } from "@/components/simulations/variants/generic-sso";
import { GoogleWorkspaceVariant } from "@/components/simulations/variants/google-workspace";
import { HelpdeskVariant } from "@/components/simulations/variants/helpdesk";
import { LinkedinVariant } from "@/components/simulations/variants/linkedin";
import { MfaVariant } from "@/components/simulations/variants/mfa";
import { Microsoft365Variant } from "@/components/simulations/variants/microsoft365";
import { ShippingVariant } from "@/components/simulations/variants/shipping";
import { SlackVariant } from "@/components/simulations/variants/slack";
import { SoftwareLicenseVariant } from "@/components/simulations/variants/software-license";
import { TeamsVariant } from "@/components/simulations/variants/teams";
import { VpnVariant } from "@/components/simulations/variants/vpn";
import { WorkdayVariant } from "@/components/simulations/variants/workday";
import type { ComponentType } from "react";

export const SIMULATION_VARIANTS: Record<
  LandingPageType,
  ComponentType<SimulationVariantProps>
> = {
  google_workspace: GoogleWorkspaceVariant,
  microsoft365: Microsoft365Variant,
  generic_sso: GenericSsoVariant,
  workday: WorkdayVariant,
  docusign: DocusignVariant,
  helpdesk: HelpdeskVariant,
  vpn: VpnVariant,
  teams: TeamsVariant,
  slack: SlackVariant,
  dropbox: DropboxVariant,
  mfa: MfaVariant,
  benefits: BenefitsVariant,
  shipping: ShippingVariant,
  linkedin: LinkedinVariant,
  software_license: SoftwareLicenseVariant,
};
