import { Button } from "@/components/ui/button";
import { List, Broadcast } from "@phosphor-icons/react";
import { AgentLogo } from "./AgentLogo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/hooks/useAuth";
import { User, SignOut, GearSix, Globe, Book } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useWalletContext } from "@/app/providers/WalletProvider";
import { FundWalletModal } from "@/components/modals/FundWalletModal";

interface MobileNavProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (value: boolean) => void;
}

// Define the type for the user object based on what's available in useAuth
interface UserType {
  id?: number;
  email?: string;
  walletAddress?: string;
  username?: string;
  [key: string]: any; // For any other properties
}

// Define props interface for ProfileDropdown
interface ProfileDropdownProps {
  user: UserType | null;
  logout: (() => void) | undefined;
  router: ReturnType<typeof useRouter>;
}

export const MobileNav = ({ isMobileMenuOpen, setIsMobileMenuOpen }: MobileNavProps) => {
  const { user, logout, login, isAuthenticated } = useAuth();
  const router = useRouter();

  return (
    <>
      {/* Unified Navbar for both mobile and desktop */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-background z-50 flex items-center justify-between px-4 border-b border-border">
        {/* Left section: Hamburger menu (mobile only) */}
        <div className="flex items-center">
          {/* Hamburger menu - only visible on mobile */}
          <div className="md:hidden">
            <Button variant="ghost" size="iconLg" active onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <List size={26} weight="bold" />
            </Button>
          </div>
          
          {/* Desktop-only Logo - hidden on mobile */}
          <div className="hidden md:flex items-center cursor-pointer rounded-md" onClick={() => router.push("/")}>
            <AgentLogo className="rounded-lg" />
            <h1 className="text-base font-semibold ml-2 logo-text">Espio</h1>
          </div>
        </div>
        
        {/* Center section: Logo (mobile only) */}
        <div className="md:hidden absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="flex items-center cursor-pointer" onClick={() => router.push("/")}>
            <AgentLogo className="rounded-lg" />
            <h1 className="text-base font-semibold ml-2 logo-text">Espio</h1>
          </div>
        </div>
        
        {/* Center section: Navigation links (desktop only) */}
        <div className="hidden md:flex items-center space-x-2">
          <Button 
            variant="ghost" 
            className="flex items-center gap-2"
            onClick={() => router.push("/feed")}
          >
            <Broadcast size={18} />
            <span>Feed</span>
          </Button>
        </div>
        
        {/* Right section: User profile dropdown or Login button */}
        {isAuthenticated && user ? (
          <ProfileDropdown user={user} logout={logout} router={router} />
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            className="font-medium"
            onClick={() => login && login()}
          >
            Login
          </Button>
        )}
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-muted/20 dark:bg-background/60 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

// Extracted ProfileDropdown component to avoid duplication
const ProfileDropdown = ({ user, logout, router }: ProfileDropdownProps) => {
  const [showFundModal, setShowFundModal] = useState(false);
  const { wallets } = useWalletContext();
  const walletAddress = user?.walletAddress;

  const handleViewPublicProfile = () => {
    if (user?.username) {
      router.push(`/${user.username}`);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 bg-muted/50 hover:bg-muted">
          <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
            {user?.email ? user.email[0].toUpperCase() : "U"}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* Profile section */}
        <div className="py-1">
          <DropdownMenuItem onClick={handleViewPublicProfile}>
            <Globe className="mr-2 h-4 w-4" />
            <span>View public profile</span>
            {!user?.username && (
              <span className="ml-2 text-xs text-muted-foreground">(Set username first)</span>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/profile")}>
            <GearSix className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </div>
        
        {/* Separator */}
        <div className="h-px bg-border my-1"></div>
        
        {/* Links section */}
        <div className="py-1">
          <DropdownMenuItem asChild>
            <Link href="https://bridge.sonic.game/" target="_blank" rel="noopener noreferrer" className="flex items-center">
              <span className="mr-2 h-4 w-4 flex items-center justify-center">🌉</span>
              <span>Bridge</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowFundModal(true)}>
            <Book className="mr-2 h-4 w-4" />
            <span>How to Bridge</span>
          </DropdownMenuItem>
        </div>
        
        {/* Separator */}
        <div className="h-px bg-border my-1"></div>
        
        {/* Sign out option */}
        <div className="py-1">
          <DropdownMenuItem onClick={logout}>
            <SignOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>

      {/* Fund Wallet Modal */}
      <FundWalletModal
        isOpen={showFundModal}
        onClose={() => setShowFundModal(false)}
        sonicAddress={walletAddress || ''}
      />
    </DropdownMenu>
  );
};
