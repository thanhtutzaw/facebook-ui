import { AppContext } from "@/context/AppContext";
import { PageContext, PageProps } from "@/context/PageContext";
import { collectionBasePath, getPath, getProfileByUID } from "@/lib/firebase";
import { checkPhotoURL } from "@/lib/firestore/profile";
import { AppProps, QueryKey, friends } from "@/types/interfaces";
import { useQueries } from "@tanstack/react-query";
import { getDocs, orderBy, query, where } from "firebase/firestore";
import { useContext } from "react";
import { useActive } from "./useActiveTab";
function useFriends() {
  const { active: tab } = useActive();
  const { uid } = useContext(AppContext) as AppProps;
  const { friendReqCount } = useContext(PageContext) as PageProps;

  const fetchSuggestedFriends = async () => {
    if (!uid) return;
    const myFriendsQuery = query(getPath("friends", { uid }));
    const myFriends = (await getDocs(myFriendsQuery)).docs.map((doc) => doc.id);
    // including friends , pending , blocked (users) string[]
    const suggestedFriendsQuery = query(
      collectionBasePath,
      where("__name__", "not-in", [uid, ...myFriends])
      // if not friends , pending , blocked or thisAccount , display all users as suggestedAccount
    );
    try {
      const suggestedFriendsSnap = await getDocs(suggestedFriendsQuery);
      return suggestedFriendsSnap.docs.map((doc) => {
        if (doc.data()) {
          return {
            id: doc.id,
            author: {
              ...doc.data().profile,
            },
          };
        } else {
          return [];
        }
      });
    } catch (error) {
      console.log(error);
      throw new Error("Failed to fetch Suggested Friends");
    }
  };
  const fetchPendingFriends = async () => {
    if (!uid) return;
    const pendingfriendsQuery = query(
      getPath("friends", { uid }),
      where("status", "==", "pending"),
      where("senderId", "!=", uid),
      orderBy("senderId", "asc"),
      orderBy("createdAt", "desc")
    );
    try {
      const pendingFriends = await getDocs(pendingfriendsQuery);
      return (await Promise.all(
        pendingFriends.docs.map(async (doc) => {
          if (doc.data()) {
            const profile = await getProfileByUID(doc.id.toString());
            return {
              id: doc.id,
              ...doc.data(),
              author: {
                ...profile,
                photoURL: checkPhotoURL(profile.photoURL),
              },
            } as friends;
          } else {
            return [];
          }
        })
      )) as friends[];
    } catch (error) {
      console.log(error);
      throw new Error("Failed to fetch users");
    }
  };

  const [suggestedFriends, pendingFriends] = useQueries({
    queries: [
      {
        queryKey: [QueryKey.suggestedFriends, uid, friendReqCount],
        queryFn: async () => await fetchSuggestedFriends(),
        enabled: tab === "friends",
      },
      {
        queryKey: [QueryKey.pendingFriends, uid, friendReqCount],
        queryFn: async () => await fetchPendingFriends(),
        enabled: tab === "friends",
      },
    ],
  });
  
  return { suggestedFriends, pendingFriends };
}

export default useFriends;
