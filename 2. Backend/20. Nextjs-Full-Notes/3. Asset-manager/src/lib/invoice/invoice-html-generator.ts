// Pure function (no Next.js APIs used here) that builds a full, self-styled
// HTML "document" as a string. This is the "invoice generator" in the
// PURCHASE flow: src/actions/invoice-actions.ts's createInvoiceAction calls
// this once right after a purchase is recorded and stores the returned
// string verbatim in the `invoice.htmlContent` DB column. Later,
// src/app/api/invoice/[id]/route.ts fetches that stored string and serves
// it back as-is with `Content-Type: text/html` - so "viewing an invoice" is
// literally the browser rendering this generated HTML, and "printing"
// it uses the browser's native `window.print()` (see the print-button
// below) rather than any server-side PDF generation.
//
// `assetTitle` is a user-supplied asset title from the uploader, so it's
// HTML-escaped (see escapeHtml below) before being interpolated into the
// template. Without that, an asset title containing markup/script (e.g.
// `<img src=x onerror=...>`) would be stored verbatim and later served as
// live HTML by the text/html route in src/app/api/invoice/[id]/route.ts -
// a stored-XSS vector, since this string becomes the actual response body.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function generateInvoiceHtml(
  invoiceNumber: string,
  purchaseDate: Date,
  assetTitle: string,
  price: number
): string {
  const formattedDate = purchaseDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedPrice = (price / 100).toFixed(2);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoiceNumber}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 40px;
          color: #333;
        }
        .invoice-box {
          max-width: 800px;
          margin: auto;
          padding: 30px;
          border: 1px solid #eee;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
        }
        .invoice-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .invoice-title {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 30px;
          color: #2c3e50;
        }
        .company-details, .customer-details {
          margin-bottom: 20px;
        }
        h2 {
          font-size: 18px;
          margin-bottom: 10px;
          color: #2c3e50;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        table th, table td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        table th {
          background-color: #f8f9fa;
        }
        .total {
          font-weight: bold;
          font-size: 18px;
          margin-top: 20px;
          text-align: right;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          color: #777;
          font-size: 12px;
        }
        @media print {
          body {
            padding: 0;
          }
          .invoice-box {
            box-shadow: none;
            border: none;
          }
          .print-button {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-box">
        <div class="invoice-header">
          <div>
            <div class="invoice-title">INVOICE</div>
            <div>Invoice Number: ${invoiceNumber}</div>
            <div>Date: ${formattedDate}</div>
          </div>
        </div>
        
        <div class="company-details">
          <h2>From</h2>
          <div>Asset Manager Inc.</div>
          <div>123 Business Street</div>
          <div>Business City, 12345</div>
          <div>Email: billing@assetmanager.com</div>
        </div>
      
        
        <h2>Purchase Details</h2>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${escapeHtml(assetTitle)}</td>
              <td>$${formattedPrice}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="total">
          Total: $${formattedPrice}
        </div>
        
        <div class="footer">
          <p>Thank you for your purchase!</p>
          <p>This is an automatically generated invoice.</p>
        </div>
        
        <button class="print-button" onclick="window.print()">Print Invoice</button>
      </div>
    </body>
    </html>
  `;
}
