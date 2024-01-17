import { NextRequest, NextResponse } from "next/server";
import { ServerErrorResponse } from "utils";
export const config = {
  matcher: "/api/:path*",
};
export async function middleware(req: NextRequest, res: NextResponse) {
  const cookie = req.cookies;
  const token = cookie.get("token");
  console.log({ middlewareTest: "Middleware running .........." });
  const isTokenExist = cookie.has("token");
  let error: unknown;
  if (cookie.size === 0) {
    error = {
      message: "Not Found Cookies .You are not allowed !",
    };
    return ServerErrorResponse(error);
  }
  if (!isTokenExist) {
    error = {
      message: "Not Found Token .You are not allowed . Token not exist",
    };
    return ServerErrorResponse(error);
  } else if (token && token.value === "true") {
    error = { message: "Invalid JWT Token" };
    return ServerErrorResponse(error);
  }
  // return NextResponse.redirect(new URL("/login", req.url)); // Redirect to login if cookie is missing
  // return NextResponse.next();
}
