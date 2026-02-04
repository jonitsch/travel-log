import type { Journey } from "./server/prisma";

export type ViewMode = 'overview' | 'journey' | null;

type State = {
	viewMode: ViewMode;
	journeyData: Journey | null;
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
