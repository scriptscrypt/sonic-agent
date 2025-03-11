import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

async function populateTokensTable() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Populating tokens table with mock data...');

    // Get existing users to associate tokens with
    const usersResult = await pool.query('SELECT id FROM users');
    
    if (usersResult.rows.length === 0) {
      console.log('No users found. Please run the seed script first.');
      return;
    }

    // Mock token data
    const mockTokens = [
      {
        name: 'Solana',
        symbol: 'SOL',
        description: 'Solana is a high-performance blockchain supporting builders around the world creating crypto apps that scale.',
        logoUrl: 'https://cryptologos.cc/logos/solana-sol-logo.png',
        price: 135.75,
        marketCap: 58900000000,
        volume24h: 2450000000,
        change24h: 3.25,
        mintAddress: 'So11111111111111111111111111111111111111112',
        metadata: JSON.stringify({ website: 'https://solana.com', twitter: '@solana' })
      },
      {
        name: 'Jupiter',
        symbol: 'JUP',
        description: 'Jupiter is the key liquidity aggregator for Solana, offering the widest range of tokens and best route discovery.',
        logoUrl: 'https://cryptologos.cc/logos/jupiter-jup-logo.png',
        price: 0.85,
        marketCap: 1200000000,
        volume24h: 75000000,
        change24h: 1.75,
        mintAddress: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
        metadata: JSON.stringify({ website: 'https://jup.ag', twitter: '@JupiterExchange' })
      },
      {
        name: 'Bonk',
        symbol: 'BONK',
        description: 'BONK is a community-driven meme token on Solana that has gained popularity for its fun approach to crypto.',
        logoUrl: 'https://cryptologos.cc/logos/bonk-bonk-logo.png',
        price: 0.00002145,
        marketCap: 1350000000,
        volume24h: 65000000,
        change24h: -2.35,
        mintAddress: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        metadata: JSON.stringify({ website: 'https://bonkcoin.com', twitter: '@bonk_inu' })
      },
      {
        name: 'Pyth Network',
        symbol: 'PYTH',
        description: 'Pyth is a first-party financial oracle network that publishes continuous real-world data on-chain.',
        logoUrl: 'https://cryptologos.cc/logos/pyth-network-pyth-logo.png',
        price: 0.45,
        marketCap: 750000000,
        volume24h: 25000000,
        change24h: 5.65,
        mintAddress: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3',
        metadata: JSON.stringify({ website: 'https://pyth.network', twitter: '@PythNetwork' })
      },
      {
        name: 'Jito',
        symbol: 'JTO',
        description: 'Jito is a suite of MEV infrastructure on Solana, including a liquid staking token and MEV-aware block engine.',
        logoUrl: 'https://cryptologos.cc/logos/jito-jto-logo.png',
        price: 2.15,
        marketCap: 250000000,
        volume24h: 15000000,
        change24h: 0.85,
        mintAddress: 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn',
        metadata: JSON.stringify({ website: 'https://jito.network', twitter: '@jito_sol' })
      }
    ];

    // Insert tokens for each user
    for (const user of usersResult.rows) {
      for (const token of mockTokens) {
        await pool.query(
          `INSERT INTO tokens 
           (user_id, name, symbol, description, logo_url, price, market_cap, volume_24h, change_24h, mint_address, metadata, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
          [
            user.id,
            token.name,
            token.symbol,
            token.description,
            token.logoUrl,
            token.price,
            token.marketCap,
            token.volume24h,
            token.change24h,
            token.mintAddress,
            token.metadata
          ]
        );
        console.log(`Added ${token.name} token for user ID ${user.id}`);
      }
    }

    console.log('Tokens table populated successfully!');
  } catch (error) {
    console.error('Error populating tokens table:', error);
  } finally {
    await pool.end();
  }
}

populateTokensTable().catch(err => {
  console.error('Failed to populate tokens table:', err);
  process.exit(1);
}); 