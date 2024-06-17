import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest, res: Response) {
    return CreateNewRecord(req, res);
}

async function CreateNewRecord(req: NextRequest, res: Response) {
    const prisma = new PrismaClient();
    const { url, data, title } = await req.json();
    if (!url || !data) {
        return Response.json({ message: 'Missing required fields' },{status: 400});
    }
    const searchParams = await req.nextUrl.searchParams;
    const tags = searchParams.get('tags') || '';

    
    const record = await prisma.post.create({
        data: {
            title: title || url,
            url,
            content: data,
            tags: {
                connectOrCreate: tags.split(',').map(tag => {
                    return {
                        where: { tag },
                        create: { tag }
                    }
                })
            }
        }
    });

    return Response.json(record);
}