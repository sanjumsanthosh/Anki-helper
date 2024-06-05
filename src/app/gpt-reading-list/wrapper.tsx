import AnkiLogo from "@/app/AnkiLogo";
import CleanAll from "./CleanAll";
import { cleanAll, getStats } from "./actions";
import Stats from "./Stats";

export default function Wrapper({ children }: { children: React.ReactNode }) {

    return (
    <>
        <div className="flex w-full items-center justify-between">
        <div
            className={`flex items-center font-bold dark:text-white w-full justify-between text-xl`}
        >
            <AnkiLogo />
            <Stats stats={getStats} />
            <CleanAll cleanAll={cleanAll} />
        </div>
        </div>
        {children}
        
    </>
    );
}

