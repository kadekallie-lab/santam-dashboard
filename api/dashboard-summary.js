export default async function handler(req, res) {
  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;

  const url = `https://api.airtable.com/v0/${BASE_ID}/Santam%20Matters`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      },
    });

    const data = await response.json();
    const records = data.records || [];

    let quotesPending = 0;
    let quoteValue = 0;
    let activeJobs = 0;
    let unpaidInvoices = 0;

    records.forEach((record) => {
      const fields = record.fields || {};

      if (fields["Job Status"] === "Quote Sent") {
        quotesPending++;
        quoteValue += fields["Quote Amount"] || 0;
      }

      if (
        ["Approved", "Scheduled", "In Progress"].includes(fields["Job Status"])
      ) {
        activeJobs++;
      }

      if (
        fields["Job Status"] === "Invoiced" &&
        fields["Payment Status"] === "Not Paid"
      ) {
        unpaidInvoices++;
      }
    });

    res.status(200).json({
      quotesPending,
      quoteValue,
      activeJobs,
      unpaidInvoices,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch Airtable data",
      details: error.message,
    });
  }
}
