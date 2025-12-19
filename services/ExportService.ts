
declare const XLSX: any;
declare const jspdf: any;

export type ExportFormat = 'CSV' | 'EXCEL' | 'PDF';

export const ExportService = {
  /**
   * Generates a CSV string from an array of objects.
   */
  convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map(obj => 
      headers.map(header => {
        const val = obj[header];
        const formatted = typeof val === 'object' ? JSON.stringify(val).replace(/"/g, '""') : String(val).replace(/"/g, '""');
        return `"${formatted}"`;
      }).join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  },

  /**
   * Triggers a browser download for a file.
   */
  downloadFile(content: BlobPart, fileName: string, contentType: string) {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  },

  /**
   * Export handler that routes to the correct format.
   */
  exportData(data: any[], fileName: string, format: ExportFormat) {
    if (!data || data.length === 0) return;
    const name = `${fileName}_${new Date().toISOString().split('T')[0]}`;

    switch (format) {
      case 'CSV':
        const csv = this.convertToCSV(data);
        this.downloadFile(csv, `${name}.csv`, 'text/csv');
        break;
      case 'EXCEL':
        this.exportToExcel(data, name);
        break;
      case 'PDF':
        this.exportToPDF(data, name);
        break;
    }
  },

  exportToExcel(data: any[], fileName: string) {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  },

  exportToPDF(data: any[], fileName: string) {
    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    
    // Add Clinic Name or Title
    doc.setFontSize(18);
    doc.text(fileName.replace(/_/g, ' '), 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    const headers = Object.keys(data[0]);
    const body = data.map(obj => headers.map(h => String(obj[h])));

    (doc as any).autoTable({
      head: [headers],
      body: body,
      startY: 35,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillStyle: '#2563eb', textColor: '#ffffff' }
    });

    doc.save(`${fileName}.pdf`);
  },

  /**
   * Exports full system state as JSON for backup.
   */
  exportFullBackup(fullData: any) {
    const json = JSON.stringify(fullData, null, 2);
    this.downloadFile(json, `MedCore_Full_Backup_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
  }
};
