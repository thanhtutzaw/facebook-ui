import { auth } from "firebase-admin";
import { useRouter } from "next/router";
import React from "react";
import BackHeader from "../../components/Header/BackHeader";
import s from "../../styles/Home.module.scss";
import CreatePostForm from "../../components/Input/CreatePostForm";
export default function Page() {
  const router = useRouter();
  const postId = router.query.id;
  return <CreatePostForm sharePost={postId!} />;
}
