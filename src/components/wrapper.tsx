import AnkiLogo from "@/app/AnkiLogo";
import SelectDeck from "@/app/SelectDeck";
import { MainNav } from "@/app/main-nav";
import { cookies } from "next/headers";

export default function Wrapper({ children }: { children: React.ReactNode }) {
    const cookieStore = cookies()
    const currentDeck = cookieStore.get('deck');

    async function setDeckInCookies(deck: string) {
        "use server";
        cookies().set("deck", deck);
      }


    return (
    <>
        <div className="flex items-center justify-between w-full h-full">
            <div
                className={`flex items-center justify-between text-2xl font-bold dark:text-white w-full`}
            >
                <AnkiLogo />
                <MainNav className="mx-6" />
                <SelectDeck currentDeck={currentDeck?.value} setDeckInCookies={setDeckInCookies}/>
            </div>
        </div>
        {children}
        
    </>
    );
}