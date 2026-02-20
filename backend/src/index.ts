import "dotenv/config";
import express from "express";
import cors from "cors";
import { generateOpenApiSpec } from "./openapi.js";
import imagesRouter from "./routes/images.js";

const app = express();
const port = 3200;

app.use(cors());
app.use(express.json());

app.get("/openapi.json", (_req, res) => {
  res.json(generateOpenApiSpec());
});

app.use("/images", imagesRouter);

app.get("/", (_req, res) => {
  res.json({ message: "hello-world" });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`OpenAPI spec at http://localhost:${port}/openapi.json`);
});
