import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const transporter = nodemailer.createTransport({
    service: "Gmail",
    port: 465,
    secure: true, // use STARTTLS (upgrade connection to TLS after connecting)
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
    },
});

const sendMail = async (to,otp) => {
    await transporter.sendMail({
        from:`${process.env.EMAIL}`,
        to,
        subject:"OTP to reset your password",
        html:`<p>Kindly enter the following OTP: <b>${otp}</b> to reset your password.</p>
        <p>Thanks for using SparkZone. <b>KEEP THE SPARK ALIVE.</b></p>`
    })
}

export default sendMail