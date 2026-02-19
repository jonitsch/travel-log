import type { Journey, Marker, Image } from "$gen/prisma/client/client";

export type ViewMode = 'overview' | 'journey' | null;
export type JourneyData = Journey & { marker: Marker[], image: Image[] } | null;

type State = {
	viewMode: ViewMode;
	journeyData: JourneyData;
	journeyId: string | undefined;
	map: maplibregl.Map | null;
	loadingJourney: boolean;
	savedViewPort: {
		zoom: number | undefined;
		center: maplibregl.LngLatLike | undefined;
		bounds: maplibregl.LngLatBoundsLike | undefined;
	} | null;
	selectedImageId: string | null;
};

export const global: State = $state({
	viewMode: 'overview' as ViewMode,
	journeyData: null,
	journeyId: '',
	map: null,
	loadingJourney: false,
	savedViewPort: null,
	selectedImageId: null
});
