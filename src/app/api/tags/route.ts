 
import { PrismaClient } from '@prisma/client';

export async function POST(req: Request, res: Response) {
    return CreateNewTag(req, res);
}

export async function GET(req: Request, res: Response) {
    return GetAllTags(req, res);
}

export async function DELETE(req: Request, res: Response) {
    return DeleteTag(req, res);
}

export async function PUT(req: Request, res: Response) {
    return UpdateTag(req, res);
}

async function CreateNewTag(req: Request, res: Response) {
    const prisma = new PrismaClient();
    const { tag, additionalJsonDetails, label, color } = await req.json();
    if (!tag || !label || !color) {
        return Response.json({ message: 'Missing required fields' },{status: 400});
    }
    const tagDetails = await prisma.tag.create({
        data: {
            tag,
            additionalJsonDetails,
            label,
            color
        }
    });

    return Response.json(tagDetails);
}

async function GetAllTags(req: Request, res: Response) {
    const prisma = new PrismaClient();
    const tags = await prisma.tag.findMany();
    return Response.json(tags);
}

async function DeleteTag(req: Request, res: Response) {
    const prisma = new PrismaClient();
    const { tag } = await req.json();
    if (!tag) {
        return Response.json({ message: 'Missing required fields' },{status: 400});
    }
    await prisma.tag.delete({
        where: {
            tag: tag
        }
    });

    return Response.json({ message: 'Tag deleted successfully' });
}

async function UpdateTag(req: Request, res: Response) {
    const prisma = new PrismaClient();
    const { tag, additionalJsonDetails, label, color } = await req.json();
    if (!tag || !label || !color) {
        return Response.json({ message: 'Missing required fields' },{status: 400});
    }
    await prisma.tag.update({
        where: {
            tag: tag
        },
        data: {
            additionalJsonDetails,
            label,
            color
        }
    });

    return Response.json({ message: 'Tag updated successfully' });
}

// // tag 1
// {
//     "tag": "add2anki",
//     "label": "Add to Anki",
//     "color": "#FFC400"
// }

// // tag 3
// {
//     "tag": "obsidian",
//     "label": "Add in Obsidian",
//     "color": "#6b4aff"
// }

// // tag 4
// {
//     "tag": "ipad",
//     "label": "Read in ipad",
//     "color": "#00c023"
// }

// // tag 5
// {
//     "tag": "explore",
//     "label": "Explore",
//     "color": "#be30ff"
// }

// // tag 7
// {
//     "tag": "good-resources",
//     "label": "Contains Good resources",
//     "color": "#631273"
// }

// // tag 8
// {
//     "tag": "note-it-down",
//     "label": "Note it down",
//     "color": "#05604B"
// }

// // tag 9
// {
//     "tag": "long-term",
//     "label": "Long Term",
//     "color": "#044A86"
// }

// // tag 10
// {
//     "tag": "project-idea",
//     "label": "Project Idea",
//     "color": "#9A0183"
// }

// // tag 11
// {
//     "tag": "who-made-this",
//     "label": "Who made this?",
//     "color": "#9A0101"
// }

