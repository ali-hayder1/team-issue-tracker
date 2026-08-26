const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendAssignmentEmail({
  to,
  recipientName,
  issueTitle,
  projectName,
}) {
  try {
    const info = await transporter.sendMail({
      from: '"Issue Tracker" <notifications@issuetracker.dev>',
      to,
      subject: `You've been assigned: ${issueTitle}`,
      text: `Hi ${recipientName},\n\nYou've been assigned to "${issueTitle}" in project "${projectName}".\n\nLog in to view details.`,
      html: `
        <p>Hi ${recipientName},</p>
        <p>You've been assigned to <strong>${issueTitle}</strong> in project <strong>${projectName}</strong>.</p>
        <p>Log in to view details.</p>
      `,
    });

    // Ethereal gives you a preview URL — this is how you'll "see" the email during testing
    console.log("Email sent. Preview URL:", nodemailer.getTestMessageUrl(info));
  } catch (err) {
    // never let email failure break the actual API request
    console.error("Failed to send assignment email:", err);
  }
}

module.exports = { sendAssignmentEmail };
