import { json, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { createHmac } from 'node:crypto';
import { dev } from '$app/environment';
import { prisma } from '$lib/server/prisma.js';


export async function GET({ url, locals }) {
    const user = locals.user;
    if (!user) throw redirect(303, '/auth/login');

    const { searchParams } = new URL(url);
    let id = searchParams.get("id");
    if (!id) throw new Error('ImgProxy API called without specifying image id!');

    if (!dev) return json(`${env.BETTER_AUTH_BASE_URL}/images/${id}`);

    let img = await prisma.image.findUnique({
        where: { id },
        select: {
            journeyId: true
        }
    });
    if (!img) throw new Error('The specified img id does not exist in the database!');

    const src = `local:///${img.journeyId}/${id}`;

    // optional parameters with default values
    const width = searchParams.get("width") ?? '300';
    const height = searchParams.get("height") ?? '300';
    const format = searchParams.get("format") ?? 'webp';

    const KEY = env.IMGPROXY_KEY;
    const SALT = env.IMGPROXY_SALT;
    const hexDecode = (hex: string) => Buffer.from(hex, 'hex');

    const sign = (salt: string, target: string, secret: string) => {
        const hmac = createHmac('sha256', hexDecode(secret));
        hmac.update(hexDecode(salt));
        hmac.update(target);
        return hmac.digest('base64url');
    }
    const target = `/rs:fit:${width}:${height}/plain/${encodeURI(src)}@${format}`;
    const signature = sign(SALT, target, KEY);

    const result = `${env.IMGPROXY_URL}/${signature + target}`;
    return json(result);
}

