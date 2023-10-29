import { db, getCollectionPath, getPath } from "@/lib/firebase";
import {
  Timestamp,
  Unsubscribe,
  doc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";

export default function useFriendRequest(uid: string) {
  const [friendReqCount, setfriendReqCount] = useState(0);
  const soundRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!uid) return;
    const friendReqCountRef = doc(
      db,
      `${getCollectionPath.friendReqCount({ uid })}/reqCount`
    );
    let lastPull: Timestamp | null = null;
    async function getLastpull() {
      lastPull = (await getDoc(friendReqCountRef)).data()
        ?.lastPullTimestamp as Timestamp;
      // console.log(lastPull);
    }
    getLastpull();
    let unsubscribeFriendReqCount: Unsubscribe;
    const fetchFriendReqCount = async () => {
      const pendingRef = getPath("friendReqCount", { uid });
      try {
        if (friendReqCount >= 10) return;
        unsubscribeFriendReqCount = onSnapshot(pendingRef, (snap) => {
          snap.docs.map((doc) => {
            const updatedAt =
              doc.data().updatedAt?.toDate()?.getTime() ?? Date.now();
            const count = doc.data().count;
            const newCount = count;
            if (count > 0) {
              console.log(lastPull?.toDate().getTime! < updatedAt);
              const audioElement = soundRef.current;

              if (updatedAt > Date.now()) {
                if (audioElement) {
                  // Decrease the volume by setting it to a value less than 1.0
                  audioElement.volume = 0.4; // Adjust the volume as needed (0.5 means 50% volume)
                  audioElement
                    .play()
                    .then(() => {
                      soundRef.current?.play();
                      console.log("allow");
                    })
                    .catch(() => {
                      soundRef.current?.pause();
                      console.log(
                        "Audio autoplay not allowed (Try app at HomeScreen)"
                      );
                    });
                }
                // soundRef.current
                //   ?.
                // try {
                //   soundRef.current?.play();
                //   console.log("Audio autoplay Allowed in HomeScreen App");
                //   playFriendRequest();
                // } catch (error) {
                //   soundRef.current?.pause();
                //   console.log(
                //     "Audio autoplay not allowed (Try agin by adding App to HomeScreen)"
                //   );
                // }
              }
            }
            // setprevfriendReqCount(newCount);
            setfriendReqCount(count);
          });
        });
      } catch (error) {
        console.log(error);
      }
    };
    fetchFriendReqCount();
    return () => {
      if (unsubscribeFriendReqCount) unsubscribeFriendReqCount();
    };
  }, [friendReqCount, uid]);
  return { friendReqCount, soundRef };
}
