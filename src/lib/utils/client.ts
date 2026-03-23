import type { FeatureCollection, LineString } from 'geojson';
import { type LngLatBoundsLike, type LngLatLike } from 'maplibre-gl';
import { global, type JourneyData, type JourneyWithRelations } from '$lib/state.svelte';
import type { Image } from '$gen/prisma/client/client';

export const defaultMapCenter: LngLatLike = [13.388, 52.517];

export const imgHighlightColor = '#2DD4BE';

/**
 * Returns a ImgProxy-URL signed with your IMGPROXY_KEY
 * and IMGPROXY_SALT enviroment variables
 *
 * @param {string} id - the img's id
 * @param {number} width - desired width (in px) of the output image
 * @param {number} height - desired height (in px) of the output image
 * @param {string} format - desired format of the output image (defaults to "webp")
 */
export async function getImgProxyURL(
	id: string,
	width?: number,
	height?: number,
	format?: string,
): Promise<string> {
	const params = new URLSearchParams({ id: id });

	if (width) params.append('width', Math.round(width).toString());
	if (height) params.append('height', Math.round(height).toString());
	if (format) params.append('format', format);

	const response = await fetch(`/api/imgproxy?${params.toString()}`);
	let url = await response.json();
	return url;
}

export function switchToOverview(): void {
	const map = global.map;
	global.journeyData = null;
	global.journeyId = undefined;
	global.loadingJourney = false;
	global.selectedImageIds = [];
	global.imgSelectMode = false;
	if (map) {
		map.setProjection({ type: 'globe' });
		if (global.savedViewPort?.center && global.savedViewPort?.zoom) {
			map.flyTo({
				center: global.savedViewPort.center,
				zoom: global.savedViewPort.zoom,
				speed: 1.5
			});
		} else {
			map.flyTo({
				center: defaultMapCenter,
				zoom: calcOptimizedZoom(window.innerWidth),
				speed: 1
			});
		}
	} else {
		throw new Error('Map not found!');
	}
	global.savedViewPort = null;
	global.viewMode = 'overview';
}

export async function switchToJourney(journeyId: string): Promise<JourneyData> {
	global.viewMode = 'journey';
	global.journeyId = journeyId;
	global.loadingJourney = true;

	const journey = await getJourneyData(journeyId);
	const map = global.map;

	if (!map || !journey) throw Error('Map or Journey not defined!');

	await waitForStyle(map);
	map.setProjection({ type: 'mercator' });

	map.once('moveend', () => {
		setTimeout(() => {
			global.loadingJourney = false;
		}, 200);
	});
	const bbox = getBBox(journey);

	// using timeout to await the resizing of the map container, fixes bbox offset issue
	setTimeout(async () => {
		if (bbox) {
			map.fitBounds(bbox, {
				padding: 90,
				duration: 500
			});
		} else {
			map.flyTo({
				center: [journey.lng, journey.lat],
				zoom: 6
			});
		}
	}, 50)

	const geoJSON = await buildGeoJSON(journey);
	const data = {
		...journey,
		bbox: bbox,
		geoJSON: geoJSON
	};
	global.journeyData = data;

	return data;
}

function waitForStyle(map: maplibregl.Map): Promise<void> {
	if (map.isStyleLoaded()) return Promise.resolve();

	return new Promise((resolve) => {
		map.once('styledata', () => resolve());
	});
}

export async function getJourneyData(journeyId: string): Promise<JourneyWithRelations> {
	try {
		const res = await fetch(`/api/journeys?journeyId=${journeyId}`);
		if (!res.ok) {
			throw new Error(`Failed to fetch journey data: ${res.status} ${res.statusText}`);
		}
		let journey: JourneyWithRelations = await res.json();

		journey.image.sort((a, b) => {
			if (a.createdOn < b.createdOn) {
				return -1;
			} else if (a.createdOn > b.createdOn) {
				return 1;
			} else {
				return 0;
			}
		});

		return journey;
	} catch (err) {
		throw err;
	}
}
export async function buildGeoJSON(
	journey: JourneyWithRelations
): Promise<FeatureCollection | undefined> {
	let geoJSON: FeatureCollection = {
		type: 'FeatureCollection',
		features: []
	};
	const trackedImgs = journey.image.filter((img) => {
		return img.lat && img.lng;
	});
	if (trackedImgs.length > 0) {
		let lineString: LineString = {
			type: 'LineString',
			coordinates: []
		};
		for (const img of trackedImgs) {
			lineString.coordinates.push([img.lng!, img.lat!]);
		}
		geoJSON.features.push({
			type: 'Feature',
			geometry: lineString,
			properties: {}
		});
		return geoJSON;
	}

	return undefined;
}
export function getBBox(journey: JourneyData): LngLatBoundsLike | undefined {
	if (!journey) throw Error('No Journey defined!');
	let { image, marker } = journey;
	image = image.filter((img) => {
		return img.lat && img.lng;
	});

	if (!image.length && !marker.length) return undefined;

	let lngs: Array<number> = [];
	let lats: Array<number> = [];

	for (const img of image) {
		lngs.push(img.lng!);
		lats.push(img.lat!);
	}
	for (const mrk of marker) {
		lngs.push(mrk.lng);
		lats.push(mrk.lat);
	}

	if (lngs.length > 0 && lats.length > 0) {
		const bbox: LngLatBoundsLike = [
			[Math.min(...lngs), Math.max(...lats)],
			[Math.max(...lngs), Math.min(...lats)]
		];
		return bbox;
	}
	return undefined;
}

export function calcOptimizedZoom(width: number): number {
	let zoom = width * 0.002;
	const MIN_ZOOM = 0.6;
	const MAX_ZOOM = 1.2;

	zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
	return zoom;
}

function scrollToBookPic(id: string) {
	document
		.getElementById(`bookpic-${id}`)
		?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

export const isImgSelected = (imgId: string) =>
	global.selectedImageIds.filter((id) => id === imgId).length ? true : false;

export function handleImageSelection(imgId: string) {
	scrollToBookPic(imgId);
	if (!global.imgSelectMode) {
		handleSingleSelection(imgId);
		return;
	}
	if (isImgSelected(imgId)) {
		global.selectedImageIds = global.selectedImageIds.filter((id) => id != imgId);
	} else {
		global.selectedImageIds.push(imgId);
	}
}
export function handleSingleSelection(imgId: string) {
	if (!isImgSelected(imgId)) {
		global.selectedImageIds = [imgId];
	} else {
		global.selectedImageIds = [];
	}
}

export function handleShowOnMapClick(img: Image) {
	if (!global.map || !img.lng || !img.lat) return;
	const map = global.map;
	const imgSelected = isImgSelected(img.id);
	const imgShownOnMap = global.imgShownOnMap === img.id;
	if (imgShownOnMap && imgSelected) {
		const bbox = getBBox(global.journeyData);
		if (!bbox) return;
		map.fitBounds(bbox, {
			padding: 90,
			duration: 1000
		});
		global.imgShownOnMap = '';
	} else {
		global.imgShownOnMap = img.id;
		map.once('drag', () => (global.imgShownOnMap = ''));
		map.flyTo({ center: [img.lng, img.lat], zoom: 15, speed: 2 });
	}
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

export const timeRange = (journey: JourneyData | undefined) => {
	if (!journey) return undefined;
	if (journey.image.length === 0) return undefined;
	let end = new Date(journey.image[journey.image.length - 1].createdOn);
	let start = new Date(journey.image[0].createdOn);
	return `${start.toLocaleDateString('de-DE', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric'
	})} - ${end.toLocaleDateString('de-DE', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric'
	})}`;
};
export const formattedDate = (
	imgDate: Date,
	format?: 'dd/mm/yyyy' | 'dd/mm/yyyy hh:mm' | 'dd/mm/yyyy hh:mm:ss'
) => {
	let date = new Date(imgDate);
	switch (format) {
		default:
			return date.toLocaleDateString('de-DE', {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric',
				hour12: false
			});
		case 'dd/mm/yyyy hh:mm':
			return date.toLocaleDateString('de-DE', {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
				hour12: false
			});
		case 'dd/mm/yyyy hh:mm:ss':
			return date.toLocaleDateString('de-DE', {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
				hour12: false
			});
	}
};
