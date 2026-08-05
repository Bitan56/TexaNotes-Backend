import express from 'express'
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import cors from "cors"
import connectDB from './config/db.js'
import authRouter from './routes/auth.routes.js'
import noteRouter from './routes/notes.route.js'
import userRouter from './routes/user.route.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

app.use(cors({
    origin: true, // This allows requests from ANY website (including your 127.0.0.1)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true 
}));
app.use(express.json())
app.use(cookieParser())

app.use("/api/auth", authRouter)
app.use('/api/notes', noteRouter)
app.use('/api/users',userRouter)

app.get("/", (req, res) => {
    res.send("hello")
})

connectDB()

// app.listen(port, () => {
//     console.log(`server started at http://localhost:${port}`)
// })

// CRITICAL: Export the app instance for Vercel
export default app