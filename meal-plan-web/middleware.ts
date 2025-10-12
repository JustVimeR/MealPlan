import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/register", "/favicon.ico", "/manifest.json"];

export function middleware(req: NextRequest) {
	const { pathname, search } = req.nextUrl;
	const token = req.cookies.get("mp_token")?.value;

	const isPublic = PUBLIC_PATHS.some(
		(p) =>
			pathname === p || pathname.startsWith(p) || pathname.startsWith("/_next")
	);

	if (!token && !isPublic) {
		const url = req.nextUrl.clone();
		url.pathname = "/login";
		if (pathname !== "/") url.searchParams.set("next", pathname + search);
		return NextResponse.redirect(url);
	}

	if (token && (pathname === "/login" || pathname === "/register")) {
		const url = req.nextUrl.clone();
		url.pathname = "/planner";
		return NextResponse.redirect(url);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!static|.*\\..*).*)"],
};
