"use client";

import { ClerkProvider, useUser, useAuth } from "@clerk/nextjs";
import { ThemeProvider, useTheme } from "next-themes";
import { useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "@/config";
import { dark } from "@clerk/themes";

function ClerkSync() {
  const { isSignedIn } = useUser();
  const { getToken } = useAuth();

  const clerksync = async () => {
    try {
      const token = await getToken();
      if (token) {
        await axios.get(`${BACKEND_URL}/clerk-sync`, {
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
      clerksync();
    }
  }, [isSignedIn, getToken]);
  return null;
}

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
      <ClerkProvider
        appearance={{
          baseTheme: dark,
        }}
      >
        <ClerkSync />
        {children}
      </ClerkProvider>
    </ThemeProvider>
  );
};
