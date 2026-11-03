import mongoose from "mongoose"
import { PRODUCT_CATEGORIES } from "../constants.js"

const productSchema = new mongoose.Schema(
    {
        sku: {
            type: String,
            required: true,
            unique: true,
            immutable: true,
            trim: true,
            uppercase: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        priceInPaise: {
            type: Number,
            required: true,
            default: 3000,
            min: 0,
            validate: {
                validator: Number.isInteger,
                message: "Price must be a whole number of paise"
            }
        },
        images: {
            type: [{ type: String, trim: true }],
            default: [],
            required: true,
            validate: {
                validator: images =>
                    Array.isArray(images) &&
                    images.length >= 1 &&
                    images.length <= 6,
                message: "A product must have between 1 and 6 images"
            }
        },
        categories: {
            type: [{ type: String, enum: PRODUCT_CATEGORIES }],
            required: true,
            validate: {
                validator: (categories) => categories.length > 0,
                message: "A product must have at least one category"
            }
        },
        onlineStock: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
            validate: {
                validator: Number.isInteger,
                message: "Online stock must be a whole number"
            }
        },
        reservedStock: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
            validate: {
                validator: Number.isInteger,
                message: "Reserved stock must be a whole number"
            }
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
)

productSchema.virtual("availableStock").get(function () {
    return this.onlineStock - this.reservedStock
})

const Product = mongoose.model("Product", productSchema)

export default Product
