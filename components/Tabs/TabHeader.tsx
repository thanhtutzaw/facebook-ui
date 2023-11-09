import { ReactNode } from "react";
import t from "./Tabs.module.scss";
export function TabHeader({ children }: { children: ReactNode }) {
  return (
    <div className={`bold-title ${t.header}`}>
      <h2>{children}</h2>
    </div>
  );
}
