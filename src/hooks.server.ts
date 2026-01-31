import fs from 'fs';
import path from "path";
import { prisma } from '$src/lib/server/prisma.js';
import type { ServerInit } from '@sveltejs/kit';
import { fileTypeFromFile, type FileTypeResult } from 'file-type';
import exifr from 'exifr';
import sharp from 'sharp';
import { Prisma } from '$gen/prisma/client/client';
import { stat } from "fs/promises";

export const init: ServerInit = async () => {
    await initializeDatabase();
}

type imgCreateBody = Prisma.Args<typeof prisma.image, 'create'>['data'];

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
                        data: img
                    });
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

async function getImages(journeyId: string) {
    console.log('GetImages started: Getting Images for: ', journeyId);
    let images: Array<imgCreateBody> = [];
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
                let type: FileTypeResult | undefined = await fileTypeFromFile(fullPath);
                if (type?.mime.includes('image')) {
                    let name = entry.name,
                        path = fullPath,
                        metaData: sharp.Metadata = await sharp(path).metadata(),
                        coords: {
                            latitude: number,
                            longitude: number,
                        } | undefined;
                    if (await exifr.gps(path)) {
                        coords = await exifr.gps(path);
                    }
                    // exifr.parse(path, ['DateTimeOriginal']) returns an Object: { DateTimeOriginal: string }
                    let exifrDates: {
                        DateTimeOriginal: string;
                        CreateDate: string;
                        ModifyDate: string;
                    } = await exifr.parse(path, ['DateTimeOriginal', 'CreateDate', 'ModifyDate']);
                    let createdOn: Date;
                    if (exifrDates) {
                        createdOn = new Date(exifrDates.DateTimeOriginal ?? exifrDates.CreateDate ?? exifrDates.ModifyDate);
                    } else {
                        let systemDates = await stat(path);
                        if (systemDates) {
                            createdOn = new Date(systemDates.birthtime ?? systemDates.mtime ?? systemDates.ctime);
                        } else {
                            createdOn = new Date(Date.now());
                            console.log(`No valid Date found for ${path} in exifr or system data, using fallback Date.now()`);
                        }
                    }
                    let imgData: imgCreateBody = {
                        path: path,
                        fileName: name,
                        fileType: type.ext,
                        createdOn: createdOn,
                        width: metaData.width,
                        height: metaData.height,
                        lng: coords?.longitude ?? null,
                        lat: coords?.latitude ?? null,
                        journeyId: journeyId,
                    }
                    images.push(imgData);
                    console.log('Loaded Image: ', path)
                }
                else { console.log('Skipped file as it is not an image: ', entry.name) }

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
