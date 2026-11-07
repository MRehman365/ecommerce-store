import { connection } from "next/server";
import { getStoreSettings, serializeSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/settings-form";

export const instant = false;

export default async function AdminSettingsPage() {
  await connection();
  const settings = serializeSettings(await getStoreSettings());

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold tracking-tight">Store settings</h1>
      <SettingsForm initial={settings} />
    </div>
  );
}
