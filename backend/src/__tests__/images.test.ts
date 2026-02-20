import { jest, beforeEach, afterEach, describe, it, expect } from "@jest/globals";
import request from "supertest";
import { app } from "../app.js";

const MOCK_PHOTO = {
  urls: { regular: "https://example.com/photo.jpg" },
  alt_description: "A pelican in flight",
  user: {
    name: "Jane Doe",
    links: { html: "https://unsplash.com/@janedoe" },
  },
};

function mockUnsplashSuccess(photo: unknown) {
  jest.spyOn(globalThis, "fetch").mockResolvedValueOnce(
    new Response(JSON.stringify(photo), { status: 200 }),
  );
}

function mockUnsplashError(status: number) {
  jest.spyOn(globalThis, "fetch").mockResolvedValueOnce(
    new Response(JSON.stringify({ errors: ["error"] }), { status }),
  );
}

beforeEach(() => {
  process.env["UNSPLASH_ACCESS_KEY"] = "test-key";
});

afterEach(() => {
  jest.restoreAllMocks();
  delete process.env["UNSPLASH_ACCESS_KEY"];
});

describe("GET /images", () => {
  it("returns image data from a random pelican photo", async () => {
    mockUnsplashSuccess(MOCK_PHOTO);

    const res = await request(app).get("/images");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      url: "https://example.com/photo.jpg",
      alt: "A pelican in flight",
      photographer: "Jane Doe",
      photographerUrl: "https://unsplash.com/@janedoe",
    });
  });

  it("uses empty string when alt_description is null", async () => {
    mockUnsplashSuccess({ ...MOCK_PHOTO, alt_description: null });

    const res = await request(app).get("/images");

    expect(res.status).toBe(200);
    expect(res.body.alt).toBe("");
  });

  it("returns 500 when UNSPLASH_ACCESS_KEY is not set", async () => {
    delete process.env["UNSPLASH_ACCESS_KEY"];

    const res = await request(app).get("/images");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Unsplash access key not configured" });
  });

  it("returns 404 when Unsplash responds with 404", async () => {
    mockUnsplashError(404);

    const res = await request(app).get("/images");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "No image found" });
  });

  it("returns 502 when the Unsplash API request fails", async () => {
    mockUnsplashError(401);

    const res = await request(app).get("/images");

    expect(res.status).toBe(502);
    expect(res.body).toEqual({ error: "Failed to fetch from Unsplash" });
  });
});
