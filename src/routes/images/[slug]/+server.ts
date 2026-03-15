import { existsSync, readFileSync } from 'fs';
import { prisma } from '$lib/server/prisma.js';

export const GET = async ({ params }) => {
    const id = params.slug;
    try {
        const img = await prisma.image.findUnique({
            where: {
                id: id,
            },
            select: {
                path: true,
            }
        })
        if (!img) throw new Error('Image does not exist in the Database!');
        if (!existsSync(img.path)) throw new Error('404: File not found!');

        const file = readFileSync(img?.path);

        return new Response(file);
    } catch (err) {
        throw err;
    }
}