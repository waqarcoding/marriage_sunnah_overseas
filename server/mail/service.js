// services/emailService.js

import nodemailer from 'nodemailer';

// ----------------------
// Configure transporter
// ----------------------
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

// Verify transporter connection
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Mail transporter error:", error);
    } else {
        console.log("✅ Mail transporter is ready");
    }
});

// ----------------------
// Email Template
// ----------------------
const getEmailTemplate = (content) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Marriage Sunna</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            background: linear-gradient(135deg, #1B4D3E 0%, #2d7a5f 100%);
            padding: 40px 20px;
            text-align: center;
        }
        .logo {
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        .tagline {
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
            font-weight: 400;
        }
        .content {
            padding: 40px 30px;
        }
        .content h1 {
            color: #1B4D3E;
            font-size: 24px;
            margin-bottom: 20px;
        }
        .content p {
            color: #555555;
            font-size: 15px;
            margin-bottom: 15px;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #1B4D3E 0%, #2d7a5f 100%);
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            font-size: 15px;
        }
        .button:hover {
            opacity: 0.9;
        }
        .info-box {
            background-color: #f8f9fa;
            border-left: 4px solid #1B4D3E;
            padding: 16px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .info-box p {
            margin-bottom: 8px;
            color: #666666;
            font-size: 14px;
        }
        .info-box p:last-child {
            margin-bottom: 0;
        }
        .profile-card {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .profile-image {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            margin: 0 auto 15px;
            object-fit: cover;
            border: 4px solid #1B4D3E;
        }
        .profile-name {
            font-size: 20px;
            font-weight: 700;
            color: #1B4D3E;
            margin-bottom: 10px;
        }
        .profile-details {
            color: #666666;
            font-size: 14px;
            line-height: 1.8;
        }
        .match-container {
            display: table;
            width: 100%;
            margin: 30px 0;
        }
        .match-profile {
            display: table-cell;
            width: 45%;
            vertical-align: top;
            text-align: center;
        }
        .match-heart {
            display: table-cell;
            width: 10%;
            text-align: center;
            vertical-align: middle;
            font-size: 32px;
            color: #e74c3c;
        }
        .divider {
            height: 1px;
            background-color: #e5e7eb;
            margin: 30px 0;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 30px 20px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer-quote {
            color: #1B4D3E;
            font-size: 14px;
            font-style: italic;
            margin: 20px 0;
            padding: 0 20px;
        }
        .footer-links {
            margin: 20px 0;
        }
        .footer-links a {
            color: #1B4D3E;
            text-decoration: none;
            margin: 0 12px;
            font-size: 13px;
            font-weight: 500;
        }
        .footer-copyright {
            color: #999999;
            font-size: 12px;
            margin-top: 20px;
        }
        @media only screen and (max-width: 600px) {
            .content {
                padding: 30px 20px;
            }
            .match-container {
                display: block;
            }
            .match-profile {
                display: block;
                width: 100%;
                margin-bottom: 20px;
            }
            .match-heart {
                display: block;
                width: 100%;
                margin: 10px 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Marriage Sunna</div>
            <div class="tagline">Finding Your Perfect Match Through Faith</div>
        </div>

        <div class="content">
            ${content}
        </div>

        <div class="footer">
            <div class="footer-quote">
                "And of His signs is that He created for you from yourselves mates that you may find tranquility in them; and He placed between you affection and mercy." - Quran 30:21
            </div>

            <div class="footer-links">
                <a href="${process.env.CLIENT_URL || 'https://marriagesunna.com'}">Home</a>
                <a href="${process.env.CLIENT_URL || 'https://marriagesunna.com'}/about">About</a>
                <a href="${process.env.CLIENT_URL || 'https://marriagesunna.com'}/contact">Contact</a>
            </div>

            <div class="footer-copyright">
                © ${new Date().getFullYear()} Marriage Sunna. All rights reserved.
            </div>
        </div>
    </div>
</body>
</html>
    `;
};

// ----------------------
// Helper: Get avatar URL
// ----------------------
const getAvatarUrl = (user) => {
    if (!user || !user.avatar_url) {
        return 'https://via.placeholder.com/120';
    }
    // If avatar_url is already a full URL, return it
    if (user.avatar_url.startsWith('http')) {
        return user.avatar_url;
    }
    // Otherwise, construct the full URL
    return `${process.env.CLIENT_URL || 'https://marriagesunna.com'}/uploads/${user.avatar_url}`;
};

// ----------------------
// Helper: Format height
// ----------------------
const formatHeight = (heightInches) => {
    if (!heightInches) return null;
    const feet = Math.floor(heightInches / 12);
    const inches = heightInches % 12;
    return `${feet}'${inches}"`;
};

// ----------------------
// Send Email Function
// ----------------------
/**
 * Send an email with Marriage Sunna template
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content (will be wrapped in template)
 * @param {string} [options.text] - Plain text version (optional)
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export const sendMail = async ({ to, subject, html, text }) => {
    // Prevent sending emails in development mode
    if (process.env.NODE_ENV === "development") {
        console.log(
            `📧 [DEV MODE: NOT SENT] Would send email to ${to}: ${subject}`
        );
        return { success: true, messageId: "dev-mode-no-send" };
    }

    try {
        console.log(`📧 Sending email to ${to}: ${subject}`);

        const fullHtml = getEmailTemplate(html);

        const info = await transporter.sendMail({
            from: `"Marriage Sunna" <${process.env.MAIL_USER}>`,
            to,
            subject,
            text: text || subject,
            html: fullHtml,
        });

        console.log(`✅ Email sent: ${info.messageId}`);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error(`❌ Error sending email to ${to}:`, error);
        // @ts-ignore
        return { success: false, error: error };
    }
};

// ----------------------
// Email Templates
// ----------------------

/**
 * Send welcome email to new user
 */
export const sendWelcomeEmail = async (user) => {
    const content = `
        <h1>Welcome to Marriage Sunna! 🎉</h1>
        <p>Assalamu Alaikum ${user.name},</p>
        <p>We're delighted to have you join our community of Muslims seeking marriage through faith and values.</p>
        
        <div class="info-box">
            <p><strong>✓ Complete your profile</strong> - Add photos and details</p>
            <p><strong>✓ Set your preferences</strong> - Tell us what you're looking for</p>
            <p><strong>✓ Browse matches</strong> - Start exploring potential partners</p>
            <p><strong>✓ Connect with matches</strong> - Send interests and start conversations</p>
        </div>

        <a href="${process.env.CLIENT_URL}/profile/edit" class="button">Complete Your Profile</a>

        <p>May Allah guide you to your perfect match!</p>
        <p><strong>The Marriage Sunna Team</strong></p>
    `;

    return await sendMail({
        to: user.email,
        subject: 'Welcome to Marriage Sunna - Your Journey Begins!',
        html: content
    });
};

/**
 * Send interest received notification with sender profile
 * @param {Object} recipient - Recipient User model (with email, name, avatar_url)
 * @param {Object} sender - Sender User model (with email, name, avatar_url)
 * @param {Object} senderProfile - Sender Profile model (with age, height_inches, city, country, etc.)
 */
export const sendInterestReceivedEmail = async (recipient, sender, senderProfile) => {
    const avatarUrl = getAvatarUrl(sender);
    const height = formatHeight(senderProfile?.height_inches);

    const content = `
        <h1>Someone is Interested in You! 💚</h1>
        <p>Assalamu Alaikum ${recipient.name},</p>
        <p>Great news! Someone has expressed interest in your profile.</p>
        
        <div class="profile-card">
            <img src="${avatarUrl}" alt="${sender.name}" class="profile-image" />
            <div class="profile-name">${sender.name}</div>
            <div class="profile-details">
                ${senderProfile?.age ? `<strong>Age:</strong> ${senderProfile.age} years<br>` : ''}
                ${height ? `<strong>Height:</strong> ${height}<br>` : ''}
                ${senderProfile?.city && senderProfile?.country ? `<strong>Location:</strong> ${senderProfile.city}, ${senderProfile.country}<br>` : ''}
                ${senderProfile?.education ? `<strong>Education:</strong> ${senderProfile.education}<br>` : ''}
                ${senderProfile?.profession ? `<strong>Profession:</strong> ${senderProfile.profession}<br>` : ''}
            </div>
        </div>

        <div class="info-box">
            <p><strong>💡 Next Steps:</strong></p>
            <p>• Review their complete profile</p>
            <p>• Accept or decline the interest</p>
            <p>• If you have a guardian, they may need to approve</p>
        </div>

        <a href="${process.env.CLIENT_URL}/interests" class="button">View Interest</a>

        <p>May Allah make it easy for you!</p>
        <p><strong>The Marriage Sunna Team</strong></p>
    `;

    return await sendMail({
        to: recipient.email,
        subject: `${sender.name} is interested in you!`,
        html: content
    });
};
/**
 * Send guardian notification for mutual interest (both users accepted, need guardian approval)
 * @param {Object} guardian - Guardian User model
 * @param {string} wardName - Ward's name
 * @param {string} otherPersonName - Other person's name
 * @param {Object} otherPersonProfile - Other person's Profile model
 */
export const sendGuardianMutualInterestEmail = async (guardian, wardName, otherPersonName, otherPersonProfile) => {
    const otherPersonAvatar = getAvatarUrl({ avatar_url: otherPersonProfile?.images ? JSON.parse(otherPersonProfile.images)[0] : null });
    const height = formatHeight(otherPersonProfile?.height_inches);

    const content = `
        <h1>Mutual Interest for Your Ward 🕌</h1>
        <p>Assalamu Alaikum ${guardian.name},</p>
        <p><strong>${wardName}</strong> and <strong>${otherPersonName}</strong> have mutually accepted each other's interest.</p>
        
        <div class="profile-card">
            <img src="${otherPersonAvatar}" alt="${otherPersonName}" class="profile-image" />
            <div class="profile-name">${otherPersonName}</div>
            <div class="profile-details">
                ${otherPersonProfile?.age ? `<strong>Age:</strong> ${otherPersonProfile.age} years<br>` : ''}
                ${height ? `<strong>Height:</strong> ${height}<br>` : ''}
                ${otherPersonProfile?.city && otherPersonProfile?.country ? `<strong>Location:</strong> ${otherPersonProfile.city}, ${otherPersonProfile.country}<br>` : ''}
                ${otherPersonProfile?.education ? `<strong>Education:</strong> ${otherPersonProfile.education}<br>` : ''}
                ${otherPersonProfile?.profession ? `<strong>Profession:</strong> ${otherPersonProfile.profession}<br>` : ''}
            </div>
        </div>

        <div class="info-box">
            <p><strong>Your approval is now required to create a match.</strong></p>
            <p>• Review both profiles carefully</p>
            <p>• Approve or decline the interest</p>
            <p>• Guide your ward in making the right decision</p>
            <p>• Both users have already accepted each other</p>
        </div>

        <a href="${process.env.FRONTEND_URL}/guardian/pending" class="button">Review Interest</a>

        <p>May Allah guide you in making the best decision!</p>
        <p><strong>The Marriage Sunna Team</strong></p>
    `;

    return await sendMail({
        to: guardian.email,
        subject: `Mutual Interest for ${wardName} - Approval Needed`,
        html: content
    });
};
/**
 * Send interest accepted - User accepted (waiting for guardian approval)
 * @param {Object} sender - Original sender User model
 * @param {Object} acceptedBy - Person who accepted User model
 * @param {Object} acceptedByProfile - Person who accepted Profile model
 */
export const sendInterestAcceptedEmail = async (sender, acceptedBy, acceptedByProfile) => {
    const avatarUrl = getAvatarUrl(acceptedBy);
    const height = formatHeight(acceptedByProfile?.height_inches);

    const content = `
        <h1>Interest Accepted! ✅</h1>
        <p>Assalamu Alaikum ${sender.name},</p>
        <p>Wonderful news! <strong>${acceptedBy.name}</strong> has accepted your interest.</p>
        
        <div class="profile-card">
            <img src="${avatarUrl}" alt="${acceptedBy.name}" class="profile-image" />
            <div class="profile-name">${acceptedBy.name}</div>
            <div class="profile-details">
                ${acceptedByProfile?.age ? `<strong>Age:</strong> ${acceptedByProfile.age} years<br>` : ''}
                ${height ? `<strong>Height:</strong> ${height}<br>` : ''}
                ${acceptedByProfile?.city && acceptedByProfile?.country ? `<strong>Location:</strong> ${acceptedByProfile.city}, ${acceptedByProfile.country}<br>` : ''}
                ${acceptedByProfile?.education ? `<strong>Education:</strong> ${acceptedByProfile.education}<br>` : ''}
                ${acceptedByProfile?.profession ? `<strong>Profession:</strong> ${acceptedByProfile.profession}<br>` : ''}
            </div>
        </div>

        <div class="info-box">
            <p><strong>⏳ Pending Guardian Approval:</strong></p>
            <p>Both families need to approve before you can start messaging. We'll notify you once the guardians approve this match.</p>
        </div>

        <a href="${process.env.CLIENT_URL}/interests" class="button">View Status</a>

        <p>May Allah bless this connection!</p>
        <p><strong>The Marriage Sunna Team</strong></p>
    `;

    return await sendMail({
        to: sender.email,
        subject: `${acceptedBy.name} accepted your interest!`,
        html: content
    });
};

/**
 * Send guardian approval notification to ward
 * @param {Object} ward - Ward User model
 * @param {string} guardianName - Guardian's name
 * @param {string} otherPersonName - Other person's name
 */
export const sendGuardianApprovedEmail = async (ward, guardianName, otherPersonName) => {
    const content = `
        <h1>Guardian Approved! 🕌</h1>
        <p>Assalamu Alaikum ${ward.name},</p>
        <p>Great news! Your guardian <strong>${guardianName}</strong> has approved your interest with <strong>${otherPersonName}</strong>.</p>
        
        <div class="info-box">
            <p><strong>✅ What this means:</strong></p>
            <p>• Your guardian has reviewed the profile</p>
            <p>• They've given their approval for this match</p>
            <p>• Waiting for the other family's guardian approval</p>
            <p>• Once both guardians approve, you can start messaging</p>
        </div>

        <a href="${process.env.CLIENT_URL}/interests" class="button">View Interest</a>

        <p>May Allah make it easy for you!</p>
        <p><strong>The Marriage Sunna Team</strong></p>
    `;

    return await sendMail({
        to: ward.email,
        subject: 'Guardian Approved Your Interest - Marriage Sunna',
        html: content
    });
};

/**
 * Send guardian rejection notification to ward
 * @param {Object} ward - Ward User model
 * @param {string} guardianName - Guardian's name
 * @param {string} otherPersonName - Other person's name
 */
export const sendGuardianRejectedEmail = async (ward, guardianName, otherPersonName) => {
    const content = `
        <h1>Guardian Decision</h1>
        <p>Assalamu Alaikum ${ward.name},</p>
        <p>Your guardian <strong>${guardianName}</strong> has reviewed your interest with <strong>${otherPersonName}</strong> and decided not to proceed at this time.</p>
        
        <div class="info-box">
            <p><strong>💡 Remember:</strong></p>
            <p>• Your guardian has your best interests at heart</p>
            <p>• This is part of the Islamic matchmaking process</p>
            <p>• There are many other potential matches waiting</p>
            <p>• Trust in Allah's plan for you</p>
        </div>

        <a href="${process.env.CLIENT_URL}/explore" class="button">Continue Exploring</a>

        <p>May Allah guide you to the right match!</p>
        <p><strong>The Marriage Sunna Team</strong></p>
    `;

    return await sendMail({
        to: ward.email,
        subject: 'Interest Update - Marriage Sunna',
        html: content
    });
};

/**
 * Send match notification - Both families approved! Chat unlocked
 * @param {Object} user1 - User 1 User model
 * @param {Object} user2 - User 2 User model
 * @param {Object} user1Profile - User 1 Profile model
 * @param {Object} user2Profile - User 2 Profile model
 */
export const sendMatchCreatedEmail = async (user1, user2, user1Profile, user2Profile) => {
    const user1Avatar = getAvatarUrl(user1);
    const user2Avatar = getAvatarUrl(user2);
    const user1Height = formatHeight(user1Profile?.height_inches);
    const user2Height = formatHeight(user2Profile?.height_inches);

    // Email to user1 showing user2
    const contentUser1 = `
        <h1>It's a Match! 🎉💞</h1>
        <p>Assalamu Alaikum ${user1.name},</p>
        <p><strong>Congratulations!</strong> Both families have approved and you can now connect with <strong>${user2.name}</strong>!</p>
        
        <div class="profile-card">
            <img src="${user2Avatar}" alt="${user2.name}" class="profile-image" />
            <div class="profile-name">${user2.name}</div>
            <div class="profile-details">
                ${user2Profile?.age ? `<strong>Age:</strong> ${user2Profile.age} years<br>` : ''}
                ${user2Height ? `<strong>Height:</strong> ${user2Height}<br>` : ''}
                ${user2Profile?.city && user2Profile?.country ? `<strong>Location:</strong> ${user2Profile.city}, ${user2Profile.country}<br>` : ''}
                ${user2Profile?.education ? `<strong>Education:</strong> ${user2Profile.education}<br>` : ''}
                ${user2Profile?.profession ? `<strong>Profession:</strong> ${user2Profile.profession}<br>` : ''}
            </div>
        </div>

        <div class="info-box">
            <p><strong>✅ Both Families Approved!</strong></p>
            <p>• Both you and ${user2.name} accepted the interest</p>
            <p>• Both guardians have given their approval</p>
            <p>• <strong>Chat is now unlocked!</strong> You can start messaging</p>
        </div>

        <div class="info-box">
            <p><strong>💡 Next Steps:</strong></p>
            <p>• Start a respectful conversation</p>
            <p>• Share your values, goals, and expectations</p>
            <p>• Involve your families in discussions</p>
            <p>• Take your time getting to know each other</p>
            <p>• May consider meeting with families present</p>
        </div>

        <a href="${process.env.CLIENT_URL}/messages" class="button">Start Conversation</a>

        <p>May Allah bless this connection and make it a source of tranquility and mercy!</p>
        <p><strong>The Marriage Sunna Team</strong></p>
    `;

    // Email to user2 showing user1
    const contentUser2 = `
        <h1>It's a Match! 🎉💞</h1>
        <p>Assalamu Alaikum ${user2.name},</p>
        <p><strong>Congratulations!</strong> Both families have approved and you can now connect with <strong>${user1.name}</strong>!</p>
        
        <div class="profile-card">
            <img src="${user1Avatar}" alt="${user1.name}" class="profile-image" />
            <div class="profile-name">${user1.name}</div>
            <div class="profile-details">
                ${user1Profile?.age ? `<strong>Age:</strong> ${user1Profile.age} years<br>` : ''}
                ${user1Height ? `<strong>Height:</strong> ${user1Height}<br>` : ''}
                ${user1Profile?.city && user1Profile?.country ? `<strong>Location:</strong> ${user1Profile.city}, ${user1Profile.country}<br>` : ''}
                ${user1Profile?.education ? `<strong>Education:</strong> ${user1Profile.education}<br>` : ''}
                ${user1Profile?.profession ? `<strong>Profession:</strong> ${user1Profile.profession}<br>` : ''}
            </div>
        </div>

        <div class="info-box">
            <p><strong>✅ Both Families Approved!</strong></p>
            <p>• Both you and ${user1.name} accepted the interest</p>
            <p>• Both guardians have given their approval</p>
            <p>• <strong>Chat is now unlocked!</strong> You can start messaging</p>
        </div>

        <div class="info-box">
            <p><strong>💡 Next Steps:</strong></p>
            <p>• Start a respectful conversation</p>
            <p>• Share your values, goals, and expectations</p>
            <p>• Involve your families in discussions</p>
            <p>• Take your time getting to know each other</p>
            <p>• May consider meeting with families present</p>
        </div>

        <a href="${process.env.CLIENT_URL}/messages" class="button">Start Conversation</a>

        <p>May Allah bless this connection and make it a source of tranquility and mercy!</p>
        <p><strong>The Marriage Sunna Team</strong></p>
    `;

    // Send to both users
    await sendMail({
        to: user1.email,
        subject: `It's a Match with ${user2.name}! 💞`,
        html: contentUser1
    });

    await sendMail({
        to: user2.email,
        subject: `It's a Match with ${user1.name}! 💞`,
        html: contentUser2
    });

    return { success: true };
};

/**
 * Send OTP verification email
 */
export const sendOtpEmail = async (user, otp, expiryMinutes = 10) => {
    const content = `
        <h1>Verify Your Email Address 🔐</h1>
        <p>Assalamu Alaikum ${user.name || 'User'},</p>
        <p>Thank you for joining Marriage Sunna! To complete your registration, please verify your email address.</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <div style="
                display: inline-block;
                background: linear-gradient(135deg, #1B4D3E 0%, #2d7a5f 100%);
                color: #ffffff;
                font-size: 36px;
                font-weight: 700;
                letter-spacing: 8px;
                padding: 20px 40px;
                border-radius: 12px;
                font-family: 'Courier New', monospace;
            ">
                ${otp}
            </div>
        </div>

        <div class="info-box">
            <p><strong>⚠️ Important:</strong></p>
            <p>• This code expires in <strong>${expiryMinutes} minutes</strong></p>
            <p>• Enter this code in the app to verify your email</p>
            <p>• Don't share this code with anyone</p>
        </div>

        <p>JazakAllah Khair,</p>
        <p><strong>The Marriage Sunna Team</strong></p>
    `;

    return await sendMail({
        to: user.email,
        subject: `Your Marriage Sunna Verification Code: ${otp}`,
        html: content
    });
};

/**
 * Send login OTP email
 */
export const sendLoginOtpEmail = async (user, otp, expiryMinutes = 10) => {
    const content = `
        <h1>Your Login Code 🔑</h1>
        <p>Assalamu Alaikum ${user.name || 'User'},</p>
        <p>We received a request to log in to your Marriage Sunna account.</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <div style="
                display: inline-block;
                background: linear-gradient(135deg, #1B4D3E 0%, #2d7a5f 100%);
                color: #ffffff;
                font-size: 36px;
                font-weight: 700;
                letter-spacing: 8px;
                padding: 20px 40px;
                border-radius: 12px;
                font-family: 'Courier New', monospace;
            ">
                ${otp}
            </div>
        </div>

        <div class="info-box">
            <p><strong>⚠️ Security Notice:</strong></p>
            <p>• This code expires in <strong>${expiryMinutes} minutes</strong></p>
            <p>• Never share this code with anyone</p>
            <p>• If you didn't request this, change your password immediately</p>
        </div>

        <p><strong>The Marriage Sunna Team</strong></p>
    `;

    return await sendMail({
        to: user.email,
        subject: `Your Login Code: ${otp}`,
        html: content
    });
};

/**
 * Send subscription confirmation email
 */
export const sendSubscriptionEmail = async (user, plan) => {
    const content = `
        <h1>Subscription Confirmed! ✅</h1>
        <p>Assalamu Alaikum ${user.name},</p>
        <p>Thank you for subscribing to Marriage Sunna <strong>${plan.name}</strong> plan!</p>
        
        <div class="info-box">
            <p><strong>Plan:</strong> ${plan.name}</p>
            <p><strong>Credits:</strong> ${plan.credits}</p>
            <p><strong>Duration:</strong> ${plan.durationDays} days</p>
            <p><strong>Amount:</strong> $${plan.price}</p>
        </div>

        <p>Your credits have been added to your account and you can now enjoy premium features.</p>

        <a href="${process.env.CLIENT_URL}/explore" class="button">Start Exploring</a>

        <p>JazakAllah Khair for your support!</p>
        <p><strong>The Marriage Sunna Team</strong></p>
    `;

    return await sendMail({
        to: user.email,
        subject: 'Subscription Confirmed - Marriage Sunna',
        html: content
    });
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (user, resetToken) => {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    const content = `
        <h1>Reset Your Password</h1>
        <p>Assalamu Alaikum ${user.name},</p>
        <p>We received a request to reset your password for your Marriage Sunna account.</p>
        
        <p>Click the button below to create a new password:</p>

        <a href="${resetUrl}" class="button">Reset Password</a>

        <div class="info-box">
            <p><strong>⚠️ Security Note:</strong></p>
            <p>• This link expires in 1 hour</p>
            <p>• If you didn't request this, please ignore this email</p>
            <p>• Never share this link with anyone</p>
        </div>

        <p>If the button doesn't work, copy and paste this link:</p>
        <p style="word-break: break-all; color: #1B4D3E;">${resetUrl}</p>

        <p><strong>The Marriage Sunna Team</strong></p>
    `;

    return await sendMail({
        to: user.email,
        subject: 'Reset Your Password - Marriage Sunna',
        html: content
    });
};

export default {
    sendMail,
    sendWelcomeEmail,
    sendInterestReceivedEmail,
    sendInterestAcceptedEmail,
    sendGuardianApprovedEmail,
    sendGuardianRejectedEmail,
    sendMatchCreatedEmail,
    sendOtpEmail,
    sendLoginOtpEmail,
    sendSubscriptionEmail,
    sendPasswordResetEmail,
    sendGuardianMutualInterestEmail,
};