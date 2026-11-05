
import { ApiResponse, asyncHandler } from "../utils/index.js"

import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessTokens,
    changePassword,
    getCurrentUser,
    updateProfile
} from "../services/auth.service.js"

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
}

// Register

const registerController = asyncHandler(async (req, res) => {
    const result = await registerUser(req.body)

    return res
        .status(201)
        .cookie("accessToken", result.accessToken, cookieOptions)
        .cookie("refreshToken", result.refreshToken, cookieOptions)
        .json(
            new ApiResponse(201, result.user, "Account created successfully")
        )
})

// Login

const loginController = asyncHandler(async (req, res) => {
    const result = await loginUser(req.body)

    return res
        .status(200)
        .cookie("accessToken", result.accessToken, cookieOptions)
        .cookie("refreshToken", result.refreshToken, cookieOptions)
        .json(
            new ApiResponse(200, result.user, "Login successful")
        )
})

// Logout

const logoutController = asyncHandler(async (req, res) => {
    await logoutUser(req.user._id)

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, {}, "Logout successful"))
})

// Refresh tokens

const refreshTokenController = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken

    const result = await refreshAccessTokens(refreshToken)

    return res
        .status(200)
        .cookie("accessToken", result.accessToken, cookieOptions)
        .cookie("refreshToken", result.refreshToken, cookieOptions)
        .json(
            new ApiResponse(200, result.user, "Tokens refreshed successfully")
        )
})

// Change password

const changePasswordController = asyncHandler(async (req, res) => {
    await changePassword(
        req.user._id,
        req.body?.oldPassword,
        req.body?.newPassword
    )

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, {}, "Password changed successfully. Please login again."))
})

// Get current user

const getCurrentUserController = asyncHandler(async (req, res) => {
    const user = await getCurrentUser(req.user._id)

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User fetched successfully"))
})

// Update profile

const updateProfileController = asyncHandler(async (req, res) => {
    const user = await updateProfile(req.user._id, req.body)

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Profile updated successfully"))
})

export {
    registerController,
    loginController,
    logoutController,
    refreshTokenController,
    changePasswordController,
    getCurrentUserController,
    updateProfileController
}
