"use client";

import { useTransition } from "react";
import { switchUser } from "@/lib/actions";
import { Avatar } from "@/components/Avatar";

// Nur bis zum echten Login: aktive:n Seed-Nutzer:in umschalten,
// damit „namentlich" und „nur Fragende lösen" testbar sind.
export function UserSwitcher({
  users,
  currentId,
}: {
  users: { id: string; name: string }[];
  currentId: string;
}) {
  const [pending, startTransition] = useTransition();
  const current = users.find((u) => u.id === currentId) ?? users[0];

  return (
    <label className="flex items-center gap-2" title="Angemeldet als (Testmodus)">
      <Avatar id={current.id} name={current.name} size={26} />
      <select
        value={currentId}
        disabled={pending}
        onChange={(e) => {
          const id = e.target.value;
          startTransition(() => switchUser(id));
        }}
        className="max-w-[9rem] truncate rounded-md border border-border-soft bg-white px-2 py-1 text-xs"
      >
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>
    </label>
  );
}
