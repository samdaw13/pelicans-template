import "dotenv/config";
import { app } from "./app.js";

const port = 3200;

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`OpenAPI spec at http://localhost:${port}/openapi.json`);
});
