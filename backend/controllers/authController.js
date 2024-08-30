import bcryptjs from "bcryptjs";
import crypto from "crypto";

import { User } from "../models/userModel.js";

import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendPasswordResetEmail, sendResetSuccessEmail, sendVerificationEmail, sendWelcomeEmail } from "../mailtrap/emails.js";
import passport from "passport";

export const signup = async (req, res) => {
    const {email, password, name} = req.body;
    try {
        if(!email && !password && !name){
            throw new Error("All fields are required");
        }
        const userAlreadyExists = await User.findOne({email});
        if(userAlreadyExists){
            return res.status(400).json({success: false, message: "User already exists"})
        }

        const hashedPassword = await bcryptjs.hash(password, 10);
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        const user = new User({
            name,
            email,
            password: hashedPassword,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        })

        await user.save();

        // jwt
        generateTokenAndSetCookie(res, user._id);

        await sendVerificationEmail(user.email, verificationToken)

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                ...user._doc,
                password: undefined,
            }
        })
        
    } catch (error) {
        res.status(400).json({success: false, message: error.message})
    }
}


export const verifyEmail = async (req, res) => {
    const {code} = req.body;
    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: {$gt: Date.now()}
        })
        if(!user){
            return res.status(400).json({success: false, message: "Invalid or exprired verification code"})
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save()

        await sendWelcomeEmail(user.email, user.name);

        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: {
                ...user._doc,
                password: undefined,
            }
        });

    } catch (error) {
        console.log("error in verifyEmail ", error)
        res.status(500).json({success:false, message: "Server error"})
    }
}

export const login = async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({success: false, message: "Invalid credentials"});
        }
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(400).json({success: false, message: "Invalid credentials"})
        }

        generateTokenAndSetCookie(res, user._id);

        user.lastLogin = new Date();
        await user.save();

        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: {
                ...user._doc,
                password: undefined,
            }
        });


    } catch (error) {
        console.log("Error in login ", error);
        res.status(400).json({success: false, message: error.message});
    }
}

export const logout = async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({success: true, message: "Logged out successfully"});
}


export const forgotPassword = async (req, res) => {
	const { email } = req.body;
	try {
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		// Generate reset token
		const resetToken = crypto.randomBytes(20).toString("hex");
		const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; 

		user.resetPasswordToken = resetToken;
		user.resetPasswordExpiresAt = resetTokenExpiresAt;

		await user.save();

		// send email
		await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

		res.status(200).json({ success: true, message: "Password reset link sent to your email" });
	} catch (error) {
		console.log("Error in forgotPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const resetPassword = async (req, res) => {
	try {
		const { token } = req.params;
		const { password } = req.body;

		const user = await User.findOne({
			resetPasswordToken: token,
			resetPasswordExpiresAt: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
		}

		// update password
		const hashedPassword = await bcryptjs.hash(password, 10);

		user.password = hashedPassword;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpiresAt = undefined;
		await user.save();

		await sendResetSuccessEmail(user.email);

		res.status(200).json({ success: true, message: "Password reset successful" });
	} catch (error) {
		console.log("Error in resetPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const checkAuth = async (req, res) => {
	try {
		const user = await User.findById(req.userId).select("-password");
		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		res.status(200).json({ success: true, user });
	} catch (error) {
		console.log("Error in checkAuth ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

// Initiating Google OAuth2 Authentication
export const initiateGoogleAuth = (req, res, next) => {
    passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
};

// Handling Google OAuth2 Callback

export const handleGoogleAuthCallback = (req, res, next) => {
    passport.authenticate("google", {
        failureRedirect: "/login",
        session: false, 
    }, async (err, user, info) => {
        if (err || !user) {
            console.error("Authentication Error:", err || "No user");
            return res.status(400).json({ success: false, message: "Google authentication failed" });
        }

        try {
            // Log the user object to debug what is returned
            console.log("User Object:", user);

            // Check if the user already exists in the database
            let existingUser = await User.findOne({ googleId: user.id });

            if (!existingUser) {
                // Safely access the user's email and avatar
                const email = user.emails && user.emails[0] ? user.emails[0].value : null;
                const avatar = user.photos && user.photos[0] ? user.photos[0].value : null;

                // Handle the case where the email is not available
                if (!email) {
                    return res.status(400).json({ success: false, message: "No email found in the user profile" });
                }

                // Create a new user in MongoDB with isVerified set to true
                existingUser = new User({
                    googleId: user.id,
                    name: user.displayName,
                    email: email,
                    avatar: avatar,
                    isVerified: true, // Set to true for Google logins
                    verificationToken: null, // No need for a verification token
                    verificationTokenExpiresAt: null // No need for token expiry
                });

                await existingUser.save();
            } else {
                // User already exists, ensure isVerified is true for Google logins
                existingUser.isVerified = true;
                existingUser.verificationToken = null;
                existingUser.verificationTokenExpiresAt = null;

                await existingUser.save();
            }

            // Generate token and set it in a cookie
            generateTokenAndSetCookie(res, existingUser._id);

            // Redirect to the frontend application
            // res.redirect("http://localhost:5173");
            res.redirect("https://auth-b4ol.onrender.com");
        } catch (error) {
            console.error("Error processing user:", error);
            return res.status(500).json({ success: false, message: "Server error" });
        }
    })(req, res, next);
};



