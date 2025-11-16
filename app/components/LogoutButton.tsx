import { Button } from "@/components/ui/button";
import { logout } from "../actions/auth";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <form action={logout}>
      <Button type="submit" variant="outline" size="sm">
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button>
    </form>
  );
}
