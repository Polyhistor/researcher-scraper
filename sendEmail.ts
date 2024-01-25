import sqlite3 from "sqlite3";
import nodemailer from "nodemailer";

// Initialize database
function setupDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database("emails.db", (err) => {
      if (err) {
        reject(err);
      } else {
        db.exec(
          "CREATE TABLE IF NOT EXISTS emails (email TEXT PRIMARY KEY, EmailSent BOOLEAN DEFAULT false)",
          (err) => {
            if (err) {
              reject(err);
            } else {
              resolve(db);
            }
          }
        );
      }
    });
  });
}

const getEmailsToSend = (db) => {
  return new Promise((resolve, reject) => {
    db.all("SELECT email FROM emails WHERE EmailSent = false", (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

const updateEmailSent = (db, email) => {
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE emails SET EmailSent = true WHERE email = ?",
      [email],
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
};

// Email content
const emailContent = `
Dear Sir/Madam,

Greetings from Auckland University of Technology! I'm Pouya Ataei, a PhD student working on an exciting project about collaboration tools in academia. Your experience as a researcher makes your input incredibly valuable to our study, 'Evaluating Collaboration Tools in Academic Research'.

Could you spare just 5 minutes to complete a short, anonymous survey? Your insights will help shape our understanding of these tools in enhancing academic teamwork and efficiency. 

Survey Link: https://forms.office.com/r/Z7HfQHkwwe

Your contribution is deeply appreciated, and I'm here to answer any questions you might have. Thank you for adding your valuable perspective to our research!

Warm regards,

Pouya Ataei
PhD Student, AUT
`;

// Add a delay function
const delay = (time) => new Promise((resolve) => setTimeout(resolve, time));

// Email sending function
async function sendEmails(db) {
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

  const BATCH_SIZE = 50;
  const DELAY_TIME = 300000; // 5 minutes in milliseconds

  let emailsToSend = await getEmailsToSend(db);

  for (let i = 0; i < emailsToSend.length; i += BATCH_SIZE) {
    let batch = emailsToSend.slice(i, i + BATCH_SIZE);

    for (let row of batch) {
      let mailOptions = {
        from: '"Pouya Ataei" <pouya.ataei.10@gmail.com>',
        to: row.email,
        subject:
          "Your Insight Needed: Quick Survey on Collaboration in Research",
        text: emailContent,
      };

      try {
        let info = await transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);
        await updateEmailSent(db, row.email);
      } catch (error) {
        console.error("Error sending email to %s: %s", row.email, error);
      }
    }

    if (i + BATCH_SIZE < emailsToSend.length) {
      console.log(
        `Waiting for ${
          DELAY_TIME / 60000
        } minutes before sending the next batch...`
      );
      await delay(DELAY_TIME);
    }
  }
}

// Main function
async function main() {
  const db = await setupDatabase();
  await sendEmails(db);
}

main();
