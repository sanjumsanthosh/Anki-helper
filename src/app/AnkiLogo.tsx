'use client';

import { useCounterStore } from "@/provider/result-provider";

export default function AnkiLogo() {

    const { health, setHealthy } = useCounterStore((state) => state);
    return (
        <>
            Anki<span 
                className={ health ? "text-green-500" : "text-red-500"}
            >.</span>{" "}
            <span
            className={`text-sm font-bold group ml-2 inline-block rounded-3xl bg-[#fafafa] px-3 text-black`}
            >
            <span className="">Helper</span>
            </span>
        </>
        
    );
}