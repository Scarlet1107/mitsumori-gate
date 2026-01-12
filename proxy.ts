import { NextResponse, NextRequest } from "next/server";
import { RateLimiterMemory } from "rate-limiter-flexible";

const USER = process.env.BASIC_AUTH_USER ?? "";
const PASS = process.env.BASIC_AUTH_PASS ?? "";
const COOKIE_NAME = "basic_auth";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const RATE_LIMIT_POINTS = parsePositiveInt(process.env.BASIC_AUTH_RATE_LIMIT_POINTS, 10);
const RATE_LIMIT_DURATION = parsePositiveInt(process.env.BASIC_AUTH_RATE_LIMIT_DURATION, 60);
const RATE_LIMIT_BLOCK_DURATION = parsePositiveInt(process.env.BASIC_AUTH_RATE_LIMIT_BLOCK_DURATION, 300);

const authRateLimiter = new RateLimiterMemory({
    points: RATE_LIMIT_POINTS,
    duration: RATE_LIMIT_DURATION,
    blockDuration: RATE_LIMIT_BLOCK_DURATION,
});

/** constant-time 比較（長さが違う場合は即false） */
function safeEqual(a: string, b: string) {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
        diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return diff === 0;
}

export async function proxy(req: NextRequest) {
    const { pathname, searchParams } = req.nextUrl;

    const isPublicAsset = /\.(png|jpe?g|gif|svg|webp|avif|ico|css|js|woff2?|ttf|otf)$/i.test(pathname);
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

    if (!USER || !PASS) {
        return unauthorizedResponse();
    }

    const expectedCookieValue = getExpectedCookieValue();
    const authCookie = req.cookies.get(COOKIE_NAME)?.value;
    if (authCookie && expectedCookieValue && safeEqual(authCookie, expectedCookieValue)) {
        const res = NextResponse.next();
        res.headers.set("X-Robots-Tag", "noindex, nofollow");
        res.headers.set("Cache-Control", "no-store");
        res.headers.set("Vary", "Authorization, Cookie");
        return res;
    }

    const auth = req.headers.get("authorization");
    if (auth?.startsWith("Basic ")) {
        try {
            const [, b64] = auth.split(" ");
            const decoded = atob(b64);
            const idx = decoded.indexOf(":");
            if (idx < 0) throw new Error("invalid basic auth format");
            const user = decoded.slice(0, idx);
            const pass = decoded.slice(idx + 1);

            if (safeEqual(user, USER) && safeEqual(pass, PASS)) {
                const res = NextResponse.next();
                res.headers.set("X-Robots-Tag", "noindex, nofollow");
                res.headers.set("Cache-Control", "no-store");
                res.headers.set("Vary", "Authorization, Cookie");
                const isSecure = req.nextUrl.protocol === "https:";
                if (expectedCookieValue) {
                    res.cookies.set({
                        name: COOKIE_NAME,
                        value: expectedCookieValue,
                        httpOnly: true,
                        sameSite: "lax",
                        secure: isSecure,
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

    const rateLimitedResponse = await checkRateLimit(req);
    if (rateLimitedResponse) return rateLimitedResponse;

    return unauthorizedResponse();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.json|robots.txt|sitemap.xml).*)"],
};

function getExpectedCookieValue() {
    if (!USER || !PASS) return null;
    return btoa(`${USER}:${PASS}`);
}

function parsePositiveInt(value: string | undefined, fallback: number) {
    if (!value) return fallback;
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getClientIp(req: NextRequest) {
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0]?.trim() || null;
    const realIp = req.headers.get("x-real-ip");
    if (realIp) return realIp.trim();
    return null;
}

async function checkRateLimit(req: NextRequest) {
    const ip = getClientIp(req) ?? "unknown";
    try {
        await authRateLimiter.consume(ip, 1);
        return null;
    } catch (rateLimiterRes: unknown) {
        if (rateLimiterRes && typeof rateLimiterRes === "object" && "msBeforeNext" in rateLimiterRes) {
            const msBeforeNext = Number((rateLimiterRes as { msBeforeNext: number }).msBeforeNext) || 0;
            const retryAfterSeconds = Math.max(1, Math.ceil(msBeforeNext / 1000));
            return new NextResponse("Too Many Requests", {
                status: 429,
                headers: {
                    "Retry-After": retryAfterSeconds.toString(),
                    "Cache-Control": "no-store",
                    "X-Robots-Tag": "noindex, nofollow",
                },
            });
        }
        return new NextResponse("Too Many Requests", {
            status: 429,
            headers: {
                "Cache-Control": "no-store",
                "X-Robots-Tag": "noindex, nofollow",
            },
        });
    }
}

function unauthorizedResponse() {
    return new NextResponse("Unauthorized", {
        status: 401,
        headers: {
            "WWW-Authenticate": 'Basic realm="Mitsumori Gate Admin"',
            "Cache-Control": "no-store",
            "X-Robots-Tag": "noindex, nofollow",
        },
    });
}
