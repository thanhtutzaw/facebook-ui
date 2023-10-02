import { acceptFriends } from "@/lib/firestore/friends";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  res:  NextApiResponse,
  req: NextApiRequest
) {
  const { action  } = req.query ;
  console.log(req.query);
  console.log(req.body);
  try {
      switch (action) {
          case "accept":
            const { uid,f,currentUser  } = req.body ;
            await acceptFriends(uid, f, currentUser);
            break;
        case "reply":
            
            break;
    
        default:
            break;
    }
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Action failed:", error);
    // Respond with an error status if the action fails.
    res.status(500).json({ success: false, error: "Action failed" });
  }
}
