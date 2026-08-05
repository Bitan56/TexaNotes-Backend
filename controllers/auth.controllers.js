import uploadOnCloudinary from "../config/cloudinary.js"
import sendMail from "../config/Mail.js"
import genToken from "../config/token.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"

export const signUp = async (req, res) => {
    try {
        const { name, userName, email, password } = req.body
        const findByEmail = await User.findOne({ email })
        if (findByEmail) {
            return res.status(400).json({ message: "Email already exist!!" })
        }
        const findByUsername = await User.findOne({ userName })
        if (findByUsername) {
            return res.status(400).json({ message: "Username already exist!!" })
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be of atleast six characters" })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({
            name,
            userName,
            email,
            password: hashedPassword
        })

        const token = await genToken(user._id)

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 10 * 365 * 24 * 60 * 60 * 1000,
            secure: false,
            sameSite: "Lax"
        })

        return res.status(201).json(user)


    } catch (error) {
        return res.status(500).json({ message: `Error occured while creating user: ${error.message}` })
    }
}

export const signIn = async (req, res) => {
    try {
        const { userName, password } = req.body

        const user = await User.findOne({ userName })
        if (!user) {
            return res.status(400).json({ message: "User not found!!" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect Password" })
        }

        const token = await genToken(user._id)

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 10 * 365 * 24 * 60 * 60 * 1000,
            secure: false,
            sameSite: "Lax"
        })

        return res.status(200).json(user)


    } catch (error) {
        return res.status(500).json({ message: `Error occured while signing in user: ${error.message}` })
    }
}

export const signOut = async (req, res) => {
    try {
        res.clearCookie("token")
        return res.status(200).json({ message: "User signed out succesfully" })
    } catch (error) {
        return res.status(500).json({ message: `Sign out error: ${error.message}` })
    }
}

export const sendOtp = async (req, res) => {
    try {
        const { email } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "Enter an existing email" })
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString()

        user.resetOtp = otp
        user.otpExpires = Date.now() + 5 * 60 * 1000
        user.isOtpVerified = false

        await user.save()
        await sendMail(email, otp)
        return res.status(200).json({ message: "OTP sent successfully" })

    } catch (error) {
        return res.status(500).json({ message: `OTP send error: ${error}` })
    }
}

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body
        const user = await User.findOne({ email })

        if (!user || user.resetOtp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" })
        }

        user.isOtpVerified = true
        user.resetOtp = undefined
        user.otpExpires = undefined

        await user.save()
        return res.status(200).json({ message: "OTP verified successfully" })

    } catch (error) {
        return res.status(500).json({ message: `OTP verification error: ${error}` })
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })

        if (!user || !user.isOtpVerified) {
            return res.status(400).json({ message: "OTP verification required" })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        user.password = hashedPassword
        user.isOtpVerified = false

        await user.save()
        return res.status(200).json({ message: "Password reset successfully" })

    } catch (error) {
        return res.status(500).json({ message: `Password reset error: ${error}` })
    }
}