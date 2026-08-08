import User from "../models/user.model.js";


// Function to handle adding credits
export const addCredits = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;

        // Validation
        if (!amount || typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ message: "Invalid credit amount provided. Must be a positive number." });
        }

        // Find user
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Initialize credit to 0 if it doesn't exist, then add the amount
        user.credits = (user.credits || 0) + amount;
        await user.save();

        res.status(200).json({ 
            message: "Credits added successfully.", 
            credits: user.credits 
        });
        
    } catch (error) {
        console.error("Error adding credits:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};