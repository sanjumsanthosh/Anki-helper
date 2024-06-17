'use server';

import { z } from "zod";
import { Post, PrismaClient, Tag } from '@prisma/client';
// const URL = "http://140.245.24.43:8083";
const apiEndpoint = process.env.API_ENDPOINT || "http://localhost:8083";


const prisma = new PrismaClient();

const getServerURL = (path: string) => {
    return `${apiEndpoint}${path}`;
}


const getServerGenerations = async (): Promise<({tags: Tag[]}&Post)[]> => {
    console.log('getGenerations');
    const generations = await prisma.post.findMany(
        {
            include: {
                tags: true
            }
        }
    );
    return generations;
}



const setServerMarkAsRead = async (id: string) => {
    const generations = await prisma.post.update({
        where: { id: id },
        data: { read: true }
    });
}

const setServerMarkAsUnread = async (id: string) => {
    const generations = await prisma.post.update({
        where: { id: id },
        data: { read: false }
    });
}


const updateServerTags = async (id: string, tags: string[]) => {
    const Tags = tags.map(tag => {
        return {
            tag: tag
        }
    })
    const generations = await prisma.post.update({
        where: { id: id },
        data: {
            tags: {
                set: Tags
            }
        }
    });
}

const cleanAll = async () => {
    // const response = await fetch(getServerURL(`/db/clean`), {
    //     method: "DELETE",
    //     headers: {
    //         "Authorization" : `Bearer ${process.env.API_PASSWORD}`
    //     }
    // });
    const generations = await prisma.post.deleteMany();
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

const DBRecord = z.object({
    id: z.string(),
    url: z.string(),
    data: z.string(),
    date: z.string(),
    read: z.number(),
    tags: z.string()
})



const getStats = async () => {
    // const response = await fetch(getServerURL(`/db/stats`));
    // let data = await response.json();
    // return statType.parse(data);
    return {
        rows: {
            count: 0
        },
        readRows: {
            count: 0
        },
        unreadRows: {
            count: 0
        },
        sizeInMB: "0",
        readRowsButWithTags: {
            count: 0
        },
        readRowsButWithoutTags: {
            count: 0
        }
    
    }
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
    // const response = await fetch(getServerURL(`/tag`));
    // let data = await response.json();
    // return tagListType.parse(data);
    const tags = await prisma.tag.findMany();
    return tags;
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
export type DBRecordType = z.infer<typeof DBRecord>;