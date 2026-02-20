import express from "express";
import cors from "cors";
import { generateOpenApiSpec } from "./openapi.js";
import imagesRouter from "./routes/images.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/openapi.json", (_req, res) => {
  res.json(generateOpenApiSpec());
});

app.use("/images", imagesRouter);

app.get("/", (_req, res) => {
  res.json({ message: "hello-world" });
});
