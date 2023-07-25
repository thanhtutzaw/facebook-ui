import CreatePostForm from "../../components/Input/CreatePostForm";
export default function AddPost() {
  // const text = textRef.current?.innerHTML.replaceAll("<div>", "hello");
  // .replace(/<div>/g, "<br>")!
  // const [replacedStr, setReplacedStr] = useState(originalStr);
  // const [replacedStr, setReplacedStr] = useState("<h1>u</h1>");
  return <CreatePostForm />;

  // const replace = str.replaceAll(/<div>/g, "<br>");

  const handleInput = (e: {
    currentTarget: { innerHTML: any; textContent: string };
  }) => {
    // if (!textRef.current) return;
    const inputValue = e.currentTarget?.innerHTML;
    // setText(inputValue.replace(/<div>/g, "<br>"));
    // setText(e.currentTarget.innerHTML.replace(/<div>/g, "<br>"));
    // setText(
    //   (prev) => prev + textRef.current?.innerHTML.replace(/<div>/g, "<br>")
    // );
  };

  const handleContentChange = (e: { currentTarget: { innerHTML: string } }) => {
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
