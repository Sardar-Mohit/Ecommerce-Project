const isValidEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return typeof email === "string" &&
        email.length <= 254 &&
        regex.test(email.trim())
}

const isValidIndianPhone = (phone) => {
    if (typeof phone !== "string") return false

    const digits = phone.replace(/\D/g, "")
    const number = digits.length === 12 && digits.startsWith("91")
        ? digits.slice(2)
        : digits

    return /^[6-9]\d{9}$/.test(number)
}

export { isValidEmail, isValidIndianPhone }