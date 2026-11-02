import dbconnect from "./db/dbconnect.js";
import { app } from "./app.js";

const PORT = process.env.PORT || 3000;

dbconnect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Server startup failed:", error);
    process.exit(1);
  });