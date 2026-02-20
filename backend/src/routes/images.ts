import { Router } from "express";
import type { Request, Response } from "express";

interface UnsplashPhoto {
  urls: { regular: string };
  alt_description: string | null;
  user: { name: string; links: { html: string } };
}

const UNSPLASH_API = "https://api.unsplash.com";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const rawOffset = req.query["offset"];
  const offset = rawOffset !== undefined ? parseInt(String(rawOffset), 10) : 0;
  if (isNaN(offset) || offset < 0) {
    res.status(404).json({ error: "No image found at this offset" });
    return;
  }

  const accessKey = process.env["UNSPLASH_ACCESS_KEY"];
  if (!accessKey) {
    res.status(500).json({ error: "Unsplash access key not configured" });
    return;
  }

  const perPage = 10;
  const page = Math.floor(offset / perPage) + 1;
  const index = offset % perPage;
  const unsplashRes = await fetch(
    `${UNSPLASH_API}/photos?page=${page}&per_page=${perPage}`,
    {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        "Accept-Version": "v1",
      },
    },
  );

  if (!unsplashRes.ok) {
    res.status(502).json({ error: "Failed to fetch from Unsplash" });
    return;
  }

  const photos = (await unsplashRes.json()) as UnsplashPhoto[];
  if (photos.length === 0) {
    res.status(404).json({ error: "No image found at this offset" });
    return;
  }

  const photo = photos[index];
  if (!photo) {
    res.status(404).json({ error: "No image found at this offset" });
    return;
  }

  res.json({
    url: photo.urls.regular,
    alt: photo.alt_description ?? "",
    photographer: photo.user.name,
    photographerUrl: photo.user.links.html,
    offset,
  });
});

export default router;
