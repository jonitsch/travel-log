import type { Journey } from "./server/prisma";

export type ViewMode = 'overview' | 'journey' | null;

type State = {
	viewMode: ViewMode;
	journeyData: Journey | null;
	journeyId: string | undefined;
	map: maplibregl.Map | null;
};

export const global: State = $state({
	viewMode: 'overview' as ViewMode,
	journeyData: null,
	journeyId: '',
	map: null,
});
