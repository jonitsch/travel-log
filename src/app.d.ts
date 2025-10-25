// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

import "$lib/client/styles.css"
import type { PrismaClient } from "@prisma/client";

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
	var prisma: PrismaClient;
}

export {};
