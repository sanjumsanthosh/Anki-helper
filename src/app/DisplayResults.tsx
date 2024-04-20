'use client'

import { useCounterStore } from "@/provider/result-provider";

export default function DisplayResults() {
    const {  status} = useCounterStore(
        (state) => state,
      )
    return (
        <>{status}</>
    );
}