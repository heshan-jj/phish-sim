"use client";

import type { SimulationVariantProps } from "@/components/simulations/types";
import {
  SimulationInput,
  SubmitButton,
} from "@/components/simulations/shared/form-fields";
import { useCredentialForm } from "@/components/simulations/shared/use-credential-form";
import { useDocumentTitle } from "@/components/simulations/shared/use-document-title";
import { VpnLogo } from "@/components/simulations/logos";
import { VARIANT_META } from "@/components/simulations/variant-meta";

export function VpnVariant({ onSubmit, submitting }: SimulationVariantProps) {
  const meta = VARIANT_META.vpn;
  useDocumentTitle(meta.documentTitle);
  const { email, setEmail, password, setPassword, handleFormSubmit } =
    useCredentialForm(onSubmit);

  return (
    <div className="min-h-dvh bg-[#0f172a]">
      <div className="flex items-center gap-3 border-b border-[#334155] bg-[#1e293b] px-6 py-4">
        <VpnLogo />
        <div>
          <p className="text-sm font-semibold text-white">Cisco Secure Client</p>
          <p className="text-xs text-[#94a3b8]">GlobalProtect</p>
        </div>
      </div>
      <div className="mx-auto max-w-md px-4 py-10">
        <div className="rounded-lg border border-[#dc2626]/40 bg-[#450a0a]/80 p-4 text-sm text-[#fecaca]">
          Your VPN certificate expires in 24 hours. Renew access to avoid losing remote
          connectivity.
        </div>
        <div className="mt-6 rounded-lg bg-white p-8 shadow-xl">
          <h1 className="text-xl font-semibold text-[#111827]">Remote Access</h1>
          <p className="mt-1 text-sm text-[#64748b]">Sign in to renew your certificate</p>
          <form onSubmit={handleFormSubmit} className="mt-6 space-y-4">
            <SimulationInput
              id="vpn-email"
              label="Username"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="Username"
              autoComplete="username"
              required
            />
            <SimulationInput
              id="vpn-password"
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Password"
              autoComplete="current-password"
              required
            />
            <SubmitButton disabled={submitting} className={meta.buttonClass}>
              {submitting ? "..." : "Renew Access"}
            </SubmitButton>
          </form>
        </div>
      </div>
    </div>
  );
}
