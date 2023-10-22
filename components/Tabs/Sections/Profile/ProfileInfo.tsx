import { PageContext, PageProps } from "@/context/PageContext";
import { checkPhotoURL, getFullName } from "@/lib/firestore/profile";
import { account } from "@/types/interfaces";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
import Image from "next/image";
import {
  ChangeEventHandler,
  ReactNode,
  RefObject,
  useContext,
  useRef,
} from "react";
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
  const { setsingleImageModal, currentUser } = useContext(
    PageContext
  ) as PageProps;
  const imgFileRef = useRef<HTMLInputElement>(null);

  //   ? "https://www.femalefirst.co.uk/image-library/partners/bang/land/1000/t/tom-holland-d0f3d679ae3608f9306690ec51d3a613c90773ef.jpg"
  //   : photoURL
  //   ? photoURL
  const file = newProfile?.photoURL as File;

  const newProfileBio = newProfile?.bio === "" ? bioFallback : newProfile?.bio;
  const oldProfileBio = profile?.bio === "" ? bioFallback : profile?.bio;
  const imageFile = file.type
    ? URL.createObjectURL(file)!
    : (newProfile?.photoURL! as string);
  const userName = getFullName(profile);
  return (
    <div ref={infoRef} className={`${s.info} ${selectMode ? s.active : ""}`}>
      <Image
        onClick={() => {
          setsingleImageModal?.({
            src: checkPhotoURL(profile.photoURL),
            name: `${userName}'s profile picture`,
          });
        }}
        priority={false}
        className={s.profile}
        width={500}
        height={170}
        style={{ objectFit: "cover", width: "120px", height: "120px" }}
        alt={`${userName}'s profile`}
        src={
          editToggle
            ? imageFile
            : currentUser?.photoURL ??
              "https://upload.wikimedia.org/wikipedia/commons/77c/Profile_avatar_placeholder_large.png"
        }
      />
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
          : userName}
      </h3>
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
