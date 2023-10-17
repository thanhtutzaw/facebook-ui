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
import { friends } from "../../types/interfaces";
import { NotiAction } from "../NotiAction";
import { db } from "../firebase";
import { NotiApiRequest } from "@/pages/api/sendFCM";
import { getMessage } from "./notifications";
type FriendsWithAuthor<T> = T extends { author: any }
  ? T
  : T & { author: friends["author"] };
type FriendsWithNonNullableAuthor = friends & {
  author: friends["author"];
};
type NonNullableFriendsAuthor = Omit<friends, "author"> & {
  author: NonNullable<friends["author"]>;
};

export async function addFriends(
  uid: string,
  f: friends,
  // f: FriendsWithAuthor<friends>,
  // f: friends & {author:friends["author"]},
  // profile:account["profile"],
  currentUser?: (User & { photoURL_cropped?: string }) | null
) {
  const isFriendsQuery = doc(db, `users/${uid}/friends/${f.id}`);
  const friendDoc = await getDoc(isFriendsQuery);
  if (friendDoc.exists()) {
    alert("Fail to Add . User already added , blocked or pending state .");
    window.location.reload();
    return;
  }
  const { author, ...data } = { ...f };
  const reqCountRef = doc(db, `users/${f.id}/friendReqCount/reqCount`);
  const senderData = {
    ...data,
    status: "pending",
    createdAt: serverTimestamp(),
    senderId: uid,
  } as friends & { senderId: string };
  const receiptData = {
    ...senderData,
    id: uid,
  } as friends & { senderId: string };
  console.log({ senderData, receiptData });
  const senderRef = doc(db, `users/${receiptData.id}/friends/${senderData.id}`);
  const receiptRef = doc(
    db,
    `users/${senderData.id}/friends/${receiptData.id}`
  );
  // console.log(author);
  // const senderName = `${author?.firstName ?? "Unknown User"} ${
  //   author?.lastName ?? " "
  // }`;
  const senderProfilePicture = `${
    currentUser?.photoURL
      ? currentUser?.photoURL
      : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
  }`;
  console.log({ currentUser });
  try {
    await setDoc(senderRef, senderData);
    await setDoc(receiptRef, receiptData);
    const doc = await getDoc(reqCountRef);
    if (doc.exists() && doc.data().count >= 0) {
      await updateDoc(reqCountRef, {
        count: increment(+1),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(reqCountRef, { count: 1, updatedAt: serverTimestamp() });
    }
    console.log({ author });
    try {
      const body: NotiApiRequest["body"] = {
        recieptId: senderData.id,
        message: `${
          currentUser?.displayName ?? "Unknow User"
        } send you a friend request.`,
        icon:
          currentUser?.photoURL_cropped ??
          currentUser?.photoURL ??
          "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png",
        link: `/${receiptData.id}`,
        actionPayload: JSON.stringify({
          uid: senderData.id,
          f: receiptData,
          currentUser: {
            displayName:
              !author?.firstName || !author.lastName
                ? "Unknown User"
                : `${author?.firstName} ${author?.lastName}`,
            photoURL: author?.photoURL,
            photoURL_cropped: author?.photoURL_cropped,
          },
        }),
        actions: JSON.stringify([...NotiAction.friend_request]),
        requireInteraction: true,
      };
      console.log("Sending Notification");
      await fetch("/api/sendFCM", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(body),
      });
      console.log({ body });
      console.log("Notification Sended successfully.");
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
  f: friends,
  currentUser?: (User & { photoURL_cropped?: string }) | null
) {
  if (f.status !== "pending") {
    console.log({ f });
    alert("Already Accepted! in funciton");
    // return;
    throw new Error("Already Accepted!");
  }
  const friendData = {
    id: f.id,
    status: "friend",
    updatedAt: serverTimestamp(),
  } as friends;
  try {
    await setDoc(doc(db, `users/${senderData}/friendReqCount/reqCount`), {
      count: increment(-1),
    });
  } catch (error) {
    console.error("Error updating req count:", error);
  }
  await updateFriendStatus(senderData, friendData);
  const hostName =
    process.env.NODE_ENV === "production"
      ? "https://facebook-ui-zee.vercel.app"
      : "http://localhost:3000";
  try {
    if (!f.senderId) return;
    const body: NotiApiRequest["body"] = {
      recieptId: f.senderId,
      message: `${currentUser?.displayName ?? "Unknown User"} ${
        getMessage("acceptedFriend").message
      }`,
      icon:
        currentUser?.photoURL_cropped ??
        currentUser?.photoURL ??
        "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png",
      link: `/${senderData}`,
    };
    console.log("Sending Notification");
    await fetch(
      `${hostName ?? "https://facebook-ui-zee.vercel.app"}/api/sendFCM`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
    console.log({ body: JSON.stringify(body) });
    console.log({ body });
    console.log("Notification Sended successfully.");
  } catch (error) {
    console.log(error);
  }
}
export async function rejectFriendRequest(uid: string, f: friends) {
  try {
    await unFriend(uid, f);
    const reqCountRef = doc(db, `users/${uid}/friendReqCount/reqCount`);
    await updateDoc(reqCountRef, { count: increment(-1) });
  } catch (error) {
    console.log(error);
  }
}
export async function cancelFriendRequest(uid: string, f: friends) {
  try {
    await unFriend(uid, f);
    const reqCountRef = doc(db, `users/${f.id}/friendReqCount/reqCount`);
    await updateDoc(reqCountRef, { count: increment(-1) });
  } catch (error) {
    console.log(error);
  }
}
export async function unBlockFriend(
  uid: string,
  f: { id: string; senderId: string } | friends
) {
  console.log(uid, f.senderId);
  try {
    if (uid !== f.senderId) {
      alert(
        "Unblocking not allowed ! \n Only authorized user can unblock friend ."
      );
      return;
    }
    await unFriend(uid, f);
  } catch (error) {
    console.log(error);
  }
}
export async function unFriend(uid: string, f: { id: friends["id"] }) {
  await deleteDoc(doc(db, `users/${uid}/friends/${String(f.id)}`));
  await deleteDoc(doc(db, `users/${String(f.id)}/friends/${uid}`));
}
export async function blockFriend(uid: string, f: friends) {
  const { author, ...data } = { ...f };
  const blockedData = {
    ...data,
    status: "block",
    updatedAt: serverTimestamp(),
    senderId: uid,
  } as friends;
  if (f.status === "pending") {
    try {
      await setDoc(doc(db, `users/${f.id}/friendReqCount/reqCount`), {
        count: increment(-1),
      });
    } catch (error) {
      console.error("Error updating req count:", error);
    }
  }
  await updateFriendStatus(uid, blockedData);
}

async function updateFriendStatus(senderId: string, receipt: friends) {
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
