const express = require("express");
const bodyParser = require("body-parser");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
const AWS = require("aws-sdk");

const ses = new AWS.SES({ region: "us-east-1" });

const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "OPTIONS,POST");
  next();
});

app.options("/send-email", function (req, res) {
  return res.status(200).json({ ok: true });
});

app.post("/send-email", async function (req, res) {
  try {
    const requestBody =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};

    const name =
      typeof requestBody.name === "string" ? requestBody.name.trim() : "";
    const email =
      typeof requestBody.email === "string" ? requestBody.email.trim() : "";
    const message =
      typeof requestBody.message === "string" ? requestBody.message.trim() : "";

    if (!name || !email || !message) {
      return res.status(400).json({
        error: "Missing required fields: name, email, message",
      });
    }

    const sourceEmail = process.env.SOURCE_EMAIL;
    const destinationEmail = process.env.DESTINATION_EMAIL;

    if (!sourceEmail || !destinationEmail) {
      console.error("Missing email env vars", {
        hasSourceEmail: !!sourceEmail,
        hasDestinationEmail: !!destinationEmail,
      });

      return res.status(500).json({
        error: "Server email configuration is missing",
      });
    }

    const subject = `New reservation inquiry from ${name}`;

    const textBody = [
      "New reservation inquiry",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      "",
      "Message:",
      message,
    ].join("\n");

    const htmlBody = `
      <h2>New reservation inquiry</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Message:</strong></p>
      <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${escapeHtml(
        message
      )}</pre>
    `;

    await ses
      .sendEmail({
        Source: sourceEmail,
        Destination: {
          ToAddresses: [destinationEmail],
        },
        ReplyToAddresses: [email],
        Message: {
          Subject: {
            Data: subject,
            Charset: "UTF-8",
          },
          Body: {
            Text: {
              Data: textBody,
              Charset: "UTF-8",
            },
            Html: {
              Data: htmlBody,
              Charset: "UTF-8",
            },
          },
        },
      })
      .promise();

    return res.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("❌ Error sending reservation email:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      details: error.message || String(error),
    });
  }
});

function escapeHtml(value = "") {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const serverless = require("serverless-http");

module.exports.handler = serverless(app);