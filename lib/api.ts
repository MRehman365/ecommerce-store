import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/errors";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, { status: 200, ...init });
}

export function jsonCreated<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

export function jsonError(message: string, status = 400, extra?: object) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export function handleRouteError(error: unknown) {
  console.error(error);
  if (error instanceof ZodError) {
    return jsonError("Validation failed", 400, {
      issues: error.flatten(),
    });
  }
  if (error instanceof AppError) {
    return jsonError(error.message, error.status);
  }
  if (error instanceof Error) {
    const known =
      /promo|stock|unavailable|invalid|minimum|expired|usage|email|payment|configured/i.test(
        error.message
      );
    return jsonError(error.message, known ? 400 : 500);
  }
  return jsonError("Unexpected error", 500);
}
