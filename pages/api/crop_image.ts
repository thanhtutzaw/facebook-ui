import { NextApiRequest, NextApiResponse } from "next";
import sharp from "sharp";

export default async function handler(
  req: {
    query: { imageUrl: string; width?: string; height?: string };
  } & NextApiRequest,
  res: NextApiResponse
) {
  const { imageUrl, width, height } = req.query;
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }
  if (!imageUrl) {
    res.status(422).json({ message: "ImageURL is Required!" });
    return;
  }
  try {
    console.log("Fetch the image from the provided URL");
    const response = await fetch(imageUrl);
    const imageBuffer = await response.arrayBuffer();
    const imageMetaData = await sharp(imageBuffer).metadata();
    const imageType = imageMetaData.format;
    console.log({ imageMetaData });
    const originalBufer = await sharp(imageBuffer).toBuffer();
    if (!width || !height) {
      res.status(422).json({
        originalBufer,
        message: "width and height are required to crop",
      });
      return;
    } else {
      // Perform the cropping
      const croppedImageBuffer = await sharp(imageBuffer)
        .resize(parseInt(width), parseInt(height))
        .toBuffer();
      console.log(imageType);
      // Set the response content type to image
      res.setHeader("Content-Type", imageType ?? "JPEG");

      // Send the cropped image as the response
      res.status(200).json(croppedImageBuffer);
    }
  } catch (error) {
    console.error(error);
    res.status(500).end("Internal Server Error");
  }
}
