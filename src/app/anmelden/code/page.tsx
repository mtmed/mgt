import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { LOGIN_EMAIL_COOKIE } from "@/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Code eingeben · bada bup" };

export default async function CodePage() {
  const email = (await cookies()).get(LOGIN_EMAIL_COOKIE)?.value;
  if (!email) redirect("/anmelden");

  return (
    <div className="anim-in mx-auto max-w-sm">
      <h1 className="text-xl font-semibold">Code eingeben</h1>
      <p className="mt-2 text-sm text-muted">
        Wir haben einen 6-stelligen Code an <span className="font-medium">{email}</span>{" "}
        geschickt. Gib ihn hier ein, um dich anzumelden.
      </p>

      {/* GET direkt an den Auth.js-Callback → Anmeldung passiert in DIESEM
          Kontext (auch in der installierten App). */}
      <form
        method="get"
        action="/api/auth/callback/resend"
        className="mt-4 space-y-3"
      >
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="callbackUrl" value="/" />
        <input
          name="token"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={6}
          required
          placeholder="6-stelliger Code"
          className="w-full rounded-md border border-border-soft bg-white px-3 py-2 text-center text-lg tracking-widest focus:border-kobalt focus:outline-none focus:ring-1 focus:ring-kobalt"
        />
        <button
          type="submit"
          className="w-full rounded-md bg-kobalt px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Anmelden
        </button>
      </form>

      <p className="mt-4 text-sm">
        Keinen Code erhalten?{" "}
        <Link href="/anmelden" className="font-medium text-kobalt hover:underline">
          Erneut senden →
        </Link>
      </p>
    </div>
  );
}
