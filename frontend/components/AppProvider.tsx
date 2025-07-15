"use client";

import { ClerkProvider, useUser, useAuth } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "@/config";

function ClerkSync() {
  const { isSignedIn } = useUser();
  const { getToken } = useAuth();

  const clerksync = async () => {
    try {
      const token = await getToken();
      if (token) {
        await axios.get(`${BACKEND_URL}:3001/clerk-sync`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (err) {
      console.error("Clerk sync failed:", err);
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      clerksync().then(() => {
        console.log("hiiiii");
      });
    }
  }, [isSignedIn, getToken]);
  return null;
}

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
      <ClerkProvider>
        <ClerkSync />
        {children}
      </ClerkProvider>
    </ThemeProvider>
  );
};
