import { UserRecord } from "firebase-admin/lib/auth/user-record";
import Image from "next/image";
import {
  ChangeEventHandler,
  ReactNode,
  RefObject,
  useContext,
  useRef,
} from "react";
import { PageContext, PageProps } from "@/context/PageContext";
import { account } from "@/types/interfaces";
import s from "./index.module.scss";
export const bioFallback = "No Bio Yet";
function ProfileInfo(props: {
  handleChange: ChangeEventHandler<HTMLInputElement>;
  account: UserRecord;
  infoRef?: RefObject<HTMLDivElement>;
  selectMode: boolean;
  children?: ReactNode;
  profile: account["profile"];
  editToggle?: boolean;
  newProfile?: account["profile"] | null;
}) {
  const {
    handleChange,
    account,
    infoRef,
    selectMode,
    children,
    profile,
    editToggle,
    newProfile,
  } = props;
  const { setview } = useContext(PageContext) as PageProps;
  // const view =
  const imgFileRef = useRef<HTMLInputElement>(null);

  // email === "testuser@gmail.com"
  //   ? "https://www.femalefirst.co.uk/image-library/partners/bang/land/1000/t/tom-holland-d0f3d679ae3608f9306690ec51d3a613c90773ef.jpg"
  //   : photoURL
  //   ? photoURL
  //   : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";
  const photo =
    newProfile?.photoURL ??
    "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";
  const file = newProfile?.photoURL as File;
  
  const newProfileBio = newProfile?.bio === "" ? bioFallback : newProfile?.bio;
  const oldProfileBio = profile.bio === "" ? bioFallback : profile.bio;
  const imageFile = file.type
    ? URL.createObjectURL(file)!
    : (newProfile?.photoURL! as string);
  return (
    <div ref={infoRef} className={`${s.info} ${selectMode ? s.active : ""}`}>
      {/* <ImageLargeView
        // view={}
      /> */}
      <Image
        onClick={() => {
          setview?.({
            src: profile.photoURL
              ? profile.photoURL
              : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png",
            name: `${profile?.firstName ?? "Unknown"} ${
              profile?.lastName ?? ""
            }'s profile picture`,
          });
          // viewRef.current?.showModal();
        }}
        priority={false}
        className={s.profile}
        width={500}
        height={170}
        style={{ objectFit: "cover", width: "120px", height: "120px" }}
        alt={`${profile?.firstName ?? "Unknown"} ${
          profile?.lastName ?? ""
        }'s profile`}
        src={
          editToggle
            ? imageFile
            : (profile?.photoURL as string) ??
              "https://upload.wikimedia.org/wikipedia/commons/77c/Profile_avatar_placeholder_large.png"
        }
      />
      {/* {JSON.stringify()} */}
      {editToggle && (
        <>
          <input
            style={{ visibility: "hidden", display: "none" }}
            type="file"
            accept="image/*"
            ref={imgFileRef}
            onChange={handleChange}
            name="photoURL"
          />
          <button
            title="Upload Profile Picture"
            aria-label="Upload Profile Picture"
            className={s.changePic}
            onClick={() => {
              imgFileRef?.current?.click();
            }}
          >
            Choose image
          </button>
        </>
      )}
      <h3>
        {editToggle
          ? `${newProfile?.firstName ?? ""} ${newProfile?.lastName ?? ""}`
          : account?.displayName}
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
        {editToggle ? newProfileBio : oldProfileBio}
      </p>
      {children}
    </div>
  );
}

export default ProfileInfo;
