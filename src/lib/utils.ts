import type { Journey } from '$lib/server/prisma';
import type { FeatureCollection, GeoJsonProperties, Geometry, LineString } from 'geojson';
import { type LngLatBoundsLike } from 'maplibre-gl';
import { global } from '$lib/state.svelte';

export function switchToOverview() {
    const map = global.map;
    if (map) {
        map.setProjection({ type: 'globe' })
        if (global.savedViewPort?.center && global.savedViewPort?.zoom) {
            map.flyTo({
                center: global.savedViewPort.center,
                zoom: global.savedViewPort.zoom,
                speed: 1.5
            });
        } else {
            map.flyTo({
                center: [13.388, 52.517],
                zoom: 1.5,
                speed: 1
            });
        }
    } else {
        throw new Error('Map not found!');
    }
    global.savedViewPort = null;
    global.journeyData = null;
    global.journeyId = undefined;
    global.loadingJourney = false;
    global.viewMode = 'overview';
}

export async function switchToJourneyMode(journeyId: string): Promise<{
    journey: Journey | null;
    bbox: maplibregl.LngLatBoundsLike | null;
    geoJSON: FeatureCollection<Geometry, GeoJsonProperties> | null;
} | null> {
    const journey = await getJourneyData(journeyId);
    const map = global.map;
    if (map && journey) {
        map.setProjection({ type: 'mercator' })
        const bbox = await getBBox(journey);
        if (bbox) {
            map.fitBounds(bbox, {
                padding: {
                    top: 90,
                    bottom: 150,
                    left: 90,
                    right: 90
                },
                duration: 500,
            });
        } else {
            map.flyTo({
                center: [journey.lng, journey.lat],
                zoom: map.getZoom(),
            });
        }
        const geoJSON = await buildGeoJSON(journey);
        const data = {
            journey: journey,
            bbox: bbox,
            geoJSON: geoJSON
        };
        return data;
    }
    return null;
}

export async function getJourneyData(journeyId: string): Promise<Journey | null> {
    try {
        const res = await fetch(`/api/journeys?journeyId=${journeyId}`);
        global.journeyData = await res.json();
        if (global.journeyData?.image) {
            global.journeyData.image.sort((a, b) => {
                if (a.createdOn < b.createdOn) {
                    return -1;
                } else if (a.createdOn > b.createdOn) {
                    return 1;
                } else {
                    return 0;
                }
            });
        }
        const journey = global.journeyData;
        return journey;
    } catch (err) {
        throw err;
    }
}
export async function buildGeoJSON(journey: Journey): Promise<FeatureCollection | null> {
    let geoJSON: FeatureCollection = {
        type: 'FeatureCollection',
        features: []
    };
    if (journey.image) {
        const images = journey.image.filter((img) => {
            return img.lat && img.lng;
        });
        if (images.length > 0) {
            let lineString: LineString = {
                type: 'LineString',
                coordinates: []
            };
            for (const img of images) {
                lineString.coordinates.push([img.lng!, img.lat!]);
            }
            geoJSON.features.push({
                type: 'Feature',
                geometry: lineString,
                properties: {}
            });
            return geoJSON;
        }
    }
    return null;
}
export function getBBox(journey: Journey): LngLatBoundsLike | null {
    if (journey.image.length === 0) return null;
    let lngs: Array<number> = [];
    let lats: Array<number> = [];
    if (journey.image) {
        const images = journey.image.filter((img) => {
            return img.lat && img.lng;
        });
        for (const img of images) {
            lngs.push(img.lng!);
            lats.push(img.lat!);
        }
    }
    if (journey.marker) {
        for (const marker of journey.marker) {
            lngs.push(marker.lng);
            lats.push(marker.lat);
        }
    }
    if (lngs.length > 0 && lats.length > 0) {
        const bbox: LngLatBoundsLike = [
            [Math.min(...lngs), Math.max(...lats)],
            [Math.max(...lngs), Math.min(...lats)]
        ];
        return bbox;
    }
    return null;
}

/**
 * Runs a two-frame render pipeline and executes a callback
 * after the browser has completed rendering the image.
 *
 * @param {Function} onRender - Callback executed after render completes
 */
export function awaitImageRender(onRender: () => void) {
    function rendered() {
        // Rendering finished;
        onRender();
    }
    function startRender() {
        //Rendering start
        requestAnimationFrame(rendered);
    }
    function loaded() {
        requestAnimationFrame(startRender);
    }
    loaded();
}