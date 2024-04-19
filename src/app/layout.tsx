import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Provider } from "@/components/provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider attribute="class" defaultTheme="system" enableSystem>
          <main
            className={`text-zinc-700 bg-white dark:text-zinc-400 dark:bg-black`}
          >
            {children}
          </main>
        </Provider>
      </body>
    </html>
  );
}