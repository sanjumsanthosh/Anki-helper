import AnkiLogo from "@/app/AnkiLogo";
import SelectDeck from "@/app/SelectDeck";
import { MainNav } from "@/app/main-nav";
import { cookies } from "next/headers";

export default function Wrapper({ children }: { children: React.ReactNode }) {
    const cookieStore = cookies()
    const currentDeck = cookieStore.get('deck');

    async function setDeckInCookies(deck: string) {
        "use server";
        console.log("Setting deck in cookies", deck);
        cookies().set("deck", deck);
      }


    return (
    <>
        <div className="flex w-full items-center justify-between">
        <div
            className={`flex items-center text-2xl font-bold dark:text-white`}
        >
            <AnkiLogo />
        </div>
        </div>
        {children}
        
    </>
    );
}