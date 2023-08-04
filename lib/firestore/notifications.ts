import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { Post, account, notiContentTypes } from "../../types/interfaces";
import { db } from "../firebase";

export async function sendAppNoti(
  uid: string,
  post: Post,
  profile: account["profile"] | null,
  type: notiContentTypes
) {
  const { authorId, id } = post;
  if (authorId === uid) return;
  const url = `https://facebook-ui-zee.vercel.app/${authorId}/${id}`;
  const photoURL =
    profile?.photoURL ??
    "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";
  const notifRef = doc(collection(db, `users/${authorId}/notifications`));
  const userName = `${profile?.firstName} ${profile?.lastName}`;
  const data = {
    type,
    userName,
    createdAt: serverTimestamp(),
    photoURL,
    url,
    uid,
  };
  await setDoc(notifRef, data);
}

export const getMessage = (type: notiContentTypes) => {
  const messages: Record<notiContentTypes, string> = {
    reaction: `reacted this post.`,
    comment: `commented on this post.`,
    share: `shared this post.`,
  };
  return { message: messages[type] || "" };
};
