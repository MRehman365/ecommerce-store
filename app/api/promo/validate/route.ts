import { NextRequest } from "next/server";
import { promoValidateSchema } from "@/lib/validations";
import { quoteOrder, validatePromoCode } from "@/lib/commerce";
import { handleRouteError, jsonOk } from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    const body = promoValidateSchema.parse(await request.json());

    if (body.lines?.length) {
      const quote = await quoteOrder({
        lines: body.lines,
        promoCode: body.code,
        city: body.city || "Default",
        customerKey: body.customerKey,
      });
      return jsonOk({
        code: quote.promoCode,
        discountAmount: quote.discountAmount,
        subtotal: quote.subtotal,
        shippingCharges: quote.shippingCharges,
        total: quote.total,
      });
    }

    const result = await validatePromoCode(
      body.code,
      body.subtotal ?? 0,
      body.customerKey
    );
    return jsonOk(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
