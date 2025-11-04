import jwt from 'jsonwebtoken'
import { User } from '../models/user.model.js';
import apiError from '../utils/apiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import apiResponse from '../utils/apiResponse.js';
import { JWT_REFRESH_TOKEN_EXPIRY, JWT_ACCESS_TOKEN_EXPIRY, JWT_REFRESH_SECRET } from '../const.js';


const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

const cookiesOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false, // False for development
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax" // "lax" allows cookies in dev mode
}

const generateAccessToken = async (user) => {
    try {
        if (!user) return null
        const token = await user.generateAccessToken()
        return token
    } catch (error) {
        throw new apiError(500, error.message)
    }
}

const generateRefreshAndAccessToken = async (userId) => {
    try {
        const user = User.findById(userId)

        if (!user) return null

        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save()

        return { accessToken, refreshToken }
    } catch (error) {
        throw new apiError(500, error.message)
    }
}

const register = asyncHandler(async (req, res) => {
    const { userName, email, password } = req.body

    if (!userName || !email || !password) {
        throw new apiError(400, "All fields are required")
    }

    if (!validateEmail(email)) {
        throw new apiError(400, "Invalid email")
    }

    const existingUser = await User.findOne({ email })

    if (existingUser) {
        throw new apiError(400, "User already exists")
    }

    try {
        const user = await User.create({ userName, email, password })
        const createdUser = await User.findById(user._id).select('-passwordHash -refreshToken')
        res.status(201).json(new apiResponse(201, createdUser, "User registered successfully"))
    } catch (error) {
        throw new apiError(500, "something went wrong while registering user")
    }
})


const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        throw new apiError(400, "All fields are required")
    }

    if (!validateEmail(email)) {
        throw new apiError(400, "Invalid email")
    }

    try {
        const user = await User.findOne({ email })

        if (!user) {
            throw new apiError(401, "User not found")
        }

        const isPasswordValid = await user.verifyPassword(password)

        if (!isPasswordValid) {
            throw new apiError(401, "Invalid password")
        }

        const { refreshToken, accessToken } = await generateRefreshAndAccessToken(user._id)

        const RefreshTokenCookieOption = {
            ...cookiesOptions,
            expires: new Date(Date.now() + JWT_REFRESH_TOKEN_EXPIRY * 24 * 60 * 60 * 1000)
        }
        const accessTokenCookieOptions = {
            ...cookiesOptions,
            expires: new Date(Date.now() + JWT_ACCESS_TOKEN_EXPIRY * 60 * 1000)
        }
        res.status(200).cookie("refreshToken", refreshToken, RefreshTokenCookieOption).cookie("accessToken", accessToken, accessTokenCookieOptions).json(new apiResponse(200, { accessToken, refreshToken }, "User logged in successfully")) //remove access and refresh token from response in production mode
    } catch (error) {
        throw new apiError(500, "something went wrong while logging in user")
    }
})


const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.headers.authorization?.split(" ")[1]


    if (!incomingRefreshToken) {
        throw new apiError(401, "Refresh token is required")
    }
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, JWT_REFRESH_SECRET)
        const user = await User.findById(decodedToken?.id)

        if (!user) {
            throw new apiError(401, "Invalid refresh token")
        }
        if (user?.refreshToken !== incomingRefreshToken) {
            throw new apiError(401, "Invalid refresh token")
        }

        const accessToken = await generateAccessToken(user)
        const option = {
            ...cookiesOptions,
            expires: new Date(Date.now() + JWT_ACCESS_TOKEN_EXPIRY * 60 * 1000),
        }

        return res.status(200).cookie("accessToken", accessToken, option).json(new apiResponse(200, { accessToken }, "Access token refreshed successfully")) //remove access token from response in production mode
    } catch (error) {
        throw new apiError(500, "Something went wrong while refreshing access token")
    }
})


const logout = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(req.user._id, {
        $set: { refreshToken: undefined }
    }, { new: true })

    return res.status(200).clearCookie("accessToken", cookiesOptions).clearCookie("refreshToken", cookiesOptions).json(new apiResponse(200, "User logged out successfully"))
})


const getUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new apiResponse(200, req.user, "User details fetched successfully"))
})

export { register, login, refreshAccessToken, logout, getUser }