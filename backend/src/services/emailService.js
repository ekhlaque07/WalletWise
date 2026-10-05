const { Resend } = require("resend");

const resend = new Resend(
    process.env.RESEND_API_KEY
);

const sendPasswordResetEmail = async (
    email,
    resetURL
) => {
    try {
        const { data, error } = await resend.emails.send({
            from:
                process.env.EMAIL_FROM ||
                "WalletWise <onboarding@resend.dev>",

            to: [email],

            subject: "Reset Your WalletWise Password",

            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>WalletWise Password Reset</title>
                </head>

                <body
                    style="
                        margin: 0;
                        padding: 0;
                        background-color: #f4f7fb;
                        font-family: Arial, sans-serif;
                    "
                >
                    <div
                        style="
                            max-width: 600px;
                            margin: 40px auto;
                            background: #ffffff;
                            border-radius: 12px;
                            padding: 32px;
                            box-shadow:
                                0 4px 20px
                                rgba(0, 0, 0, 0.08);
                        "
                    >
                        <h2
                            style="
                                color: #111827;
                                margin-bottom: 20px;
                            "
                        >
                            WalletWise Password Reset
                        </h2>

                        <p
                            style="
                                color: #4b5563;
                                font-size: 15px;
                                line-height: 1.6;
                            "
                        >
                            You requested a password reset
                            for your WalletWise account.
                        </p>

                        <p
                            style="
                                color: #4b5563;
                                font-size: 15px;
                                line-height: 1.6;
                            "
                        >
                            Click the button below to
                            create a new password.
                        </p>

                        <div
                            style="
                                margin: 30px 0;
                                text-align: center;
                            "
                        >
                            <a
                                href="${resetURL}"
                                style="
                                    display: inline-block;
                                    padding: 12px 24px;
                                    background: #0072ff;
                                    color: #ffffff;
                                    text-decoration: none;
                                    border-radius: 8px;
                                    font-weight: bold;
                                "
                            >
                                Reset Password
                            </a>
                        </div>

                        <p
                            style="
                                color: #6b7280;
                                font-size: 14px;
                                line-height: 1.6;
                            "
                        >
                            This password reset link
                            expires in 15 minutes.
                        </p>

                        <p
                            style="
                                color: #6b7280;
                                font-size: 14px;
                                line-height: 1.6;
                            "
                        >
                            If you didn't request this
                            password reset, you can safely
                            ignore this email.
                        </p>

                        <hr
                            style="
                                border: none;
                                border-top:
                                    1px solid #e5e7eb;
                                margin: 30px 0;
                            "
                        >

                        <p
                            style="
                                color: #9ca3af;
                                font-size: 12px;
                                text-align: center;
                            "
                        >
                            © WalletWise
                        </p>
                    </div>
                </body>
                </html>
            `,
        });

        if (error) {
            console.error(
                "Resend email error:",
                error
            );

            throw new Error(
                error.message ||
                "Failed to send password reset email"
            );
        }

        console.log(
            "Password reset email sent:",
            data?.id
        );

        return data;
    } catch (error) {
        console.error(
            "Password reset email failed:",
            error.message
        );

        throw error;
    }
};

module.exports = {
    sendPasswordResetEmail,
};