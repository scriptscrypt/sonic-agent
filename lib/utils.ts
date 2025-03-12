import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function validateEnvironment() {
  const missingVars: string[] = [];
  const requiredVars = ["OPENAI_API_KEY", "SONIC_RPC_URL", "SONIC_PRIVATE_KEY"];

  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.error("Error: Required environment variables are not set");
    missingVars.forEach((varName) => {
      console.error(`${varName}=your_${varName.toLowerCase()}_here`);
    });
    process.exit(1);
  }
}

// Array of adjectives and nouns for random username generation
const adjectives = [
  "Happy", "Brave", "Clever", "Swift", "Mighty", 
  "Gentle", "Wise", "Bold", "Calm", "Bright",
  "Cosmic", "Mystic", "Radiant", "Vibrant", "Stellar",
  "Lunar", "Solar", "Astral", "Quantum", "Sonic"
];

const nouns = [
  "Falcon", "Tiger", "Dolphin", "Eagle", "Wolf", 
  "Panda", "Lion", "Phoenix", "Dragon", "Bear",
  "Comet", "Star", "Planet", "Galaxy", "Nebula",
  "Voyager", "Explorer", "Pioneer", "Ranger", "Rider"
];

/**
 * Generates a random username in the format "AdjectiveNoun123"
 * @returns A random username string
 */
export function generateRandomUsername(): string {
  const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNum = Math.floor(Math.random() * 1000);
  return `${randomAdj}${randomNoun}${randomNum}`;
}
