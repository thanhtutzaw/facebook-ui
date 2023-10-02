import s from "./index.module.scss";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { User } from "firebase/auth";
import Image from "next/image";

export default function ChatInput({
  currentUser,
}: {
  currentUser: User | null;
}) {
  return (
    <form className={s.input}>
      {currentUser ? (
        <Image
          className={s.profile}
          width={200}
          height={200}
          priority
          alt={currentUser?.displayName ?? "Unknow User"}
          src={currentUser?.photoURL ?? ""}
        />
      ) : (
        <div
          style={{
            width: "50px",
            height: "50px",
            backgroundColor: "rgb(230, 230, 230)",
            borderRadius: "100%",
          }}
        ></div>
      )}
      <input // onChange={(e) => {
        //   settext(e.target.value);
        // }}
        aria-label="Type Message"
        placeholder="Send Message"
        type="text"
      />
      <button
        onClick={async (e) => {
          e.preventDefault();
          // if (!uid) {
          //   alert("User not Found ! Sign in and Try again !");
          // }
          // if (text === "") return;
          // try {
          //   setaddLoading(true);
          //   batch.set(commentRef, {
          //     id: commentRef.id,
          //     authorId: uid,
          //     text,
          //     createdAt: serverTimestamp(),
          //   });
          //   batch.update(postRef, {
          //     commentCount: previousCommentCount + 1,
          //   });
          //   await batch.commit();
          //   router.replace(router.asPath, undefined, { scroll: false });
          //   settext("");
          //   setaddLoading(false);
          // } catch (error: any) {
          //   setaddLoading(false);
          // }
        }}
        aria-label="Send Message"
        tabIndex={1}
        type="submit"
      >
        <FontAwesomeIcon icon={faPaperPlane} />
      </button>
    </form>
  );
}
