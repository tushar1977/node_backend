import dotenv from "dotenv";
import connect_db from "./db/index.js";
import { app } from "./app.js";

dotenv.config({ path: "../.env" });

connect_db()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`server is running at ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("COnnection Failed", error);
  });
