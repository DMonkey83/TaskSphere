import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_ROUTES = ['/login', '/register', '/sign-in']; // optional expansion

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const accessToken = request.cookies.get('access_token')?.value;
    const isAuthPage = PUBLIC_ROUTES.includes(pathname);

    let isValid = false;

    if (accessToken) {
        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET)
            await jwtVerify(accessToken, secret);
            isValid = true;
        } catch {
            // Invalid or expired token
        }
    }

    // 🔍 Debug logs
    console.log("Middleware running on:", pathname);
    console.log("Access token:", accessToken);
    console.log("Is valid token:", isValid);
    console.log("Is auth page:", isAuthPage);

    if (isValid && isAuthPage) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (!isValid && !isAuthPage) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}


export const config = {
    matcher: ['/', '/dashboard', '/login', '/register', '/projects/:path*', '/test-page'],
  };