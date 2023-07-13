import Image from "next/image";
import s from "./index.module.scss";
import { ReactNode, RefObject } from "react";
import { account } from "../../../types/interfaces";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
function ProfileInfo(props: {
  account: UserRecord;
  infoRef?: RefObject<HTMLDivElement>;
  active: boolean;
  children?: ReactNode;
  profile: account["profile"];
  email: string;
  photoURL: string;
  edit?: boolean;
  newProfile?: account["profile"] | null;
  // username: string;
}) {
  const {
    account,
    infoRef,
    active,
    children,
    profile,
    email,
    photoURL,
    edit,
    newProfile,
    // username,
  } = props;

  return (
    <div ref={infoRef} className={`${s.info} ${active ? s.active : ""}`}>
      <Image
        priority={false}
        className={s.profile}
        width={500}
        height={170}
        style={{ objectFit: "cover", width: "120px", height: "120px" }}
        alt={`${profile?.firstName ?? "Unknown"} ${
          profile?.lastName ?? ""
        }'s profile`}
        src={
          email === "testuser@gmail.com"
            ? "https://www.femalefirst.co.uk/image-library/partners/bang/land/1000/t/tom-holland-d0f3d679ae3608f9306690ec51d3a613c90773ef.jpg"
            : photoURL
            ? photoURL
            : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
        }
      />
      <h3>
        {edit
          ? `${newProfile?.firstName ?? ""} ${newProfile?.lastName ?? ""}`
          : account.displayName}
      </h3>
      {/* <h3 style={{ marginBottom: "18px" }}>
          {email === "testuser@gmail.com"
            ? "Peter 1"
            : `${profile?.firstName ?? "Unknown"} ${profile?.lastName ?? ""}`}
        </h3> */}
      <p
        style={{
          color: profile?.bio === "" ? "gray" : "initial",
          marginTop: "0",
          userSelect: profile?.bio === "" || !profile?.bio ? "none" : "initial",
        }}
        className={s.bio}
      >
        {/* Listen I didn&apos;t kill Mysterio. The drones did! */}
        {/* {edit
            ? newProfile.bio
            : profile?.bio === ""
            ? "No Bio Yet"
            : profile?.bio ??
              "Listen I didn&apos;t kill Mysterio. The drones did!"} */}
        {edit
          ? newProfile?.bio
          : profile?.bio === "" || !profile?.bio
          ? "No Bio Yet"
          : profile?.bio}
        {/* {profile?.bio ?? "No Bio Yet"} */}
      </p>
      {children}
    </div>
  );
}

export default ProfileInfo;
