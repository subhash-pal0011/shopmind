// import { auth } from "@/auth";
// import { NextResponse } from "next/server";

// export default auth((req) => {
//        const { pathname } = req.nextUrl;

//        if (req.auth && pathname === "/register") {
//               return NextResponse.redirect(new URL("/", req.url));
//        }

//        const publicRoutes = [
//               "/register",
//               "/api/auth",
//               "/favicon.ico",
//               "/_next",
//        ];

//        // Allow public routes
//        if (publicRoutes.some((path) => pathname.startsWith(path))) {
//               return NextResponse.next();
//        }

//        // If user is not logged in
//        if (!req.auth) {
//               return NextResponse.redirect(
//                      new URL("/register", req.url)
//               );
//        }
//        //Invalid route → redirect home bana hii

//        return NextResponse.next();
// });

// export const config = {
//        matcher: [
//               "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg)$).*)",
//        ],
// };



import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // ============================================
  // 1. LOGGED-IN USER REGISTER PAGE NA DEKHE
  // ============================================
  if (req.auth && pathname === "/register") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // ============================================
  // 2. PUBLIC ROUTES
  // ============================================
  const publicRoutes = [
    "/",
    "/products",
    "/product",
    "/category",
    "/categories",
    "/login",
    "/register",
    "/about",
    "/contact",
    "/api/auth",
    "/favicon.ico",
    "/_next",
  ];

  const isPublicRoute = publicRoutes.some((route) => {
    return pathname === route || pathname.startsWith(`${route}/`);
  });

  // Public route hai → directly allow
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // ============================================
  // 3. CART / CHECKOUT / ORDER KE LIYE LOGIN
  // ============================================
  const protectedRoutes = [
    "/checkout",
    "/orders",
    "/account",
    "/profile",
    "/wishlist",
  ];

  const isProtectedRoute = protectedRoutes.some((route) => {
    return pathname === route || pathname.startsWith(`${route}/`);
  });

  if (isProtectedRoute && !req.auth) {
    const loginUrl = new URL("/login", req.url);

    // Login ke baad wahi page open ho
    loginUrl.searchParams.set(
      "callbackUrl",
      pathname
    );

    return NextResponse.redirect(loginUrl);
  }

  // ============================================
  // 4. OTHER ROUTES
  // ============================================
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg)$).*)",
  ],
};
