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
    let inProgress = 0;
    let readyToInvoice = 0;
    let unpaidInvoices = 0;
    let unpaidInvoiceValue = 0;

    records.forEach((record) => {
      const fields = record.fields || {};
      const jobStatus = fields["Job Status"];
      const paymentStatus = fields["Payment Status"];
      const quoteAmount = fields["Quote Amount"] || 0;
      const invoiceAmount = fields["Invoice Amount"] || 0;

      if (jobStatus === "Quote Sent") {
        quotesPending++;
        quoteValue += quoteAmount;
      }

      if (["Approved", "Scheduled", "In Progress"].includes(jobStatus)) {
        activeJobs++;
      }

      if (jobStatus === "In Progress") {
        inProgress++;
      }

      if (jobStatus === "Completed" && !invoiceAmount) {
        readyToInvoice++;
      }

      if (jobStatus === "Invoiced" && paymentStatus === "Not Paid") {
        unpaidInvoices++;
        unpaidInvoiceValue += invoiceAmount;
      }
    });

    res.status(200).json({
      quotesPending,
      quoteValue,
      activeJobs,
      inProgress,
      readyToInvoice,
      unpaidInvoices,
      unpaidInvoiceValue,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch Airtable data",
      details: error.message,
    });
  }
}
