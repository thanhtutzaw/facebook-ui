import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { AuthError, AuthErrorCodes } from "firebase/auth";
import { NextApiRequest, NextApiResponse } from "next";
import { ResponseErrorJSON } from "utils";
import { verifyIdToken } from "./firebaseAdmin";
type TCheckParam<T> = {
  requiredParamLists: (keyof T)[];
  req: NextApiRequest;
  res: NextApiResponse;
};
export function checkParam<T>({
  requiredParamLists: requireKeys,
  req,
  res,
}: TCheckParam<T>) {
  const isParamMissing = !requireKeys.every((key) =>
    req.body.hasOwnProperty(key)
  );
  const failedLists = requireKeys.filter((value) => {
    const RecievedParams = Object.keys(req.body);
    !RecievedParams.includes(String(value));
  });
  let error = null;
  const throwParamError = (failedLists: (keyof T)[]) => {
    error = `Required parameters are missing - ${
      failedLists.length > 1
        ? `${failedLists.slice(0, -1).join(" , ")} and ${failedLists.slice(-1)}`
        : failedLists.join(" , ")
    }`;
    res.status(400).json({
      error,
    });
    throw new Error(error);
  };
  if (isParamMissing) {
    throwParamError(requireKeys);
  }
  return {
    paramError: isParamMissing,
    requireParams: failedLists,
    error,
  };
}
export async function checkCookies({
  // cookies,
  req,
  res,
}: {
  cookies?: any;
  req: NextApiRequest;
  res: NextApiResponse;
}) {
  const cookies = req.cookies;
  const firebaseToken = cookies.token;
  // console.log({ reqCookiesInCheckCook: req.cookies });
  if (!cookies) {
    ResponseErrorJSON(res, "Not Found Cookies . You are not allowed");
    throw new Error("Not Found Cookies . You are not allowed");
  }
  let decodedToken: DecodedIdToken | null = null;
  try {
    decodedToken = await verifyIdToken(String(firebaseToken));
    if (decodedToken) {
      console.log(`DecodedToken exist in API`);
    }
  } catch (error) {
    const FirebaseError = error as AuthError;
    if (FirebaseError.code === AuthErrorCodes.ARGUMENT_ERROR) {
      const error = {
        message: "Invalid JWT token . You are not allowed",
        FirebaseError,
      };
      ResponseErrorJSON(res, error);
      throw new Error(
        `"Invalid JWT token . You are not allowed" \n FirebaseError: ${FirebaseError.message}`
      );
    }
    ResponseErrorJSON(res, FirebaseError);
    throw new Error(`${FirebaseError.message}`);
  }
  return { token: decodedToken };
}
