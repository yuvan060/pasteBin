import "dotenv/config";
import app from "./app.js";
import { startHealthCheckScheduler } from "./healthScheduler.js";

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server listening on ${port}`);
  startHealthCheckScheduler();
});
