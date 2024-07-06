'use server';

import { z } from "zod";
import { Post, PrismaClient, Tag } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate'
import { Logger } from "@/lib/logger";


const apiEndpoint = process.env.API_ENDPOINT || "http://localhost:8083";


const prisma = new PrismaClient().$extends(withAccelerate());

const getServerURL = (path: string) => {
    return `${apiEndpoint}${path}`;
}


const getServerGenerations = async (): Promise<({tags: Tag[]}&Post)[]> => {
    const generations = await prisma.post.findMany(
        {
            include: {
                tags: true
            },
            cacheStrategy: {ttl: 60 },
        },
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
    const generations = await prisma.post.deleteMany({
        where: {
            read: true,
            tags: {
                none: {}
            }
        }
    });
}

const cleanAllCount = async () => {
    const count = await prisma.post.count({
        where: {
            read: true,
            tags: {
                none: {}
            }
        },
        cacheStrategy: {ttl: 60 }
    });
    return count;
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
    getTagList,
    cleanAllCount
}

export type statType = z.infer<typeof statType>;
export type tagListType = z.infer<typeof tagListType>;
export type DBRecordType = z.infer<typeof DBRecord>;