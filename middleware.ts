import { NextResponse, NextRequest } from "next/server";

const USER = process.env.BASIC_AUTH_USER ?? "";
const PASS = process.env.BASIC_AUTH_PASS ?? "";

/** constant-time 比較（長さが違う場合は即false） */
function safeEqual(a: string, b: string) {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
        diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return diff === 0;
}

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // /admin と /api/admin だけを対象に
    const needsAuth =
        pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
    if (!needsAuth) return NextResponse.next();

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
    matcher: ["/admin/:path*", "/api/admin/:path*"],
};
