const express = require("express");
const awsServerlessExpress = require("aws-serverless-express");
const bodyParser = require("body-parser");
const AWS = require("aws-sdk");

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "Availability"; // Replace with your actual table name

const app = express();
app.use(bodyParser.json());

// ✅ Enable CORS for API Gateway requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Allow all origins
  res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// ✅ Handle CORS Preflight Request
app.options("*", (req, res) => {
  res.status(200).send();
});

/*****************************************
 * GET: Fetch Availability from DynamoDB *
 *****************************************/
app.get("/availability", async (req, res) => {
  try {
    console.log("Fetching availability from DynamoDB...");
    const data = await dynamoDB.scan({ TableName: TABLE_NAME }).promise();
    res.json({ success: true, availability: data.Items });
  } catch (error) {
    console.error("❌ Error fetching availability:", error);
    res.status(500).json({ error: "Could not fetch availability", details: error.toString() });
  }
});

/***************************************
 * POST: Save Availability to DynamoDB *
 ***************************************/
app.post("/availability", async (req, res) => {
  try {
    const { dates, available } = req.body;

    if (!dates || dates.length === 0) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    console.log("📝 Adding dates:", dates, "Available:", available);

    const putRequests = dates.map(date => ({
      PutRequest: { Item: { date: String(date), available } },
    }));

    await dynamoDB.batchWrite({ RequestItems: { [TABLE_NAME]: putRequests } }).promise();

    res.json({ success: true, message: "Availability updated successfully!" });
  } catch (error) {
    console.error("❌ Error updating availability:", error);
    res.status(500).json({ error: "Could not update availability" });
  }
});

/*********************************************
 * DELETE: Delete Availability from DynamoDB *
 *********************************************/
app.delete("/availability", async function (req, res) {
  try {
    const { dates } = req.body;

    if (!dates || dates.length === 0) {
      return res.status(400).json({ error: "No dates provided for deletion" });
    }

    console.log("🚀 Deleting dates:", dates);

    for (let date of dates) {
      await dynamoDB.delete({ TableName: TABLE_NAME, Key: { date: String(date) } }).promise();
    }

    res.json({ success: true, message: "Dates deleted successfully!" });
  } catch (error) {
    console.error("❌ Error deleting availability:", error);
    res.status(500).json({ error: "Could not delete availability", details: error.toString() });
  }
});

// ✅ AWS Serverless Express Integration
const server = awsServerlessExpress.createServer(app);
exports.handler = (event, context) => awsServerlessExpress.proxy(server, event, context);