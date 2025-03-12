import Image from 'next/image';
import { NFT } from '@/db/schema';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import Link from 'next/link';

interface NFTCardProps {
  nft: NFT;
  showOwner?: boolean;
  username?: string;
}

export function NFTCard({ nft, showOwner = false, username }: NFTCardProps) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative aspect-square overflow-hidden">
        <Image
          width={100}
          height={100}
          src={nft.imageUrl}
          alt={nft.name}
          fill
          className="object-cover"
        />
      </div>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold truncate">{nft.name}</CardTitle>
          {nft.mintAddress && (
            <Badge variant="outline" className="ml-2 shrink-0">
              Minted
            </Badge>
          )}
        </div>
        {showOwner && username && (
          <Link href={`/${username}`} className="text-sm text-muted-foreground hover:underline">
            @{username}
          </Link>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2">{nft.description}</p>
      </CardContent>
      {nft.mintAddress && (
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <div className="text-xs font-mono text-muted-foreground">
            {truncateAddress(nft.mintAddress)}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={() => copyToClipboard(nft.mintAddress || '')}
          >
            <Copy size={12} className="mr-1" />
            {isCopied ? 'Copied!' : 'Copy'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
} 