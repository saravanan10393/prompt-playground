import { queries } from "@/lib/db";

const USER_TOKEN_KEY = "user_token";

export interface UserInfo {
  userId: number;
  token: string;
  name: string;
}

/**
 * Extract user information from request cookies
 * @param request - The incoming Request object
 * @returns UserInfo if authenticated, null otherwise
 */
export async function getUserFromRequest(
  request: Request
): Promise<UserInfo | null> {
  try {
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

    const userToken = cookies[USER_TOKEN_KEY];

    if (!userToken) {
      return null;
    }

    // Get user from database
    const user = await queries.getUserByToken(userToken);

    if (!user) {
      return null;
    }

    return {
      userId: user.id as number,
      token: user.token as string,
      name: user.name as string,
    };
  } catch (error) {
    console.error("Error extracting user from request:", error);
    return null;
  }
}
