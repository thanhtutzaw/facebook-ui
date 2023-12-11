import { faPen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";
import { ChangeEventHandler, FormEventHandler, MouseEventHandler } from "react";
import { account } from "../../types/interfaces";
import s from "@/components/Tabs/Sections/Profile/index.module.scss";
export function EditProfileForm(props: {
  updating: boolean;
  editToggle: boolean;
  handleSubmit: FormEventHandler<HTMLFormElement>;
  handleChange: ChangeEventHandler<HTMLInputElement>;
  newProfile: account["profile"];
  toggleEdit: MouseEventHandler<HTMLButtonElement>;
}) {
  const {
    updating,
    editToggle,
    handleSubmit,
    handleChange,
    newProfile,
    toggleEdit,
  } = props;
  if (!editToggle)
    return (
      <motion.button
        key="false"
        onClick={toggleEdit}
        initial={{ opacity: 0 }}
        animate={{ opacity: !editToggle ? 1 : 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={s.editToggle}
      >
        <FontAwesomeIcon icon={faPen} />
        Edit Profile
      </motion.button>
    );
  return (
    <motion.form
      key="true"
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: editToggle ? 1 : 0,
      }}
      exit={{
        opacity: 0,
      }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className={s.editProfile}
    >
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
          defaultValue={newProfile?.bio ?? ""}
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
        <button
          onClick={(e) => {
            toggleEdit(e);
          }}
          type="reset"
          tabIndex={-1}
        >
          Cancel
        </button>
        <button disabled={updating} type="submit">
          {updating ? "Updating..." : "Update"}
        </button>
      </div>
    </motion.form>
  );
}
