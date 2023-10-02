import {
  deleteDoc,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { account, friends } from "../../types/interfaces";
import { db } from "../firebase";
import { NotiAction } from "../NotiAction";
import { User } from "firebase/auth";
import { resizeImage } from "../resizeImage";

export async function addFriends(
  uid: string,
  f: friends,
  // profile:account["profile"],
  currentUser?: (User & { photoURL_cropped?: string }) | null
) {
  const { author, ...data } = { ...f };
  const reqCountRef = doc(db, `users/${f.id}/friendReqCount/reqCount`);
  console.log({ currentUser });
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
    console.log({ currentUser });
    await fetch("/api/sendFCM", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        recieptId: senderData.id,
        message: `${
          currentUser?.displayName ?? "Unknow User"
        } send you a friend request.`,
        // icon: "/_next/image?url=https%3A%2F%2Ffirebasestorage.googleapis.com%2Fv0%2Fb%2Ffacebook-37f93.appspot.com%2Fo%2FprofilePictures%252Fezgif.com-crop.gif%3Falt%3Dmedia%26token%3Dbe48d949-7d75-4a3d-84f0-a970b26534cd&w=256&q=75",
        icon:
          currentUser?.photoURL_cropped ??
          currentUser?.photoURL ??
          "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png",
        badge: "/badge.svg",
        link: `/${receiptData.id}`,
        actions: JSON.stringify([...NotiAction.friend_request]),
        // webpush: {
        //   fcm_options: {
        //     link: `https://facebook-ui-zee.vercel.app/${post.authorId}/${post.id}`,
        //   },
        // },
      }),
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export async function acceptFriends(
  uid: string,
  f: friends,
  currentUser?: (User & { photoURL_cropped?: string }) | null
) {
  const { author, ...data } = { ...f };
  const acceptedData = {
    ...data,
    status: "friend",
    updatedAt: serverTimestamp(),
  } as friends;
  // const receiptData = { ...acceptedData, id: uid };
  // await setDoc(reqCountRef, { count: increment(+1) });
  const reqCountRef = doc(db, `users/${uid}/friendReqCount/reqCount`);
  await setDoc(reqCountRef, { count: increment(-1) });
  await updateFriendStatus(uid, acceptedData);

  await fetch("/api/sendFCM", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({
      recieptId: f.senderId,
      message: `${
        currentUser?.displayName ?? "Unknown User"
      } accepted your friend request.`,
      icon: currentUser?.photoURL_cropped
        ? currentUser?.photoURL_cropped
        : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png",
      badge: "/badge.svg",
      link: `/${uid}`,
    }),
  });
}
export async function rejectFriendRequest(uid: string, f: friends) {
  try {
    await unFriend(uid, f);
    const reqCountRef = doc(db, `users/${uid}/friendReqCount/reqCount`);
    // await setDoc(reqCountRef, { count: increment(-1) });
    // const reqCountRef = doc(db, `users/${uid}/friendReqCount/reqCount`);
    await updateDoc(reqCountRef, { count: increment(-1) });
  } catch (error) {
    console.log(error);
  }
}
export async function cancelFriendRequest(uid: string, f: friends) {
  try {
    await unFriend(uid, f);
    const reqCountRef = doc(db, `users/${f.id}/friendReqCount/reqCount`);
    // await setDoc(reqCountRef, { count: increment(-1) });
    // const reqCountRef = doc(db, `users/${uid}/friendReqCount/reqCount`);
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
export async function unFriend(uid: string, f: friends) {
  await deleteDoc(doc(db, `users/${uid}/friends/${f.id}`));
  await deleteDoc(doc(db, `users/${f.id}/friends/${uid}`));
}
export async function blockFriend(uid: string, f: friends) {
  const { author, ...data } = { ...f };
  const blockedData = {
    ...data,
    status: "block",
    updatedAt: serverTimestamp(),
    senderId: uid,
  } as friends;
  await updateFriendStatus(uid, blockedData);
}

async function updateFriendStatus(uid: string, senderData: friends) {
  const receiptData = { ...senderData, id: uid };
  const { id: myId } = receiptData;
  const { id: friendId } = senderData;
  const senderRef = doc(db, `users/${myId}/friends/${friendId}`);
  const receiptRef = doc(db, `users/${friendId}/friends/${myId}`);
  try {
    await updateDoc(senderRef, senderData);
    await updateDoc(receiptRef, receiptData);
  } catch (error) {
    console.log(error);
    throw error;
  }
}
