import { NextResponse } from "next/server";
import { generateUserToken, getOrCreateUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, name } = body;
    
    let userToken = token;
    
    // Generate new token if not provided
    if (!userToken) {
      userToken = generateUserToken();
    }
    
    // Get or create user
    const user = await getOrCreateUser(userToken, name);
    
    if (!user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }
    
    // Return user data with token
    return NextResponse.json({
      user,
      token: userToken,
    });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
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
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
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
    
    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Update name error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

