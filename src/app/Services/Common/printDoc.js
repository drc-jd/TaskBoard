import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import getDocDefinition from "./docDefinition";

function printDoc(printParams, gridApi, columnApi, widths) {
  const docDefinition = getDocDefinition(printParams, gridApi, columnApi, widths);
  pdfMake.createPdf(docDefinition).download();
}

export default printDoc;
