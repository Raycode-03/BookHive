import transporter from "@/lib/transporter"

export async function sendmessage(email, name) {
  const mailOptions = {
    from: `"BookHive" <${process.env.EMAIL_ADMIN}>`,
    to: email,
    subject: 'Welcome to BookHive 📚',
    text: `Hi ${name || 'there'}, welcome to BookHive!`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #4f46e5;">Hi ${name || 'there'}, 👋</h2>

        <p>Welcome to <strong>BookHive</strong> — your digital gateway to an amazing world of books and knowledge.</p>

        <p>Your account has been successfully created and you're now subscribed to our <strong>free membership plan</strong>.</p>

        <p>Here's what you can do on BookHive:</p>
        <ul>
          <li>📖 Browse our collection of digital and physical books.</li>
          <li>📅 Reserve books and pick them up in person</li>
          <li>⏲️ Track your borrowed books and never miss a return date.</li>
          <li>💳 Pay borrow or overdue fees easily within your dashboard (if applicable).</li>
        </ul>

        <p>We're excited to have you explore, discover, and enjoy the best reads.</p>

        <p>Happy reading!<br><strong>The BookHive Team</strong></p>

        <hr style="margin-top:20px; border:none; border-top:1px solid #ddd;" />
        <p style="font-size:12px; color:#888;">This email confirms your registration at BookHive. If you did not register, please ignore this message.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email notification sent');
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

export async function sendcode(email, code) {
  const mailOptions = {
    from: `"BookHive" <${process.env.EMAIL_ADMIN}>`,
    to: email,
    subject: 'Your Password Reset Code',
    text: `Your password reset code is: ${code}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #4f46e5;">Hi there,</h2>
        <p>Your password reset code is: <strong>${code}</strong></p>
        <p>Please use this code to reset your password.</p>
        <p>Cheers,<br><strong>The Flowline Team</strong></p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email notification sent');
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}