import { NextApiResponse } from "next";
import { NextResponse } from "next/server";

export function ServerErrorResponse(
  error: unknown,
  statusCode: NextResponse["status"] = 401
) {
  console.error(error);
  return NextResponse.json(
    {
      error,
    },
    { status: statusCode }
  );
}

export function ResponseErrorJSON(
  res: NextApiResponse,
  error: unknown,
  statusCode: NextApiResponse["statusCode"] = 401
) {
  res.status(statusCode).json({ error });
}
