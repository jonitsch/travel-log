import { dev } from "$app/environment";
import { createAuthClient } from "better-auth/svelte";

export const authClient = createAuthClient({
    baseURL: dev ? "http://localhost:5173" : "https://travel-log.app",
});

export const {
    signIn,
    signOut,
    signUp,
    useSession
} = authClient;

export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session["user"];