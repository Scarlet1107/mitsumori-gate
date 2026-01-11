import { NextResponse, NextRequest } from "next/server";

const USER = process.env.BASIC_AUTH_USER ?? "";
const PASS = process.env.BASIC_AUTH_PASS ?? "";
const COOKIE_NAME = "basic_auth";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/** constant-time 比較（長さが違う場合は即false） */
function safeEqual(a: string, b: string) {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
        diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return diff === 0;
}

export function proxy(req: NextRequest) {
    const { pathname, searchParams } = req.nextUrl;

    const isPublicAsset = /\.(png|jpe?g|gif|svg|webp|avif|ico|css|js|map|txt|xml|json|woff2?|ttf|otf)$/i.test(pathname);
    if (isPublicAsset) return NextResponse.next();

    const isPublicApi =
        pathname === "/api/config" ||
        pathname === "/api/simulation/web" ||
        pathname === "/api/simulation/budget";

    const isPublicWebFlow = (() => {
        if (pathname === "/web-form") return true;
        if (pathname === "/cover" || pathname === "/consent" || pathname === "/done") {
            return searchParams.get("mode") === "web";
        }
        return false;
    })();

    const needsAuth = !(isPublicApi || isPublicWebFlow);
    if (!needsAuth) return NextResponse.next();

    const expectedCookieValue = getExpectedCookieValue();
    const authCookie = req.cookies.get(COOKIE_NAME)?.value;
    if (authCookie && expectedCookieValue && safeEqual(authCookie, expectedCookieValue)) {
        const res = NextResponse.next();
        res.headers.set("X-Robots-Tag", "noindex, nofollow");
        res.headers.set("Cache-Control", "no-store");
        return res;
    }

    const auth = req.headers.get("authorization");
    if (auth?.startsWith("Basic ")) {
        try {
            const [, b64] = auth.split(" ");
            const decoded = atob(b64);
            const idx = decoded.indexOf(":");
            const user = decoded.slice(0, idx);
            const pass = decoded.slice(idx + 1);

            if (safeEqual(user, USER) && safeEqual(pass, PASS)) {
                const res = NextResponse.next();
                res.headers.set("X-Robots-Tag", "noindex, nofollow");
                res.headers.set("Cache-Control", "no-store");
                if (expectedCookieValue) {
                    res.cookies.set({
                        name: COOKIE_NAME,
                        value: expectedCookieValue,
                        httpOnly: true,
                        sameSite: "lax",
                        secure: process.env.NODE_ENV === "production",
                        maxAge: COOKIE_MAX_AGE,
                        path: "/",
                    });
                }
                return res;
            }
        } catch {
            // fallthrough to 401
        }
    }

    return new NextResponse("Unauthorized", {
        status: 401,
        headers: {
            "WWW-Authenticate": 'Basic realm="Mitsumori Gate Admin"',
        },
    });
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.json|robots.txt|sitemap.xml).*)"],
};

function getExpectedCookieValue() {
    if (!USER || !PASS) return null;
    return btoa(`${USER}:${PASS}`);
}
