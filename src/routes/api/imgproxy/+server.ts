import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { createHmac } from 'node:crypto';


export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const src = searchParams.get("src")?.replace(/\\/g, "/").replace('pictures/', '');
    if (!src) throw new Error('ImgProxy API called without specifying image source!');

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
    const target = `/rs:fit:${width}:${height}/plain/local:///${encodeURI(src)}@${format}`;
    const signature = sign(SALT, target, KEY);

    const result = `${env.IMGPROXY_URL}/${signature + target}`;
    return json(result);
}

