const nodemailer = require('nodemailer');

// ----------------------
// Configure transporter
// ----------------------
const transporter = nodemailer.createTransport({
    // @ts-ignore
    host: process.env.MAIL_HOST,       // e.g., "smtp.gmail.com"
    port: process.env.MAIL_PORT || 587,
    secure: false,                     // true for port 465
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,     // Use App Password for Gmail
    },
});

// Verify transporter connection
transporter.verify((error, success) => {
    if (error) {
        console.error("Mail transporter error:", error);
    } else {
        console.log("Mail transporter is ready ✅");
    }
});

// ----------------------
// Send Email Function
// ----------------------
async function sendMail({ to, subject, text, html }) {
    try {
        const info = await transporter.sendMail({
            from: `"My App" <${process.env.MAIL_USER}>`,
            to,
            subject,
            text,
            html,
        });

        console.log("Email sent:", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}

module.exports = { sendMail };
