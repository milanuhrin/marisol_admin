const express = require("express");
const bodyParser = require("body-parser");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
const AWS = require("aws-sdk");

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "Availability"; // Replace with actual DynamoDB table name

// Declare a new express app
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

/*****************************************
 * GET: Fetch Availability from DynamoDB *
 *****************************************/

app.get("/availability", async (req, res) => {
  try {
    console.log("Fetching availability from DynamoDB...");
    const data = await dynamoDB.scan({ TableName: TABLE_NAME }).promise();
    console.log("✅ Fetched data:", data.Items);
    res.json({ success: true, availability: data.Items });
  } catch (error) {
    console.error("❌ Error fetching availability:", error);
    res.status(500).json({ error: "Could not fetch availability", details: error.toString() });
  }
});

/***************************************
 * POST: Save Availability to DynamoDB *
 **************************************/

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

    const params = { RequestItems: { [TABLE_NAME]: putRequests } };

    console.log("📦 Batch Write Params:", JSON.stringify(params, null, 2));
    await dynamoDB.batchWrite(params).promise();

    res.json({ success: true, message: "Availability updated successfully!" });
  } catch (error) {
    console.error("❌ Error updating availability:", error);
    res.status(500).json({ error: "Could not update availability" });
  }
});

/*******************************************
 * DELETE: Delete Availability from DynamoDB *
 ******************************************/

app.delete("/availability", async (req, res) => {
  try {
    const { dates } = req.body;

    if (!dates || dates.length === 0) {
      console.warn("⚠️ No dates provided for deletion.");
      return res.status(400).json({ error: "No dates provided for deletion" });
    }

    console.log("🗑️ Deleting dates:", dates);

    const deleteRequests = dates.map(date => ({
      DeleteRequest: { Key: { date: String(date) } }, // Convert date to string
    }));

    const params = { RequestItems: { [TABLE_NAME]: deleteRequests } };

    console.log("📦 Batch Delete Params:", JSON.stringify(params, null, 2));

    const response = await dynamoDB.batchWrite(params).promise();
    console.log("✅ Batch Delete Response:", response);

    res.json({ success: true, message: "Dates deleted successfully!" });
  } catch (error) {
    console.error("❌ Error deleting availability:", error);
    res.status(500).json({ error: "Could not delete availability", details: error.toString() });
  }
});

// Start the server (for local testing)
app.listen(3000, () => {
  console.log("🚀 App started on port 3000");
});

// Export for AWS Lambda
module.exports = app;