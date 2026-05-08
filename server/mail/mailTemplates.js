// Universal Layout
function defaultLayout({ title = "My App", body = "" } = {}) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background: #ffffff;
                padding: 25px;
                border-radius: 10px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            }
            .header {
                text-align: center;
                border-bottom: 1px solid #eee;
                padding-bottom: 15px;
                margin-bottom: 20px;
            }
            .otp-box {
                text-align: center;
                font-size: 28px;
                font-weight: bold;
                letter-spacing: 5px;
                padding: 15px;
                background: #f1f5ff;
                border-radius: 8px;
                margin: 20px 0;
            }
            .footer {
                text-align: center;
                font-size: 12px;
                color: #888;
                margin-top: 30px;
                border-top: 1px solid #eee;
                padding-top: 15px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>${title}</h2>
            </div>
            ${body}
            <div class="footer">
                © ${new Date().getFullYear()} ${title}. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    `;
}


// OTP Template
function otpTemplate(data = {}) {
    const otp = data.otp ?? "------";

    const body = `
        <p>Hello,</p>
        <p>Your One-Time Password (OTP) is:</p>
        <div class="otp-box">${otp}</div>
        <p>This code is valid for 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
    `;

    return defaultLayout({
        title: "Your OTP Code",
        body,
    });
}


// Custom Template
function customTemplate({ title = "My App", content = "" } = {}) {
    return defaultLayout({
        title,
        body: content,
    });
}

// ES Module export
export {
    defaultLayout,
    otpTemplate,
    customTemplate,
};