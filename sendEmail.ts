import nodemailer from "nodemailer";

async function sendEmail() {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "pouya.ataei.10@gmail.com",
      pass: process.env.emailPass,
    },
  });

  let mailOptions = {
    from: '"Pouya Ataei" <pouya.ataei.10@gmail.com>',
    to: "josirukia@gmail.com    ",
    subject: "The design idea",
    text: "We need Sacred geomtry (seed of life propbably) as the background, and on the foreground we need a surreal psychdelic mushroom using the violet shades. Colours will be sent soon.",
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

sendEmail();
