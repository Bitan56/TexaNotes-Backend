import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'
import { json } from 'stream/consumers';

const uploadOnCloudinary = async (file) => {
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        const result = await cloudinary.uploader.upload(file, {
            resource_type: 'auto'
        })
        fs.unlinkSync(file)
        return result

    } catch (error) {
        fs.unlinkSync(file)
        console.log(error)
    }
}

export const deleteOnCloudinary = async (publicId) => {
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true
        });

        const result = await cloudinary.uploader.destroy(publicId)
        return json({ message: `File deletion successfull` })

    } catch (error) {
        fs.unlinkSync(file)
        console.log(error)
    }
}

export default uploadOnCloudinary