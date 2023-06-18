import { SelectHTMLAttributes } from "react";

export function Select(
  props: { visibility: string } & SelectHTMLAttributes<HTMLSelectElement>
) {
  const { visibility } = props;
  return (
    <select
      {...props}
      aria-label="visibility"
      title="Visibility"
      defaultValue={visibility}
      tabIndex={-1}
    >
      <option value="Pubilc" key="Public">
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
