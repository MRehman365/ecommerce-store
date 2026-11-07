import { NextRequest } from "next/server";
import { quoteSchema } from "@/lib/validations";
import { quoteOrder } from "@/lib/commerce";
import { handleRouteError, jsonOk } from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    const body = quoteSchema.parse(await request.json());
    const quote = await quoteOrder(body);
    return jsonOk(quote);
  } catch (error) {
    return handleRouteError(error);
  }
}
