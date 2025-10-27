import { prisma } from '$lib/server/database.js';
import { json } from '@sveltejs/kit';
import fs from 'fs';
import path from "path";
import { fileTypeFromFile } from 'file-type';
import exifr from 'exifr'

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
            const fullPath = path.join(entry.parentPath, entry.name);
            const fileType = await fileTypeFromFile(fullPath)
            if (fileType) {
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
            }
        }
    }
    return json(images);
}

