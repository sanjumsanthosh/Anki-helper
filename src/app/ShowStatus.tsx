"use client";

import { Button } from "@/components/ui/button";
import { useCounterStore } from "@/provider/result-provider";


export default function ShowStatus() {
    const { count, incrementCount, setStatus } = useCounterStore(
        (state) => state,
      )

    const performAction = () => {
        setStatus('loading')
        fetch('http://localhost:8765/proxy')
        .then((data) => {
            if (data.body instanceof ReadableStream) {
                const response = new Response(data.body);
                response.text().then((text) => {
                  console.log(text); // Handle the text data here
                  setStatus(text)
                });
              }
        })
        .catch((error) => {
            setStatus('error')
        })

    }
    
    return (
        <div className="flex flex-col">
        <Button variant="brand" size="xl" onClick={performAction}>
            Get Started
        </Button>
        </div>
    );
}

