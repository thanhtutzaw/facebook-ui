import sharp from "sharp";

export const resizeImage = async (url:string) => {
//   const resizedImage = await sharp.fetch(url).resize(256, 256).toBuffer();
const response = await fetch(url);
const image = await sharp(await response.arrayBuffer());
const resizedImage = await image.resize(256, 256).toBuffer();
  console.log(resizeImage);
  return resizedImage;
};
