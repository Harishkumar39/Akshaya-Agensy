import PDFDocument from "pdfkit";

export const generateInvoicePDF = (order) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      let buffers = [];
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      // --- Header ---
      doc.fillColor("#0f172a").fontSize(20).font("Helvetica-Bold").text("AKSHAYA AGENSY", { align: "right" });
      doc.fillColor("#64748b").fontSize(10).font("Helvetica").text("Office & General Stationeries", { align: "right" });
      doc.text("No. 282-A, Village High Road, Sholinganallur, Chennai - 600119. (Opp. to Tulip Play School)", { align: "right" });
      doc.moveDown();

      // --- Order Info ---
      const startY = 120;
      
      doc.fillColor("#0f172a").fontSize(10).font("Helvetica-Bold").text("SHIP TO:", 50, startY);
      doc.font("Helvetica").fillColor("#334155")
         .text(order.shippingAddress.name, 50, startY + 15)
         .text(order.shippingAddress.address, 50, startY + 30, { width: 200 })
         .text(`${order.shippingAddress.city} - ${order.shippingAddress.pincode}`, 50, startY + 60)
         .text(`Phone: ${order.shippingAddress.phone}`, 50, startY + 75);

      doc.font("Helvetica-Bold").fillColor("#0f172a").text("ORDER DETAILS:", 350, startY);
      doc.font("Helvetica").fillColor("#334155")
         .text(`Order ID: #${order._id.toString().slice(-8).toUpperCase()}`, 350, startY + 15)
         .text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 350, startY + 30)
         .text(`Status: ${order.status.toUpperCase()}`, 350, startY + 45)
         .text(`Payment ID: ${order.razorpayPaymentId || 'N/A'}`, 350, startY + 60);

      // --- Table ---
      const tableTop = 260; // Pushed down slightly for clarity
      doc.fillColor("#0f172a").font("Helvetica-Bold").fontSize(10);
      doc.text("Item Description", 50, tableTop);
      doc.text("Qty", 300, tableTop, { width: 50, align: 'center' });
      doc.text("Price", 380, tableTop, { width: 70, align: 'right' });
      doc.text("Total", 480, tableTop, { width: 70, align: 'right' });
      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).strokeColor("#e2e8f0").stroke();

      let y = tableTop + 25;
      doc.font("Helvetica").fillColor("#334155");

      order.items.forEach((item) => {
        // Corrected mapping: Use item.variant.name based on your JSON structure
        const variantText = item.variant?.name ? `\nVariant: ${item.variant.name}` : "";
        const itemTitle = `${item.name}${variantText}`;
        const textHeight = doc.heightOfString(itemTitle, { width: 230 });

        doc.text(itemTitle, 50, y, { width: 230 });
        doc.text(item.qty.toString(), 300, y, { width: 50, align: 'center' });
        doc.text(`Rs. ${item.price.toLocaleString('en-IN')}`, 380, y, { width: 70, align: 'right' });
        doc.text(`Rs. ${(item.price * item.qty).toLocaleString('en-IN')}`, 480, y, { width: 70, align: 'right' });

        y += Math.max(textHeight, 25) + 10;
      });

      // --- Totals ---
      doc.moveTo(350, y).lineTo(550, y).strokeColor("#e2e8f0").stroke();
      y += 15;

      const summaryX = 380;
      const valueX = 480;

      doc.fontSize(10).font("Helvetica");
      doc.text("Subtotal:", summaryX, y, { width: 70, align: 'right' });
      doc.text(`Rs. ${order.subtotal.toLocaleString('en-IN')}`, valueX, y, { width: 70, align: 'right' });
      
      y += 20;
      doc.text("Shipping Fee:", summaryX, y, { width: 70, align: 'right' });
      doc.text(`Rs. ${order.shippingFee.toLocaleString('en-IN')}`, valueX, y, { width: 70, align: 'right' });

      y += 25;
      doc.fillColor("#0f172a").font("Helvetica-Bold").fontSize(12);
      doc.text("Grand Total:", summaryX, y, { width: 70, align: 'right' });
      doc.text(`Rs. ${order.total.toLocaleString('en-IN')}`, valueX, y, { width: 70, align: 'right' });

      // --- Footer ---
      doc.fontSize(10).fillColor("#94a3b8").font("Helvetica")
         .text("Thank you for shopping with Akshaya Agensy!", 50, 750, { align: "center", width: 500 });

      doc.end();
    } catch (error) {
      console.error("PDF Generation Error:", error);
      reject(error);
    }
  });
};