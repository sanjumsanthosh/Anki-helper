import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest, res: Response) {
    return CreateNewRecord(req, res);
}

async function CreateNewRecord(req: NextRequest, res: Response) {
    const prisma = new PrismaClient();
    const blob = await req.blob();
    let text = (await blob.text()).toString()
    const urlPattern = /"url"\s*:\s*"([^"]*)"/;
    const dataPattern = /"data"\s*:\s*"([^"]*)"/;
    const titlePattern = /"title"\s*:\s*"([^"]*)"/;

    // Extract values using regex
    const urlMatch = text.match(urlPattern);
    const dataMatch = text.match(dataPattern);
    const titleMatch = text.match(titlePattern);

    // Extracted values
    const url = urlMatch ? urlMatch[1] : null;
    const data = dataMatch ? dataMatch[1] : null;
    const title = titleMatch ? titleMatch[1] : null;

    // Validate required fields
    if (!url || !data) {
        return { message: 'Missing required fields', status: 400 };
    }
    const searchParams = await req.nextUrl.searchParams;
    const tags = searchParams.get('tags');
    let record;
    if (!tags) {
        record = await prisma.post.create({
            data: {
                title: title || url,
                url,
                content: data
            }
        });
    } else {
        record = await prisma.post.create({
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
    }

    return Response.json({
        message: 'Record created. Id = ' + record.id,
        status: 201
    });
}