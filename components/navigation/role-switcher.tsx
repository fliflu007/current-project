"use client";

import { useRouter } from "next/navigation";
import { switchRole, type Role } from "@/lib/actions/switch-role";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const items: { value: Role; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "staff", label: "Staff" },
  { value: "viewer", label: "Viewer" },
];

export default function RoleSwitcher({ role }: { role: Role }) {
  const router = useRouter();

  async function handleRoleChange(newRole: Role | null) {
    if (!newRole) return;

    const result = await switchRole(newRole);

    if (result.error) {
      console.error("Role switch failed:", result.error);
      return;
    }

    router.refresh();
  }

  return (
    <Select value={role} onValueChange={handleRoleChange}>
      <SelectTrigger className="w-45">
        <SelectValue />
      </SelectTrigger>

      <SelectContent>
        <SelectGroup>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
