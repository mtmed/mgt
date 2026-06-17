"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { switchUser } from "@/lib/actions";
import { Avatar } from "@/components/Avatar";

const ADMIN_VALUE = "__admin__";

// Nur bis zum echten Login: aktive:n Seed-Nutzer:in umschalten.
// Zusätzlich „Admin …" → führt zur passwortgeschützten Admin-Seite.
export function UserSwitcher({
  users,
  currentId,
}: {
  users: { id: string; name: string }[];
  currentId: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const current = users.find((u) => u.id === currentId) ?? users[0];

  return (
    <label className="flex items-center gap-2" title="Angemeldet als (Testmodus)">
      <Avatar id={current.id} name={current.name} size={26} />
      <select
        value={currentId}
        disabled={pending}
        onChange={(e) => {
          const value = e.target.value;
          if (value === ADMIN_VALUE) {
            router.push("/admin");
            return;
          }
          startTransition(() => switchUser(value));
        }}
        className="max-w-[9rem] truncate rounded-md border border-border-soft bg-white px-2 py-1 text-xs"
      >
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
        <option disabled>──────────</option>
        <option value={ADMIN_VALUE}>Admin …</option>
      </select>
    </label>
  );
}
