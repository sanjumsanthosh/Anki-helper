'use client'

import { useCounterStore } from "@/provider/result-provider";

export default function DisplayResults() {
    const { count, status} = useCounterStore(
        (state) => state,
      )
    return (
        <>{status}</>
    );
}