import express from 'express'
import { addCredits, userBuyCredits } from '../controllers/credits.controllers.js'

const creditRouter = express.Router()

creditRouter.put('/add-credits/:id', addCredits)
creditRouter.post('/user-buy-credits', userBuyCredits);

export default creditRouter