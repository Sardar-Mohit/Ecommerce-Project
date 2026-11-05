
import jwt from "jsonwebtoken"
import crypto from "crypto"
import User from "../models/user.model.js"
import { ApiError } from "../utils/index.js"
import {
    isValidEmail,
    isValidIndianPhone
} from "../utils/validators.js"

const generateAccessToken = (user) => {
    return jwt.sign(
        {
            _id: user._id,
            role: user.role,
            tokenVersion: user.tokenVersion
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    )
}

const generateRefreshToken = (user) => {
    return jwt.sign(
        { _id: user._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    )
}

const hashToken = (token) => {
    return crypto.createHash("sha256").update(token).digest("hex")
}

const isObjectPayload = (data) =>
    data !== null && typeof data === "object" && !Array.isArray(data)

const isValidPassword = (password) =>
    typeof password === "string" &&
    password.length >= 8 &&
    password.length <= 64 &&
    Buffer.byteLength(password, "utf8") <= 72

const generateTokens = async (user) => {
    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    user.refreshTokenHash = hashToken(refreshToken)
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }
}

const getSafeUser = (user) => {
    const data = user.toObject()

    delete data.passwordHash
    delete data.refreshTokenHash

    return data
}

// Register

const registerUser = async (data = {}) => {
    if (!isObjectPayload(data)) {
        throw new ApiError(400, "Invalid request body")
    }

    const { name, email, password, phone } = data

    if (
        typeof name !== "string" || !name.trim() ||
        typeof email !== "string" || !email.trim() ||
        typeof password !== "string" || !password
    ) {
        throw new ApiError(400, "Name, email and password are required")
    }

    if (!isValidPassword(password)) {
        throw new ApiError(400, "Password must be 8-64 characters and no more than 72 bytes")
    }

    if (phone !== undefined && typeof phone !== "string") {
        throw new ApiError(400, "Invalid phone number")
    }

    const normalizedEmail = email.trim().toLowerCase()

    if (!isValidEmail(normalizedEmail)) {
        throw new ApiError(400, "Please provide a valid email address")
    }

    let normalizedPhone

    if (phone !== undefined && phone !== "") {
        if (!isValidIndianPhone(phone)) {
            throw new ApiError(400, "Please provide a valid Indian mobile number")
        }

        const digits = phone.replace(/\D/g, "")
        normalizedPhone = digits.length === 12 ? digits.slice(2) : digits
    }

    const existingUser = await User.findOne({ email: normalizedEmail })

    if (existingUser) {
        throw new ApiError(409, "Email is already registered")
    }

    let user

    try {
        user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            passwordHash: password,
            phone: normalizedPhone
        })
    } catch (error) {
        if (error.code === 11000) {
            throw new ApiError(409, "Email is already registered")
        }

        throw error
    }

    const tokens = await generateTokens(user)

    return {
        user: getSafeUser(user),
        ...tokens
    }
}

// Login

const loginUser = async (data = {}) => {
    if (!isObjectPayload(data)) {
        throw new ApiError(400, "Invalid request body")
    }

    const { email, password } = data

    if (
        typeof email !== "string" ||
        !email.trim() ||
        typeof password !== "string" ||
        !password
    ) {
        throw new ApiError(400, "Email and password are required")
    }

    if (!isValidEmail(email.trim())) {
        throw new ApiError(400, "Please provide a valid email address")
    }

    const user = await User.findOne({
        email: email.trim().toLowerCase()
    }).select("+passwordHash +refreshTokenHash")

    if (!user || !(await user.isPasswordCorrect(password))) {
        throw new ApiError(401, "Invalid email or password")
    }

    const tokens = await generateTokens(user)

    return {
        user: getSafeUser(user),
        ...tokens
    }
}

// Logout

const logoutUser = async (userId) => {
    const user = await User.findByIdAndUpdate(
        userId,
        {
            $set: { refreshTokenHash: null },
            $inc: { tokenVersion: 1 }
        },
        { new: true }
    )

    if (!user) {
        throw new ApiError(404, "User not found")
    }
}

// Refresh tokens

const refreshAccessTokens = async (incomingToken) => {
    if (!incomingToken) {
        throw new ApiError(401, "Refresh token is required")
    }

    let decoded

    try {
        decoded = jwt.verify(
            incomingToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    } catch {
        throw new ApiError(401, "Invalid or expired refresh token")
    }

    const user = await User.findById(decoded._id)
        .select("+refreshTokenHash")

    if (
        !user ||
        !user.refreshTokenHash ||
        hashToken(incomingToken) !== user.refreshTokenHash
    ) {
        throw new ApiError(401, "Invalid or expired refresh token")
    }

    const tokens = await generateTokens(user)

    return {
        ...tokens,
        user: getSafeUser(user)
    }
}

// Change password

const changePassword = async (userId, oldPassword, newPassword) => {
    if (
        typeof oldPassword !== "string" ||
        typeof newPassword !== "string" ||
        !oldPassword ||
        !newPassword
    ) {
        throw new ApiError(400, "Both passwords are required")
    }

    if (!isValidPassword(newPassword)) {
        throw new ApiError(400, "Password must be 8-64 characters and no more than 72 bytes")
    }

    const user = await User.findById(userId)
        .select("+passwordHash +refreshTokenHash")

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    if (!(await user.isPasswordCorrect(oldPassword))) {
        throw new ApiError(401, "Incorrect current password")
    }

    user.passwordHash = newPassword
    user.refreshTokenHash = null
    user.tokenVersion += 1

    await user.save()
}

// Get current user

const getCurrentUser = async (userId) => {
    const user = await User.findById(userId)

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    return user
}

// Update profile

const updateProfile = async (userId, data = {}) => {
    if (!isObjectPayload(data)) {
        throw new ApiError(400, "Invalid request body")
    }

    const updates = {}

    if (data.name !== undefined) {
        if (typeof data.name !== "string" || !data.name.trim()) {
            throw new ApiError(400, "Invalid name")
        }

        updates.name = data.name.trim()
    }

    if (data.phone !== undefined) {
        if (!isValidIndianPhone(data.phone)) {
            throw new ApiError(400, "Invalid phone number")
        }

        const digits = data.phone.replace(/\D/g, "")
        updates.phone = digits.length === 12 ? digits.slice(2) : digits
    }

    if (!Object.keys(updates).length) {
        throw new ApiError(400, "No valid profile fields provided")
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true, runValidators: true }
    )

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    return user
}

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessTokens,
    changePassword,
    getCurrentUser,
    updateProfile
}
