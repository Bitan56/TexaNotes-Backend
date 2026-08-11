// import Transaction from "../models/transaction.model.js";
import PaymentRequest from "../models/payment.model.js";
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
// export const userBuyCredits = async (req, res) => {
//     try {
//         const { userName, amountPaid, creditsToAdd, transactionId } = req.body;

//         // 1. Validate required fields
//         if (!userName || !amountPaid || !creditsToAdd || !transactionId) {
//             return res.status(400).json({ 
//                 message: "Missing payment details. Ensure you entered your UTR/Transaction ID." 
//             });
//         }

//         // 2. Validate UTR Length (Standard UPI UTR is usually 12 digits)
//         if (transactionId.length < 12) {
//             return res.status(400).json({ message: "Invalid Transaction ID. Please enter a valid 12-digit UTR." });
//         }

//         // 3. Security Check: Prevent Tampering with Prices
//         const isValidPackage = (amountPaid === 1 && creditsToAdd === 10) || 
//                                (amountPaid === 10 && creditsToAdd === 100);
                               
//         if (!isValidPackage) {
//             return res.status(400).json({ message: "Invalid package pricing detected." });
//         }

//         // 4. Duplicate Check: Prevent users from re-using the same UTR
//         const existingTransaction = await Transaction.findOne({ transactionId });
//         if (existingTransaction) {
//             return res.status(400).json({ 
//                 message: "This Transaction ID has already been used to claim credits." 
//             });
//         }

//         // 5. Find the user
//         const user = await User.findOne({ userName });
//         if (!user) {
//             return res.status(404).json({ message: "User not found." });
//         }

//         // 6. Log the transaction in the database
//         // Note: creditedAmount is converted to a String because your schema defines it as a String
//         await Transaction.create({
//             transactionId: transactionId,
//             userName: userName,
//             creditedAmount: creditsToAdd.toString(),
//             Date: new Date()
//         });

//         // 7. Add credits to user
//         user.credits = (user.credits || 0) + creditsToAdd;
//         await user.save();

//         res.status(200).json({ 
//             success: true, 
//             message: "Credits added successfully.", 
//             newBalance: user.credits 
//         });

//     } catch (error) {
//         console.error("Error processing user credit purchase:", error);
//         res.status(500).json({ message: "Internal server error." });
//     }
// };

// 1. User clicks "I Have Paid" -> Creates a pending request
export const requestCredits = async (req, res) => {
    try {
        const { userName, amountPaid, creditsToAdd } = req.body;

        if (!userName || !amountPaid || !creditsToAdd) {
            return res.status(400).json({ message: "Missing payment details." });
        }

        // Security Check: Prevent Tampering with Prices
        const isValidPackage = (amountPaid === 1 && creditsToAdd === 10) || 
                               (amountPaid === 10 && creditsToAdd === 100);
                               
        if (!isValidPackage) {
            return res.status(400).json({ message: "Invalid package pricing detected." });
        }

        // Prevent spamming requests (check if a pending request already exists for this user)
        const existingRequest = await PaymentRequest.findOne({ userName, status: 'pending' });
        if (existingRequest) {
            return res.status(400).json({ message: "You already have a pending payment request. Please wait for the developer to approve it." });
        }

        // Create the pending request
        await PaymentRequest.create({
            userName,
            amountPaid,
            creditsRequested: creditsToAdd
        });

        res.status(200).json({ 
            success: true, 
            message: "Payment request submitted! It will be reviewed shortly." 
        });

    } catch (error) {
        console.error("Error creating payment request:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

// 2. Developer fetches all pending requests
export const getPendingRequests = async (req, res) => {
    try {
        const requests = await PaymentRequest.find({ status: 'pending' }).sort({ requestDate: -1 });
        res.status(200).json({ success: true, data: requests });
    } catch (error) {
        res.status(500).json({ message: "Internal server error." });
    }
};

// 3. Developer Approves the Request
export const approvePayment = async (req, res) => {
    try {
        const { requestId, developerEmail } = req.body;

        // Security check for the specific developer email
        if (developerEmail !== "bitanchakraborty90@gmail.com") {
            return res.status(403).json({ message: "Unauthorized. Only the developer can approve payments." });
        }

        const request = await PaymentRequest.findById(requestId);
        if (!request || request.status !== 'pending') {
            return res.status(404).json({ message: "Request not found or already processed." });
        }

        const user = await User.findOne({ userName: request.userName });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Add credits to user
        user.credits = (user.credits || 0) + request.creditsRequested;
        await user.save();

        // Mark request as approved
        request.status = 'approved';
        await request.save();

        res.status(200).json({ success: true, message: "Payment approved and credits added." });

    } catch (error) {
        res.status(500).json({ message: "Internal server error." });
    }
};

// 4. Developer Rejects the Request
export const rejectPayment = async (req, res) => {
    try {
        const { requestId, developerEmail } = req.body;

        if (developerEmail !== "bitanchakraborty90@gmail.com") {
            return res.status(403).json({ message: "Unauthorized." });
        }

        const request = await PaymentRequest.findById(requestId);
        if (!request) return res.status(404).json({ message: "Request not found." });

        request.status = 'rejected';
        await request.save();

        res.status(200).json({ success: true, message: "Payment request rejected." });

    } catch (error) {
        res.status(500).json({ message: "Internal server error." });
    }
};