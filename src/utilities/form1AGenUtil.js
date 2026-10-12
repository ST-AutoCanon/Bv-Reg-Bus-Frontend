import exportDoc from './exportUtil';
import { populateMultiSupData, tyresList, dStrapRows, handholdStrap3wheeler_Rows } from './form1ADataGenerator';
import { Document, Header, Paragraph, TextRun, AlignmentType, Table, TableRow, TableCell, ImageRun, WidthType, Footer, PageNumber } from "docx";
let foot;
let vehicle_Type;
let multiSupplierDataList = [];
let form1ATable1RowsList = [];
let form1ATable2RowsList = [];
let form1ATable3RowsList = [];
let docSealImage;
const prefixPattern = /^(M\/s\.?|m\/s\.?)\s*/i;
function normalizeMsPrefix(rowString) {
    return rowString
      .split("|")
      .map(part => {
        let trimmed = part.trim();
        if (!trimmed || trimmed.toLowerCase() === "na") return trimmed;
  
        if (prefixPattern.test(trimmed)) {
          const rest = trimmed.replace(prefixPattern, "").trim();
          return `M/s. ${rest}`;
        }
  
        return `M/s. ${trimmed}`;
      })
      .join(" | ");
  }
  function normalizeWithUnit(rowString, unit) {
    return String(rowString)
      .split("|")
      .map(part => {
        let trimmed = part.trim();
        if (!trimmed || trimmed.toLowerCase() === "na") return trimmed;
        return `${trimmed} ${unit}`;
      })
      .join(" | ");
  }
  
  const SQ_CM_MM = 'Square cm/mm';
  const KG = 'kg';
  const INCH_MM = 'Inch/mm';
  const KG_CM2_KPA_PSI = 'kg/cm² /kPa /psi';
  const V = 'V';
  const MM = 'mm';
  const MM_SQ = 'mm Sq';
  const CM_SQ = 'Cm Sq.';
  const PERCENT_OR_DEGREE = '% OR °(Degree)';
  const VOLTS = 'Volts';
  const RPM = 'RPM';
  const RPM_KM_H = 'RPM & Km/h';
  const KW = 'Kw';
  const KM = 'Km';
  const KM_H = 'Km/h';
  const AH = 'Ah';
  const KWH = 'kWh';
  const VOLTS_HERTZ = 'Volts & Hertz';
  const VOLTS_AMPS = 'Volts & Amps';
  const MINUTES_HOURS = 'Minutes/Hours';
  const AMPS = 'Amps';
  const MS = 'ms';
  const W_H_KM = 'W-H/Km';
  const DEGREES = 'Degrees';
function readList(itemsListName, form1Adata, footerData, tableNo = 1) {

    // if (dStrapRows) {
    //     vehicle_Type = 2;
    //     console.log('true it is two wheeler', dStrapRows)
    // } else {
    //     vehicle_Type = 3;
    //     console.log('false it is three wheeler', handholdStrap3wheeler_Rows)
    // }



//     const isTwoWheeler = !!dStrapRows;  // Truthy check for Two-Wheeler
// const isThreeWheeler = !!handholdStrap3wheeler_Rows;  // Truthy check for Three-Wheeler
const isTwoWheeler = dStrapRows && dStrapRows.toString().trim() !== "";
const isThreeWheeler = handholdStrap3wheeler_Rows && handholdStrap3wheeler_Rows.toString().trim() !== "";

if (isTwoWheeler && isThreeWheeler) {
    vehicle_Type = 3;  // If both are present, create table
    // console.log('If both are present, create table')
} else if (isTwoWheeler) {
    vehicle_Type = 2;  // Only Two-Wheeler, no table
    // console.log('Only Two-Wheeler, no table')
} else {
    vehicle_Type = 3;  // Either Three-Wheeler is present or both are absent, create table
    // console.log('3 Either Three-Wheeler is present or both are absent, create table')
}
    const dataOfFooterr = footerData.footerData.SealSign.properties;
    let imageUrl;


    //updated once
    const fileName = dataOfFooterr.Upload_Seal.file_name;
 imageUrl = `https://bv-reg.com/api/files/downloads/${fileName}`; 
    // console.log("Image loaded successfully:", fileName);
    
////

    // Fetch the image as a Blob
    fetch(imageUrl)
        .then(response => response.blob())
        .then(blob => {
            // Create a FileReader to convert the blob into Base64
            const reader = new FileReader();

            // Define the onload event handler for FileReader
            reader.onloadend = () => {
                const base64Data = reader.result; // This will be the Base64 encoded string

                // Log the Base64 encoded data
                //   console.log("Base64 Image Data:", base64Data);

                // Optionally, create an ImageRun object with the Base64 data
                docSealImage = new ImageRun({
                    data: base64Data, // Use the Base64 data here
                    transformation: {
                        width: 90,
                        height: 50,
                    }
                });

                //   console.log("ImageRun instance created:", docSealImage);
            };

            // Read the blob as a data URL (Base64)
            reader.readAsDataURL(blob);
        })
        .catch(error => {
            console.error("Error loading image:", error);
        });

    fetch(itemsListName).then(response => response.text()).then(responseText => {
        // console.log('dStrapRows:', dStrapRows);
        // console.log('handholdStrap3wheeler_Rows:', handholdStrap3wheeler_Rows);
        if (responseText) {
            const lines = responseText.split("\n");
            if (lines && lines.length > 0) {
                generateRows(lines, tableNo, itemsListName, form1Adata);
                if (itemsListName.indexOf("_List1") > 0) {
                    readList('./Form1A_List2.csv', form1Adata, footerData, tableNo);
                }
                else if (itemsListName.indexOf("_List2") > 0) {
                    readList('./Form1A_List3.csv', form1Adata, footerData, 2);
                }
                else if (itemsListName.indexOf("_List3") > 0) {
                    readList('./Form1A_List4.csv', form1Adata, footerData, 3);
                }
                else if (itemsListName.indexOf("_List4") > 0) {
                    readList('./Form1A_List5.csv', form1Adata, footerData, 3);
                }
                else {
                    fillAndDownload(form1Adata, footerData);
                }
            }
        }
    })
}

function generateRows(lines, tableNo = 1, itemsListName = "List", form1Adata) {
   

    // Initialize lists for Front_Tyre  
    let frontTyreLadenList = [];
    let frontTyreUnladenDriverList = [];
    let frontTyreWheelCombSizeList = [];
    let frontTyreMinSpeedCategoryList = [];
    let frontTyreMinLoadCapIndexList = [];
    let frontTyreCategCompatibleList = [];

    // Initialize lists for Rear_Tyre
    let rearTyreLadenList = [];
    let rearTyreUnladenDriverList = [];
    let rearTyreWheelCombSizeList = [];
    let rearTyreMinSpeedCategoryList = [];
    let rearTyreMinLoadCapIndexList = [];
    let rearTyreCategCompatibleList = [];
    // Initialize lists for Any_other_Tyre
    let anyOtherTyreLadenList = [];
    let anyOtherTyreUnladenDriverList = [];
    let anyOtherTyreWheelCombSizeList = [];
    let anyOtherTyreMinSpeedCategoryList = [];
    let anyOtherTyreMinLoadCapIndexList = [];
    let anyOtherTyreCategCompatibleList = [];

    // Updated code: Mapping Front Tyre,Rear Tyre,Any other Tyre data and pushing to table
    tyresList && tyresList.map(vehTyre => {
        if (vehTyre?.supplier?.active === true) {
            const supplierName = vehTyre.supplier.nameOfSupplier;

            // Front Tyre
            frontTyreLadenList.push({
                supplier: supplierName,
                value: vehTyre?.Front_Tyre?.properties?.Variant?.value
            });
            frontTyreUnladenDriverList.push({
                supplier: supplierName,
                value: vehTyre?.Front_Tyre?.properties?.Type?.value
            });
            frontTyreWheelCombSizeList.push({
                supplier: supplierName,
                value: vehTyre?.Front_Tyre?.properties?.Size?.value
            });
            frontTyreMinSpeedCategoryList.push({
                supplier: supplierName,
                value: vehTyre?.Front_Tyre?.properties?.Make?.value
            });
            frontTyreMinLoadCapIndexList.push({
                supplier: supplierName,
                value: vehTyre?.Front_Tyre?.properties?.TAC?.value
            });
            frontTyreCategCompatibleList.push({
                supplier: supplierName,
                value: vehTyre?.Front_Tyre?.properties?.Dynamic_rolling?.value
            });
            // Rear Tyre
            rearTyreLadenList.push({
                supplier: supplierName,
                value: vehTyre?.Rear_Tyre?.properties?.Variant?.value || ""
            });
            rearTyreUnladenDriverList.push({
                supplier: supplierName,
                value: vehTyre?.Rear_Tyre?.properties?.Type?.value || ""
            });
            rearTyreWheelCombSizeList.push({
                supplier: supplierName,
                value: vehTyre?.Rear_Tyre?.properties?.Size?.value || ""
            });
            rearTyreMinSpeedCategoryList.push({
                supplier: supplierName,
                value: vehTyre?.Rear_Tyre?.properties?.Make?.value || ""
            });
            rearTyreMinLoadCapIndexList.push({
                supplier: supplierName,
                value: vehTyre?.Rear_Tyre?.properties?.TAC?.value || ""
            });
            rearTyreCategCompatibleList.push({
                supplier: supplierName,
                value: vehTyre?.Rear_Tyre?.properties?.Dynamic_rolling?.value || ""
            });
            // Any Other Tyre
            anyOtherTyreLadenList.push({
                supplier: supplierName,
                value: vehTyre?.Any_other_Tyre?.properties?.Variant?.value || ""
            });
            anyOtherTyreUnladenDriverList.push({
                supplier: supplierName,
                value: vehTyre?.Any_other_Tyre?.properties?.Type?.value || ""
            });
            anyOtherTyreWheelCombSizeList.push({
                supplier: supplierName,
                value: vehTyre?.Any_other_Tyre?.properties?.Size?.value || ""
            });
            anyOtherTyreMinSpeedCategoryList.push({
                supplier: supplierName,
                value: vehTyre?.Any_other_Tyre?.properties?.Make?.value || ""
            });
            anyOtherTyreMinLoadCapIndexList.push({
                supplier: supplierName,
                value: vehTyre?.Any_other_Tyre?.properties?.TAC?.value || ""
            });
            anyOtherTyreCategCompatibleList.push({
                supplier: supplierName,
                value: vehTyre?.Any_other_Tyre?.properties?.Dynamic_rolling?.value || ""
            });
        }
    });
    let frontTyreLadenRows = generateTableData(frontTyreLadenList);
    let frontTyreUnladenDriverRows = generateTableData(frontTyreUnladenDriverList);
    let frontTyreWheelCombSizeRows = generateTableData(frontTyreWheelCombSizeList);
    // let frontTyreWheelCombSizeRows = normalizeWithUnit(frontTyreWheelCombSizeRows1, INCH_MM);
    let frontTyreMinSpeedCategoryRows = generateTableData(frontTyreMinSpeedCategoryList);
    const updatedfrontTyreMinSpeedCategoryRows = normalizeMsPrefix(frontTyreMinSpeedCategoryRows);
    let frontTyreMinLoadCapIndexRows = generateTableData(frontTyreMinLoadCapIndexList);
    let frontTyreCategCompatibleRows1 = generateTableData(frontTyreCategCompatibleList);
    let frontTyreCategCompatibleRows = normalizeWithUnit(frontTyreCategCompatibleRows1, MM);

    let rearTyreLadenRows = generateTableData(rearTyreLadenList);
    let rearTyreUnladenDriverRows = generateTableData(rearTyreUnladenDriverList);
    let rearTyreWheelCombSizeRows = generateTableData(rearTyreWheelCombSizeList);
    // let rearTyreWheelCombSizeRows = normalizeWithUnit(rearTyreWheelCombSizeRows1, INCH_MM);
    let rearTyreMinSpeedCategoryRows = generateTableData(rearTyreMinSpeedCategoryList);
    const updatedrearTyreMinSpeedCategoryRows = normalizeMsPrefix(rearTyreMinSpeedCategoryRows);
    let rearTyreMinLoadCapIndexRows = generateTableData(rearTyreMinLoadCapIndexList);
    let rearTyreCategCompatibleRows1 = generateTableData(rearTyreCategCompatibleList);
    let rearTyreCategCompatibleRows = normalizeWithUnit(rearTyreCategCompatibleRows1, MM);

    let anyOtherTyreLadenRows = generateTableData(anyOtherTyreLadenList);
    let anyOtherTyreUnladenDriverRows = generateTableData(anyOtherTyreUnladenDriverList);
    let anyOtherTyreWheelCombSizeRows = generateTableData(anyOtherTyreWheelCombSizeList);
    // let anyOtherTyreWheelCombSizeRows = normalizeWithUnit(anyOtherTyreWheelCombSizeRows1, INCH_MM);
    let anyOtherTyreMinSpeedCategoryRows = generateTableData(anyOtherTyreMinSpeedCategoryList);
    const updatedanyOtherTyreMinSpeedCategoryRows = normalizeMsPrefix(anyOtherTyreMinSpeedCategoryRows);
    let anyOtherTyreMinLoadCapIndexRows = generateTableData(anyOtherTyreMinLoadCapIndexList);
    let anyOtherTyreCategCompatibleRows1 = generateTableData(anyOtherTyreCategCompatibleList);
    let anyOtherTyreCategCompatibleRows = normalizeWithUnit(anyOtherTyreCategCompatibleRows1, MM);

    let styleName = "table1Header";

    
    if (itemsListName.indexOf("List2") > 0) {
        styleName = "paragrapgBold";
        const tyreVariantRow = new TableRow({
            children: [
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: "Tyre",
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                ),
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: "Variant / version"
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                ),
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: "Type"
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                ),
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: "Size designation with speed category symbol and load capacity index"
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                ),
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: "Make (s)"
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                ),
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: "Type Approval Number or BIS license number or identification"
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                ),
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: "Dynamic"
                                        }),
                                        new TextRun({
                                            break: 1,
                                            text: "Rolling"
                                        }),
                                        new TextRun({
                                            break: 1,
                                            text: "Radius"
                                        }),
                                    ]
                                }
                            )
                        ]
                    }
                )
            ]
        });
        form1ATable1RowsList.push(tyreVariantRow);
        // Updated code: Mapping Front Tyre data and pushing to table

        const tyreVariantRow1 = new TableRow({
            children: [
                new TableCell({
                    width: {
                        size: 1000,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "TableBoldTitle",
                            children: [
                                new TextRun({
                                    text: "Front"
                                })
                            ]
                        })
                    ]
                }),
                new TableCell({
                    width: {
                        size: 1000,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [
                                new TextRun({
                                    text: frontTyreLadenRows
                                })
                            ]
                        })
                    ]
                }),

                new TableCell({
                    width: {
                        size: 1000,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [
                                new TextRun({
                                    text: frontTyreUnladenDriverRows
                                })
                            ]
                        })
                    ]
                }),
                new TableCell({
                    width: {
                        size: 1000,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [
                                new TextRun({
                                    text: frontTyreWheelCombSizeRows
                                })
                            ]
                        })
                    ]
                }),
                new TableCell({
                    width: {
                        size: 1000,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [
                                new TextRun({
                                    text: updatedfrontTyreMinSpeedCategoryRows
                                })
                            ]
                        })
                    ]
                }),
                new TableCell({
                    width: {
                        size: 1000,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [
                                new TextRun({
                                    text: frontTyreMinLoadCapIndexRows
                                })
                            ]
                        })
                    ]
                }),

                new TableCell({
                    width: {
                        size: 1000,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [
                                new TextRun({
                                    text: frontTyreCategCompatibleRows
                                })
                            ]
                        })
                    ]
                }),
            ]
        });

    
        const tyreVariantRow2 = new TableRow({
            children: [
                new TableCell({
                    width: {
                        size: 1000,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "TableBoldTitle",
                            children: [
                                new TextRun({
                                    text: "Rear"
                                })
                            ]
                        })
                    ]
                }),
                new TableCell({
                    width: {
                        size: 1000,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [
                                new TextRun({
                                    text: rearTyreLadenRows
                                })
                            ]
                        })
                    ]
                }),

                new TableCell({
                    width: {
                        size: 1000,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [
                                new TextRun({
                                    text: rearTyreUnladenDriverRows
                                })
                            ]
                        })
                    ]
                }),
                new TableCell({
                    width: {
                        size: 1000,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [
                                new TextRun({
                                    text: rearTyreWheelCombSizeRows
                                })
                            ]
                        })
                    ]
                }),
                new TableCell({
                    width: {
                        size: 1000,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [
                                new TextRun({
                                    text: updatedrearTyreMinSpeedCategoryRows
                                })
                            ]
                        })
                    ]
                }),
                new TableCell({
                    width: {
                        size: 1000,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [
                                new TextRun({
                                    text: rearTyreMinLoadCapIndexRows
                                })
                            ]
                        })
                    ]
                }),

                new TableCell({
                    width: {
                        size: 1000,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [
                                new TextRun({
                                    text: rearTyreCategCompatibleRows
                                })
                            ]
                        })
                    ]
                }),
            ]
        });
    
        const tyreVariantRow3 = new TableRow({
            children: [
                new TableCell({
                    width: {
                        size: 1000,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "TableBoldTitle",
                            children: [
                                new TextRun({
                                    text: "Any Other"
                                })
                            ]
                        })
                    ]
                }),
                new TableCell({
                    width: {
                        size: 1000,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [
                                new TextRun({
                                    text: anyOtherTyreLadenRows
                                })
                            ]
                        })
                    ]
                }),

                new TableCell({
                    width: {
                        size: 1000,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [
                                new TextRun({
                                    text: anyOtherTyreUnladenDriverRows
                                })
                            ]
                        })
                    ]
                }),
                new TableCell({
                    width: {
                        size: 1000,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [
                                new TextRun({
                                    text: anyOtherTyreWheelCombSizeRows
                                })
                            ]
                        })
                    ]
                }),
                new TableCell({
                    width: {
                        size: 1000,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [
                                new TextRun({
                                    text: updatedanyOtherTyreMinSpeedCategoryRows
                                })
                            ]
                        })
                    ]
                }),
                new TableCell({
                    width: {
                        size: 1000,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [
                                new TextRun({
                                    text: anyOtherTyreMinLoadCapIndexRows
                                })
                            ]
                        })
                    ]
                }),

                new TableCell({
                    width: {
                        size: 1000,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [
                                new TextRun({
                                    text: anyOtherTyreCategCompatibleRows
                                })
                            ]
                        })
                    ]
                }),
            ]
        });

        form1ATable1RowsList.push(tyreVariantRow1);
        form1ATable1RowsList.push(tyreVariantRow2);
        form1ATable1RowsList.push(tyreVariantRow3);


    }
    if (tableNo === 3 && itemsListName.indexOf("List5") >= 0) {
        const rowOfSeat = new TableRow({
            children: [
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: "",
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                ),
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: "Row of Seat"
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                ),
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: "Location*"
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                ),
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: "Type of seat belt"
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                ),
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: "Variant"
                                        }),
                                        new TextRun({
                                            text: "(if applicable)",
                                            break: 1
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                ),
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: "Belt adjustment device for height"
                                        }),
                                        new TextRun({
                                            text: "(indicate Yes/No/optional)",
                                            break: 1
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                )
            ]
        });
        form1ATable3RowsList.push(rowOfSeat);

        const firstRowL = new TableRow({
            children: [
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: "",
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                ),
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: "First row of seats"
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                ),
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: "L"
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                ),
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: ""
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                ),
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: ""
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                ),
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: ""
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                )
            ]
        });
        form1ATable3RowsList.push(firstRowL);

        const firstRowC = new TableRow({
            children: [
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: "",
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                ),
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: ""
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                ),
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: "C"
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                ),
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: ""
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                ),
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: ""
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                ),
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: ""
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                )
            ]
        });
        form1ATable3RowsList.push(firstRowC);

        const firstRowR = new TableRow({
            children: [
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: "",
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                ),
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: ""
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                ),
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: "R"
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                ),
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: ""
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                ),
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: ""
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                ),
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: ""
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                )
            ]
        });
        form1ATable3RowsList.push(firstRowR);

        const secondRowL = new TableRow({
            children: [
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: "",
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                ),
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: "Second row of seats"
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                ),
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: "L"
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                ),
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: ""
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                ),
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: ""
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                ),
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: ""
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                )
            ]
        });
        form1ATable3RowsList.push(secondRowL);

        const secondRowC = new TableRow({
            children: [
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: "",
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                ),
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: ""
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                ),
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: "C"
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                ),
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: ""
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                ),
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: ""
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                ),
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: ""
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                )
            ]
        });
        form1ATable3RowsList.push(secondRowC);

        const secondRowR = new TableRow({
            children: [
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: "",
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                ),
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: ""
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                ),
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: "R"
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                ),
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: ""
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                ),
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: ""
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                ),
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: ""
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                )
            ]
        });
        form1ATable3RowsList.push(secondRowR);

        const rowSeatInfo = new TableRow({
            children: [
                new TableCell(
                    {
                        width: {
                            size: 1000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: "",
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                ),
                new TableCell(
                    {
                        width: {
                            size: 5000,
                            type: WidthType.DXA
                        },
                        columnSpan: 5,
                        children: [
                            new Paragraph(
                                {
                                    style: styleName,
                                    children: [
                                        new TextRun({
                                            text: "The table may be extended as necessary for vehicles with more than two rows of seats there are more than three seats across the width of the vehicle."
                                        }),
                                        new TextRun({
                                            break: 1,
                                            text: "*(L = left-hand side, R= right-hand side, C = centre)"
                                        })
                                    ]
                                }
                            )
                        ]
                    }
                )
            ]
        });
        form1ATable3RowsList.push(rowSeatInfo);
    }
    lines.map(currentLine => {
        const lineItems = currentLine.split(",");
        styleName = "table1Header";
        if (lineItems[2] && lineItems[2].replace("\r", "") === "TRUE") {
            styleName = "paragrapgBold";
        }
        const rowKey = itemsListName.replace("./Form1A_", "").replace(".csv", "");
        let currentRow;
        const rowData = getRowData(rowKey, lineItems[0]);
        if (tableNo < 3) {
            currentRow = new TableRow({
                children: [
                    new TableCell(
                        {
                            width: {
                                size: 1000,
                                type: WidthType.DXA
                            },
                            children: [
                                new Paragraph(
                                    {
                                        style: styleName,
                                        children: [
                                            new TextRun({
                                                text: lineItems[0],
                                            })
                                        ]
                                    }
                                )
                            ]
                        }
                    ),
                    new TableCell(
                        {
                            columnSpan: 4,
                            width: {
                                size: 5000,
                                type: WidthType.DXA
                            },
                            children: [
                                new Paragraph(
                                    {
                                        style: styleName,
                                        children: [
                                            new TextRun({
                                                text: lineItems[1]
                                            })
                                        ]
                                    }
                                )
                            ]
                        }
                    ),
                    // new TableCell(
                    //     {
                    //         columnSpan: 2,
                    //         width: {
                    //             size: 5000,
                    //             type: WidthType.DXA
                    //         },
                    //         children: [
                    //             new Table(
                    //                 {
                    //                     columnWidths: [500, 500],
                    //                     rows: rowData
                    //                 }
                    //             )
                    //         ]
                    //     }
                    // )

                    new TableCell({
                        columnSpan: 2,
                        width: {
                            size: 5000,
                            type: WidthType.DXA
                        },
                        children: [
                            new Paragraph({
                                style: "TableRowContent",
                                children: [
                                    new TextRun({
                                        text: rowData
                                    })
                                ]
                            })
                        ]
                    }),
                ]
            });
        }
        else {
            currentRow = new TableRow({
                children: [
                    new TableCell(
                        {
                            width: {
                                size: 1000,
                                type: WidthType.DXA
                            },
                            children: [
                                new Paragraph(
                                    {
                                        style: styleName,
                                        children: [
                                            new TextRun({
                                                text: lineItems[0],
                                            })
                                        ]
                                    }
                                )
                            ]
                        }
                    ),
                    new TableCell(
                        {
                            columnSpan: 2,
                            width: {
                                size: 5000,
                                type: WidthType.DXA
                            },
                            children: [
                                new Paragraph(
                                    {
                                        style: styleName,
                                        children: [
                                            new TextRun({
                                                text: lineItems[1]
                                            })
                                        ]
                                    }
                                )
                            ]
                        }
                    ),
                    new TableCell(
                        {
                            columnSpan: 2,
                            width: {
                                size: 5000,
                                type: WidthType.DXA
                            },
                            children: [
                                new Table(
                                    {
                                        columnWidths: [500, 500],
                                        rows: rowData
                                    }
                                )
                            ]
                        }
                    ),
                    new TableCell(
                        {
                            width: {
                                size: 5000,
                                type: WidthType.DXA
                            },
                            children: [
                                new Paragraph(
                                    {
                                        style: styleName,
                                        children: [
                                            new TextRun({
                                                text: ""
                                            })
                                        ]
                                    }
                                )
                            ]
                        }
                    )
                ]
            });
        }
        if (tableNo === 1) {
            form1ATable1RowsList.push(currentRow);
        }
        else if (tableNo === 2) {
            form1ATable2RowsList.push(currentRow);
        }
        else if (tableNo === 3) {
            form1ATable3RowsList.push(currentRow);
        }
    })
}

function getRowData(listName, serialNo = "") {
    let targetData = [];
    const currentRowKey = listName + "_" + serialNo.replaceAll(".", "");
    const itemsList = multiSupplierDataList.filter(supData => {
        return supData.rowKey === currentRowKey;
    });
    if (itemsList && itemsList.length > 0) {
        targetData = itemsList[0].value;
    }
    return targetData;
}

function generateForm1A(form1Adata, footerData) {
    foot = footerData;

    const headerRow = new TableRow({
        children: [
            new TableCell(
                {
                    width: {
                        size: 1000,
                        type: WidthType.DXA
                    },
                    columnSpan: 7,
                    children: [
                        new Paragraph(
                            {
                                style: "paragrapgBold",
                                children: [
                                    new TextRun({
                                        text: "COMMON INFORMATION RELATED TO L1, L2, L5 and L7 CATEGORY BATTERY OPERATED VEHICLES",
                                    }),
                                    new TextRun({
                                        break: 1,
                                        text: "(2 AND 3 WHEELERS including Quadricycle)"
                                    })
                                ],
                                alignment: AlignmentType.CENTER
                            }
                        )
                    ]
                }
            )
        ]
    });
    form1ATable1RowsList=[];
    form1ATable1RowsList.push(headerRow);

    const headerRowTable2 = new TableRow({
        children: [
            new TableCell(
                {
                    width: {
                        size: 1000,
                        type: WidthType.DXA
                    },
                    columnSpan: 7,
                    children: [
                        new Paragraph(
                            {
                                style: "paragrapgBold",
                                children: [
                                    new TextRun({
                                        text: "INFORMATION RELATING SOLELY TO L5 CATEGORY BATTERY OPERATED VEHICLES",
                                    })
                                ],
                                alignment: AlignmentType.CENTER
                            }
                        )
                    ]
                }
            )
        ]
    });
    form1ATable2RowsList=[];
    form1ATable2RowsList.push(headerRowTable2);
    // if (dStrapRows && dStrapRows.length > 0) {
    // if (
    //     !(
    //         (Array.isArray(dStrapRows) && dStrapRows.length > 0) && // dStrapRows is present
    //         !(Array.isArray(handholdStrap3wheeler_Rows) && handholdStrap3wheeler_Rows.length > 0) // handholdStrap3wheeler_Rows is NOT present
    //     )
    // ) {
    const headerRowTable3 = new TableRow({
        children: [
            new TableCell(
                {
                    width: {
                        size: 1000,
                        type: WidthType.DXA
                    },
                    columnSpan: 7,
                    children: [
                        new Paragraph(
                            {
                                style: "paragrapgBold",
                                children: [
                                    new TextRun({
                                        text: "INFORMATION RELATING SOLELY TO L7 CATEGORY BATTERY OPERATED VEHICLES",
                                    })
                                ],
                                alignment: AlignmentType.CENTER
                            }
                        )
                    ]
                }
            )
        ]
    });
    form1ATable3RowsList=[];
    form1ATable3RowsList.push(headerRowTable3);
    // }
    multiSupplierDataList = populateMultiSupData(form1Adata);
    readList('./Form1A_List1.csv', form1Adata, footerData);
}

function fillAndDownload(form1Adata, footerData) {
    const dataOfFooter = footerData.footerData.footer.properties;
    let homologation_Engg_Name = dataOfFooter.Homologation_Engineer_Name.value;
    if (typeof homologation_Engg_Name === 'string' && homologation_Engg_Name.trim().length > 0) {
        let trimmedName = homologation_Engg_Name.trim();
        homologation_Engg_Name = `Mr/Mrs. ${trimmedName[0].toUpperCase()}${trimmedName.slice(1)}`;
      }
      // Manufacturer Name
let manufacturer_Name = dataOfFooter.Manufacture_Name.value;
if (typeof manufacturer_Name === 'string' && manufacturer_Name.trim().length > 0) {
    let trimmedManu = manufacturer_Name.trim();
    manufacturer_Name = `M/s. ${trimmedManu[0].toUpperCase()}${trimmedManu.slice(1)}`;
}
 const today = new Date();
const formattedDate = today.toLocaleDateString("en-GB");
    const form1ADocument = new Document({
        styles: {
            paragraphStyles: [
                {
                    id: "table1Header",
                    name: "table1Header",
                    basedOn: "Normal",
                    run: {
                        size: "12pt",
                    },
                    paragraph: {
                        size: "12pt",
                        indent: {
                            left: "0.2cm"
                        }
                    }
                },
                {
                    id: "paragrapgBold",
                    name: "paragrapgBold",
                    basedOn: "Normal",
                    run: {
                        bold: true,
                        size: "12pt"
                    }
                },
                {
                    id: "redColorText",
                    name: "redColorText",
                    basedOn: "Normal",
                    run: {
                        color: "#880808",
                        size: "11pt",
                        font: "Calibri",
                        bold: true
                    }
                }
            ]
        },
        numbering: {
            config: [
                {
                    reference: "my-crazy-numbering",
                    levels: [
                        {
                            level: 0,
                            format: "decimal",
                            text: "%1",
                            alignment: AlignmentType.START,
                            style: {
                                paragraph: {
                                    indent: { left: 720, hanging: 260 },
                                    spacing: {

                                    }
                                },
                            },
                        }
                    ],
                },
            ],
        },
        sections: [
            {
                headers: {
                    default: new Header({
                        children: [
                            new Paragraph(
                                {
                                    children: [
                                        new TextRun(
                                            {
                                                text: "Table 1A of AIS-007 (Revision 5)",
                                                bold: true,
                                                size: "18pt"
                                            }
                                        )
                                    ],
                                    alignment: AlignmentType.CENTER
                                }
                            ),
                        ],
                    })
                },
                children: [
                    new Paragraph({
                        children: [
                            new TextRun(
                                {
                                    text: "DETAILED TECHNICAL SPECIFICATIONS",
                                    bold: true,
                                    size: "12pt"
                                }
                            )
                        ],
                        alignment: AlignmentType.CENTER
                    }),
                    new Paragraph("\n\n"),
                    new Table(
                        {
                            columnWidths: [7000, 3000],
                            rows: form1ATable1RowsList,
                            size: "12pt"
                        }
                    ),
                    new Paragraph("\n\n"),
                    // new Table(
                    //     {
                    //         columnWidths: [7000, 3000],
                    //         rows: form1ATable2RowsList,
                    //         size: "12pt"
                    //     }
                    // ),

                      ...(vehicle_Type === 3
                        ? [
                            new Table({
                                columnWidths: [7000, 3000],
                                rows: form1ATable2RowsList,
                                size: "12pt",
                            }),
                        ]
                        : []),
                        
                    new Paragraph("\n\n"),
                    new Paragraph({
                        children: [
                            new TextRun(
                                {
                                    text: "Footnotes: -",
                                    bold: true,
                                    size: "12pt"
                                }
                            )
                        ]
                    }),
                    new Paragraph("\n\n"),
                    new Paragraph({
                        text: "State as appropriate",
                        numbering: {
                            reference: "my-crazy-numbering",
                            level: 0
                        }
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "Where a device has been component type-approved, the description may be replaced by a reference to that component type-approval. Likewise, no description is needed where a component's structure is clear from the diagrams or drawings attached to the certificate. State the numbers of the corresponding Annexes for each heading where photographs and drawings must be attached."
                            }),
                            new TextRun({
                                break: 1,
                                text: "Where used, means of identification may appear only on vehicles, separate technical units or components falling within the scope of the AIS / IS governing components type-approval."
                            }),
                        ],
                        numbering: {
                            reference: "my-crazy-numbering",
                            level: 0
                        }
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "Classification in accordance with AIS-053."
                            })
                        ],
                        numbering: {
                            reference: "my-crazy-numbering",
                            level: 0
                        }
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "Maximum payload declared by the manufacturer: - load obtained by subtracting the weight defined in 2.2, from the mass defined in 2.3."
                            })
                        ],
                        numbering: {
                            reference: "my-crazy-numbering",
                            level: 0
                        }
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "The mass of the rider is taken to be a round figure of 75 kg."
                            })
                        ],
                        numbering: {
                            reference: "my-crazy-numbering",
                            level: 0
                        }
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "This figure should be to the nearest tenth of a millimeter."
                            })
                        ],
                        numbering: {
                            reference: "my-crazy-numbering",
                            level: 0
                        }
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "This value should be calculated with pi = 3,1416 to the nearest cmX3"
                            })
                        ],
                        numbering: {
                            reference: "my-crazy-numbering",
                            level: 0
                        }
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "The information requested should be supplied for a possible variant."
                            })
                        ],
                        numbering: {
                            reference: "my-crazy-numbering",
                            level: 0
                        }
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "A tolerance of 5 % is permitted provided that the limit values pursuant to AIS-017 are not exceeded."
                            })
                        ],
                        numbering: {
                            reference: "my-crazy-numbering",
                            level: 0
                        }
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "Where unconventional engines and systems are fitted, information equivalent to that referred under this heading must be supplied by their manufacturer."
                            })
                        ],
                        numbering: {
                            reference: "my-crazy-numbering",
                            level: 0
                        }
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "In case of CNG / LPG vehicles the additional details in Table 21 format shall be applicable. In case BOV, additional details as per table 13 shall be applicable"
                            })
                        ],
                        numbering: {
                            reference: "my-crazy-numbering",
                            level: 0
                        }
                    }),



                    new Paragraph("\n\n"),
                   
                  
                 ],
               
               
                
    
                footers: {
                    default: new Footer({
                        children: [
                            new Table({
                                width: {
                                    size: 9025,
                                    type: WidthType.DXA
                                },
                                rows: [
                                    new TableRow({
                                        children: [
                                            new TableCell({
                                                width: {
                                                    size: 3000,
                                                    WidthType: WidthType.DXA
                                                },
                                                children: [
                                                    new Paragraph({
                                                        style: "redColorText",
                                                        children: [
                                                            new TextRun({
                                                                text: "Manufacturer :" + manufacturer_Name,
                                                                font: "Times New Roman",
                                                                color: "#B22222" // Light Red color

                                                            })
                                                        ]
                                                    })
                                                ]
                                            }),

                                            new TableCell({
                                                width: {
                                                    size: 3025,
                                                    WidthType: WidthType.DXA
                                                },
                                                children: [
                                                    new Paragraph({
                                                        style: "redColorText",
                                                        children: [
                                                            new TextRun({
                                                                text: "Sheet No : ",
                                                                font: "Times New Roman",
                                                                color: "#B22222" // Light Red color
                                                            })
                                                        ]
                                                    })
                                                ]
                                            }),
                                            new TableCell({
                                                width: {
                                                    size: 3000,
                                                    WidthType: WidthType.DXA
                                                },
                                                children: [
                                                    new Paragraph({
                                                        style: "redColorText",
                                                        children: [
                                                            new TextRun({
                                                                text: "Test Agency : ",
                                                                font: "Times New Roman",
                                                                color: "#B22222" // Light Red color
                                                            })
                                                        ]
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableRow({
                                        children: [
                                            new TableCell({

                                                width: {
                                                    size: 3000,
                                                    type: WidthType.DXA
                                                },
                                                children: [
                                                    new Paragraph({
                                                        style: "redColorText",
                                                        children: [docSealImage],

                                                        alignment: AlignmentType.CENTER
                                                    })
                                                ]
                                            }),
                                            new TableCell({

                                                width: {
                                                    size: 3025,
                                                    WidthType: WidthType.DXA
                                                },
                                                children: [
                                                    new Paragraph({
                                                        style: "redColorText",
                                                        children: [
                                                            new TextRun({
                                                                text: "Document No: " + dataOfFooter.Document_No.value,
                                                                font: "Times New Roman",
                                                                color: "#B22222" // Light Red color
                                                            }),
                                                        ]
                                                    })
                                                ]
                                            }),
                                            new TableCell({

                                                width: {
                                                    size: 3000,
                                                    WidthType: WidthType.DXA
                                                },
                                                children: [
                                                    new Paragraph({
                                                        style: "redColorText",
                                                        children: [
                                                            new TextRun({
                                                                text: ""
                                                            })
                                                        ]
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableRow({
                                        children: [
                                            new TableCell({
                                                width: {
                                                    size: 3000,
                                                    WidthType: WidthType.DXA
                                                },
                                                children: [
                                                    new Paragraph({
                                                        style: "redColorText",
                                                        children: [
                                                            new TextRun({
                                                                // text: "Name: " + dataOfFooter.Homologation_Engineer_Name.value,
                                                                text: "Name: " + homologation_Engg_Name,
                                                                font: "Times New Roman",
                                                                color: "#B22222" // Light Red color
                                                            }),
                                                            new TextRun({
                                                                text: "Designation:" + dataOfFooter.Engineer_Designation.value,
                                                                font: "Times New Roman",
                                                                color: "#B22222", // Light Red color
                                                                break: 1
                                                            })
                                                        ]
                                                    })
                                                ]
                                            }),
                                            new TableCell({
                                                width: {
                                                    size: 3025,
                                                    WidthType: WidthType.DXA
                                                },
                                                children: [
                                                    new Paragraph({
                                                        style: "redColorText",
                                                        children: [
                                                            new TextRun({
                                                                // text: "Date : ",
                                                               text: `Date : ${formattedDate}`,
                                                                font: "Times New Roman",
                                                                color: "#B22222" // Light Red color
                                                            })
                                                        ]
                                                    })
                                                ]
                                            }),
                                            new TableCell({
                                                width: {
                                                    size: 3000,
                                                    WidthType: WidthType.DXA
                                                },
                                                children: [
                                                    new Paragraph({
                                                        style: "redColorText",
                                                        children: [
                                                            new TextRun({
                                                                text: "Name: ",
                                                                font: "Times New Roman",
                                                                color: "#B22222", // Light Red color
                                                            }),
                                                            new TextRun({
                                                                text: "Designation: ",
                                                                font: "Times New Roman",
                                                                color: "#B22222", // Light Red color
                                                                break: 1
                                                            })
                                                        ]
                                                    })
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        children: ["Page | ", PageNumber.CURRENT],
                                        font: "Times New Roman",
                                        style: {
                                            color: "#B22222", // Firebrick red 
                                        },
                                    })
                                ],
                                alignment: AlignmentType.RIGHT
                            })
                        ]
                    })
                }

            }
        ]
    })
    exportDoc(form1ADocument, "form1ADocument.docx");
};

function generateTableData(dataList) {
    if (Array.isArray(dataList) && dataList.length > 0) {
        // Extract 'Wheel_rim_size' or 'value' from each wheelRim
        const values = dataList.map(wheelRim =>
            wheelRim?.Wheel_Rim_Size?.properties?.Wheel_rim_size?.value ||
            wheelRim?.value ||
            ""
        );

        if (values.length > 1) {
            return values.join(" | ");
        } else {
            return values[0] || ""; // Return the single value if there's only one
        }
    } else {
        return ""; // Return an empty string if no data is available
    }
}




// export default generateForm1A;
export { generateForm1A, foot };
