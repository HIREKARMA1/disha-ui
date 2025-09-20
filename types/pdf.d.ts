// Type definitions for PDF generation
declare module 'jspdf' {
  interface jsPDF {
    splitTextToSize(text: string, maxWidth: number): string[]
  }
}
