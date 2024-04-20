"use client";

import { Button } from "@/components/ui/button";
import { DeckNames } from "@/const/ankiActions";
import { RequestBuilder } from "@/lib/fetchUtils";
import { useCounterStore } from "@/provider/result-provider";
import { useEffect } from "react";


export default function ShowOptions() {
    const {setDecks } = useCounterStore(
        (state) => state,
      )

    const GetAllDecks = async () => {
        try {
            const action = DeckNames.createDeckNames();
            const builder = await RequestBuilder.create<DeckNames>()
                .setAction(action)
                .performAction();
            
            if (builder.isSuccessful()) {
                const responseAction = builder.getResponseAction();
                console.log(responseAction.names); 
                setDecks(responseAction.names);
            }
        } catch (error) {
            console.error(error); 
        }
    }

    useEffect(() => {
        GetAllDecks();
    }, [])
    
    return (
        <div className="flex flex-col">
        <Button variant="brand" size="xl">
            Get All Decks
        </Button>
        </div>
    );
}

