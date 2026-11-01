import dotenv from "dotenv";
import dbconnect from "./db/dbconnect.js";
import { app } from "./app.js";
import dns from "dns";

dotenv.config({ path: "./.env" });

dns.setServers(["8.8.8.8", "8.8.4.4"]);

dbconnect()
    .then(() => {
        app.listen(process.env.PORT || 3000);
        console.log("Successfully listening at", process.env.PORT || 3000);
    })
    .catch((err) => {
        console.log("Database connection failed !!!");
    });