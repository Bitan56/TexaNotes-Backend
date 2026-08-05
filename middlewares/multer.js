import multer from 'multer'
import fs from 'fs'

// Optional but highly recommended: 
// Automatically create the 'public' folder if it accidentally gets deleted
const dir = './public';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "/tmp")
    },
    filename: (req, file, cb) => {
        // 1. Replace all spaces with underscores
        const safeName = file.originalname.replace(/\s+/g, '_')
        
        // 2. Add a timestamp to the front so every file is 100% unique
        cb(null, `${Date.now()}-${safeName}`)
    }
})

export const upload = multer({ storage })