import { Router } from "express";
import type { Request, Response } from "express";

interface UnsplashPhoto {
  urls: { regular: string };
  alt_description: string | null;
  user: { name: string; links: { html: string } };
}

const UNSPLASH_API = "https://api.unsplash.com";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const accessKey = process.env["UNSPLASH_ACCESS_KEY"];
  if (!accessKey) {
    res.status(500).json({ error: "Unsplash access key not configured" });
    return;
  }

  const unsplashRes = await fetch(
    `${UNSPLASH_API}/photos/random?query=pelican`,
    {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        "Accept-Version": "v1",
      },
    },
  );

  if (unsplashRes.status === 404) {
    res.status(404).json({ error: "No image found" });
    return;
  }

  if (!unsplashRes.ok) {
    res.status(502).json({ error: "Failed to fetch from Unsplash" });
    return;
  }

  const photo = (await unsplashRes.json()) as UnsplashPhoto;

  res.json({
    url: photo.urls.regular,
    alt: photo.alt_description ?? "",
    photographer: photo.user.name,
    photographerUrl: photo.user.links.html,
  });
});

export default router;
