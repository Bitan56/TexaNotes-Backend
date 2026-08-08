import express from 'express'
import { addCredits } from '../controllers/credits.controllers.js'

const creditRouter = express.Router()

creditRouter.put('/add-credits/:id', addCredits)

export default creditRouter