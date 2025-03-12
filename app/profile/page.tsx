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
import { Loader2, CheckCircle, XCircle, X, Trash } from 'lucide-react';
import { WalletDisplay } from '@/components/wallet/WalletDisplay';
import Image from 'next/image';
import { toast } from 'sonner';

// Hook to get recent images from localStorage
const useRecentImages = () => {
  const [recentImages, setRecentImages] = useState<
    Array<{ url: string; timestamp: number }>
  >([]);

  // Load recent images from localStorage on component mount
  useEffect(() => {
    const storedImages = localStorage.getItem("recentImages");
    if (storedImages) {
      try {
        setRecentImages(JSON.parse(storedImages));
      } catch (e) {
        console.error("Error parsing stored images:", e);
      }
    }
  }, []);

  // Remove an image from the recent images list
  const removeRecentImage = (url: string) => {
    const updatedImages = recentImages.filter((img) => img.url !== url);
    setRecentImages(updatedImages);
    localStorage.setItem("recentImages", JSON.stringify(updatedImages));
  };

  return { recentImages, removeRecentImage };
};

// Format timestamp to readable date
const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const { authenticated, ready, user: privyUser, logout, linkEmail, linkWallet, unlinkEmail, unlinkWallet } = usePrivy();
  const router = useRouter();
  const { recentImages, removeRecentImage } = useRecentImages();
  
  const [username, setUsername] = useState('');
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [debouncedUsername, setDebouncedUsername] = useState('');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [deletingImageIds, setDeletingImageIds] = useState<string[]>([]);

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

  // Handle image deletion
  const handleDeleteImage = async (url: string) => {
    // Add the URL to the deleting list
    setDeletingImageIds((prev) => [...prev, url]);

    try {
      // Delete from Supabase storage
      const response = await fetch("/api/upload/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete image");
      }

      // Remove from recent images list
      removeRecentImage(url);
      toast.success("Image deleted successfully");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    } finally {
      // Remove the URL from the deleting list
      setDeletingImageIds((prev) => prev.filter((id) => id !== url));
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
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
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
          <TabsTrigger value="images">Images</TabsTrigger>
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
              </div>
              
              <div className="space-y-2">
                <Label>Wallet Address</Label>
                <div className="flex items-center gap-2">
                  <p className="text-sm truncatemd:truncate-none font-mono bg-muted p-2 rounded">
                    {user?.walletAddress || 'No wallet connected'}
                  </p>
                <Button variant="outline" onClick={() => {
                  navigator.clipboard.writeText(user?.walletAddress || '');
                  toast.success('Wallet address copied to clipboard');
                }}>
                    Copy
                  </Button>
                </div>
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

        <TabsContent value="images">
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Images</CardTitle>
              <CardDescription>
                View and manage your uploaded images.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentImages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No images uploaded yet
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {recentImages.map((img, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-md overflow-hidden border border-border group"
                    >
                      <Image
                        width={200}
                        height={200}
                        src={img.url}
                        alt={`Uploaded image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                        <span className="text-xs text-white/80">
                          {formatTimestamp(img.timestamp)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(img.url)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete image"
                        disabled={deletingImageIds.includes(img.url)}
                      >
                        {deletingImageIds.includes(img.url) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  ))}
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