import Transaction from "../models/transaction.model.js";
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

// Function for users buying credits via UPI
export const userBuyCredits = async (req, res) => {
    try {
        const { userName, amountPaid, creditsToAdd, transactionId } = req.body;

        // 1. Validate required fields
        if (!userName || !amountPaid || !creditsToAdd || !transactionId) {
            return res.status(400).json({ 
                message: "Missing payment details. Ensure you entered your UTR/Transaction ID." 
            });
        }

        // 2. Validate UTR Length (Standard UPI UTR is usually 12 digits)
        if (transactionId.length < 12) {
            return res.status(400).json({ message: "Invalid Transaction ID. Please enter a valid 12-digit UTR." });
        }

        // 3. Security Check: Prevent Tampering with Prices
        const isValidPackage = (amountPaid === 1 && creditsToAdd === 10) || 
                               (amountPaid === 10 && creditsToAdd === 100);
                               
        if (!isValidPackage) {
            return res.status(400).json({ message: "Invalid package pricing detected." });
        }

        // 4. Duplicate Check: Prevent users from re-using the same UTR
        const existingTransaction = await Transaction.findOne({ transactionId });
        if (existingTransaction) {
            return res.status(400).json({ 
                message: "This Transaction ID has already been used to claim credits." 
            });
        }

        // 5. Find the user
        const user = await User.findOne({ userName });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // 6. Log the transaction in the database
        // Note: creditedAmount is converted to a String because your schema defines it as a String
        await Transaction.create({
            transactionId: transactionId,
            userName: userName,
            creditedAmount: creditsToAdd.toString(),
            Date: new Date()
        });

        // 7. Add credits to user
        user.credits = (user.credits || 0) + creditsToAdd;
        await user.save();

        res.status(200).json({ 
            success: true, 
            message: "Credits added successfully.", 
            newBalance: user.credits 
        });

    } catch (error) {
        console.error("Error processing user credit purchase:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};