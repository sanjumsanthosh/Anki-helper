'use server';

import { z } from "zod";

// const URL = "http://140.245.24.43:8083";
const apiEndpoint = process.env.API_ENDPOINT || "http://localhost:8083";

const getServerURL = (path: string) => {
    return `${apiEndpoint}${path}`;
}


const getServerGenerations = async () => {
    console.log('getGenerations');
    const response = await fetch(getServerURL('/db'));
    const data = await response.json();
    return data;
}


const setServerMarkAsRead = async (id: string) => {
    const response = await fetch(getServerURL(`/db/mark?id=${id}`), {
    });
}

const setServerMarkAsUnread = async (id: string) => {
    const response = await fetch(getServerURL(`/db/mark/unread?id=${id}`), {
    });
}


const updateServerTags = async (id: string, tags: string[]) => {
    const response = await fetch(getServerURL(`/db/tag?id=${id}&tags=${tags.join(",")}`), {
        method: "POST"
    });
}

const cleanAll = async () => {
    const response = await fetch(getServerURL(`/db/clean`), {
        method: "DELETE",
        headers: {
            "Authorization" : `Bearer ${process.env.API_PASSWORD}`
        }
    });
}


const statType = z.object({
    rows: z.object({
        count: z.number()
    }),
    readRows: z.object({
        count: z.number()
    }),
    unreadRows: z.object({
        count: z.number()
    }),
    sizeInMB: z.string(),
    readRowsButWithTags: z.object({
        count: z.number()
    }),
    readRowsButWithoutTags: z.object({
        count: z.number()
    })
})



const getStats = async () => {
    const response = await fetch(getServerURL(`/db/stats`));
    let data = await response.json();
    return statType.parse(data);
}

const tagListType = z.array(z.object({
    id: z.number(),
    tag: z.string(),
    additionalJsonDetails: z.string(),
    groupTags: z.string(),
    label: z.string(),
    color: z.string()
}))


const getTagList = async () => {
    const response = await fetch(getServerURL(`/tag`));
    let data = await response.json();
    return tagListType.parse(data);
}


export {
    getServerGenerations,
    setServerMarkAsRead,
    setServerMarkAsUnread,
    updateServerTags,
    cleanAll,
    getStats,
    getTagList
}

export type statType = z.infer<typeof statType>;
export type tagListType = z.infer<typeof tagListType>;