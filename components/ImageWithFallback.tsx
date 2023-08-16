import Image, { ImageProps } from "next/image";
import { HTMLAttributes, useState } from "react";
import { Media } from "../types/interfaces";

const ImageWithFallback = (
  props: {
    id?: string;
    src: string;
    alt: string;
    // fallbackSrc: string;
    media?: Media[];
  } & ImageProps & HTMLAttributes<HTMLImageElement>
) => {
  const { media, alt, src, ...rest } = props;
  const [imgSrc, setImgSrc] = useState(src);
  const fallbackSrc =
    "https://www.cvent-assets.com/brand-page-guestside-site/assets/images/venue-card-placeholder.png";
  return (
    <Image
      //   style={{
      //     filter: imgSrc === fallbackSrc ? "invert(1)" : "initial",
      //   }}
      //   style={{ filter: "invert(1)" }}
      alt={fallbackSrc === imgSrc ? "Not Found" : alt}
      {...rest}
      src={imgSrc}
      onError={(e) => {
        console.log("Image Error in Fallback");
        setImgSrc(fallbackSrc);
        e.currentTarget.style.filter = "invert(1)";
        // e.currentTarget.style.minHeight =
        //   media?.length === 2 ? "196px" : "394px";
      }}
    />
  );
};

export default ImageWithFallback;
