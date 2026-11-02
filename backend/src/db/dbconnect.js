import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"

export default async function dbconnect() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: DB_NAME
        });

        console.log("MongoDB connected successfully");
    } catch (error) {
        console.log("Error in db connection: ", error)
    }
} 