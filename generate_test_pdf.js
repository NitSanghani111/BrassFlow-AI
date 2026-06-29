const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

function createInvoice() {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const writeStream = fs.createWriteStream(path.join(__dirname, 'Saraswati_Metal_Scrap_Invoice.pdf'));
  doc.pipe(writeStream);

  // Colors
  const primaryColor = '#1e293b';
  const secondaryColor = '#475569';
  const accentColor = '#0f766e';
  const borderColor = '#cbd5e1';

  // --- Header ---
  doc.fillColor(accentColor)
     .fontSize(22)
     .font('Helvetica-Bold')
     .text('SARASWATI METAL SCRAP MERCHANTS', 40, 50);

  doc.fillColor(secondaryColor)
     .fontSize(9)
     .font('Helvetica')
     .text('Hapa Industrial Area, Jamnagar, Gujarat - 361005', 40, 75)
     .text('GSTIN: 24AAAPS1122D1Z9 | PAN: AAAPS1122D', 40, 88);

  // --- Title ---
  doc.fillColor(primaryColor)
     .fontSize(14)
     .font('Helvetica-Bold')
     .text('TAX INVOICE / PURCHASE BILL', 40, 115, { align: 'right' });

  // --- Divider ---
  doc.moveTo(40, 135)
     .lineTo(555, 135)
     .strokeColor(borderColor)
     .lineWidth(1)
     .stroke();

  // --- Invoice Details ---
  doc.fillColor(primaryColor)
     .fontSize(10)
     .font('Helvetica-Bold')
     .text('Billed To:', 40, 150)
     .font('Helvetica')
     .text('AI BRASS FLOW INDUSTRIES', 40, 165)
     .text('GIDC Phase-3, Jamnagar, Gujarat', 40, 178)
     .text('GSTIN: 24AAAPC9988C1Z2', 40, 191);

  doc.font('Helvetica-Bold')
     .text('Invoice Details:', 350, 150)
     .font('Helvetica')
     .text('Invoice No: ', 350, 165)
     .font('Helvetica-Bold')
     .text('SMS-2026-049', 420, 165)
     .font('Helvetica')
     .text('Date: ', 350, 178)
     .font('Helvetica-Bold')
     .text('2026-06-28', 420, 178)
     .font('Helvetica')
     .text('Due Date: ', 350, 191)
     .font('Helvetica-Bold')
     .text('2026-07-13', 420, 191);

  // --- Item Table Header ---
  const tableTop = 225;
  doc.rect(40, tableTop, 515, 20)
     .fill(primaryColor);

  doc.fillColor('#ffffff')
     .font('Helvetica-Bold')
     .fontSize(9)
     .text('SKU / Code', 45, tableTop + 6)
     .text('Description', 130, tableTop + 6)
     .text('Qty (KG)', 320, tableTop + 6, { width: 50, align: 'right' })
     .text('Rate', 380, tableTop + 6, { width: 50, align: 'right' })
     .text('GST %', 440, tableTop + 6, { width: 40, align: 'right' })
     .text('Total (INR)', 490, tableTop + 6, { width: 60, align: 'right' });

  // --- Item Row ---
  const rowTop = tableTop + 20;
  doc.rect(40, rowTop, 515, 25)
     .fillColor('#f8fafc')
     .fill();

  doc.fillColor(primaryColor)
     .font('Helvetica')
     .fontSize(9)
     .text('BR-SCRP-HONEY', 45, rowTop + 8)
     .font('Helvetica-Bold')
     .text('Honey Grade Brass Scrap (Clean Cast)', 130, rowTop + 8)
     .font('Helvetica')
     .text('1500.00', 320, rowTop + 8, { width: 50, align: 'right' })
     .text('380.00', 380, rowTop + 8, { width: 50, align: 'right' })
     .text('18.00%', 440, rowTop + 8, { width: 40, align: 'right' })
     .text('6,72,600.00', 490, rowTop + 8, { width: 60, align: 'right' });

  // --- Table Bottom Border ---
  doc.moveTo(40, rowTop + 25)
     .lineTo(555, rowTop + 25)
     .strokeColor(borderColor)
     .stroke();

  // --- Summary / Totals ---
  const summaryTop = rowTop + 45;
  doc.fontSize(9)
     .fillColor(secondaryColor)
     .text('Taxable Subtotal:', 350, summaryTop)
     .text('CGST (9.00%):', 350, summaryTop + 15)
     .text('SGST (9.00%):', 350, summaryTop + 30)
     .text('IGST (0.00%):', 350, summaryTop + 45)
     .moveTo(350, summaryTop + 60)
     .lineTo(555, summaryTop + 60)
     .stroke();

  doc.fillColor(primaryColor)
     .font('Helvetica-Bold')
     .text('5,70,000.00', 490, summaryTop, { align: 'right' })
     .text('51,300.00', 490, summaryTop + 15, { align: 'right' })
     .text('51,300.00', 490, summaryTop + 30, { align: 'right' })
     .text('0.00', 490, summaryTop + 45, { align: 'right' })
     .fontSize(11)
     .fillColor(accentColor)
     .text('Grand Total:', 350, summaryTop + 68)
     .text('Rs 6,72,600.00', 460, summaryTop + 68, { width: 90, align: 'right' });

  // --- Signatures / Terms ---
  doc.fillColor(secondaryColor)
     .fontSize(8)
     .font('Helvetica')
     .text('Terms & Conditions:', 40, summaryTop + 100)
     .text('1. Payment terms: Net 15 days from billing date.', 40, 112 + summaryTop)
     .text('2. Interest will be charged @ 18% p.a. on late payments.', 40, 122 + summaryTop);

  doc.moveTo(420, summaryTop + 130)
     .lineTo(540, summaryTop + 130)
     .stroke();
  doc.text('Authorized Signatory', 440, summaryTop + 135);

  doc.end();
  
  writeStream.on('finish', () => {
    console.log('Saraswati_Metal_Scrap_Invoice.pdf successfully generated!');
  });
}

createInvoice();
