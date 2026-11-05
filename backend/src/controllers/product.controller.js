
import { ApiResponse, asyncHandler } from "../utils/index.js"
import {
    createProduct,
    listPublicProducts,
    getPublicProductById,
    updateProduct,
    setProductStatus
} from "../services/product.service.js"

const createProductController = asyncHandler(async (req, res) => {
    const product = await createProduct(req.body)

    return res
        .status(201)
        .json(new ApiResponse(201, product, "Product created successfully"))
})

const listPublicProductsController = asyncHandler(async (req, res) => {
    const result = await listPublicProducts(req.query )

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Products fetched successfully"))
})

const getPublicProductByIdController = asyncHandler(async (req, res) => {
    const product = await getPublicProductById(req.params.productId)

    return res
        .status(200)
        .json(new ApiResponse(200, product, "Product fetched successfully"))
})

const updateProductController = asyncHandler(async (req, res) => {
    const product = await updateProduct(req.params.productId, req.body)

    return res
        .status(200)
        .json(new ApiResponse(200, product, "Product updated successfully"))
})

const setProductStatusController = asyncHandler(async (req, res) => {
    const product = await setProductStatus(
        req.params.productId,
        req.body.isActive
    )

    return res
        .status(200)
        .json(new ApiResponse(200, product, "Product status updated successfully"))
})

export {
    createProductController,
    listPublicProductsController,
    getPublicProductByIdController,
    updateProductController,
    setProductStatusController
}
