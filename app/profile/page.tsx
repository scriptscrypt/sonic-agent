'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { WalletDisplay } from '@/components/wallet/WalletDisplay';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const { authenticated, ready, user: privyUser, logout, linkEmail, linkWallet, unlinkEmail, unlinkWallet } = usePrivy();
  const router = useRouter();
  
  const [username, setUsername] = useState('');
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [debouncedUsername, setDebouncedUsername] = useState('');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (ready && !authenticated && !loading) {
      router.push('/login');
    }
  }, [ready, authenticated, loading, router]);

  // Set initial username from user data
  useEffect(() => {
    if (user?.username) {
      setUsername(user.username);
      setDebouncedUsername(user.username);
    }
  }, [user]);

  // Debounce username input for availability check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (username !== debouncedUsername) {
        setDebouncedUsername(username);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username, debouncedUsername]);

  // Check username availability
  useEffect(() => {
    const checkAvailability = async () => {
      if (!debouncedUsername || (user?.username === debouncedUsername)) {
        setIsAvailable(null);
        return;
      }

      setIsChecking(true);
      try {
        const response = await fetch(`/api/auth/username?username=${encodeURIComponent(debouncedUsername)}`);
        const data = await response.json();
        setIsAvailable(data.available);
      } catch (error) {
        console.error('Error checking username availability:', error);
        setIsAvailable(null);
      } finally {
        setIsChecking(false);
      }
    };

    if (debouncedUsername) {
      checkAvailability();
    }
  }, [debouncedUsername, user]);

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleSaveUsername = async () => {
    if (!username || !isAvailable) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/auth/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          privyId: user?.privyId,
          username,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update username');
      }

      setNotification({
        type: 'success',
        message: 'Username updated successfully',
      });
    } catch (error) {
      console.error('Error updating username:', error);
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to update username',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-10 mt-4">
      <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>
      
      {notification && (
        <div className={`mb-4 p-4 rounded-md flex items-center ${
          notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="h-5 w-5 mr-2" />
          ) : (
            <XCircle className="h-5 w-5 mr-2" />
          )}
          {notification.message}
        </div>
      )}
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your profile information and username.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="username"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <Button 
                    onClick={handleSaveUsername} 
                    disabled={!isAvailable || isChecking || isSaving || !username}
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Save
                  </Button>
                </div>
                {isChecking && <p className="text-sm text-muted-foreground">Checking availability...</p>}
                {!isChecking && isAvailable === false && <p className="text-sm text-destructive">Username is already taken</p>}
                {!isChecking && isAvailable === true && <p className="text-sm text-green-500">Username is available</p>}
                <p className="text-sm text-muted-foreground">
                  Your profile URL: {username ? `${window.location.origin}/${username}` : 'Set a username to get a custom URL'}
                </p>
                <p className="text-sm text-muted-foreground">
                  A random username was generated for you when you signed up. You can change it here.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Wallet Address</Label>
                <p className="text-sm font-mono bg-muted p-2 rounded">
                  {user?.walletAddress || 'No wallet connected'}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Email</Label>
                <p className="text-sm">
                  {user?.email || 'No email connected'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="wallet">
          <Card>
            <CardHeader>
              <CardTitle>Wallet Management</CardTitle>
              <CardDescription>
                Connect or manage your Solana wallets.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <WalletDisplay />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Management</CardTitle>
              <CardDescription>
                Connect or disconnect email from your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {privyUser?.email?.address ? (
                <div className="space-y-2">
                  <Label>Connected Email</Label>
                  <p className="text-sm">
                    {privyUser.email.address}
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => unlinkEmail(privyUser.email!.address)}
                  >
                    Disconnect Email
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm">No email connected</p>
                  <Button onClick={() => linkEmail()}>
                    Connect Email
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8">
        <Button variant="destructive" onClick={() => logout()}>
          Sign Out
        </Button>
      </div>
    </div>
  );
} 