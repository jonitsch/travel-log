import { auth } from "$src/lib/server/auth";

export async function load(event) {
    const session = await auth.api.getSession({ headers: event.request.headers });
    if (!session) return
    return {
        user: session.user
    };
}