import express from 'express'
import { deleteNote, getAllNotes, getNoteById, purchaseNote, updateNote, UploadNotes } from '../controllers/notes.controllers.js'
import { upload } from '../middlewares/multer.js'

const noteRouter = express.Router()

noteRouter.post('/uploadnotes', upload.single("pdfFile") ,UploadNotes)
noteRouter.get('/getnotes',getAllNotes)
noteRouter.delete('/delete/:id', deleteNote)
noteRouter.get('/:id', getNoteById)
noteRouter.put('/update/:id', upload.single('file'), updateNote)
noteRouter.post('/purchase', purchaseNote);


export default noteRouter