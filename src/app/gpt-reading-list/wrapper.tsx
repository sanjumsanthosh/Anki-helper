import AnkiLogo from "@/app/AnkiLogo";
import CleanAll from "./CleanAll";
import { MainNav } from "@/app/main-nav";
import { cleanAll, getStats, cleanAllCount } from "../actions";
import Stats from "./Stats";

export default function Wrapper({ children }: { children: React.ReactNode }) {

    return (
    <>
        <div className="flex w-full items-center justify-between">
        <div
            className={`flex items-center font-bold dark:text-white w-full justify-between text-xl`}
        >
            <AnkiLogo />
            <MainNav className="mx-6" />
            <Stats stats={getStats} />
            <CleanAll cleanAll={cleanAll} cleanAllCount={cleanAllCount}/>
        </div>
        </div>
        {children}
        
    </>
    );
}

