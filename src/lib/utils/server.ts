import { type FileTypeResult } from 'file-type';
import { fileTypeFromFile } from 'file-type';
import sharp from 'sharp';
import exifr from 'exifr';
import { stat } from 'fs/promises';
import type { Prisma } from '@prisma/client';
import { existsSync } from 'fs';

export type imgCreateBody = Prisma.Args<typeof prisma.image, 'create'>['data'];

export async function getImageData(name: string, path: string, journeyId: string): Promise<imgCreateBody> {
    if(!existsSync(path)) throw Error('404: Image not found!');
    let type: FileTypeResult | undefined = await fileTypeFromFile(path);
    if (type?.mime.includes('image')) {
        let metaData: sharp.Metadata = await sharp(path).metadata(),
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
        return imgData;
    }
    else {
        console.log('Skipped file as it is not an image: ', name);
        return null;
    }
}