import Counter from "../models/counter.model.js"

const PRODUCT_SKU_COUNTER_ID = "productSku"

export const generateProductSku = async () => {
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
