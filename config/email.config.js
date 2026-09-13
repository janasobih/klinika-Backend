const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendOTPEmail = async (email, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Clinic - Password Change OTP",

    html: `
      <div style="font-family: Arial; padding: 20px;">
        <h2>Password Change Request</h2>

        <p>Your verification code is:</p>

        <h1>${otp}</h1>

        <p>
          This code will expire in 5 minutes.
        </p>

        <p>
          If you did not request a password change,
          please ignore this email.
        </p>
      </div>
    `,
  });
};

module.exports = sendOTPEmail;
