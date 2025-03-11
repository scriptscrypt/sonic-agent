import { NFT } from '@/db/schema';
import { NFTCard } from './NFTCard';
import { userRepository } from '@/db/repositories/userRepository';
import { useEffect, useState } from 'react';

interface NFTGridProps {
  nfts: NFT[];
  showOwner?: boolean;
}

export function NFTGrid({ nfts, showOwner = false }: NFTGridProps) {
  const [usernames, setUsernames] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchUsernames = async () => {
      const usernameMap: Record<number, string> = {};
      
      // Get unique user IDs
      const userIds = [...new Set(nfts.map(nft => nft.userId))];
      
      // Fetch usernames in parallel
      const promises = userIds.map(async (userId) => {
        try {
          const response = await fetch(`/api/users/${userId}`);
          if (response.ok) {
            const user = await response.json();
            if (user && user.username) {
              usernameMap[userId] = user.username;
            }
          }
        } catch (error) {
          console.error(`Error fetching username for user ${userId}:`, error);
        }
      });
      
      await Promise.all(promises);
      setUsernames(usernameMap);
    };

    if (nfts.length > 0 && showOwner) {
      fetchUsernames();
    }
  }, [nfts, showOwner]);

  if (nfts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No NFTs found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {nfts.map((nft) => (
        <NFTCard 
          key={nft.id} 
          nft={nft} 
          showOwner={showOwner} 
          username={usernames[nft.userId]} 
        />
      ))}
    </div>
  );
} 