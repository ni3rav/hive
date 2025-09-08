import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogOut, KeyRound, BarChart, History, ChevronRight } from "lucide-react";
import { NavLink } from "react-router-dom";

// Define the shape of the user data
type UserProfile = {
  name: string; 
  email: string;
  avatar?: string;
};

// Reusable row component for the links
function ProfileActionRow({ to, icon: Icon, label }: { to: string, icon: React.ElementType, label: string }) {
  return (
    <NavLink
      to={to}
      className="flex items-center justify-between rounded-md border bg-background p-3 text-sm font-medium hover:bg-accent"
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <span>{label}</span>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </NavLink>
  );
}

export function ProfileCard({ user }: { user: UserProfile }) {
  const handleLogout = () => {
    alert("Logout functionality needs to be implemented!");
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-20 w-20 items-center justify-center">
          <Avatar className="h-full w-full">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-primary text-2xl font-semibold text-primary-foreground">
                 {user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <CardTitle className="text-xl">{user.name}</CardTitle>
        <CardDescription>{user.email}</CardDescription>
      </CardHeader>
      
      <CardContent className="grid gap-4">
        <ProfileActionRow to="/dashboard/profile/api-keys" icon={KeyRound} label="Manage API Keys" />
        <ProfileActionRow to="/dashboard/profile/usage" icon={BarChart} label="Usage Statistics" />
        <ProfileActionRow to="/dashboard/profile/sessions" icon={History} label="Active Sessions" />
        <Button variant="destructive" className="w-full" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </Button>
      </CardContent>
    </Card>
  );
}