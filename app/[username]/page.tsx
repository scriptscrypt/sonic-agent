import { notFound } from 'next/navigation';
import { userRepository } from '@/db/repositories/userRepository';

interface ProfilePageProps {
  params: {
    username: string;
  };
}

export default async function UserProfilePage({ params }: ProfilePageProps) {
  const { username } = params;
  
  // Check if this is a wallet address (simple check for 0x prefix)
  const isWalletAddress = username.startsWith('0x');
  
  // Fetch user by username or wallet address
  const user = isWalletAddress 
    ? await userRepository.getUserByWalletAddress(username)
    : await userRepository.getUserByUsername(username);
  
  // If user not found, return 404
  if (!user) {
    notFound();
  }
  
  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">User Profile</h1>
      
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <div className="space-y-4">
          {user.username && (
            <div>
              <h2 className="text-xl font-semibold">Username</h2>
              <p>{user.username}</p>
            </div>
          )}
          
          {user.walletAddress && (
            <div>
              <h2 className="text-xl font-semibold">Wallet Address</h2>
              <p className="font-mono break-all">{user.walletAddress}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 