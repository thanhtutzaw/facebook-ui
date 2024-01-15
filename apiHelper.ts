import { AuthError, AuthErrorCodes } from "firebase/auth";
import { NextApiRequest, NextApiResponse } from "next";
import { verifyIdToken } from "./lib/firebaseAdmin";

export function checkParam<T>({
  requiredParamLists: requireKeys,
  req,
  res,
}: {
  requiredParamLists: (keyof T)[];
  req: NextApiRequest;
  res: NextApiResponse;
}) {
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
  req,
  res,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
}) {
  const cookies = req.cookies;
  const token = cookies.token;
  if (!cookies) {
    res.status(401).json({ error: "Not Found Cookies .You are not allowed" });
    throw new Error("Not Found Cookies .You are not allowed");
  }
  // console.log({ cookies });
  if (!token) {
    res.status(401).json({ error: "You are not allowed . Token not exist" });
    throw new Error("Not Found Token .You are not allowed . Token not exist");
  }
  try {
    const decodedToken = await verifyIdToken(token);
    if (decodedToken) {
      // res.status(200).json({ message: "You are allowed !", decodedToken });
      console.log(`DecodedToken exist in API `);
    }
  } catch (error: unknown) {
    const FirebaseError = error as AuthError;
    if (FirebaseError.code === AuthErrorCodes.ARGUMENT_ERROR) {
      res.status(401).json({
        error: "Invalid JWT token .You are not allowed",
        message: FirebaseError.message,
      });
      throw new Error("Invalid JWT token .You are not allowed");
    }
    res.status(401).json({ FirebaseError });
    throw new Error(`${FirebaseError.message}`);
  }
}
