
import jwt from "jsonwebtoken"
import User from "../models/user.model.js"
import { ApiError, asyncHandler } from "../utils/index.js"

const verifyJWT = asyncHandler(async (req, res, next) => {
    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
        throw new ApiError(401, "Authentication required")
    }

    let decoded;

    try {
        decoded = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        )
    } catch {
        throw new ApiError(401, "Invalid or expired access token")
    }


    const user = await User.findById(decoded._id)

    if (!user || decoded.tokenVersion !== user.tokenVersion) {
        throw new ApiError(401, "Invalid or expired access token")
    }

    req.user = user
    next()
})

const verifyAdmin = (req, res, next) => {
    if (req.user?.role !== "admin") {
        throw new ApiError(403, "Admin access only")
    }

    next()
}

export { verifyJWT, verifyAdmin }
