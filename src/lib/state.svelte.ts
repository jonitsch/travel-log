type State = {
  viewMode: string | null;
  journeyData: {
		journeyId: string;
		name: string;
		color: string;
		lng: number;
		lat: number;
		marker: {
			journeyId: string;
			name: string;
			color: string;
			lng: number;
			lat: number;
			id: number;
		}[];
		image: {
			journeyId: string;
			lng: number | null;
			lat: number | null;
			path: string;
			fileName: string;
			width: number;
			height: number;
		}[];
	} | null;
  journeyId: string;
};

export const global: State = $state({
  viewMode: 'overview',
  journeyData: null,
  journeyId: '',
});
