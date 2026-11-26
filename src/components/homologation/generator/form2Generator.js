
import PizZip from "pizzip";
import Papa from "papaparse";
import { Center } from "@chakra-ui/react";

const CSV_URL = `${process.env.PUBLIC_URL || ""}/template/Table2.csv`;

const normalize = (value = "") =>
  String(value).replace(/\s+/g, "").toLowerCase();

const escapeXml = (value = "") =>
  String(value)
    // Remove XML-invalid control characters
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");


const FIELD_KEY_MAP = {
  // Manufacturer details: md-1
  manufacturerNameAndAddress: ["md-1", "nameaddressmanufacture"],
  manufacturerTelephoneNo: ["md-1", "telephoneno"],
  manufacturerEmailAddress: ["md-1", "emailAddress"],
  authorizedPersonNameAndContactDetails: ["md-1", "contactPerson"],
  modelAndVariants: ["md-1", "nameOfModelAndVariants"],
  baseFuelTypeAndBlendLevel: ["md-1", "baseFuelType"],

  // Manufacturing plant details: mpd-1
  plantsOfManufacture: ["mpd-1", "plantsOfManufacture"],
  vehicleManufacturingPlantNameAndAddress: [
    "mpd-1",
    "vehicleManufacturingPlant",
  ],
  engineManufacturingPlantNameAndAddress: [
    "mpd-1",
    "engineManufacturingPlant",
  ],
  importerNameAndAddress: ["mpd-1", "importerNameAndAddress"],
  importerTelephoneNo: ["mpd-1", "telephoneno"],
  importerEmailAddress: ["mpd-1", "emailAddress"],
  importerContactPerson: ["mpd-1", "contactPerson"],

  // Vehicle details: vbd-1
  vehicleType: ["vbd-1", "vehicleType"],
  typeOfVehicle: ["vbd-1", "typeOfVehicle"],
  vehicleUsage: ["vbd-1", "usage"],
  vehicleControl: ["vbd-1", "control"],
  vehicleDrive: ["vbd-1", "drive"],
  cabType: ["vbd-1", "cabType"],
  loadBody: ["vbd-1", "loadBody"],
  vehicleCategoryAsPerIS14272_2011: ["vbd-1", "vehicleCategory"],
  vehicleAvailableModes: ["vbd-1", "vehicleAvailableModes"],
  vehicleDefaultMode: ["vbd-1", "vehicleDefaultMode"],

  // Vehicle performance: vbd-1
  maxRecommendedGradeabilityDegrees: [
    "vbd-1",
    "maximumRecommendedGradeability",
  ],
  maxDesignSpeedKmph: ["vbd-1", "maximumDesignSpeed"],
  vehicleMaxSpeedUnladenKmph: ["vbd-1", "maximumSpeedUnladen"],
  vehicleMaxSpeedLadenKmph: ["vbd-1", "maximumSpeedLaden"],
  co2ReducingTechnologiesAvailable: [
    "vbd-1",
    "co2ReducingTechnologiesAvailable",
  ],

  // CO2 matrix
  regenerativeBraking: ["vbd-1", "regenerativeBraking"],
  startStopSystem: ["vbd-1", "startStopSystem"],
  tyrePressureMonitoringSystem: [
    "vbd-1",
    "tyrePressureMonitoringSystem",
  ],
  sixOrMoreSpeedTransmission: [
    "vbd-1",
    "sixOrMoreSpeedTransmission",
  ],
  anyOtherTechnologyDetails: ["vbd-1", "anyOtherTechnology"],

  // Vehicle class
  vehicleClass: ["vbd-1", "vehicleClass"],
};

const formatFieldValue = (value, fallback = "") => {
  if (value === null || value === undefined || value === "") {
    return String(fallback ?? "");
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
};

const getFieldValue = (data, key, fallback = "") => {
  if (!data || !key) {
    return String(fallback ?? "");
  }

  // 1. Check explicit subcategory mapping.
  const mappedField = FIELD_KEY_MAP[key];

  if (mappedField) {
    const [subCategoryId, fieldName] = mappedField;
    const value = data?.[subCategoryId]?.[fieldName];

    if (value !== undefined && value !== null && value !== "") {
      return formatFieldValue(value, fallback);
    }
  }

  // 2. Check direct top-level value.
  const directValue = data[key];

  if (
    directValue !== undefined &&
    directValue !== null &&
    directValue !== ""
  ) {
    return formatFieldValue(directValue, fallback);
  }

  // 3. Search other subcategory objects.
  // Exclude metadata such as _clauseNumbers.
  for (const [subCategoryId, subCategoryData] of Object.entries(data)) {
    if (
      subCategoryId.startsWith("_") ||
      !subCategoryData ||
      typeof subCategoryData !== "object" ||
      Array.isArray(subCategoryData)
    ) {
      continue;
    }

    const value = subCategoryData[key];

    if (value !== undefined && value !== null && value !== "") {
      return formatFieldValue(value, fallback);
    }
  }

  return String(fallback ?? "");
};

const getVariantValue = (data, key, variant, fallback = "") => {
  // Check explicit variant structure first.
  const mappedField = FIELD_KEY_MAP[key];

  if (mappedField) {
    const [subCategoryId, fieldName] = mappedField;

    const mappedVariantValue =
      data?.[subCategoryId]?.[variant]?.[fieldName];

    if (
      mappedVariantValue !== undefined &&
      mappedVariantValue !== null &&
      mappedVariantValue !== ""
    ) {
      return formatFieldValue(mappedVariantValue, fallback);
    }
  }

  const value =
    data?.[variant]?.[key] ??
    data?.[`${variant}_${key}`];

  if (value !== undefined && value !== null && value !== "") {
    return formatFieldValue(value, fallback);
  }

  // Base column uses the actual saved form field.
  if (variant === "base") {
    return getFieldValue(data, key, fallback);
  }

  return String(fallback ?? "");
};


// --------------------------------------------------
// MAIN HEADING
// --------------------------------------------------

const createMainHeading = (value, fontSize = 20) => `
  <w:p>
    <w:pPr>
      <w:jc w:val="center"/>
      <w:spacing w:before="60" w:after="60"/>
    </w:pPr>

    <w:r>
      <w:rPr>
  <w:rFonts
    w:ascii="Times New Roman"
    w:hAnsi="Times New Roman"
    w:eastAsia="Times New Roman"
    w:cs="Times New Roman"/>
  <w:b/>
  <w:sz w:val="24"/>
  <w:szCs w:val="24"/>
</w:rPr>

      <w:t xml:space="preserve">${escapeXml(value)}</w:t>
    </w:r>
  </w:p>
`;

const createMainHeadings = () => `
  ${createMainHeading(
    "Table 2 of AIS-007 (Revision 5)",
    24
  )}
`;

  

const createCell = (
  value,
  {
    bold = false,
    width = 2400,
    align = "left",
    gridSpan = 1,
  } = {}
) => `
  <w:tc>
    <w:tcPr>
      <w:tcW w:w="${width}" w:type="dxa"/>
      ${gridSpan > 1 ? `<w:gridSpan w:val="${gridSpan}"/>` : ""}
      <w:vAlign w:val="center"/>

      <w:tcMar>
        <w:top w:w="20" w:type="dxa"/>
<w:bottom w:w="20" w:type="dxa"/>
        <w:left w:w="90" w:type="dxa"/>
        <w:right w:w="90" w:type="dxa"/>
      </w:tcMar>
    </w:tcPr>

    <w:p>
      <w:pPr>
        <w:jc w:val="${align}"/>
        <w:spacing
  w:before="0"
  w:after="0"
  w:line="220"
  w:lineRule="auto"/>
      </w:pPr>

      <w:r>
        <w:rPr>
  <w:rFonts
    w:ascii="Times New Roman"
    w:hAnsi="Times New Roman"
    w:eastAsia="Times New Roman"
    w:cs="Times New Roman"/>
  ${bold ? "<w:b/>" : ""}
  <w:sz w:val="24"/>
  <w:szCs w:val="24"/>
</w:rPr>

        <w:t xml:space="preserve">${escapeXml(value ?? "")}</w:t>
      </w:r>
    </w:p>
  </w:tc>
`;

// --------------------------------------------------
// SUBHEADING ROW
// --------------------------------------------------

const createSubheadingRow = (
  value,
  columnCount,
  totalWidth = 9600
) => `
  <w:tr>
    <w:tc>
      <w:tcPr>
        <w:tcW w:w="${totalWidth}" w:type="dxa"/>
        <w:gridSpan w:val="${columnCount}"/>
        <w:vAlign w:val="center"/>
        <w:tcBorders>
          <w:top w:val="single" w:sz="6" w:color="000000"/>
          <w:left w:val="single" w:sz="6" w:color="000000"/>
          <w:bottom w:val="single" w:sz="6" w:color="000000"/>
          <w:right w:val="single" w:sz="6" w:color="000000"/>
        </w:tcBorders>
      </w:tcPr>

      <w:p>
        <w:pPr>
          <w:jc w:val="center"/>
          <w:spacing w:before="100" w:after="100"/>
        </w:pPr>

        <w:r>
          <w:rPr>
            <w:b/>
            <w:sz w:val="20"/>
            <w:szCs w:val="20"/>
          </w:rPr>

          <w:t xml:space="preserve">${escapeXml(value)}</w:t>
        </w:r>
      </w:p>
    </w:tc>
  </w:tr>
`;



const createTechnicalHeadingRow = (
  columnCount,
  totalWidth = 9600
) => `
  <w:tr>
    <w:tc>
      <w:tcPr>
        <w:tcW w:w="${totalWidth}" w:type="dxa"/>
        <w:gridSpan w:val="${columnCount}"/>
        <w:vAlign w:val="center"/>
        <w:tcBorders>
          <w:top w:val="single" w:sz="6" w:color="000000"/>
          <w:left w:val="single" w:sz="6" w:color="000000"/>
          <w:bottom w:val="single" w:sz="6" w:color="000000"/>
          <w:right w:val="single" w:sz="6" w:color="000000"/>
        </w:tcBorders>
      </w:tcPr>

      <w:p>
        <w:pPr>
          <w:jc w:val="center"/>
          <w:spacing w:before="100" w:after="60"/>
        </w:pPr>
        <w:r>
          <w:rPr>
            <w:b/>
            <w:sz w:val="20"/>
            <w:szCs w:val="20"/>
          </w:rPr>
          <w:t>TECHNICAL SPECIFICATION – M &amp; N CATEGORY OF VEHICLES</w:t>
        </w:r>
      </w:p>

      <w:p>
        <w:pPr>
          <w:jc w:val="center"/>
          <w:spacing w:before="60" w:after="100"/>
        </w:pPr>
        <w:r>
          <w:rPr>
            <w:b/>
            <w:sz w:val="20"/>
            <w:szCs w:val="20"/>
          </w:rPr>
          <w:t>(FOUR WHEELERS AND ABOVE): PART A – GENERAL</w:t>
        </w:r>
      </w:p>
    </w:tc>
  </w:tr>
`;

// --------------------------------------------------
// BOLD FORMATTING RULES
// --------------------------------------------------

const getRowBoldConfig = (clause) => {
  const clauseValue = String(clause || "").trim().toUpperCase();

  // Entire clause and description should be bold.
  const fullBoldRows = [
    "A1.0",
    "A2.0",
    "A3.0",
    "A4.0",
  ];

  if (fullBoldRows.includes(clauseValue)) {
    return [true, true, false];
  }

  // Only the description should be bold.
  if (clauseValue === "A1.7") {
    return [false, true, false];
  }

  // Only the clause number should be bold.
  if (clauseValue === "A3.3") {
    return [true, false, false];
  }

  return [false, false, false];
};

// --------------------------------------------------
// CREATE WORD TABLE
// --------------------------------------------------



const createTable = (
  headers,
  rows,
  {
    subheading = "",
    showHeader = true,
    includeTechnicalHeading = false,
  } = {}
) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    console.warn("No rows available for table:", headers);
    return "";
  }

  const columnWidths =
  headers.length === 3
    ? [1600, 4400, 3600]
    : headers.length === 4
  ? [1600, 2400, 2000, 3600]
      : headers.map(() => Math.floor(9600 / headers.length));

  const subheadingRow = subheading
    ? createSubheadingRow(subheading, headers.length)
    : "";

    const technicalHeadingRow = includeTechnicalHeading
  ? createTechnicalHeadingRow(headers.length)
  : "";

  // Display column headings only when showHeader is true.
  const headerRow = showHeader
    ? `
      <w:tr>
        ${headers
          .map((header, index) =>
            createCell(header, {
              bold: true,
              width: columnWidths[index],
              align: "center",
            })
          )
          .join("")}
      </w:tr>
    `
    : "";

const bodyRows = rows
  .map((row) => {
    const values = Array.isArray(row)
      ? row
      : Array.isArray(row.values)
        ? row.values
        : [];

    const boldConfig = Array.isArray(row)
      ? []
      : row.bold || [];

    const customWidths = Array.isArray(row)
      ? []
      : row.columnWidths || [];

    const gridSpans = Array.isArray(row)
      ? []
      : row.gridSpans || [];

    if (!values.length) return "";

    return `
  <w:tr>
    <w:trPr>
      <w:cantSplit/>
    </w:trPr>

    ${values
          .map((value, index) =>
            createCell(value, {
              width: customWidths[index] || columnWidths[index],
              gridSpan: gridSpans[index] || 1,
              bold: Array.isArray(boldConfig)
                ? Boolean(boldConfig[index])
                : Boolean(boldConfig),
            })
          )
          .join("")}
      </w:tr>
    `;
  })
  .join("");

  const grid = columnWidths
    .map((width) => `<w:gridCol w:w="${width}"/>`)
    .join("");

  return `
    <w:tbl>
      <w:tblPr>
  <w:tblW w:w="9600" w:type="dxa"/>
  <w:jc w:val="center"/>
  <w:tblLayout w:type="fixed"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="6" w:color="000000"/>
          <w:left w:val="single" w:sz="6" w:color="000000"/>
          <w:bottom w:val="single" w:sz="6" w:color="000000"/>
          <w:right w:val="single" w:sz="6" w:color="000000"/>
          <w:insideH w:val="single" w:sz="4" w:color="000000"/>
          <w:insideV w:val="single" w:sz="4" w:color="000000"/>
        </w:tblBorders>
      </w:tblPr>

      <w:tblGrid>
        ${grid}
      </w:tblGrid>

     ${technicalHeadingRow}
${subheadingRow}
${headerRow}
${bodyRows}
    </w:tbl>
  `;
};



const createFooterCell = (
  value = "",
  {
    width = 3200,
    align = "left",
    bold = true,
  } = {}
) => {
  const lines = Array.isArray(value) ? value : [value];

  return `
    <w:tc>
      <w:tcPr>
        <w:tcW w:w="${width}" w:type="dxa"/>
        <w:vAlign w:val="center"/>

        <w:tcMar>
          <w:top w:w="40" w:type="dxa"/>
           <w:bottom w:w="40" w:type="dxa"/>
          <w:left w:w="100" w:type="dxa"/>
          <w:right w:w="60" w:type="dxa"/>
        </w:tcMar>

        <w:tcBorders>
          <w:bottom w:val="single" w:sz="6" w:color="FF8080"/>
        </w:tcBorders>
      </w:tcPr>

      ${lines.map((line) => `
        <w:p>
          <w:pPr>
            <w:jc w:val="${align}"/>
            <w:spacing w:before="40" w:after="40"/>
          </w:pPr>

          <w:r>
            <w:rPr>
              ${bold ? "<w:b/>" : ""}
              <w:color w:val="FF8080"/>
              <w:sz w:val="24"/>
              <w:szCs w:val="24"/>
            </w:rPr>

            <w:t xml:space="preserve">${escapeXml(line)}</w:t>
          </w:r>
        </w:p>
      `).join("")}
    </w:tc>
  `;
};

const createFooterRow = (values, options = {}) => `
 <w:tr>
    <w:trPr>
      <w:cantSplit/>
    </w:trPr>

    ${values
      .map((value, index) =>
        createFooterCell(value, {
          width: options.widths?.[index] || 3200,
          align: options.alignments?.[index] || "Center",
          bold: options.bold?.[index] ?? true,
        })
      )
      .join("")}
  </w:tr>
`;

// --------------------------------------------------
// FOOTER SECTION - INSERTED INTO DOCUMENT BODY
// --------------------------------------------------

const createFooterSection = () => `
  <w:p>
    <w:pPr>
      <w:spacing w:before="180" w:after="0"/>
    </w:pPr>
  </w:p>

  <w:tbl>
    <w:tblPr>
  <w:tblW w:w="9600" w:type="dxa"/>
  <w:jc w:val="center"/>
  <w:tblInd w:w="0" w:type="dxa"/>
  <w:tblLayout w:type="fixed"/>

      <w:tblBorders>
        <w:top w:val="single" w:sz="6" w:color="FF8080"/>
        <w:left w:val="single" w:sz="6" w:color="FF8080"/>
        <w:bottom w:val="single" w:sz="6" w:color="FF8080"/>
        <w:right w:val="single" w:sz="6" w:color="FF8080"/>
        <w:insideV w:val="single" w:sz="6" w:color="FF8080"/>
        <w:insideH w:val="single" w:sz="6" w:color="FF8080"/>
      </w:tblBorders>
    </w:tblPr>

    <w:tblGrid>
      <w:gridCol w:w="3200"/>
      <w:gridCol w:w="3200"/>
      <w:gridCol w:w="3200"/>
    </w:tblGrid>

    <!-- Row 1 -->
    ${createFooterRow(
      [
        "Manufacturer",
        "Sheet No :",
        "Test Agency :",
      ],
      {
        bold: [false, true, true],
      }
    )}

    <!-- Row 2 -->
    ${createFooterRow(
      [
        "",
        "Document No:",
        "",
      ]
    )}

   <!-- Row 3: Name and Designation on separate lines -->
${createFooterRow(
  [
    ["Name:", "Designation:"],
    ["Date:"],
    ["Name:", "Designation:"],
  ],
  {
    widths: [3200, 3200, 3200],
    bold: [true, true, true],
  }
)}
  

  </w:tbl>

  <!-- Page number -->
  <w:p>
    <w:pPr>
      <w:jc w:val="right"/>
      <w:spacing w:before="0" w:after="0"/>
    </w:pPr>

    <w:r>
     <w:rPr>
  <w:rFonts
    w:ascii="Times New Roman"
    w:hAnsi="Times New Roman"
    w:eastAsia="Times New Roman"
    w:cs="Times New Roman"/>
  <w:b/>
  <w:color w:val="808080"/>
  <w:sz w:val="20"/>
  <w:szCs w:val="20"/>
</w:rPr>
      <w:t>Page</w:t>
    </w:r>

    <w:r>
      <w:rPr>
        <w:b/>
        <w:color w:val="FF0000"/>
        <w:sz w:val="20"/>
      </w:rPr>
      <w:t xml:space="preserve"> | </w:t>
    </w:r>

    <w:fldSimple w:instr="PAGE">
      <w:r>
        <w:rPr>
          <w:b/>
          <w:color w:val="FF0000"/>
          <w:sz w:val="20"/>
        </w:rPr>
        <w:t>1</w:t>
      </w:r>
    </w:fldSimple>
  </w:p>
`;

// --------------------------------------------------
// PAGE BREAK
// --------------------------------------------------

const createPageBreak = () => `
  <w:p>
    <w:r>
      <w:br w:type="page"/>
    </w:r>
  </w:p>
`;

// --------------------------------------------------
// COMPLETE DOCUMENT XML
// --------------------------------------------------

const createDocumentXml = (bodyContent) => `
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>

<w:document
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">

  <w:body>

    ${bodyContent}

    <w:sectPr>
      <w:pgSz
        w:w="11906"
        w:h="16838"/>

      <w:pgMar
        w:top="720"
        w:right="720"
        w:bottom="720"
        w:left="720"
        w:header="360"
        w:footer="360"
        w:gutter="0"/>
    </w:sectPr>

  </w:body>
</w:document>
`.trim();

// --------------------------------------------------
// FIND CAB TYPE ROW
// --------------------------------------------------

const isCabTypeRow = (row) => {
  const searchableText = normalize(
    `${row.clause} ${row.description} ${row.key}`
  );

  return searchableText.includes("cabtype");
};
const isVehicleClassRow = (row) => {
  const searchableText = normalize(
    `${row.clause} ${row.description} ${row.key}`
  );

  return searchableText.includes("vehicleclass");
};
const isCO2HeadingRow = (row) =>
  normalize(row.description).includes(
    normalize(
      "CO2 Reducing technologies Available (Yes / No) for M1 & N category of vehicle (ICE and Battery-Operated Vehicles)"
    )
  );

// --------------------------------------------------
// GENERATE FORM 2
// --------------------------------------------------

const generateForm2 = async (
  form2Data,
  requestNumber = "BUS"
) => {
  try {
    // 1. FETCH CSV

    const csvResponse = await fetch(CSV_URL);

    if (!csvResponse.ok) {
      throw new Error(`CSV file not found: ${CSV_URL}`);
    }

    const csvText = await csvResponse.text();

    // 2. PARSE CSV

    const parsed = Papa.parse(csvText, {
      header: true,
      delimiter: ",",
      skipEmptyLines: "greedy",

      transformHeader: (header) =>
        header.replace(/^\uFEFF/, "").trim(),

      transform: (value) => value.trim(),
    });

    if (parsed.errors.length) {
      const fatalErrors = parsed.errors.filter(
        (error) => error.code !== "UndetectableDelimiter"
      );

      if (fatalErrors.length) {
        throw new Error(
          `CSV parsing failed: ${fatalErrors[0].message}`
        );
      }
    }

    const requiredHeaders = [
      "clause_no_as_printed",
      "description_as_in_document",
      "suggested_field_key",
      "section",
    ];

    const missingHeaders = requiredHeaders.filter(
      (header) => !parsed.meta.fields?.includes(header)
    );

    if (missingHeaders.length) {
      throw new Error(
        `Missing CSV headers: ${missingHeaders.join(", ")}`
      );
    }

    const csvRows = parsed.data.filter((row) =>
      row.clause_no_as_printed ||
      row.description_as_in_document ||
      row.suggested_field_key
    );

    console.log("CSV headers:", parsed.meta.fields);
    console.log("Total CSV records:", csvRows.length);
    console.log("First CSV record:", csvRows[0]);

    // 3. COLLECT NORMAL AND MATRIX ROWS

    const normalRows = [];
    const matrixItems = [];

    csvRows.forEach((row) => {
      const section = row.section?.trim() || "";

      // Exclude document footer fields.

      if (
        normalize(section) === normalize("Document footer")
      ) {
        return;
      }

      const item = {
        clause: row.clause_no_as_printed?.trim() || "",

        description:
          row.description_as_in_document?.trim() || "",

        key: row.suggested_field_key?.trim() || "",

        value: row.value ?? "",
        base: row.base ?? "",
        variant1: row.variant1 ?? "",
        variant2: row.variant2 ?? "",
      };

      if (
        normalize(section) ===
        normalize("CO2 reducing technologies matrix")
      ) {
        matrixItems.push(item);
      } else if (isCO2HeadingRow(item)) {
  normalRows.push({
    ...item,
    isCO2Heading: true,
  });
} else {
  normalRows.push(item);
}
    });
    

    console.log("Normal rows:", normalRows.length);
    console.log("Matrix rows:", matrixItems.length);

    // 4. SPLIT NORMAL ROWS AFTER CAB TYPE

    const cabTypeIndex = normalRows.findIndex(isCabTypeRow);

    let firstPageRows = [];
    let secondPageRows = [];

    if (cabTypeIndex !== -1) {
      firstPageRows = normalRows.slice(0, cabTypeIndex + 1);
      secondPageRows = normalRows.slice(cabTypeIndex + 1);
    } else {
      // If Cab Type is not found, keep all normal rows together.
      console.warn(
        "Cab Type row was not found. All normal rows will be placed on page 1."
      );

      firstPageRows = normalRows;
    }

    // Extract Vehicle Class from normal rows.
// It will be inserted after the Regenerative fields in the matrix.
let vehicleClassRow = null;

const vehicleClassIndex = secondPageRows.findIndex(isVehicleClassRow);

if (vehicleClassIndex !== -1) {
  [vehicleClassRow] = secondPageRows.splice(vehicleClassIndex, 1);
}

console.log("Vehicle Class extracted:", vehicleClassRow);

    console.log("Page 1 rows:", firstPageRows.length);
    console.log("Page 2 normal rows:", secondPageRows.length);

    // 5. BUILD NORMAL TABLE ROWS

   const buildNormalTableRows = (items) =>
  items.map((row) => {

    // CO2 heading: only Clause No. and Description
    if (row.isCO2Heading || isCO2HeadingRow(row)) {
      return {
        values: [
          row.clause,
          row.description,
        ],
        bold: [true, true],

        // Clause No. = 1200
        // Description = 4800 + 3600
        columnWidths: [1600, 8000],

        // Merge Description across the Description and Value columns
        gridSpans: [1, 2],
      };
    }

    // All other rows remain unchanged
    return {
      values: [
        row.clause,
        row.description,
        row.key
          ? getFieldValue(form2Data, row.key, row.value)
          : row.value,
      ],
      bold: getRowBoldConfig(row.clause),
    };
  });

  
    // 6. PAGE 1 CONTENT

    let bodyContent = "";

    bodyContent += createMainHeadings();

    if (firstPageRows.length) {
  bodyContent += createTable(
    [
      "Clause No.",
      "Description",
      "Value",
    ],
    buildNormalTableRows(firstPageRows),
     {
    showHeader: true,
    includeTechnicalHeading: true,
  }
);
}

    // Footer after Cab Type on page 1.

    bodyContent += createFooterSection();


   

    // 7. PAGE BREAK AND PAGE 2 CONTENT

bodyContent += createPageBreak();

bodyContent += createMainHeadings();
if (secondPageRows.length) {
  bodyContent += createTable(
    [
      "Clause No.",
      "Description",
      "Value",
    ],
    buildNormalTableRows(secondPageRows),
    {
      showHeader: false,
      includeTechnicalHeading: true,
    }
  );
}


// 8. CO2 MATRIX ON PAGE 2

if (matrixItems.length) {
  const matrixRows = matrixItems.map((row) => ({
    values: [
      row.description,

      getVariantValue(
        form2Data,
        row.key,
        "base",
        row.base
      ),

      getVariantValue(
        form2Data,
        row.key,
        "variant1",
        row.variant1
      ),

      getVariantValue(
        form2Data,
        row.key,
        "variant2",
        row.variant2
      ),
    ],

    bold: [false, false, false, false],
  }));

  bodyContent += createTable(
    [
      "",
      "Base",
      "Variant 1",
      "Variant 2",
    ],
    matrixRows
  );
}
// 9. DISPLAY A3.4 VEHICLE CLASS AFTER THE REGENERATIVE MATRIX

if (vehicleClassRow) {
  bodyContent += createTable(
    [
      "Clause No.",
      "Description",
      "Value",
    ],
    buildNormalTableRows([vehicleClassRow]),
    {
      showHeader: false,
      includeTechnicalHeading: false,
    }
  );
} else {
  console.warn("A3.4 Vehicle Class row was not found.");
}
    // Footer after remaining page 2 data.

    bodyContent += createFooterSection();

    // 9. VALIDATE CONTENT

    console.log("Body XML length:", bodyContent.length);

    console.log(
      "Contains A1.0:",
      bodyContent.includes("A1.0")
    );

    console.log(
      "Contains Cab Type:",
      bodyContent.toLowerCase().includes("cab")
    );

    if (
      !bodyContent.trim() ||
      !bodyContent.includes("A1.0")
    ) {
      throw new Error(
        "Generated document is missing expected CSV content."
      );
    }

    // 10. CREATE DOCX PACKAGE

    const zip = new PizZip();
    console.log("========== DOCX DEBUG ==========");
console.log("CSV rows:", csvRows.length);
console.log("Normal rows:", normalRows.length);
console.log("Matrix rows:", matrixItems.length);
console.log("Page 1 rows:", firstPageRows.length);
console.log("Page 2 rows:", secondPageRows.length);
console.log("Body XML length:", bodyContent.length);
console.log("Document XML preview:", bodyContent.substring(0, 2000));

console.log("Contains heading:", bodyContent.includes("Table 2"));
console.log("Contains A1.0:", bodyContent.includes("A1.0"));
console.log("Contains table XML:", bodyContent.includes("<w:tbl>"));
console.log("Contains footer XML:", bodyContent.includes("Manufacturer"));

console.log("================================");

    // Content Types

    zip.file(
      "[Content_Types].xml",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>

      <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">

        <Default
          Extension="rels"
          ContentType="application/vnd.openxmlformats-package.relationships+xml"/>

        <Default
          Extension="xml"
          ContentType="application/xml"/>

        <Override
          PartName="/word/document.xml"
          ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>

      </Types>`
    );

    // Root Relationships

    zip.file(
      "_rels/.rels",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>

      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">

        <Relationship
          Id="rId1"
          Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument"
          Target="word/document.xml"/>

      </Relationships>`
    );

    // Document Relationships

    zip.file(
      "word/_rels/document.xml.rels",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>

      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
      </Relationships>`
    );

    // Document XML

    zip.file(
      "word/document.xml",
      createDocumentXml(bodyContent)
    );

    // 11. GENERATE DOCX

    const output = zip.generate({
      type: "blob",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    // 12. DOWNLOAD

    const url = URL.createObjectURL(output);

    const link = document.createElement("a");

    link.href = url;

    link.download = `Form2_${requestNumber}.docx`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);

    console.log("Form 2 generated successfully");

  } catch (error) {
    console.error(
      "Form 2 generation failed:",
      error
    );

    throw error;
  }
};

export default generateForm2;
