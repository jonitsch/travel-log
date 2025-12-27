import { json } from '@sveltejs/kit';
import { getImgURI } from '$src/lib/server/imgproxy.js';
import { env } from '$env/dynamic/private';
import path from 'path';
import { createHmac } from 'node:crypto';

export async function GET(src) {
    let source = src.url.searchParams.get('src')?.replace(/\\/g, "/");
    console.log(source)

    const KEY = env.IMGPROXY_KEY
    const SALT = env.IMGPROXY_SALT

    const hexDecode = (hex: string) => Buffer.from(hex, 'hex')

    const sign = (salt: string, target: string, secret: string) => {
        const hmac = createHmac('sha256', hexDecode(secret))
        hmac.update(hexDecode(salt))
        hmac.update(target)

        return hmac.digest('base64url')
    }

    const path = `/rs:fit:300:300/plain/local:///${source}`

    const signature = sign(SALT, path, KEY)
    const result = `${env.IMGPROXY_URL}/${signature}${path}`
    return json(result);
}

