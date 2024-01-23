import nodemailer from "nodemailer";

const emailContent = `
Dear Sir/Madam,

Greetings from Auckland University of Technology! I'm Pouya Ataei, a PhD student working on an exciting project about collaboration tools in academia. Your experience as a researcher makes your input incredibly valuable to our study, 'Evaluating Collaboration Tools in Academic Research'.

Could you spare just 5 minutes to complete a short, anonymous survey? Your insights will help shape our understanding of these tools in enhancing academic teamwork and efficiency. 

Survey Link: https://forms.office.com/Pages/DesignPageV2.aspx?prevorigin=OfficeDotCom&origin=NeoPortalPage&subpage=design&id=oSwCXgRch0-Nt9WIcmJ04-gZ6K4RyipPsvyK2tEJCltUQjBIUFVJUTc4TzNESE5ZSFYxVkNVR0VDUC4u

Your contribution is deeply appreciated, and I'm here to answer any questions you might have. Thank you for adding your valuable perspective to our research!

Warm regards,

Pouya Ataei
PhD Student, AUT
`;

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
    to: "sri.regula@autuni.ac.nz",
    subject: "Your Insight Needed: Quick Survey on Collaboration in Research",
    text: emailContent,
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

sendEmail();
