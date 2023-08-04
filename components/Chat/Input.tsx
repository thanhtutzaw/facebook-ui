import s from "./index.module.scss";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function ChatInput() {
  return (
    <form className={s.input}>
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
          //   console.log(error);
          //   alert(error.message);
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
