import { prisma, type Journey } from '$lib/server/database.js';
import { json } from '@sveltejs/kit';
import fs from 'fs';
import path from "path";
import { fileTypeFromFile } from 'file-type';
import exifr from 'exifr';
import convert from 'heic-convert';
import type { ServerInit } from '@sveltejs/kit';
import sharp from 'sharp';

export const init: ServerInit = async () => {
    await initializeDatabase();
}

async function initializeDatabase() {
    console.log('Database Initialization started')
    let images = await prisma.image.findMany();
    if (images) {
        try {
            await prisma.image.deleteMany();
            let journeys = await prisma.journey.findMany();
            journeys.forEach(async (j) => {
                let journeyImages = await getImages(j.journeyId);
                journeyImages.forEach(async (img) => {
                    await prisma.image.create({
                        data: {
                            path: img.path,
                            fileName: img.fileName,
                            width: img.width,
                            height: img.height,
                            lng: img.lng ?? null,
                            lat: img.lat ?? null,
                            journeyId: img.journeyId,
                        }
                    })
                })
            })
        }
        catch (err) {
            images = [];
            console.log('Database Initialization failed', err)
            console.error(err)
        }
    }
    images = [];
    console.log('Database Initialization finished')
}

export async function getImages(journeyId: string) {
    console.log('GetImages started')
    if (await prisma.image.findMany()) {
        await prisma.image.deleteMany();
    }
    let dir = `pictures/${journeyId}`
    let images: {
        path: string;
        fileName: string;
        width: number;
        height: number;
        lng: number | null;
        lat: number | null;
        journeyId: string;
    }[] = [];
    if (!fs.existsSync(dir)) {
        return images;
    };
    let entries = await fs.promises.readdir(`pictures/${journeyId}`, {
        withFileTypes: true,
        recursive: true
    });
    entries.forEach(async (entry) => {
        if (entry.isFile()) {
            let fullPath = path.join(entry.parentPath, entry.name);
            let fileType = await fileTypeFromFile(fullPath);
            let metaData = await sharp(fullPath).metadata();
            console.log('Loaded Image: ', fullPath)
            if (fileType) {
                if (fileType.mime.includes('image') && fileType.ext != 'heic') {
                    let coords: any;
                    if (await exifr.gps(fullPath)) {
                        coords = await exifr.gps(fullPath)
                    }
                    images.push({
                        path: fullPath,
                        fileName: entry.name,
                        width: metaData.width,
                        height: metaData.height,
                        lng: coords?.latitude ?? null,
                        lat: coords?.longitude ?? null,
                        journeyId: journeyId,
                    });
                }
                /*                 else if (fileType.ext === 'heic') {
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
                                        console.log('GetImages failed', err)
                                        console.error(err);
                                    } finally {
                                        let { latitude, longitude } = await exifr.gps(fullPath);
                                        images.push({
                                            path: fullPath,
                                            fileName: entry.name,
                                            width: metaData.width,
                                            height: metaData.height,
                                            lng: latitude ?? null,
                                            lat: longitude ?? null,
                                            journeyId: entry.parentPath.split('\\\\')[1],
                                        });
                                    }
                                } */
            }
        }
    });
    console.log('GetImages finished!')
    return images;
}

