import { prisma } from '$lib/server/database.js';
import { json } from '@sveltejs/kit';
import fs from 'fs';
import path from "path";
import { fileTypeFromFile } from 'file-type';
import exifr from 'exifr';
import convert from 'heic-convert';

export async function GET(dir) {
    let dirString = dir.url.search.split('=')[1]
    let images: {
        name: string,
        type: string,
        mime: string,
        path: string,
        hasGPS: boolean,
        lng?: number,
        lat?: number,
    }[] = [];
    let entries = await fs.promises.readdir(dirString, { withFileTypes: true, recursive: true });
    for (const entry of entries) {
        if (entry.isFile()) {
            let fullPath = path.join(entry.parentPath, entry.name);
            let fileType = await fileTypeFromFile(fullPath);
            if (fileType) {
                let fullPathExt = path.join(fullPath, fileType.ext)
                if (fileType.mime.includes('image') && fileType.ext != 'heic') {
                    if (await exifr.gps(fullPath)) {
                        let { latitude, longitude } = await exifr.gps(fullPath)
                        images.push({
                            name: entry.name,
                            type: fileType.ext,
                            mime: fileType.mime,
                            path: fullPath,
                            hasGPS: true,
                            lng: longitude,
                            lat: latitude,
                        });
                    }
                    else {
                        images.push({
                            name: entry.name,
                            type: fileType.ext,
                            mime: fileType.mime,
                            path: fullPath,
                            hasGPS: false,
                        });
                    }
                }
                else if (fileType.ext === 'heic') {
                    let lat: number = 0, lng: number = 0
                    if (await exifr.gps(fullPath)) {
                        let { latitude, longitude } = await exifr.gps(fullPath);
                        lat = latitude;
                        lng = longitude;
                    }
                    try {
                        (async () => {
                            const inputBuffer = await fs.promises.readFile(fullPath);
                            const outputBuffer = await convert({
                                buffer: inputBuffer.buffer, // the HEIC file buffer
                                format: 'JPEG',      // output format
                                quality: 1           // the jpeg compression quality, between 0 and 1
                            });
                            await fs.promises.writeFile(`${entry.parentPath}${entry.name}.jpeg`, new Uint8Array(outputBuffer));
                            fullPath = `${entry.parentPath}${entry.name}.jpeg`;
                        })()
                    } catch (err) {
                        console.error(err);
                    } finally {
                        images.push({
                            name: entry.name,
                            type: fileType.ext,
                            mime: fileType.mime,
                            path: fullPath,
                            hasGPS: true,
                            lng: lng,
                            lat: lat,
                        });
                    }
                }
            }
        }
    }
    return json(images);
}

