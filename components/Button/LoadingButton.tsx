import Spinner from "@/components/Spinner";
import {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  ReactNode,
  forwardRef,
  useState,
} from "react";
type ButtonProps = {
  initialTitle: string;
  loadingTitle?: string;
  dirty?: boolean;
  loading?: boolean;
  children: ReactNode;
} & DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;
export const LoadingButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const { initialTitle, loadingTitle, loading, children, dirty, ...rest } =
      props;
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
        title={buttonLoading ? loadingTitle : initialTitle}
        ref={ref}
        {...rest}
        disabled={buttonLoading || dirty}
        onClick={async (e) => {
          setloading(true);
          try {
            await rest.onClick?.(e);
            setsuccess(true);
          } catch (error) {
            setsuccess(false);
            setloading(false);
          } finally {
            setloading(false);
          }
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
