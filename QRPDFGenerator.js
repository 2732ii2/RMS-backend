import QRCode from "qrcode";
import { PDFDocument } from "pdf-lib";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function QRPDFGen(Resname,numberoftables) {
    console.log("qr code begins")
  try {
    const numQRCodes = numberoftables; // Number of QR codes
    const qrCodeImages = [];

    // Step 1: Generate QR codes
    for (let i = 1; i <= numQRCodes; i++) {
      const data = `${Resname}_${i}`;
      const qrCode = await QRCode.toDataURL(data);
      qrCodeImages.push(qrCode);
    }
    console.log("done with qr codes ");
    // Step 2: Create a PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();

    for (let index = 0; index < qrCodeImages.length; index++) {
      const x = (index % 4) * 100 + 50; // Alternate between two columns
      const y = height - Math.floor(index / 4) * 100 - 50; // Row-based positioning
      const qrImageBytes = Buffer.from(qrCodeImages[index].split(',')[1], 'base64');
      const embeddedImage = await pdfDoc.embedPng(qrImageBytes);
      page.drawImage(embeddedImage, { x, y, width: 50, height: 50 });
    }

    const pdfBytes = await pdfDoc.save();

    // Step 3: Save the PDF to the backend directory
    const folderPath = path.join(__dirname, 'generated_files'); // Define the folder
    const filePath = path.join(folderPath, 'qr_codes.pdf'); // File path

    // Ensure the folder exists
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }

    // Write the PDF bytes to a file
    fs.writeFileSync(filePath, Buffer.from(pdfBytes));

    console.log(`PDF generated and saved at ${filePath}`);

  //  return { message: 'PDF generated successfully!', filePath };
    return (Buffer.from(pdfBytes));
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
}

export { QRPDFGen };
