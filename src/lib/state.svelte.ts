import type { Journey } from "./server/database";

export type ViewMode = 'overview' | 'journey' | null;

type State = {
	viewMode: ViewMode;
	journeyData: Journey | null;
	journeyId: string;
	map: maplibregl.Map | null;
};

export const global: State = $state({
	viewMode: 'overview' as ViewMode,
	journeyData: null,
	journeyId: '',
	map: null,
});
