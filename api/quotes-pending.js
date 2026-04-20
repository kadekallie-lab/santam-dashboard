export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;

  if (!AIRTABLE_TOKEN || !BASE_ID) {
    return res.status(500).json({
      error: "Missing Airtable environment variables",
    });
  }

  const url = `https://api.airtable.com/v0/${BASE_ID}/Santam%20Matters`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: "Failed to fetch Airtable data",
        details: errorText,
      });
    }

    const data = await response.json();

    const records = (data.records || [])
      .map((record) => {
        const fields = record.fields || {};
        return {
          id: record.id,
          claimReference: fields["Claim Reference"] || "",
          clientName: fields["Client Name"] || "",
          quoteAmount: Number(fields["Quote Amount"] || 0),
          dateQuoteSent: fields["Date Quote Sent"] || null,
          daysOutstanding: Number(fields["Days Outstanding"] || 0),
          priority: fields["Priority"] || "",
          jobStatus: fields["Job Status"] || "",
          notes: fields["Notes"] || "",
        };
      })
      .filter((r) => r.jobStatus === "Quote Sent")
      .sort((a, b) => b.daysOutstanding - a.daysOutstanding);

    return res.status(200).json(records);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch quotes pending",
      details: error.message,
    });
  }
}
