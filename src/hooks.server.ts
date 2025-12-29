import fs from 'fs';
import path from "path";
import { prisma } from '$src/lib/server/prisma.js';
import type { ServerInit } from '@sveltejs/kit';
import { fileTypeFromFile, type FileTypeResult } from 'file-type';
import exifr from 'exifr';
import sharp from 'sharp';
import type { Prisma } from '$gen/prisma/client/client';

export const init: ServerInit = async () => {
    await initializeDatabase();
}

async function initializeDatabase() {
    console.log('Database Initialization started');
    let images = await prisma.image.findMany();
    if (images) {
        await prisma.image.deleteMany();
        try {
            await prisma.image.deleteMany();
            let journeys = await prisma.journey.findMany();
            for (const j of journeys) {
                let journeyImages = await getImages(j.journeyId);
                for (const img of journeyImages) {
                    await prisma.image.create({
                        data: {
                            path: img.path,
                            fileName: img.fileName,
                            width: img.width,
                            height: img.height,
                            lng: img.lng ?? null,
                            lat: img.lat ?? null,
                            journeyId: img.journeyId,
                            createdOn: img.createdOn,
                            fileType: img.fileType,
                        }
                    })
                }
            }
        }
        catch (err) {
            images = [];
            console.log('Database Initialization failed', err)
            console.error(err)
        }
    }
    images = [];
    console.log('Database Initialization finished!');
}

type imgFile = {
    name: string,
    path: string,
    type: FileTypeResult | undefined,
}

export async function getImages(journeyId: string) {
    console.log('GetImages started: Getting Images for: ', journeyId);
    let images: {
        id: string;
        journeyId: string;
        lng: number | null;
        lat: number | null;
        path: string;
        fileName: string;
        fileType: string | null;
        createdOn: Date | null;
        width: number;
        height: number;
    }[] = [];
    try {
        let dir = `pictures/${journeyId}`
        if (!fs.existsSync(dir)) {
            return images;
        };
        let entries = await fs.promises.readdir(`pictures/${journeyId}`, {
            withFileTypes: true,
            recursive: true,
        });
        for (const entry of entries) {
            let fullPath = path.join(entry.parentPath, entry.name);
            if (entry.isFile()) {
                let file: imgFile = {
                    name: entry.name,
                    path: fullPath,
                    type: await fileTypeFromFile(fullPath),
                }
                if (file.type) {
                    if (file.type?.mime.includes('image')) {
                        let metaData: sharp.Metadata = await sharp(file.path).metadata();
                        let coords: {
                            latitude: number,
                            longitude: number,
                        } | undefined;
                        if (await exifr.gps(file.path)) {
                            coords = await exifr.gps(file.path)
                        }
                        let createdOn: {
                            DateTimeOriginal: Date
                        } = await exifr.parse(file.path, ['DateTimeOriginal']);
                        images.push({
                            id: crypto.randomUUID(),
                            path: file.path,
                            fileName: file.name,
                            fileType: file.type.ext,
                            createdOn: createdOn.DateTimeOriginal ?? null,
                            width: metaData.width,
                            height: metaData.height,
                            lng: coords?.longitude ?? null,
                            lat: coords?.latitude ?? null,
                            journeyId: journeyId,
                        });
                        console.log('Loaded Image: ', file.path)
                    }
                    else { console.log('Skipped file as it is not an image: ', file.path) }
                }
            }
            else { console.log('Skipped entry as it is not a file: ', fullPath) }
        };
    } catch (err) {
        console.log('GetImages failed', err)
        console.error(err);
    } finally {
        console.log('GetImages finished!')
        return images;
    }
}
