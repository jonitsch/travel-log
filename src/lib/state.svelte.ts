import type { Journey, Marker, Image } from '$gen/prisma/client/client';
import type { FeatureCollection, GeoJsonProperties, Geometry, LineString } from 'geojson';

export type ViewMode = 'overview' | 'journey';

export type JourneyWithRelations = Journey & {
	marker: Marker[];
	image: Image[];
};

export type JourneyMapData = {
	bbox?: maplibregl.LngLatBoundsLike;
	geoJSON?: FeatureCollection<Geometry, GeoJsonProperties>;
};

export type JourneyData = (JourneyWithRelations & JourneyMapData) | null;

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
	imgSelectMode: boolean;
	imgShownOnMap: string;
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
	imgShownOnMap: ''
});
