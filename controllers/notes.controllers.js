import uploadOnCloudinary from "../config/cloudinary.js";
import Notes from "../models/notes.model.js"
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import User from "../models/user.model.js";

export const UploadNotes = async (req, res) => {
    try {
        const { name, uploadedBy, uploadedOn, subject, paper, semester, paperCode, moduleNumber, teacher } = req.body

        // 1. Check if the most critical data exists before doing anything else
        if (!req.file) {
            return res.status(400).json({ message: "A file must be provided." })
        }

        if (!name || !uploadedBy) {
            return res.status(400).json({ message: "Name and uploadedBy are required fields." })
        }

        // 2. Upload to Cloudinary
        const notePdf = await uploadOnCloudinary(req.file.path)

        // 3. Catch failed Cloudinary uploads
        if (!notePdf) {
            return res.status(500).json({ message: "Failed to upload the file to cloud storage." })
        }

        // 4. Save to Database
        const notes = await Notes.create({
            name,
            uploadedBy,
            uploadedOn,
            subject,
            semester,
            paper,
            paperCode,
            moduleNumber,
            teacher,
            noteUrl: notePdf.url,
            filePublicId: notePdf.public_id,
            fileType: notePdf.resource_type
        })

        return res.status(201).json(notes)

    } catch (error) {
        console.error("UploadNotes Controller Error:", error);
        return res.status(500).json({ message: `Error occurred while uploading notes: ${error.message}` })
    }
}

export const getAllNotes = async (req, res) => {
    try {
        // Fetch all notes from the database
        // .sort({ createdAt: -1 }) will return the most recently uploaded notes first
        const notes = await Notes.find().sort({ createdAt: -1 });

        // Send a successful response with the data
        return res.status(200).json({
            success: true,
            count: notes.length,
            data: notes
        });

    } catch (error) {
        console.error("Error fetching notes:", error);

        // Send a 500 Internal Server Error if the database query fails
        res.status(500).json({
            success: false,
            message: "Server Error: Could not fetch notes",
            error: error.message
        });
    }
};

// Ensure cloudinary is configured somewhere in your app setup like this:
// cloudinary.config({ cloud_name: process.env.CLOUD_NAME, api_key: process.env.API_KEY, api_secret: process.env.API_SECRET });

export const deleteNote = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Find the note in the database
        const note = await Notes.findById(id);

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found."
            });
        }

        // 2. Delete the file from Cloudinary
        // NOTE: Your Note model MUST store the Cloudinary public ID when it gets created. 
        // Example: note.cloudinaryId = result.public_id (from the upload response)
        if (note.cloudinaryId) {
            await cloudinary.uploader.destroy(note.filePublicId, { resource_type: "raw" }); // use "raw" for pdfs/docs, or "image" for images
        }

        // 3. Delete the note from MongoDB
        await Notes.findByIdAndDelete(id);

        // 4. Send success response
        res.status(200).json({
            success: true,
            message: "Note and associated file deleted successfully."
        });

    } catch (error) {
        console.error("Error deleting note:", error);
        res.status(500).json({
            success: false,
            message: "Server Error: Could not delete the note.",
            error: error.message
        });
    }
};

export const getNoteById = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch the note from the database
        const note = await Notes.findById(id);

        // Check if the note exists
        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found."
            });
        }

        // Return the note data
        res.status(200).json({
            success: true,
            data: note
        });

    } catch (error) {
        console.error("Error fetching note by ID:", error);
        
        // Handle cases where the ID format is invalid (not a valid MongoDB ObjectId)
        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: "Invalid Note ID format."
            });
        }

        res.status(500).json({
            success: false,
            message: "Server Error: Could not fetch the note.",
            error: error.message
        });
    }
};

export const updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        
        // 1. Find existing note
        const note = await Notes.findById(id);
        if (!note) {
            return res.status(404).json({ success: false, message: "Note not found" });
        }

        // 2. Handle File Replacement (if a new file is uploaded)
        if (req.file) {
            // A. Delete the old file from Cloudinary (if it exists)
            if (note.cloudinaryId) {
                // Must use resource_type: 'raw' for PDFs!
                await cloudinary.uploader.destroy(note.cloudinaryId, { resource_type: 'raw' });
            }

            // B. Upload the new file to Cloudinary
            const uploadResult = await cloudinary.uploader.upload(req.file.path, {
                resource_type: 'raw',
                format: 'pdf',
                folder: 'notes_app'
            });

            // C. Update Database Fields with new URL and ID
            note.noteUrl = uploadResult.secure_url;
            note.filePublicId = uploadResult.public_id;

            // D. Remove the temporarily saved local file from the server
            fs.unlinkSync(req.file.path);
        }

        // 3. Update Text Fields
        // Only update fields that were actually provided in the form
        if (req.body.name) note.name = req.body.name;
        if (req.body.uploadedBy) note.uploadedBy = req.body.uploadedBy;
        if (req.body.semester) note.semester = req.body.semester;
        if (req.body.subject) note.subject = req.body.subject;
        if (req.body.paper) note.paper = req.body.paper;
        if (req.body.paperCode) note.paperCode = req.body.paperCode;
        if (req.body.moduleNumber) note.moduleNumber = req.body.moduleNumber;
        if (req.body.teacher) note.teacher = req.body.teacher;

        // 4. Save to Database
        await note.save();

        res.status(200).json({
            success: true,
            message: "Note updated successfully",
            data: note
        });

    } catch (error) {
        console.error("Error updating note:", error);
        res.status(500).json({
            success: false,
            message: "Server Error: Could not update the note",
            error: error.message
        });
    }
};

// Function to handle a user purchasing a note
export const purchaseNote = async (req, res) => {
    try {
        const { userName, noteId } = req.body;

        // Validation
        if (!userName || !noteId) {
            return res.status(400).json({ message: "Missing userName or noteId." });
        }

        // Fetch User and Note from DB
        const user = await User.findOne({ userName });
        const note = await Notes.findById(noteId);

        if (!user) return res.status(404).json({ message: "User not found." });
        if (!note) return res.status(404).json({ message: "Note not found." });

        // Check if user already owns this note
        if (user.notes.includes(noteId)) {
            return res.status(200).json({ 
                message: "You already own this note.", 
                credits: user.credits 
            });
        }

        // Check if user has enough credits
        if (user.credits < note.price) {
            return res.status(400).json({ 
                message: "Insufficient credits to unlock this note." 
            });
        }

        // Deduct credits and add note to user's array
        user.credits -= note.price;
        user.notes.push(noteId);
        
        await user.save();

        res.status(200).json({ 
            message: "Note unlocked successfully!", 
            credits: user.credits 
        });
        
    } catch (error) {
        console.error("Error purchasing note:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};