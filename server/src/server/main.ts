import express, { request } from "express";

import { Sequelize } from "sequelize-typescript";
import {
  ProcurementRecordDto,
  RecordSearchRequest,
  RecordSearchResponse,
} from "./api_types";
import { Buyer } from "./db/Buyer";
import { ProcurementRecord } from "./db/ProcurementRecord";

/**
 * This file has little structure and doesn't represent production quality code.
 * Feel free to refactor it or add comments on what could be improved.
 *
 * We specifically avoided any use of sequelize ORM features for simplicity and used plain SQL queries.
 * Sequelize's data mapping is used to get nice JavaScript objects from the database rows.
 *
 * You can switch to using the ORM features or continue using SQL.
 */

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: process.env["SQLITE_DB"] || "./db.sqlite3",
});

sequelize.addModels([Buyer, ProcurementRecord]);

const app = express();

app.set("port", process.env.PORT || 3000);
app.set("views", "./views");
app.set("view engine", "ejs");

app.locals["assets_url"] = process.env.VITE_URL || "http://localhost:3001";

app.get("/", (_req, res) => {
  res.render("index.html.ejs");
});

app.use(express.json());

type RecordSearchFilters = {
  textSearch?: string;
  buyerId?: string;
};

/**
 * Queries the database for procurement records according to the search filters.
 */
async function searchRecords(
  { textSearch }: RecordSearchFilters,
  { buyerId }: RecordSearchFilters,
  offset: number,
  limit: number
): Promise<ProcurementRecord[]> {
  // Base SQL query
  let query = "SELECT * FROM procurement_records";
  
  // Conditional WHERE clause parts
  const whereClauses: string[] = [];
  
  if (textSearch) {
    whereClauses.push("(title LIKE :textSearch OR description LIKE :textSearch)");
  }
  
  if (buyerId && buyerId != '0') {
    whereClauses.push("buyer_id = :buyerId");
  }
  
  // Add WHERE clause if there are any conditions
  if (whereClauses.length > 0) {
    query += " WHERE " + whereClauses.join(" AND ");
  }
  
  // Add LIMIT and OFFSET
  query += " LIMIT :limit OFFSET :offset";
  
  // Execute query with dynamic replacements
  return await sequelize.query(query, {
    model: ProcurementRecord, // Return ProcurementRecord objects
    replacements: {
      textSearch: textSearch ? `%${textSearch}%` : null,
      buyerId: buyerId || null,
      offset: offset,
      limit: limit,
    },
  });
}


/**
 * Queries the database for a distinct list of buyers.
 */
async function getDistinctBuyers(
): Promise<{ id: string; name: string; }[]> {
  // Base SQL query for distinct buyers
  const query = `
    SELECT DISTINCT id, name 
    FROM buyers 
  `;

  // Execute query with dynamic replacements
  return await sequelize.query(query, {
    model: Buyer,   
  });
}


/**
 * Converts a DB-style ProcurementRecord object to an API type.
 * Assumes that all related objects (buyers) are prefetched upfront and passed in the `buyersById` map
 */
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
    close_date: record.close_date,
    award_date: record.award_date,
    buyer: {
      id: buyer.id,
      name: buyer.name,
    },
  };
}

function unique<T>(items: Iterable<T>): T[] {
  return Array.from(new Set(items));
}

/**
 * Converts an array of DB-style procurement record object into API types.
 * Prefetches all the required relations.
 */
async function serializeProcurementRecords(
  records: ProcurementRecord[]
): Promise<ProcurementRecordDto[]> {
  // Get unique buyer ids for the selected records
  const buyerIds = unique(records.map((pr) => pr.buyer_id));

  // Fetch the buyer data in one query
  const buyers = await sequelize.query(
    "SELECT * FROM buyers WHERE id IN (:buyerIds)",
    {
      model: Buyer,
      replacements: {
        buyerIds,
      },
    }
  );

  const buyersById = new Map(buyers.map((b) => [b.id, b]));
  return records.map((r) => serializeProcurementRecord(r, buyersById));
}

/**
 * This endpoint implements basic way to paginate through the search results.
 * It returns a `endOfResults` flag which is true when there are no more records to fetch.
 */
app.post("/api/records", async (req, res) => {
  const requestPayload = req.body as RecordSearchRequest;

  const { limit, offset } = requestPayload;

  if (limit === 0 || limit > 100) {
    res.status(400).json({ error: "Limit must be between 1 and 100." });
    return;
  }

  // We fetch one more record than requested.
  // If number of returned records is larger than
  // the requested limit it means there is more data than requested
  // and the client can fetch the next page.
  const records = await searchRecords(
    {
      textSearch: requestPayload.textSearch,
    },
    {
      buyerId: requestPayload.buyerId
    },
    offset,
    limit + 1
  );

  const response: RecordSearchResponse = {
    records: await serializeProcurementRecords(
      records.slice(0, limit) // only return the number of records requested
    ),
    endOfResults: records.length <= limit, // in this case we've reached the end of results
  };

  res.json(response);
});

app.listen(app.get("port"), () => {
  console.log("  App is running at http://localhost:%d", app.get("port"));
  console.log("  Press CTRL-C to stop\n");
});


/**
 * This endpoint implements basic pagination for fetching distinct buyers.
 * It returns a `endOfResults` flag which is true when there are no more buyers to fetch.
 */
app.get("/api/buyers", async (req, res) => {
 
  // Fetch one more buyer than requested to determine if more buyers exist
  const buyers = await getDistinctBuyers();

  // Prepare response
  const response = {
    buyers: buyers // Return only the number of buyers requested
    
  };

  res.json(response); // Send the response back to the client
});
