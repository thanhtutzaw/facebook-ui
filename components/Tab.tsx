import React, { ReactElement, memo } from "react";
interface TabProps {
  active: string;
  name: string;
  children: ReactElement;
}
const Tab = ({ active, name, children }: TabProps) => {
  return <>{active === name && children}</>;
};
export default memo(Tab);
