import { v4 as uuidv4 } from "uuid";
import { queries } from "./db";

export interface User {
  id: number;
  token: string;
  name: string;
  created_at: string;
}

// Emoji and character combinations for random usernames
const EMOJI_CHARACTERS = ['🎮', '🌟', '⚡', '🎨', '🚀', '💫', '🎯', '🔥', '✨', '🎪', '🎭', '🎨', '🎲', '🎸', '🎺', '🎻', '🎼', '🎵', '🎶', '🎤', '🎧', '🎬', '🎭', '🎨', '🎪', '🎫', '🎟️', '🎠', '🎡', '🎢', '🎣', '🎤', '🎥', '🎦', '🎧', '🎨', '🎩', '🎪', '🎫', '🎬', '🎭', '🎮', '🎯', '🎰', '🎱', '🎲', '🎳', '🎴', '🎵', '🎶', '🎷', '🎸', '🎹', '🎺', '🎻', '🎼', '🎽', '🎾', '🎿', '🏀', '🏁', '🏂', '🏃', '🏄', '🏅', '🏆', '🏇', '🏈', '🏉', '🏊', '🏋', '🏌', '🏍', '🏎', '🏏', '🏐', '🏑', '🏒', '🏓', '🏔', '🏕', '🏖', '🏗', '🏘', '🏙', '🏚', '🏛', '🏜', '🏝', '🏞', '🏟', '🏠', '🏡', '🏢', '🏣', '🏤', '🏥', '🏦', '🏧', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏮', '🏯', '🏰', '🏱', '🏲', '🏳', '🏴', '🏵', '🏶', '🏷', '🏸', '🏹', '🏺', '🏻', '🏼', '🏽', '🏾', '🏿'];

const ANIMAL_NAMES = ['Fox', 'Bear', 'Wolf', 'Eagle', 'Lion', 'Tiger', 'Dragon', 'Phoenix', 'Falcon', 'Hawk', 'Owl', 'Raven', 'Panther', 'Jaguar', 'Leopard', 'Cheetah', 'Lynx', 'Cougar', 'Puma', 'Bobcat', 'Lynx', 'Wildcat', 'Serval', 'Caracal', 'Ocelot', 'Margay', 'Jaguarundi', 'Kodkod', 'Geoffroy', 'Oncilla', 'Pampas', 'Andean', 'Pampas', 'Geoffroy', 'Margay', 'Ocelot', 'Serval', 'Caracal', 'Lynx', 'Bobcat', 'Puma', 'Cougar', 'Leopard', 'Jaguar', 'Panther', 'Tiger', 'Lion', 'Dragon', 'Phoenix', 'Falcon', 'Hawk', 'Eagle', 'Raven', 'Owl', 'Wolf', 'Bear', 'Fox'];

const ADJECTIVES = ['Swift', 'Bright', 'Bold', 'Clever', 'Wise', 'Brave', 'Noble', 'Fierce', 'Gentle', 'Wild', 'Free', 'Proud', 'Strong', 'Quick', 'Sharp', 'Smart', 'Bright', 'Bold', 'Brave', 'Calm', 'Cool', 'Daring', 'Eager', 'Fierce', 'Gentle', 'Happy', 'Jolly', 'Kind', 'Lively', 'Merry', 'Proud', 'Quick', 'Smart', 'Swift', 'Wise', 'Zesty', 'Zippy', 'Zany', 'Zealous', 'Zestful', 'Zippy', 'Zany', 'Zealous', 'Zestful'];

/**
 * Generate a random username with emoji and character combination
 */
export function generateRandomUsername(): string {
  const emoji = EMOJI_CHARACTERS[Math.floor(Math.random() * EMOJI_CHARACTERS.length)];
  const animal = ANIMAL_NAMES[Math.floor(Math.random() * ANIMAL_NAMES.length)];
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  
  return `${emoji} ${adjective}_${animal}_${randomSuffix}`;
}

/**
 * Generate a unique user token
 */
export function generateUserToken(): string {
  return uuidv4();
}

/**
 * Get or create a user by token
 */
export async function getOrCreateUser(token: string, name?: string): Promise<User | null> {
  try {
    // Try to find existing user
    const existingUser = await queries.getUserByToken(token);
    
    if (existingUser) {
      return existingUser as unknown as User;
    }
    
    // Create new user if not exists
    const userName = name || generateRandomUsername();
    await queries.createUser(token, userName);
    
    // Fetch the newly created user
    const newUser = await queries.getUserByToken(token);
    return newUser as unknown as User || null;
  } catch (error) {
    console.error("Error in getOrCreateUser:", error);
    return null;
  }
}

/**
 * Get user from request headers
 */
export async function getUserFromRequest(request: Request): Promise<User | null> {
  const cookieHeader = request.headers.get("cookie");
  
  if (!cookieHeader) {
    return null;
  }
  
  // Parse cookies manually
  const cookies = Object.fromEntries(
    cookieHeader.split("; ").map(cookie => {
      const [key, ...valueParts] = cookie.split("=");
      return [key, valueParts.join("=")];
    })
  );
  
  const userToken = cookies.user_token;
  
  if (!userToken) {
    return null;
  }
  
  return await getOrCreateUser(userToken);
}

/**
 * Validate user token
 */
export async function validateUserToken(token: string): Promise<boolean> {
  if (!token) return false;
  
  try {
    const user = await queries.getUserByToken(token);
    return !!user;
  } catch (error) {
    console.error("Error validating token:", error);
    return false;
  }
}

