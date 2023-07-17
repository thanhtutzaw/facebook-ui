import { SelectHTMLAttributes } from "react";
export function SelectVisiblity(
  props: {} & SelectHTMLAttributes<HTMLSelectElement>
) {
  const { ...rests } = props;
  return (
    <select
      {...rests}
      aria-label="Change visibility"
      title="Who can view my post"
      tabIndex={-1}
    >
      <option value="Public" key="all">
        {/* <FontAwesomeIcon icon={faEarth} /> */}
        Public
      </option>
      <option value="Friend" key="Friends">
        {/* <FontAwesomeIcon icon={faUserGroup} /> */}
        Friends
      </option>
      <option value="Onlyme" key="Only Me">
        {/* <FontAwesomeIcon icon={faLock} /> */}
        Only Me
      </option>
    </select>
  );
}
