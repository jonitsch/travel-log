import type { Journey, Marker, Image } from "$gen/prisma/client/client";

export type ViewMode = 'overview' | 'journey' | 'createJourney' | null;
export type JourneyData = Journey & { marker: Marker[], image: Image[] } | null;

type State = {
	viewMode: ViewMode;
	journeyData: JourneyData;
	journeyId: string | undefined;
	map: maplibregl.Map | null;
	center: maplibregl.LngLatLike | undefined;
	loadingJourney: boolean;
	savedViewPort: {
		zoom: number | undefined;
		center: maplibregl.LngLatLike | undefined;
		bounds: maplibregl.LngLatBoundsLike | undefined;
	} | null;
	selectedImageIds: string[];
	imgSelectMode: boolean,
	imgShownOnMap: boolean,
};

export const global: State = $state({
	viewMode: 'overview' as ViewMode,
	journeyData: null,
	journeyId: '',
	map: null,
	center: undefined,
	loadingJourney: false,
	savedViewPort: null,
	selectedImageIds: [],
	imgSelectMode: false,
	imgShownOnMap: false,
});
