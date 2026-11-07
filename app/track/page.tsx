import { connection } from "next/server";
import { getStoreSettings } from "@/lib/settings";
import { TrackOrderForm } from "@/components/store/track-order-form";

export const instant = false;

export const metadata = {
  title: "Track order",
};

export default async function TrackPage() {
  await connection();
  const settings = await getStoreSettings();
  return (
    <main>
      <TrackOrderForm currency={settings.currency} />
    </main>
  );
}
