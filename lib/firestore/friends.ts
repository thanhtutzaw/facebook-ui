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
  const isFriendsQuery = doc(db, `users/${uid}/friends/${f.id}`);
  const friendDoc = await getDoc(isFriendsQuery);
  if (friendDoc.exists()) {
    alert("Fail to Add . User already added , blocked or pending state .");
    window.location.reload();
    return;
  }
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
    console.log(`send fcm to ${senderData.id}`);
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
        icon:
          currentUser?.photoURL_cropped ??
          currentUser?.photoURL ??
          "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png",
        badge: "/badge.svg",
        link: `/${receiptData.id}`,
        actionPayload: JSON.stringify({
          uid: receiptData.id,
          f: receiptData,
          currentUser,
        }),
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
  senderData: string,
  f: friends,
  currentUser?: (User & { photoURL_cropped?: string }) | null
) {
  // const { author, ...data } = { ...f };
  const friendData = {
    // ...data,
    id: f.id,
    status: "friend",
    updatedAt: serverTimestamp(),
  } as friends;
  // const receiptData = { ...acceptedData, id: uid };
  // await setDoc(reqCountRef, { count: increment(+1) });
  // const reqCountRef = ;
  // await setDoc(reqCountRef, { count: increment(-1) });//this doesn't run
  // console.log(`reqPath ${f.senderId}`);
  //72Gp1tmlBwRxdUe8EPKTk6iIgRh2 (No) //J3YKWcohocYfWyMMhz8PJDWOb3k1 ( Yes )
  try {
    await setDoc(doc(db, `users/${senderData}/friendReqCount/reqCount`), {
      count: increment(-1),
    });
    // await updateDoc(doc(db, `users/${f.senderId}/friendReqCount/reqCount`), {
    //   count: increment(-1),
    // });
    console.log("updated count");
  } catch (error) {
    console.error("Error updating count:", error);
  }
  await updateFriendStatus(senderData, friendData); //this run
  console.log("updated accepte");
  // const basePath = window?.location?.origin;
  // console.log(basePath);
  // await fetch(`/api/sendFCM`, {
  //   method: "POST",
  //   headers: {
  //     "Content-type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     recieptId: f.senderId,
  //     message: `${
  //       currentUser?.displayName ?? "Unknown User"
  //     } accepted your friend request.`,
  //     icon:
  //       currentUser?.photoURL_cropped ??
  //       currentUser?.photoURL ??
  //       "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png",
  //     badge: "/badge.svg",
  //     link: `/${uid}`,
  //   }),
  // });
  console.log("accepted");
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
export async function unFriend(uid: string, f: { id: friends["id"] }) {
  // if(!f?.id && typeof f.id !=="string") return;
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
  await updateFriendStatus(uid, blockedData);
}

async function updateFriendStatus(senderId: string, receipt: friends) {
  const adminData = { ...receipt, id: senderId };
  // const { id: myId } = senderId;
  const { id: friendId } = receipt;
  const adminRef = doc(db, `users/${senderId}/friends/${friendId}`);
  const receiptRef = doc(db, `users/${friendId}/friends/${senderId}`);
  try {
    await updateDoc(adminRef, adminData);
    await updateDoc(receiptRef, receipt);
    console.log("Updated Success");
  } catch (error) {
    console.log(error);
    throw error;
  }
}
