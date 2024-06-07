import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Provider } from "@/components/provider";
import localFont from 'next/font/local'


const myFont = localFont({
  src: './MonaspaceXenonVarVF[wght,wdth,slnt].ttf',
  display: 'swap',
})
 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Anki Helper",
  description: "A set of tools to help with Anki.. among others things",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={myFont.className}>
        <Provider attribute="class" defaultTheme="system" enableSystem>
          <main
            className={`text-zinc-700 bg-white dark:text-zinc-400 dark:bg-black max-w-full w-full h-full`} >
            {children}
          </main>
        </Provider>
      </body>
    </html>
  );
}

