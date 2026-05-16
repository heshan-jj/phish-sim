import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New campaign",
};

export default function NewCampaignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
