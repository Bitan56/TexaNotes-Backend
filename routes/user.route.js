import express from 'express'
import { allUsers, toggleBlockUser, updateProfile, updateUserStatus } from '../controllers/user.controllers.js'

const userRouter = express.Router()

userRouter.get('/getusers',allUsers)
userRouter.put('/update/:username', updateProfile)
userRouter.put('/block/:username', toggleBlockUser)
userRouter.put('/update-status/:id', updateUserStatus)

export default userRouter