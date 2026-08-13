import express from 'express'
import { allUsers, deleteUser, toggleBlockUser, updateProfile, updateUserStatus } from '../controllers/user.controllers.js'

const userRouter = express.Router()

userRouter.get('/getusers',allUsers)
userRouter.put('/update/:username', updateProfile)
userRouter.put('/block/:username', toggleBlockUser)
userRouter.put('/update-status/:id', updateUserStatus)
userRouter.delete('/delete-user/:id', deleteUser);

export default userRouter