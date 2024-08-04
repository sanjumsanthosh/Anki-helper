import AnkiLogo from "@/app/AnkiLogo";
import { MainNav } from "@/app/main-nav";


export default function Wrapper({ children }: { children: React.ReactNode }) {
    
    return (
    <>
        <div className="flex w-full items-center justify-between">
        <div
            className={`flex items-center font-bold dark:text-white w-full justify-between text-xl`}
        >
            <AnkiLogo />
            <MainNav className="mx-6" />
        </div>
        </div>
        {children}
        
    </>
    );
}

