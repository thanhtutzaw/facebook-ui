import { faPhotoFilm } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/router";
import { useContext, useEffect, useRef, useState } from "react";
import BackHeader from "../../components/Header/BackHeader";
import Input from "../../components/Input/Input";
import MediaInput from "../../components/Input/MediaInput";
import PhotoLayout from "../../components/Post/PhotoLayout";
import { SelectVisiblity } from "../../components/Post/SelectVisiblity";
import { PageContext, PageProps } from "../../context/PageContext";
import { app } from "../../lib/firebase";
import { addPost } from "../../lib/firestore/post";
import { uploadMedia } from "../../lib/storage";
import s from "../../styles/Home.module.scss";
import { Post } from "../../types/interfaces";
import useLocalStorage from "../../hooks/useLocalStorage";
import FooterInput from "../../components/Input/FooterInput";
import CreatePostForm from "../../components/Input/CreatePostForm";
export default function AddPost() {
  // const text = textRef.current?.innerHTML.replaceAll("<div>", "hello");
  // .replace(/<div>/g, "<br>")!
  // const [replacedStr, setReplacedStr] = useState(originalStr);
  // const [replacedStr, setReplacedStr] = useState("<h1>u</h1>");

  // const replace = str.replaceAll(/<div>/g, "<br>");
  // useEffect(() => {
  //   const element = textRef.current;
  //   if (element) {
  //     const replacedHTML = element.innerHTML.replace(/<div>/g, "<br>");
  //   }
  // }, [originalStr]);

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

  // if (!auth?.currentUser?.uid) return <p>Redirecting... to /login</p>;
  return <CreatePostForm />;
  //__html: content.replaceAll(/<\/?[^>]+(>|$)/gi, ""),
}
