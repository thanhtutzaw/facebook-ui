import { handleReply } from "@/components/Comment/Input";
import { NotiAction } from "@/lib/NotiAction";
import { loveComment } from "@/lib/firestore/comment";
import { acceptFriends } from "@/lib/firestore/friends";
import { checkCookies, checkParam } from "@/lib/utils";
import { Comment, friend } from "@/types/interfaces";
import { User } from "firebase/auth";
import { NextApiRequest, NextApiResponse } from "next";
type TBody = {
  text: string;
  content: string;
  parentId: string;
  uid: string;
  profile: User & { photoURL_cropped?: string | undefined };
  friend: friend;
  currentUser:
    | (User & { photoURL_cropped?: string | undefined })
    | null
    | undefined;
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
type triggerApiRequest = NextApiRequest & {
  body: TBody;
  query: { action: keyof typeof NotiAction };
};
export default async function handleTriggerNotiAction(
  req: triggerApiRequest,
  res: NextApiResponse
) {
  const { action } = req.query;
  await checkCookies({ req, res });
  let data: unknown;
  const payload = { action, body: req.body ? req.body : null };
  const notFoundBodyError = `Request Body not Found in ${req.method} method ! `;
  const notAllowMethodError = "Method Not Allowed";
  switch (req.method) {
    case "POST":
      checkTriggerAction();
      if (!req.body) {
        res.status(404).end(notFoundBodyError);
        throw new Error(notFoundBodyError);
      } else {
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
          friend,
          currentUser,
        } = req.body;

        if (action) {
          if (action === "comment_like") {
            const params = {
              content,
              commentAuthorId:
                commentAuthorId ??
                (replyInput &&
                  replyInput.comment &&
                  replyInput.comment.authorId),
              profile: profile ?? currentUserProfile,
              postId,
              commentId,
              authorId,
              uid,
              parentId,
            };
            const extraParams = {
              replyInput,
              currentUserProfile,
            };
            const requireParams = Object.keys({
              ...params,
              ...extraParams,
            }) as (keyof TBody)[];
            const { paramError } = checkParam({
              requiredParamLists: requireParams,
              res,
              req,
            });
            if (!paramError) {
              try {
                data = await loveComment(params);
                successJSON();
              } catch (error) {
                res.status(500).json({ error });
                throw new Error(`${error}`);
              }
            }
          } else if (action === "accept_friend") {
            const requiredParamLists = Object.keys({
              uid,
              friend,
              currentUser,
            });
            checkParam({ requiredParamLists: requiredParamLists, req, res });
            if (!uid || !friend || !currentUser) {
              throw new Error(`Required parameters are missing`);
            } else {
              try {
                data = await acceptFriends(uid, friend, currentUser);
                res.status(200).json({ success: true, data });
              } catch (error) {
                res.status(500).json({ error });
                throw new Error(`${error}`);
              }
            }
          } else if (action === "comment_reply") {
            const comment_reply_params = {
              commentAuthorId,
              text,
              uid,
              replyInput,
              authorId,
              postId,
              profile,
              currentUserProfile,
              commentId,
            };
            const { paramError } = checkParam({
              requiredParamLists: Object.keys(
                comment_reply_params
              ) as (keyof TBody)[],
              req,
              res,
            });
            if (!paramError) {
              try {
                data = await handleReply(comment_reply_params);
                console.log({ you_are_replying_to_comment: req.body });
                res.status(200).json({ success: true, data });
              } catch (error) {
                res.status(500).json({ error });
                throw new Error(`${error}`);
              }
            }
          } else {
            res.status(400).json({
              error: "Invalid Action!",
              action,
            });
          }
        } else {
          badRequestJSON("Not Found Action");
        }
        res.status(200).json({ success: true, data, ...payload });
      }
      break;
    case "GET":
      checkTriggerAction();
      res.status(200).json({
        success: true,
        data,
        ...payload,
      });
      break;
    default:
      res.status(405).json({ error: notAllowMethodError });
      break;
  }

  function successJSON() {
    res.status(200).json({ success: true, data });
  }
  function badRequestJSON(message: string) {
    res.status(400).json({ message: message ?? "Bad Request" });
  }
  function checkTriggerAction() {
    if (!action) {
      res.status(400).json({ error: "Action Required!" });
    } else if (!NotiAction[action]) {
      res.status(400).json({ error: `Invalid Action! '${action}' ` });
    }
  }
}
