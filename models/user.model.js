import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, JWT_ACCESS_TOKEN_EXPIRY, JWT_REFRESH_TOKEN_EXPIRY } from '../const.js';

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String
    }

}, { timestamps: true });


userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.verifyPassword = async function (password) {
    return await bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        id: this._id,
        user: this.userName
    }, JWT_ACCESS_SECRET, { expiresIn: JWT_ACCESS_TOKEN_EXPIRY })
}

userSchema.methods.generateRefreshToken = async function () {
    const token = jwt.sign({
        id: this._id,
        user: this.userName
    }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_TOKEN_EXPIRY })

    this.refreshToken = token
    await this.save()
    return token
}

export const User = mongoose.model('User', userSchema);
