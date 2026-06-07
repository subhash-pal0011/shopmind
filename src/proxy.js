import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
       const { pathname } = req.nextUrl;

       if (req.auth && pathname === "/register") {
              return NextResponse.redirect(new URL("/", req.url));
       }

       const publicRoutes = [
              "/register",
              "/api/auth",
              "/favicon.ico",
              "/_next",
       ];

       // Allow public routes
       if (publicRoutes.some((path) => pathname.startsWith(path))) {
              return NextResponse.next();
       }

       // If user is not logged in
       if (!req.auth) {
              return NextResponse.redirect(
                     new URL("/register", req.url)
              );
       }
       //Invalid route → redirect home bana hii

       return NextResponse.next();
});

export const config = {
       matcher: [
              "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg)$).*)",
       ],
};