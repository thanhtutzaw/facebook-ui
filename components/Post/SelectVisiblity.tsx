import { SelectHTMLAttributes } from "react";
import {
  faCircleCheck,
  faDotCircle,
  faEarth,
  faEllipsisH,
  faGlobe,
  faLock,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
export function SelectVisiblity(
  props: SelectHTMLAttributes<HTMLSelectElement>
) {
  return (
    <select
      {...props}
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
