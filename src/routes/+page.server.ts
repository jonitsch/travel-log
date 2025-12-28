import type { PageServerLoad, Actions } from './$types';
import { createRequire } from 'module';
import { prisma, type Journey } from '$src/lib/server/prisma';
const require = createRequire(import.meta.url);

export const load = (async () => {
    const journeys: Journey[] = await prisma.journey.findMany({
        select: {
            journeyId: true,
            name: true,
            color: true,
            lng: true,
            lat: true,
            marker: true,
            image: true,
        }
    })
    return { journeys };
}) satisfies PageServerLoad;

async function filterAndConvertHEIC(files: string[]) {
    const { promisify } = require('util');
    const fs = require('fs');
    const convert = require('heic-convert');
    let heicFiles = files.filter((file) => file.split('.')[1] == 'HEIC')
    // convert heicFiles into jpegs
    heicFiles.forEach((file) => {
        (async () => {
            const inputBuffer = await promisify(fs.readFile)(file);
            const outputBuffer = await convert({
                buffer: inputBuffer, // the HEIC file buffer
                format: 'JPEG',      // output format
                quality: 1           // the jpeg compression quality, between 0 and 1
            });
            let filePath = file.split('.')[0]
            await promisify(fs.writeFile)(`${filePath}.jpg`, outputBuffer);
        });
        fs.unlinkSync(file)
    })
    return files;
}

export const actions = {
    /*     addJourney: async ({ request }) => {
            const data = await request.formData();
            const name = data.get('name')?.toString() ?? '';
            const lng = parseFloat(data.get('lng')?.toString() ?? '0');
            const lat = parseFloat(data.get('lat')?.toString() ?? '0');
    
            try {
                const journey = await prisma.journey.create({
                    data: {
                        name: name,
                    }
                })
                return { success: true }
            } catch (err) {
                return err
            }
        }, */
    getMarkers: async ({ request }) => {
        const data = await request.formData();
        const journeyId = data.get('journeyId')?.toString()
        try {
            let markers = await prisma.marker.findMany(
                {
                    include: {
                        journey: {
                            select: {
                                color: true
                            }
                        }
                    },
                    where: {
                        journeyId: journeyId
                    }
                }
            )
            return markers;
        } catch (err) {
            return err
        }
    }
} satisfies Actions;