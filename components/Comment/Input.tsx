import s from "./index.module.scss";
export default function CommentInput({}) {
  return (
    <div className={s.input}>
      <input aria-label="Type Comment" placeholder="Add comment" type="text" />
      {/* <button ></button> */}
      <button
        aria-label="Submit Comment"
        title="Submit Comment"
        tabIndex={1}
        type="submit"
      >
        Post
      </button>
    </div>
  );
}
