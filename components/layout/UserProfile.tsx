'use client';

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/useAuth";
import { UserProfile as UserProfileComponent } from "@/components/profile/UserProfile";
import { cn } from "@/lib/utils";

interface UserProfileProps {
  isExpanded?: boolean;
}

export function UserProfile({ isExpanded = true }: UserProfileProps) {
  const { user, loading, login, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="animate-pulse flex items-center gap-3 p-2">
        <div className="w-8 h-8 rounded-full bg-muted"></div>
        {isExpanded && (
          <div className="flex-1">
            <div className="h-4 bg-muted rounded w-24"></div>
            <div className="h-3 bg-muted rounded w-16 mt-1"></div>
          </div>
        )}
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={() => login()}
      >
        <span className="truncate">Sign In</span>
      </Button>
    );
  }

  // Expanded view with user details
  if (isExpanded) {
    return <UserProfileComponent />;
  }

  // Collapsed view with just avatar
  return (
    <div className={cn("flex items-center gap-3 p-2")}>
      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
        {user.email ? user.email[0].toUpperCase() : 'U'}
      </div>
    </div>
  );
}
