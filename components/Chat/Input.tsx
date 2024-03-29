import { usePageContext } from "@/context/PageContext";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";

export default function ChatInput() {
  const { currentUser } = usePageContext();
  return (
    <form
      className={`bg-white border-t border-[#dfdfdf] fixed bottom-0 p-[.8rem] flex justify-between w-screen max-w-main gap-[10px] items-center`}
    >
      {currentUser ? (
        <Image
          className={` rounded-full
    object-cover
    b-0
    w-[50px]
    h-[50px]
    flex
    outline-[1px solid rgba(128,128,128,0.168627451)] bg-avatarBg`}
          width={200}
          height={200}
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
        />
      )}
      <input
        className="
        border-0
        rounded-2xl
        text-base
      p-2
        flex-1
        min-w-[10px]
        overflow-hidden
        overflow-ellipsis
        outline-[1px]
        outline
        outline-[rgb(213_213_213)]
        focus-visible:outline
        focus-visible:outline-[rgb(191_191_191)]
      "
        aria-label="Type Message"
        placeholder="Send Message"
        type="text"
      />
      <button
        className="bg-transparent
        text-primary
        flex
        justify-center
        items-center
        transition-all 0.1s ease-in-out
        p-2.5
        active:scale-90 active:bg-[#0269e242]
        border-0
        rounded-2xl
        text-base
        "
        onClick={async (e) => {
          e.preventDefault();
          // if (text === "") return;
          // try {
          //   batch.set(commentRef, {
          //     id: commentRef.id,
          //     authorId: uid,
          //     text,
          //     createdAt: serverTimestamp(),
          //   });
          //   batch.update(postRef, {
          //     commentCount: previousCommentCount + 1,
          //   });
          //   router.replace(router.asPath, undefined, { scroll: false });
        }}
        aria-label="Send Message"
        tabIndex={1}
        type="submit"
      >
        <FontAwesomeIcon className="w-[25px] h-[25px]" icon={faPaperPlane} />
      </button>
    </form>
  );
}
