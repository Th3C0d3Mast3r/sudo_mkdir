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
    const token = await getToken();
    if (token) {
      await axios.get(`${BACKEND_URL}/clerk-sync`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      <ClerkProvider>
        <ClerkSync />
        {children}
      </ClerkProvider>
    </ThemeProvider>
  );
};
