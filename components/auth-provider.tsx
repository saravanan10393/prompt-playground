"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { NameEntryDialog } from "@/components/name-entry-dialog";

const USER_TOKEN_KEY = "user_token";

interface User {
  id: number;
  token: string;
  name: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  showNameEntry: boolean;
  setShowNameEntry: (show: boolean) => void;
  updateUserName: (newName: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNameEntry, setShowNameEntry] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = Cookies.get(USER_TOKEN_KEY);
      
      if (!token) {
        // Create new user session
        const response = await fetch("/api/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });
        
        if (response.ok) {
          const data = await response.json();
          Cookies.set(USER_TOKEN_KEY, data.token, { expires: 365 });
          setUser(data.user);
          // setShowNameEntry(true); // Commented out - no longer auto-prompt for new users
        }
      } else {
        // Check existing user
        const response = await fetch("/api/auth");
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          // Show name entry if name looks auto-generated
          // if (data.user.name.includes("_") && data.user.name.length > 10) {
          //   setShowNameEntry(true);
          // }
        } else {
          // Token invalid, create new user
          const response = await fetch("/api/auth", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
          });
          
          if (response.ok) {
            const data = await response.json();
            Cookies.set(USER_TOKEN_KEY, data.token, { expires: 365 });
            setUser(data.user);
            // setShowNameEntry(true); // Commented out - no longer auto-prompt when token invalid
          }
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserName = (newName: string) => {
    if (user) {
      setUser({ ...user, name: newName });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, showNameEntry, setShowNameEntry, updateUserName }}>
      {children}
      
      {showNameEntry && user && (
        <NameEntryDialog
          isOpen={showNameEntry}
          onClose={() => setShowNameEntry(false)}
          currentName={user.name}
          onNameChange={updateUserName}
          onContinue={() => setShowNameEntry(false)}
        />
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

