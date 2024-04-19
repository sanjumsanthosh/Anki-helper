"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { CounterStoreProvider } from "@/provider/result-provider";

export function Provider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>
        <CounterStoreProvider>
            {children}
        </CounterStoreProvider>
    </NextThemesProvider>;
}