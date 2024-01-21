import { User } from "firebase/auth";
import {
  deleteDoc,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { friend } from "../../types/interfaces";
import { NotiAction } from "../NotiAction";
import { db } from "../firebase";
import { getMessage, sendFCM } from "./notifications";
import { checkPhotoURL } from "./profile";
type FriendsWithAuthor<T> = T extends { author: any }
  ? T
  : T & { author: friend["author"] };
type FriendsWithNonNullableAuthor = friend & {
  author: friend["author"];
};
type NonNullableFriendsAuthor = Omit<friend, "author"> & {
  author: NonNullable<friend["author"]>;
};

export async function addFriends(
  uid: string,
  friend: friend,
  // friend: FriendsWithAuthor<friend>,
  // friend: friend & {author:friend["author"]},
  currentUser?: (User & { photoURL_cropped?: string }) | null
) {
  const isFriendsQuery = doc(db, `users/${uid}/friends/${friend.id}`);
  const friendDoc = await getDoc(isFriendsQuery);
  if (friendDoc.exists()) {
    alert("Fail to Add . User already added , blocked or pending state .");
    window.location.reload();
    return;
  }
  const { author, ...data } = { ...friend };
  const reqCountRef = doc(db, `users/${friend.id}/friendReqCount/reqCount`);
  const senderData = {
    ...data,
    status: "pending",
    createdAt: serverTimestamp(),
    senderId: uid,
  } as friend & { senderId: string };
  const receiptData = {
    ...senderData,
    id: uid,
  } as friend & { senderId: string };
  const senderRef = doc(db, `users/${receiptData.id}/friends/${senderData.id}`);
  const receiptRef = doc(
    db,
    `users/${senderData.id}/friends/${receiptData.id}`
  );
  try {
    const [reqCountDoc] = await Promise.all([
      getDoc(reqCountRef),
      setDoc(senderRef, senderData),
      setDoc(receiptRef, receiptData),
    ]);
    const reqCountExist = reqCountDoc.exists() && reqCountDoc.data().count >= 0;
    if (reqCountExist) {
      await updateDoc(reqCountRef, {
        count: increment(+1),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(reqCountRef, { count: 1, updatedAt: serverTimestamp() });
    }
    try {
      await sendFCM({
        recieptId: senderData.id,
        message: `${
          currentUser?.displayName ?? "Unknow User"
        } send you a friend request.`,
        icon: checkPhotoURL(
          currentUser?.photoURL_cropped ?? currentUser?.photoURL
        ),
        link: `/${receiptData.id}`,
        actionPayload: JSON.stringify({
          uid: senderData.id,
          friend: receiptData,
          currentUser: {
            displayName:
              !author?.firstName || !author.lastName
                ? "Unknown User"
                : `${author?.firstName} ${author?.lastName}`,
            photoURL: author?.photoURL,
            photoURL_cropped: author?.photoURL_cropped,
          },
        }),
        actions: [NotiAction.accept_friend, NotiAction.view_profile],
        requireInteraction: true,
      });
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export async function acceptFriends(
  senderData: string,
  friend: friend,
  currentUser?: (User & { photoURL_cropped?: string }) | null
) {
  if (friend.status !== "pending") {
    alert("Already Accepted! in acceptFriends funciton");
    throw new Error("Already Accepted! in acceptFriends funciton");
  }
  const friendData: friend = {
    id: friend.id,
    status: "friend",
    updatedAt: serverTimestamp(),
  };
  try {
    await setDoc(doc(db, `users/${senderData}/friendReqCount/reqCount`), {
      count: increment(-1),
    });
  } catch (error) {
    console.error("Error updating req count:", error);
  }
  await updateFriendStatus(senderData, friendData);

  try {
    if (!friend.senderId) return;
    const message = `${currentUser?.displayName ?? "Unknown User"} ${getMessage(
      "acceptedFriend"
    )}`;
    await sendFCM({
      recieptId: friend.senderId,
      message,
      icon: checkPhotoURL(
        currentUser?.photoURL_cropped ?? currentUser?.photoURL
      ),
      link: `/${senderData}`,
    });
    return { message };
  } catch (error) {
    console.log(error);
  }
}
export async function rejectFriendRequest(uid: string, friend: friend) {
  try {
    await unFriend(uid, friend);
    const reqCountRef = doc(db, `users/${uid}/friendReqCount/reqCount`);
    await updateDoc(reqCountRef, { count: increment(-1) });
  } catch (error) {
    console.log(error);
  }
}
export async function cancelFriendRequest(uid: string, friend: friend) {
  try {
    await unFriend(uid, friend);
    const reqCountRef = doc(db, `users/${friend.id}/friendReqCount/reqCount`);
    await updateDoc(reqCountRef, { count: increment(-1) });
  } catch (error) {
    console.log(error);
  }
}
export async function unBlockFriend(
  uid: string,
  friend: { id: string; senderId: string } | friend
) {
  console.log(uid, friend.senderId);
  try {
    if (uid !== friend.senderId) {
      alert(
        "Unblocking not allowed ! \n Only authorized user can unblock friend ."
      );
      return;
    }
    await unFriend(uid, friend);
  } catch (error) {
    console.log(error);
  }
}
export async function unFriend(uid: string, friend: { id: friend["id"] }) {
  await deleteDoc(doc(db, `users/${uid}/friends/${String(friend.id)}`));
  await deleteDoc(doc(db, `users/${String(friend.id)}/friends/${uid}`));
}
export async function blockFriend(uid: string, friend: friend) {
  const { author, ...data } = { ...friend };
  const blockedData: friend = {
    ...data,
    status: "block",
    updatedAt: serverTimestamp(),
    senderId: uid,
  };
  if (friend.status === "pending") {
    try {
      await setDoc(doc(db, `users/${friend.id}/friendReqCount/reqCount`), {
        count: increment(-1),
      });
    } catch (error) {
      console.error("Error updating req count:", error);
    }
  }
  await updateFriendStatus(uid, blockedData);
}

async function updateFriendStatus(senderId: string, receipt: friend) {
  const adminData = { ...receipt, id: senderId };
  const { id: friendId } = receipt;
  const adminRef = doc(db, `users/${senderId}/friends/${friendId}`);
  const receiptRef = doc(db, `users/${friendId}/friends/${senderId}`);
  try {
    await updateDoc(adminRef, adminData);
    await updateDoc(receiptRef, receipt);
    console.log("Friend status updated successfully to - " + receipt.status);
  } catch (error) {
    console.log(error);
    throw error;
  }
}
