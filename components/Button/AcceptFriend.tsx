import Spinner from "@/components/Spinner";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { HTMLAttributes, useState } from "react";

export function AcceptFriend(props: {} & HTMLAttributes<HTMLButtonElement>) {
  const { ...rest } = props;
  const [loading, setloading] = useState(false);
  return (
    <button
      {...rest}
      disabled={loading}
      aria-label="Accept"
      title="Accept"
      style={{
        pointerEvents: loading ? "none" : "initial",
        opacity: loading ? ".5" : "1",
        transition: "all .2s ease-in-out",
      }}
      onClick={async (e) => {
        setloading(true);
        await rest.onClick?.(e);
        setloading(false);
      }}
    >
      {!loading ? (
        <FontAwesomeIcon icon={faCheck} />
      ) : (
        <Spinner style={{ margin: 0 }} size={18} />
      )}
      Accept
    </button>
  );
}