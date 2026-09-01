export class ClientApiError extends Error {
	status: number;
	payload: unknown;

	constructor(message: string, status: number, payload?: unknown) {
		super(message);
		this.name = 'ClientApiError';
		this.status = status;
		this.payload = payload;
	}
}

type ClientResponseEnvelope<T> = {
	ok: boolean;
	status?: number;
	data?: T;
	error?: string;
	message?: string;
	[key: string]: unknown;
};

type RequestApiOptions = {
	expectEnvelope?: boolean;
	fallbackError?: string;
};

function isEnvelope<T>(value: unknown): value is ClientResponseEnvelope<T> {
	return !!value && typeof value === 'object' && 'ok' in value;
}

function mergeEnvelopeMetadata<T>(payload: ClientResponseEnvelope<T>, data: T): T {
	if (!payload || typeof payload !== 'object' || !('data' in payload)) {
		return data;
	}
	if (typeof data !== 'object' || data === null) {
		return data;
	}

	const metadata = Object.entries(payload).reduce<Record<string, unknown>>((acc, [key, value]) => {
		if (key !== 'data' && key !== 'ok' && key !== 'error' && key !== 'status') {
			acc[key] = value;
		}
		return acc;
	}, {});

	return Object.assign(data as object, metadata) as T;
}

function getFailureMessage(payload: unknown, response: Response, fallbackError?: string): string {
	if (payload && typeof payload === 'object') {
		const errorMessage = 'error' in payload ? String(payload.error) : undefined;
		if (errorMessage) return errorMessage;
		const message = 'message' in payload ? String(payload.message) : undefined;
		if (message) return message;
	}
	return fallbackError ?? `Request failed (${response.status})`;
}

export async function requestApi<T>(
	input: RequestInfo | URL,
	init: RequestInit = {},
	options: RequestApiOptions = {}
): Promise<T> {
	const { expectEnvelope = true, fallbackError } = options;

	try {
		const response = await fetch(input, init);
		let payload: unknown = null;

		try {
			payload = await response.json();
		} catch {
			payload = null;
		}

		if (expectEnvelope === false) {
			if (!response.ok) {
				throw new ClientApiError(
					getFailureMessage(payload, response, fallbackError),
					response.status,
					payload
				);
			}

			return (payload ?? ({} as T)) as T;
		}

		if (!isEnvelope<T>(payload)) {
			if (!response.ok) {
				throw new ClientApiError(
					getFailureMessage(payload, response, fallbackError),
					response.status,
					payload
				);
			}
			return payload as T;
		}

		if (!response.ok || payload.ok === false) {
			throw new ClientApiError(
				getFailureMessage(payload, response, fallbackError),
				response.status ?? 500,
				payload
			);
		}

		return mergeEnvelopeMetadata(payload, (payload.data ?? ({} as T)) as T);
	} catch (error) {
		if (error instanceof ClientApiError) {
			throw error;
		}

		const message = error instanceof Error ? error.message : fallbackError ?? 'Request failed';
		throw new ClientApiError(message, 0, error);
	}
}
