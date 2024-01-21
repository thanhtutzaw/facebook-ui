import { useAppContext } from "@/context/AppContext";
import { checkPhotoURL, getFullName } from "@/lib/firestore/profile";
import { account } from "@/types/interfaces";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChangeEventHandler, ReactNode, RefObject, useRef } from "react";
import s from "./index.module.scss";
export const bioFallback = "No Bio Yet";
function ProfileInfo(props: {
  src: string;
  handleChange: ChangeEventHandler<HTMLInputElement>;
  infoRef?: RefObject<HTMLDivElement>;
  children?: ReactNode;
  editToggle?: boolean;
  newProfile?: account["profile"] | null;
}) {
  const { src, handleChange, infoRef, children, editToggle, newProfile } =
    props;
  const { profile, selectMode } = useAppContext();
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
  const router = useRouter();
  return (
    <div ref={infoRef} className={`${s.info} ${selectMode ? s.active : ""}`}>
      <Link
        shallow
        // as={`${router.query.user}/?viewImage=${checkPhotoURL(
        //   profile?.photoURL
        // )}&imageName=${userName}`}
        href={{
          query: {
            ...router.query,
            viewImage: checkPhotoURL(profile?.photoURL),
            imageName: `${userName}'s profile picture`,
          },
        }}
      >
        <Image
          priority={false}
          className={`bg-avatarBg ${s.profile}`}
          width={500}
          height={170}
          style={{ objectFit: "cover", width: "120px", height: "120px" }}
          alt={`${userName}'s profile`}
          src={editToggle ? imageFile : src}
        />
      </Link>
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
      <h3 className="font-semibold text-base">
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
