
import { Router } from "express"

import {
    createProductController,
    listPublicProductsController,
    getPublicProductByIdController,
    updateProductController,
    setProductStatusController
} from "../controllers/product.controller.js"

import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js"

const router = Router()

// Public routes
router.get("/", listPublicProductsController)
router.get("/:productId", getPublicProductByIdController)

// Admin-only routes // verifyJWT and verifyAdmin middlewares are used to protect these routes but not ccreated or imported in this right now.
router.post("/", verifyJWT, verifyAdmin, createProductController)
router.patch("/:productId", verifyJWT, verifyAdmin, updateProductController)
router.patch("/:productId/status", verifyJWT, verifyAdmin, setProductStatusController)

export default router
