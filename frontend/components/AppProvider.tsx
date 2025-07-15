"use client";

import { ClerkProvider, useUser, useAuth } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import axios from "axios";

function ClerkSync() {
  const { isSignedIn } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    if (isSignedIn) {
      getToken().then((token) => {
        if (token) {
          axios.post(
            "http://localhost:3001/clerk-sync",
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        }
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
