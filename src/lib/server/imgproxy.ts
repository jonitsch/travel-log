import { Imgproxy } from 'imgproxy';
import { env } from '$env/dynamic/private';
import crypto from 'crypto';

export const imgproxy = new Imgproxy({
  baseUrl: process.env.IMGPROXY_URL ?? '',
  key: env.IMGPROXY_KEY ?? '',
  salt: env.IMGPROXY_SALT ?? '',
  encode: true,
});

export async function getImgURI(src: string, width: number, height: number): Promise<string> {
  return imgproxy
    .builder()
    .resize('fill', width, height)
    .generateUrl(src);
}
