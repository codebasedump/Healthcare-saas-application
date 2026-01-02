// src/utils/exportDashboard.js
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'react-toastify';

export const exportDashboard = async (targetId, format = 'pdf', tenantName = 'Hoffstee') => {
  const element = document.getElementById(targetId);
  if (!element) return toast.error('Section not found');

  try {
    const canvas = await html2canvas(element, { scale: 2 });
    const imageData = canvas.toDataURL('image/png');

    if (format === 'png') {
      const link = document.createElement('a');
      link.href = imageData;
      link.download = `${targetId}.png`;
      link.click();
      toast.success(`Exported as PNG`);
    } else {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imageData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.setFontSize(10);
      pdf.text(`Tenant: ${tenantName} | Exported: ${new Date().toLocaleString()}`, 10, 10);
      pdf.addImage(imageData, 'PNG', 0, 20, pdfWidth, pdfHeight);
      pdf.save(`${targetId}.pdf`);
      toast.success(`Exported as PDF`);
    }

    await fetch('/api/audit/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: `Exported ${targetId}`,
        actor: 'admin',
        timestamp: new Date().toISOString(),
        section: targetId
      })
    });
  } catch (err) {
    console.error('Export failed:', err);
    toast.error('Export failed');
  }
};