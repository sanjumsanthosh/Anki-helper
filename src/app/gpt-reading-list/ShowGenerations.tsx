'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import {z} from 'zod';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { Label } from '@/components/ui/label';


const DBRecord = z.object({
    id: z.string(),
    url: z.string(),
    data: z.string(),
    date: z.string(),
    read: z.number(),
    tags: z.string()
})

export default function ShowGenerations({getServerGenerations, setServerMarkAsRead, setServerMarkAsUnread}) {


    const [generations, setGenerations] = useState<z.infer<typeof DBRecord>[]>([]);
    const [loading, setLoading] = useState(true);

    const getGenerations = async () => {
        const response = await getServerGenerations();
        setGenerations(response);
        setLoading(false);
    }

    const markAsRead = async (id: string) => {
        const response = await setServerMarkAsRead(id);
        getGenerations();
    }

    const markAsUnread = async (id: string) => {
        const response = await setServerMarkAsUnread(id);
        getGenerations();
    }

    useEffect(() => {
        getGenerations();
    }   , [])

    if (loading) {
        return <h1>Loading...</h1>
    }

    return (
        <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl">Generations</h1>
            {generations.map((generation, index) => {
                return (
                    <Card key={index} className="m-2 py-2">
                        <CardHeader>
                            <CardTitle>
                                <CardDescription>
                                    <Link href={generation.url} className="text-sm sm:text-base md:text-lg w-5">
                                        {generation.url}
                                    </Link>
                                </CardDescription>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid items-center gap-2 sm:gap-4">
                                <div className="flex flex-col space-y-1 sm:space-y-1.5">
                                    <ReactMarkdown className="overflow-auto leading-tight sm:leading-normal tracking-tighter sm:tracking-normal whitespace-normal">
                                        {generation.data}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col sm:flex-row justify-between">
                            <Label htmlFor="framework" className="mb-2 sm:mb-0">Tags: {generation.tags} | {generation.id}</Label>
                            {
                                generation.read 
                                ? <Button variant="destructive" onClick={()=>markAsUnread(generation.id)}>Mark unread</Button>
                                : <Button variant="success" onClick={()=>markAsRead(generation.id)}>Mark read</Button>
                            }
                        </CardFooter>
                    </Card>
                )
            })}
        </div>
    )
}