import CreatePostForm from "@/components/Form/CreatePost";

export default function AddPost() {
  return <CreatePostForm />;
  // const text = textRef.current?.innerHTML.replaceAll("<div>", "hello");
  // .replace(/<div>/g, "<br>")!

  // const replace = str.replaceAll(/<div>/g, "<br>");

  const handleInput = () => {
    // const inputValue = e.currentTarget?.innerHTML;
    // setText(inputValue.replace(/<div>/g, "<br>"));
    // setText(e.currentTarget.innerHTML.replace(/<div>/g, "<br>"));
    // setText(
    //   (prev) => prev + textRef.current?.innerHTML.replace(/<div>/g, "<br>")
    // );
  };

  const handleContentChange = (e: unknown) => {
    // const selection = window.getSelection();
    // const range = selection?.getRangeAt(0);
    // if (!range || !selection) return;
    // const { startOffset, endOffset } = range;
    // range.setStart(range.startContainer, startOffset);
    // range.setEnd(range.endContainer, endOffset);
    // selection.removeAllRanges();
    // selection.addRange(range);
    // const updatedContent = textRef.current?.innerHTML?.replace(
    //   /<div>/g,
    //   "<br>"
    // );
    // const updatedContent = textRef?.current?.innerHTML.replace(
    //   /<div>/g,
    //   "<br>"
    // );
    // if (!textRef.current || textRef.current.textContent) return;
  };

  //__html: content.replaceAll(/<\/?[^>]+(>|$)/gi, ""),
}
