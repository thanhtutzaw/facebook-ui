import { NextRequest, NextResponse } from "next/server";
export const config = {
  matcher: "/api/:path*",
};
export async function middleware(req: NextRequest, res: NextResponse) {
  const cookie = req.cookies;
  const token = cookie.get("token");
  console.log({ middlewareTest: "Middleware running .........." });
  const firebaseToken = token;

  if (cookie.size === 0) {
    return NextResponse.json(
      {
        success: false,
        message: "Not Found Cookies .You are not allowed !",
      },
      { status: 401 }
    );
  } else {
    if (!firebaseToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Not Found Token .You are not allowed . Token not exist",
        },
        { status: 401 }
      );
    }
  }
  // if (!token) {
  //   return NextResponse.redirect(new URL("/login", req.url)); // Redirect to login if cookie is missing
  // }
  // return NextResponse.next();
}
