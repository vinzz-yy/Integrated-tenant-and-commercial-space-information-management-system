// Lightweight client-side export helpers: CSV, Excel (.xls via HTML), Word (.doc via HTML), Word (.docx via library), and Print to PDF
import { Document, Packer, Paragraph, Table as DocxTable, TableRow, TableCell, WidthType } from 'docx';
const buildTableHTML = (headers, rows, title = '') => {
  const thead = `<thead><tr>${headers.map(h => `<th style="padding:8px;border:1px solid #ccc;text-align:left;background:#f8f8f8">${String(h)}</th>`).join('')}</tr></thead>`;
  const tbody = `<tbody>${rows.map(r => `<tr>${r.map(c => `<td style="padding:8px;border:1px solid #ccc;text-align:left">${String(c ?? '')}</td>`).join('')}</tr>`).join('')}</tbody>`;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title></head><body><h2 style="font-family:sans-serif">${title}</h2><table style="border-collapse:collapse;font-family:sans-serif">${thead}${tbody}</table></body></html>`;
};

const downloadBlob = (content, mimeType, filename) => {
  const blob = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportToCSV = (headers, rows, filename = 'export.csv') => {
  const escapeCSV = (val) => {
    const s = String(val ?? '');
    const needsQuotes = /[",\n]/.test(s);
    const escaped = s.replace(/"/g, '""');
    return needsQuotes ? `"${escaped}"` : escaped;
  };
  const csv = [headers.map(escapeCSV).join(','), ...rows.map(r => r.map(escapeCSV).join(','))].join('\n');
  downloadBlob(csv, 'text/csv;charset=utf-8;', filename);
};

export const exportToExcel = (headers, rows, filename = 'export.xls', title = 'Export') => {
  const html = buildTableHTML(headers, rows, title);
  downloadBlob(html, 'application/vnd.ms-excel', filename);
};

export const exportToWord = (headers, rows, filename = 'export.doc', title = 'Export') => {
  const html = buildTableHTML(headers, rows, title);
  downloadBlob(html, 'application/msword', filename);
};

export const exportToDocx = async (headers, rows, filename = 'export.docx', title = 'Export') => {
  const headerRow = new TableRow({
    children: headers.map(h => new TableCell({ children: [new Paragraph(String(h))] })),
  });
  const bodyRows = rows.map(r =>
    new TableRow({
      children: r.map(c => new TableCell({ children: [new Paragraph(String(c ?? ''))] })),
    })
  );
  const table = new DocxTable({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...bodyRows],
  });
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [new Paragraph(title), table],
      },
    ],
  });
  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', filename);
};

export const printToPDF = (headers, rows, title = 'Export') => {
  const html = buildTableHTML(headers, rows, title);
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.srcdoc = html;
  document.body.appendChild(iframe);
  const cleanup = () => {
    document.body.removeChild(iframe);
  };
  iframe.onload = () => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } finally {
      setTimeout(cleanup, 500);
    }
  };
};
