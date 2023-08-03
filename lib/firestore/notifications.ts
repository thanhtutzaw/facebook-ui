import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { Post, account, notiContentTypes } from "../../types/interfaces";
import { db } from "../firebase";
export async function sendAppNoti(
  uid: string,
  post: Post,
  profile: account["profile"],
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
    // ...getMessage(type, userName),
    type,
    userName,
    createdAt: serverTimestamp(),
    photoURL,
    url,
  };
  //   console.log(data);
  await setDoc(notifRef, data);
}
export const getMessage = (type: notiContentTypes, userName: string) => {
  switch (type) {
    case "reaction":
      return {
        message: `${userName} reacted to this post.`,
      };
      break;
    case "comment":
      return {
        message: `${userName} commented on this post.`,
      };
      break;
    case "share":
      return {
        message: `${userName} shared this post.`,
      };
      break;

    default:
      break;
  }
};
