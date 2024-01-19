import { useAppContext } from "@/context/AppContext";
import { usePageContext } from "@/context/PageContext";
import { collectionBasePath, getPath, getProfileByUID } from "@/lib/firebase";
import { checkPhotoURL } from "@/lib/firestore/profile";
import { QueryKey, friends } from "@/types/interfaces";
import { useQueries } from "@tanstack/react-query";
import { getDocs, orderBy, query, where } from "firebase/firestore";
import { useActiveTab } from "./useActiveTab";
function useFriends() {
  const { active: tab } = useActiveTab();
  const { uid } = useAppContext();
  const { friendReqCount } = usePageContext();

  const fetchSuggestedFriends = async () => {
    if (!uid) return;
    const myFriendsQuery = query(getPath("friends", { uid }));
    // including friends , pending , blocked (users) string[]
    const myFriends = (await getDocs(myFriendsQuery)).docs.map((doc) => doc.id);
    // for (let i = 0; i < myFriends.length; i += 9) {
    //   const friends = myFriends.slice(i, i + 9);
    //   batchLists.push(friends);
    //   queryPromises = batchLists.map(async (batch) => {
    //     console.log([uid, ...batch]);
    //     let suggestedFriendsQuery2 = query(
    //       collectionBasePath,
    //       where("__name__", "not-in", [uid, ...batch])
    //       // if not friends , pending , blocked or thisAccount , display all users as suggestedAccount
    //     );
    //     return ( getDocs(suggestedFriendsQuery2)).docs.map(
    //       (doc) => doc.id
    //     );
    //   });
    // }
    // console.log({ batchLists });

    let suggestedFriendsQuery = query(
      collectionBasePath,
      where("__name__", "not-in", [uid, ...myFriends.slice(0, 9)])
      // if not friends , pending , blocked or thisAccount , display all users as suggestedAccount
    );
    try {
      const suggestedFriendsSnap = await getDocs(suggestedFriendsQuery);
      const data = suggestedFriendsSnap.docs
        .map((doc) => {
          return {
            id: doc.id,
            author: {
              ...doc.data().profile,
            },
          } as friends;
        })
        .filter((doc) => !myFriends.includes(String(doc.id)));
      console.log({ data });
      return data;
    } catch (error) {
      console.error(error);
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
                photoURL: profile ? checkPhotoURL(profile.photoURL) : null,
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
