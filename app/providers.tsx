"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { WalletProvider } from "@/lib/genlayer/WalletProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  // Setup React Query client for efficient state management of on-chain cases
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5000, // Slightly longer stale time for arbitration data
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        {children}
      </WalletProvider>
      {/* Toaster provides real-time feedback for arbitration actions.
          We use custom styles to match the GenLayer Navy/Purple theme.
      */}
      <Toaster
        position="top-right"
        theme="dark"
        richColors
        closeButton
        offset="80px"
        toastOptions={{
          style: {
            background: 'oklch(0.25 0.08 265)', // Matches --card variable in globals.css
            border: '1px solid oklch(0.30 0.10 265 / 0.4)',
            color: 'oklch(0.98 0 0)',
            boxShadow: '0 8px 32px rgb(0 0 0 / 0.5)',
            borderRadius: 'var(--radius)',
          },
        }}
      />
    </QueryClientProvider>
  );
}