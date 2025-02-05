import jsPDF from 'jspdf';

interface SEOIssue {
  title: string;
  description: string;
  severity: string;
  score: number;
  impact: string;
  implementation_details: string[];
}

interface SEOResult {
  url: string;
  overall_score: number;
  issues: SEOIssue[];
  timestamp: string;
}

export async function generateSEOReport(result: SEOResult) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let y = margin;

  // Helper function to add text with word wrap
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number = 7) => {
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + lines.length * lineHeight;
  };

  // Add title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  y = addWrappedText('SEO Analysis Report', margin, y, contentWidth);
  y += 10;

  // Add URL and date
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  y = addWrappedText(`URL: ${result.url}`, margin, y, contentWidth);
  y = addWrappedText(`Date: ${new Date(result.timestamp).toLocaleDateString()}`, margin, y, contentWidth);
  y += 10;

  // Add overall score
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  y = addWrappedText(`Overall Score: ${result.overall_score}/10`, margin, y, contentWidth);
  y += 15;

  // Add issues
  doc.setFontSize(14);
  doc.text('Detailed Analysis', margin, y);
  y += 10;

  doc.setFontSize(12);
  result.issues.forEach((issue) => {
    // Check if we need a new page
    if (y > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }

    // Issue title
    doc.setFont('helvetica', 'bold');
    y = addWrappedText(issue.title, margin, y, contentWidth);
    y += 5;

    // Score and severity
    doc.setFont('helvetica', 'normal');
    y = addWrappedText(`Score: ${issue.score}/10 | Severity: ${issue.severity}`, margin, y, contentWidth);
    y += 5;

    // Description
    y = addWrappedText(issue.description, margin, y, contentWidth);
    y += 5;

    // Impact
    doc.setFont('helvetica', 'bold');
    y = addWrappedText('Impact:', margin, y, contentWidth);
    y += 5;
    doc.setFont('helvetica', 'normal');
    y = addWrappedText(issue.impact, margin, y, contentWidth);
    y += 5;

    // Implementation details
    if (issue.implementation_details.length > 0) {
      doc.setFont('helvetica', 'bold');
      y = addWrappedText('Implementation Details:', margin, y, contentWidth);
      y += 5;
      doc.setFont('helvetica', 'normal');
      issue.implementation_details.forEach((detail) => {
        y = addWrappedText(`• ${detail}`, margin + 5, y, contentWidth - 5);
        y += 3;
      });
    }

    y += 10;
  });

  // Add page numbers
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - margin,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'right' }
    );
  }

  // Save the PDF
  const fileName = `seo-report-${result.url.replace(/[^a-z0-9]/gi, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
} 