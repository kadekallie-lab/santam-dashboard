export default async function handler(req, res) {
  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;

  const url = `https://api.airtable.com/v0/${BASE_ID}/Jobs`;

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
    const fields = record.fields;

    if (fields["Job Status"] === "Quote Sent") {
      quotesPending++;
      quoteValue += fields["Quote Amount"] || 0;
    }

    if (fields["Job Status"] === "In Progress") {
      activeJobs++;
    }

    if (
      fields["Job Status"] === "Completed" &&
      !fields["Invoice Amount"]
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
}
