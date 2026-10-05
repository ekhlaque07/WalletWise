const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

transporter.verify()
    .then(() => console.log("SMTP connection successful"))
    .catch((error) => console.error("SMTP error:", error.message));

const sendPasswordResetEmail = async (email, resetURL) => {
    const mailOptions = {
        from: `"WalletWise" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Reset Your WalletWise Password",
        html: `
            <h2>WalletWise Password Reset</h2>
            <p>You requested a password reset.</p>
            <p>Click the link below to reset your password:</p>
            <a href="${resetURL}">Reset Password</a>
            <p>This link expires in 15 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
        `,
    };

    return transporter.sendMail(mailOptions);
};

module.exports = { sendPasswordResetEmail };