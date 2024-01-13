import { handleReply } from "@/components/Comment/Input";
import { NotiAction } from "@/lib/NotiAction";
import { loveComment } from "@/lib/firestore/comment";
import { acceptFriends } from "@/lib/firestore/friends";
import { Comment, friends } from "@/types/interfaces";
import { User } from "firebase/auth";
import { NextApiRequest, NextApiResponse } from "next";
type n = keyof typeof NotiAction;
type TAction = { action: keyof typeof NotiAction };
type TBody = {
  text: string;
  content: string;
  parentId: string;
  uid: string;
  profile: User & { photoURL_cropped?: string | undefined };
  f: friends;
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
interface triggerApiRequest extends NextApiRequest {
  body: TBody;
  query: TAction;
}
export default async function handleTriggerNotiAction(
  req: triggerApiRequest,
  res: NextApiResponse
) {
  const { action } = req.query;
  let success = false;
  console.log({ trigger_api: { query: req.query, body: req.body } });
  let data: {} | null | void | [] = {};
  const successJSONAll = { action, body: req.body ? req.body : null };
  const notFoundBodyError = `Request Body not Found in ${req.method} method ! `;
  const notAllowMethodError = "Method Not Allowed";
  switch (req.method) {
    case "POST":
      checkAction();
      if (!req.body) {
        res.status(404).json({
          error: notFoundBodyError,
        });
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
          f: friends,
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
            const { paramError } = checkParam(
              Object.keys({
                ...params,
                ...extraParams,
              }) as (keyof TBody)[]
            );
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
            if (!uid || !friends || !currentUser) {
              throw new Error(
                `Required parameters are missing for '${action}' action`
              );
            } else {
              try {
                data = await acceptFriends(uid, friends, currentUser);
                res.status(200).json({ success: true, ...data });
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

            const { paramError } = checkParam(
              Object.keys(comment_reply_params) as (keyof TBody)[]
            );

            if (!paramError) {
              try {
                data = await handleReply(comment_reply_params);
                console.log({ you_are_replying_to_comment: req.body });
                res.status(200).json({ success: true, ...data });
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
        success = true;
        res.status(200).json({ success: true, data, ...successJSONAll });
      }
      break;
    case "GET":
      checkAction();
      res.status(405).json({
        success: true,
        message: `Method '${req.method}' Not Allowed`,
        data,
        ...successJSONAll,
      });
      break;
    default:
      res.status(405).json({ error: notAllowMethodError });
      break;
  }

  function successJSON() {
    res.status(200).json({ success: true, ...data });
  }
  function badRequestJSON(message: string) {
    res.status(400).json({ message: message ?? "Bad Request" });
  }
  function checkAction() {
    if (!NotiAction[action])
      res.status(400).json({ error: `Invalid Action! '${action}'` });
  }
  function checkParam(requireKeys: (keyof TBody)[]) {
    const paramError = !requireKeys.every((key) =>
      req.body.hasOwnProperty(key)
    );
    const required = requireKeys.filter(
      (value) => !Object.keys(req.body).includes(value)
    );
    if (paramError) {
      throwParamError(required);
    }
    return { paramError };
  }
  function throwParamError(required2: string[]) {
    res.status(400).json({
      error: `Required parameters (${required2.toString()}) are missing for '${action}' action`,
    });
    throw new Error(
      `Required parameters ${
        required2.length > 0 ? `(${required2.toString()})` : ""
      } are missing for '${action}' action`
    );
  }
}
