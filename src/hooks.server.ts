import fs from 'fs';
import path from "path";
import { prisma } from '$src/lib/server/prisma.js';
import type { ServerInit } from '@sveltejs/kit';
import { fileTypeFromFile, type FileTypeResult } from 'file-type';
import exifr from 'exifr';
import sharp from 'sharp';
import convert from 'heic-convert';

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
    console.log('Database Initialization finished!');
}

type imgFile = {
    name: string,
    path: string,
    type: FileTypeResult | undefined,
    createdOn: Date | null
}

export async function getImages(journeyId: string) {
    console.log('GetImages started');
    let images: {
        id: string;
        path: string;
        fileName: string;
        width: number;
        height: number;
        createdOn: Date;
        lng: number | null;
        lat: number | null;
        journeyId: string;
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
            let date = await exifr.parse(fullPath, ['DateTimeOriginal']);
            if (entry.isFile()) {
                let file: imgFile = {
                    name: entry.name,
                    path: fullPath,
                    type: await fileTypeFromFile(fullPath),
                    createdOn: date ?? null
                }
                if (file.type) {
                    if (file.type.ext === 'heic') {
                        let convertedFile =
                            await convertHEICtoJPEG(entry);
                        file = convertedFile;
                    }
                    if (file.type?.mime.includes('image') && file.type.ext.toLowerCase() != 'heic') {
                        let metaData: sharp.Metadata = await sharp(file.path).metadata();
                        let coords: {
                            latitude: number,
                            longitude: number,
                        } | undefined;
                        if (await exifr.gps(file.path)) {
                            coords = await exifr.gps(file.path);
                        }
                        images.push({
                            id: crypto.randomUUID(),
                            path: file.path,
                            fileName: file.name,
                            width: metaData.width,
                            height: metaData.height,
                            createdOn: date ?? new Date,
                            lng: coords?.longitude ?? null,
                            lat: coords?.latitude ?? null,
                            journeyId: journeyId,
                        });
                        console.log('Loaded Image into Database: ', file.path)
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

/**
 * Converts a HEIC file to JPEG format using the specified quality settings.
 * 
 * @param dirent - The fs.Dirent of the HEIC file 
 * @returns The converted JPEG file object
 * @throws Error if file reading, conversion, or writing fails
 */
export async function convertHEICtoJPEG(dirent: fs.Dirent): Promise<imgFile> {
    console.log('File Conversion started');

    if (!dirent.isFile()) {
        throw new Error('File Conversion failed: Dirent is not a file!');
    }
    const oldPath = path.join(dirent.parentPath, dirent.name);
    const inputBuffer =
        await fs.promises.readFile(oldPath);
    const outputBuffer = await convert({
        buffer: inputBuffer,
        format: 'JPEG',
        quality: 1,
    });
    const newName: string = path.parse(dirent.name).name + '.jpeg';
    const newPath: string = path.join(dirent.parentPath, newName);
    await fs.promises.writeFile(newPath, new Uint8Array(outputBuffer));
    const newFile: imgFile = {
        name: newName,
        path: newPath,
        type: await fileTypeFromFile(newPath),
    }
    fs.unlinkSync(oldPath);

    console.log('File Conversion finished!');
    console.log('Created new file at', newFile.path);
    return newFile;
}
