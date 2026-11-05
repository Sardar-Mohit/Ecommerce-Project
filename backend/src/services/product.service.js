import mongoose from "mongoose"
import Counter from "../models/counter.model.js"
import Product from "../models/product.model.js"
import { ApiError } from "../utils/index.js"

const PRODUCT_SKU_COUNTER_ID = "productSku"
const PRODUCT_UPDATE_FIELDS = [
    "name",
    "description",
    "priceInPaise",
    "images",
    "categories",
]

const validateProductId = (id) => {
    if (!mongoose.isValidObjectId(id)) {
        throw new ApiError(400, "Invalid product ID")
    }
}

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const positiveInteger = (value, fallback) => {
    const parsed = Number(value)
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback
}

const incrementProductSku = async () => {

    const counter = await Counter.findOneAndUpdate(
        { _id: PRODUCT_SKU_COUNTER_ID },
        { $inc: { sequence: 1 } },
        { new: true }
    )

    if (!counter) {
        throw new Error("Product SKU counter not found")
    }

    return `SKU-${String(counter.sequence).padStart(6, "0")}`
}

const createProduct = async (data) => {
    const sku = await incrementProductSku()

    return Product.create({
        sku,
        name: data.name,
        description: data.description,
        priceInPaise: data.priceInPaise,
        images: data.images,
        categories: data.categories,
        onlineStock: data.onlineStock
    })
}

const listPublicProducts = async ({
    page = 1, limit = 20,
    search,
    category
} = {}) => {
    page = positiveInteger(page, 1)
    limit = Math.min(positiveInteger(limit, 20), 100)

    const filter = {
        isActive: true,
        $expr: { $gt: ["$onlineStock", "$reservedStock"] }
    }

    if (search?.trim()) {
        filter.name = {
            $regex: escapeRegex(search.trim()),
            $options: "i"
        }
    }

    if (category?.trim()) {
        filter.categories = category.trim()
    }

    const [products, total] = await Promise.all([
        Product.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit),
        Product.countDocuments(filter)
    ])

    return {
        products,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    }
}

const getPublicProductById = async (id) => {
    validateProductId(id)

    const product = await Product.findOne({
        _id: id,
        isActive: true,
        $expr: { $gt: ["$onlineStock", "$reservedStock"] }
    })

    if (!product) {
        throw new ApiError(404, "Product not found")
    }

    return product
}

const updateProduct = async (id, data) => {
    validateProductId(id)

    const updates = {}
    for (const field of PRODUCT_UPDATE_FIELDS) {
        if (field in data) {
            updates[field] = data[field]
        }
    }

    if (Object.keys(updates).length === 0) {
        throw new ApiError(400, "No editable product fields provided")
    }

    const product = await Product.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true
    })

    if (!product) {
        throw new ApiError(404, "Product not found")
    }

    return product
}

const setProductStatus = async (id, isActive) => {
    validateProductId(id)

    if (typeof isActive !== "boolean") {
        throw new ApiError(400, "isActive must be a boolean")
    }

    const product = await Product.findByIdAndUpdate(
        id,
        { isActive },
        { new: true, runValidators: true }
    )

    if (!product) {
        throw new ApiError(404, "Product not found")
    }

    return product
}

export {
    incrementProductSku, createProduct, listPublicProducts, getPublicProductById, updateProduct, setProductStatus
}