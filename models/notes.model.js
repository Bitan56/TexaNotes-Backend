import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    uploadedBy: {
        type: String,
    },
    uploadedOn:{
        type: String
    },
    semester:{
        type: String
    },
    noteUrl: {
        type: String,
    },
    filePublicId:{
        type: String
    },
    fileType:{
        type: String
    },
    subject: {
        type: String,
    },
    paper: {
        type: String
    },
    paperCode:{
        type: String
    },
    moduleNumber: {
        type: String
    },
    teacher:{
        type: String
    }
}, {
    timestamps: true
})

const Notes = mongoose.model("Notes", noteSchema)
export default Notes