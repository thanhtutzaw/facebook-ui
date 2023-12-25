import { handleReply } from "@/components/Comment/Input";
import { NotiAction } from "@/lib/NotiAction";
import { loveComment } from "@/lib/firestore/comment";
import { acceptFriends } from "@/lib/firestore/friends";
import { Comment } from "@/types/interfaces";
import { User } from "firebase/auth";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { action } = req.query as { action: keyof typeof NotiAction };
  console.log(req.query);
  console.log(req.body);
  // const actionType = String(action) as keyof typeof NotiAction;
  try {
    const {
      text,
      content,
      replyInput,
      commentAuthorId,
      profile,
      uid,
      postId,
      commentId,
      authorId,
      currentUserProfile,
      parentId,
    } = req.body as {
      text: string;
      content: string;
      parentId: string;
      uid: string;
      profile: any;
      replyInput: {
        comment: Comment | null;
        authorFirstReplyId: string;
        text: string;
        id: string;
        authorId: string;
        authorName: string;
        parentId: string;
        nested: boolean;
        ViewmoreToggle: boolean;
      };
      currentUserProfile:
        | (Partial<User> & {
            photoURL_cropped?: string | undefined;
          })
        | null;
      commentAuthorId: string;
      postId: string;
      commentId: string;
      authorId: string;
    };
    switch (action) {
      case "comment_like":
        await loveComment({
          parentId,
          content,
          commentAuthorId: commentAuthorId ?? replyInput.comment?.authorId,
          profile: profile ?? currentUserProfile,
          postId,
          commentId,
          authorId,
          uid,
        });
        
        break;
      case "accept_friend":
        const { f, currentUser } = req.body;
        await acceptFriends(uid, f, currentUser);
        break;
      case "comment_reply":
        await handleReply({
          commentAuthorId,
          text,
          uid,
          replyInput,
          authorId,
          postId,
          profile,
          currentUserProfile,
          commentId,
        });
        console.log({ you_are_replying_to_comment: req.body });
        break;
      default:
        break;
    }
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Noti Click Trigger Action failed:", error);
    // Respond with an error status if the action fails.
    res
      .status(500)
      .json({ success: false, error: "Noti Click Trigger Action failed" });
  }
}
