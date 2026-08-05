import multer from 'multer'

// No fs import, no mkdirSync!

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Correctly using Vercel's writable temp folder
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