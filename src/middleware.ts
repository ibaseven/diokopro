import { NextRequest, NextResponse } from "next/server";
import { PublicRoute, ROLEPAGES } from "../routes";
import { getAuthenticatedUser } from "./lib/auth";

// Fonction pour vérifier si la route est statique
function isStaticFile(pathname: string): boolean {
  return pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff2?|ttf|eot|otf|map)$/i) !== null;
}

// Vérifier si la route existe dans les rôles
function doesRouteExist(pathname: string): boolean {
  return Object.values(ROLEPAGES).some(routes =>
    routes.some(route =>
      typeof route === "string"
        ? pathname.startsWith(route)
        : route.test(pathname)
    )
  );
}

// Vérifier si la route est publique
function isRoutePublic(pathname: string): boolean {
  return PublicRoute.some((route) =>
    typeof route === "string"
      ? pathname === route
      : new RegExp(route).test(pathname)
  );
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Ne pas bloquer les fichiers statiques
  if (isStaticFile(pathname)) {
    return NextResponse.next();
  }

  // Si la route n'existe pas et n'est pas publique => login
  if (!isRoutePublic(pathname) && !doesRouteExist(pathname)) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Si la route est publique => laisser passer
  if (isRoutePublic(pathname)) {
    return NextResponse.next();
  }

  try {
    const currentUser = await getAuthenticatedUser();
    //console.log("Authenticated User:", currentUser);

    if (!currentUser) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    const { role } = currentUser;
    if (role && ROLEPAGES[role as keyof typeof ROLEPAGES]) {
      const allowedPaths = ROLEPAGES[role as keyof typeof ROLEPAGES];

      const isAllowed = allowedPaths.some((allowedPath) =>
        typeof allowedPath === "string"
          ? pathname.startsWith(allowedPath)
          : allowedPath.test(pathname)
      );

      if (pathname === "/auth/login" || !isAllowed) {
        const roleHomePage = allowedPaths[0];
        const cleanRoleHomePage = roleHomePage.startsWith('/')
          ? roleHomePage.slice(1)
          : roleHomePage;

        const redirectUrl = new URL(`/${cleanRoleHomePage}`, req.nextUrl.origin);
        return NextResponse.redirect(redirectUrl);
      }
    }

    const response = NextResponse.next();
    response.headers.set('x-user-role', currentUser.role);
    return response;

  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }
}

// Matcher général (ajuster si nécessaire)
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|logo.ico|public/).*)',
  ],
};
