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
    if (!this.isModified('passwordHash')) return next();
    this.passwordHash  = await bcrypt.hash(this.passwordHash , 10)
    next()
})

userSchema.methods.verifyPassword = async function (password) {
    return await bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.generateAccessToken = function () {
    try {
        
        return jwt.sign({
            id: this._id,
            user: this.userName
        }, JWT_ACCESS_SECRET, { expiresIn: `${JWT_ACCESS_TOKEN_EXPIRY}m` })
    } catch (error) {
        console.log(error);
    }
}

userSchema.methods.generateRefreshToken = async function () {
    try {

        const token = jwt.sign({
            id: this._id,
            user: this.userName
        }, JWT_REFRESH_SECRET, { expiresIn: `${JWT_REFRESH_TOKEN_EXPIRY}d` })
    
        this.refreshToken = token
        await this.save()
        return token
    } catch (error) {
        console.log(error);
    }
}

export const User = mongoose.model('User', userSchema);
