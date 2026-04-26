
/**
 * Utility for exporting content to PDF and Word
 */

import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';

export const exportToPdf = async (element: HTMLElement | null, filename: string) => {
  if (!element) {
    console.error("Export element not found");
    return;
  }

  const hiddenElements = Array.from(element.querySelectorAll('.print\\:hidden')) as HTMLElement[];
  const originalDisplays = hiddenElements.map(el => el.style.display);

  try {
    // Hide print:hidden elements temporarily
    hiddenElements.forEach(el => { el.style.display = 'none'; });

    // We use html-to-image instead of html2canvas to natively support modern CSS like oklch from Tailwind v4.
    const imgData = await htmlToImage.toJpeg(element, {
      quality: 0.98,
      backgroundColor: '#ffffff',
      pixelRatio: 2 // High resolution
    });

    // Restore hidden elements
    hiddenElements.forEach((el, i) => { el.style.display = originalDisplays[i]; });
    
    // Calculate PDF dimensions (A4 portrait)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Create an image element to get the intrinsic dimensions
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error('Failed to load image data for PDF export'));
      img.src = imgData;
    });

    // Calculate image dimensions to fit PDF page margin
    const margin = 10;
    const imgWidth = pdfWidth - (margin * 2);
    const imgHeight = (img.height * imgWidth) / img.width;
    
    let heightLeft = imgHeight;
    let position = margin;

    // First page
    pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
    heightLeft -= (pdfHeight - (margin * 2));

    // Subsequent pages
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + margin; // Shift image up
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - (margin * 2));
    }

    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
    console.log("PDF export completed successfully");
  } catch (err: any) {
    console.error("PDF export failed:", err);
    alert(`Failed to export PDF: ${err?.message || err}. Try printing the page instead (Ctrl+P / Cmd+P).`);
    window.print();
  } finally {
    // Ensure hidden elements are restored even if an error occurs
    hiddenElements.forEach((el, i) => { el.style.display = originalDisplays[i]; });
  }
};

export const exportToWord = (htmlContent: string, filename: string) => {
  try {
    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.doc') || filename.endsWith('.docx') ? filename : `${filename}.doc`;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);
    console.log("Word export triggered successfully");
  } catch (err) {
    console.error("Word export failed:", err);
    alert("Failed to export Word document.");
  }
};

export const printElement = (element: HTMLElement | null) => {
   if (!element) return;
   window.print();
};
