import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import {
  Timestamp,
  collection,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { GetServerSideProps } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import nookies from "nookies";
import { useCallback, useContext, useState } from "react";
import BackHeader from "../../components/Header/BackHeader";
import { PostList } from "../../components/Sections/Home/PostList";
import s from "../../components/Sections/Profile/index.module.scss";
import { LIMIT } from "../../context/AppContext";
import { PageContext, PageProps } from "../../context/PageContext";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import { db, fethUserDoc, getPostWithMoreInfo } from "../../lib/firebase";
import { verifyIdToken } from "../../lib/firebaseAdmin";
import { Post as PostType, account } from "../../types/interfaces";
export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const uid = context.query.user!;
    const cookies = nookies.get(context);
    const token = (await verifyIdToken(cookies.token)) as DecodedIdToken;
    const user = await fethUserDoc(uid);
    const userExist = user.exists();
    const mypostQuery = query(
      collection(db, `/users/${uid}/posts`),
      where("visibility", "in", ["Friend", "Public"]),
      orderBy("createdAt", "desc"),
      limit(LIMIT)
    );
    const myPost = await getPostWithMoreInfo(uid as string, mypostQuery);
    if (userExist) {
      return {
        props: {
          token,
          user: user.data(),
          myPost,
        },
      };
    } else {
      return {
        notFound: true,
      };
    }
  } catch (error) {
    console.log("SSR Error " + error);
    context.res.writeHead(302, { Location: "/login" });
    context.res.end();
    return {
      props: {
        token: null,
        user: [],
        myPost: [],
      },
    };
  }
};
export default function UserProfile({
  token,
  user,
  myPost,
}: {
  token: DecodedIdToken;
  user: { profile: account["profile"] } & account;
  myPost: PostType[];
}) {
  const { profile } = user;
  const router = useRouter();
  const { setview } = useContext(PageContext) as PageProps;
  const userName = `${profile?.firstName ?? "Unknown"} ${
    profile?.lastName ?? "User"
  }`;
  const [limitedPosts, setlimitedPosts] = useState(myPost);
  const [postLoading, setpostLoading] = useState(false);
  const [postEnd, setPostEnd] = useState(false);
  const fetchMorePosts = useCallback(
    async function () {
      setpostLoading(true);
      const post = limitedPosts?.[limitedPosts?.length - 1]!;
      const date = new Timestamp(
        post.createdAt.seconds,
        post.createdAt.nanoseconds
      );
      const mypostQuery = query(
        collection(db, `/users/${router.query.user}/posts`),
        where("visibility", "in", ["Friend", "Public"]),
        orderBy("createdAt", "desc"),
        startAfter(date),
        limit(LIMIT)
      );
      const finalPost = await getPostWithMoreInfo(token.uid!, mypostQuery)!;
      setlimitedPosts(limitedPosts?.concat(finalPost!));
      setpostLoading(false);

      if (finalPost?.length! < LIMIT) {
        setPostEnd(true);
      }
    },
    [limitedPosts, router.query.user, token?.uid]
  );
  const { scrollRef } = useInfiniteScroll(fetchMorePosts, postEnd, true);
  const bio = profile?.bio === "" || !profile ? "No Bio Yet" : profile?.bio;
  const otherUser = token?.uid !== router.query.user;
  return (
    <div ref={scrollRef} className="user">
      <BackHeader
        onClick={() => {
          router.push("/");
        }}
      />
      <div
        style={{
          marginTop: "65px",
          height: "calc(100vh - 65px)",
          backgroundColor: "#dadada",
        }}
        className={s.container}
      >
        <div className={`${s.info}`} style={{ paddingBottom: "1rem" }}>
          <Image
            onClick={() => {
              setview?.({
                src: profile?.photoURL
                  ? profile?.photoURL
                  : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png",
                name: `${userName}'s profile`,
              });
            }}
            priority={false}
            className={s.profile}
            width={500}
            height={170}
            style={{ objectFit: "cover", width: "120px", height: "120px" }}
            alt={`${userName}'s profile`}
            src={
              (profile?.photoURL as string) ??
              "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
            }
          />
          <h3 style={{ marginBottom: "18px" }}>{userName}</h3>
          <p
            style={{
              color: profile?.bio === "" ? "gray" : "initial",
              marginTop: "0",
            }}
            className={s.bio}
          >
            {bio}
          </p>
          {otherUser && (
            <button
              onClick={() => {
                router.push(`/chat/${router.query.user}`);
              }}
              className={s.editToggle}
            >
              Send Message
            </button>
          )}
        </div>
        <PostList
          postLoading={postLoading}
          postEnd={postEnd}
          tabIndex={1}
          posts={limitedPosts}
          profile={profile}
        />
      </div>
    </div>
  );
}
