import mongoose from "mongoose"
import { USER_ROLES } from "../constants.js"

const addressSchema = new mongoose.Schema(
    {
        recipientName: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        addressLine1: {
            type: String,
            required: true,
            trim: true
        },
        addressLine2: {
            type: String,
            trim: true
        },
        landmark: {
            type: String,
            trim: true
        },
        city: {
            type: String,
            required: true,
            trim: true
        },
        state: {
            type: String,
            required: true,
            trim: true
        },
        postalCode: {
            type: String,
            required: true,
            trim: true
        },
        isDefault: {
            type: Boolean,
            default: false
        }
    }
)

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        passwordHash: {
            type: String,
            required: true,
            select: false
        },
        phone: {
            type: String,
            trim: true
        },
        role: {
            type: String,
            enum: USER_ROLES,
            default: "customer",
            required: true
        },
        isEmailVerified: {
            type: Boolean,
            default: false
        },
        savedAddresses: {
            type: [addressSchema],
            default: []
        }
    },
    { timestamps: true }
)

const User = mongoose.model("User", userSchema)

export default User
