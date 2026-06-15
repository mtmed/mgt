import Link from "next/link";
import { NewCaseForm } from "@/components/NewCaseForm";

export const metadata = {
  title: "Fall einbringen · bada bup",
};

export default function NewCasePage() {
  return (
    <div>
      <Link href="/" className="text-sm text-teal-700 hover:underline">
        ← Zurück zur Liste
      </Link>
      <h1 className="mt-2 mb-4 text-xl font-semibold">Neuen Fall einbringen</h1>
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <NewCaseForm />
      </div>
    </div>
  );
}
