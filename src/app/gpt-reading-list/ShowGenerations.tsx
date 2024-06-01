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

export default function ShowGenerations() {


    const [generations, setGenerations] = useState<z.infer<typeof DBRecord>[]>([]);
    const [loading, setLoading] = useState(true);

    const getGenerations = async () => {
        const response = await fetch('http://140.245.24.43:8083/db');
        const data = await response.json();
        setGenerations(data);
        setLoading(false);
    }

    const markAsRead = async (id: string) => {
        const response = await fetch(`http://140.245.24.43:8083/db/mark?id=${id}`, {
        });
        getGenerations();
    }

    const markAsUnread = async (id: string) => {
        const response = await fetch(`http://140.245.24.43:8083/db/mark/unread?id=${id}`, {
        });
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
            <h1>Generations</h1>
                {generations.map((generation, index) => {
                    return (
                        <Card key={index} className="w-full m-4 py-2">
                            <CardHeader>
                                <CardTitle>
                                    <CardDescription>
                                        <Link href={generation.url} className="text-lg">
                                        {generation.url}
                                        </Link>
                                    </CardDescription>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid w-full items-center gap-4">
                                    <div className="flex flex-col space-y-1.5">
                                        <ReactMarkdown className="leading-loose tracking-wide">
                                            {generation.data}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Label htmlFor="framework">Tags: {generation.tags} | {generation.id}</Label>
                                {
                                    generation.read 
                                    ? <Button variant="destructive" onClick={()=>markAsUnread(generation.id)}>Mark unread</Button>
                                    : <Button variant="success" onClick={()=>markAsRead(generation.id)}>Mark read</Button>
                                }
                            </CardFooter>
                        </Card>
                    )
                }
            )}
        </div>
    )
}