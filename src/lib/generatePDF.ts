import jsPDF from 'jspdf';

type SEOScore = {
  overall: number;
  technical: number;
  content: number;
  backlinks: number;
};

type SEOIssue = {
  category: string;
  title: string;
  severity: string;
  score: number;
  description: string;
  recommendations: string[];
  current_value: string;
  suggested_value: string;
  impact: string;
  implementation_details: {
    title: string;
    code: string;
  }[];
};

type SEOResult = {
  score: SEOScore;
  issues: SEOIssue[];
};

export function generateSEOReport(analysisResult: SEOResult, url: string): jsPDF {
  const doc = new jsPDF();
  let yPos = 20;
  const lineHeight = 7;
  const margin = 20;
  const pageWidth = doc.internal.pageSize.width;

  // Helper function to add text and handle overflow
  const addText = (text: string, y: number, options: any = {}) => {
    const fontSize = options.fontSize || 12;
    const fontStyle = options.fontStyle || 'normal';
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    
    if (y > doc.internal.pageSize.height - margin) {
      doc.addPage();
      y = margin;
    }
    
    doc.text(text, margin, y);
    return y + lineHeight;
  };

  // Title
  yPos = addText('SEO Analysis Report', yPos, { fontSize: 24, fontStyle: 'bold' });
  yPos += 5;

  // URL and Date
  yPos = addText(`URL: ${url}`, yPos, { fontSize: 12 });
  yPos = addText(`Date: ${new Date().toLocaleDateString()}`, yPos, { fontSize: 12 });
  yPos += 10;

  // Overall Scores
  yPos = addText('Scores (out of 10):', yPos, { fontSize: 16, fontStyle: 'bold' });
  yPos += 5;
  yPos = addText(`Overall: ${analysisResult.score.overall}`, yPos);
  yPos = addText(`Technical: ${analysisResult.score.technical}`, yPos);
  yPos = addText(`Content: ${analysisResult.score.content}`, yPos);
  yPos = addText(`Backlinks: ${analysisResult.score.backlinks}`, yPos);
  yPos += 10;

  // Detailed Analysis
  yPos = addText('Detailed Analysis:', yPos, { fontSize: 16, fontStyle: 'bold' });
  yPos += 5;

  analysisResult.issues.forEach((issue) => {
    // Issue Title and Score
    yPos = addText(`${issue.title} (Score: ${issue.score}/10)`, yPos, { fontSize: 14, fontStyle: 'bold' });
    yPos += 3;

    // Severity and Impact
    yPos = addText(`Severity: ${issue.severity} | Impact: ${issue.impact}`, yPos, { fontSize: 10 });
    yPos += 5;

    // Description
    yPos = addText('Description:', yPos, { fontSize: 12, fontStyle: 'bold' });
    yPos = addText(issue.description, yPos, { fontSize: 10 });
    yPos += 5;

    // Current vs Suggested Values
    yPos = addText('Current Status:', yPos, { fontSize: 12, fontStyle: 'bold' });
    yPos = addText(issue.current_value, yPos, { fontSize: 10 });
    yPos = addText('Target:', yPos, { fontSize: 12, fontStyle: 'bold' });
    yPos = addText(issue.suggested_value, yPos, { fontSize: 10 });
    yPos += 5;

    // Recommendations
    yPos = addText('Recommendations:', yPos, { fontSize: 12, fontStyle: 'bold' });
    issue.recommendations.forEach((rec) => {
      yPos = addText(`• ${rec}`, yPos, { fontSize: 10 });
    });
    yPos += 10;

    // Add page break if needed
    if (yPos > doc.internal.pageSize.height - 50) {
      doc.addPage();
      yPos = margin;
    }
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  return doc;
} 