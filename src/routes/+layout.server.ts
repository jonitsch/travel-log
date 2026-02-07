export async function load(event) {
    if (!event.locals.session) return
    return {
        username: event.locals.session.user.name,
        email: event.locals.session.user.email,
    };
}