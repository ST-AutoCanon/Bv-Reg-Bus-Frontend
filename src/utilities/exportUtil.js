import { saveAs } from "file-saver";
import { Packer } from "docx";

function exportDoc(document,fileName){
    Packer.toBlob(document).then((blob) => {
        console.log(blob);
        saveAs(blob, fileName);
        console.log("Document created successfully");
      });
}

export default exportDoc;