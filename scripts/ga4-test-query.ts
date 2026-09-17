// One-off GA4 Data API connectivity check. Run with: npm run ga4:test-query
import { BetaAnalyticsDataClient } from "@google-analytics/data";

const propertyId = process.env.GA4_PROPERTY_ID;
const clientEmail = process.env.GA4_CLIENT_EMAIL;
// Vercel/most hosts store multiline env vars with literal "\n" — real
// newlines are required for the PEM key to parse (same convention as
// src/lib/firebase/admin.ts).
const privateKey = process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!propertyId || !clientEmail || !privateKey) {
  throw new Error(
    "Missing GA4_PROPERTY_ID, GA4_CLIENT_EMAIL, or GA4_PRIVATE_KEY — see .env.example",
  );
}

const client = new BetaAnalyticsDataClient({
  credentials: { client_email: clientEmail, private_key: privateKey },
});

async function main() {
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
    dimensions: [{ name: "date" }],
    metrics: [{ name: "screenPageViews" }],
    orderBys: [{ dimension: { dimensionName: "date" } }],
  });

  const rows = (response.rows ?? []).map((row) => ({
    date: row.dimensionValues?.[0]?.value,
    views: row.metricValues?.[0]?.value,
  }));

  // SAFE: diagnostic script output, not application code
  console.log(`Property: properties/${propertyId}`);
  // SAFE: diagnostic script output, not application code
  console.log(`Rows returned: ${rows.length}`);
  // SAFE: diagnostic script output, not application code
  console.table(rows);
}

main().catch((error) => {
  // SAFE: diagnostic script output, not application code
  console.error("GA4 test query failed:", error);
  process.exit(1);
});
