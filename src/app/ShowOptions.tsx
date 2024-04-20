"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { DeckNames, DeckNamesAndIds, FindNotes, NotesInfo } from "@/const/ankiActions";
import { RequestBuilder } from "@/lib/fetchUtils";
import { useCounterStore } from "@/provider/result-provider";
import { Label } from "@radix-ui/react-label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@radix-ui/react-select";
import { Input } from "postcss";
import { useEffect } from "react";
import {z} from "zod";

const ButtonTableItem = z.object({
    name: z.string(),
    onClick: z.function(),
    description: z.string()
})


export default function ShowOptions() {
    const {setDecks,setStatus  } = useCounterStore(
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
                setStatus(JSON.stringify(responseAction.names));
            }
        } catch (error) {
            console.error(error); 
        }
    }

    const GetAllDecksWithIds = async () => {
        try {
            const action = DeckNamesAndIds.createDeckNamesAndIds();
            const builder = await RequestBuilder.create<DeckNamesAndIds>()
                .setAction(action)
                .performAction();
            if (builder.isSuccessful()) {
                const responseAction = builder.getResponseAction();
                console.log(responseAction.deckNamesAndIds); 
                setStatus(JSON.stringify(responseAction.deckNamesAndIds));
            }
        }
        catch (error) {
            console.error(error); 
        }
    }


    const GetAllNotes = async () => {
        try {
            const action = FindNotes.createFindNotes();
            action.setDeck("ML Terminologies");
            const builder = await RequestBuilder.create<FindNotes>()
                .setAction(action)
                .performAction();
            if (builder.isSuccessful()) {
                const responseAction = builder.getResponseAction();
                console.log(responseAction.notes); 
                setStatus(JSON.stringify(responseAction.notes));
            }
        }catch (error) {
            console.error(error); 
        }
    }

    const GetNoteInfo = async () => {
        try {
            const action = NotesInfo.createNotesInfo();
            const findNotes = FindNotes.createFindNotes();
            findNotes.setDeck("ML Terminologies");
            const builder = await RequestBuilder.create<FindNotes>()
                .setAction(findNotes)
                .performAction();
            if (builder.isSuccessful()) {
                const responseAction = builder.getResponseAction();
                console.log(responseAction.notes); 
                action.setNotes(responseAction.notes);
            }
            const notesBuilder = await RequestBuilder.create<NotesInfo>()
                .setAction(action)
                .performAction();
            if (notesBuilder.isSuccessful()) {
                const responseAction = notesBuilder.getResponseAction();
                console.log(responseAction.getAllNoteInfo());
                setStatus(JSON.stringify(responseAction.getAllNoteInfo()));
            }
        } catch (error) {
            console.error(error); 
        }
    }
    useEffect(() => {
        GetAllDecks();
    }, [])

    
    const DeckGroup: z.infer<typeof ButtonTableItem>[] = [
        {
            name: "Get All Decks",
            onClick: GetAllDecks,
            description: "Get all the decks in the Anki"
        },
        {
            name: "Get All Decks with IDs",
            onClick: GetAllDecksWithIds,
            description: "Get all the decks with their IDs in the Anki"
        },
        {
            name: "Get All Notes",
            onClick: GetAllNotes,
            description: "Get all the notes in the Anki"
        },
        {
            name: "Get Note Info",
            onClick: GetNoteInfo,
            description: "Get all the notes info in the Anki"
        }
    ]
    
    return (
        <div className="flex flex-col">
        {DeckGroup.map((item, index) => {
            return (
                <DisplayCard key={index} name={item.name} onClick={item.onClick} description={item.description} />
            )
        })}
        </div>
    );
}

const DisplayCard = ({name, onClick, description}: z.infer<typeof ButtonTableItem>) => {
    return (
        <table className="w-full my-2">
        <tbody>
            <tr>
            <td className="px-5 py-2">
                <Label htmlFor="framework">{description}</Label>
            </td>
            <td className="text-right">
                <Button variant="brand" size="sm" onClick={onClick}>{name}</Button>
            </td>
            </tr>
        </tbody>
        </table>
    );
}