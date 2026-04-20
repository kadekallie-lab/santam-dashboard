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
          invoiceAmount: Number(fields["Invoice Amount"] || 0),
          paymentStatus: fields["Payment Status"] || "",
          notes: fields["Notes"] || "",
          priority: (fields["Priority"] || "").replace(/[^a-zA-Z ]/g, ""),
          jobStatus: fields["Job Status"] || "",
        };
      })
      .filter(
        (r) => r.jobStatus === "Invoiced" && r.paymentStatus === "Not Paid"
      );

    return res.status(200).json(records);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch invoiced not paid",
      details: error.message,
    });
  }
}
