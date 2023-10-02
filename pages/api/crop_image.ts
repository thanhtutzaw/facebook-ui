import sharp from "sharp";

export default async function handler(
  req: { query: { imageUrl: string; width?: string; height?: string } },
  res: {
    setHeader: (arg0: string, arg1: string) => void;
    end: (arg0: Buffer) => void;
    status: (arg0: number) => {
      (): any;
      new (): any;
      end: { (arg0: string): void; new (): any };
    };
  }
) {
  const { imageUrl, width, height } = req.query;
  console.log(req.query);
  try {
    // Fetch the image from the provided URL
    const imageBuffer = await fetch(imageUrl).then((response) =>
      response.arrayBuffer()
    );
    const imageMetaData = await sharp(imageBuffer).metadata();
    const imageType = imageMetaData.format;
    console.log({ imageMetaData });
    const originalBufer = await sharp(imageBuffer).toBuffer();
    if (!width && !height) {
      res.end(originalBufer);
      return;
    } else if (width && height) {
      // Perform the cropping
      const croppedImageBuffer = await sharp(imageBuffer)
        .resize(parseInt(width), parseInt(height))
        .toBuffer();
      console.log(imageType);
      // Set the response content type to image
      res.setHeader("Content-Type", imageType ?? "JPEG");

      // Send the cropped image as the response
      res.end(croppedImageBuffer);
    } else {
      res.end(originalBufer);
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).end("Internal Server Error");
  }
}
