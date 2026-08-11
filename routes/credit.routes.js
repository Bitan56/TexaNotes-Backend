import express from 'express'
import { addCredits, approvePayment, getPendingRequests, rejectPayment, requestCredits} from '../controllers/credits.controllers.js'

const creditRouter = express.Router()

creditRouter.put('/add-credits/:id', addCredits)
// creditRouter.post('/user-buy-credits', userBuyCredits);
creditRouter.post('/request-credits', requestCredits)
creditRouter.get('/pending-requests', getPendingRequests)
creditRouter.post('/approve-payment', approvePayment)
creditRouter.post('/reject-payment', rejectPayment)

export default creditRouter