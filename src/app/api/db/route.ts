import { Post, PrismaClient, Tag } from "@prisma/client";
import { NextRequest } from "next/server";


export async function GET(req: NextRequest, res: Response) {
    return GetRecords(req, res);
}

export async function POST(req: NextRequest, res: Response) {
    return CreateMultipleRecords(req, res);
}

async function GetRecords(req: NextRequest, res: Response) {

    const prisma = new PrismaClient();

    const searchParams = await req.nextUrl.searchParams;
    const type = searchParams.get('type');
    
    switch (type) {
        case 'tags':
            const tags = await prisma.tag.findMany();
            return Response.json(tags);
        case 'posts':
            const posts = await prisma.post.findMany();
            return Response.json(posts);
        default:
            return Response.json({ message: 'Invalid type' },{status: 400});
    }
}

async function CreateMultipleRecords(req: NextRequest, res: Response) {
    const prisma = new PrismaClient();
    
    const searchParams = await req.nextUrl.searchParams;
    const type = searchParams.get('type');

    const record = await req.json();

    if (!record || !type) {
        return Response.json({ message: 'Missing required fields' },{status: 400});
    }

    switch (type) {
        case 'tags':
            const parsedTags = record as Tag[];
            for (const tag of parsedTags) {
                if (!tag.tag || !tag.label || !tag.color) {
                    return Response.json({ message: 'Missing required fields' },{status: 400});
                }
            }
            const tags = await prisma.tag.createMany({
                data: parsedTags
            });
            return Response.json({ message: 'Record created' },{status: 201});
        case 'posts':
            const parsedPosts = record as Post[];
            for (const post of parsedPosts) {
                if (!post.url || !post.content) {
                    return Response.json({ message: 'Missing required fields' },{status: 400});
                }
            }
            const posts = await prisma.post.createMany({
                data: parsedPosts
            });
            return Response.json({ message: 'Record created' },{status: 201});
        default:
            return Response.json({ message: 'Invalid type' },{status: 400});
    }

    
}