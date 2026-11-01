import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"

export default async function dbconnect() {
    try {
        console.log(process.env.MONGODB_URI);
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log("DB connected successfully !!!")
    } catch (error) {
        console.log("Error in db connection: ", error)
        process.exit(1)
    }
} 