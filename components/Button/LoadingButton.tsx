import Spinner from "@/components/Spinner";
import {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  ReactNode,
  forwardRef,
  useState,
} from "react";
type ButtonProps = {
  loading?: boolean;
  children: ReactNode;
} & DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;
export const LoadingButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const { loading, children, ...rest } = props;
    const [success, setsuccess] = useState(false);
    const [buttonLoading, setloading] = useState(loading ?? false);
    if (success) return <></>;
    return (
      <button
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        {...rest}
        ref={ref}
        disabled={buttonLoading}
        onClick={async (e) => {
          setloading(true);
          await rest.onClick?.(e);
          setloading(false);
          setsuccess(true);
        }}
      >
        <span
          className={`absolute ${buttonLoading ? "opacity-100" : "opacity-0"}`}
        >
          <Spinner style={{ margin: "0" }} color="white" size={18} />
        </span>
        <span className={`${buttonLoading ? "opacity-0" : "opacity-100"}`}>
          {children}
        </span>
      </button>
    );
  }
);

LoadingButton.displayName = "LoadingButton";
