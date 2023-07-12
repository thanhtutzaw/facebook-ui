import { motion } from "framer-motion";
import { ChangeEventHandler, FormEventHandler, MouseEventHandler } from "react";
import s from "./index.module.scss";
import { account } from "../../../types/interfaces";
function EditProfile(props: {
  updating: boolean;
  edit: boolean;
  handleSubmit: FormEventHandler<HTMLFormElement>;
  handleChange: ChangeEventHandler<HTMLInputElement>;
  newProfile: account["profile"];
  toggleEdit: MouseEventHandler<HTMLButtonElement>;
}) {
  const { updating, edit, handleSubmit, handleChange, newProfile, toggleEdit } =
    props;
  if (!edit)
    return (
      <motion.button
        onClick={toggleEdit}
        initial={{ opacity: 0 }}
        animate={{ opacity: !edit ? 1 : 0 }}
        exit={{ opacity: 0 }}
        className={s.editToggle}
      >
        Edit Profile
      </motion.button>
    );
  return (
    <motion.form
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: edit ? 1 : 0,
      }}
      exit={{
        opacity: 0,
      }}
      onSubmit={handleSubmit}
      className={s.editProfile}
    >
      {/* {JSON.stringify(newProfile, null, 4)} */}
      <div>
        <input
          onChange={handleChange}
          defaultValue={newProfile?.firstName ?? ""}
          id="firstName"
          name="firstName"
          type="text"
          placeholder="First Name"
          autoComplete="on"
          spellCheck="false"
          tabIndex={0}
          aria-label="First Name"
          autoCapitalize="sentences"
        />
        <input
          onChange={handleChange}
          defaultValue={newProfile?.lastName ?? ""}
          id="lastName"
          name="lastName"
          type="text"
          placeholder="Last Name"
          autoComplete="on"
          spellCheck="false"
          tabIndex={0}
          aria-label="Last Name"
          autoCapitalize="sentences"
        />
        <input
          onChange={handleChange}
          defaultValue={newProfile?.bio}
          id="bio"
          name="bio"
          type="text"
          placeholder="Bio"
          autoComplete="on"
          spellCheck="false"
          tabIndex={0}
          aria-label="bio"
          autoCapitalize="sentences"
        />
      </div>
      <div>
        <button onClick={toggleEdit}>Cancel</button>
        <button disabled={updating} type="submit">
          {updating ? "Updating..." : "Update"}
        </button>
      </div>
    </motion.form>
  );
}

export default EditProfile;
