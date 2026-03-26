import { PageHeader } from "@/components/layout/page-header";
import { SettingsContent } from "@/components/settings/settings-content";

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage verticals and sub-sections across all properties"
      />
      <SettingsContent />
    </>
  );
}
