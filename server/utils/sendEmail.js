const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Create Transporter
    // For DEV, we can use Ethereal (fake SMTP) if no real process.env credentials
    // For now, I'll setup a basic transporter structure expecting ENV or use console.log mock if missing

    // Using Ethereal for testing if no env vars
    let transporter;

    if (process.env.SMTP_HOST) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT),
            secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD
            },
            tls: {
                rejectUnauthorized: false // Helps with some network/cert issues
            }
        });
    } else {
        // Fallback to Ethereal
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
        console.log('Using Ethereal Mail (Check console for Preview URL)');
    }

    // 2. Define Email Options
    const message = {
        from: `${process.env.FROM_NAME || 'BeyondHeaven'} <${process.env.FROM_EMAIL || 'noreply@beyondheaven.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html // Optional HTML version
    };

    // 3. Send Email
    const info = await transporter.sendMail(message);

    console.log('Message sent: %s', info.messageId);
    if (!process.env.SMTP_HOST) {
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
};

module.exports = sendEmail;
