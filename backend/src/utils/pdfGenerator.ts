import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

interface PDFInvoiceItem {
  sku: string;
  name: string;
  hsnCode: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountAmount: number;
  taxableAmount: number;
  gstRate: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
}

interface PDFInvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  companyName: string;
  customerName: string;
  customerGstin: string;
  customerStreet: string;
  customerCity: string;
  customerState: string;
  customerZip: string;
  subtotal: number;
  discountAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  roundOff: number;
  grandTotal: number;
  paymentTerms?: string;
  notes?: string;
  termsAndConditions?: string;
  items: PDFInvoiceItem[];
}

// Custom Indian Number to Words Translator
function convertNumberToWords(num: number): string {
  if (num === 0) return 'Zero Rupees Only';
  
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
    'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty ', 'Thirty ', 'Forty ', 'Fifty ', 'Sixty ', 'Seventy ', 'Eighty ', 'Ninety '];

  const parse3Digits = (n: number): string => {
    let str = '';
    if (n >= 100) {
      str += a[Math.floor(n / 100)] + 'Hundred ';
      n %= 100;
    }
    if (n > 0) {
      if (str !== '') str += 'and ';
      if (n < 20) {
        str += a[n];
      } else {
        str += b[Math.floor(n / 10)] + a[n % 10];
      }
    }
    return str;
  };

  let rupeeVal = Math.floor(num);
  let words = '';

  // Crores
  if (rupeeVal >= 10000000) {
    const crores = Math.floor(rupeeVal / 10000000);
    words += parse3Digits(crores) + 'Crore ';
    rupeeVal %= 10000000;
  }
  // Lakhs
  if (rupeeVal >= 100000) {
    const lakhs = Math.floor(rupeeVal / 100000);
    words += parse3Digits(lakhs) + 'Lakh ';
    rupeeVal %= 100000;
  }
  // Thousands
  if (rupeeVal >= 1000) {
    const thousands = Math.floor(rupeeVal / 1000);
    words += parse3Digits(thousands) + 'Thousand ';
    rupeeVal %= 1000;
  }
  // Hundreds/Tens
  if (rupeeVal > 0) {
    words += parse3Digits(rupeeVal);
  }

  return words.trim() + ' Rupees Only';
}

export function generateInvoicePDF(data: PDFInvoiceData): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Create A4 PDF with exact margins
      const doc = new PDFDocument({ size: 'A4', margin: 20 });
      
      const fileName = `${data.invoiceNumber.replace(/\//g, '_')}.pdf`;
      const dirPath = path.join(process.cwd(), 'uploads', 'invoices');
      
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      
      const filePath = path.join(dirPath, fileName);
      const writeStream = fs.createWriteStream(filePath);
      
      doc.pipe(writeStream);

      // --- COLOR PALETTE & STYLES ---
      const strokeColor = '#000000';
      const secondaryStroke = '#cccccc';
      
      // 1. Draw Outer Frame Box
      doc.rect(20, 20, 555, 802).strokeColor(strokeColor).stroke();

      // 2. Header Box: TAX INVOICE
      doc.rect(20, 20, 555, 30).fill('#f3f4f6').strokeColor(strokeColor).stroke();
      doc.fillColor('#000000')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('TAX INVOICE', 20, 30, { align: 'center', width: 555 });

      // 3. Supplier Details Block
      doc.font('Helvetica-Bold').fontSize(10).text('BRASSFLOW INDUSTRIES', 25, 60);
      doc.font('Helvetica').fontSize(8)
         .text('Plot 42, GIDC Industrial Estate Phase II, Jamnagar, Gujarat, 361004', 25, 74)
         .text('GSTIN: 24AAACB1234A1Z0  |  PAN: AAACB1234A', 25, 86)
         .text('Email: accounts@brassflow.in  |  Phone: +91 98765 43210', 25, 98);

      // QR Code Box Placeholder
      doc.rect(490, 55, 75, 75).strokeColor(secondaryStroke).stroke();
      doc.fontSize(6).fillColor('#666666').text('GST QR CODE\nPLACEHOLDER', 495, 85, { align: 'center', width: 65 });

      // Horizontal separator line at y = 140
      doc.moveTo(20, 140).lineTo(575, 140).strokeColor(strokeColor).stroke();

      // 4. Billing Grid (y = 140 to y = 230)
      // Vertical separators splitting details into columns
      doc.moveTo(210, 140).lineTo(210, 230).strokeColor(strokeColor).stroke();
      doc.moveTo(400, 140).lineTo(400, 230).strokeColor(strokeColor).stroke();

      // Column 1: Details of Supplier / Consignor
      doc.fillColor('#000000');
      doc.font('Helvetica-Bold').fontSize(8).text('Details of Receiver (Billed To):', 25, 145);
      doc.font('Helvetica').fontSize(8)
         .text(`Name: ${data.companyName}`, 25, 160)
         .text(`Address: ${data.customerStreet}`, 25, 172)
         .text(`${data.customerCity}, ${data.customerState} - ${data.customerZip}`, 25, 184)
         .text(`GSTIN: ${data.customerGstin || 'Unregistered'}`, 25, 196)
         .text(`State: ${data.customerState} (Code: 24)`, 25, 208);

      // Column 2: Details of Consignee (Shipped To)
      doc.font('Helvetica-Bold').text('Details of Consignee (Shipped To):', 215, 145);
      doc.font('Helvetica')
         .text(`Name: ${data.companyName}`, 215, 160)
         .text(`Address: ${data.customerStreet}`, 215, 172)
         .text(`${data.customerCity}, ${data.customerState} - ${data.customerZip}`, 215, 184)
         .text(`GSTIN: ${data.customerGstin || 'Unregistered'}`, 215, 196)
         .text(`State: ${data.customerState} (Code: 24)`, 215, 208);

      // Column 3: Invoice Info Grid
      doc.font('Helvetica-Bold').text('Invoice Details:', 405, 145);
      doc.font('Helvetica')
         .text(`Invoice No: ${data.invoiceNumber}`, 405, 160)
         .text(`Invoice Date: ${data.invoiceDate}`, 405, 172)
         .text(`Due Date: ${data.dueDate}`, 405, 184)
         .text(`Payment Terms: ${data.paymentTerms || 'Net 15 Days'}`, 405, 196)
         .text(`Reverse Charge: No`, 405, 208);

      // Horizontal separator line at y = 230
      doc.moveTo(20, 230).lineTo(575, 230).strokeColor(strokeColor).stroke();

      // 5. Table Header Box (y = 230 to 255)
      doc.rect(20, 230, 555, 25).fill('#f3f4f6').strokeColor(strokeColor).stroke();
      doc.fillColor('#000000').font('Helvetica-Bold').fontSize(8);
      
      const tableTop = 238;
      doc.text('S.No', 22, tableTop, { width: 25, align: 'center' })
         .text('Description of Goods', 50, tableTop, { width: 140 })
         .text('HSN/SAC', 195, tableTop, { width: 45, align: 'center' })
         .text('Qty', 245, tableTop, { width: 35, align: 'right' })
         .text('Rate', 285, tableTop, { width: 45, align: 'right' })
         .text('Disc %', 335, tableTop, { width: 30, align: 'right' })
         .text('Taxable Val', 370, tableTop, { width: 55, align: 'right' })
         .text('GST Rate', 430, tableTop, { width: 40, align: 'right' })
         .text('Tax Amount', 475, tableTop, { width: 45, align: 'right' })
         .text('Total', 525, tableTop, { width: 45, align: 'right' });

      // Table Row Vertical Grid Borders
      const drawTableLines = (bottomY: number) => {
        doc.moveTo(45, 230).lineTo(45, bottomY).strokeColor(strokeColor).stroke(); // S.No
        doc.moveTo(190, 230).lineTo(190, bottomY).strokeColor(strokeColor).stroke(); // Desc
        doc.moveTo(240, 230).lineTo(240, bottomY).strokeColor(strokeColor).stroke(); // HSN
        doc.moveTo(280, 230).lineTo(280, bottomY).strokeColor(strokeColor).stroke(); // Qty
        doc.moveTo(330, 230).lineTo(330, bottomY).strokeColor(strokeColor).stroke(); // Rate
        doc.moveTo(365, 230).lineTo(365, bottomY).strokeColor(strokeColor).stroke(); // Disc
        doc.moveTo(425, 230).lineTo(425, bottomY).strokeColor(strokeColor).stroke(); // Taxable Val
        doc.moveTo(470, 230).lineTo(470, bottomY).strokeColor(strokeColor).stroke(); // GST Rate
        doc.moveTo(520, 230).lineTo(520, bottomY).strokeColor(strokeColor).stroke(); // Tax Amt
      };

      // 6. Table Items Content Loop (y starts at 260)
      let currentY = 260;
      doc.font('Helvetica').fontSize(8);

      data.items.forEach((item, index) => {
        const itemHeight = 22;
        
        // S.No
        doc.text(String(index + 1), 22, currentY, { width: 25, align: 'center' });
        // Name & SKU
        doc.text(`${item.name} (${item.sku})`, 50, currentY, { width: 135 });
        // HSN
        doc.text(item.hsnCode || '7407', 195, currentY, { width: 45, align: 'center' });
        // Qty
        doc.text(`${item.quantity} ${item.unit}`, 245, currentY, { width: 35, align: 'right' });
        // Rate
        doc.text(item.unitPrice.toFixed(2), 285, currentY, { width: 45, align: 'right' });
        // Disc
        doc.text(`${item.discountAmount > 0 ? '5%' : '0%'}`, 335, currentY, { width: 30, align: 'right' });
        // Taxable
        doc.text(item.taxableAmount.toFixed(2), 370, currentY, { width: 55, align: 'right' });
        // GST Rate
        doc.text(`${item.gstRate}%`, 430, currentY, { width: 40, align: 'right' });
        // Tax Amount (CGST + SGST + IGST)
        const taxVal = item.cgst + item.sgst + item.igst;
        doc.text(taxVal.toFixed(2), 475, currentY, { width: 45, align: 'right' });
        // Total Amount
        doc.text(item.totalAmount.toFixed(2), 525, currentY, { width: 45, align: 'right' });

        currentY += itemHeight;

        // Draw light row separator
        doc.moveTo(20, currentY - 2).lineTo(575, currentY - 2).strokeColor(secondaryStroke).stroke();
      });

      // Bottom of table boundary at y = 560
      const tableBottomY = 560;
      drawTableLines(tableBottomY);
      doc.moveTo(20, tableBottomY).lineTo(575, tableBottomY).strokeColor(strokeColor).stroke();

      // 7. Amount in Words row
      doc.rect(20, tableBottomY, 555, 20).fill('#f9fafb').strokeColor(strokeColor).stroke();
      doc.fillColor('#000000')
         .font('Helvetica-Bold')
         .fontSize(8)
         .text('Total Invoice Value (in Words): ', 25, tableBottomY + 6, { continued: true })
         .font('Helvetica')
         .text(convertNumberToWords(data.grandTotal));

      // 8. Bottom Split Panels (y = 580 to y = 800)
      const splitY = 580;
      doc.moveTo(350, splitY).lineTo(350, 800).strokeColor(strokeColor).stroke();

      // Left Side: Terms and Bank Info
      doc.font('Helvetica-Bold').fontSize(8).text('Bank Account Credentials:', 25, splitY + 10);
      doc.font('Helvetica')
         .text('Account Name: BrassFlow Industries Ltd', 25, splitY + 22)
         .text('Banker Name: State Bank of India', 25, splitY + 34)
         .text('Account No: 334455667788', 25, splitY + 46)
         .text('IFSC Code: SBIN0004561 | Branch: GIDC Jamnagar', 25, splitY + 58);

      doc.font('Helvetica-Bold').text('Terms & Conditions:', 25, splitY + 76);
      doc.font('Helvetica').fontSize(7)
         .text('1. Goods once sold will not be taken back or exchanged.', 25, splitY + 88)
         .text('2. Subject to Jamnagar jurisdiction only.', 25, splitY + 98)
         .text('3. Payment terms are strictly enforced within credit limit window.', 25, splitY + 108);

      // Right Side: Calculations Grid
      const calcX = 360;
      const valX = 490;
      doc.font('Helvetica').fontSize(8);
      
      let calcY = splitY + 10;
      doc.text('Sub Total (Taxable Value):', calcX, calcY).text(`₹ ${data.subtotal.toFixed(2)}`, valX, calcY, { align: 'right', width: 80 });
      
      calcY += 14;
      doc.text('Total Discount:', calcX, calcY).text(`(-) ₹ ${data.discountAmount.toFixed(2)}`, valX, calcY, { align: 'right', width: 80 });
      
      calcY += 14;
      doc.text('Central Tax (CGST):', calcX, calcY).text(`(+) ₹ ${data.cgst.toFixed(2)}`, valX, calcY, { align: 'right', width: 80 });
      
      calcY += 14;
      doc.text('State Tax (SGST):', calcX, calcY).text(`(+) ₹ ${data.sgst.toFixed(2)}`, valX, calcY, { align: 'right', width: 80 });
      
      calcY += 14;
      doc.text('Integrated Tax (IGST):', calcX, calcY).text(`(+) ₹ ${data.igst.toFixed(2)}`, valX, calcY, { align: 'right', width: 80 });
      
      calcY += 14;
      doc.text('Round Off adjustments:', calcX, calcY).text(`₹ ${data.roundOff.toFixed(2)}`, valX, calcY, { align: 'right', width: 80 });

      // Horizontal separator inside Calculations
      calcY += 15;
      doc.moveTo(350, calcY).lineTo(575, calcY).strokeColor(secondaryStroke).stroke();

      calcY += 6;
      doc.font('Helvetica-Bold').fontSize(10)
         .text('Total Invoice Value:', calcX, calcY)
         .text(`₹ ${data.grandTotal.toFixed(2)}`, valX, calcY, { align: 'right', width: 80 });

      // Signature Box Block at Bottom Right
      const signY = 720;
      doc.moveTo(350, signY).lineTo(575, signY).strokeColor(strokeColor).stroke();
      doc.fontSize(7).fillColor('#333333').font('Helvetica-Bold').text('For BRASSFLOW INDUSTRIES', 360, signY + 8, { align: 'right', width: 200 });
      doc.fontSize(7).font('Helvetica').text('Authorized Signatory', 360, signY + 62, { align: 'right', width: 200 });

      // 9. Footer
      doc.fontSize(7)
         .fillColor('#888888')
         .text('This is a computer-generated tax invoice verified under GST, Jamnagar. No physical signature required.', 20, 810, { align: 'center', width: 555 });

      doc.end();
      
      writeStream.on('finish', () => {
        resolve(filePath);
      });
      
      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
}
