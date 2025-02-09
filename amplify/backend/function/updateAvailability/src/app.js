import express from "express";
import { json } from "body-parser";
import { eventContext } from "aws-serverless-express/middleware";
import { DynamoDB } from "aws-sdk";

// Set up AWS DynamoDB connection
const dynamoDB = new DynamoDB.DocumentClient();
const TABLE_NAME = "Availability"; // Replace this with your actual DynamoDB table name

// Declare a new express app
const app = express();
app.use(json());
app.use(eventContext());

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

/**********************
 * GET: Fetch Availability from DynamoDB *
 **********************/

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

/****************************
 * POST: Save Availability to DynamoDB *
 ****************************/

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

app.delete("/availability", async function (req, res) {
  try {
    const { dates } = req.body;
    
    if (!dates || dates.length === 0) {
      return res.status(400).json({ error: "No dates provided for unreservation" });
    }

    // Batch delete operation
    const deleteRequests = dates.map((date) => ({
      DeleteRequest: {
        Key: { date },
      },
    }));

    await dynamoDB
      .batchWrite({
        RequestItems: {
          [TABLE_NAME]: deleteRequests,
        },
      })
      .promise();

    res.json({ success: true, message: "Dates unreserved successfully!" });
  } catch (error) {
    console.error("Error unreserving dates:", error);
    res.status(500).json({ error: "Could not unreserve dates" });
  }
});

// Start the server (for local testing)
app.listen(3000, function () {
  console.log("App started");
});

// Export the app for AWS Lambda
export default app;