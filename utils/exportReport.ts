// utils/exportReport.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // if available

export const exportAttemptReport = (report: any, filename = 'practice-report.pdf') => {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(`${report.moduleTitle || 'Practice Report'}`, 14, 20);
  doc.setFontSize(11);
  doc.text(`Student: ${report.studentName || 'Unknown'}`, 14, 28);
  doc.text(`Score: ${report.score_percent}%`, 14, 34);
  doc.text(`Time Taken: ${Math.round(report.time_taken_seconds)}s`, 14, 40);

  // Add weak areas table
  if (report.weak_areas?.length) {
    autoTable(doc, {
      startY: 48,
      head: [['Tag', 'Accuracy']],
      body: report.weak_areas.map((w: any) => [w.tag, `${w.accuracy}%`]),
    });
  }

  // Per-question table
  const nextY = (doc as any).previousAutoTable ? (doc as any).previousAutoTable.finalY + 10 : 100;

  autoTable(doc, {
    startY: nextY,
    head: [['Q ID', 'Correct', 'Explanation']],
    body: report.question_results.map((q: any) => [q.question_id, q.is_correct ? 'Yes' : 'No', q.explanation || '']),
    styles: { fontSize: 9 },
  });

  doc.save(filename);
};
