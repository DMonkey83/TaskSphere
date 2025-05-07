import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

const PUBLIC_ROUTES = ['/login', '/register']

const proectedRoutes = ['/dashboard']

export function middleware(request: NextRequest) {
    const {pathname} = request.nextUrl;
    const accessToken = request.cookies.get('access_token')?.value;

    if(PUBLIC_ROUTES.includes(pathname)) {
        if (accessToken) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
        return NextResponse.next()
    }

    if (proectedRoutes.includes(pathname) && !accessToken) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/login', '/register', '/dashboard']
}