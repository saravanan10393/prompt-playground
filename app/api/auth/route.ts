import { NextResponse } from "next/server";
import { generateUserToken, getOrCreateUser } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  const startTime = Date.now();
  logger.apiRequest("POST", "/api/auth");
  
  try {
    const body = await request.json();
    const { token, name } = body;
    logger.debug("Auth POST request", { hasToken: !!token, hasName: !!name });
    
    let userToken = token;
    
    // Generate new token if not provided
    if (!userToken) {
      userToken = generateUserToken();
    }
    
    // Get or create user
    const user = await getOrCreateUser(userToken, name);
    
    if (!user) {
      logger.error("Failed to create user", new Error("User creation failed"));
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }
    
    logger.apiResponse("POST", "/api/auth", 200, Date.now() - startTime, { userId: user.id });
    
    // Return user data with token
    return NextResponse.json({
      user,
      token: userToken,
    });
  } catch (error) {
    logger.apiError("POST", "/api/auth", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const startTime = Date.now();
  logger.apiRequest("GET", "/api/auth");
  
  try {
    const cookieHeader = request.headers.get("cookie");
    
    if (!cookieHeader) {
      return NextResponse.json(
        { error: "No token provided" },
        { status: 401 }
      );
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
      return NextResponse.json(
        { error: "No token provided" },
        { status: 401 }
      );
    }
    
    const user = await getOrCreateUser(userToken);
    
    if (!user) {
      logger.warn("User not found", { token: userToken?.substring(0, 8) });
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    logger.apiResponse("GET", "/api/auth", 200, Date.now() - startTime, { userId: user.id });
    return NextResponse.json({ user });
  } catch (error) {
    logger.apiError("GET", "/api/auth", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const startTime = Date.now();
  logger.apiRequest("PATCH", "/api/auth");
  
  try {
    const cookieHeader = request.headers.get("cookie");
    
    if (!cookieHeader) {
      return NextResponse.json(
        { error: "No token provided" },
        { status: 401 }
      );
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
      return NextResponse.json(
        { error: "No token provided" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { name } = body;
    
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Invalid name provided" },
        { status: 400 }
      );
    }
    
    const user = await getOrCreateUser(userToken);
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Update user name
    const { queries } = await import("@/lib/db");
    await queries.updateUserName(user.id, name.trim());
    
    // Fetch updated user
    const updatedUser = await queries.getUserByToken(userToken);
    
    logger.apiResponse("PATCH", "/api/auth", 200, Date.now() - startTime, { userId: user.id, newName: name });
    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    logger.apiError("PATCH", "/api/auth", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

