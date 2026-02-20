import request from "supertest";
import { app } from "../app.js";

describe("GET /", () => {
  it("returns hello-world message", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "hello-world" });
  });
});

describe("GET /openapi.json", () => {
  it("returns an OpenAPI spec with the expected shape", async () => {
    const res = await request(app).get("/openapi.json");
    expect(res.status).toBe(200);
    expect(res.body.openapi).toMatch(/^3\./);
    expect(res.body.info).toBeDefined();
    expect(res.body.paths).toBeDefined();
  });
});
