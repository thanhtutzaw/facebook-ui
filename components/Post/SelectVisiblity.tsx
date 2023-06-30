import { SelectHTMLAttributes } from "react";

export function SelectVisiblity(
  props: SelectHTMLAttributes<HTMLSelectElement>
) {
  // const { visibility } = props;
  return (
    <select
      {...props}
      aria-label="Change visibility"
      title="Who can view my post"
      // defaultValue={visibility}
      tabIndex={-1}
    >
      <option value="Public" key="all">
        Public
      </option>
      <option value="Friend" key="Friends">
        Friends
      </option>
      <option value="Onlyme" key="Only Me">
        Only Me
      </option>
    </select>
  );
}
