import AnkiLogo from "@/app/AnkiLogo";
import SelectDeck from "@/app/SelectDeck";
import { MainNav } from "@/app/main-nav";
import { cookies } from "next/headers";
import CleanAll from "./CleanAll";
import { cleanAll, getStats } from "./actions";

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
            className={`flex items-center font-bold dark:text-white w-full justify-between text-xl`}
        >
            <AnkiLogo />
            <CleanAll cleanAll={cleanAll} />
        </div>
        </div>
        {children}
        
    </>
    );
}

