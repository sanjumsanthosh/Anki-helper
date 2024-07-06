'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCounterStore } from "@/provider/result-provider";
import { useEffect } from "react";

type DeckProps = {
    currentDeck: string | undefined;
    setDeckInCookies: (deck: string) => void;
};

export default function SelectDeck({ currentDeck, setDeckInCookies}: DeckProps) {

    const { decks, selectDeck, deck  } = useCounterStore((state) => state);


    
    useEffect(() => {
        
        if (currentDeck) {
            selectDeck(currentDeck);
        }
    }, []);

    const setDeck = (deck: string) => {
        selectDeck(deck);
        setDeckInCookies(deck);
    }

    return (
        <div className="w-50">
            <Select onValueChange={setDeck} value={deck}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a deck" />
                </SelectTrigger>
                <SelectContent>
                    {decks.map((deck) => (
                        <SelectItem key={deck} value={deck} onSelect={() => setDeck(deck)}>
                            {deck}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

    );

}