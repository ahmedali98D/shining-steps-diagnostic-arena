import { clearSessionCookie } from "@/lib/session";
import { ok, handleError } from "@/lib/api";

export async function POST() {
  try {
    await clearSessionCookie();
    return ok({ signedOut: true });
  } catch (err) {
    return handleError(err);
  }
}
