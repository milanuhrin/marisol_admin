const express = require("express");
const bodyParser = require("body-parser");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "Availability"; // Replace this with your actual DynamoDB table name

// Declare a new express app
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());
// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

/*****************************************
 * GET: Fetch Availability from DynamoDB *
 *****************************************/

app.get("/availability", async function (req, res) {
  try {
    console.log("Fetching availability from DynamoDB...");
    const data = await dynamoDB.scan({ TableName: TABLE_NAME }).promise();
    console.log("Fetched data:", data.Items);
    res.json({ success: true, availability: data.Items });
  } catch (error) {
    console.error("Error fetching availability:", error);
    res.status(500).json({ error: "Could not fetch availability", details: error.toString() });
  }
});

/***************************************
 * POST: Save Availability to DynamoDB *
 **************************************/

app.post("/availability", async function (req, res) {
  try {
    const { dates, available } = req.body;

    if (!dates || dates.length === 0) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    // Batch write operation to save multiple dates at once
    const putRequests = dates.map((date) => ({
      PutRequest: {
        Item: { date, available },
      },
    }));

    await dynamoDB
      .batchWrite({
        RequestItems: {
          [TABLE_NAME]: putRequests,
        },
      })
      .promise();

    res.json({ success: true, message: "Availability updated successfully!" });
  } catch (error) {
    console.error("Error updating availability:", error);
    res.status(500).json({ error: "Could not update availability" });
  }
});

/*******************************************
 * DELETE: Delete Availability to DynamoDB *
 ******************************************/

app.delete("/availability", async function (req, res) {
  try {
    const { dates } = req.body;

    if (!dates || dates.length === 0) {
      console.warn("⚠️ No dates provided for deletion.");
      return res.status(400).json({ error: "No dates provided for deletion" });
    }

    console.log("🚀 Deleting dates:", dates);

    for (let date of dates) {
      const params = {
        TableName: TABLE_NAME,
        Key: { date: String(date) }, // ✅ Correct primary key structure
      };

      console.log("🛠 Deleting:", JSON.stringify(params, null, 2));
      await dynamoDB.delete(params).promise();
    }

    res.json({ success: true, message: "Dates deleted successfully!" });
  } catch (error) {
    console.error("❌ Error deleting availability:", error);
    res.status(500).json({ error: "Could not delete availability", details: error.toString() });
  }
});

// Export the app for AWS Lambda
module.exports = app;