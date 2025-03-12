import { db } from '../index';
import { nfts, NewNFT, NFT, users } from '../schema';
import { eq, desc } from 'drizzle-orm';

// Mock NFT data until the database table is created
const mockNFTs: NFT[] = [
  {
    id: 1,
    userId: 1,
    name: 'Cosmic Explorer #001',
    description: 'A rare cosmic explorer NFT from the Genesis collection',
    imageUrl: 'https://picsum.photos/seed/nft1/500/500',
    metadata: { attributes: [{ trait_type: 'Rarity', value: 'Legendary' }] },
    mintAddress: '0x1234567890abcdef1234567890abcdef12345678',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    userId: 1,
    name: 'Digital Dreamscape #042',
    description: 'Explore the digital dreamscape of the future',
    imageUrl: 'https://picsum.photos/seed/nft2/500/500',
    metadata: { attributes: [{ trait_type: 'Rarity', value: 'Epic' }] },
    mintAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 3,
    userId: 2,
    name: 'Neon Horizon #103',
    description: 'A glimpse into the neon-lit horizon of tomorrow',
    imageUrl: 'https://picsum.photos/seed/nft3/500/500',
    metadata: { attributes: [{ trait_type: 'Rarity', value: 'Rare' }] },
    mintAddress: '0x7890abcdef1234567890abcdef1234567890abcd',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 4,
    userId: 3,
    name: 'Quantum Fragment #217',
    description: 'A fragment of quantum reality captured in digital form',
    imageUrl: 'https://picsum.photos/seed/nft4/500/500',
    metadata: { attributes: [{ trait_type: 'Rarity', value: 'Uncommon' }] },
    mintAddress: '0xef1234567890abcdef1234567890abcdef123456',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Mock user data mapping
const mockUserMap = {
  1: { username: 'satoshi', walletAddress: '0x1234...5678' },
  2: { username: 'vitalik', walletAddress: '0x8765...4321' },
  3: { username: 'scriptscrypt', walletAddress: '0xabcd...efgh' }
};

export const nftRepository = {
  // Get all NFTs
  async getAllNFTs(): Promise<NFT[]> {
    try {
      // When the database table is ready, uncomment this:
      // return db.select().from(nfts).orderBy(desc(nfts.createdAt));
      
      // For now, return mock data
      return mockNFTs;
    } catch (error) {
      console.error('Error in getAllNFTs:', error);
      return mockNFTs;
    }
  },

  // Get NFTs by user ID
  async getNFTsByUserId(userId: number): Promise<NFT[]> {
    try {
      // When the database table is ready, uncomment this:
      // return db.select().from(nfts).where(eq(nfts.userId, userId)).orderBy(desc(nfts.createdAt));
      
      // For now, filter mock data
      return mockNFTs.filter(nft => nft.userId === userId);
    } catch (error) {
      console.error('Error in getNFTsByUserId:', error);
      return mockNFTs.filter(nft => nft.userId === userId);
    }
  },

  // Get NFTs by wallet address
  async getNFTsByWalletAddress(walletAddress: string): Promise<NFT[]> {
    try {
      // When the database table is ready, uncomment this:
      // const user = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
      // if (!user[0]) return [];
      // return this.getNFTsByUserId(user[0].id);
      
      // For now, find user ID from mock data and filter
      const userId = Object.entries(mockUserMap).find(
        ([id, user]) => user.walletAddress.includes(walletAddress.substring(0, 6))
      )?.[0];
      
      return userId ? mockNFTs.filter(nft => nft.userId === parseInt(userId)) : [];
    } catch (error) {
      console.error('Error in getNFTsByWalletAddress:', error);
      return [];
    }
  },

  // Get NFTs by username
  async getNFTsByUsername(username: string): Promise<NFT[]> {
    try {
      // When the database table is ready, uncomment this:
      // const user = await db.select().from(users).where(eq(users.username, username));
      // if (!user[0]) return [];
      // return this.getNFTsByUserId(user[0].id);
      
      // For now, find user ID from mock data and filter
      const userId = Object.entries(mockUserMap).find(
        ([id, user]) => user.username === username
      )?.[0];
      
      return userId ? mockNFTs.filter(nft => nft.userId === parseInt(userId)) : [];
    } catch (error) {
      console.error('Error in getNFTsByUsername:', error);
      return [];
    }
  },

  // Get NFT by ID
  async getNFTById(id: number): Promise<NFT | undefined> {
    try {
      // When the database table is ready, uncomment this:
      // const result = await db.select().from(nfts).where(eq(nfts.id, id));
      // return result[0];
      
      // For now, find in mock data
      return mockNFTs.find(nft => nft.id === id);
    } catch (error) {
      console.error('Error in getNFTById:', error);
      return undefined;
    }
  },

  // Create a new NFT
  async createNFT(nft: NewNFT): Promise<NFT> {
    try {
      // When the database table is ready, uncomment this:
      // const result = await db.insert(nfts).values(nft).returning();
      // return result[0];
      
      // For now, simulate creation with mock data
      const newNft: NFT = {
        id: mockNFTs.length + 1,
        ...nft,
        description: nft.description || null,
        metadata: nft.metadata || {},
        mintAddress: nft.mintAddress || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockNFTs.push(newNft);
      return newNft;
    } catch (error) {
      console.error('Error in createNFT:', error);
      throw error;
    }
  },

  // Update an NFT
  async updateNFT(id: number, nft: Partial<NewNFT>): Promise<NFT | undefined> {
    try {
      // When the database table is ready, uncomment this:
      // const result = await db.update(nfts).set({
      //   ...nft,
      //   updatedAt: new Date(),
      // }).where(eq(nfts.id, id)).returning();
      // return result[0];
      
      // For now, update in mock data
      const index = mockNFTs.findIndex(n => n.id === id);
      if (index === -1) return undefined;
      
      mockNFTs[index] = {
        ...mockNFTs[index],
        ...nft,
        updatedAt: new Date()
      };
      
      return mockNFTs[index];
    } catch (error) {
      console.error('Error in updateNFT:', error);
      return undefined;
    }
  },

  // Delete an NFT
  async deleteNFT(id: number): Promise<void> {
    try {
      // When the database table is ready, uncomment this:
      // await db.delete(nfts).where(eq(nfts.id, id));
      
      // For now, delete from mock data
      const index = mockNFTs.findIndex(n => n.id === id);
      if (index !== -1) {
        mockNFTs.splice(index, 1);
      }
    } catch (error) {
      console.error('Error in deleteNFT:', error);
    }
  }
}; 