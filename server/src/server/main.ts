import express from "express";
import { Sequelize } from "sequelize-typescript";
import {
  ProcurementRecordDto,
  RecordSearchRequest,
  RecordSearchResponse,
} from "./api_types";
import { Buyer } from "./db/Buyer";
import { ProcurementRecord } from "./db/ProcurementRecord";

// Initialize Sequelize and define database connection
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: process.env["SQLITE_DB"] || "./db.sqlite3",
});

// Register models
sequelize.addModels([Buyer, ProcurementRecord]);

// Initialize Express application
const app = express();
app.set("port", process.env.PORT || 5000);
app.set("views", "./views");
app.set("view engine", "ejs");
app.locals["assets_url"] = process.env.VITE_URL || "http://localhost:3001";

app.use(express.json());

// Main route
app.get("/", (_req, res) => {
  res.render("index.html.ejs");
});

type RecordSearchFilters = {
  textSearch?: string;
  buyerId?: string;
};

// Helper function to search procurement records with optional filters
async function searchRecords(
  filters: RecordSearchFilters,
  offset: number,
  limit: number
): Promise<ProcurementRecord[]> {
  const { textSearch, buyerId } = filters;

  // Base SQL query
  let query = "SELECT * FROM procurement_records";
  const whereClauses: string[] = [];

  if (textSearch) {
    whereClauses.push("(title LIKE :textSearch OR description LIKE :textSearch)");
  }

  if (buyerId && buyerId !== "") {
    whereClauses.push("buyer_id = :buyerId");
  }

  // Append WHERE clause if conditions exist
  if (whereClauses.length > 0) {
    query += " WHERE " + whereClauses.join(" AND ");
  }

  // Add LIMIT and OFFSET
  query += " LIMIT :limit OFFSET :offset";

  // Execute query
  return await sequelize.query(query, {
    model: ProcurementRecord,
    replacements: {
      textSearch: textSearch ? `%${textSearch}%` : null,
      buyerId: buyerId || null,
      offset,
      limit,
    },
  });
}

// Helper function to get distinct buyers from the database
async function getDistinctBuyers(): Promise<{ id: string; name: string }[]> {
  try {
    const buyers = await Buyer.findAll({
      attributes: [[Sequelize.fn("DISTINCT", Sequelize.col("id")), "id"], "name"],
    });

    return buyers.map((buyer) => ({ id: buyer.id, name: buyer.name }));
  } catch (error) {
    console.error("Error fetching buyers:", error);
    throw new Error("Failed to fetch buyers");
  }
}

// Function to serialize procurement records with pre-fetched buyer data
async function serializeProcurementRecords(
  records: ProcurementRecord[]
): Promise<ProcurementRecordDto[]> {
  const buyerIds = unique(records.map((pr) => pr.buyer_id));

  const buyers = await sequelize.query(
    "SELECT * FROM buyers WHERE id IN (:buyerIds)",
    {
      model: Buyer,
      replacements: { buyerIds },
    }
  );

  const buyersById = new Map(buyers.map((b) => [b.id, b]));
  return records.map((r) => serializeProcurementRecord(r, buyersById));
}

// Helper function to convert a ProcurementRecord object to API DTO format
function serializeProcurementRecord(
  record: ProcurementRecord,
  buyersById: Map<string, Buyer>
): ProcurementRecordDto {
  const buyer = buyersById.get(record.buyer_id);
  if (!buyer) {
    throw new Error(
      `Buyer ${record.buyer_id} was not pre-fetched when loading record ${record.id}.`
    );
  }

  return {
    id: record.id,
    title: record.title,
    description: record.description,
    publishDate: record.publish_date,
    value: record.value,
    currency: record.currency,
    stage: record.stage,
    closeDate: record.close_date,
    awardDate: record.award_date,
    buyer: {
      id: buyer.id,
      name: buyer.name,
    },
  };
}

// Utility function to get unique values from an array
function unique<T>(items: Iterable<T>): T[] {
  return Array.from(new Set(items));
}

// API endpoint for fetching procurement records with pagination and search filters
app.post("/api/records", async (req, res) => {
  const requestPayload = req.body as RecordSearchRequest;
  const { limit, offset } = requestPayload;

  if (limit <= 0 || limit > 100) {
    return res.status(400).json({ error: "Limit must be between 1 and 100." });
  }

  try {
    const records = await searchRecords(
      { textSearch: requestPayload.textSearch, buyerId: requestPayload.buyerId },
      offset,
      limit + 1 // Fetch one extra record to determine if there are more results
    );

    const response: RecordSearchResponse = {
      records: await serializeProcurementRecords(records.slice(0, limit)),
      endOfResults: records.length <= limit,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching records:", error);
    res.status(500).json({ error: "Failed to retrieve records." });
  }
});

// API endpoint to get distinct buyers
app.get("/api/buyers", async (_req, res) => {
  try {
    const buyers = await getDistinctBuyers();
    res.json({ buyers });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve buyers." });
  }
});

// Start the Express server
app.listen(app.get("port"), () => {
  console.log("App is running at http://localhost:%d", app.get("port"));
});
