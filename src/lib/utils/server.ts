import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';
import exifr from 'exifr';
import { stat } from 'fs/promises';
import type { Prisma } from '@prisma/client';
import { existsSync } from 'fs';
import { env } from '$env/dynamic/private';
import { join } from 'path';

export type imgCreateBody = Prisma.Args<typeof prisma.image, 'create'>['data'];

export async function getImageData(
	name: string,
	buffer: Buffer,
	journeyId: string
): Promise<imgCreateBody> {
	if (!buffer) throw Error('No buffer specified!');
	let type = await fileTypeFromBuffer(buffer).catch((err) => console.error(err));
	if (!type) return Error('File Type could not be determined!');
	let metaData: sharp.Metadata = await sharp(buffer).metadata(),
		coords:
			| {
					latitude: number;
					longitude: number;
			  }
			| undefined;
	if (await exifr.gps(buffer)) {
		coords = await exifr.gps(buffer);
	}
	// exifr.parse(path, ['DateTimeOriginal']) returns an Object: { DateTimeOriginal: string }
	let exifrDates: {
		DateTimeOriginal: string;
		CreateDate: string;
		ModifyDate: string;
	} = await exifr.parse(buffer, ['DateTimeOriginal', 'CreateDate', 'ModifyDate']);
	let createdOn: Date;
	if (exifrDates) {
		createdOn = new Date(
			exifrDates.DateTimeOriginal ?? exifrDates.CreateDate ?? exifrDates.ModifyDate
		);
	} else {
		createdOn = new Date();
		console.log(`No valid Date found within buffer, using fallback Date.now()`);
	}

	let imgData: imgCreateBody = {
		fileName: name,
		fileType: type.ext,
		createdOn: createdOn,
		width: metaData.width,
		height: metaData.height,
		lng: coords?.longitude ?? null,
		lat: coords?.latitude ?? null,
		journeyId: journeyId
	};
	return imgData;
}

export function getImagePath(id: string, journeyId: string): string {
	return join(env.IMAGE_FOLDER_PATH, journeyId, id);
}
