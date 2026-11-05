import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static(("public")))
app.use(cookieParser())

// routes
import healthcheck from './routes/healthcheck.route.js'
import productRoutes from "./routes/product.route.js"
import authRoutes from "./routes/auth.route.js"

//routes declaration
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/products", productRoutes)
app.use("/api/v1/healthcheck", healthcheck)

export { app }
