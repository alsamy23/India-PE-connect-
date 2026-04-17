
/**
 * Utility for exporting content to PDF and Word
 */

declare var html2pdf: any;

export const exportToPdf = async (element: HTMLElement | null, filename: string) => {
  if (!element) {
    console.error("Export element not found");
    return;
  }

  if (typeof html2pdf === 'undefined') {
    const error = "PDF library is not loaded. Please ensure index.html includes the html2pdf.js script.";
    console.error(error);
    alert(error);
    return;
  }

  try {
    const opt = {
      margin: [10, 10, 10, 10],
      filename: filename.endsWith('.pdf') ? filename : `${filename}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    
    await html2pdf().set(opt).from(element).save();
    console.log("PDF export completed successfully");
  } catch (err) {
    console.error("PDF export failed:", err);
    alert("Failed to export PDF. Try printing the page instead.");
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
