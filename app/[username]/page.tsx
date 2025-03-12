"use client";

import { useEffect, useState } from "react";
import { useUsernameNFTs } from "@/lib/hooks/useNFTs";
import { useUsernameTokens } from "@/lib/hooks/useTokens";
import { NFTGrid } from "@/components/ui/NFTGrid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "@/db/schema";
import { Copy, Wallet } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function UserProfilePage({ params }: any) {
  const { username } = params;
  const { data: nfts, isLoading: isNFTsLoading } = useUsernameNFTs(username);
  const { data: tokens, isLoading: isTokensLoading } =
    useUsernameTokens(username);
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsUserLoading(true);
        const response = await fetch(`/api/users/username/${username}`);
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsUserLoading(false);
      }
    };

    fetchUser();
  }, [username]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const truncateAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          {isUserLoading ? (
            <>
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </>
          ) : user ? (
            <>
              <Avatar className="h-24 w-24 border-2 border-border">
                <AvatarFallback className="text-2xl">
                  {user.username ? user.username[0].toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  @{user.username}
                </h1>
                {user.walletAddress && (
                  <div className="flex items-center gap-2 mt-2">
                    <Wallet size={16} className="text-muted-foreground" />
                    <span className="text-sm font-mono text-muted-foreground">
                      {truncateAddress(user.walletAddress)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => copyToClipboard(user.walletAddress || "")}
                    >
                      <Copy size={12} className="mr-1" />
                      {isCopied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12 w-full">
              <p className="text-muted-foreground">User not found</p>
            </div>
          )}
        </div>

        {/* Tabs for different content types */}
        {user && (
          <Tabs defaultValue="nfts" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="nfts">NFTs</TabsTrigger>
              <TabsTrigger value="tokens">Tokens</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="nfts" className="mt-0">
              {isNFTsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="h-[200px] w-full rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : nfts && nfts.length > 0 ? (
                <NFTGrid nfts={nfts} />
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No NFTs found</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="tokens" className="mt-0">
              {isTokensLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-lg" />
                  ))}
                </div>
              ) : tokens && tokens.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {tokens.map((token) => (
                    <TokenCard
                      key={token.id}
                      token={token}
                      copyToClipboard={copyToClipboard}
                      truncateAddress={truncateAddress}
                      isCopied={isCopied}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No tokens found</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="activity" className="mt-0">
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Activity feed coming soon
                </p>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

// Token Card Component
import { Token } from "@/db/schema";

interface TokenCardProps {
  token: Token;
  copyToClipboard: (text: string) => void;
  truncateAddress: (address: string) => string;
  isCopied: boolean;
}

function TokenCard({
  token,
  copyToClipboard,
  truncateAddress,
  isCopied,
}: TokenCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              {token.name}
              <Badge variant="outline" className="ml-2">
                {token.symbol}
              </Badge>
            </CardTitle>
          </div>
          <div
            className={`text-sm font-medium ${
              Number(token.change24h) >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {Number(token.change24h) >= 0 ? "+" : ""}
            {Number(token.change24h).toFixed(2)}%
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold">
            $
            {Number(token.price).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 8,
            })}
          </div>
          <div className="text-sm text-muted-foreground">
            <div>Market Cap: ${Number(token.marketCap).toLocaleString()}</div>
            <div>Volume: ${Number(token.volume24h).toLocaleString()}</div>
          </div>
        </div>
      </CardContent>
      {token.mintAddress && (
        <CardFooter className="p-4 pt-0 flex justify-between items-center border-t border-border/50 mt-2">
          <div className="text-xs font-mono text-muted-foreground">
            {truncateAddress(token.mintAddress)}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={() => copyToClipboard(token.mintAddress || "")}
          >
            <Copy size={12} className="mr-1" />
            {isCopied ? "Copied!" : "Copy"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
