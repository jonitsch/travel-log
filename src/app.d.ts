// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

import "$lib/client/styles.css"
import type { PrismaClient } from "@prisma/client";
import type { Session, User } from "$lib/auth-client";

declare global {
	namespace App {
		interface Locals {
			session: Session | null;
			user: User | null;
		}
	}
	var prisma: PrismaClient;
}

export {};
