
import { Router } from "express"

import {
    registerController,
    loginController,
    logoutController,
    refreshTokenController,
    changePasswordController,
    getCurrentUserController,
    updateProfileController
} from "../controllers/auth.controller.js"

import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

// Public routes
router.post("/register", registerController)
router.post("/login", loginController)
router.post("/refresh-token", refreshTokenController)

// Protected routes
router.post("/logout", verifyJWT, logoutController)
router.post("/change-password", verifyJWT, changePasswordController)

router.get("/me", verifyJWT, getCurrentUserController)
router.patch("/profile", verifyJWT, updateProfileController)

export default router
