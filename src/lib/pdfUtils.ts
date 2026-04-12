import jsPDF from 'jspdf';

const FONT_URL = 'https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/cyrillic-400-normal.ttf';
const FONT_BOLD_URL = 'https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/cyrillic-700-normal.ttf';

const fontCache: { normal?: string; bold?: string } = {};

async function loadFontAsBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function createPDF(orientation: 'p' | 'l' = 'p'): Promise<jsPDF> {
  if (!fontCache.normal) {
    const [normal, bold] = await Promise.all([
      loadFontAsBase64(FONT_URL),
      loadFontAsBase64(FONT_BOLD_URL),
    ]);
    fontCache.normal = normal;
    fontCache.bold = bold;
  }

  const doc = new jsPDF(orientation, 'mm', 'a4');

  doc.addFileToVFS('Roboto-Regular.ttf', fontCache.normal!);
  doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');

  doc.addFileToVFS('Roboto-Bold.ttf', fontCache.bold!);
  doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');

  doc.setFont('Roboto', 'normal');

  return doc;
}

export function setFontBold(doc: jsPDF) {
  doc.setFont('Roboto', 'bold');
}

export function setFontNormal(doc: jsPDF) {
  doc.setFont('Roboto', 'normal');
}

export default createPDF;
