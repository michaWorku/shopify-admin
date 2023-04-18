import { LoaderFunction } from '@remix-run/node'
import { authenticator } from '~/services/auth.server'
/**
 * Loader function to redirect logged in user to prefered route
 * or redirect to login.
 * @async function loader
 * @param request The incoming HTTP request.
 * @param params The URL params for the current route.
 * @returns redirect to clients or login.
 */
export const loader: LoaderFunction = async ({ request }) => {
    return await authenticator.isAuthenticated(request, {
        failureRedirect: '/login',
        successRedirect: '/clients',
    })
}
