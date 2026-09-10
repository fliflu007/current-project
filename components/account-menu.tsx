"use client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AccountMenuProps = {
  items: {
    value: string;
    label: string;
  }[];
  isLoggedIn: boolean;

  className?: string;
};

export default function AccountMenu({
  items,
  className,
  isLoggedIn,
}: AccountMenuProps) {
  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="outline">Admin</Button>}
        />
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuItem>
              {" "}
              <Select items={items}>
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
            </DropdownMenuItem>

            {isLoggedIn ? (
              <DropdownMenuItem>Logout</DropdownMenuItem>
            ) : (
              <DropdownMenuItem>Login</DropdownMenuItem>
            )}
            <DropdownMenuItem>Signup</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
