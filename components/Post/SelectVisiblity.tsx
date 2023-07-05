import { SelectHTMLAttributes } from "react";

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
