import { saveAs } from "file-saver";
import { Packer } from "docx";

async function exportDoc(document, fileName) {
  try {
    const blob = await Packer.toBlob(document);

    saveAs(blob, fileName);

    console.log("Document created successfully");

    return blob;
  } catch (error) {
    console.error("Document generation failed:", error);
    throw error;
  }
}

export default exportDoc;