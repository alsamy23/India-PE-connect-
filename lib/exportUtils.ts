
/**
 * Utility for exporting content to PDF and Word
 */

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const exportToPdf = async (element: HTMLElement | null, filename: string) => {
  if (!element) {
    console.error("Export element not found");
    return;
  }

  try {
    // Show a loading indication if possible (caller should ideally handle this)
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (document) => {
        const hiddenElements = document.querySelectorAll('.print\\:hidden');
        hiddenElements.forEach((el) => {
          (el as HTMLElement).style.display = 'none';
        });
      }
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    
    // Calculate PDF dimensions (A4 portrait)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Calculate image dimensions to fit PDF page margin
    const margin = 10;
    const imgWidth = pdfWidth - (margin * 2);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = margin;
    let pageData = 0;

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
