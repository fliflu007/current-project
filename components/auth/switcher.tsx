"use client";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "../ui/select";

export default function Switcher() {
  async function handleRoleChange(role: string | null) {
    if (!role) {
      return;
    }
    const res = await fetch("/api/dev/switch-role", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role,
      }),
    });

    const body = await res.json();

    if (body.error) {
      console.log(body.error.message);
      return;
    }

    console.log("Role changed:", body.data);
  }

  const items = [
    { label: "admin", value: "admin" },
    { label: "staff", value: "staff" },
    { label: "viewer", value: "viewer" },
  ];
  return (
    <div>
      <Select items={items} onValueChange={handleRoleChange}>
        <SelectTrigger className="w-45">
          <SelectValue placeholder="Role" />
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
    </div>
  );
}
