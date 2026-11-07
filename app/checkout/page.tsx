import { connection } from "next/server";
import { getStoreSettings } from "@/lib/settings";
import { CheckoutForm } from "@/components/store/checkout-form";

export const instant = false;

export const metadata = {
  title: "Checkout",
};

export default async function CheckoutPage() {
  await connection();
  const settings = await getStoreSettings();

  return (
    <main className="min-h-full py-4">
      <CheckoutForm
        currency={settings.currency}
        paymentMethods={settings.paymentMethods}
      />
    </main>
  );
}
