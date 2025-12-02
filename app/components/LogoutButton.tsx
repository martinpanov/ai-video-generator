import { Button } from "@/components/ui/button";
import { logout } from "../actions/auth";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <form action={logout} className="w-full">
      <Button type="submit" variant="ghost" className="w-full justify-start">
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button>
    </form>
  );
}
