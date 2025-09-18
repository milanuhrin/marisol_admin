const express = require("express");
const bodyParser = require("body-parser");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_AVAL = "Availability";
const TABLE_RES = "Reservation";
const TABLE_EXP = "Expenses";
// const TABLE_NAME = "Availability"; // Replace this with your actual DynamoDB table name

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


/////////// Availability /////////////////

/*****************************************
 * GET: Fetch Availability from DynamoDB *
 *****************************************/

app.get("/availability", async function (req, res) {
  try {
    console.log("Fetching availability from DynamoDB...");
    const data = await dynamoDB.scan({ TableName: TABLE_AVAL }).promise();
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
          [TABLE_AVAL]: putRequests,
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
    // Manually parse the body if needed
    const requestBody = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { dates } = requestBody;

    if (!dates || dates.length === 0) {
      console.warn("⚠️ No dates provided for deletion.");
      return res.status(400).json({ error: "No dates provided for deletion" });
    }

    console.log("🚀 Deleting dates:", dates);

    for (let date of dates) {
      const params = {
        TableName: TABLE_AVAL,
        Key: { date: String(date) },
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


/////////// Reservations /////////////////

/***************************************************
 * GET: List all reservations (grouped by ID)
 ***************************************************/
app.get("/reservation", async function (req, res) {
  try {
    const data = await dynamoDB.scan({ TableName: TABLE_RES }).promise();
    const items = data.Items || [];

    const grouped = {};

    for (const item of items) {
      const id = item.reservationId;
      if (!id) continue;

      if (!grouped[id] && item.type === "start") {
        grouped[id] = {
          reservationId: id,
          startDate: item.date,
          guestName: item.guestName,
          guestContact: item.guestContact,
          checkInTime: item.checkInTime,
          checkOutTime: item.checkOutTime,
          platform: item.platform,
          adults: item.adults ?? null,
          children: item.children ?? null,
          nukiCode: item.nukiCode ?? null,
          info: item.info,
          deposit: item.deposit ?? null,
          advance: item.advance ?? null,
          remaining: item.remaining ?? null,
          total: item.total ?? null,
          account: item.account ?? null,
          depositDate: item.depositDate ?? null,
          advanceDate: item.advanceDate ?? null,
          remainingDate: item.remainingDate ?? null,
          depositReturnDate: item.depositReturnDate ?? null,
        };
      }

      // fallback na endDate
      if (grouped[id]) {
        if (!grouped[id].endDate && item.type === "end") {
          grouped[id].endDate = item.date;
        }
      }
    }

    // fallback na najmenší a najväčší dátum (ak nie je označený start/end)
    for (const resv of Object.values(grouped)) {
      const reservationDates = items
        .filter(i => i.reservationId === resv.reservationId)
        .map(i => i.date)
        .sort();

      if (!resv.startDate) resv.startDate = reservationDates[0];
      if (!resv.endDate) resv.endDate = reservationDates[reservationDates.length - 1];
    }

    const reservations = Object.values(grouped).sort((a, b) =>
      a.startDate.localeCompare(b.startDate)
    );

    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
    });
    res.json({ success: true, reservations });
  } catch (error) {
    console.error("❌ Error listing reservations:", error);
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
    });
    res.status(500).json({ error: "Could not fetch reservations", details: error.toString() });
  }
});

/***********************************************
 * POST: Create a new reservation (multi-day)  *
 ***********************************************/
app.post("/reservation", async function (req, res) {
  try {
    const {
      startDate,
      endDate,
      guestName,
      guestContact,
      checkInTime,
      checkOutTime,
      platform,
      adults,
      children,
      nukiCode,
      info,
      deposit,
      advance,
      remaining,
      total,
      account,
      depositDate,
      advanceDate,
      remainingDate,
      depositReturnDate,
    } = req.body;

    if (!startDate || !endDate) {
      res.set({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      });
      return res.status(400).json({ error: "Missing startDate or endDate" });
    }

    // Generate reservationId: RES-YYYYMMDD-NNN
    const baseDate = startDate.replace(/-/g, "");
    const reservationId = `RES-${baseDate}-${Math.floor(Math.random() * 900 + 100)}`;

    // Get date range from start to end
    const getDateRange = (start, end) => {
      const dates = [];
      let current = new Date(start);
      const last = new Date(end);
      while (current <= last) {
        dates.push(current.toISOString().split("T")[0]);
        current.setDate(current.getDate() + 1);
      }
      return dates;
    };

    const dateRange = getDateRange(startDate, endDate);
    // Allow same-day check-in after a reservation that ends that day
    const checkDates = dateRange.filter((d, idx) => idx !== 0 || dateRange.length === 1);

    // Check for date collisions (ignore endDate)
    const conflictCheckParams = {
      TableName: "Reservation",
      ExpressionAttributeNames: { "#d": "date" },
      ExpressionAttributeValues: Object.assign(
        { ":false": false },
        Object.fromEntries(checkDates.map((d, i) => [`:date${i}`, d]))
      ),
    };
    const dateConditions = checkDates.map((_, i) => `#d = :date${i}`).join(" OR ");
    conflictCheckParams.FilterExpression = `(${dateConditions}) AND available = :false`;

    const conflictScan = await dynamoDB.scan(conflictCheckParams).promise();
    if (conflictScan.Items.length > 0) {
      return res.status(409).json({
        success: false,
        error: "Termín je už obsadený",
        conflictDates: conflictScan.Items.map(i => i.date),
      });
    }

    // Build items for each date in the reservation
    const putRequests = dateRange.map((date, index) => {
      let type = "middle";
      if (index === 0) type = "start";
      if (index === dateRange.length - 1) type = "end";

      return {
        PutRequest: {
          Item: {
            date,
            available: false,
            type,
            reservationId,
            guestName: guestName || null,
            guestContact: guestContact || null,
            checkInTime: checkInTime || null,
            checkOutTime: checkOutTime || null,
            platform: platform || null,
            adults: adults != null ? parseInt(adults) : 1,
            children: children != null ? parseInt(children) : 0,
            nukiCode: nukiCode || null,
            info: info || null,
            deposit: deposit != null ? parseFloat(deposit) : null,
            advance: advance != null ? parseFloat(advance) : null,
            remaining: remaining != null ? parseFloat(remaining) : null,
            total: total != null ? parseFloat(total) : null,
            account: account || null,
            depositDate: depositDate ?? null,
            advanceDate: advanceDate ?? null,
            remainingDate: remainingDate ?? null,
            depositReturnDate: depositReturnDate ?? null,
          },
        },
      };
    });

    // Split into chunks of max 25 items
    const chunks = [];
    for (let i = 0; i < putRequests.length; i += 25) {
      chunks.push(putRequests.slice(i, i + 25));
    }

    for (const chunk of chunks) {
      await dynamoDB
        .batchWrite({
          RequestItems: {
            ["Reservation"]: chunk,
          },
        })
        .promise();
    }

    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
    });
    res.json({ success: true, reservationId });
  } catch (error) {
    console.error("❌ Error creating reservation:", error);
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
    });
    res.status(500).json({ error: "Could not create reservation", details: error.toString() });
  }
});

/***************************************************
 * PUT: Update reservation by ID                   *
 ***************************************************/
app.put("/reservation/:id", async function (req, res) {
  const reservationId = req.params.id;
  const {
    startDate,
    endDate,
    guestName,
    guestContact,
    checkInTime,
    checkOutTime,
    platform,
    adults,
    children,
    nukiCode,
    info,
    deposit,
    advance,
    remaining,
    total,
    account,
    depositDate,
    advanceDate,
    remainingDate,
    depositReturnDate,
  } = req.body;

  if (!reservationId || !startDate || !endDate) {
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
    });
    return res.status(400).json({ error: "Missing reservationId, startDate or endDate" });
  }

  try {
    // Get date range from start to end
    const getDateRange = (start, end) => {
      const dates = [];
      let current = new Date(start);
      const last = new Date(end);
      while (current <= last) {
        dates.push(current.toISOString().split("T")[0]);
        current.setDate(current.getDate() + 1);
      }
      return dates;
    };

    const dateRange = getDateRange(startDate, endDate);
    // Allow same-day check-in after a reservation that ends that day
    const checkDates = dateRange.slice(1, -1); // exclude first and the last day from conflict check

    // Check for collisions before deletion
    const conflictCheckParams = {
      TableName: "Reservation",
      ExpressionAttributeNames: { "#d": "date" },
      ExpressionAttributeValues: Object.assign(
        { ":rid": reservationId },
        Object.fromEntries(checkDates.map((d, i) => [`:date${i}`, d]))
      ),
    };
    const dateConditions = checkDates.map((_, i) => `#d = :date${i}`).join(" OR ");
    conflictCheckParams.FilterExpression = `(${dateConditions}) AND reservationId <> :rid`;

    const conflictScan = await dynamoDB.scan(conflictCheckParams).promise();
    if (conflictScan.Items.length > 0) {
      return res.status(409).json({
        success: false,
        error: "Termín je už obsadený",
        conflictDates: conflictScan.Items.map(i => i.date),
      });
    }

    // Now delete existing records with same reservationId
    const scanResult = await dynamoDB.scan({
      TableName: TABLE_RES,
      FilterExpression: "reservationId = :rid",
      ExpressionAttributeValues: {
        ":rid": reservationId,
      },
    }).promise();

    const itemsToDelete = scanResult.Items || [];

    const deleteBatches = [];
    for (let i = 0; i < itemsToDelete.length; i += 25) {
      deleteBatches.push(itemsToDelete.slice(i, i + 25));
    }

    for (const batch of deleteBatches) {
      const deleteRequests = batch.map(item => ({
        DeleteRequest: {
          Key: { date: item.date, reservationId: item.reservationId },
        },
      }));

      await dynamoDB.batchWrite({
        RequestItems: {
          [TABLE_RES]: deleteRequests,
        },
      }).promise();
    }

    // Re-create reservation records
    const putRequests = dateRange.map((date, index) => {
      let type = "middle";
      if (index === 0) type = "start";
      if (index === dateRange.length - 1) type = "end";

      return {
        PutRequest: {
          Item: {
            date,
            available: false,
            type,
            reservationId,
            guestName,
            guestContact,
            checkInTime,
            checkOutTime,
            platform,
            adults: adults != null ? parseInt(adults) : 1,
            children: children != null ? parseInt(children) : 0,
            nukiCode: nukiCode || null,
            info,
            deposit: deposit != null ? parseFloat(deposit) : null,
            advance: advance != null ? parseFloat(advance) : null,
            remaining: remaining != null ? parseFloat(remaining) : null,
            total: total != null ? parseFloat(total) : null,
            account: account || null,
            depositDate: depositDate ?? null,
            advanceDate: advanceDate ?? null,
            remainingDate: remainingDate ?? null,
            depositReturnDate: depositReturnDate ?? null,
          },
        },
      };
    });

    const putBatches = [];
    for (let i = 0; i < putRequests.length; i += 25) {
      putBatches.push(putRequests.slice(i, i + 25));
    }

    for (const batch of putBatches) {
      await dynamoDB.batchWrite({
        RequestItems: {
          [TABLE_RES]: batch,
        },
      }).promise();
    }

    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
    });
    res.json({ success: true, reservationId });
  } catch (error) {
    console.error("❌ Error updating reservation:", error);
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
    });
    res.status(500).json({ error: "Could not update reservation", details: error.toString() });
  }
});

/***************************************************
 * DELETE: Delete entire reservation by ID         *
 ***************************************************/
app.delete("/reservation/:id", async function (req, res) {
  const reservationId = req.params.id;
  console.log("DELETE request received for reservationId:", reservationId);

  if (!reservationId) {
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
    });
    return res.status(400).json({ error: "Missing reservationId" });
  }

  try {
    // 1. Načítaj všetky záznamy s daným reservationId
    const params = {
      TableName: TABLE_RES,
      FilterExpression: "reservationId = :rid",
      ExpressionAttributeValues: {
        ":rid": reservationId,
      },
    };

    const scanResult = await dynamoDB.scan(params).promise();
    const itemsToDelete = scanResult.Items;

    if (itemsToDelete.length === 0) {
      res.set({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      });
      return res.status(404).json({ error: "No records found for reservationId" });
    }

    // 2. Rozdeľ do dávok po 25 záznamov (DynamoDB limit)
    const batches = [];
    for (let i = 0; i < itemsToDelete.length; i += 25) {
      batches.push(itemsToDelete.slice(i, i + 25));
    }

    // 3. Vymaž všetky dávky
    for (const batch of batches) {
      const deleteRequests = batch.map(item => ({
        DeleteRequest: {
          Key: { date: item.date, reservationId: item.reservationId },
        },
      }));

      await dynamoDB.batchWrite({
        RequestItems: {
          [TABLE_RES]: deleteRequests,
        },
      }).promise();
    }

    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
    });
    res.json({ success: true, deletedCount: itemsToDelete.length });
  } catch (error) {
    console.error("❌ Error deleting reservation:", error);
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
    });
    res.status(500).json({ error: "Could not delete reservation", details: error.toString() });
  }
});

// Export the app for AWS Lambda

///////////// Expenses //////////////////

/**
 * GET: List all expenses
 */
app.get("/expenses", async function (req, res) {
  try {
    const data = await dynamoDB.scan({ TableName: TABLE_EXP }).promise();
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
    });
    res.json({ success: true, expenses: data.Items });
  } catch (error) {
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
    });
    res.status(500).json({ error: "Could not fetch expenses", details: error.toString() });
  }
});

/**
 * POST: Create a new expense
 * Body: { year, month, category, amount }
 */
app.post("/expenses", async function (req, res) {
  try {
    const { year, month, category, amount } = req.body;
    if (!year || !month || !category || amount === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    // Generate expenseId: EXP-YYYYMM-NNN
    const base = `${year}${String(month).padStart(2, "0")}`;
    const expenseId = `EXP-${base}-${Math.floor(Math.random() * 900 + 100)}`;
    const item = {
      expenseId,
      year: parseInt(year),
      month: parseInt(month),
      category: String(category),
      amount: parseFloat(amount),
    };
    await dynamoDB.put({
      TableName: TABLE_EXP,
      Item: item,
    }).promise();
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
    });
    res.json({ success: true, expense: item });
  } catch (error) {
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
    });
    res.status(500).json({ error: "Could not create expense", details: error.toString() });
  }
});

/**
 * PUT: Update an expense by expenseId
 * Body: { year, month, category, amount }
 */
app.put("/expenses/:id", async function (req, res) {
  const expenseId = req.params.id;
  const { year, month, category, amount } = req.body;
  if (!expenseId) {
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
    });
    return res.status(400).json({ error: "Missing expenseId" });
  }
  try {
    // First fetch the existing expense
    const getResult = await dynamoDB.get({
      TableName: TABLE_EXP,
      Key: { expenseId }
    }).promise();
    if (!getResult.Item) {
      res.set({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      });
      return res.status(404).json({ error: "Expense not found" });
    }
    // Only update provided fields
    const updateFields = {};
    if (year !== undefined) updateFields.year = parseInt(year);
    if (month !== undefined) updateFields.month = parseInt(month);
    if (category !== undefined) updateFields.category = String(category);
    if (amount !== undefined) updateFields.amount = parseFloat(amount);
    if (Object.keys(updateFields).length === 0) {
      res.set({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      });
      return res.status(400).json({ error: "No fields to update" });
    }
    // Build UpdateExpression
    const exprAttrNames = {};
    const exprAttrValues = {};
    const setExprs = [];
    for (const key of Object.keys(updateFields)) {
      exprAttrNames["#" + key] = key;
      exprAttrValues[":" + key] = updateFields[key];
      setExprs.push(`#${key} = :${key}`);
    }
    const updateResult = await dynamoDB.update({
      TableName: TABLE_EXP,
      Key: { expenseId },
      UpdateExpression: "SET " + setExprs.join(", "),
      ExpressionAttributeNames: exprAttrNames,
      ExpressionAttributeValues: exprAttrValues,
      ReturnValues: "ALL_NEW",
    }).promise();
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
    });
    res.json({ success: true, expense: updateResult.Attributes });
  } catch (error) {
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
    });
    res.status(500).json({ error: "Could not update expense", details: error.toString() });
  }
});

/**
 * DELETE: Delete an expense by expenseId
 */
app.delete("/expenses/:id", async function (req, res) {
  const expenseId = req.params.id;
  if (!expenseId) {
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
    });
    return res.status(400).json({ error: "Missing expenseId" });
  }
  try {
    // First fetch the existing expense
    const getResult = await dynamoDB.get({
      TableName: TABLE_EXP,
      Key: { expenseId }
    }).promise();
    if (!getResult.Item) {
      res.set({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      });
      return res.status(404).json({ error: "Expense not found" });
    }
    await dynamoDB.delete({
      TableName: TABLE_EXP,
      Key: { expenseId },
    }).promise();
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
    });
    res.json({ success: true, deletedId: expenseId });
  } catch (error) {
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
    });
    res.status(500).json({ error: "Could not delete expense", details: error.toString() });
  }
});

// TEMPORARY: List raw contents of Reservation for debugging
app.get("/reservation_raw", async function (req, res) {
  try {
    const data = await dynamoDB.scan({ TableName: TABLE_RES }).promise();
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
    });
    res.json({ success: true, items: data.Items });
  } catch (err) {
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
    });
    res.status(500).json({ error: err.toString() });
  }
});

const serverless = require("serverless-http");

// Export handler pre AWS Lambda
module.exports.handler = serverless(app);