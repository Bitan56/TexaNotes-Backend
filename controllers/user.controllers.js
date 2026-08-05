import User from "../models/user.model.js"
import bcrypt from "bcryptjs";

export const allUsers = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error: Could not fetch users",
            error: error.message
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const currentUserName = req.params.username;
        const { name, email, userName, password } = req.body;

        // Find the user in the database
        const user = await User.findOne({
            $or: [{ userName: currentUserName }, { username: currentUserName }]
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Update fields if they were provided in the request
        if (name) user.name = name;
        if (email) user.email = email;
        if (userName) user.userName = userName; 

        // If the user wants to change their password, hash it before saving
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        // Save the updated user to the database
        const updatedUser = await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: {
                name: updatedUser.name,
                userName: updatedUser.userName,
                email: updatedUser.email
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Server Error: ${error.message}`,
            error: error.message
        });
    }
}; // <--- THIS WAS THE MISSING BRACE!

export const toggleBlockUser = async (req, res) => {
    try {
        const targetUserName = req.params.username;
        const { isBlocked } = req.body;

        // 1. Validate the input
        if (typeof isBlocked !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: "isBlocked must be a boolean (true or false)"
            });
        }

        // 2. Find the user in the database
        const user = await User.findOne({
            $or: [{ userName: targetUserName }, { username: targetUserName }]
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // 3. Security Check: Prevent admins from blocking other admins
        if (user.isAdmin && isBlocked === true) {
            return res.status(403).json({
                success: false,
                message: "You cannot block an administrator."
            });
        }

        // 4. Update the block status and save
        user.isBlocked = isBlocked;
        await user.save();

        // 5. Send success response
        res.status(200).json({
            success: true,
            message: `User has been successfully ${isBlocked ? 'blocked' : 'unblocked'}.`,
            data: {
                userName: user.userName || user.username,
                isBlocked: user.isBlocked
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error: Could not update block status",
            error: error.message
        });
    }
};

export const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isAdmin, isBlocked } = req.body;

        // Find the user
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Update fields if they are provided in the request
        if (isAdmin !== undefined) user.isAdmin = isAdmin;
        if (isBlocked !== undefined) user.isBlocked = isBlocked;

        await user.save();

        res.status(200).json({
            success: true,
            message: "User status updated successfully",
            data: {
                id: user._id,
                userName: user.userName,
                isAdmin: user.isAdmin,
                isBlocked: user.isBlocked
            }
        });

    } catch (error) {
        console.error("Error updating user status:", error);
        res.status(500).json({
            success: false,
            message: "Server Error: Could not update user status",
            error: error.message
        });
    }
};