

// ////////////////////////////////////////////////////////////////////////////////////

import exportDoc from "./exportUtil";
import {
  Document,
  Header,
  Paragraph,
  TextRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  Footer,
  ImageRun,
  PageNumber,
} from "docx";
// Updated code: added tacNumberLampList, possibleDateLampList, copCertLampList, validityLampList, and MakeList,
// because lamps should be separated to ensure clear categorization and organization of data for each lamp type.ffgfgf
let docSealImage;
// let twoWheeler;
let twoWheeler = false;
let firstValue;
// let Vehicle_category;
const mainData = function () {
  const suppNameList = [];
  const suppNameLampList = [];
  const tacNumberList = [];
  const possibleDateList = [];
  const copCertList = [];
  const vehType = [];
  const validityList = [];
  const tacNumberLampList = [];
  const possibleDateLampList = [];
  const copCertLampList = [];
  const validityLampList = [];
  const MakeList = [];
  const MakeLampList = [];
  return {
    suppNameList,
    suppNameLampList,
    tacNumberList,
    possibleDateList,
    copCertList,
    vehType,
    validityList,
    tacNumberLampList,
    possibleDateLampList,
    copCertLampList,
    MakeList,
    validityLampList,
    MakeLampList,
  };
};

async function fetchAndProcessImage(footerData) {
  const dataOfFooterr = footerData.footerData.SealSign.properties;
  const fileName = dataOfFooterr.Upload_Seal.file_name;
  const imageUrl = `https://bv-reg.com/api/files/downloads/${fileName}`; 
// const imageUrl = `http://localhost:3007/api/files/downloads/${fileName}`;
  //   const imageUrl = `http://localhost:3007/api/files/downloads/${fileName}`;
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    // Convert the blob to Base64
    const base64Data = await new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        resolve(reader.result); // Resolve with the Base64 string
      };

      reader.onerror = reject; // Reject on error

      reader.readAsDataURL(blob);
    });

    // Create an ImageRun object with the Base64 data
    const docSealImage = new ImageRun({
      data: base64Data, // Use the Base64 data here
      transformation: {
        width: 90,
        height: 50,
      },
    });

    // console.log("ImageRun instance created:", docSealImage);

    return docSealImage; // Return the docSealImage after it's ready
  } catch (error) {
    console.error("Error loading or converting image:", error);
    throw error; // If the image fails to load, throw an error
  }
}




function parseAndCheckTACValidity(inputStr) {
  if (!inputStr || typeof inputStr !== "string") {
    return { expired: true, hasDate: false };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find ANY valid date pattern inside the string
  const dateMatches = inputStr.match(/\b(\d{1,2}[-/\.]\d{1,2}[-/\.]\d{2,4}|\d{4}[-/\.]\d{1,2}[-/\.]\d{1,2})\b/g);

  if (!dateMatches) return { expired: true, hasDate: false };

  // Use last found date (if multiple)
  let dateStr = dateMatches[dateMatches.length - 1].trim().replace(/[-\.]/g, "/");

  let day, month, year;

  // Case: YYYY/MM/DD
  if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(dateStr)) {
    [year, month, day] = dateStr.split("/");
  }
  // Case: DD/MM/YYYY or DD/MM/YY
  else if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(dateStr)) {
    [day, month, year] = dateStr.split("/");

    // Convert 2-digit year → full year
    if (year.length === 2) {
      year = Number(year) < 50 ? Number(year) + 2000 : Number(year) + 1900;
    }
  } else {
    return { expired: true, hasDate: false };
  }

  const parsedDate = new Date(year, month - 1, day);

  // Final invalid date check
  if (
    parsedDate.getFullYear() != year ||
    parsedDate.getMonth() != month - 1 ||
    parsedDate.getDate() != Number(day)
  ) {
    return { expired: true, hasDate: false };
  }

  return {
    expired: parsedDate < today,
    hasDate: true,
    parsedDate: parsedDate.toDateString()
  };
}

  


const validDateRegex =
  /\b(\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[-/.]\d{1,2}[-/.]\d{4})\b/;

const isNonEmpty = (s) =>
  typeof s === "string" && s.trim() !== "" && s.trim().toUpperCase() !== "NA";

const containsValidDate = (s) =>
  isNonEmpty(s) && validDateRegex.test(s);

// count alphanumeric characters (letters + digits)
const countAlphaNum = (s) => (s.match(/[A-Za-z0-9]/g) || []).length;
const countDigits = (s) => (s.match(/[0-9]/g) || []).length;
const countAlphaNumSlashDash = (s) => (s.match(/[A-Za-z0-9\/\-]/g) || []).length;
const isCOPNumber = (s) => isNonEmpty(s) && /^[A-Z0-9\-\/]+$/i.test(s);
function getTACorBISLabel(s) {
  if (!isNonEmpty(s)) return "";

  // 1) detect if there’s a date at all
  const hasDate = containsValidDate(s);

  // 2) strip off the date and everything after it
  const dateMatch = s.match(validDateRegex);
  const preDate = dateMatch
    ? s.slice(0, dateMatch.index)
    : s;

  // 3) trim and collapse whitespace, then count all alphanumerics
  const alphaNumCount = countAlphaNum(preDate);
  const digitCount = countDigits(preDate);
  const alphaNumCount1 = countAlphaNumSlashDash(preDate);

  // 4) apply your 6‐vs‐7 logic
  if (alphaNumCount === 6) {
    return hasDate ? "TAC No and Validity" : "TAC No";
  }
  // BIS No (only digits, length 7–10)
  if (digitCount >= 7 && digitCount <= 10 && digitCount === alphaNumCount) {
    
    
    return hasDate ? "BIS No and Validity" : "BIS No";
  }

  if (alphaNumCount1 > 7 && alphaNumCount1 < 40) {
    return hasDate ? "Test Report No and Validity" : "Test Report No";
  }
  return "";
}

function getTACorBISHeader(list) {
  if (!Array.isArray(list)) return "";

  for (const item of list) {
    const label = getTACorBISLabel(item);
    if (label) return label;
  }
  return "";
}



const makePrefix = (make) => {
    if (!make) return "";
  
    const lowerMake = make.toLowerCase();
    if (lowerMake === "na") return make;
  
    if (make.startsWith("M/s.")) return make;
    if (make.startsWith("M/")) return `M/s. ${make.slice(2)}`;
  
    return `M/s. ${make}`;
  };
  



function getCOPHeader(list) {
    if (!Array.isArray(list)) return "";
  
    const validItems = list.filter((item) => {
      if (!isNonEmpty(item)) return false;
  
      const dateMatch = item.match(validDateRegex);
      const preDate = dateMatch ? item.slice(0, dateMatch.index).trim() : item.trim();
  
      return isCOPNumber(preDate);
    });
  
    if (validItems.length === 0) return "";
  
    const hasValidDate = list.some(containsValidDate);
  
    return hasValidDate ? "COP No and Validity Date" : "COP No";
  }

function getPossibleDateHeader(list) {
  if (!Array.isArray(list)) return "";
  const validDates = list.filter(containsValidDate);
  if (validDates.length === 0) return "";
  return validDates.length === 1 ? "Possible Date" : "Possible Dates";
}




function TACvalidationcheck(tacValueRaw, copCertRaw, possibleDateRaw) {
  const tacCheck = parseAndCheckTACValidity(tacValueRaw);
  const result = { cop: "", possible: "" };

  const isTacBlank = !tacValueRaw.trim();
  const isPossiblePresent = !!possibleDateRaw?.trim();
  const isPossibleBlank = !isPossiblePresent;

  if (!isTacBlank && tacCheck.hasDate) {
    if (tacCheck.expired) {
      // ✅ Condition 1: TAC given & expired
      // result.cop = "NA";
      // result.possible = possibleDateRaw || "NA";
      result.possible = "NA";
      result.cop = copCertRaw || "NA";
    } else {
      // ✅ Condition 2: TAC given & valid
      result.cop = "NA";
      result.possible = "NA";
    }
    // } else if (isTacBlank && isCopPresent) {
  } else if (isTacBlank && isPossiblePresent) {
    // ✅ Condition 3 / 5: TAC missing, CoP present
    // result.cop = copCertRaw;
    // result.possible = "NA";
    result.possible = possibleDateRaw;
    result.cop = "NA";
    // } else if (isTacBlank && isCopBlank && !possibleDateRaw) {
  } else if (isTacBlank && isPossibleBlank && !copCertRaw) {
    // ✅ Condition 4: All missing
    result.cop = "";
    result.possible = "";
  } else {
    // 🔁 Fallback for edge cases
    result.possible = isPossibleBlank ? "" : possibleDateRaw;
    result.cop = "NA";
  }

  return result;
}

async function generateForm8(form8Data, footerData) {
  const docSealImage = await fetchAndProcessImage(footerData);
  // console.log("form8Data:", form8Data);
  const dataOfFooter = footerData.footerData.footer.properties;
  const dataOfFooterr = footerData.footerData.SealSign.properties;

  let homologation_Engg_Name = dataOfFooter.Homologation_Engineer_Name.value;

  // Capitalize first letter and prepend "Mr/Mrs"
  if (
    typeof homologation_Engg_Name === "string" &&
    homologation_Engg_Name.trim().length > 0
  ) {
    let trimmedName = homologation_Engg_Name.trim();
    homologation_Engg_Name = `Mr/Mrs. ${trimmedName[0].toUpperCase()}${trimmedName.slice(
      1
    )}`;
  }
  // Manufacturer Name
  let manufacturer_Name = dataOfFooter.Manufacture_Name.value;
  if (
    typeof manufacturer_Name === "string" &&
    manufacturer_Name.trim().length > 0
  ) {
    let trimmedManu = manufacturer_Name.trim();
    manufacturer_Name = `M/s. ${trimmedManu[0].toUpperCase()}${trimmedManu.slice(
      1
    )}`;
  }

  


  const HandleLockList = form8Data?.Handle_Lock?.HandleLock || [];
  let HandleLockDataList = mainData();

  // Ensure lists are initialized as arrays
  HandleLockDataList.suppNameList = Array.isArray(
    HandleLockDataList.suppNameList
  )
    ? HandleLockDataList.suppNameList
    : [];
  HandleLockDataList.MakeList = Array.isArray(HandleLockDataList.MakeList)
    ? HandleLockDataList.MakeList
    : [];
  HandleLockDataList.tacNumberList = Array.isArray(
    HandleLockDataList.tacNumberList
  )
    ? HandleLockDataList.tacNumberList
    : [];
  HandleLockDataList.possibleDateList = Array.isArray(
    HandleLockDataList.possibleDateList
  )
    ? HandleLockDataList.possibleDateList
    : [];
  HandleLockDataList.copCertList = Array.isArray(HandleLockDataList.copCertList)
    ? HandleLockDataList.copCertList
    : [];

  HandleLockList.forEach((vehHandleLock) => {
    const Vehicle_category =
      vehHandleLock?.Protective_Device_Handle_Lock?.properties?.Vehicle_category
        ?.value;
    // console.log("Vehicle category:", Vehicle_category);

    twoWheeler = Vehicle_category === "L1" || Vehicle_category === "L2";

    if (twoWheeler && vehHandleLock?.supplier?.active === true) {
      let supplierName = vehHandleLock?.supplier?.nameOfSupplier || "NA";
      let makeValue =
        vehHandleLock?.Protective_Device_Handle_Lock?.properties?.Make?.value ||
        "NA";

    //   if (supplierName !== "NA" && !supplierName.startsWith("M/")) {
    //     supplierName = `M/s. ${supplierName}`;
    //   }

    //   if (makeValue !== "NA" && !makeValue.startsWith("M/")) {
    //     makeValue = `M/s. ${makeValue}`;
    //   }

    supplierName = makePrefix(supplierName);
makeValue = makePrefix(makeValue);
      const tacRaw =
        vehHandleLock?.Protective_Device_Handle_Lock?.properties?.TAC_Number
          ?.value || "";
      const tacCheck = parseAndCheckTACValidity(tacRaw);

      HandleLockDataList.tacNumberList.push(tacRaw || "NA");
      HandleLockDataList.MakeList.push(makeValue);

      const copCert =
        vehHandleLock?.Protective_Device_Handle_Lock?.properties
          ?.CoP_Cert_No_with_validity_date?.value || "NA";
      const possibleDate =
        vehHandleLock?.Protective_Device_Handle_Lock?.properties
          ?.Possible_date_of_submission_of_required_approval?.value || "NA";

      if (tacCheck.hasDate) {
        if (tacCheck.expired) {
          HandleLockDataList.suppNameList.push(supplierName);
          HandleLockDataList.copCertList.push(copCert);
          HandleLockDataList.possibleDateList.push(possibleDate);
        } else {
          HandleLockDataList.suppNameList.push(supplierName);
          HandleLockDataList.copCertList.push("NA");
          HandleLockDataList.possibleDateList.push("NA");
        }
      } else {
        HandleLockDataList.suppNameList.push(supplierName);
        HandleLockDataList.copCertList.push(copCert);
        HandleLockDataList.possibleDateList.push(possibleDate);
      }
    } else {
      // If not L1/L2 or supplier inactive, push "NA"
      HandleLockDataList.suppNameList.push("NA");
      HandleLockDataList.MakeList.push("NA");
      HandleLockDataList.tacNumberList.push("NA");
      HandleLockDataList.possibleDateList.push("NA");
      HandleLockDataList.copCertList.push("NA");
    }
  });

  
const reflectorsList = form8Data?.Retro_Reflectors?.RetroReflectors;

  let reflDataList = {
    suppNameList: [],
    frontWhiteList: mainData(),
    rearRedList: mainData(),
    sideAmberList: mainData(),
    frontWhiteListt: mainData(),
    rearRedListt: mainData(),
    sideAmberListt: mainData(),
  };

  reflectorsList.forEach((vehRefl) => {
    if (!vehRefl?.supplier?.active) return;

 
    // --- FRONT WHITE REFLECTOR ---
    const frontWhiteProps = vehRefl?.Front_White_Reflector?.properties || {};
    const fwMake = makePrefix(frontWhiteProps?.Make?.value);


    const fwTacValidityRaw = frontWhiteProps?.TAC_Validity?.value || "";
    const fwTacNumber = frontWhiteProps?.TAC_Number?.value || "";
    const fwCopRaw =
      frontWhiteProps?.CoP_Cert_No_with_validity_date?.value || "";
    const fwDate =
      frontWhiteProps?.Possible_date_of_submission_of_required_approval
        ?.value || "";

    // Logic for handling TAC when only CoP is present
    const isTacMissingFW = fwTacValidityRaw.trim() === "";
    const isfwDate = fwDate.trim() !== "";

    let finalFwTacValidity = fwTacValidityRaw;
    if (isTacMissingFW && isfwDate) {
      finalFwTacValidity = "NA"; // Your Condition 3 & 5
    }

    // FRONT WHITE REFLECTOR
    reflDataList.frontWhiteList.MakeList.push(fwMake);
    // if (finalFwTacValidity !== "NA") {
    //   reflDataList.frontWhiteList.validityList.push(fwTacValidityRaw);
    // } else {
    //   reflDataList.frontWhiteList.validityList.push("");
    // }

    //   reflDataList.frontWhiteList.MakeList.push(fwMake);
    //   reflDataList.frontWhiteList.validityList.push(finalFwTacValidity);

    // Push validity
reflDataList.frontWhiteList.validityList.push(finalFwTacValidity);

// Conditionally push TAC number
if (finalFwTacValidity === "NA") {
  reflDataList.frontWhiteList.tacNumberList.push("");
} else {
  reflDataList.frontWhiteList.tacNumberList.push(fwTacNumber);
}

    // reflDataList.frontWhiteList.validityList.push(finalFwTacValidity);
    // reflDataList.frontWhiteList.tacNumberList.push(fwTacNumber);
    reflDataList.suppNameList.push(fwMake);

    const { cop: fwCopFinal, possible: fwPossible } = TACvalidationcheck(
      fwTacValidityRaw,
      fwCopRaw,
      fwDate
    );
    reflDataList.frontWhiteList.copCertList.push(fwCopFinal);
    reflDataList.frontWhiteList.possibleDateList.push(fwPossible);

    // --- REAR RED REFLECTOR ---
    const rearRedProps = vehRefl?.Rear_Red_Reflector?.properties || {};
    const rrMake = makePrefix(rearRedProps?.Make?.value);

    const rrTacValidityRaw = rearRedProps?.TAC_Validity?.value || "";
    const rrTacNumber = rearRedProps?.TAC_Number?.value || "";
    const rrCopRaw = rearRedProps?.CoP_Cert_No_with_validity_date?.value || "";
    const rrDate =
      rearRedProps?.Possible_date_of_submission_of_required_approval?.value ||
      "";

    // Logic for handling TAC when only CoP is present
    const isTacMissingRR = rrTacValidityRaw.trim() === "";
    const isrrDate = rrDate.trim() !== "";

    let finalRrTacValidity = rrTacValidityRaw;
    if (isTacMissingRR && isrrDate) {
      finalRrTacValidity = "NA"; // Your Condition 3 & 5
    }

    // REAR RED REFLECTOR
    reflDataList.rearRedList.MakeList.push(rrMake);
    // if (finalRrTacValidity !== "NA") {
    //   reflDataList.rearRedList.validityList.push(rrTacValidityRaw);
    // } else {
    //   reflDataList.rearRedList.validityList.push("");
    // }

    //   reflDataList.rearRedList.MakeList.push(rrMake);
    //   reflDataList.rearRedList.validityList.push(finalRrTacValidity);
    // Push validity
reflDataList.rearRedList.validityList.push(finalRrTacValidity);

// Conditionally push TAC number
if (finalRrTacValidity === "NA") {
  reflDataList.rearRedList.tacNumberList.push("");
} else {
  reflDataList.rearRedList.tacNumberList.push(rrTacNumber);
}

    // reflDataList.rearRedList.validityList.push(finalRrTacValidity);
    // reflDataList.rearRedList.tacNumberList.push(rrTacNumber);
    reflDataList.suppNameList.push(rrMake);

    const { cop: rrCopFinal, possible: rrPossible } = TACvalidationcheck(
      rrTacValidityRaw,
      rrCopRaw,
      rrDate
    );
    reflDataList.rearRedList.copCertList.push(rrCopFinal);
    reflDataList.rearRedList.possibleDateList.push(rrPossible);

    // --- SIDE AMBER REFLECTOR ---
    const sideAmberProps = vehRefl?.Side_Amber_Reflector?.properties || {};
    const saMake = makePrefix(sideAmberProps?.Make?.value);

    const saTacValidityRaw = sideAmberProps?.TAC_Validity?.value || "";
    const saTacNumber = sideAmberProps?.TAC_Number?.value || "";
    const saCopRaw =
      sideAmberProps?.CoP_Cert_No_with_validity_date?.value || "";
    const saDate =
      sideAmberProps?.Possible_date_of_submission_of_required_approval?.value ||
      "";

    // Logic for handling TAC when only CoP is present
    const isTacMissingSA = saTacValidityRaw.trim() === "";
    const issaDate = saDate.trim() !== "";

    let finalSaTacValidity = saTacValidityRaw;
    if (isTacMissingSA && issaDate) {
      finalSaTacValidity = "NA"; // Your Condition 3 & 5
    }
    // SIDE AMBER REFLECTOR
    reflDataList.sideAmberList.MakeList.push(saMake);
    // if (finalSaTacValidity !== "NA") {
    //   reflDataList.sideAmberList.validityList.push(saTacValidityRaw);
    // } else {
    //   reflDataList.sideAmberList.validityList.push("");
    // }

    //   reflDataList.sideAmberList.MakeList.push(saMake);
    //   reflDataList.sideAmberList.validityList.push(finalSaTacValidity);
    // Push validity
reflDataList.sideAmberList.validityList.push(finalSaTacValidity);

// Conditionally push TAC number
if (finalSaTacValidity === "NA") {
  reflDataList.sideAmberList.tacNumberList.push("");
} else {
  reflDataList.sideAmberList.tacNumberList.push(saTacNumber);
}

    // reflDataList.sideAmberList.validityList.push(finalSaTacValidity);
    // reflDataList.sideAmberList.tacNumberList.push(saTacNumber);
    reflDataList.suppNameList.push(saMake);

    const { cop: saCopFinal, possible: saPossible } = TACvalidationcheck(
      saTacValidityRaw,
      saCopRaw,
      saDate
    );
    reflDataList.sideAmberList.copCertList.push(saCopFinal);
    reflDataList.sideAmberList.possibleDateList.push(saPossible);

    // --- FRONT WHITE Reflective ---
    const frontWhiteProperties =
      vehRefl?.Front_Reflective_Tape?.properties || {};
    const frontWhiteMake = makePrefix(frontWhiteProperties?.Make?.value);

    const frontWhiteTacValidityRaw =
      frontWhiteProperties?.TAC_Validity?.value || "";
    const frontWhiteTacNumber = frontWhiteProperties?.TAC_Number?.value || "";
    const frontWhiteCopCertRaw =
      frontWhiteProperties?.CoP_Cert_No_with_validity_date?.value || "";
    const frontWhitePossibleDateOfSubmission =
      frontWhiteProperties?.Possible_date_of_submission_of_required_approval
        ?.value || "";

    // Logic for handling TAC when only CoP is present
    const isFrontWhiteTacMissing = frontWhiteTacValidityRaw.trim() === "";
    const hasFrontWhiteSubmissionDate =
      frontWhitePossibleDateOfSubmission.trim() !== "";

    let finalFrontWhiteTacValidity = frontWhiteTacValidityRaw;
    if (isFrontWhiteTacMissing && hasFrontWhiteSubmissionDate) {
      finalFrontWhiteTacValidity = "NA"; // Your Condition 3 & 5
    }

    // FRONT WHITE REFLECTOR
    reflDataList.frontWhiteListt.MakeList.push(frontWhiteMake);
    // if (finalFrontWhiteTacValidity !== "NA") {
    //   reflDataList.frontWhiteListt.validityList.push(frontWhiteTacValidityRaw);
    // } else {
    //   reflDataList.frontWhiteListt.validityList.push("");
    // }

    if (finalFrontWhiteTacValidity === "NA") {
        reflDataList.frontWhiteListt.tacNumberList.push("");
      } else {
        reflDataList.frontWhiteListt.tacNumberList.push(frontWhiteTacNumber);
      }
    reflDataList.frontWhiteListt.validityList.push(finalFrontWhiteTacValidity);
    // reflDataList.frontWhiteListt.tacNumberList.push(frontWhiteTacNumber);
    reflDataList.suppNameList.push(frontWhiteMake);

    const {
      cop: frontWhiteCopCertFinal,
      possible: frontWhitePossibleDateFinal,
    } = TACvalidationcheck(
      frontWhiteTacValidityRaw,
      frontWhiteCopCertRaw,
      frontWhitePossibleDateOfSubmission
    );

    reflDataList.frontWhiteListt.copCertList.push(frontWhiteCopCertFinal);
    reflDataList.frontWhiteListt.possibleDateList.push(
      frontWhitePossibleDateFinal
    );

    // --- REAR RED Reflective Tape ---
    const rearRedProperties = vehRefl?.Rear_Reflective_Tape?.properties || {};
    const rearRedMake = makePrefix(rearRedProperties?.Make?.value);

    const rearRedTacValidityRaw = rearRedProperties?.TAC_Validity?.value || "";
    const rearRedTacNumber = rearRedProperties?.TAC_Number?.value || "";
    const rearRedCopCertRaw =
      rearRedProperties?.CoP_Cert_No_with_validity_date?.value || "";
    const rearRedPossibleDateOfSubmission =
      rearRedProperties?.Possible_date_of_submission_of_required_approval
        ?.value || "";

    // Logic for handling TAC when only CoP is present
    const isRearRedTacMissing = rearRedTacValidityRaw.trim() === "";
    const hasRearRedSubmissionDate =
      rearRedPossibleDateOfSubmission.trim() !== "";

    let finalRearRedTacValidity = rearRedTacValidityRaw;
    if (isRearRedTacMissing && hasRearRedSubmissionDate) {
      finalRearRedTacValidity = "NA"; // Your Condition 3 & 5
    }

    // REAR RED Reflective Tape
    reflDataList.rearRedListt.MakeList.push(rearRedMake);
    // if (finalRearRedTacValidity !== "NA") {
    //   reflDataList.rearRedListt.validityList.push(rearRedTacValidityRaw);
    // } else {
    //   reflDataList.rearRedListt.validityList.push("");
    // }

    // Push validity
reflDataList.rearRedListt.validityList.push(finalRearRedTacValidity);

// Conditionally push TAC number
if (finalRearRedTacValidity === "NA") {
  reflDataList.rearRedListt.tacNumberList.push("");
} else {
  reflDataList.rearRedListt.tacNumberList.push(rearRedTacNumber);
}

    // reflDataList.rearRedListt.validityList.push(finalRearRedTacValidity);
    // reflDataList.rearRedListt.tacNumberList.push(rearRedTacNumber);
    reflDataList.suppNameList.push(rearRedMake);

    // Keep this line unchanged
    const { cop: rearRedCopCertFinal, possible: rearRedPossibleDateFinal } =
      TACvalidationcheck(
        rearRedTacValidityRaw,
        rearRedCopCertRaw,
        rearRedPossibleDateOfSubmission
      );

    reflDataList.rearRedListt.copCertList.push(rearRedCopCertFinal);
    reflDataList.rearRedListt.possibleDateList.push(rearRedPossibleDateFinal);

    // --- SIDE AMBER Reflective Tape ---
    const sideAmberProperties = vehRefl?.Side_Reflective_Tape?.properties || {};
    const sideAmberMake = makePrefix(sideAmberProperties?.Make?.value);

    const sideAmberTacValidityRaw =
      sideAmberProperties?.TAC_Validity?.value || "";
    const sideAmberTacNumber = sideAmberProperties?.TAC_Number?.value || "";
    const sideAmberCopCertRaw =
      sideAmberProperties?.CoP_Cert_No_with_validity_date?.value || "";
    const sideAmberPossibleDateOfSubmission =
      sideAmberProperties?.Possible_date_of_submission_of_required_approval
        ?.value || "";

    // Logic for handling TAC when only CoP is present
    const isSideAmberTacMissing = sideAmberTacValidityRaw.trim() === "";
    const hasSideAmberSubmissionDate =
      sideAmberPossibleDateOfSubmission.trim() !== "";

    let finalSideAmberTacValidity = sideAmberTacValidityRaw;
    if (isSideAmberTacMissing && hasSideAmberSubmissionDate) {
      finalSideAmberTacValidity = "NA"; // Your Condition 3 & 5
    }

    // SIDE AMBER Reflective Tape
    reflDataList.sideAmberListt.MakeList.push(sideAmberMake);
    // if (finalSideAmberTacValidity !== "NA") {
    //   reflDataList.sideAmberListt.validityList.push(sideAmberTacValidityRaw);
    // } else {
    //   reflDataList.sideAmberListt.validityList.push("");
    // }


    // Conditionally push tac number
if (finalSideAmberTacValidity === "NA") {
    reflDataList.sideAmberListt.tacNumberList.push("");
  } else {
    reflDataList.sideAmberListt.tacNumberList.push(sideAmberTacNumber);
  }
    reflDataList.sideAmberListt.validityList.push(finalSideAmberTacValidity);
    // reflDataList.sideAmberListt.tacNumberList.push(sideAmberTacNumber);
    reflDataList.suppNameList.push(sideAmberMake);

    // Keep this line unchanged
    const { cop: sideAmberCopCertFinal, possible: sideAmberPossibleDateFinal } =
      TACvalidationcheck(
        sideAmberTacValidityRaw,
        sideAmberCopCertRaw,
        sideAmberPossibleDateOfSubmission
      );

    reflDataList.sideAmberListt.copCertList.push(sideAmberCopCertFinal);
    reflDataList.sideAmberListt.possibleDateList.push(
      sideAmberPossibleDateFinal
    );
  });

  const hornList = form8Data?.Horn?.Horn;
  let hornDataList = mainData();

  hornList.map((vehHorn) => {
    if (vehHorn?.supplier?.active === true) {
    //   let make = vehHorn?.Horn?.properties?.Make?.value || "";
    //   if (make && make.toLowerCase() !== "na" && !make.startsWith("M/")) {
    //     make = `M/s. ${make}`;
    //   }
    let make = makePrefix(vehHorn?.Horn?.properties?.Make?.value);

      const tacValueRaw =
        vehHorn?.Horn?.properties?.TAC_Number_Its_Validity?.value?.trim() || "";
      const copCertRaw =
        vehHorn?.Horn?.properties?.CoP_Cert_No_with_validity_date?.value?.trim() ||
        "";
      const possibleDateRaw =
        vehHorn?.Horn?.properties?.Possible_date_of_submission_of_required_approval?.value?.trim() ||
        "";

      // // Logic for handling TAC when only CoP is present
      // const isTacMissing = tacValueRaw === "";
      // const isPossibleDatePresent = possibleDateRaw !== "";

      // let finalTAC = tacValueRaw;
      // if (isTacMissing && isPossibleDatePresent) {
      //     finalTAC = "NA"; // ✅ Your Condition 5 / 3
      // }

      // Updated logic: check if TAC is missing and Possible Date is present
      const isTacMissing = tacValueRaw === "";
      const isPossibleDatePresent = possibleDateRaw !== "";

      let finalTAC = tacValueRaw;
      if (isTacMissing && isPossibleDatePresent) {
        finalTAC = "NA"; // ✅ Updated Condition 5 / 3
      }

      hornDataList.validityList.push(finalTAC);
      hornDataList.MakeList.push(make);
      hornDataList.suppNameList.push(make);

      // Handle CoP & Possible Date via helper
      const { cop, possible } = TACvalidationcheck(
        tacValueRaw,
        copCertRaw,
        possibleDateRaw
      );
      hornDataList.copCertList.push(cop);
      hornDataList.possibleDateList.push(possible);
    }
  });

 
  

  const tyreList = form8Data?.Tyres?.TyresData

  let ftyreDataList = mainData();
  let rtyreDataList = mainData();
  let atyreDataList = mainData();

  tyreList.map((vehTyre) => {
    if (vehTyre?.supplier?.active === true) {
      // ---------- FRONT TYRE ----------
      const frontProps = vehTyre?.Front_tyre?.properties || {};
    //   let frontTyreMake = frontProps?.Make?.value || "";
    //   if (frontTyreMake && !frontTyreMake.startsWith("M/")) {
    //     frontTyreMake = `M/s. ${frontTyreMake}`;
    //   }
    let frontTyreMake = makePrefix(frontProps?.Make?.value);

      const frontTacRaw = frontProps?.TAC_Number_Its_Validity?.value || "";
      const frontCopRaw =
        frontProps?.CoP_Cert_No_with_validity_date?.value || "";
      const frontPossibleRaw =
        frontProps?.Possible_date_of_submission_of_required_approval?.value ||
        "";

      // Logic for handling TAC when only CoP is present
      const isTacMissingFront = frontTacRaw.trim() === "";
      const isFrontPossibleRaw = frontPossibleRaw.trim() !== "";

      let finalFrontTac = frontTacRaw;
      if (isTacMissingFront && isFrontPossibleRaw) {
        finalFrontTac = "NA";
      }

      const { cop: frontCop, possible: frontPossibleDate } = TACvalidationcheck(
        frontTacRaw,
        frontCopRaw,
        frontPossibleRaw
      );

      ftyreDataList.MakeList.push(frontTyreMake);
      ftyreDataList.validityList.push(finalFrontTac);
      ftyreDataList.copCertList.push(frontCop);
      ftyreDataList.possibleDateList.push(frontPossibleDate);
      ftyreDataList.vehType.push(frontProps?.tyre_vehicle_type?.value);

      // ---------- REAR TYRE ----------
      const rearProps = vehTyre?.Rear_tyre?.properties || {};
    //   let rearTyreMake = rearProps?.Make?.value || "";
    //   if (rearTyreMake && !rearTyreMake.startsWith("M/")) {
    //     rearTyreMake = `M/s. ${rearTyreMake}`;
    //   }
    let rearTyreMake = makePrefix(rearProps?.Make?.value);

      const rearTacRaw = rearProps?.TAC_Number_Its_Validity?.value || "";
      const rearCopRaw = rearProps?.CoP_Cert_No_with_validity_date?.value || "";
      const rearPossibleRaw =
        rearProps?.Possible_date_of_submission_of_required_approval?.value ||
        "";

      // Logic for handling TAC when only CoP is present
      const isTacMissingRear = rearTacRaw.trim() === "";
      const isrearPossibleRaw = rearPossibleRaw.trim() !== "";

      let finalRearTac = rearTacRaw;
      if (isTacMissingRear && isrearPossibleRaw) {
        finalRearTac = "NA";
      }

      const { cop: rearCop, possible: rearPossibleDate } = TACvalidationcheck(
        rearTacRaw,
        rearCopRaw,
        rearPossibleRaw
      );

      rtyreDataList.MakeList.push(rearTyreMake);
      rtyreDataList.validityList.push(finalRearTac);
      rtyreDataList.copCertList.push(rearCop);
      rtyreDataList.possibleDateList.push(rearPossibleDate);

      // ---------- ANY OTHER TYRE ----------
      const otherProps = vehTyre?.Any_other_Tyre?.properties || {};
    //   let otherTyreMake = otherProps?.Make?.value || "";
    //   if (otherTyreMake && !otherTyreMake.startsWith("M/")) {
    //     otherTyreMake = `M/s. ${otherTyreMake}`;
    //   }
    let otherTyreMake = makePrefix(otherProps?.Make?.value);

      const otherTacRaw = otherProps?.TAC_Number_Its_Validity?.value || "";
      const otherCopRaw =
        otherProps?.CoP_Cert_No_with_validity_date?.value || "";
      const otherPossibleRaw =
        otherProps?.Possible_date_of_submission_of_required_approval?.value ||
        "";

      // Logic for handling TAC when only CoP is present
      const isTacMissingOther = otherTacRaw.trim() === "";
      const isotherPossibleRaw = otherPossibleRaw.trim() !== "";

      let finalOtherTac = otherTacRaw;
      if (isTacMissingOther && isotherPossibleRaw) {
        finalOtherTac = "NA";
      }

      const { cop: otherCop, possible: otherPossibleDate } = TACvalidationcheck(
        otherTacRaw,
        otherCopRaw,
        otherPossibleRaw
      );

      atyreDataList.MakeList.push(otherTyreMake);
      atyreDataList.validityList.push(finalOtherTac);
      atyreDataList.copCertList.push(otherCop);
      atyreDataList.possibleDateList.push(otherPossibleDate);
    }
  });

  

  const headLampList = form8Data?.Head_Lamp?.HeadLamp;
  let hlMainBeamDataList = mainData();
  let hlDipBeamDataList = mainData();

  // Add M/s. if needed
//   const addPrefix = (make) => {
//     return make && !make.startsWith("M/") ? `M/s. ${make}` : make || "";
//   };

  headLampList?.map((vehHeadLamp) => {
    if (vehHeadLamp?.supplier?.active) {
      // --- MAIN BEAM LED ---
      const mainLED =
        vehHeadLamp?.Main_Beam_Head_Lamp_LED_type?.properties || {};
      const mainLEDMk = makePrefix(mainLED?.Main_Beam_Head_Lamp_make?.value);

      const mainTacRaw = mainLED?.TAC_Validity?.value || "";
      const mainCopRaw = mainLED?.CoP_Cert_No_with_validity_date?.value || "";
      const mainPossibleRaw =
        mainLED?.Possible_date_of_submission_of_required_approval?.value || "";

      // Logic for TAC = "NA" when TAC missing and CoP present
      const isTacMissingMain = mainTacRaw.trim() === "";
      const isPossibleRawPresentMain = mainPossibleRaw.trim() !== "";

      let finalMainTac = mainTacRaw;
      if (isTacMissingMain && isPossibleRawPresentMain) {
        finalMainTac = "NA";
      }
      // --- MAIN BEAM LED ---
      hlMainBeamDataList.MakeList.push(mainLEDMk);
    //   if (finalMainTac !== "NA") {
    //     hlMainBeamDataList.validityList.push(mainTacRaw);
    //   } else {
    //     hlMainBeamDataList.validityList.push("");
    //   }

    if (finalMainTac !== "NA") {
        hlMainBeamDataList.validityList.push(mainTacRaw);
        hlMainBeamDataList.tacNumberList.push(mainLED?.TAC_Number?.value || "");
      } else {
        hlMainBeamDataList.validityList.push("NA");
        hlMainBeamDataList.tacNumberList.push("");
      }

      const { cop: copMainLED, possible: possibleMainLED } = TACvalidationcheck(
        mainTacRaw,
        mainCopRaw,
        mainPossibleRaw
      );

      hlMainBeamDataList.MakeList.push(mainLEDMk);
      // hlMainBeamDataList.validityList.push(finalMainTac);
    //   hlMainBeamDataList.tacNumberList.push(mainLED?.TAC_Number?.value || "");
      hlMainBeamDataList.suppNameList.push(mainLEDMk);
      hlMainBeamDataList.copCertList.push(copMainLED);
      hlMainBeamDataList.possibleDateList.push(possibleMainLED);

      // --- DIPPED BEAM LED ---
      const dipLED =
        vehHeadLamp?.Dipped_Beam_Headlamp_LED_Type?.properties || {};
      const dipLEDMk = makePrefix(dipLED?.Make?.value);

      const dipTacRaw = dipLED?.TAC_Validity?.value || "";
      const dipCopRaw = dipLED?.CoP_Cert_No_with_validity_date?.value || "";
      const dipPossibleRaw =
        dipLED?.Possible_date_of_submission_of_required_approval?.value || "";

      // Logic for TAC = "NA" when TAC missing and CoP present
      const isTacMissingDip = dipTacRaw.trim() === "";
      const isdipPossibleRawPresentDip = dipPossibleRaw.trim() !== "";

      let finalDipTac = dipTacRaw;
      if (isTacMissingDip && isdipPossibleRawPresentDip) {
        finalDipTac = "NA";
      }

      // --- DIPPED BEAM LED ---
      hlDipBeamDataList.MakeList.push(dipLEDMk);
    //   if (finalDipTac !== "NA") {
    //     hlDipBeamDataList.validityList.push(dipTacRaw);
    //   } else {
    //     hlDipBeamDataList.validityList.push("");
    //   }

    if (finalDipTac !== "NA") {
        hlDipBeamDataList.validityList.push(dipTacRaw);
        hlDipBeamDataList.tacNumberList.push(dipLED?.TAC_Number?.value || "");
      } else {
        hlDipBeamDataList.validityList.push("NA");
        hlDipBeamDataList.tacNumberList.push("");
      }
      const { cop: copDipLED, possible: possibleDipLED } = TACvalidationcheck(
        dipTacRaw,
        dipCopRaw,
        dipPossibleRaw
      );

      hlDipBeamDataList.MakeList.push(dipLEDMk);
      // hlDipBeamDataList.validityList.push(finalDipTac);
    //   hlDipBeamDataList.tacNumberList.push(dipLED?.TAC_Number?.value || "");
      hlDipBeamDataList.suppNameList.push(dipLEDMk);
      hlDipBeamDataList.copCertList.push(copDipLED);
      hlDipBeamDataList.possibleDateList.push(possibleDipLED);

      // --- MAIN BEAM FILAMENT ---
      const mainFil =
        vehHeadLamp?.Main_Beam_Headlamp_Filament_Type?.properties || {};
      const mainFilMk = makePrefix(mainFil?.Make?.value);

      const mainFilTacRaw = mainFil?.TAC_Validity?.value || "";
      const mainFilCopRaw =
        mainFil?.CoP_Cert_No_with_validity_date?.value || "";
      const mainFilPossibleRaw =
        mainFil?.Possible_date_of_submission_of_required_approval?.value || "";

      // Logic for TAC = "NA" when TAC missing and CoP present
      const isTacMissingMainFil = mainFilTacRaw.trim() === "";
      const ismainFilPossibleRawMainFil = mainFilPossibleRaw.trim() !== "";

      let finalMainFilTac = mainFilTacRaw;
      if (isTacMissingMainFil && ismainFilPossibleRawMainFil) {
        finalMainFilTac = "NA";
      }

      hlMainBeamDataList.MakeLampList.push(mainFilMk);
    //   if (finalMainFilTac !== "NA") {
    //     hlMainBeamDataList.validityLampList.push(mainFilTacRaw);
    //   } else {
    //     hlMainBeamDataList.validityLampList.push("");
    //   }

    if (finalMainFilTac !== "NA") {
        hlMainBeamDataList.validityLampList.push(mainFilTacRaw);
        hlMainBeamDataList.tacNumberLampList.push(mainFil?.TAC_Number?.value || "");
      } else {
        hlMainBeamDataList.validityLampList.push("NA");
        hlMainBeamDataList.tacNumberLampList.push("");
      }

      const { cop: copMainFil, possible: possibleMainFil } = TACvalidationcheck(
        mainFilTacRaw,
        mainFilCopRaw,
        mainFilPossibleRaw
      );

      hlMainBeamDataList.MakeLampList.push(mainFilMk);
      // hlMainBeamDataList.validityLampList.push(finalMainFilTac);
    //   hlMainBeamDataList.tacNumberLampList.push(
    //     mainFil?.TAC_Number?.value || ""
    //   );
      hlMainBeamDataList.suppNameLampList.push(mainFilMk);
      hlMainBeamDataList.copCertLampList.push(copMainFil);
      hlMainBeamDataList.possibleDateLampList.push(possibleMainFil);

      // --- DIPPED BEAM FILAMENT ---
      const dipFil =
        vehHeadLamp?.Dipped_Beam_Headlamp_Filament_Type?.properties || {};
      const dipFilMk = makePrefix(dipFil?.Make?.value);

      const dipFilTacRaw = dipFil?.TAC_Validity?.value || "";
      const dipFilCopRaw = dipFil?.CoP_Cert_No_with_validity_date?.value || "";
      const dipFilPossibleRaw =
        dipFil?.Possible_date_of_submission_of_required_approval?.value || "";

      // Logic for TAC = "NA" when TAC missing and CoP present
      const isTacMissingDipFil = dipFilTacRaw.trim() === "";
      const isdipFilPossibleRawPresentDipFil = dipFilPossibleRaw.trim() !== "";

      let finalDipFilTac = dipFilTacRaw;
      if (isTacMissingDipFil && isdipFilPossibleRawPresentDipFil) {
        finalDipFilTac = "NA";
      }

      hlDipBeamDataList.MakeLampList.push(dipFilMk);
    //   if (finalDipFilTac !== "NA") {
    //     hlDipBeamDataList.validityLampList.push(dipFilTacRaw);
    //   } else {
    //     hlDipBeamDataList.validityLampList.push("");
    //   }

    if (finalDipFilTac !== "NA") {
        hlDipBeamDataList.validityLampList.push(dipFilTacRaw);
        hlDipBeamDataList.tacNumberLampList.push(dipFil?.TAC_Number?.value || "");
      } else {
        hlDipBeamDataList.validityLampList.push("NA");
        hlDipBeamDataList.tacNumberLampList.push("");
      }

      const { cop: copDipFil, possible: possibleDipFil } = TACvalidationcheck(
        dipFilTacRaw,
        dipFilCopRaw,
        dipFilPossibleRaw
      );

      hlDipBeamDataList.MakeLampList.push(dipFilMk);
      // hlDipBeamDataList.validityLampList.push(finalDipFilTac);
    //   hlDipBeamDataList.tacNumberLampList.push(dipFil?.TAC_Number?.value || "");
      hlDipBeamDataList.suppNameLampList.push(dipFilMk);
      hlDipBeamDataList.copCertLampList.push(copDipFil);
      hlDipBeamDataList.possibleDateLampList.push(possibleDipFil);
    }
  });

  
  
 
  

  const dtRunnLampList =
    form8Data?.Daytime_Running_Lamp?.DaytimeRunningLamp || [];
  let dtRunnLampDataList = mainData();

  dtRunnLampList.map((vehRunnLamp) => {
    if (vehRunnLamp?.supplier?.active === true) {
    //   let make =
    //     vehRunnLamp?.Daytime_Running_Lamp?.properties?.Make?.value || "";
    //   if (make && !make.startsWith("M/")) {
    //     make = `M/s. ${make}`;
    //   }
    let make = makePrefix(vehRunnLamp?.Daytime_Running_Lamp?.properties?.Make?.value);

      const tacValueRaw =
        vehRunnLamp?.Daytime_Running_Lamp?.properties?.TAC_Validity?.value ||
        "";
      const copCertRaw =
        vehRunnLamp?.Daytime_Running_Lamp?.properties
          ?.CoP_Cert_No_with_validity_date?.value || "";
      const possibleDateRaw =
        vehRunnLamp?.Daytime_Running_Lamp?.properties
          ?.Possible_date_of_submission_of_required_approval?.value || "";

      // Logic for TAC = "NA" when TAC missing and CoP present
      const isTacMissing = tacValueRaw.trim() === "";
      const isPossibleDatePresent = possibleDateRaw.trim() !== "";
      let finalTAC = tacValueRaw;
      if (isTacMissing && isPossibleDatePresent) {
        finalTAC = "NA";
      }

      dtRunnLampDataList.validityList.push(finalTAC);
      dtRunnLampDataList.MakeList.push(make);
      dtRunnLampDataList.suppNameList.push(make);

      const { cop, possible } = TACvalidationcheck(
        tacValueRaw,
        copCertRaw,
        possibleDateRaw
      );
      dtRunnLampDataList.copCertList.push(cop);
      dtRunnLampDataList.possibleDateList.push(possible);
    }
  });

  // console.log("Current suppNameList:", dtRunnLampDataList.suppNameList);
  // console.log("Current MakeList:", dtRunnLampDataList.MakeList);
  // console.log("Possible Date List:", dtRunnLampDataList.possibleDateList);
  // console.log("cop List:", dtRunnLampDataList.copCertList);
  // console.log("Validity List:", dtRunnLampDataList.validityList);


const posLampsList = form8Data?.Position_Lamps?.PositionLamps || [];

let frontPosLampDataList = mainData();
let rearPosLampDataList = mainData();
let stopLampDataList = mainData();

posLampsList.forEach((vehPosLamp) => {
  if (vehPosLamp?.supplier?.active === true) {
    // FRONT POSITION LAMP LED
    {
      const props = vehPosLamp?.Front_Position_Lamp_LED_Type?.properties || {};
      let make = makePrefix(props?.Make?.value);
      const tacValueRaw = props?.TAC_Validity?.value?.trim() || "";
      const tacNumber = props?.TAC_Number?.value?.trim() || "";
      const copCertRaw = props?.CoP_Cert_No_with_validity_date?.value?.trim() || "";
      const possibleDateRaw = props?.Possible_date_of_submission_of_required_approval?.value?.trim() || "";

      const isTacMissingFrontLamp = tacValueRaw === "";
      const isPossibleDatePresentfrontLamp = possibleDateRaw !== "";

      let finalTACFrontLamp = tacValueRaw;
      if (isTacMissingFrontLamp && isPossibleDatePresentfrontLamp) {
        finalTACFrontLamp = "NA";
      }

      if (finalTACFrontLamp !== "NA") {
        frontPosLampDataList.validityList.push(finalTACFrontLamp);
        frontPosLampDataList.tacNumberList.push(tacNumber);
      } else {
        frontPosLampDataList.validityList.push("NA");
        frontPosLampDataList.tacNumberList.push("");
      }



    //   frontPosLampDataList.validityList.push(finalTAC);
    //   frontPosLampDataList.tacNumberList.push(tacNumber);
      frontPosLampDataList.MakeList.push(make);
      frontPosLampDataList.suppNameList.push(make);

      const { cop:copFrontLed, possible:possibleFrontLed } = TACvalidationcheck(tacValueRaw, copCertRaw, possibleDateRaw);
      frontPosLampDataList.copCertList.push(copFrontLed);
      frontPosLampDataList.possibleDateList.push(possibleFrontLed);
    }

    // FRONT POSITION LAMP BULB
    {
      const props = vehPosLamp?.Front_Position_Lamp_Bulb_Type?.properties || {};
      let make = makePrefix(props?.Make?.value);
      const tacValueRaw = props?.TAC_Validity?.value?.trim() || "";
      const tacNumber = props?.TAC_Number?.value?.trim() || "";
      const copCertRaw = props?.CoP_Cert_No_with_validity_date?.value?.trim() || "";
      const possibleDateRaw = props?.Possible_date_of_submission_of_required_approval?.value?.trim() || "";

      const isTacMissingFrontBulb = tacValueRaw === "";
      const isPossibleDatePresentFrontBulb = possibleDateRaw !== "";

      let finalTACFrontBulb = tacValueRaw;
      if (isTacMissingFrontBulb && isPossibleDatePresentFrontBulb) {
        finalTACFrontBulb = "NA";
      }


      if (finalTACFrontBulb !== "NA") {
        frontPosLampDataList.validityLampList.push(tacValueRaw);
        frontPosLampDataList.tacNumberLampList.push(tacNumber);
      } else {
        frontPosLampDataList.validityLampList.push("NA");
        frontPosLampDataList.tacNumberLampList.push("");
      }
      
    //   frontPosLampDataList.validityLampList.push(finalTAC);
    //   frontPosLampDataList.tacNumberLampList.push(tacNumber);
      frontPosLampDataList.MakeList.push(make);
      frontPosLampDataList.suppNameLampList.push(make);

      const { cop:copFrontBulb, possible:possibleFrontBulb } = TACvalidationcheck(tacValueRaw, copCertRaw, possibleDateRaw);
      frontPosLampDataList.copCertLampList.push(copFrontBulb);
      frontPosLampDataList.possibleDateLampList.push(possibleFrontBulb);
    }

    // REAR PARKING LAMP LED
    {
      const props = vehPosLamp?.Parking_Lamp_Led_Rear?.properties || {};
      let make = makePrefix(props?.Make_of_Parking_lamp_led_rear?.value);
      const tacValueRaw = props?.TAC_Validity?.value?.trim() || "";
      const tacNumber = props?.TAC_Number?.value?.trim() || "";
      const copCertRaw = props?.CoP_Cert_No_with_validity_date?.value?.trim() || "";
      const possibleDateRaw = props?.Possible_date_of_submission_of_required_approval?.value?.trim() || "";

      const isTacMissingRearLamp = tacValueRaw === "";
      const isPossibleDatePresentRearLamp = possibleDateRaw !== "";

      let finalTACRearLamp = tacValueRaw;
      if (isTacMissingRearLamp && isPossibleDatePresentRearLamp) {
        finalTACRearLamp = "NA";
      }


      if (finalTACRearLamp !== "NA") {
        rearPosLampDataList.validityList.push(tacValueRaw);
        rearPosLampDataList.tacNumberList.push(tacNumber);
      } else {
        rearPosLampDataList.validityList.push("NA");
        rearPosLampDataList.tacNumberList.push("");
      }

    //   rearPosLampDataList.validityList.push(finalTAC);
    //   rearPosLampDataList.tacNumberList.push(tacNumber);
      rearPosLampDataList.MakeList.push(make);
      rearPosLampDataList.suppNameList.push(make);

      const { cop:copRearParkLed, possible:possibleRearParkLed } = TACvalidationcheck(tacValueRaw, copCertRaw, possibleDateRaw);
      rearPosLampDataList.copCertList.push(copRearParkLed);
      rearPosLampDataList.possibleDateList.push(possibleRearParkLed);
    }

    // REAR PARKING LAMP BULB
    {
      const props = vehPosLamp?.Parking_Lamp_Bulb_Rear?.properties || {};
      let make = makePrefix(props?.Make?.value);
      const tacValueRaw = props?.TAC_Validity?.value?.trim() || "";
      const tacNumber = props?.TAC_Number?.value?.trim() || "";
      const copCertRaw = props?.CoP_Cert_No_with_validity_date?.value?.trim() || "";
      const possibleDateRaw = props?.Possible_date_of_submission_of_required_approval?.value?.trim() || "";

      const isTacMissing = tacValueRaw === "";
      const isPossibleDatePresent = possibleDateRaw !== "";

      let finalTAC = tacValueRaw;
      if (isTacMissing && isPossibleDatePresent) {
        finalTAC = "NA";
      }

      if (finalTAC !== "NA") {
        rearPosLampDataList.validityLampList.push(finalTAC);
        rearPosLampDataList.tacNumberLampList.push(tacNumber);
      } else {
        rearPosLampDataList.validityLampList.push("NA");
        rearPosLampDataList.tacNumberLampList.push("");
      }


    //   rearPosLampDataList.validityLampList.push(finalTAC);
    //   rearPosLampDataList.tacNumberLampList.push(tacNumber);
      rearPosLampDataList.MakeList.push(make);
      rearPosLampDataList.suppNameLampList.push(make);

      const { cop:copRearParkBulb, possible:possibleRearParkBulb } = TACvalidationcheck(tacValueRaw, copCertRaw, possibleDateRaw);
      rearPosLampDataList.copCertLampList.push(copRearParkBulb);
      rearPosLampDataList.possibleDateLampList.push(possibleRearParkBulb);
    }

    // STOP LAMP LED
    {
      const props = vehPosLamp?.Stop_Lamp_LED_Type?.properties || {};
      let make = makePrefix(props?.Make?.value);
      const tacValueRaw = props?.TAC_Validity?.value?.trim() || "";
      const tacNumber = props?.TAC_Number?.value?.trim() || "";
      const copCertRaw = props?.CoP_Cert_No_with_validity_date?.value?.trim() || "";
      const possibleDateRaw = props?.Possible_date_of_submission_of_required_approval?.value?.trim() || "";

      const isTacMissing = tacValueRaw === "";
      const isPossibleDatePresent = possibleDateRaw !== "";

      let finalTAC = tacValueRaw;
      if (isTacMissing && isPossibleDatePresent) {
        finalTAC = "NA";
      }

      if (finalTAC !== "NA") {
        stopLampDataList.validityList.push(finalTAC);
        stopLampDataList.tacNumberList.push(tacNumber);
      } else {
        stopLampDataList.validityList.push("NA");
        stopLampDataList.tacNumberList.push("");
      }


    //   stopLampDataList.validityList.push(finalTAC);
    //   stopLampDataList.tacNumberList.push(tacNumber);
      stopLampDataList.MakeList.push(make);
      stopLampDataList.suppNameList.push(make);

      const { cop:copStopLed, possible:possibleStopLed } = TACvalidationcheck(tacValueRaw, copCertRaw, possibleDateRaw);
      stopLampDataList.copCertList.push(copStopLed);
      stopLampDataList.possibleDateList.push(possibleStopLed);
    }

    // STOP LAMP BULB FILAMENT TYPE
    {
      const props = vehPosLamp?.Stop_lamp_bulb_Filament_Type?.properties || {};
      let make = makePrefix(props?.Make?.value);
      const tacValueRaw = props?.TAC_Validity?.value?.trim() || "";
      const tacNumber = props?.TAC_Number?.value?.trim() || "";
      const copCertRaw = props?.CoP_Cert_No_with_validity_date?.value?.trim() || "";
      const possibleDateRaw = props?.Possible_date_of_submission_of_required_approval?.value?.trim() || "";

      const isTacMissing = tacValueRaw === "";
      const isPossibleDatePresent = possibleDateRaw !== "";

      let finalTAC = tacValueRaw;
      if (isTacMissing && isPossibleDatePresent) {
        finalTAC = "NA";
      }

      if (finalTAC !== "NA") {
        stopLampDataList.validityLampList.push(finalTAC);
        stopLampDataList.tacNumberLampList.push(tacNumber);
      } else {
        stopLampDataList.validityLampList.push("NA");
        stopLampDataList.tacNumberLampList.push("");
      }

    //   stopLampDataList.validityLampList.push(finalTAC);
    //   stopLampDataList.tacNumberLampList.push(tacNumber);
      stopLampDataList.MakeList.push(make);
      stopLampDataList.suppNameLampList.push(make);

      const { cop:copStopFillament, possible:possibleStopFillament } = TACvalidationcheck(tacValueRaw, copCertRaw, possibleDateRaw);
      stopLampDataList.copCertLampList.push(copStopFillament);
      stopLampDataList.possibleDateLampList.push(possibleStopFillament);
    }
  }
});


  // console.log("frontPosLampDataList.MakeList", frontPosLampDataList.MakeList);
  // console.log(
  //   "frontPosLampDataList.possibleDateList",
  //   frontPosLampDataList.possibleDateList
  // );
  // console.log(
  //   "frontPosLampDataList.copCertList",
  //   frontPosLampDataList.copCertList
  // );
  // console.log(
  //   "frontPosLampDataList.validityList",
  //   frontPosLampDataList.validityList
  // );
  // console.log(
  //   "frontPosLampDataList.tacNumberLampList",
  //   frontPosLampDataList.tacNumberList
  // );
  // console.log(
  //   "frontPosLampDataList.tacNumberLampList",
  //   frontPosLampDataList.tacNumberLampList
  // );
  // console.log(
  //   "frontPosLampDataList.suppNameLampList",
  //   frontPosLampDataList.suppNameLampList
  // );
  // console.log(
  //   "frontPosLampDataList.possibleDateLampList",
  //   frontPosLampDataList.possibleDateLampList
  // );
  // console.log(
  //   "frontPosLampDataList.copCertLampList",
  //   frontPosLampDataList.copCertLampList
  // );
  // console.log(
  //   "frontPosLampDataList.validityLampList",
  //   frontPosLampDataList.validityLampList
  // );

  // console.log(
  //   "rearPosLampDataList.tacNumberLampList",
  //   rearPosLampDataList.tacNumberLampList
  // );
  // console.log(
  //   "rearPosLampDataList.suppNameLampList",
  //   rearPosLampDataList.suppNameLampList
  // );
  // console.log("rearPosLampDataList.MakeList", rearPosLampDataList.MakeList);
  // console.log(
  //   "rearPosLampDataList.possibleDateLampList",
  //   rearPosLampDataList.possibleDateLampList
  // );
  // console.log(
  //   "rearPosLampDataList.copCertLampList",
  //   rearPosLampDataList.copCertLampList
  // );
  // console.log(
  //   "rearPosLampDataList.validityLampList",
  //   rearPosLampDataList.validityLampList
  // );
  // console.log(
  //   "rearPosLampDataList.tacNumberList",
  //   rearPosLampDataList.tacNumberList
  // );
  // console.log(
  //   "rearPosLampDataList.suppNameList",
  //   rearPosLampDataList.suppNameList
  // );
  // console.log(
  //   "rearPosLampDataList.possibleDateList",
  //   rearPosLampDataList.possibleDateList
  // );
  // console.log(
  //   "rearPosLampDataList.copCertList",
  //   rearPosLampDataList.copCertList
  // );
  // console.log(
  //   "rearPosLampDataList.validityList",
  //   rearPosLampDataList.validityList
  // );

  // console.log("stopLampDataList.tacNumberList", stopLampDataList.tacNumberList);
  // console.log("stopLampDataList.suppNameList", stopLampDataList.suppNameList);
  // console.log("stopLampDataList.MakeList", stopLampDataList.MakeList);
  // console.log(
  //   "stopLampDataList.possibleDateList",
  //   stopLampDataList.possibleDateList
  // );
  // console.log("stopLampDataList.copCertList", stopLampDataList.copCertList);
  // console.log("stopLampDataList.validityList", stopLampDataList.validityList);
  // console.log(
  //   "stopLampDataList.tacNumberLampList",
  //   stopLampDataList.tacNumberLampList
  // );
  // console.log(
  //   "stopLampDataList.suppNameLampList",
  //   stopLampDataList.suppNameLampList
  // );
  // console.log(
  //   "stopLampDataList.possibleDateLampList",
  //   stopLampDataList.possibleDateLampList
  // );
  // console.log(
  //   "stopLampDataList.copCertLampList",
  //   stopLampDataList.copCertLampList
  // );
  // console.log(
  //   "stopLampDataList.validityLampList",
  //   stopLampDataList.validityLampList
  // );
 
  const dirIndLampList =
    form8Data?.Direction_Indicator_Lamp?.DirectionIndicatorLamp;

  let fdIndLampDataList = mainData();
  let sdIndLampDataList = mainData();
  let rdIndLampDataList = mainData();

  dirIndLampList.forEach((vehDirInd) => {
    if (vehDirInd?.supplier?.active === true) {
      // --- Front Direction Indicator ---
      const frontLed =
        vehDirInd?.Front_Direction_Indicator_LED_Type?.properties || {};
    //   let frontLedMake = frontLed?.Make?.value || "";
    //   if (frontLedMake && !frontLedMake.startsWith("M/")) {
    //     frontLedMake = `M/s. ${frontLedMake}`;
    //   }
    let frontLedMake = makePrefix(frontLed?.Make?.value);

      const frontLedValidityRaw = frontLed?.TAC_Validity?.value?.trim() || "";
      const frontLedTacNumber = frontLed?.TAC_Number?.value || "";     
      const frontLedCopCert =
        frontLed?.CoP_Cert_No_with_validity_date?.value?.trim() || "";
      const frontLedPossibleDate =
        frontLed?.Possible_date_of_submission_of_required_approval?.value?.trim() ||
        "";

      let finalFrontLedValidity = frontLedValidityRaw;
      if (!frontLedValidityRaw && frontLedPossibleDate) {
        finalFrontLedValidity = "NA";
      }

    //   if (finalFrontLedValidity !== "NA") {
    //     fdIndLampDataList.validityList.push(frontLedValidityRaw);
    //   } else {
    //     fdIndLampDataList.validityList.push("");
    //   }

    if (finalFrontLedValidity !== "NA") {
        fdIndLampDataList.validityList.push(frontLedValidityRaw);
        fdIndLampDataList.tacNumberList.push(frontLedTacNumber);
      } else {
        fdIndLampDataList.validityList.push("NA");
        fdIndLampDataList.tacNumberList.push("");
      }

      // fdIndLampDataList.validityList.push(finalFrontLedValidity);
    //   fdIndLampDataList.tacNumberList.push(frontLedTacNumber);
      fdIndLampDataList.MakeList.push(frontLedMake);
      fdIndLampDataList.suppNameList.push(frontLedMake);

      const { cop: frontCop, possible: frontPossible } = TACvalidationcheck(
        frontLedValidityRaw,
        frontLedCopCert,
        frontLedPossibleDate
      );
      fdIndLampDataList.copCertList.push(frontCop);
      fdIndLampDataList.possibleDateList.push(frontPossible);

      // --- Front Direction Indicator Bulb ---
      const frontBulb =
        vehDirInd?.Front_Direction_indicator_Bulb_Type?.properties || {};
    //   let frontBulbMake = frontBulb?.Make?.value || "";
    //   if (frontBulbMake && !frontBulbMake.startsWith("M/")) {
    //     frontBulbMake = `M/s. ${frontBulbMake}`;
    //   }
    let frontBulbMake = makePrefix(frontBulb?.Make?.value);

      const frontBulbValidityRaw = frontBulb?.TAC_Validity?.value?.trim() || "";
      const frontBulbTacNumber = frontBulb?.TAC_Number?.value || "";
      const frontBulbCopCert =
        frontBulb?.CoP_Cert_No_with_validity_date?.value?.trim() || "";
      const frontBulbPossibleDate =
        frontBulb?.Possible_date_of_submission_of_required_approval?.value?.trim() ||
        "";

      let finalFrontBulbValidity = frontBulbValidityRaw;
      if (!frontBulbValidityRaw && frontBulbPossibleDate) {
        finalFrontBulbValidity = "NA";
      }

    //   if (finalFrontBulbValidity !== "NA") {
    //     fdIndLampDataList.validityLampList.push(frontBulbValidityRaw);
    //   } else {
    //     fdIndLampDataList.validityLampList.push("");
    //   }

    if (finalFrontBulbValidity !== "NA") {
        fdIndLampDataList.validityLampList.push(frontBulbValidityRaw);
        fdIndLampDataList.tacNumberLampList.push(frontBulbTacNumber);
      } else {
        fdIndLampDataList.validityLampList.push("NA");
        fdIndLampDataList.tacNumberLampList.push("");
      }

      // fdIndLampDataList.validityLampList.push(finalFrontBulbValidity);
    //   fdIndLampDataList.tacNumberLampList.push(frontBulbTacNumber);
      fdIndLampDataList.MakeList.push(frontBulbMake);
      fdIndLampDataList.suppNameLampList.push(frontBulbMake);

      const { cop: frontBulbCop, possible: frontBulbPossible } =
        TACvalidationcheck(
          frontBulbValidityRaw,
          frontBulbCopCert,
          frontBulbPossibleDate
        );
      fdIndLampDataList.copCertLampList.push(frontBulbCop);
      fdIndLampDataList.possibleDateLampList.push(frontBulbPossible);

      // --- Side Direction Indicator ---
      const sideLed = vehDirInd?.Side_Direction_Indicator?.properties || {};
    //   let sideLedMake = sideLed?.Make?.value || "";
    //   if (sideLedMake && !sideLedMake.startsWith("M/")) {
    //     sideLedMake = `M/s. ${sideLedMake}`;
    //   }
    let sideLedMake = makePrefix(sideLed?.Make?.value);

      const sideLedValidityRaw = sideLed?.TAC_Validity?.value?.trim() || "";
      const sideLedTacNumber = sideLed?.TAC_Number?.value || "";
      const sideLedCopCert =
        sideLed?.CoP_Cert_No_with_validity_date?.value?.trim() || "";
      const sideLedPossibleDate =
        sideLed?.Possible_date_of_submission_of_required_approval?.value?.trim() ||
        "";

      let finalSideLedValidity = sideLedValidityRaw;
      if (!sideLedValidityRaw && sideLedPossibleDate) {
        finalSideLedValidity = "NA";
      }

    //   if (finalSideLedValidity !== "NA") {
    //     sdIndLampDataList.validityList.push(sideLedValidityRaw);
    //   } else {
    //     sdIndLampDataList.validityList.push("");
    //   }

    if (finalSideLedValidity !== "NA") {
        sdIndLampDataList.validityList.push(sideLedValidityRaw);
        sdIndLampDataList.tacNumberList.push(sideLedTacNumber);
      } else {
        sdIndLampDataList.validityList.push("NA");
        sdIndLampDataList.tacNumberList.push("");
      }

      // sdIndLampDataList.validityList.push(finalSideLedValidity);
    //   sdIndLampDataList.tacNumberList.push(sideLedTacNumber);
      sdIndLampDataList.MakeList.push(sideLedMake);
      sdIndLampDataList.suppNameList.push(sideLedMake);

      const { cop: sideCop, possible: sidePossible } = TACvalidationcheck(
        sideLedValidityRaw,
        sideLedCopCert,
        sideLedPossibleDate
      );
      sdIndLampDataList.copCertList.push(sideCop);
      sdIndLampDataList.possibleDateList.push(sidePossible);

      // --- Rear Direction Indicator ---
      const rearLed =
        vehDirInd?.Rear_Direction_Indicator_LED_Type?.properties || {};
    //   let rearLedMake = rearLed?.Make?.value || "";
    //   if (rearLedMake && !rearLedMake.startsWith("M/")) {
    //     rearLedMake = `M/s. ${rearLedMake}`;
    //   }
    let rearLedMake = makePrefix(rearLed?.Make?.value);

      const rearLedValidityRaw = rearLed?.TAC_Validity?.value?.trim() || "";
      const rearLedTacNumber = rearLed?.TAC_Number?.value || "";
      const rearLedCopCert =
        rearLed?.CoP_Cert_No_with_validity_date?.value?.trim() || "";
      const rearLedPossibleDate =
        rearLed?.Possible_date_of_submission_of_required_approval?.value?.trim() ||
        "";

      let finalRearLedValidity = rearLedValidityRaw;
      if (!rearLedValidityRaw && rearLedPossibleDate) {
        finalRearLedValidity = "NA";
      }


    //   if (finalRearLedValidity !== "NA") {
    //     rdIndLampDataList.validityList.push(rearLedValidityRaw);
    //   } else {
    //     rdIndLampDataList.validityList.push("");
    //   }

    if (finalRearLedValidity !== "NA") {
        rdIndLampDataList.validityList.push(rearLedValidityRaw);
        rdIndLampDataList.tacNumberList.push(rearLedTacNumber);
      } else {
        rdIndLampDataList.validityList.push("NA");
        rdIndLampDataList.tacNumberList.push("");
      }

      // rdIndLampDataList.validityList.push(finalRearLedValidity);
    //   rdIndLampDataList.tacNumberList.push(rearLedTacNumber);
      rdIndLampDataList.MakeList.push(rearLedMake);
      rdIndLampDataList.suppNameList.push(rearLedMake);

      const { cop: rearCop, possible: rearPossible } = TACvalidationcheck(
        rearLedValidityRaw,
        rearLedCopCert,
        rearLedPossibleDate
      );
      rdIndLampDataList.copCertList.push(rearCop);
      rdIndLampDataList.possibleDateList.push(rearPossible);

      // --- Rear Direction Indicator Bulb ---
      const rearBulb =
        vehDirInd?.Rear_Direction_Indicator_Bulb_Type?.properties || {};
    //   let rearBulbMake = rearBulb?.Make?.value || "";
    //   if (rearBulbMake && !rearBulbMake.startsWith("M/")) {
    //     rearBulbMake = `M/s. ${rearBulbMake}`;
    //   }
    let rearBulbMake = makePrefix(rearBulb?.Make?.value);

      const rearBulbValidityRaw = rearBulb?.TAC_Validity?.value?.trim() || "";
      const rearBulbTacNumber = rearBulb?.TAC_Number?.value || "";
      const rearBulbCopCert =
        rearBulb?.CoP_Cert_No_with_validity_date?.value?.trim() || "";
      const rearBulbPossibleDate =
        rearBulb?.Possible_date_of_submission_of_required_approval?.value?.trim() ||
        "";

      let finalRearBulbValidity = rearBulbValidityRaw;
      if (!rearBulbValidityRaw && rearBulbPossibleDate) {
        finalRearBulbValidity = "NA";
      }
    //   if (finalRearBulbValidity !== "NA") {
    //     rdIndLampDataList.validityLampList.push(rearBulbValidityRaw);
    //   } else {
    //     rdIndLampDataList.validityLampList.push("");
    //   }

    if (finalRearBulbValidity !== "NA") {
        rdIndLampDataList.validityLampList.push(rearBulbValidityRaw);
        rdIndLampDataList.tacNumberLampList.push(rearBulbTacNumber);
      } else {
        rdIndLampDataList.validityLampList.push("NA");
        rdIndLampDataList.tacNumberLampList.push("");
      }

      // rdIndLampDataList.validityLampList.push(finalRearBulbValidity);
    //   rdIndLampDataList.tacNumberLampList.push(rearBulbTacNumber);
      rdIndLampDataList.MakeList.push(rearBulbMake);
      rdIndLampDataList.suppNameLampList.push(rearBulbMake);

      const { cop: rearBulbCop, possible: rearBulbPossible } =
        TACvalidationcheck(
          rearBulbValidityRaw,
          rearBulbCopCert,
          rearBulbPossibleDate
        );
      rdIndLampDataList.copCertLampList.push(rearBulbCop);
      rdIndLampDataList.possibleDateLampList.push(rearBulbPossible);
    }
  });

  // console.log("fdIndLampDataList.suppNameList", fdIndLampDataList.suppNameList);
  // console.log(
  //   "fdIndLampDataList.tacNumberList",
  //   fdIndLampDataList.tacNumberList
  // );
  // console.log("fdIndLampDataList.MakeList", fdIndLampDataList.MakeList);
  // console.log("fdIndLampDataList.tacNumberList", fdIndLampDataList.tacNumberList);
  // console.log("fdIndLampDataList.validityList", fdIndLampDataList.validityList);
  // console.log(
  //   "fdIndLampDataList.possibleDateList",
  //   fdIndLampDataList.possibleDateList
  // );
  // console.log("fdIndLampDataList.copCertList", fdIndLampDataList.copCertList);

  // console.log("sdIndLampDataList.suppNameList", sdIndLampDataList.suppNameList);
  // console.log(
  //   "sdIndLampDataList.tacNumberList",
  //   sdIndLampDataList.tacNumberList
  // );
  // console.log("sdIndLampDataList.MakeList", sdIndLampDataList.MakeList);
  // console.log("sdIndLampDataList.tacNumberList", sdIndLampDataList.tacNumberList);
  // console.log("sdIndLampDataList.validityList", sdIndLampDataList.validityList);
  // console.log(
  //   "sdIndLampDataList.possibleDateList",
  //   sdIndLampDataList.possibleDateList
  // );
  // console.log("sdIndLampDataList.copCertList", sdIndLampDataList.copCertList);

  // console.log("rdIndLampDataList.suppNameList", rdIndLampDataList.suppNameList);
  // console.log(
  //   "rdIndLampDataList.tacNumberList",
  //   rdIndLampDataList.tacNumberList
  // );
  // console.log("rdIndLampDataList.MakeList", rdIndLampDataList.MakeList);
  // console.log("rdIndLampDataList.tacNumberList", rdIndLampDataList.tacNumberList);
  // console.log("rdIndLampDataList.validityList", rdIndLampDataList.validityList);
  // console.log(
  //   "rdIndLampDataList.possibleDateList",
  //   rdIndLampDataList.possibleDateList
  // );
  // console.log("rdIndLampDataList.copCertList", rdIndLampDataList.copCertList);

  // console.log(
  //   "fdIndLampDataList.suppNameLampList",
  //   fdIndLampDataList.suppNameLampList
  // );
  // console.log(
  //   "fdIndLampDataList.tacNumberLampList",
  //   fdIndLampDataList.tacNumberLampList
  // );
  // console.log(
  //   "fdIndLampDataList.validityLampList",
  //   fdIndLampDataList.validityLampList
  // );
  // console.log(
  //   "fdIndLampDataList.possibleDateLampList",
  //   fdIndLampDataList.possibleDateLampList
  // );
  // console.log(
  //   "fdIndLampDataList.copCertLampList",
  //   fdIndLampDataList.copCertLampList
  // );

  // console.log(
  //   "rdIndLampDataList.suppNameLampList",
  //   rdIndLampDataList.suppNameLampList
  // );
  // console.log(
  //   "rdIndLampDataList.tacNumberLampList",
  //   rdIndLampDataList.tacNumberLampList
  // );
  // console.log(
  //   "rdIndLampDataList.validityLampList",
  //   rdIndLampDataList.validityLampList
  // );
  // console.log(
  //   "rdIndLampDataList.possibleDateLampList",
  //   rdIndLampDataList.possibleDateLampList
  // );
  // console.log(
  //   "rdIndLampDataList.copCertLampList",
  //   rdIndLampDataList.copCertLampList
  // );

  
const revLampList = form8Data?.Reversing_Lamp?.ReversingLamp || [];
  let revLampDataList = mainData();

  revLampList.forEach((vehRevLamp) => {
    if (vehRevLamp?.supplier?.active === true) {
      // --- Reversing Lamp ---
      const revLamp = vehRevLamp?.Reversing_Lamp?.properties || {};
    //   let revLampMake = revLamp?.Make?.value || "";
    //   if (revLampMake && !revLampMake.startsWith("M/")) {
    //     revLampMake = `M/s. ${revLampMake}`;
    //   }
    let revLampMake = makePrefix(revLamp?.Make?.value);

      const revLampValidityRaw = revLamp?.TAC_Validity?.value?.trim() || "";
      const revLampTacNumber = revLamp?.TAC_Number?.value || "";
      const revLampCopCert =
        revLamp?.CoP_Cert_No_with_validity_date?.value?.trim() || "";
      const revLampPossibleDate =
        revLamp?.Possible_date_of_submission_of_required_approval?.value?.trim() ||
        "";

      // Fallback logic for Reversing Lamp TAC
      let finalRevLampValidity = revLampValidityRaw;
      if (!revLampValidityRaw && revLampPossibleDate) {
        finalRevLampValidity = "NA";

      }

    //   if (finalRevLampValidity !== "NA") {
    //     revLampDataList.validityList.push(revLampValidityRaw);
    //   } else {
    //     revLampDataList.validityList.push("");
    //   }

    if (finalRevLampValidity !== "NA") {
        revLampDataList.validityList.push(finalRevLampValidity);
        revLampDataList.tacNumberList.push(revLampTacNumber);
      } else {
        revLampDataList.validityList.push("NA");
        revLampDataList.tacNumberList.push("");
      }

      // revLampDataList.validityList.push(finalRevLampValidity);
    //   revLampDataList.tacNumberList.push(revLampTacNumber);
      revLampDataList.MakeList.push(revLampMake);
      revLampDataList.suppNameList.push(revLampMake);

      const { cop, possible } = TACvalidationcheck(
        revLampValidityRaw,
        revLampCopCert,
        revLampPossibleDate
      );
      revLampDataList.copCertList.push(cop);
      revLampDataList.possibleDateList.push(possible);

      // --- Reverse Lamp Bulb ---
      const revBulb = vehRevLamp?.Reverse_Lamp_Bulb_Type?.properties || {};
    //   let revBulbMake = revBulb?.Make?.value || "";
    //   if (revBulbMake && !revBulbMake.startsWith("M/")) {
    //     revBulbMake = `M/s. ${revBulbMake}`;
    //   }
    let revBulbMake = makePrefix(revBulb?.Make?.value);

      const revBulbValidityRaw = revBulb?.TAC_Validity?.value?.trim() || "";
      const revBulbTacNumber = revBulb?.TAC_Number?.value || "";
      const revBulbCopCert =
        revBulb?.CoP_Cert_No_with_validity_date?.value?.trim() || "";
      const revBulbPossibleDate =
        revBulb?.Possible_date_of_submission_of_required_approval?.value?.trim() ||
        "";

      // Fallback logic for Bulb TAC
      let finalRevBulbValidity = revBulbValidityRaw;
      if (!revBulbValidityRaw && revBulbPossibleDate) {
        finalRevBulbValidity = "NA";
      }


    //   if (finalRevBulbValidity !== "NA") {
    //     revLampDataList.validityLampList.push(revBulbValidityRaw);
    //   } else {
    //     revLampDataList.validityLampList.push("");
    //   }

 if (finalRevBulbValidity !== "NA") {
    revLampDataList.validityLampList.push(finalRevBulbValidity);
        revLampDataList.tacNumberLampList.push(revBulbTacNumber);
      } else {
        revLampDataList.validityLampList.push("NA");
        revLampDataList.tacNumberLampList.push("");
      }

      // revLampDataList.validityLampList.push(finalRevBulbValidity);
    //   revLampDataList.tacNumberLampList.push(revBulbTacNumber);
      revLampDataList.MakeList.push(revBulbMake);
      revLampDataList.suppNameLampList.push(revBulbMake);

      const { cop: bulbCop, possible: bulbPossible } = TACvalidationcheck(
        revBulbValidityRaw,
        revBulbCopCert,
        revBulbPossibleDate
      );
      revLampDataList.copCertLampList.push(bulbCop);
      revLampDataList.possibleDateLampList.push(bulbPossible);
    }
  });

  // console.log("revlampdatalist.suppNameList", revLampDataList.suppNameList);
  // console.log("revlampdatalist.copCertList", revLampDataList.copCertList);
  // console.log("revlampdatalist.MakeList", revLampDataList.MakeList);
  // console.log(
  //   "revlampdatalist.possibleDateList",
  //   revLampDataList.possibleDateList
  // );
  // console.log("revlampdatalist.validityList", revLampDataList.validityList);
  // console.log("revlampdatalist.tacNumberList", revLampDataList.tacNumberList);

  
 

  const rrpLampList =
    form8Data?.Rear_Registration_Plate_lamp?.RearRegistrationPlatelamp || [];
  let rrpLampDataList = mainData();

  rrpLampList.forEach((vehRRPLamp) => {
    if (vehRRPLamp?.supplier?.active === true) {
      // --- LED Type ---
      const ledType =
        vehRRPLamp?.Registration_Plate_Lamp_LED_Type?.properties || {};
    //   let ledMake = ledType?.Make?.value || "";
    //   if (ledMake && !ledMake.startsWith("M/")) {
    //     ledMake = `M/s. ${ledMake}`;
    //   }
    let ledMake = makePrefix(ledType?.Make?.value);

      const tacValidityLed = ledType?.TAC_Validity?.value || "";
      const tacNumberLed = ledType?.TAC_Number?.value || "";
      const copCertLed = ledType?.CoP_Cert_No_with_validity_date?.value || "";
      const possibleDateLed =
        ledType?.Possible_date_of_submission_of_required_approval?.value || "";

    //   const isTacLedMissing = tacNumberLed === "";
    //   const isPossibleDateLed = possibleDateLed !== "";

    //   let finalTACLed = tacNumberLed;
    //   if (isTacLedMissing && isPossibleDateLed) {
    //     finalTACLed = "NA";
    //   }

      let finalValidityLed=tacValidityLed;
      if(!tacValidityLed && possibleDateLed){
        finalValidityLed="NA";
      }

    //   if (finalTACLed !== "NA") {
    //     rrpLampDataList.validityList.push(tacValidityLed);
    //   } else {
    //     rrpLampDataList.validityList.push(""); // or skip pushing completely, your choice
    //   }

    if (finalValidityLed !== "NA") {
        rrpLampDataList.validityList.push(finalValidityLed);
        rrpLampDataList.tacNumberList.push(tacNumberLed);
      } else {
        rrpLampDataList.validityList.push("NA");
        rrpLampDataList.tacNumberList.push("");
      }


      // rrpLampDataList.validityList.push(tacValidityLed);
    //   rrpLampDataList.tacNumberList.push(finalTACLed);
      rrpLampDataList.MakeList.push(ledMake);
      rrpLampDataList.suppNameList.push(ledMake);

      const { cop: ledCop, possible: ledPossible } = TACvalidationcheck(
        tacValidityLed,
        copCertLed,
        possibleDateLed
      );
      rrpLampDataList.copCertList.push(ledCop);
      rrpLampDataList.possibleDateList.push(ledPossible);

      // --- Bulb Type ---
      const bulbType =
        vehRRPLamp?.Registration_Plate_Lamp_bulb_type?.properties || {};
    //   let bulbMake = bulbType?.Make?.value || "";
    //   if (bulbMake && !bulbMake.startsWith("M/")) {
    //     bulbMake = `M/s. ${bulbMake}`;
    //   }
    let bulbMake = makePrefix(bulbType?.Make?.value);

      const tacValidityBulb = bulbType?.TAC_Validity?.value || "";
      const tacNumberBulb = bulbType?.TAC_Number?.value || "";
      const copCertBulb = bulbType?.CoP_Cert_No_with_validity_date?.value || "";
      const possibleDateBulb =
        bulbType?.Possible_date_of_submission_of_required_approval?.value || "";

    //   const isTacBulbMissing = tacNumberBulb === "";
    //   const isPossibleDateBulb = possibleDateBulb !== "";

    //   let finalTACBulb = tacNumberBulb;
    //   if (isTacBulbMissing && isPossibleDateBulb) {
    //     finalTACBulb = "NA";
    //   }

    //   if (finalTACBulb !== "NA") {
    //     rrpLampDataList.validityLampList.push(tacValidityBulb);
    //   } else {
    //     rrpLampDataList.validityLampList.push(""); // or skip if you handle index mapping
    //   }


    let finalValiditybulb=tacValidityBulb;
    if(!tacValidityBulb && possibleDateBulb){
        finalValiditybulb="NA";
    }


    if (finalValiditybulb !== "NA") {
        rrpLampDataList.validityLampList.push(finalValiditybulb);
        rrpLampDataList.tacNumberLampList.push(tacNumberBulb);
      } else {
        rrpLampDataList.validityLampList.push("NA");
        rrpLampDataList.tacNumberLampList.push("");
      }


      // rrpLampDataList.validityLampList.push(tacValidityBulb);
    //   rrpLampDataList.tacNumberLampList.push(finalTACBulb);
      rrpLampDataList.MakeList.push(bulbMake);
      rrpLampDataList.suppNameLampList.push(bulbMake);

      const { cop: bulbCop, possible: bulbPossible } = TACvalidationcheck(
        tacValidityBulb,
        copCertBulb,
        possibleDateBulb
      );
      rrpLampDataList.copCertLampList.push(bulbCop);
      rrpLampDataList.possibleDateLampList.push(bulbPossible);
    }
  });

  // console.log("rrpLampDataList.tacNumberList", rrpLampDataList.tacNumberList);
  // console.log("rrpLampDataList.suppNameList", rrpLampDataList.suppNameList);
  // console.log("rrpLampDataList.MakeList", rrpLampDataList.MakeList);
  // console.log("rrpLampDataList.validityList", rrpLampDataList.validityList);
  // console.log(
  //   "rrpLampDataList.possibleDateList",
  //   rrpLampDataList.possibleDateList
  // );
  // console.log("rrpLampDataList.copCertList", rrpLampDataList.copCertList);

  // console.log(
  //   "rrpLampDataList.tacNumberLampList",
  //   rrpLampDataList.tacNumberLampList
  // );
  // console.log(
  //   "rrpLampDataList.suppNameLampList",
  //   rrpLampDataList.suppNameLampList
  // );
  // console.log(
  //   "rrpLampDataList.validityLampList",
  //   rrpLampDataList.validityLampList
  // );
  // console.log(
  //   "rrpLampDataList.possibleDateLampList",
  //   rrpLampDataList.possibleDateLampList
  // );
  // console.log(
  //   "rrpLampDataList.copCertLampList",
  //   rrpLampDataList.copCertLampList
  // );

  
  

  

  const hydrBrakeHoseList =
    form8Data?.Hydraulic_Brake_Hose?.HydraulicBrakeHose || [];
  let hydrBrkHoseDataList = mainData();

  hydrBrakeHoseList.forEach((vehHydr) => {
    if (vehHydr?.supplier?.active === true) {
      const props = vehHydr?.Hydraulic_Brake_Hose?.properties || {};
    //   let make = props?.Make?.value?.trim() || "";
    //   if (make && !make.startsWith("M/")) {
    //     make = `M/s. ${make}`;
    //   }
    let make = makePrefix(props?.Make?.value?.trim());

      const tacRawHydralic = props?.TAC_Number?.value?.trim() || "";
      const tacValidityRaw = props?.TAC_Validity?.value?.trim() || "";
      const copRaw = props?.CoP_Cert_No_with_validity_date?.value || "";
      const possibleRaw =
        props?.Possible_date_of_submission_of_required_approval?.value ||
        "";

    //   const isTacMissing = tacRaw === "";
    //   const isPossibleDatePresent = possibleRaw !== "";
    //   let finalTAC = tacRaw;
    //   if (isTacMissing && isPossibleDatePresent) {
    //     finalTAC = "NA";
    //   }





      let finalValiditybulb=tacValidityRaw;
      if(!tacValidityRaw && possibleRaw){
          finalValiditybulb="NA";
      }
  
  
      if (finalValiditybulb !== "NA") {
        hydrBrkHoseDataList.validityList.push(tacValidityRaw);
        hydrBrkHoseDataList.tacNumberList.push(tacRawHydralic);
        } else {
            hydrBrkHoseDataList.validityList.push("NA");
            hydrBrkHoseDataList.tacNumberList.push("");
        }
  
  





    //   hydrBrkHoseDataList.validityList.push(finalTAC);
    //   hydrBrkHoseDataList.tacNumberList.push(finalTAC);      
      hydrBrkHoseDataList.MakeList.push(make);
      hydrBrkHoseDataList.suppNameList.push(make);

      const { cop:copHydrolic, possible:possibleHydrolic } = TACvalidationcheck(tacValidityRaw, copRaw, possibleRaw);
      hydrBrkHoseDataList.copCertList.push(copHydrolic);
      hydrBrkHoseDataList.possibleDateList.push(possibleHydrolic);
    }
  });

  // console.log(
  //   "hydrBrkHoseDataList.tacNumberList",
  //   hydrBrkHoseDataList.tacNumberList
  // );
  // console.log(
  //   "hydrBrkHoseDataList.validityList",
  //   hydrBrkHoseDataList.validityList
  // );
  // console.log(
  //   "hydrBrkHoseDataList.suppNameList",
  //   hydrBrkHoseDataList.suppNameList
  // );
  // console.log(
  //   "hydrBrkHoseDataList.copCertList",
  //   hydrBrkHoseDataList.copCertList
  // );
  // console.log(
  //   "hydrBrkHoseDataList.possibleDateList",
  //   hydrBrkHoseDataList.possibleDateList
  // );

  
  
  
  const mirrorsList = form8Data?.Rear_View_Mirror?.RearViewMirror || [];
  let rearViewMirrorsDataList = mainData();

  mirrorsList.forEach((vehMirror) => {
    if (vehMirror?.supplier?.active === true) {
      const props = vehMirror?.Rear_View_Mirror?.properties || {};
    //   let make = props?.Make?.value || "";
    //   if (make && !make.startsWith("M/")) {
    //     make = `M/s. ${make}`;
    //   }
    let make = makePrefix(props?.Make?.value);

      const tacRaw = props?.TAC_Number_Its_Validity?.value?.trim() || "";
      const copRaw = props?.CoP_Cert_No_with_validity_date?.value?.trim() || "";
      const possibleRaw =
        props?.Possible_date_of_submission_of_required_approval?.value?.trim() ||
        "";

      const isTacMissing = tacRaw === "";
      const isPossibleDatePresent = possibleRaw !== "";
      let finalTAC = tacRaw;
      if (isTacMissing && isPossibleDatePresent) {
        finalTAC = "NA";
      }

      rearViewMirrorsDataList.tacNumberList.push(finalTAC);
      rearViewMirrorsDataList.MakeList.push(make);
      rearViewMirrorsDataList.suppNameList.push(make);

      const { cop, possible } = TACvalidationcheck(tacRaw, copRaw, possibleRaw);
      rearViewMirrorsDataList.copCertList.push(cop);
      rearViewMirrorsDataList.possibleDateList.push(possible);
    }
  });

  // console.log(
  //   "rearviewmirrorsdatalist.tacNumberList",
  //   rearViewMirrorsDataList.tacNumberList
  // );
  // console.log(
  //   "rearviewmirrorsdatalist.suppNameList",
  //   rearViewMirrorsDataList.suppNameList
  // );
  // console.log(
  //   "rearviewmirrorsdatalist.MakeList",
  //   rearViewMirrorsDataList.MakeList
  // );
  // console.log(
  //   "rearviewmirrorsdatalist.possibleDateList",
  //   rearViewMirrorsDataList.possibleDateList
  // );
  // console.log(
  //   "rearviewmirrorsdatalist.copCertList",
  //   rearViewMirrorsDataList.copCertList
  // );


  const TractionBatterypackList =
    form8Data?.Traction_Battery_Pack?.TractionBatterypack || [];
  let TractionBatterypackDataList = mainData();

  TractionBatterypackList.map((vehTractionBatterypack) => {
    if (vehTractionBatterypack?.supplier?.active === true) {
    //   let make =
    //     vehTractionBatterypack?.Traction_Battery_Pack?.properties?.Make
    //       ?.value || "";

    //   if (make && !make.startsWith("M/")) {
    //     make = `M/s. ${make}`;
    //   }
    let make = makePrefix(
        vehTractionBatterypack?.Traction_Battery_Pack?.properties?.Make?.value
      );
      
      const tacValueRaw =
        vehTractionBatterypack?.Traction_Battery_Pack?.properties?.Type_approval_Certififcate_number?.value?.trim() ||
        "";
      const copCertRaw =
        vehTractionBatterypack?.Traction_Battery_Pack?.properties?.CoP_Cert_No_with_validity_date?.value?.trim() ||
        "";
      const possibleDateRaw =
        vehTractionBatterypack?.Traction_Battery_Pack?.properties?.Possible_date_of_submission_of_required_approval?.value?.trim() ||
        "";

      // Logic for handling TAC when only CoP is present
      const isTacMissing = tacValueRaw === "";
      const isPossibleDatePresent = possibleDateRaw !== "";

      let finalTAC = tacValueRaw;
      if (isTacMissing && isPossibleDatePresent) {
        finalTAC = "NA";
      }

      TractionBatterypackDataList.tacNumberList.push(finalTAC);
      TractionBatterypackDataList.MakeList.push(make);
      TractionBatterypackDataList.suppNameList.push(make);

      const { cop, possible } = TACvalidationcheck(
        tacValueRaw,
        copCertRaw,
        possibleDateRaw
      );
      TractionBatterypackDataList.copCertList.push(cop);
      TractionBatterypackDataList.possibleDateList.push(possible);
    }
  });

  // console.log(
  //   "TractionBatterypackDataList.tacNumberList",
  //   TractionBatterypackDataList.tacNumberList
  // );
  // console.log(
  //   "TractionBatterypackDataList.suppNameList",
  //   TractionBatterypackDataList.suppNameList
  // );
  // console.log(
  //   "TractionBatterypackDataList.MakeList",
  //   TractionBatterypackDataList.MakeList
  // );
  // console.log(
  //   "TractionBatterypackDataList.possibleDateList",
  //   TractionBatterypackDataList.possibleDateList
  // );
  // console.log(
  //   "TractionBatterypackDataList.copCertList",
  //   TractionBatterypackDataList.copCertList
  // );


  const WheelRimList = form8Data?.Wheel_Rim?.WheelRim || [];

  let FWheelRimDataList = mainData();
  let RWheelRimDataList = mainData();
  
  WheelRimList.forEach((vehWheelRim) => {
    if (vehWheelRim?.supplier?.active === true) {
      // ---------------- FRONT WHEEL RIM ----------------
      {
        const props = vehWheelRim?.Front_Wheel_Rim?.properties || {};
  
        let make = makePrefix(props?.Make?.value);
  
        const tacValueRaw =
          props?.BIS_License_TAC_Number_with_its_Validity?.value?.trim() || "";
        const copCertRaw =
          props?.CoP_Cert_No_with_validity_date?.value?.trim() || "";
        const possibleDateRaw =
          props?.Possible_date_of_submission_of_required_approval?.value?.trim() ||
          "";
  
        const isTacMissing = tacValueRaw === "";
        const isPossibleDatePresent = possibleDateRaw !== "";
  
        let finalTAC = tacValueRaw;
        if (isTacMissing && isPossibleDatePresent) {
          finalTAC = "NA"; // ✅ Condition same as Horn logic
        }
  
        FWheelRimDataList.tacNumberList.push(finalTAC);
        FWheelRimDataList.MakeList.push(make);
        FWheelRimDataList.suppNameList.push(make);
  
        const { cop:fWheelCop, possible:fWheelPossibleDate } = TACvalidationcheck(
          tacValueRaw,
          copCertRaw,
          possibleDateRaw
        );
        FWheelRimDataList.copCertList.push(fWheelCop);
        FWheelRimDataList.possibleDateList.push(fWheelPossibleDate);
      }
  
      // ---------------- REAR WHEEL RIM ----------------
      {
        const props = vehWheelRim?.Rear_Wheel_Rim?.properties || {};
  
        let make = makePrefix(props?.Make?.value);
  
        const tacValueRaw =
          props?.BIS_License_TAC_Number_its_Validity?.value?.trim() || "";
        const copCertRaw =
          props?.CoP_Cert_No_with_validity_date?.value?.trim() || "";
        const possibleDateRaw =
          props?.Possible_date_of_submission_of_required_approval?.value?.trim() ||
          "";
  
        const isTacMissing = tacValueRaw === "";
        const isPossibleDatePresent = possibleDateRaw !== "";
  
        let finalTAC = tacValueRaw;
        if (isTacMissing && isPossibleDatePresent) {
          finalTAC = "NA"; // ✅ Condition same as Horn logic
        }
  
        RWheelRimDataList.tacNumberList.push(finalTAC);
        RWheelRimDataList.MakeList.push(make);
        RWheelRimDataList.suppNameList.push(make);
  
        const { cop:rWheelCop, possible:rWheelPossibleDate } = TACvalidationcheck(
          tacValueRaw,
          copCertRaw,
          possibleDateRaw
        );
        RWheelRimDataList.copCertList.push(rWheelCop);
        RWheelRimDataList.possibleDateList.push(rWheelPossibleDate);
      }
    }
  });

  // console.log("FWheelRimDataList.suppNameList", FWheelRimDataList.suppNameList);
  // console.log(
  //   "FWheelRimDataList.tacNumberList",
  //   FWheelRimDataList.tacNumberList
  // );
  // console.log("FWheelRimDataList.MakeList", FWheelRimDataList.MakeList);
  // console.log(
  //   "FWheelRimDataList.possibleDateList",
  //   FWheelRimDataList.possibleDateList
  // );
  // console.log("FWheelRimDataList.copCertList", FWheelRimDataList.copCertList);

  // console.log("RWheelRimDataList.suppNameList", RWheelRimDataList.suppNameList);
  // console.log(
  //   "RWheelRimDataList.tacNumberList",
  //   RWheelRimDataList.tacNumberList
  // );
  // console.log("RWheelRimDataList.MakeList", RWheelRimDataList.MakeList);
  // console.log(
  //   "RWheelRimDataList.possibleDateList",
  //   RWheelRimDataList.possibleDateList
  // );
  // console.log("RWheelRimDataList.copCertList", RWheelRimDataList.copCertList);

  
  
  

  const WindscreenList = form8Data?.Wind_screen?.Windscreen || [];
  let WindscreenDataList = mainData();

  if (twoWheeler) {
    WindscreenDataList.suppNameList = ["NA"];
    WindscreenDataList.tacNumberList = ["NA"];
    WindscreenDataList.possibleDateList = ["NA"];
    WindscreenDataList.copCertList = ["NA"];
    WindscreenDataList.MakeList = ["NA"];
  } else {
    WindscreenList.map((vehWindscreen) => {
      if (vehWindscreen?.supplier?.active === true) {
        // let make = vehWindscreen?.Windscreen?.properties?.Make?.value || "";
        // if (make && !make.startsWith("M/")) {
        //   make = `M/s. ${make}`;
        // }
        let make = makePrefix(vehWindscreen?.Windscreen?.properties?.Make?.value);

        const tacRaw =
          vehWindscreen?.Windscreen?.properties?.BIS_License_Number_Validity?.value?.trim() ||
          "";
        const copCert =
          vehWindscreen?.Windscreen?.properties?.CoP_Cert_No_with_validity_date?.value?.trim() ||
          "";
        const possibleDate =
          vehWindscreen?.Windscreen?.properties?.Possible_date_of_submission_of_required_approval?.value?.trim() ||
          "";

        // TAC fallback logic
        const isTacMissing = tacRaw === "";
        const isPossibleDatePresent = possibleDate !== "";

        let finalTAC = tacRaw;
        if (isTacMissing && isPossibleDatePresent) {
          finalTAC = "NA";
        }

        WindscreenDataList.tacNumberList.push(finalTAC);
        WindscreenDataList.MakeList.push(make);
        WindscreenDataList.suppNameList.push(make);

        const { cop, possible } = TACvalidationcheck(
          tacRaw,
          copCert,
          possibleDate
        );
        WindscreenDataList.copCertList.push(cop);
        WindscreenDataList.possibleDateList.push(possible);
      }
    });
  }

  // console.log(
  //   "windscreendatalist.suppNameList",
  //   WindscreenDataList.suppNameList
  // );
  // console.log(
  //   "windscreendatalist.tacNumberList",
  //   WindscreenDataList.tacNumberList
  // );
  // console.log(
  //   "windscreendatalist.possibleDateList",
  //   WindscreenDataList.possibleDateList
  // );
  // console.log("windscreendatalist.copCertList", WindscreenDataList.copCertList);
  // console.log("windscreendatalist.MakeList", WindscreenDataList.MakeList);

  
 const SideglassList = form8Data?.Side_glass?.Sideglass || [];
  let SideglassDataList = mainData();

  if (twoWheeler) {
    SideglassDataList.suppNameList = ["NA"];
    SideglassDataList.tacNumberList = ["NA"];
    SideglassDataList.possibleDateList = ["NA"];
    SideglassDataList.copCertList = ["NA"];
    SideglassDataList.MakeList = ["NA"];
  } else {
    SideglassList.map((vehSideglass) => {
      if (vehSideglass?.supplier?.active === true) {
        const tacRaw =
          vehSideglass?.Side_Glass?.properties?.BIS_License_Number_Validity?.value?.trim() ||
          "";
        const copCert =
          vehSideglass?.Side_Glass?.properties?.CoP_Cert_No_with_validity_date?.value?.trim() ||
          "";
        const possibleDate =
          vehSideglass?.Side_Glass?.properties?.Possible_date_of_submission_of_required_approval?.value?.trim() ||
          "";

        // let make = vehSideglass?.Side_Glass?.properties?.Make?.value || "";
        // if (make && !make.startsWith("M/")) {
        //   make = `M/s. ${make}`;
        // }
        let make = makePrefix(vehSideglass?.Side_Glass?.properties?.Make?.value);

        // TAC fallback logic
        const isTacMissing = tacRaw === "";
        const isPossibleDatePresent = possibleDate !== "";

        let finalTAC = tacRaw;
        if (isTacMissing && isPossibleDatePresent) {
          finalTAC = "NA";
        }

        SideglassDataList.MakeList.push(make);
        SideglassDataList.suppNameList.push(make);
        SideglassDataList.tacNumberList.push(finalTAC);

        const { cop, possible } = TACvalidationcheck(
          tacRaw,
          copCert,
          possibleDate
        );
        SideglassDataList.copCertList.push(cop);
        SideglassDataList.possibleDateList.push(possible);
      }
    });
  }

  const RearglassList = form8Data?.Rear_glass?.Rearglass || [];
  let RearglassDataList = mainData();

  if (twoWheeler) {
    RearglassDataList.suppNameList = ["NA"];
    RearglassDataList.tacNumberList = ["NA"];
    RearglassDataList.possibleDateList = ["NA"];
    RearglassDataList.copCertList = ["NA"];
    RearglassDataList.MakeList = ["NA"];
  } else {
    RearglassList.map((vehRearglass) => {
      if (vehRearglass?.supplier?.active === true) {
        const tacRaw =
          vehRearglass?.Rear_Glass?.properties?.BIS_License_Number_Validity?.value?.trim() ||
          "";
        const copCert =
          vehRearglass?.Rear_Glass?.properties?.CoP_Cert_No_with_validity_date?.value?.trim() ||
          "";
        const possibleDate =
          vehRearglass?.Rear_Glass?.properties?.Possible_date_of_submission_of_required_approval?.value?.trim() ||
          "";

        // let make = vehRearglass?.Rear_Glass?.properties?.Make?.value || "";
        // if (make && !make.startsWith("M/")) {
        //   make = `M/s. ${make}`;
        // }
        let make = makePrefix(vehRearglass?.Rear_Glass?.properties?.Make?.value);

        const isTacMissing = tacRaw === "";
        const isPossibleDatePresent = possibleDate !== "";

        let finalTAC = tacRaw;
        if (isTacMissing && isPossibleDatePresent) {
          finalTAC = "NA";
        }

        RearglassDataList.MakeList.push(make);
        RearglassDataList.suppNameList.push(make);
        RearglassDataList.tacNumberList.push(finalTAC);

        const { cop, possible } = TACvalidationcheck(
          tacRaw,
          copCert,
          possibleDate
        );
        RearglassDataList.copCertList.push(cop);
        RearglassDataList.possibleDateList.push(possible);
      }
    });
  }

  
 


const WindscreenwipingList = form8Data?.Windscreen_wiping?.Windscreenwiping || [];

let WindscreenwipingDataList = mainData();
let WindscreenWashingDataList = mainData();
let WindscreenWiperDataList = mainData();

if (twoWheeler) {
  // Wiping
  WindscreenwipingDataList.suppNameList = ["NA"];
  WindscreenwipingDataList.tacNumberList = ["NA"];
  WindscreenwipingDataList.possibleDateList = ["NA"];
  WindscreenwipingDataList.copCertList = ["NA"];
  WindscreenwipingDataList.MakeList = ["NA"];

  // Washing
  WindscreenWashingDataList.suppNameList = ["NA"];
  WindscreenWashingDataList.tacNumberList = ["NA"];
  WindscreenWashingDataList.possibleDateList = ["NA"];
  WindscreenWashingDataList.copCertList = ["NA"];
  WindscreenWashingDataList.MakeList = ["NA"];

  // Wiper Blade
  WindscreenWiperDataList.suppNameList = ["NA"];
  WindscreenWiperDataList.tacNumberList = ["NA"];
  WindscreenWiperDataList.possibleDateList = ["NA"];
  WindscreenWiperDataList.copCertList = ["NA"];
  WindscreenWiperDataList.MakeList = ["NA"];
} else {
  WindscreenwipingList.forEach((vehWindscreenwiping) => {
    if (vehWindscreenwiping?.supplier?.active === true) {
      const supplierName = makePrefix(
        vehWindscreenwiping?.supplier?.nameOfSupplier
      );

      // Wiping System
      const tacRaw = vehWindscreenwiping?.Wiping_System?.properties?.TAC_Number_Its_Validity?.value?.trim() || "";
      const copCert = vehWindscreenwiping?.Wiping_System?.properties?.CoP_Cert_No_with_validity_date?.value?.trim() || "";
      const possibleDate = vehWindscreenwiping?.Wiping_System?.properties?.Possible_date_of_submission_of_required_approval?.value?.trim() || "";

      const isTacMissing = tacRaw === "";
      const isPossibleDatePresent = possibleDate !== "";
      let finalTAC = isTacMissing && isPossibleDatePresent ? "NA" : tacRaw;
      const WaipingMake = makePrefix(vehWindscreenwiping?.Wiping_System?.properties?.Make?.value);
      WindscreenwipingDataList.suppNameList.push(WaipingMake);
      WindscreenwipingDataList.MakeList.push(WaipingMake);
      WindscreenwipingDataList.tacNumberList.push(finalTAC);
      const { cop, possible } = TACvalidationcheck(tacRaw, copCert, possibleDate);
      WindscreenwipingDataList.copCertList.push(cop);
      WindscreenwipingDataList.possibleDateList.push(possible);

      // Washing System
      const tacRaw_Washing = vehWindscreenwiping?.Washing_System?.properties?.TAC_Number_Its_Validity?.value?.trim() || "";
      const copCert_Washing = vehWindscreenwiping?.Washing_System?.properties?.CoP_Cert_No_with_validity_date?.value?.trim() || "";
      const possibleDate_Washing = vehWindscreenwiping?.Washing_System?.properties?.Possible_date_of_submission_of_required_approval?.value?.trim() || "";

      const isTacMissing_Washing = tacRaw_Washing === "";
      const isPossibleDatePresent_Washing = possibleDate_Washing !== "";
      let finalTAC_Washing = isTacMissing_Washing && isPossibleDatePresent_Washing ? "NA" : tacRaw_Washing;


      const WashingMake = makePrefix(vehWindscreenwiping?.Washing_System?.properties?.Make?.value);
      WindscreenWashingDataList.suppNameList.push(WashingMake);
      WindscreenWashingDataList.MakeList.push(WashingMake);
      WindscreenWashingDataList.tacNumberList.push(finalTAC_Washing);
      const { cop: copWash, possible: possibleWash } = TACvalidationcheck(tacRaw_Washing, copCert_Washing, possibleDate_Washing);
      WindscreenWashingDataList.copCertList.push(copWash);
      WindscreenWashingDataList.possibleDateList.push(possibleWash);

      // Wiper Blade
      const tacRaw_Wiper = vehWindscreenwiping?.Wiper_Blade?.properties?.TAC_Number_Its_Validity?.value?.trim() || "";
      const copCert_Wiper = vehWindscreenwiping?.Wiper_Blade?.properties?.CoP_Cert_No_with_validity_date?.value?.trim() || "";
      const possibleDate_Wiper = vehWindscreenwiping?.Wiper_Blade?.properties?.Possible_date_of_submission_of_required_approval?.value?.trim() || "";

      const isTacMissing_Wiper = tacRaw_Wiper === "";
      const isPossibleDatePresent_Wiper = possibleDate_Wiper !== "";
      let finalTAC_Wiper = isTacMissing_Wiper && isPossibleDatePresent_Wiper ? "NA" : tacRaw_Wiper;
      const WiperMake = makePrefix(vehWindscreenwiping?.Wiper_Blade?.properties?.Make?.value);
      WindscreenWiperDataList.suppNameList.push(WiperMake);
      WindscreenWiperDataList.MakeList.push(WiperMake);
      WindscreenWiperDataList.tacNumberList.push(finalTAC_Wiper);
      const { cop: copWiper, possible: possibleWiper } = TACvalidationcheck(tacRaw_Wiper, copCert_Wiper, possibleDate_Wiper);
      WindscreenWiperDataList.copCertList.push(copWiper);
      WindscreenWiperDataList.possibleDateList.push(possibleWiper);
    }
  });
}


  

  const SpraySuppressionList =
    form8Data?.Spray_Suppression?.SpraySuppression || [];
  let SpraySuppressionDataList = mainData();

  // Initialize all needed lists as arrays if not already
  SpraySuppressionDataList.suppNameList = Array.isArray(
    SpraySuppressionDataList.suppNameList
  )
    ? SpraySuppressionDataList.suppNameList
    : [];
  SpraySuppressionDataList.MakeList = Array.isArray(
    SpraySuppressionDataList.MakeList
  )
    ? SpraySuppressionDataList.MakeList
    : [];
  SpraySuppressionDataList.tacNumberList = Array.isArray(
    SpraySuppressionDataList.tacNumberList
  )
    ? SpraySuppressionDataList.tacNumberList
    : [];
  SpraySuppressionDataList.possibleDateList = Array.isArray(
    SpraySuppressionDataList.possibleDateList
  )
    ? SpraySuppressionDataList.possibleDateList
    : [];
  SpraySuppressionDataList.copCertList = Array.isArray(
    SpraySuppressionDataList.copCertList
  )
    ? SpraySuppressionDataList.copCertList
    : [];

  SpraySuppressionList.forEach((vehSpraySuppression) => {
    if (vehSpraySuppression?.supplier?.active === true) {
    //   let supplierName = vehSpraySuppression?.supplier?.nameOfSupplier || " ";
    //   let makeValue =
    //     vehSpraySuppression?.Spray_Suppression_System?.properties?.Make
    //       ?.value || " ";

    //   if (supplierName !== "NA" && !supplierName.startsWith("M/")) {
    //     supplierName = `M/s. ${supplierName}`;
    //   }

    //   if (makeValue !== "NA" && !makeValue.startsWith("M/")) {
    //     makeValue = `M/s. ${makeValue}`;
    //   }
    let supplierName = makePrefix(vehSpraySuppression?.supplier?.nameOfSupplier);
    let makeValue = makePrefix(
      vehSpraySuppression?.Spray_Suppression_System?.properties?.Make?.value
    );
    
      const tacRaw =
        vehSpraySuppression?.Spray_Suppression_System?.properties?.TAC_Number
          ?.value || "";
      const tacCheck = parseAndCheckTACValidity(tacRaw);

      SpraySuppressionDataList.tacNumberList.push(tacRaw || "NA");
      SpraySuppressionDataList.MakeList.push(makeValue);

      const copCert =
        vehSpraySuppression?.Spray_Suppression_System?.properties
          ?.CoP_Cert_No_with_validity_date?.value || "NA";
      const possibleDate =
        vehSpraySuppression?.Spray_Suppression_System?.properties
          ?.Possible_date_of_submission_of_required_approval?.value || "NA";

      if (tacCheck.hasDate) {
        if (tacCheck.expired) {
          SpraySuppressionDataList.suppNameList.push(supplierName);
          SpraySuppressionDataList.copCertList.push(copCert);
          SpraySuppressionDataList.possibleDateList.push(possibleDate);
        } else {
          SpraySuppressionDataList.suppNameList.push(supplierName);
          SpraySuppressionDataList.copCertList.push("NA");
          SpraySuppressionDataList.possibleDateList.push("NA");
        }
      } else {
        SpraySuppressionDataList.suppNameList.push(supplierName);
        SpraySuppressionDataList.copCertList.push(copCert);
        SpraySuppressionDataList.possibleDateList.push(possibleDate);
      }
    }
  });

  // console.log(
  //   "spraysuppressiondatalist.suppNameList",
  //   SpraySuppressionDataList.suppNameList
  // );
  // console.log(
  //   "spraysuppressiondatalist.MakeList",
  //   SpraySuppressionDataList.MakeList
  // );
  // console.log(
  //   "spraysuppressiondatalist.tacNumberList",
  //   SpraySuppressionDataList.tacNumberList
  // );
  // console.log(
  //   "spraysuppressiondatalist.possibleDateList",
  //   SpraySuppressionDataList.possibleDateList
  // );
  // console.log(
  //   "spraysuppressiondatalist.copCertList",
  //   SpraySuppressionDataList.copCertList
  // );



  const GrabHandleList = form8Data?.Grab_handle?.Grabhandle || [];
  let GrabHandleDataList = mainData();

  // Ensure suppNameList and MakeList are initialized

  GrabHandleDataList.MakeList = GrabHandleDataList.MakeList || [];

  GrabHandleList.map((GrabHandle) => {
    if (GrabHandle?.supplier?.active === true) {
    //   let makeValue =
    //     GrabHandle?.Grab_handle_Straps?.properties?.Make?.value || "NA";

    //   // Modify makeValue if it does not start with "M/s."
    //   if (makeValue !== "NA" && !makeValue.startsWith("M/")) {
    //     makeValue = `M/s. ${makeValue}`;
    //   }
    let makeValue = makePrefix(
        GrabHandle?.Grab_handle_Straps?.properties?.Make?.value || "NA"
      );
      
      GrabHandleDataList.MakeList.push(makeValue);
    }
  });
  // console.log(
  //   "grabhandle datallist.MakesList:",
  //   GrabHandleDataList.MakeLampList
  // );
  
  
  

  const BrakeFluidList = form8Data?.Brake_Fluid?.BrakeFluid || [];
  let BrakeFluidDataList = mainData();

  // Ensure lists are initialized
  BrakeFluidDataList.suppNameList = BrakeFluidDataList.suppNameList || [];
  BrakeFluidDataList.tacNumberList = BrakeFluidDataList.tacNumberList || [];
  BrakeFluidDataList.MakeList = BrakeFluidDataList.MakeList || [];

  BrakeFluidList.map((vehBrakeFluid) => {
    if (vehBrakeFluid?.supplier?.active === true) {
      let supplierName = vehBrakeFluid?.supplier?.nameOfSupplier || "NA";

      // No M/s prefix for supplier name anymore
      BrakeFluidDataList.suppNameList.push(supplierName);

      BrakeFluidDataList.tacNumberList.push(
        vehBrakeFluid?.Hydraulic_Brake_Fluid?.properties
          ?.Brake_fluid_Test_Report_No?.value
      );

    //   let make =
    //     vehBrakeFluid?.Hydraulic_Brake_Fluid?.properties?.Make?.value || "";
    //   if (make !== "NA" && !make.startsWith("M/s")) {
    //     make = `M/s. ${make}`;
    //   }
    let make = makePrefix(
        vehBrakeFluid?.Hydraulic_Brake_Fluid?.properties?.Make?.value
      );
      
      BrakeFluidDataList.MakeList.push(make);
    }
  });

  // console.log(
  //   "BrakeFluidDataList.suppNameList",
  //   BrakeFluidDataList.suppNameList
  // );
  // console.log(
  //   "BrakeFluidDataList.tacNumberList",
  //   BrakeFluidDataList.tacNumberList
  // );
  // console.log("BrakeFluidDataList.MakeList", BrakeFluidDataList.MakeList);
     const today = new Date();
const formattedDate = today.toLocaleDateString("en-GB");
  const form8Document = new Document({
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
              left: "0.2cm",
            },
          },
        },
        {
          id: "paragrapgBold",
          name: "paragrapgBold",
          basedOn: "Normal",
          run: {
            bold: true,
            size: "12pt",
          },
        },
        {
          id: "redColorText",
          name: "redColorText",
          basedOn: "Normal",
          run: {
            color: "#FF0000",
            size: "11pt",
            bold: true,
          },
        },
      ],
    },
    sections: [
      {
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Table 8 of AIS-007 (Revision 5)",
                    bold: true,
                    size: "18pt",
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        },
        children: [
          new Table({
            // width: {
            //     size: 10000,
            //     type: WidthType.DXA
            // },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "Rule No.",
                            size: "12pt",
                          }),
                          new TextRun({
                            bold: true,
                            color: "#FF0000",
                            text: "C1",
                            size: "12pt",
                            break: 2,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Subject",
                            size: "12pt",
                            bold: true,
                          }),
                          new TextRun({
                            bold: true,
                            color: "#FF0000",
                            size: "12pt",
                            break: 3,
                            text: "C2",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "Name of the Manufacturer",
                          }),
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            break: 2,
                            text: "( Please give information for every supplier / vendor under the same para, separate lines )",
                          }),
                          new TextRun({
                            bold: true,
                            color: "#FF0000",
                            size: "12pt",
                            break: 3,
                            text: "C3",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "TAC No. / BIS License No / Test Report No. as applicable.(indicate validity date)",
                          }),
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            break: 2,
                            text: "(Application Ref No. allotted by concerned Test Agency,  If approval is in the process )",
                          }),
                          new TextRun({
                            bold: true,
                            color: "#FF0000",
                            size: "12pt",
                            break: 3,
                            text: "C4",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "Possible date of submission of required approval, if the same is in process",
                          }),
                          new TextRun({
                            bold: true,
                            color: "#FF0000",
                            size: "12pt",
                            break: 3,
                            text: "C5",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "CoP Cert No. with validity date (where ever applicable)",
                          }),
                          new TextRun({
                            bold: true,
                            color: "#FF0000",
                            size: "12pt",
                            break: 3,
                            text: "C6",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "95",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Tyres",
                            size: "12pt",
                            bold: true,
                          }),
                          new TextRun({
                            size: "12pt",
                            break: 2,
                            text: "(Compliance to IS 15633 / IS 15627/IS 15636)",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  
                 
                 
                 
              new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Front",
                            size: "12pt",
                            bold: true,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: ftyreDataList.MakeList.join(","),
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    // children: [
                    //     new Paragraph(
                    //         {
                    //             style: "table1Header",
                    //             children: [
                    //               new TextRun({
                    //                     size: "12pt",
                    //                     bold: true,
                    //                     text: "TAC No and Validity"
                    //                 }),
                    //                 new TextRun({
                    //                     size: "12pt",
                    //                     bold: true,
                    //                     text: ftyreDataList.validityList.join(",")
                    //                 })
                    //             ]
                    //         }
                    //     )
                    // ]
                    children: [
                        ...(getTACorBISHeader(ftyreDataList.validityList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getTACorBISHeader(
                                    ftyreDataList.validityList
                                  ),
                                }),
                              ],
                            }),
                          ]
                          : []),

                      // Always show the joined data, even if empty or "NA"
                      // new Paragraph({
                      //   style: "table1Header",
                      //   children: [
                      //     new TextRun({
                      //       size: "12pt",
                      //       bold: true,
                      //       text: ftyreDataList.validityList.join(", "),
                      //     }),
                      //   ],
                      // }),

                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: (() => {
                              const label = getTACorBISHeader(ftyreDataList.validityList);
                              return label.startsWith("BIS")
                                ? ftyreDataList.validityList
                                    .map(item => {
                                      const match = item.match(validDateRegex);
                                      const numberPart = match
                                        ? item.slice(0, match.index).trim()
                                        : item.trim();
                                      const datePart = match ? item.slice(match.index).trim() : "";
                                      return `CM/L-${numberPart}${datePart ? " " + datePart : ""}`;
                                    })
                                    .join(", ")
                                : ftyreDataList.validityList.join(", ");
                            })(),
                          }),
                        ],
                      })
                      
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                   
                    children: [
                        ...(getPossibleDateHeader(ftyreDataList.possibleDateList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getPossibleDateHeader(
                                    ftyreDataList.possibleDateList
                                  ),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: ftyreDataList.possibleDateList.join(", "),
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    // children: [
                    //     new Paragraph(
                    //         {
                    //             style: "table1Header",
                    //             children: [
                    //                 new TextRun({
                    //                     size: "12pt",
                    //                     bold: true,
                    //                     text: ftyreDataList.copCertList.join(",")
                    //                 })
                    //             ]
                    //         }
                    //     )
                    // ]
                    children: [
                        ...(getCOPHeader(ftyreDataList.copCertList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getCOPHeader(ftyreDataList.copCertList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: ftyreDataList.copCertList.join(", "),
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Rear",
                            size: "12pt",
                            bold: true,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: rtyreDataList.MakeList.join(","),
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    // children: [
                    //     new Paragraph(
                    //         {
                    //             style: "table1Header",
                    //             children: [
                    //                 new TextRun({
                    //                     size: "12pt",
                    //                     bold: true,
                    //                     text: rtyreDataList.validityList.join(",")
                    //                 })
                    //             ]
                    //         }
                    //     )
                    // ]

                    children: [
                      // Show heading only if there is valid data
                      ...(getTACorBISHeader(rtyreDataList.validityList)
                      ? [
                          new Paragraph({
                            style: "table1Header",
                            children: [
                              new TextRun({
                                size: "12pt",
                                bold: true,
                                text: getTACorBISHeader(
                                    rtyreDataList.validityList
                                ),
                              }),
                            ],
                          }),
                        ]
                        : []),

                      // Always show the joined data, even if empty or "NA"
                      // new Paragraph({
                      //   style: "table1Header",
                      //   children: [
                      //     new TextRun({
                      //       size: "12pt",
                      //       bold: true,
                      //       text: rtyreDataList.validityList.join(", "),
                      //     }),
                      //   ],
                      // }),
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: (() => {
                              const label = getTACorBISHeader(rtyreDataList.validityList);
                              return label.startsWith("BIS")
                                ? rtyreDataList.validityList
                                    .map(item => {
                                      const match = item.match(validDateRegex);
                                      const numberPart = match
                                        ? item.slice(0, match.index).trim()
                                        : item.trim();
                                      const datePart = match
                                        ? item.slice(match.index).trim()
                                        : "";
                                      return `CM/L-${numberPart}${datePart ? " " + datePart : ""}`;
                                    })
                                    .join(", ")
                                : rtyreDataList.validityList.join(", ");
                            })(),
                          }),
                        ],
                      }),
                      
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    // children: [
                    //     new Paragraph(
                    //         {
                    //             style: "table1Header",
                    //             children: [
                    //                 new TextRun({
                    //                     size: "12pt",
                    //                     bold: true,
                    //                     text: rtyreDataList.possibleDateList.join(",")
                    //                 })
                    //             ]
                    //         }
                    //     )
                    // ]

                    children: [
                        ...(getPossibleDateHeader(rtyreDataList.possibleDateList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getPossibleDateHeader(
                                    rtyreDataList.possibleDateList
                                  ),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: rtyreDataList.possibleDateList.join(", "),
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },               

                    children: [
                        ...(getCOPHeader(rtyreDataList.copCertList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getCOPHeader(rtyreDataList.copCertList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: rtyreDataList.copCertList.join(", "),
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
             
         
              // ✅ Building the TableRow
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 1000, type: WidthType.DXA },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ bold: true, text: "", size: "12pt" }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Spare wheel (as applicable)",
                            size: "12pt",
                            bold: true,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: atyreDataList.MakeList.join(", "),
                          }),
                        ],
                      }),
                    ],
                  }),
                  // ✅ TAC/BIS Column
                  new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    children: [
                      ...(getTACorBISHeader(atyreDataList.validityList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getTACorBISHeader(
                                    atyreDataList.validityList
                                  ),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      // new Paragraph({
                      //   style: "table1Header",
                      //   children: [
                      //     new TextRun({
                      //       size: "12pt",
                      //       bold: true,
                      //       text: atyreDataList.validityList.join(", "),
                      //     }),
                      //   ],
                      // }),
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: (() => {
                              const label = getTACorBISHeader(atyreDataList.validityList);
                              return label.startsWith("BIS")
                                ? atyreDataList.validityList
                                    .map(item => {
                                      const match = item.match(validDateRegex);
                                      const numberPart = match
                                        ? item.slice(0, match.index).trim()
                                        : item.trim();
                                      const datePart = match
                                        ? item.slice(match.index).trim()
                                        : "";
                                      return `CM/L-${numberPart}${datePart ? " " + datePart : ""}`;
                                    })
                                    .join(", ")
                                : atyreDataList.validityList.join(", ");
                            })(),
                          }),
                        ],
                      }),
                      
                    ],
                  }),
                  // ✅ Possible Date Column
                  new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    children: [
                      ...(getPossibleDateHeader(atyreDataList.possibleDateList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getPossibleDateHeader(
                                    atyreDataList.possibleDateList
                                  ),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: atyreDataList.possibleDateList.join(", "),
                          }),
                        ],
                      }),
                    ],
                  }),
                  // ✅ COP Column
                  new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    children: [
                      ...(getCOPHeader(atyreDataList.copCertList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getCOPHeader(atyreDataList.copCertList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: atyreDataList.copCertList.join(", "),
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "100",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Safety Glass",
                            size: "12pt",
                            bold: true,
                          }),
                          new TextRun({
                            text: "Windscreen",
                            size: "12pt",
                            break: 1,
                          }),
                          new TextRun({
                            text: "Side",
                            size: "12pt",
                            break: 1,
                          }),
                          new TextRun({
                            text: "Rear",
                            size: "12pt",
                            break: 1,
                          }),
                          new TextRun({
                            text: "(For  3 & 4 Wheeler)",
                            size: "12pt",
                            break: 1,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: WindscreenDataList.suppNameList.join(","),
                          }),
                          new TextRun({
                            break: 1,
                            size: "12pt",
                            bold: true,
                            text: SideglassDataList.suppNameList.join(","),
                          }),
                          new TextRun({
                            break: 1,
                            size: "12pt",
                            bold: true,
                            text: RearglassDataList.suppNameList.join(","),
                          }),
                        ],
                      }),
                    ],
                  }),
                
                
                new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    children: [
                      ...(getTACorBISHeader(WindscreenDataList.tacNumberList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getTACorBISHeader(WindscreenDataList.tacNumberList),
                                }),
                              ],
                            }),
                          ]
                        : getTACorBISHeader(SideglassDataList.tacNumberList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getTACorBISHeader(SideglassDataList.tacNumberList),
                                }),
                              ],
                            }),
                          ]
                        : getTACorBISHeader(RearglassDataList.tacNumberList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getTACorBISHeader(RearglassDataList.tacNumberList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      
                     
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: (() => {
                              const label = getTACorBISHeader(WindscreenDataList.tacNumberList);
                              return label.startsWith("BIS")
                                ? WindscreenDataList.tacNumberList
                                    .map(item => {
                                      const match = item.match(validDateRegex);
                                      const numberPart = match
                                        ? item.slice(0, match.index).trim()
                                        : item.trim();
                                      const datePart = match ? item.slice(match.index).trim() : "";
                                      return `CM/L-${numberPart}${datePart ? " " + datePart : ""}`;
                                    })
                                    .join(", ")
                                : WindscreenDataList.tacNumberList.join(", ");
                            })(),
                          }),
                          new TextRun({ break: 1 }),
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: (() => {
                              const label = getTACorBISHeader(SideglassDataList.tacNumberList);
                              return label.startsWith("BIS")
                                ? SideglassDataList.tacNumberList
                                    .map(item => {
                                      const match = item.match(validDateRegex);
                                      const numberPart = match
                                        ? item.slice(0, match.index).trim()
                                        : item.trim();
                                      const datePart = match ? item.slice(match.index).trim() : "";
                                      return `CM/L-${numberPart}${datePart ? " " + datePart : ""}`;
                                    })
                                    .join(", ")
                                : SideglassDataList.tacNumberList.join(", ");
                            })(),
                          }),
                          new TextRun({ break: 1 }),
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: (() => {
                              const label = getTACorBISHeader(RearglassDataList.tacNumberList);
                              return label.startsWith("BIS")
                                ? RearglassDataList.tacNumberList
                                    .map(item => {
                                      const match = item.match(validDateRegex);
                                      const numberPart = match
                                        ? item.slice(0, match.index).trim()
                                        : item.trim();
                                      const datePart = match ? item.slice(match.index).trim() : "";
                                      return `CM/L-${numberPart}${datePart ? " " + datePart : ""}`;
                                    })
                                    .join(", ")
                                : RearglassDataList.tacNumberList.join(", ");
                            })(),
                          }),
                        ],
                      }),
                      
                    ],
                  }),
                  

               
              

                new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    children: [
                      ...(getPossibleDateHeader(WindscreenDataList.possibleDateList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getPossibleDateHeader(WindscreenDataList.possibleDateList),
                                }),
                              ],
                            }),
                          ]
                        : getPossibleDateHeader(SideglassDataList.possibleDateList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getPossibleDateHeader(SideglassDataList.possibleDateList),
                                }),
                              ],
                            }),
                          ]
                        : getPossibleDateHeader(RearglassDataList.possibleDateList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getPossibleDateHeader(RearglassDataList.possibleDateList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: WindscreenDataList.possibleDateList.join(","),
                          }),
                          new TextRun({
                            break: 1,
                            size: "12pt",
                            bold: true,
                            text: SideglassDataList.possibleDateList.join(","),
                          }),
                          new TextRun({
                            break: 1,
                            size: "12pt",
                            bold: true,
                            text: RearglassDataList.possibleDateList.join(","),
                          }),
                        ],
                      }),
                    ],
                  }),
                  
               
               

                new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    children: [
                      ...(getCOPHeader(WindscreenDataList.copCertList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getCOPHeader(WindscreenDataList.copCertList),
                                }),
                              ],
                            }),
                          ]
                        : getCOPHeader(SideglassDataList.copCertList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getCOPHeader(SideglassDataList.copCertList),
                                }),
                              ],
                            }),
                          ]
                        : getCOPHeader(RearglassDataList.copCertList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getCOPHeader(RearglassDataList.copCertList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: WindscreenDataList.copCertList.join(","),
                          }),
                          new TextRun({
                            break: 1,
                            size: "12pt",
                            bold: true,
                            text: SideglassDataList.copCertList.join(","),
                          }),
                          new TextRun({
                            break: 1,
                            size: "12pt",
                            bold: true,
                            text: RearglassDataList.copCertList.join(","),
                          }),
                        ],
                      }),
                    ],
                  }),
                  
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "101",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Windscreen Wiping System",
                            size: "12pt",
                            bold: true,
                          }),
                          new TextRun({
                            text: "Wiping System",
                            size: "12pt",
                            break: 1,
                          }),
                          new TextRun({
                            text: "Washing System",
                            size: "12pt",
                            break: 1,
                          }),
                          new TextRun({
                            text: "Wiper Blade",
                            size: "12pt",
                            break: 1,
                          }),
                          new TextRun({
                            text: "(For 3 & 4 Wheelers)",
                            size: "12pt",
                            break: 1,
                          }),
                        ],
                      }),
                    ],
                  }),
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         children: [
                //           new TextRun({
                //             text: [
                //                 ...WindscreenwipingDataList.suppNameList,
                //                 ...WindscreenWashingDataList.suppNameList,
                //                 ...WindscreenWiperDataList.suppNameList,
                //               ].join("\n\r"),                           
                //             size: "12pt",
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),
                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          ...[
                            ...WindscreenwipingDataList.suppNameList,
                            ...WindscreenWashingDataList.suppNameList,
                            ...WindscreenWiperDataList.suppNameList,
                          ].map(name => new TextRun({ text: name, break: 1, size: 24 })) // break:1 adds a line break
                        ],
                      }),
                    ],
                  }),
                  

                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         children: [
                //           new TextRun({
                //             // text: WindscreenwipingDataList.tacNumberList.join(
                //             //   "\n\r"
                //             // ),
                //             text: [
                //                 ...WindscreenwipingDataList.tacNumberList,
                //                 ...WindscreenWashingDataList.tacNumberList,
                //                 ...WindscreenWiperDataList.tacNumberList,
                //               ].join("\n\r"),
                //             size: "12pt",
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),
                new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    children: [
                      ...(getTACorBISHeader(WindscreenwipingDataList.tacNumberList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getTACorBISHeader(WindscreenwipingDataList.tacNumberList),
                                }),
                              ],
                            }),
                          ]
                        : getTACorBISHeader(WindscreenWashingDataList.tacNumberList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getTACorBISHeader(WindscreenWashingDataList.tacNumberList),
                                }),
                              ],
                            }),
                          ]
                        : getTACorBISHeader(WindscreenWiperDataList.tacNumberList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getTACorBISHeader(WindscreenWiperDataList.tacNumberList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      // new Paragraph({
                      //   children: [
                      //     new TextRun({
                      //       size: "12pt",
                      //       text: WindscreenwipingDataList.tacNumberList.join(", "),
                      //     }),
                      //     new TextRun({
                      //       break: 1,
                      //       size: "12pt",
                      //       text: WindscreenWashingDataList.tacNumberList.join(", "),
                      //     }),
                      //     new TextRun({
                      //       break: 1,
                      //       size: "12pt",
                      //       text: WindscreenWiperDataList.tacNumberList.join(", "),
                      //     }),
                      //   ],
                      // }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: (() => {
                              const label = getTACorBISHeader(WindscreenwipingDataList.tacNumberList);
                              return label.startsWith("BIS")
                                ? WindscreenwipingDataList.tacNumberList
                                    .map(item => {
                                      const match = item.match(validDateRegex);
                                      const numberPart = match
                                        ? item.slice(0, match.index).trim()
                                        : item.trim();
                                      const datePart = match ? item.slice(match.index).trim() : "";
                                      return `CM/L-${numberPart}${datePart ? " " + datePart : ""}`;
                                    })
                                    .join(", ")
                                : WindscreenwipingDataList.tacNumberList.join(", ");
                            })(),
                          }),
                          new TextRun({ break: 1 }),
                          new TextRun({
                            size: "12pt",
                            text: (() => {
                              const label = getTACorBISHeader(WindscreenWashingDataList.tacNumberList);
                              return label.startsWith("BIS")
                                ? WindscreenWashingDataList.tacNumberList
                                    .map(item => {
                                      const match = item.match(validDateRegex);
                                      const numberPart = match
                                        ? item.slice(0, match.index).trim()
                                        : item.trim();
                                      const datePart = match ? item.slice(match.index).trim() : "";
                                      return `CM/L-${numberPart}${datePart ? " " + datePart : ""}`;
                                    })
                                    .join(", ")
                                : WindscreenWashingDataList.tacNumberList.join(", ");
                            })(),
                          }),
                          new TextRun({ break: 1 }),
                          new TextRun({
                            size: "12pt",
                            text: (() => {
                              const label = getTACorBISHeader(WindscreenWiperDataList.tacNumberList);
                              return label.startsWith("BIS")
                                ? WindscreenWiperDataList.tacNumberList
                                    .map(item => {
                                      const match = item.match(validDateRegex);
                                      const numberPart = match
                                        ? item.slice(0, match.index).trim()
                                        : item.trim();
                                      const datePart = match ? item.slice(match.index).trim() : "";
                                      return `CM/L-${numberPart}${datePart ? " " + datePart : ""}`;
                                    })
                                    .join(", ")
                                : WindscreenWiperDataList.tacNumberList.join(", ");
                            })(),
                          }),
                        ],
                      }),
                      
                    ],
                  }),
                  
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         children: [
                //           new TextRun({
                //             // text: WindscreenwipingDataList.possibleDateList.join(
                //             //   "\n\r"
                //             // ),
                //             text: [
                //                 ...WindscreenwipingDataList.possibleDateList,
                //                 ...WindscreenWashingDataList.possibleDateList,
                //                 ...WindscreenWiperDataList.possibleDateList,
                //               ].join("\n\r"),
                //             size: "12pt",
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),

                new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    children: [
                      ...(getPossibleDateHeader(WindscreenwipingDataList.possibleDateList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getPossibleDateHeader(WindscreenwipingDataList.possibleDateList),
                                }),
                              ],
                            }),
                          ]
                        : getPossibleDateHeader(WindscreenWashingDataList.possibleDateList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getPossibleDateHeader(WindscreenWashingDataList.possibleDateList),
                                }),
                              ],
                            }),
                          ]
                        : getPossibleDateHeader(WindscreenWiperDataList.possibleDateList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getPossibleDateHeader(WindscreenWiperDataList.possibleDateList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: WindscreenwipingDataList.possibleDateList.join(", "),
                          }),
                          new TextRun({
                            break: 1,
                            size: "12pt",
                            text: WindscreenWashingDataList.possibleDateList.join(", "),
                          }),
                          new TextRun({
                            break: 1,
                            size: "12pt",
                            text: WindscreenWiperDataList.possibleDateList.join(", "),
                          }),
                        ],
                      }),
                    ],
                  }),

                  
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         children: [
                //           new TextRun({
                //             // text: WindscreenwipingDataList.copCertList.join(
                //             //   "\n\r"
                //             // ),
                //             text: [
                //                 ...WindscreenwipingDataList.copCertList,
                //                 ...WindscreenWashingDataList.copCertList,
                //                 ...WindscreenWiperDataList.copCertList,
                //               ].join("\n\r"),
                //             size: "12pt",
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),

                new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    children: [
                      ...(getCOPHeader(WindscreenwipingDataList.copCertList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getCOPHeader(WindscreenwipingDataList.copCertList),
                                }),
                              ],
                            }),
                          ]
                        : getCOPHeader(WindscreenWashingDataList.copCertList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getCOPHeader(WindscreenWashingDataList.copCertList),
                                }),
                              ],
                            }),
                          ]
                        : getCOPHeader(WindscreenWiperDataList.copCertList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getCOPHeader(WindscreenWiperDataList.copCertList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: WindscreenwipingDataList.copCertList.join(", "),
                          }),
                          new TextRun({
                            break: 1,
                            size: "12pt",
                            text: WindscreenWashingDataList.copCertList.join(", "),
                          }),
                          new TextRun({
                            break: 1,
                            size: "12pt",
                            text: WindscreenWiperDataList.copCertList.join(", "),
                          }),
                        ],
                      }),
                    ],
                  }),
                  


                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "104",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Reflex Reflector",
                            size: "12pt",
                            bold: true,
                          }),
                          new TextRun({
                            text: "Front, White",
                            size: "12pt",
                            break: 1,
                          }),
                          new TextRun({
                            text: "Rear, Red",
                            size: "12pt",
                            break: 1,
                          }),
                          new TextRun({
                            text: "Side, Amber",
                            size: "12pt",
                            break: 1,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: reflDataList.frontWhiteList.MakeList.join(
                              ", "
                            ),
                          }),
                          new TextRun({ break: 1 }),
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: reflDataList.rearRedList.MakeList.join(", "),
                          }),
                          new TextRun({ break: 1 }),
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: reflDataList.sideAmberList.MakeList.join(
                              ", "
                            ),
                          }),
                        ],
                      }),
                    ],
                  }),
                  


new TableCell({
  width: { size: 3000, type: WidthType.DXA },
  children: [
    // ✅ Conditional header from first valid list
    ...(() => {
      let selectedList = null;

      if (reflDataList.frontWhiteList.tacNumberList.length > 0) {
        selectedList = reflDataList.frontWhiteList;
      } else if (reflDataList.rearRedList.tacNumberList.length > 0) {
        selectedList = reflDataList.rearRedList;
      } else if (reflDataList.sideAmberList.tacNumberList.length > 0) {
        selectedList = reflDataList.sideAmberList;
      }

      if (!selectedList) return [];

      const combined = selectedList.tacNumberList.map((tac, idx) =>
        `${tac} ${selectedList.validityList[idx] || ""}`
      );

      const headerText = getTACorBISHeader(combined);

      return headerText
        ? [
            new Paragraph({
              style: "table1Header",
              children: [
                new TextRun({
                  size: "12pt",
                  bold: true,
                  text: headerText,
                }),
              ],
            }),
          ]
        : [];
    })(),

    // ✅ Main TAC/validity content with conditional CM/L- and inline logic
    new Paragraph({
      style: "table1Header",
      children: [
        // Front White List
        ...(() => {
          const isBIS = getTACorBISHeader(reflDataList.frontWhiteList.tacNumberList).startsWith("BIS");
          return reflDataList.frontWhiteList.tacNumberList.map((tacNumber, index) => {
            const validity = reflDataList.frontWhiteList.validityList[index] || "";
            const prefix = isBIS ? "CM/L-" : "";
            return new TextRun({
              size: 24,
              bold: true,
              text: `${prefix}${tacNumber.trim()}${validity ? " " + validity.trim() : ""} `,
            });
          });
        })(),
    
        new TextRun({ break: 1 }),
    
        // Rear Red List
        ...(() => {
          const isBIS = getTACorBISHeader(reflDataList.rearRedList.tacNumberList).startsWith("BIS");
          return reflDataList.rearRedList.tacNumberList.map((tacNumber, index) => {
            const validity = reflDataList.rearRedList.validityList[index] || "";
            const prefix = isBIS ? "CM/L-" : "";
            return new TextRun({
              size: 24,
              bold: true,
              text: `${prefix}${tacNumber.trim()}${validity ? " " + validity.trim() : ""} `,
            });
          });
        })(),
    
        new TextRun({ break: 1 }),
    
        // Side Amber List
        ...(() => {
          const isBIS = getTACorBISHeader(reflDataList.sideAmberList.tacNumberList).startsWith("BIS");
          return reflDataList.sideAmberList.tacNumberList.map((tacNumber, index) => {
            const validity = reflDataList.sideAmberList.validityList[index] || "";
            const prefix = isBIS ? "CM/L-" : "";
            return new TextRun({
              size: 24,
              bold: true,
              text: `${prefix}${tacNumber.trim()}${validity ? " " + validity.trim() : ""} `,
            });
          });
        })(),
      ],
    }),
    
  ],
}),


new TableCell({
    width: { size: 3000, type: WidthType.DXA },
    children: [
      // ✅ Conditional header (first non-empty one only)
      ...(
        (() => {
          const headerSources = [
            reflDataList.frontWhiteList.possibleDateList,
            reflDataList.rearRedList.possibleDateList,
            reflDataList.sideAmberList.possibleDateList,
          ];
  
          for (const source of headerSources) {
            const header = getPossibleDateHeader(source);
            if (header) {
              return [
                new Paragraph({
                  style: "table1Header",
                  children: [
                    new TextRun({
                      size: "12pt",
                      bold: true,
                      text: header,
                    }),
                  ],
                }),
              ];
            }
          }
          return [];
        })()
      ),
  
      // ✅ Main content with line breaks
      new Paragraph({
        style: "table1Header",
        children: [
          new TextRun({
            size: "12pt",
            bold: true,
            text: reflDataList.frontWhiteList.possibleDateList.join(","),
          }),
          new TextRun({
            break: 1,
            size: "12pt",
            bold: true,
            text: reflDataList.rearRedList.possibleDateList.join(","),
          }),
          new TextRun({
            break: 1,
            size: "12pt",
            bold: true,
            text: reflDataList.sideAmberList.possibleDateList.join(","),
          }),
        ],
      }),
    ],
  }),
  

            
        

new TableCell({
    width: { size: 3000, type: WidthType.DXA },
    children: [
      // ✅ Conditional header (first non-empty one only)
      ...(
        (() => {
          const headerSources = [
            reflDataList.frontWhiteList.copCertList,
            reflDataList.rearRedList.copCertList,
            reflDataList.sideAmberList.copCertList,
          ];
  
          for (const source of headerSources) {
            const header = getCOPHeader(source);
            if (header) {
              return [
                new Paragraph({
                  style: "table1Header",
                  children: [
                    new TextRun({
                      size: "12pt",
                      bold: true,
                      text: header,
                    }),
                  ],
                }),
              ];
            }
          }
          return [];
        })()
      ),
  
      // ✅ Main content with line breaks
      new Paragraph({
        style: "table1Header",
        children: [
          new TextRun({
            size: "12pt",
            bold: true,
            text: reflDataList.frontWhiteList.copCertList.join(","),
          }),
          new TextRun({
            break: 1,
            size: "12pt",
            bold: true,
            text: reflDataList.rearRedList.copCertList.join(","),
          }),
          new TextRun({
            break: 1,
            size: "12pt",
            bold: true,
            text: reflDataList.sideAmberList.copCertList.join(","),
          }),
        ],
      }),
    ],
  }),
  

                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "CNG / LPG Kit",
                            size: "12pt",
                            bold: true,
                          }),
                          new TextRun({
                            text: "Components",
                            size: "12pt",
                            break: 1,
                            bold: true,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Cylinder (as per Gas Cylinder Rule, 2004)",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Cylinder Valve / Multi-Function Valve (as per Gas Cylinder Rule, 2004)",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "CNG / LPG Pressure Regulator",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "CNG / LPG Gas Solenoid  Valve",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "CNG / LPG Gas Air Mixer",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Petrol Solenoid valve",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "CNG/LPG Rigid Pipe",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "CNG/ LPG High Pressure Flexible Hose",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "CNG/ LPG Low Pressure Flexible Hose",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Electrical Fuses",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Ventilation Hose/ Conduit",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Electrical Wiring Harness",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Seat Upholstery, Roof, Side linings",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Non-moisture retaining Hard rubber for cylinder mounting (as applicable)",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "104-1",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Reflective Tape For 3 & 4-Wheelers",
                            size: "12pt",
                            bold: true,
                          }),
                          new TextRun({
                            text: "Front, White",
                            size: "12pt",
                            break: 1,
                          }),
                          new TextRun({
                            text: "Rear, Red",
                            size: "12pt",
                            break: 1,
                          }),
                          new TextRun({
                            text: "Side, Yellow",
                            size: "12pt",
                            break: 1,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: reflDataList.frontWhiteListt.MakeList.join(
                              ", "
                            ),
                          }),
                          new TextRun({ break: 1 }),
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: reflDataList.rearRedListt.MakeList.join(", "),
                          }),
                          new TextRun({ break: 1 }),
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: reflDataList.sideAmberListt.MakeList.join(
                              ", "
                            ),
                          }),
                        ],
                      }),
                    ],
                  }),

               
                

                new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    children: [
                      // ✅ Conditionally add the header from the first valid list only
                      ...(() => {
                        let selectedList = null;
                  
                        if (reflDataList.frontWhiteListt.tacNumberList.length > 0) {
                          selectedList = reflDataList.frontWhiteListt;
                        } else if (reflDataList.rearRedListt.tacNumberList.length > 0) {
                          selectedList = reflDataList.rearRedListt;
                        } else if (reflDataList.sideAmberListt.tacNumberList.length > 0) {
                          selectedList = reflDataList.sideAmberListt;
                        }
                  
                        if (!selectedList) return [];
                  
                        const combinedList = selectedList.tacNumberList.map((tac, idx) =>
                          `${tac} ${selectedList.validityList[idx] || ""}`
                        );
                  
                        const headerText = getTACorBISHeader(combinedList);
                  
                        return headerText
                          ? [
                              new Paragraph({
                                style: "table1Header",
                                children: [
                                  new TextRun({
                                    size: "12pt",
                                    bold: true,
                                    text: headerText,
                                  }),
                                ],
                              }),
                            ]
                          : [];
                      })(),
                  
                      // ✅ Paragraph with TAC numbers and validity from all three lists (unchanged)
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          // frontWhiteList
                          ...reflDataList.frontWhiteListt.tacNumberList.map((tacNumber, index) => {
                            const validity = reflDataList.frontWhiteListt.validityList[index] || "";
                            return new TextRun({
                              size: 24,
                              bold: true,
                              text: `${tacNumber} ${validity} `,
                            });
                          }),
                  
                          new TextRun({ break: 1 }),
                  
                          // rearRedList
                          ...reflDataList.rearRedListt.tacNumberList.map((tacNumber, index) => {
                            const validity = reflDataList.rearRedListt.validityList[index] || "";
                            return new TextRun({
                              size: 24,
                              bold: true,
                              text: `${tacNumber} ${validity} `,
                            });
                          }),
                  
                          new TextRun({ break: 1 }),
                  
                          // sideAmberList
                          ...reflDataList.sideAmberListt.tacNumberList.map((tacNumber, index) => {
                            const validity = reflDataList.sideAmberListt.validityList[index] || "";
                            return new TextRun({
                              size: 24,
                              bold: true,
                              text: `${tacNumber} ${validity} `,
                            });
                          }),
                        ],
                      }),
                    ],
                  }),
                  
                  

                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         style: "table1Header",
                //         children: [
                //           new TextRun({
                //             size: "12pt",
                //             bold: true,
                //             text: reflDataList.frontWhiteListt.possibleDateList.join(
                //               ","
                //             ),
                //           }),
                //           new TextRun({
                //             break: 1,
                //             size: "12pt",
                //             bold: true,
                //             text: reflDataList.rearRedListt.possibleDateList.join(
                //               ","
                //             ),
                //           }),
                //           new TextRun({
                //             break: 1,
                //             size: "12pt",
                //             bold: true,
                //             text: reflDataList.sideAmberListt.possibleDateList.join(
                //               ","
                //             ),
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      // Conditional header for possibleDateList (first non-empty header)
                      ...(getPossibleDateHeader(reflDataList.frontWhiteListt.possibleDateList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getPossibleDateHeader(reflDataList.frontWhiteListt.possibleDateList),
                                }),
                              ],
                            }),
                          ]
                        : getPossibleDateHeader(reflDataList.rearRedListt.possibleDateList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getPossibleDateHeader(reflDataList.rearRedListt.possibleDateList),
                                }),
                              ],
                            }),
                          ]
                        : getPossibleDateHeader(reflDataList.sideAmberListt.possibleDateList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getPossibleDateHeader(reflDataList.sideAmberListt.possibleDateList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                  
                      // Main paragraph showing joined possibleDateList with line breaks
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: reflDataList.frontWhiteListt.possibleDateList.join(", "),
                          }),
                          new TextRun({
                            break: 1,
                            size: "12pt",
                            bold: true,
                            text: reflDataList.rearRedListt.possibleDateList.join(", "),
                          }),
                          new TextRun({
                            break: 1,
                            size: "12pt",
                            bold: true,
                            text: reflDataList.sideAmberListt.possibleDateList.join(", "),
                          }),
                        ],
                      }),
                    ],
                  }),

                  
               

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      // Conditional COP header (first valid header from any list)
                      ...(getCOPHeader(reflDataList.frontWhiteListt.copCertList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getCOPHeader(reflDataList.frontWhiteListt.copCertList),
                                }),
                              ],
                            }),
                          ]
                        : getCOPHeader(reflDataList.rearRedListt.copCertList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getCOPHeader(reflDataList.rearRedListt.copCertList),
                                }),
                              ],
                            }),
                          ]
                        : getCOPHeader(reflDataList.sideAmberListt.copCertList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getCOPHeader(reflDataList.sideAmberListt.copCertList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                  
                      // Paragraph with COP certificates joined and line breaks
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: reflDataList.frontWhiteListt.copCertList.join(", "),
                          }),
                          new TextRun({
                            break: 1,
                            size: "12pt",
                            bold: true,
                            text: reflDataList.rearRedListt.copCertList.join(", "),
                          }),
                          new TextRun({
                            break: 1,
                            size: "12pt",
                            bold: true,
                            text: reflDataList.sideAmberListt.copCertList.join(", "),
                          }),
                        ],
                      }),
                    ],
                  }),
                  

                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "104-D",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Rear marking Plates for Heavy and long vehicles",
                            size: "12pt",
                            bold: true,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "118",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Speed Limiter Installation Test Report as per AIS-018 (SLD / SLF)",
                            size: "12pt",
                            bold: true,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "119",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Horns(s)",
                            size: "12pt",
                            bold: true,
                          }),
                          new TextRun({
                            text: "Horn Installation (For all vehicles)",
                            size: "12pt",
                            break: 1,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: hornDataList.suppNameList.join("\n\r"),
                          }),
                        ],
                      }),
                    ],
                  }),
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         style: "table1Header",
                //         children: [
                //           new TextRun({
                //             size: "12pt",
                //             bold: true,
                //             text: hornDataList.validityList.join(","),
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getTACorBISHeader(hornDataList.validityList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getTACorBISHeader(hornDataList.validityList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      // new Paragraph({
                      //   style: "table1Header",
                      //   children: [
                      //     new TextRun({
                      //       size: "12pt",
                      //       bold: true,
                      //       text: hornDataList.validityList.join(", "),
                      //     }),
                      //   ],
                      // }),

                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: (() => {
                              const label = getTACorBISHeader(hornDataList.validityList);
                              return label.startsWith("BIS")
                                ? hornDataList.validityList
                                    .map(item => {
                                      const match = item.match(validDateRegex);
                                      const numberPart = match
                                        ? item.slice(0, match.index).trim()
                                        : item.trim();
                                      const datePart = match ? item.slice(match.index).trim() : "";
                                      return `CM/L-${numberPart}${datePart ? " " + datePart : ""}`;
                                    })
                                    .join(", ")
                                : hornDataList.validityList.join(", ");
                            })(),
                          }),
                        ],
                      }),                    
                      
                    ],
                  }),
                  
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         style: "table1Header",
                //         children: [
                //           new TextRun({
                //             size: "12pt",
                //             bold: true,
                //             text: hornDataList.possibleDateList.join(","),
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getPossibleDateHeader(hornDataList.possibleDateList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getPossibleDateHeader(hornDataList.possibleDateList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: hornDataList.possibleDateList.join(", "),
                          }),
                        ],
                      }),
                    ],
                  }),
                  
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         style: "table1Header",
                //         children: [
                //           new TextRun({
                //             size: "12pt",
                //             bold: true,
                //             text: hornDataList.copCertList.join(","),
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),

                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getCOPHeader(hornDataList.copCertList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getCOPHeader(hornDataList.copCertList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: hornDataList.copCertList.join(", "),
                          }),
                        ],
                      }),
                    ],
                  }),

                  
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "123",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Pillion Hand Holds",
                            size: "12pt",
                            bold: true,
                          }),
                          new TextRun({
                            text: "(For all vehicles)",
                            size: "12pt",
                            break: 1,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            text: GrabHandleDataList.MakeList.join("\n\r"),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "124/1",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Automotive Bulbs",
                            size: "12pt",
                            bold: true,
                          }),
                          new TextRun({
                            text: "( Mention category of bulb/s as per AIS-034 )",
                            size: "12pt",
                            break: 1,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Main Beam head Lamp",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            // text: hlMainBeamDataList.suppNameList.join("\n\r"),
                            text: hlMainBeamDataList.suppNameLampList.join(
                              "\n\r"
                            ),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
               
                

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(
                        getTACorBISHeader(
                          hlMainBeamDataList.tacNumberLampList.map((tac, idx) => 
                            `${tac} ${hlMainBeamDataList.validityLampList[idx] || ""}`
                          )
                        )
                          ? [
                              new Paragraph({
                                style: "table1Header",
                                children: [
                                  new TextRun({
                                    size: "12pt",
                                    bold: true,
                                    text: getTACorBISHeader(
                                      hlMainBeamDataList.tacNumberLampList.map((tac, idx) => 
                                        `${tac} ${hlMainBeamDataList.validityLampList[idx] || ""}`
                                      )
                                    ),
                                  }),
                                ],
                              }),
                            ]
                          : []
                      ),
                      // new Paragraph({
                      //   children: [
                      //     new TextRun({
                      //       text: hlMainBeamDataList.tacNumberLampList.join(", "),
                      //       size: "12pt",
                      //     }),
                      //     new TextRun({
                      //       text: " ",
                      //       size: "12pt",
                      //     }),
                      //     new TextRun({
                      //       text: hlMainBeamDataList.validityLampList.join(", "),
                      //       size: "12pt",
                      //     }),
                      //   ],
                      // }),

                      new Paragraph({
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: (() => {
                              const combinedList = hlMainBeamDataList.tacNumberLampList.map((tac, idx) =>
                                `${tac} ${hlMainBeamDataList.validityLampList[idx] || ""}`
                              );
                      
                              const isBIS = getTACorBISHeader(combinedList).startsWith("BIS");
                      
                              return combinedList
                                .map(item => {
                                  const match = item.match(validDateRegex);
                                  const numberPart = match ? item.slice(0, match.index).trim() : item.trim();
                                  const datePart = match ? item.slice(match.index).trim() : "";
                                  return `${isBIS ? "CM/L-" : ""}${numberPart}${datePart ? " " + datePart : ""}`;
                                })
                                .join(", ");
                            })(),
                          }),
                        ],
                      })
                      
                    ],
                  }),
                  
                  
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         children: [
                //           new TextRun({
                //             text: hlMainBeamDataList.possibleDateLampList.join(
                //               ","
                //             ),
                //             size: "12pt",
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),
                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getPossibleDateHeader(hlMainBeamDataList.possibleDateLampList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getPossibleDateHeader(hlMainBeamDataList.possibleDateLampList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: hlMainBeamDataList.possibleDateLampList.join(", "),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         children: [
                //           new TextRun({
                //             text: hlMainBeamDataList.copCertLampList.join(","),
                //             size: "12pt",
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getCOPHeader(hlMainBeamDataList.copCertLampList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getCOPHeader(hlMainBeamDataList.copCertLampList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: hlMainBeamDataList.copCertLampList.join(", "),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  

                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Dipped Beam Head Lamp",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            // text: hlDipBeamDataList.suppNameList.join("\n\r"),
                            text: hlDipBeamDataList.suppNameLampList.join(
                              "\n\r"
                            ),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         children: [
                //           new TextRun({
                //             text: hlDipBeamDataList.tacNumberLampList.join(","),
                //             size: "12pt",
                //           }),
                //           new TextRun({
                //             text: " ",
                //             size: "12pt",
                //           }),
                //           new TextRun({
                //             text: hlDipBeamDataList.validityLampList.join(","),
                //             size: "12pt",
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),
                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(
                        getTACorBISHeader(
                          hlDipBeamDataList.tacNumberLampList.map((tac, idx) =>
                            `${tac} ${hlDipBeamDataList.validityLampList[idx] || ""}`
                          )
                        )
                          ? [
                              new Paragraph({
                                style: "table1Header",
                                children: [
                                  new TextRun({
                                    size: "12pt",
                                    bold: true,
                                    text: getTACorBISHeader(
                                      hlDipBeamDataList.tacNumberLampList.map((tac, idx) =>
                                        `${tac} ${hlDipBeamDataList.validityLampList[idx] || ""}`
                                      )
                                    ),
                                  }),
                                ],
                              }),
                            ]
                          : []
                      ),
                      // new Paragraph({
                      //   children: [
                      //     new TextRun({
                      //       text: hlDipBeamDataList.tacNumberLampList.join(","),
                      //       size: "12pt",
                      //     }),
                      //     new TextRun({
                      //       text: " ",
                      //       size: "12pt",
                      //     }),
                      //     new TextRun({
                      //       text: hlDipBeamDataList.validityLampList.join(","),
                      //       size: "12pt",
                      //     }),
                      //   ],
                      // }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: (() => {
                              const combinedList = hlDipBeamDataList.tacNumberLampList.map((tac, idx) =>
                                `${tac} ${hlDipBeamDataList.validityLampList[idx] || ""}`
                              );
                      
                              const isBIS = getTACorBISHeader(combinedList).startsWith("BIS");
                      
                              return combinedList
                                .map(item => {
                                  const match = item.match(validDateRegex);
                                  const numberPart = match ? item.slice(0, match.index).trim() : item.trim();
                                  const datePart = match ? item.slice(match.index).trim() : "";
                                  return `${isBIS ? "CM/L-" : ""}${numberPart}${datePart ? " " + datePart : ""}`;
                                })
                                .join(", ");
                            })(),
                          }),
                        ],
                      }),
                      
                    ],
                  }),
                  
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         children: [
                //           new TextRun({
                //             text: hlDipBeamDataList.possibleDateLampList.join(
                //               ","
                //             ),
                //             size: "12pt",
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(
                        getPossibleDateHeader(hlDipBeamDataList.possibleDateLampList)
                          ? [
                              new Paragraph({
                                style: "table1Header",
                                children: [
                                  new TextRun({
                                    size: "12pt",
                                    bold: true,
                                    text: getPossibleDateHeader(hlDipBeamDataList.possibleDateLampList),
                                  }),
                                ],
                              }),
                            ]
                          : []
                      ),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: hlDipBeamDataList.possibleDateLampList.join(","),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         children: [
                //           new TextRun({
                //             text: hlDipBeamDataList.copCertLampList.join(","),
                //             size: "12pt",
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),
                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(
                        getCOPHeader(hlDipBeamDataList.copCertLampList)
                          ? [
                              new Paragraph({
                                style: "table1Header",
                                children: [
                                  new TextRun({
                                    size: "12pt",
                                    bold: true,
                                    text: getCOPHeader(hlDipBeamDataList.copCertLampList),
                                  }),
                                ],
                              }),
                            ]
                          : []
                      ),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: hlDipBeamDataList.copCertLampList.join(","),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Daytime Running Lamp",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: dtRunnLampDataList.suppNameList.join("\n\r"),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),



new TableCell({
    width: {
      size: 3000,
      type: WidthType.DXA,
    },
    children: [
      ...(getTACorBISHeader(dtRunnLampDataList.validityList)
        ? [
            new Paragraph({
              style: "table1Header",
              children: [
                new TextRun({
                  size: "12pt",
                  bold: true,
                  text: getTACorBISHeader(dtRunnLampDataList.validityList),
                }),
              ],
            }),
          ]
        : []),
     



    new Paragraph({
        children: [
          new TextRun({
            size: "12pt",
            text: (() => {
              const label = getTACorBISHeader(dtRunnLampDataList.validityList);
              return label.startsWith("BIS")
                ? dtRunnLampDataList.validityList
                    .map(item => {
                      const match = item.match(validDateRegex);
                      const numberPart = match
                        ? item.slice(0, match.index).trim()
                        : item.trim();
                      const datePart = match ? item.slice(match.index).trim() : "";
                      return `CM/L-${numberPart}${datePart ? " " + datePart : ""}`;
                    })
                    .join(", ")
                : dtRunnLampDataList.validityList.join(", ");
            })(),
          }),
        ],
      }),
      
      
    ],
  }),
  
  // Possible Date Cell
  new TableCell({
    width: {
      size: 3000,
      type: WidthType.DXA,
    },
    children: [
      ...(getPossibleDateHeader(dtRunnLampDataList.possibleDateList)
        ? [
            new Paragraph({
              style: "table1Header",
              children: [
                new TextRun({
                  size: "12pt",
                  bold: true,
                  text: getPossibleDateHeader(dtRunnLampDataList.possibleDateList),
                }),
              ],
            }),
          ]
        : []),
      new Paragraph({
        children: [
          new TextRun({
            text: dtRunnLampDataList.possibleDateList.join(","),
            size: "12pt",
          }),
        ],
      }),
    ],
  }),
  
  // COP Certificate Cell
  new TableCell({
    width: {
      size: 3000,
      type: WidthType.DXA,
    },
    children: [
      ...(getCOPHeader(dtRunnLampDataList.copCertList)
        ? [
            new Paragraph({
              style: "table1Header",
              children: [
                new TextRun({
                  size: "12pt",
                  bold: true,
                  text: getCOPHeader(dtRunnLampDataList.copCertList),
                }),
              ],
            }),
          ]
        : []),
      new Paragraph({
        children: [
          new TextRun({
            text: dtRunnLampDataList.copCertList.join(","),
            size: "12pt",
          }),
        ],
      }),
    ],
  }),
  

                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    rowSpan: 3,
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Cornering Lamp",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "NA",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "NA",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "NA",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "NA",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Front Position / parking lamp ",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: frontPosLampDataList.suppNameLampList.join(
                              "\n\r"
                            ),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
               
               
                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(
                        getTACorBISHeader(
                          frontPosLampDataList.tacNumberLampList.map(
                            (tac, idx) => `${tac} ${frontPosLampDataList.validityLampList[idx] || ""}`
                          )
                        )
                          ? [
                              new Paragraph({
                                style: "table1Header",
                                children: [
                                  new TextRun({
                                    size: "12pt",
                                    bold: true,
                                    text: getTACorBISHeader(
                                      frontPosLampDataList.tacNumberLampList.map(
                                        (tac, idx) => `${tac} ${frontPosLampDataList.validityLampList[idx] || ""}`
                                      )
                                    ),
                                  }),
                                ],
                              }),
                            ]
                          : []
                      ),
                      
                      new Paragraph({
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: (() => {
                              const combinedList = frontPosLampDataList.tacNumberLampList.map((tac, idx) =>
                                `${tac} ${frontPosLampDataList.validityLampList[idx] || ""}`
                              );
                      
                              const isBIS = getTACorBISHeader(combinedList).startsWith("BIS");
                      
                              return combinedList
                                .map(item => {
                                  const match = item.match(validDateRegex);
                                  const numberPart = match ? item.slice(0, match.index).trim() : item.trim();
                                  const datePart = match ? item.slice(match.index).trim() : "";
                                  return `${isBIS ? "CM/L-" : ""}${numberPart}${datePart ? " " + datePart : ""}`;
                                })
                                .join(", ");
                            })(),
                          }),
                        ],
                      })
                      
                    ],
                  }),
                  
                
                




                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getPossibleDateHeader(frontPosLampDataList.possibleDateLampList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getPossibleDateHeader(frontPosLampDataList.possibleDateLampList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: frontPosLampDataList.possibleDateLampList.join(", "),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getCOPHeader(frontPosLampDataList.copCertLampList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getCOPHeader(frontPosLampDataList.copCertLampList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: frontPosLampDataList.copCertLampList.join(", "),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),

                  

                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Front Fog Lamp",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Front Direction",
                            size: "12pt",
                          }),
                          new TextRun({
                            break: 1,
                            text: "Indicator Lamp",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: fdIndLampDataList.suppNameLampList.join(
                              "\n\r"
                            ),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         children: [
                //           new TextRun({
                //             text: fdIndLampDataList.tacNumberLampList.join(","),
                //             size: "12pt",
                //           }),
                //           new TextRun({
                //             text: " ",
                //             size: "12pt",
                //           }),
                //           new TextRun({
                //             text: fdIndLampDataList.validityLampList.join(","),
                //             size: "12pt",
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getTACorBISHeader(
                        fdIndLampDataList.tacNumberLampList.map((tac, idx) =>
                          `${tac} ${fdIndLampDataList.validityLampList[idx] || ""}`
                        )
                      )
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getTACorBISHeader(
                                    fdIndLampDataList.tacNumberLampList.map((tac, idx) =>
                                      `${tac} ${fdIndLampDataList.validityLampList[idx] || ""}`
                                    )
                                  ),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      // new Paragraph({
                      //   children: [
                      //     new TextRun({
                      //       text: fdIndLampDataList.tacNumberLampList.join(","),
                      //       size: "12pt",
                      //     }),
                      //     new TextRun({
                      //       text: " ",
                      //       size: "12pt",
                      //     }),
                      //     new TextRun({
                      //       text: fdIndLampDataList.validityLampList.join(","),
                      //       size: "12pt",
                      //     }),
                      //   ],
                      // }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: (() => {
                              const combinedList = fdIndLampDataList.tacNumberLampList.map((tac, idx) =>
                                `${tac} ${fdIndLampDataList.validityLampList[idx] || ""}`
                              );
                      
                              const isBIS = getTACorBISHeader(combinedList).startsWith("BIS");
                      
                              return combinedList
                                .map(item => {
                                  const match = item.match(validDateRegex);
                                  const numberPart = match ? item.slice(0, match.index).trim() : item.trim();
                                  const datePart = match ? item.slice(match.index).trim() : "";
                                  return `${isBIS ? "CM/L-" : ""}${numberPart}${datePart ? " " + datePart : ""}`;
                                })
                                .join(", ");
                            })(),
                          }),
                        ],
                      }),
                      
                    ],
                  }),
                  
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         children: [
                //           new TextRun({
                //             text: fdIndLampDataList.possibleDateLampList.join(
                //               ","
                //             ),
                //             size: "12pt",
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getPossibleDateHeader(fdIndLampDataList.possibleDateLampList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getPossibleDateHeader(fdIndLampDataList.possibleDateLampList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: fdIndLampDataList.possibleDateLampList.join(","),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),

                  
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         children: [
                //           new TextRun({
                //             text: fdIndLampDataList.copCertLampList.join(","),
                //             size: "12pt",
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getCOPHeader(fdIndLampDataList.copCertLampList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getCOPHeader(fdIndLampDataList.copCertLampList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: fdIndLampDataList.copCertLampList.join(", "),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  

                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Front End-out Marker Lamp",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "NA",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "NA",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "NA",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "NA",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Side Direction Indicator lamp",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        // children: [
                        //     new TextRun({
                        //         text: sdIndLampDataList.suppNameList.join("\n\r"),
                        //         size: "12pt"
                        //     })
                        // ]
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        // children: [
                        //     new TextRun({
                        //         text: sdIndLampDataList.tacNumberList.join(","),
                        //         size: "12pt"
                        //     }),
                        //     new TextRun({
                        //         text: " ",
                        //         size: "12pt",
                        //     }),
                        //     new TextRun({
                        //         text: sdIndLampDataList.validityList.join(","),
                        //         size: "12pt"
                        //     }),
                        // ]
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        // children: [
                        //     new TextRun({
                        //         text: sdIndLampDataList.possibleDateList.join(","),
                        //         size: "12pt"
                        //     })
                        // ]
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        // children: [
                        //     new TextRun({
                        //         text: sdIndLampDataList.copCertList.join(","),
                        //         size: "12pt"
                        //     })
                        // ]
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Side Marker lamp",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Stop Lamp",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: stopLampDataList.suppNameLampList.join(
                              "\n\r"
                            ),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         children: [
                //           new TextRun({
                //             text: stopLampDataList.tacNumberLampList.join(","),
                //             size: "12pt",
                //           }),
                //           new TextRun({
                //             text: " ",
                //             size: "12pt",
                //           }),
                //           new TextRun({
                //             text: stopLampDataList.validityLampList.join(","),
                //             size: "12pt",
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(
                        getTACorBISHeader(
                          stopLampDataList.tacNumberLampList.map((tac, idx) =>
                            `${tac} ${stopLampDataList.validityLampList[idx] || ""}`
                          )
                        )
                          ? [
                              new Paragraph({
                                style: "table1Header",
                                children: [
                                  new TextRun({
                                    size: "12pt",
                                    bold: true,
                                    text: getTACorBISHeader(
                                      stopLampDataList.tacNumberLampList.map((tac, idx) =>
                                        `${tac} ${stopLampDataList.validityLampList[idx] || ""}`
                                      )
                                    ),
                                  }),
                                ],
                              }),
                            ]
                          : []
                      ),
                      // new Paragraph({
                      //   children: [
                      //     new TextRun({
                      //       text: stopLampDataList.tacNumberLampList.join(", "),
                      //       size: "12pt",
                      //     }),
                      //     new TextRun({
                      //       text: " ",
                      //       size: "12pt",
                      //     }),
                      //     new TextRun({
                      //       text: stopLampDataList.validityLampList.join(", "),
                      //       size: "12pt",
                      //     }),
                      //   ],
                      // }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: (() => {
                              const combinedList = stopLampDataList.tacNumberLampList.map((tac, idx) =>
                                `${tac} ${stopLampDataList.validityLampList[idx] || ""}`
                              );
                      
                              const isBIS = getTACorBISHeader(combinedList).startsWith("BIS");
                      
                              return combinedList
                                .map(item => {
                                  const match = item.match(validDateRegex);
                                  const numberPart = match ? item.slice(0, match.index).trim() : item.trim();
                                  const datePart = match ? item.slice(match.index).trim() : "";
                                  return `${isBIS ? "CM/L-" : ""}${numberPart}${datePart ? " " + datePart : ""}`;
                                })
                                .join(", ");
                            })(),
                          }),
                        ],
                      }),
                      
                    ],
                  }),
                  
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         children: [
                //           new TextRun({
                //             text: stopLampDataList.possibleDateLampList.join(
                //               ","
                //             ),
                //             size: "12pt",
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getPossibleDateHeader(stopLampDataList.possibleDateLampList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getPossibleDateHeader(stopLampDataList.possibleDateLampList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: stopLampDataList.possibleDateLampList.join(", "),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         children: [
                //           new TextRun({
                //             text: stopLampDataList.copCertLampList.join(","),
                //             size: "12pt",
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getCOPHeader(stopLampDataList.copCertLampList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getCOPHeader(stopLampDataList.copCertLampList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: stopLampDataList.copCertLampList.join(", "),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Rear Direction indicator Lamp",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: rdIndLampDataList.suppNameLampList.join(
                              "\n\r"
                            ),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         children: [
                //           new TextRun({
                //             text: rdIndLampDataList.tacNumberLampList.join(","),
                //             size: "12pt",
                //           }),
                //           new TextRun({
                //             text: " ",
                //             size: "12pt",
                //           }),
                //           new TextRun({
                //             text: rdIndLampDataList.validityLampList.join(","),
                //             size: "12pt",
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),
                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(
                        getTACorBISHeader(
                          rdIndLampDataList.tacNumberLampList.map((tac, idx) =>
                            `${tac} ${rdIndLampDataList.validityLampList[idx] || ""}`
                          )
                        )
                          ? [
                              new Paragraph({
                                style: "table1Header",
                                children: [
                                  new TextRun({
                                    size: "12pt",
                                    bold: true,
                                    text: getTACorBISHeader(
                                      rdIndLampDataList.tacNumberLampList.map((tac, idx) =>
                                        `${tac} ${rdIndLampDataList.validityLampList[idx] || ""}`
                                      )
                                    ),
                                  }),
                                ],
                              }),
                            ]
                          : []
                      ),
                      // new Paragraph({
                      //   children: [
                      //     new TextRun({
                      //       text: rdIndLampDataList.tacNumberLampList.join(", "),
                      //       size: "12pt",
                      //     }),
                      //     new TextRun({
                      //       text: " ",
                      //       size: "12pt",
                      //     }),
                      //     new TextRun({
                      //       text: rdIndLampDataList.validityLampList.join(", "),
                      //       size: "12pt",
                      //     }),
                      //   ],
                      // }),

                      new Paragraph({
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: (() => {
                              const combinedList = rdIndLampDataList.tacNumberLampList.map((tac, idx) =>
                                `${tac} ${rdIndLampDataList.validityLampList[idx] || ""}`
                              );
                      
                              const isBIS = getTACorBISHeader(combinedList).startsWith("BIS");
                      
                              return combinedList
                                .map(item => {
                                  const match = item.match(validDateRegex);
                                  const numberPart = match ? item.slice(0, match.index).trim() : item.trim();
                                  const datePart = match ? item.slice(match.index).trim() : "";
                                  return `${isBIS ? "CM/L-" : ""}${numberPart}${datePart ? " " + datePart : ""}`;
                                })
                                .join(", ");
                            })(),
                          }),
                        ],
                      }),
                      
                    ],
                  }),
                  
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         children: [
                //           new TextRun({
                //             text: rdIndLampDataList.possibleDateLampList.join(
                //               ","
                //             ),
                //             size: "12pt",
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getPossibleDateHeader(rdIndLampDataList.possibleDateLampList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getPossibleDateHeader(rdIndLampDataList.possibleDateLampList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: rdIndLampDataList.possibleDateLampList.join(","),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         children: [
                //           new TextRun({
                //             text: rdIndLampDataList.copCertLampList.join(","),
                //             size: "12pt",
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getCOPHeader(rdIndLampDataList.copCertLampList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getCOPHeader(rdIndLampDataList.copCertLampList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: rdIndLampDataList.copCertLampList.join(","),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Rear Position / Parking Lamp",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: rearPosLampDataList.suppNameLampList.join(
                              "\n\r"
                            ),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         children: [
                //           new TextRun({
                //             text: rearPosLampDataList.tacNumberLampList.join(
                //               ","
                //             ),
                //             size: "12pt",
                //           }),
                //           new TextRun({
                //             text: " ",
                //             size: "12pt",
                //           }),
                //           new TextRun({
                //             text: rearPosLampDataList.validityLampList.join(
                //               ","
                //             ),
                //             size: "12pt",
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getTACorBISHeader(
                        rearPosLampDataList.tacNumberLampList.map((tac, idx) =>
                          `${tac} ${rearPosLampDataList.validityLampList[idx] || ""}`
                        )
                      )
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getTACorBISHeader(
                                    rearPosLampDataList.tacNumberLampList.map((tac, idx) =>
                                      `${tac} ${rearPosLampDataList.validityLampList[idx] || ""}`
                                    )
                                  ),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      // new Paragraph({
                      //   children: [
                      //     new TextRun({
                      //       text: rearPosLampDataList.tacNumberLampList.join(", "),
                      //       size: "12pt",
                      //     }),
                      //     new TextRun({
                      //       text: " ",
                      //       size: "12pt",
                      //     }),
                      //     new TextRun({
                      //       text: rearPosLampDataList.validityLampList.join(", "),
                      //       size: "12pt",
                      //     }),
                      //   ],
                      // }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: (() => {
                              const combinedList = rearPosLampDataList.tacNumberLampList.map((tac, idx) =>
                                `${tac} ${rearPosLampDataList.validityLampList[idx] || ""}`
                              );
                      
                              const isBIS = getTACorBISHeader(combinedList).startsWith("BIS");
                      
                              return combinedList
                                .map(item => {
                                  const match = item.match(validDateRegex);
                                  const numberPart = match ? item.slice(0, match.index).trim() : item.trim();
                                  const datePart = match ? item.slice(match.index).trim() : "";
                                  return `${isBIS ? "CM/L-" : ""}${numberPart}${datePart ? " " + datePart : ""}`;
                                })
                                .join(", ");
                            })(),
                          }),
                        ],
                      }),
                      
                    ],
                  }),
                  
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         children: [
                //           new TextRun({
                //             text: rearPosLampDataList.possibleDateLampList.join(
                //               ","
                //             ),
                //             size: "12pt",
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getPossibleDateHeader(rearPosLampDataList.possibleDateLampList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getPossibleDateHeader(rearPosLampDataList.possibleDateLampList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: rearPosLampDataList.possibleDateLampList.join(", "),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         children: [
                //           new TextRun({
                //             text: rearPosLampDataList.copCertLampList.join(","),
                //             size: "12pt",
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),


                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getCOPHeader(rearPosLampDataList.copCertLampList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getCOPHeader(rearPosLampDataList.copCertLampList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: rearPosLampDataList.copCertLampList.join(", "),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  
                  
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Reversing Lamp",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: revLampDataList.suppNameLampList.join("\n\r"),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         children: [
                //           new TextRun({
                //             text: revLampDataList.tacNumberLampList.join(","),
                //             size: "12pt",
                //           }),
                //           new TextRun({
                //             text: " ",
                //             size: "12pt",
                //           }),
                //           new TextRun({
                //             text: revLampDataList.validityLampList.join(","),
                //             size: "12pt",
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getTACorBISHeader(
                        revLampDataList.tacNumberLampList.map((tac, idx) =>
                          `${tac} ${revLampDataList.validityLampList[idx] || ""}`
                        )
                      )
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getTACorBISHeader(
                                    revLampDataList.tacNumberLampList.map((tac, idx) =>
                                      `${tac} ${revLampDataList.validityLampList[idx] || ""}`
                                    )
                                  ),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      // new Paragraph({
                      //   children: [
                      //     new TextRun({
                      //       text: revLampDataList.tacNumberLampList.join(", "),
                      //       size: "12pt",
                      //     }),
                      //     new TextRun({
                      //       text: " ",
                      //       size: "12pt",
                      //     }),
                      //     new TextRun({
                      //       text: revLampDataList.validityLampList.join(", "),
                      //       size: "12pt",
                      //     }),
                      //   ],
                      // }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: (() => {
                              const combinedList = revLampDataList.tacNumberLampList.map((tac, idx) =>
                                `${tac} ${revLampDataList.validityLampList[idx] || ""}`
                              );
                      
                              const isBIS = getTACorBISHeader(combinedList).startsWith("BIS");
                      
                              return combinedList
                                .map(item => {
                                  const match = item.match(validDateRegex);
                                  const numberPart = match ? item.slice(0, match.index).trim() : item.trim();
                                  const datePart = match ? item.slice(match.index).trim() : "";
                                  return `${isBIS ? "CM/L-" : ""}${numberPart}${datePart ? " " + datePart : ""}`;
                                })
                                .join(", ");
                            })(),
                          }),
                        ],
                      }),
                      
                    ],
                  }),
                  
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         children: [
                //           new TextRun({
                //             text: revLampDataList.possibleDateLampList.join(
                //               ","
                //             ),
                //             size: "12pt",
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getPossibleDateHeader(revLampDataList.possibleDateLampList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getPossibleDateHeader(revLampDataList.possibleDateLampList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: revLampDataList.possibleDateLampList.join(", "),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         children: [
                //           new TextRun({
                //             text: revLampDataList.copCertLampList.join(","),
                //             size: "12pt",
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),


                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getCOPHeader(revLampDataList.copCertLampList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getCOPHeader(revLampDataList.copCertLampList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: revLampDataList.copCertLampList.join(", "),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Rear Fog Lamp",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "NA",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "NA",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "NA",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "NA",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Rear Registration Plate Lamp",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: rrpLampDataList.suppNameLampList.join("\n\r"),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         children: [
                //           new TextRun({
                //             text: rrpLampDataList.tacNumberLampList.join(","),
                //             size: "12pt",
                //           }),
                //           new TextRun({
                //             text: " ",
                //             size: "12pt",
                //           }),
                //           new TextRun({
                //             text: rrpLampDataList.validityLampList.join(","),
                //             size: "12pt",
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(
                        getTACorBISHeader(
                          rrpLampDataList.tacNumberLampList.map((tac, idx) =>
                            `${tac} ${rrpLampDataList.validityLampList[idx] || ""}`
                          )
                        )
                          ? [
                              new Paragraph({
                                style: "table1Header",
                                children: [
                                  new TextRun({
                                    size: "12pt",
                                    bold: true,
                                    text: getTACorBISHeader(
                                      rrpLampDataList.tacNumberLampList.map((tac, idx) =>
                                        `${tac} ${rrpLampDataList.validityLampList[idx] || ""}`
                                      )
                                    ),
                                  }),
                                ],
                              }),
                            ]
                          : []
                      ),
                      // new Paragraph({
                      //   children: [
                      //     new TextRun({
                      //       text: rrpLampDataList.tacNumberLampList.join(", "),
                      //       size: "12pt",
                      //     }),
                      //     new TextRun({
                      //       text: " ",
                      //       size: "12pt",
                      //     }),
                      //     new TextRun({
                      //       text: rrpLampDataList.validityLampList.join(", "),
                      //       size: "12pt",
                      //     }),
                      //   ],
                      // }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: (() => {
                              const combinedList = rrpLampDataList.tacNumberLampList.map((tac, idx) =>
                                `${tac} ${rrpLampDataList.validityLampList[idx] || ""}`
                              );
                      
                              const isBIS = getTACorBISHeader(combinedList).startsWith("BIS");
                      
                              return combinedList
                                .map(item => {
                                  const match = item.match(validDateRegex);
                                  const numberPart = match ? item.slice(0, match.index).trim() : item.trim();
                                  const datePart = match ? item.slice(match.index).trim() : "";
                                  return `${isBIS ? "CM/L-" : ""}${numberPart}${datePart ? " " + datePart : ""}`;
                                })
                                .join(", ");
                            })(),
                          }),
                        ],
                      }),
                      
                    ],
                  }),

                  
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         children: [
                //           new TextRun({
                //             text: rrpLampDataList.possibleDateLampList.join(
                //               ","
                //             ),
                //             size: "12pt",
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(
                        getPossibleDateHeader(rrpLampDataList.possibleDateLampList)
                          ? [
                              new Paragraph({
                                style: "table1Header",
                                children: [
                                  new TextRun({
                                    size: "12pt",
                                    bold: true,
                                    text: getPossibleDateHeader(rrpLampDataList.possibleDateLampList),
                                  }),
                                ],
                              }),
                            ]
                          : []
                      ),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: rrpLampDataList.possibleDateLampList.join(","),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         children: [
                //           new TextRun({
                //             text: rrpLampDataList.copCertLampList.join(","),
                //             size: "12pt",
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(
                        getCOPHeader(rrpLampDataList.copCertLampList)
                          ? [
                              new Paragraph({
                                style: "table1Header",
                                children: [
                                  new TextRun({
                                    size: "12pt",
                                    bold: true,
                                    text: getCOPHeader(rrpLampDataList.copCertLampList),
                                  }),
                                ],
                              }),
                            ]
                          : []
                      ),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: rrpLampDataList.copCertLampList.join(","),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Rear End-out Marker Lamp",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "NA",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "NA",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "NA",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "NA",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "High Mounted Stop Lamp",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "NA",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "NA",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "NA",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "NA",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "124(1)-5(b)",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Requirements for behavior of steering mechanism of a vehicle in a Head-on collision",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "124(1)-5(c)",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Protection of Occupants in the event of an Offset Frontal collision",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "124(1)-6(b)",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Approval of vehicles with regard to the Protection of Occupants in the event of a Lateral collision",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "124(1)-6(c)",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Approval of vehicles with regard to the Protection of Pedestrian and other Vulnerable Road User in the event of a collision with a Motor vehicle",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "124(1)-51",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Protective devices against unauthorized use for M & N category vehicles",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "124(1)-52",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Vehicle Alarm Systems and Immobilizers for M1 category, and N1 category (having GVW not more than 2 ton)",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "124/2",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Hydraulic Brake Hose (For all vehicles – as applicable)",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: hydrBrkHoseDataList.suppNameList.join("\n\r"),
                          }),
                        ],
                      }),
                    ],
                  }),
                

                
                
               
               
               

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getTACorBISHeader(
                        hydrBrkHoseDataList.tacNumberList.map((tac, idx) =>
                          `${tac} ${hydrBrkHoseDataList.validityList[idx] || ""}`
                        )
                      )
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getTACorBISHeader(
                                    hydrBrkHoseDataList.tacNumberList.map((tac, idx) =>
                                      `${tac} ${hydrBrkHoseDataList.validityList[idx] || ""}`
                                    )
                                  ),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: (() => {
                              const isBIS = getTACorBISHeader(hydrBrkHoseDataList.tacNumberList).startsWith("BIS");
                  
                              return hydrBrkHoseDataList.tacNumberList.map((tac, idx) => {
                                const validity = hydrBrkHoseDataList.validityList[idx] || "";
                                const prefix = isBIS ? "CM/L-" : "";
                                return `${prefix}${tac}${validity ? " " + validity : ""}`;
                              }).join(", ");
                            })(),
                          }),
                        ],
                      }),
                    ],
                  }),
                  
                  
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         style: "table1Header",
                //         children: [
                //           new TextRun({
                //             size: "12pt",
                //             bold: true,
                //             text: hydrBrkHoseDataList.possibleDateList.join(
                //               ","
                //             ),
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),
                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(
                        getPossibleDateHeader(hydrBrkHoseDataList.possibleDateList)
                          ? [
                              new Paragraph({
                                style: "table1Header",
                                children: [
                                  new TextRun({
                                    size: "12pt",
                                    bold: true,
                                    text: getPossibleDateHeader(hydrBrkHoseDataList.possibleDateList),
                                  }),
                                ],
                              }),
                            ]
                          : []
                      ),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: hydrBrkHoseDataList.possibleDateList.join(","),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         style: "table1Header",
                //         children: [
                //           new TextRun({
                //             size: "12pt",
                //             bold: true,
                //             text: hydrBrkHoseDataList.copCertList.join(","),
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),


                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(
                        getCOPHeader(hydrBrkHoseDataList.copCertList)
                          ? [
                              new Paragraph({
                                style: "table1Header",
                                children: [
                                  new TextRun({
                                    size: "12pt",
                                    bold: true,
                                    text: getCOPHeader(hydrBrkHoseDataList.copCertList),
                                  }),
                                ],
                              }),
                            ]
                          : []
                      ),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: hydrBrkHoseDataList.copCertList.join(","),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),

                  
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "124/3",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Hydraulic Brake Fluid (For all vehicles – as applicable)",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: BrakeFluidDataList.MakeList.join("\n\r"),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                //   new TableCell({
                


                
          new TableCell({
                  width: { size: 3000, type: WidthType.DXA },
                  children: [
                    // ---------------- Header ----------------
                    ...(getTACorBISHeader(BrakeFluidDataList.tacNumberList)
                      ? [
                          new Paragraph({
                            style: "table1Header",
                            children: [
                              new TextRun({
                                size: "12pt",
                                bold: true,
                                text: getTACorBISHeader(BrakeFluidDataList.tacNumberList),
                              }),
                            ],
                          }),
                        ]
                      : []),
                
                    // ---------------- Values ----------------
                    new Paragraph({                      
                      children: [
                        new TextRun({
                          size: "12pt",
                          bold: true,
                          text: (() => {
                            const label = getTACorBISHeader(BrakeFluidDataList.tacNumberList);
                            return label.startsWith("BIS")
                              ? BrakeFluidDataList.tacNumberList
                                  .map((item) => {
                                    const match = item.match(validDateRegex);
                                    const numberPart = match
                                      ? item.slice(0, match.index).trim()
                                      : item.trim();
                                    const datePart = match ? item.slice(match.index).trim() : "";
                                    return `CM/L-${numberPart}${datePart ? " " + datePart : ""}`;
                                  })
                                  .join(", ")
                              : BrakeFluidDataList.tacNumberList.join(", ");
                          })(),
                        }),
                      ],
                    }),
                  ],
                }),
                
                  
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "124/5",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Steering Impact",
                            size: "12pt",
                          }),
                          new TextRun({
                            text: "Head Form Test",
                            size: "12pt",
                            break: 1,
                          }),
                          new TextRun({
                            text: "Body Block Test",
                            size: "12pt",
                            break: 1,
                          }),
                          new TextRun({
                            text: "Crash Test",
                            size: "12pt",
                            break: 1,
                          }),
                          new TextRun({
                            text: "(For M1 category having GVW not more than 1500kg)",
                            size: "12pt",
                            break: 1,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "124/6",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Side Door Impact Test",
                            size: "12pt",
                          }),
                          new TextRun({
                            text: "(For passenger cars)",
                            size: "12pt",
                            break: 1,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "124/7",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Fuel Tank (Provide details in case of multiple capacities / suppliers)",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Fuel Tank (metallic) or ",
                            size: "12pt",
                          }),
                          new TextRun({
                            text: "Fuel Tank (plastic)",
                            size: "12pt",
                            break: 1,
                          }),
                          new TextRun({
                            text: "(For Four Wheelers)",
                            size: "12pt",
                            break: 1,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "124/8",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Wheel Rims",
                            size: "12pt",
                          }),
                          new TextRun({
                            text: "(For Four wheelers)",
                            size: "12pt",
                            break: 1,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "124/9",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Control Cables  (For two wheelers below 50 CC)",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "124/10",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Pneumatic Coupling (For N category of vehicles)",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "124/12",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Bus Window Retention",
                            size: "12pt",
                          }),
                          new TextRun({
                            text: "(Only for Buses)",
                            size: "12pt",
                            break: 1,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "124/14",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Wheel Nuts /Bolts,",
                            size: "12pt",
                          }),
                          new TextRun({
                            text: "Wheel Caps / Hub Caps",
                            size: "12pt",
                            break: 1,
                          }),
                          new TextRun({
                            text: "(Only for Four Wheelers)",
                            size: "12pt",
                            break: 1,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "124/15",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Accelerator Control Systems",
                            size: "12pt",
                          }),
                          new TextRun({
                            text: "(Only for Four Wheelers)",
                            size: "12pt",
                            break: 1,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    rowSpan: 7,
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "124/16",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Door Locks & Hinges",
                            size: "12pt",
                          }),
                          new TextRun({
                            text: "(Only for Four Wheelers)",
                            size: "12pt",
                            break: 1,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    rowSpan: 7,
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    rowSpan: 7,
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    rowSpan: 7,
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    rowSpan: 7,
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Door Hinges",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Front Door Hinges",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Rear Door Hinges",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Door Locks",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Front Door Lock",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Rear Door Lock",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "124/17",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Hood Latch",
                            size: "12pt",
                          }),
                          new TextRun({
                            text: "(For passenger cars)",
                            size: "12pt",
                            break: 1,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    rowSpan: 5,
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "124/20",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "i)  Lighting Signaling & Indicating  Systems",
                            size: "12pt",
                          }),
                          new TextRun({
                            text: "(For 4 Wheelers)",
                            size: "12pt",
                            break: 1,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    rowSpan: 5,
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    rowSpan: 5,
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    rowSpan: 5,
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    rowSpan: 5,
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Head Lamp (Main Beam)",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Head Lamp (Dipped Beam)",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Front Position / Parking Lamp",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Cornering Lamp (if provided)",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    rowSpan: 17,
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "124/20",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Front Direction Indicator",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    rowSpan: 17,
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    rowSpan: 17,
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    rowSpan: 17,
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    rowSpan: 17,
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Front Fog lamp",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Day-Time Running Lamp (if provided)",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Front end-out marker Lamp / Top Lights",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Rear end-out marker Lamp / Top Lights",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Stop Lamp",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Rear Position / Parking Lamp",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Rear Direction Indicator",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Reversing lamp",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Rear Fog lamp",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "High mounted stop Lamp",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Rear Registration Plate Lamp",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Side Direction Indicator Lamp",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Side Marker lamp",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Head Lam Cleaning Device",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "ii) Lighting and Signaling Installation Requirements (for 4 wheelers)",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Report No(s). for Base Model / Variants (if already issued)",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "124/21",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Electromagnetic Radiation (EMI) (for all combinations of spark plug, ignition coil, HT cable, Ignition System, ECU and suppress cap)",
                            size: "12pt",
                          }),
                          new TextRun({
                            text: "(For all vehicles)",
                            size: "12pt",
                            break: 1,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "124/22",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Towing Devices  (For 4 wheelers) as applicable",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "124/24",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Lighting and Signaling installation requirements for 2 & 3wheelers, including Trailers, semi-Trailers",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Report No(s). for Base Model / Variants",
                            size: "12pt",
                          }),
                          new TextRun({
                            text: "(if already issued)",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "124/25",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Fuel Tank for 2 & 3wheelers",
                            size: "12pt",
                          }),
                          new TextRun({
                            text: "(metallic or Non-Metallic)   (Indicate Nominal capacity) ",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "124/32",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Lighting and light signaling devices for 2 wheelers, 3 wheelers and their trailers and semi-trailers.",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Head Lamp",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: hlMainBeamDataList.suppNameList.join(","),
                            size: "12pt",
                          }),
                          new TextRun({
                            break: 1,
                            text: " ",
                            size: "12pt",
                          }),
                          new TextRun({
                            text: hlDipBeamDataList.suppNameList.join(","),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                
               
                



                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      // ✅ Conditionally render header from the first valid TAC list
                      ...(() => {
                        let selectedList = null;
                  
                        if (hlMainBeamDataList.tacNumberList.length > 0) {
                          selectedList = hlMainBeamDataList;
                        } else if (hlDipBeamDataList.tacNumberList.length > 0) {
                          selectedList = hlDipBeamDataList;
                        }
                  
                        if (!selectedList) return [];
                  
                        const combinedList = selectedList.tacNumberList.map((tac, idx) =>
                          `${tac} ${selectedList.validityList[idx] || ""}`
                        );
                  
                        const headerText = getTACorBISHeader(combinedList);
                  
                        return headerText
                          ? [
                              new Paragraph({
                                style: "table1Header",
                                children: [
                                  new TextRun({
                                    size: "12pt",
                                    bold: true,
                                    text: headerText,
                                  }),
                                ],
                              }),
                            ]
                          : [];
                      })(),
                  
               
                
            
                      new Paragraph({
                        children: [
                          // Main Beam
                          new TextRun({
                            text: (() => {
                              const label = getTACorBISHeader(
                                hlMainBeamDataList.tacNumberList.map((tac, i) => `${tac} ${hlMainBeamDataList.validityList[i] || ""}`)
                              );
                              return label.startsWith("BIS")
                                ? hlMainBeamDataList.tacNumberList.map((tac, i) => {
                                    const validity = hlMainBeamDataList.validityList[i] || "";
                                    const combined = `${tac} ${validity}`.trim();
                                    const match = combined.match(validDateRegex);
                                    const numberPart = match ? combined.slice(0, match.index).trim() : combined;
                                    const datePart = match ? combined.slice(match.index).trim() : "";
                                    return `CM/L-${numberPart}${datePart ? " " + datePart : ""}`;
                                  }).join(", ")
                                : hlMainBeamDataList.tacNumberList.map((tac, i) => `${tac} ${hlMainBeamDataList.validityList[i] || ""}`).join(", ");
                            })(),
                            size: "12pt",
                          }),
                      
                          new TextRun({ break: 1 }),
                      
                          // Dip Beam
                          new TextRun({
                            text: (() => {
                              const label = getTACorBISHeader(
                                hlDipBeamDataList.tacNumberList.map((tac, i) => `${tac} ${hlDipBeamDataList.validityList[i] || ""}`)
                              );
                              return label.startsWith("BIS")
                                ? hlDipBeamDataList.tacNumberList.map((tac, i) => {
                                    const validity = hlDipBeamDataList.validityList[i] || "";
                                    const combined = `${tac} ${validity}`.trim();
                                    const match = combined.match(validDateRegex);
                                    const numberPart = match ? combined.slice(0, match.index).trim() : combined;
                                    const datePart = match ? combined.slice(match.index).trim() : "";
                                    return `CM/L-${numberPart}${datePart ? " " + datePart : ""}`;
                                  }).join(", ")
                                : hlDipBeamDataList.tacNumberList.map((tac, i) => `${tac} ${hlDipBeamDataList.validityList[i] || ""}`).join(", ");
                            })(),
                            size: "12pt",
                          }),
                        ],
                      })
                      
                    ],
                  }),
                  
               
                
        

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(() => {
                        const mainHeader = getPossibleDateHeader(hlMainBeamDataList.possibleDateList);
                        const dipHeader = getPossibleDateHeader(hlDipBeamDataList.possibleDateList);
                  
                        if (mainHeader) {
                          return [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: mainHeader,
                                }),
                              ],
                            }),
                          ];
                        } else if (dipHeader) {
                          return [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: dipHeader,
                                }),
                              ],
                            }),
                          ];
                        }
                        return [];
                      })(),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: hlMainBeamDataList.possibleDateList.join(","),
                            size: "12pt",
                          }),
                          new TextRun({
                            break: 1,
                            text: hlDipBeamDataList.possibleDateList.join("\n\r"),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),

                  
               


                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(() => {
                        const mainHeader = getCOPHeader(hlMainBeamDataList.copCertList);
                        const dipHeader = getCOPHeader(hlDipBeamDataList.copCertList);
                  
                        if (mainHeader) {
                          return [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: mainHeader,
                                }),
                              ],
                            }),
                          ];
                        } else if (dipHeader) {
                          return [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: dipHeader,
                                }),
                              ],
                            }),
                          ];
                        }
                        return [];
                      })(),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: hlMainBeamDataList.copCertList.join(","),
                            size: "12pt",
                          }),
                          new TextRun({
                            break: 1,
                            text: hlDipBeamDataList.copCertList.join("\n\r"),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Front Position / Parking Lamp",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: frontPosLampDataList.suppNameList.join(
                              "\n\r"
                            ),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
               
              

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(
                        getTACorBISHeader(
                          frontPosLampDataList.tacNumberList.map((tac, idx) => `${tac} ${frontPosLampDataList.validityList[idx] || ""}`)
                        )
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getTACorBISHeader(
                                    frontPosLampDataList.tacNumberList.map((tac, idx) => `${tac} ${frontPosLampDataList.validityList[idx] || ""}`)
                                  ),
                                }),
                              ],
                            }),
                          ]
                        : []
                      ),
                     
                      new Paragraph({
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: (() => {
                              const isBIS = getTACorBISHeader(frontPosLampDataList.tacNumberList).startsWith("BIS");
                      
                              return frontPosLampDataList.tacNumberList.map((tac, idx) => {
                                const validity = frontPosLampDataList.validityList[idx] || "";
                                const prefix = isBIS ? "CM/L-" : "";
                                return `${prefix}${tac}${validity ? " " + validity : ""}`;
                              }).join(", ");
                            })(),
                          }),
                        ],
                      }),
                      
                    ],
                  }),
                  
                
                
                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(
                        getPossibleDateHeader(frontPosLampDataList.possibleDateList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getPossibleDateHeader(frontPosLampDataList.possibleDateList),
                                }),
                              ],
                            }),
                          ]
                        : []
                      ),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: frontPosLampDataList.possibleDateList.join(", "),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  
                
                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(
                        getCOPHeader(frontPosLampDataList.copCertList)
                          ? [
                              new Paragraph({
                                style: "table1Header",
                                children: [
                                  new TextRun({
                                    size: "12pt",
                                    bold: true,
                                    text: getCOPHeader(frontPosLampDataList.copCertList),
                                  }),
                                ],
                              }),
                            ]
                          : []
                      ),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: frontPosLampDataList.copCertList.join(", "),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  

                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Front Direction Indicator",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: fdIndLampDataList.suppNameList.join("\n\r"),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(
                        getTACorBISHeader(
                          fdIndLampDataList.tacNumberList.map((tac, idx) => `${tac} ${fdIndLampDataList.validityList[idx] || ""}`)
                        )
                          ? [
                              new Paragraph({
                                style: "table1Header",
                                children: [
                                  new TextRun({
                                    size: "12pt",
                                    bold: true,
                                    text: getTACorBISHeader(
                                      fdIndLampDataList.tacNumberList.map((tac, idx) => `${tac} ${fdIndLampDataList.validityList[idx] || ""}`)
                                    ),
                                  }),
                                ],
                              }),
                            ]
                          : []
                      ),
                      

                      new Paragraph({
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: (() => {
                              const isBIS = getTACorBISHeader(fdIndLampDataList.tacNumberList).startsWith("BIS");
                      
                              return fdIndLampDataList.tacNumberList.map((tac, idx) => {
                                const validity = fdIndLampDataList.validityList[idx] || "";
                                const prefix = isBIS ? "CM/L-" : "";
                                return `${prefix}${tac}${validity ? " " + validity : ""}`;
                              }).join(", ");
                            })(),
                          }),
                        ],
                      }),
                      
                    ],
                  }),
                  
                
              

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(
                        getPossibleDateHeader(fdIndLampDataList.possibleDateList)
                          ? [
                              new Paragraph({
                                style: "table1Header",
                                children: [
                                  new TextRun({
                                    size: "12pt",
                                    bold: true,
                                    text: getPossibleDateHeader(fdIndLampDataList.possibleDateList),
                                  }),
                                ],
                              }),
                            ]
                          : []
                      ),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: fdIndLampDataList.possibleDateList.join(","),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  
               

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(
                        getCOPHeader(fdIndLampDataList.copCertList)
                          ? [
                              new Paragraph({
                                style: "table1Header",
                                children: [
                                  new TextRun({
                                    size: "12pt",
                                    bold: true,
                                    text: getCOPHeader(fdIndLampDataList.copCertList),
                                  }),
                                ],
                              }),
                            ]
                          : []
                      ),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: fdIndLampDataList.copCertList.join(","),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  

                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Stop Lamp",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: stopLampDataList.suppNameList.join("\n\r"),
                          }),
                        ],
                      }),
                    ],
                  }),
                
              

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(
                        getTACorBISHeader(
                          stopLampDataList.tacNumberList.map((tac, idx) => 
                            `${tac} ${stopLampDataList.validityList[idx] || ""}`
                          )
                        )
                          ? [
                              new Paragraph({
                                style: "table1Header",
                                children: [
                                  new TextRun({
                                    size: "12pt",
                                    bold: true,
                                    text: getTACorBISHeader(
                                      stopLampDataList.tacNumberList.map((tac, idx) => 
                                        `${tac} ${stopLampDataList.validityList[idx] || ""}`
                                      )
                                    ),
                                  }),
                                ],
                              }),
                            ]
                          : []
                      ),
                      
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: (() => {
                              const isBIS = getTACorBISHeader(stopLampDataList.tacNumberList).startsWith("BIS");
                      
                              return stopLampDataList.tacNumberList.map((tac, idx) => {
                                const validity = stopLampDataList.validityList[idx] || "";
                                const prefix = isBIS ? "CM/L-" : "";
                                return `${prefix}${tac}${validity ? " " + validity : ""}`;
                              }).join(", ");
                            })(),
                          }),
                        ],
                      }),
                      
                    ],
                  }),
                  
                

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(
                        getPossibleDateHeader(stopLampDataList.possibleDateList)
                          ? [
                              new Paragraph({
                                style: "table1Header",
                                children: [
                                  new TextRun({
                                    size: "12pt",
                                    bold: true,
                                    text: getPossibleDateHeader(stopLampDataList.possibleDateList),
                                  }),
                                ],
                              }),
                            ]
                          : []
                      ),
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: stopLampDataList.possibleDateList.join(","),
                          }),
                        ],
                      }),
                    ],
                  }),
                  
               

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(
                        getCOPHeader(stopLampDataList.copCertList)
                          ? [
                              new Paragraph({
                                style: "table1Header",
                                children: [
                                  new TextRun({
                                    size: "12pt",
                                    bold: true,
                                    text: getCOPHeader(stopLampDataList.copCertList),
                                  }),
                                ],
                              }),
                            ]
                          : []
                      ),
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: stopLampDataList.copCertList.join(","),
                          }),
                        ],
                      }),
                    ],
                  }),
                  


                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Rear Position / Parking Lamp",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: rearPosLampDataList.suppNameList.join("\n\r"),
                            size: "12pt",
                          }),
                        ],
                        
                      }),
                    ],
                  }),
                
                

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(
                        getTACorBISHeader(
                          rearPosLampDataList.tacNumberList.map((tac, idx) => 
                            `${tac} ${rearPosLampDataList.validityList[idx] || ""}`
                          )
                        )
                          ? [
                              new Paragraph({
                                style: "table1Header",
                                children: [
                                  new TextRun({
                                    size: "12pt",
                                    bold: true,
                                    text: getTACorBISHeader(
                                      rearPosLampDataList.tacNumberList.map((tac, idx) => 
                                        `${tac} ${rearPosLampDataList.validityList[idx] || ""}`
                                      )
                                    ),
                                  }),
                                ],
                              }),
                            ]
                          : []
                      ),
                     
                      new Paragraph({
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: (() => {
                              const isBIS = getTACorBISHeader(rearPosLampDataList.tacNumberList).startsWith("BIS");
                      
                              return rearPosLampDataList.tacNumberList.map((tac, idx) => {
                                const validity = rearPosLampDataList.validityList[idx] || "";
                                const prefix = isBIS ? "CM/L-" : "";
                                return `${prefix}${tac}${validity ? " " + validity : ""}`;
                              }).join(", ");
                            })(),
                          }),
                        ],
                      }),
                      
                    ],
                  }),
                  
               
                

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(
                        getPossibleDateHeader(rearPosLampDataList.possibleDateList)
                          ? [
                              new Paragraph({
                                style: "table1Header",
                                children: [
                                  new TextRun({
                                    size: "12pt",
                                    bold: true,
                                    text: getPossibleDateHeader(rearPosLampDataList.possibleDateList),
                                  }),
                                ],
                              }),
                            ]
                          : []
                      ),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: rearPosLampDataList.possibleDateList.join(", "),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  
               

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(
                        getCOPHeader(rearPosLampDataList.copCertList)
                          ? [
                              new Paragraph({
                                style: "table1Header",
                                children: [
                                  new TextRun({
                                    size: "12pt",
                                    bold: true,
                                    text: getCOPHeader(rearPosLampDataList.copCertList),
                                  }),
                                ],
                              }),
                            ]
                          : []
                      ),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: rearPosLampDataList.copCertList.join(", "),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  

                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Rear Direction Indicator",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: rdIndLampDataList.suppNameList.join("\n\r"),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         children: [
                //           new TextRun({
                //             text: rdIndLampDataList.tacNumberList.join(","),
                //             size: "12pt",
                //           }),
                //           new TextRun({
                //             text: " ",
                //             size: "12pt",
                //           }),
                //           new TextRun({
                //             text: rdIndLampDataList.validityList.join(","),
                //             size: "12pt",
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getTACorBISHeader(
                        rdIndLampDataList.tacNumberList.map((tac, idx) => `${tac} ${rdIndLampDataList.validityList[idx] || ""}`)
                      )
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getTACorBISHeader(
                                    rdIndLampDataList.tacNumberList.map((tac, idx) => `${tac} ${rdIndLampDataList.validityList[idx] || ""}`)
                                  ),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      // new Paragraph({
                      //   children: [
                      //     new TextRun({
                      //       text: rdIndLampDataList.tacNumberList.join(", "),
                      //       size: "12pt",
                      //     }),
                      //     new TextRun({
                      //       text: " ",
                      //       size: "12pt",
                      //     }),
                      //     new TextRun({
                      //       text: rdIndLampDataList.validityList.join(", "),
                      //       size: "12pt",
                      //     }),
                      //   ],
                      // }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: (() => {
                              const isBIS = getTACorBISHeader(rdIndLampDataList.tacNumberList).startsWith("BIS");
                      
                              return rdIndLampDataList.tacNumberList.map((tac, idx) => {
                                const validity = rdIndLampDataList.validityList[idx] || "";
                                const prefix = isBIS ? "CM/L-" : "";
                                return `${prefix}${tac}${validity ? " " + validity : ""}`;
                              }).join(", ");
                            })(),
                          }),
                        ],
                      }),
                      
                    ],
                  }),
                  
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         children: [
                //           new TextRun({
                //             text: rdIndLampDataList.possibleDateList.join(","),
                //             size: "12pt",
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getPossibleDateHeader(
                        rdIndLampDataList.possibleDateList
                      )
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getPossibleDateHeader(
                                    rdIndLampDataList.possibleDateList
                                  ),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: rdIndLampDataList.possibleDateList.join(","),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         children: [
                //           new TextRun({
                //             text: rdIndLampDataList.copCertList.join(","),
                //             size: "12pt",
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getCOPHeader(rdIndLampDataList.copCertList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getCOPHeader(rdIndLampDataList.copCertList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: rdIndLampDataList.copCertList.join(","),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  

                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Reversing Lamp for 3 Wheeler",
                            size: "12pt",
                          }),
                          new TextRun({
                            text: " ",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: revLampDataList.suppNameList.join("\n\r"),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                
                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getTACorBISHeader(
                        revLampDataList.tacNumberList.map((tac, idx) => 
                          `${tac} ${revLampDataList.validityList[idx] || ""}`
                        )
                      )
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getTACorBISHeader(
                                    revLampDataList.tacNumberList.map((tac, idx) => 
                                      `${tac} ${revLampDataList.validityList[idx] || ""}`
                                    )
                                  ),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      
                      new Paragraph({
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: (() => {
                              const isBIS = getTACorBISHeader(revLampDataList.tacNumberList).startsWith("BIS");
                      
                              return revLampDataList.tacNumberList.map((tac, idx) => {
                                const validity = revLampDataList.validityList[idx] || "";
                                const prefix = isBIS ? "CM/L-" : "";
                                return `${prefix}${tac}${validity ? " " + validity : ""}`;
                              }).join(", ");
                            })(),
                          }),
                        ],
                      }),
                      
                    ],
                  }),
                  
               

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getPossibleDateHeader(revLampDataList.possibleDateList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getPossibleDateHeader(revLampDataList.possibleDateList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: revLampDataList.possibleDateList.join(", "),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  
                

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getCOPHeader(revLampDataList.copCertList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getCOPHeader(revLampDataList.copCertList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: revLampDataList.copCertList.join(", "),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Rear Registration Plate Lamp",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: rrpLampDataList.suppNameList.join("\n\r"),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         children: [
                //           new TextRun({
                //             text: rrpLampDataList.tacNumberList.join(","),
                //             size: "12pt",
                //           }),
                //           new TextRun({
                //             text: " ",
                //             size: "12pt",
                //           }),
                //           new TextRun({
                //             text: rrpLampDataList.validityList.join(","),
                //             size: "12pt",
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getTACorBISHeader(
                        rrpLampDataList.tacNumberList.map((tac, idx) =>
                          `${tac} ${rrpLampDataList.validityList[idx] || ""}`
                        )
                      )
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getTACorBISHeader(
                                    rrpLampDataList.tacNumberList.map((tac, idx) =>
                                      `${tac} ${rrpLampDataList.validityList[idx] || ""}`
                                    )
                                  ),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      
                      new Paragraph({
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: (() => {
                              const isBIS = getTACorBISHeader(rrpLampDataList.tacNumberList).startsWith("BIS");
                      
                              return rrpLampDataList.tacNumberList.map((tac, idx) => {
                                const validity = rrpLampDataList.validityList[idx] || "";
                                const prefix = isBIS ? "CM/L-" : "";
                                return `${prefix}${tac}${validity ? " " + validity : ""}`;
                              }).join(", ");
                            })(),
                          }),
                        ],
                      }),
                      
                    ],
                  }),
                  
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         children: [
                //           new TextRun({
                //             text: rrpLampDataList.possibleDateList.join(","),
                //             size: "12pt",
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getPossibleDateHeader(rrpLampDataList.possibleDateList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getPossibleDateHeader(rrpLampDataList.possibleDateList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: rrpLampDataList.possibleDateList.join(","),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         children: [
                //           new TextRun({
                //             text: rrpLampDataList.copCertList.join(","),
                //             size: "12pt",
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),


                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getCOPHeader(rrpLampDataList.copCertList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getCOPHeader(rrpLampDataList.copCertList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: rrpLampDataList.copCertList.join(","),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Side Direction Indicator Lamp",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: sdIndLampDataList.suppNameList.join("\n\r"),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         children: [
                //           new TextRun({
                //             text: sdIndLampDataList.tacNumberList.join(","),
                //             size: "12pt",
                //           }),
                //           new TextRun({
                //             text: " ",
                //             size: "12pt",
                //           }),
                //           new TextRun({
                //             text: sdIndLampDataList.validityList.join(","),
                //             size: "12pt",
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getTACorBISHeader(
                        sdIndLampDataList.tacNumberList.map(
                          (tac, idx) => `${tac} ${sdIndLampDataList.validityList[idx] || ""}`
                        )
                      )
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getTACorBISHeader(
                                    sdIndLampDataList.tacNumberList.map(
                                      (tac, idx) => `${tac} ${sdIndLampDataList.validityList[idx] || ""}`
                                    )
                                  ),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      // new Paragraph({
                      //   children: [
                      //     new TextRun({
                      //       text: sdIndLampDataList.tacNumberList.join(", "),
                      //       size: "12pt",
                      //     }),
                      //     new TextRun({
                      //       text: " ",
                      //       size: "12pt",
                      //     }),
                      //     new TextRun({
                      //       text: sdIndLampDataList.validityList.join(", "),
                      //       size: "12pt",
                      //     }),
                      //   ],
                      // }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: (() => {
                              const isBIS = getTACorBISHeader(sdIndLampDataList.tacNumberList).startsWith("BIS");
                      
                              return sdIndLampDataList.tacNumberList.map((tac, idx) => {
                                const validity = sdIndLampDataList.validityList[idx] || "";
                                const prefix = isBIS ? "CM/L-" : "";
                                return `${prefix}${tac}${validity ? " " + validity : ""}`;
                              }).join(", ");
                            })(),
                          }),
                        ],
                      }),
                      
                    ],
                  }),
                  
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         children: [
                //           new TextRun({
                //             text: sdIndLampDataList.possibleDateList.join(","),
                //             size: "12pt",
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getPossibleDateHeader(sdIndLampDataList.possibleDateList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getPossibleDateHeader(sdIndLampDataList.possibleDateList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: sdIndLampDataList.possibleDateList.join(", "),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         children: [
                //           new TextRun({
                //             text: sdIndLampDataList.copCertList.join(","),
                //             size: "12pt",
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getCOPHeader(sdIndLampDataList.copCertList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getCOPHeader(sdIndLampDataList.copCertList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: sdIndLampDataList.copCertList.join(", "),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  

                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "124/33",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Spray Suppression System Installation test report as per AIS-013",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            // text: SpraySuppressionDataList.suppNameList.join("\n\r"),
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            // text: SpraySuppressionDataList.MakeList.join("\n\r"),
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "124/34",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Drivers field of vision for M1 category of vehicles. ",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "124/35",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Survival space for protection of occupants in a cab.",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "124/36",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Strength of superstructure of passenger vehicles.",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "124/37",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Flammability requirements for M3 category vehicles with more than 22 passengers.",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "124/38",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Interior fittings for M1 category",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "124/39",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Windscreen wiping system requirements for 3 wheelers",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "124/42",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Handholds for L5, M & N category vehicles",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "124/43",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Wheel Rims for L category vehicles",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        
                       

                        children: [
                          // Front Wheel Rim
                          ...(FWheelRimDataList.MakeList.some(
                            (val) => val && val.trim() !== ""
                          )
                            ? [
                                new TextRun({
                                  text: "Front Wheel Rim",
                                  bold: true,
                                  size: "12pt",
                                }),
                              ]
                            : []),
                          new TextRun({
                            break: 1,
                            text: FWheelRimDataList.MakeList.join(", "),
                            size: "12pt",
                          }),

                          // Rear Wheel Rim (separate paragraph)
                          new TextRun({ break: 2 }),
                          ...(RWheelRimDataList.MakeList.some(
                            (val) => val && val.trim() !== ""
                          )
                            ? [
                                new TextRun({
                                  text: "Rear Wheel Rim",
                                  bold: true,
                                  size: "12pt",
                                }),
                              ]
                            : []),
                          new TextRun({
                            break: 1,
                            text: RWheelRimDataList.MakeList.join(", "),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
               
                

               
               
               
                
               


                new TableCell({
                  width: { size: 3000, type: WidthType.DXA },
                  children: [
                    // ---------------- Front Wheel Rim ----------------
                    ...(getTACorBISHeader(
                      FWheelRimDataList.tacNumberList.map((tac) => `${tac}`)
                    )
                      ? [
                          // Header (upper)
                          new Paragraph({
                            style: "table1Header",
                            children: [
                              new TextRun({
                                size: "12pt",
                                bold: true,
                                text:
                                  "Front Wheel Rim " +
                                  getTACorBISHeader(
                                    FWheelRimDataList.tacNumberList.map((tac) => `${tac}`)
                                  ),
                              }),
                            ],
                          }),
                        ]
                      : []),
                
                    ...(FWheelRimDataList.tacNumberList.length > 0
                      ? [
                          // Values (downer)
                          new Paragraph({
                            children: [
                              ...FWheelRimDataList.tacNumberList.map((tac, idx) => {
                                const isBIS = getTACorBISHeader(
                                  FWheelRimDataList.tacNumberList
                                ).startsWith("BIS");
                                return new TextRun({
                                  text: `${isBIS ? "CM/L-" : ""}${tac}`,
                                  break:
                                    idx < FWheelRimDataList.tacNumberList.length - 1 ? 1 : 0,
                                  size: 24,
                                });
                              }),
                            ],
                          }),
                        ]
                      : []),
                
                    // ---------------- Rear Wheel Rim ----------------
                    ...(getTACorBISHeader(
                      RWheelRimDataList.tacNumberList.map((tac) => `${tac}`)
                    )
                      ? [
                          // Header (upper)
                          new Paragraph({
                            style: "table1Header",
                            children: [
                              new TextRun({
                                size: "12pt",
                                bold: true,
                                text:
                                  "Rear Wheel Rim " +
                                  getTACorBISHeader(
                                    RWheelRimDataList.tacNumberList.map((tac) => `${tac}`)
                                  ),
                              }),
                            ],
                          }),
                        ]
                      : []),
                
                    ...(RWheelRimDataList.tacNumberList.length > 0
                      ? [
                          // Values (downer)
                          new Paragraph({
                            children: [
                              ...RWheelRimDataList.tacNumberList.map((tac, idx) => {
                                const isBIS = getTACorBISHeader(
                                  RWheelRimDataList.tacNumberList
                                ).startsWith("BIS");
                                return new TextRun({
                                  text: `${isBIS ? "CM/L-" : ""}${tac}`,
                                  break:
                                    idx < RWheelRimDataList.tacNumberList.length - 1 ? 1 : 0,
                                  size: 24,
                                });
                              }),
                            ],
                          }),
                        ]
                      : []),
                  ],
                }),

                
         new TableCell({
                  width: { size: 3000, type: WidthType.DXA },
                  children: [
                    // ---------------- Front Wheel Rim ----------------
                    ...(getPossibleDateHeader(FWheelRimDataList.possibleDateList)
                      ? [
                          // Header (upper)
                          new Paragraph({
                            style: "table1Header",
                            children: [
                              new TextRun({
                                size: "12pt",
                                bold: true,
                                text:
                                  "Front Wheel Rim " +
                                  getPossibleDateHeader(FWheelRimDataList.possibleDateList),
                              }),
                            ],
                          }),
                        ]
                      : []),
                
                    ...(FWheelRimDataList.possibleDateList.length > 0
                      ? [
                          // Values (downer)
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: FWheelRimDataList.possibleDateList.join(", "),
                                size: "12pt",
                              }),
                            ],
                          }),
                        ]
                      : []),
                
                    // ---------------- Rear Wheel Rim ----------------
                    ...(getPossibleDateHeader(RWheelRimDataList.possibleDateList)
                      ? [
                          // Header (upper)
                          new Paragraph({
                            style: "table1Header",
                            children: [
                              new TextRun({
                                size: "12pt",
                                bold: true,
                                text:
                                  "Rear Wheel Rim " +
                                  getPossibleDateHeader(RWheelRimDataList.possibleDateList),
                              }),
                            ],
                          }),
                        ]
                      : []),
                
                    ...(RWheelRimDataList.possibleDateList.length > 0
                      ? [
                          // Values (downer)
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: RWheelRimDataList.possibleDateList.join(", "),
                                size: "12pt",
                              }),
                            ],
                          }),
                        ]
                      : []),
                  ],
                }),
                

                  
                
      
         new TableCell({
                  width: { size: 3000, type: WidthType.DXA },
                  children: [
                    // ---------------- Front Wheel Rim ----------------
                    ...(getCOPHeader(FWheelRimDataList.copCertList)
                      ? [
                          // Header (upper)
                          new Paragraph({
                            style: "table1Header",
                            children: [
                              new TextRun({
                                size: "12pt",
                                bold: true,
                                text:
                                  "Front Wheel Rim " +
                                  getCOPHeader(FWheelRimDataList.copCertList),
                              }),
                            ],
                          }),
                        ]
                      : []),
                
                    ...(FWheelRimDataList.copCertList.length > 0
                      ? [
                          // Values (downer)
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: FWheelRimDataList.copCertList.join(", "),
                                size: "12pt",
                              }),
                            ],
                          }),
                        ]
                      : []),
                
                    // ---------------- Rear Wheel Rim ----------------
                    ...(getCOPHeader(RWheelRimDataList.copCertList)
                      ? [
                          // Header (upper)
                          new Paragraph({
                            style: "table1Header",
                            children: [
                              new TextRun({
                                size: "12pt",
                                bold: true,
                                text:
                                  "Rear Wheel Rim " +
                                  getCOPHeader(RWheelRimDataList.copCertList),
                              }),
                            ],
                          }),
                        ]
                      : []),
                
                    ...(RWheelRimDataList.copCertList.length > 0
                      ? [
                          // Values (downer)
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: RWheelRimDataList.copCertList.join(", "),
                                size: "12pt",
                              }),
                            ],
                          }),
                        ]
                      : []),
                  ],
                }),
                
                ],

              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "124/44",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Protective Devices for L category vehicles",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: HandleLockDataList.MakeList.join("\n\r"),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         children: [
                //           new TextRun({
                //             // text: HandleLockDataList.suppNameList.length > 0
                //             //     ? "NA"
                //             //     : " ",
                //             text: HandleLockDataList.tacNumberList.join(","),
                //             size: "12pt",
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),


                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getTACorBISHeader(HandleLockDataList.tacNumberList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getTACorBISHeader(HandleLockDataList.tacNumberList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      // new Paragraph({
                      //   children: [
                      //     new TextRun({
                      //       text: HandleLockDataList.tacNumberList.join("\n\r"),
                      //       size: "12pt",
                      //     }),
                      //   ],
                      // }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: (() => {
                              const isBIS = getTACorBISHeader(HandleLockDataList.tacNumberList).startsWith("BIS");
                              return HandleLockDataList.tacNumberList
                                .map(tac => `${isBIS ? "CM/L-" : ""}${tac}`)
                                .join("\n\r");
                            })(),
                          }),
                        ],
                      }),
                      
                      
                    ],
                  }),
                  
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         // style: "paragrapgBold",
                //         children: [
                //           new TextRun({
                //             size: "12pt",
                //             // bold: true,
                //             // text: ""
                //             text: HandleLockDataList.possibleDateList.join(","),
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getPossibleDateHeader(HandleLockDataList.possibleDateList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getPossibleDateHeader(HandleLockDataList.possibleDateList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: HandleLockDataList.possibleDateList.join(","),
                          }),
                        ],
                      }),
                    ],
                  }),
                  
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         // style: "table1Header",
                //         children: [
                //           new TextRun({
                //             size: "12pt",
                //             // bold: true,
                //             // text: ""
                //             text: HandleLockDataList.copCertList.join(","),
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getCOPHeader(HandleLockDataList.copCertList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getCOPHeader(HandleLockDataList.copCertList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: HandleLockDataList.copCertList.join(","),
                          }),
                        ],
                      }),
                    ],
                  }),
                  
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "124/46",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Defrost & Demist Systems for M1 category vehicles",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "124/48",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Spray Suppression test for 2-Wheelers",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: SpraySuppressionDataList.MakeList.join(
                              "\n\r"
                            ),
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         style: "table1Header",
                //         children: [
                //           new TextRun({
                //             size: "12pt",
                //             // bold: true,
                //             text: SpraySuppressionDataList.tacNumberList.join(
                //               "\n\r"
                //             ),
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getTACorBISHeader(SpraySuppressionDataList.tacNumberList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getTACorBISHeader(SpraySuppressionDataList.tacNumberList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      // new Paragraph({
                      //   children: [
                      //     new TextRun({
                      //       size: "12pt",
                      //       text: SpraySuppressionDataList.tacNumberList.join("\n\r"),
                      //     }),
                      //   ],
                      // }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: (() => {
                              const isBIS = getTACorBISHeader(SpraySuppressionDataList.tacNumberList).startsWith("BIS");
                              return SpraySuppressionDataList.tacNumberList
                                .map(tac => `${isBIS ? "CM/L-" : ""}${tac}`)
                                .join("\n\r");
                            })(),
                          }),
                        ],
                      }),
                      
                    ],
                  }),
                  
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         style: "table1Header",
                //         children: [
                //           new TextRun({
                //             size: "12pt",
                //             // bold: true,
                //             text: SpraySuppressionDataList.possibleDateList.join(
                //               "\n\r"
                //             ),
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getPossibleDateHeader(SpraySuppressionDataList.possibleDateList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getPossibleDateHeader(SpraySuppressionDataList.possibleDateList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: SpraySuppressionDataList.possibleDateList.join("\n\r"),
                          }),
                        ],
                      }),
                    ],
                  }),
                  
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         style: "table1Header",
                //         children: [
                //           new TextRun({
                //             size: "12pt",
                //             // bold: true,
                //             text: SpraySuppressionDataList.copCertList.join(
                //               "\n\r"
                //             ),
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),


                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getCOPHeader(SpraySuppressionDataList.copCertList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getCOPHeader(SpraySuppressionDataList.copCertList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: SpraySuppressionDataList.copCertList.join("\n\r"),
                          }),
                        ],
                      }),
                    ],
                  }),
                  
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "124/49",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Traction Battery used in Battery Operated Vehicles",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: TractionBatterypackDataList.suppNameList.join(
                              "\n\r"
                            ),
                          }),
                        ],
                      }),
                    ],
                  }),
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         style: "table1Header",
                //         children: [
                //           new TextRun({
                //             size: "12pt",
                //             text: TractionBatterypackDataList.tacNumberList.join(
                //               ","
                //             ),
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getTACorBISHeader(TractionBatterypackDataList.tacNumberList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getTACorBISHeader(TractionBatterypackDataList.tacNumberList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      // new Paragraph({
                      //   children: [
                      //     new TextRun({
                      //       size: "12pt",
                      //       text: TractionBatterypackDataList.tacNumberList.join(","),
                      //     }),
                      //   ],
                      // }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: (() => {
                              const isBIS = getTACorBISHeader(TractionBatterypackDataList.tacNumberList).startsWith("BIS");
                              return TractionBatterypackDataList.tacNumberList
                                .map(tac => `${isBIS ? "CM/L-" : ""}${tac}`)
                                .join(", ");
                            })(),
                          }),
                        ],
                      }),
                      
                    ],
                  }),
                  
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         style: "table1Header",
                //         children: [
                //           new TextRun({
                //             size: "12pt",
                //             text: TractionBatterypackDataList.possibleDateList.join(
                //               "\n\r"
                //             ),
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getPossibleDateHeader(TractionBatterypackDataList.possibleDateList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getPossibleDateHeader(TractionBatterypackDataList.possibleDateList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: TractionBatterypackDataList.possibleDateList.join("\n\r"),
                          }),
                        ],
                      }),
                    ],
                  }),
                  
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         style: "table1Header",
                //         children: [
                //           new TextRun({
                //             size: "12pt",
                //             text: TractionBatterypackDataList.copCertList.join(
                //               "\n\r"
                //             ),
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getCOPHeader(TractionBatterypackDataList.copCertList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getCOPHeader(TractionBatterypackDataList.copCertList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: TractionBatterypackDataList.copCertList.join("\n\r"),
                          }),
                        ],
                      }),
                    ],
                  }),
                  
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "124/1A",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Vehicle Rear Under run Protection And Lateral Protection (For four wheelers)",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "125/1A",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Safety Belt and Safety Belt Anchorages (For four wheelers)",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "125/C (7)",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "FDAS/FDSS,FAS/FPS for Buses.",
                            size: "12pt",
                            bold: true,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            bold: true,
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "125/(2)",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Rear View Mirror and Rear View Mirror Installation Requirements as per AIS-002",
                            size: "12pt",
                          }),
                          new TextRun({
                            text: "( For all vehicles as referred in AIS-001 )",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "",
                          }),
                        ],
                      }),
                    ],
                  }),
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         style: "table1Header",
                //         children: [
                //           new TextRun({
                //             size: "12pt",
                //             text: rearViewMirrorsDataList.tacNumberList.join(
                //               ","
                //             ),
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),
                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                    
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: "",
                                }),
                              ],
                            }),
                      // new Paragraph({
                      //   style: "table1Header",
                      //   children: [
                      //     new TextRun({
                      //       size: "12pt",
                      //       text: rearViewMirrorsDataList.tacNumberList.join(","),
                      //     }),
                      //   ],
                      // }),
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "",
                           
                          }),
                        ],
                      }),
                      
                    ],
                  }),
                  
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         style: "table1Header",
                //         children: [
                //           new TextRun({
                //             size: "12pt",
                //             text: rearViewMirrorsDataList.possibleDateList.join(
                //               ","
                //             ),
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: "",
                                }),
                              ],
                            }),
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "",
                          }),
                        ],
                      }),
                    ],
                  }),
                  
                //   new TableCell({
                //     width: {
                //       size: 3000,
                //       type: WidthType.DXA,
                //     },
                //     children: [
                //       new Paragraph({
                //         style: "table1Header",
                //         children: [
                //           new TextRun({
                //             size: "12pt",
                //             text: rearViewMirrorsDataList.copCertList.join(","),
                //           }),
                //         ],
                //       }),
                //     ],
                //   }),

                new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: "",
                                }),
                              ],
                            }),
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "",
                          }),
                        ],
                      }),
                    ],
                  }),
                  
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Interior Mirror (Class-I )",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Main Mirror large ( Class-II)",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Main Mirror small ( Class-III)",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Wide Angle Mirror ( Class-IV)",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Close proximity Mirror (Class-V)",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Front Mirror ( Class-VI )",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Mirrors for L category vehicle with bodywork  (Class-VII )",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: rearViewMirrorsDataList.suppNameList.join(
                              "\n\r"
                            ),
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getTACorBISHeader(rearViewMirrorsDataList.tacNumberList)
                        ? [
                            new Paragraph({
                               style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getTACorBISHeader(rearViewMirrorsDataList.tacNumberList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                   new Paragraph({
                    style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: (() => {
                              const isBIS = getTACorBISHeader(rearViewMirrorsDataList.tacNumberList).startsWith("BIS");
                              return rearViewMirrorsDataList.tacNumberList
                                .map(tac => `${isBIS ? "CM/L-" : ""}${tac}`)
                                .join(", ");
                            })(),
                          }),
                        ],
                      }),
                      
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                       ...(getPossibleDateHeader(rearViewMirrorsDataList.possibleDateList)
                        ? [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                           size: "12pt", 
                           bold:true,
                           text: getPossibleDateHeader(rearViewMirrorsDataList.possibleDateList),
                            
                          }),
                        ],
                      }),
                    ]
                  :[]),
                  new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: rearViewMirrorsDataList.possibleDateList.join(","),
                          }),
                        ],
                      }),
                    ],
                  }),
                 new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      ...(getCOPHeader(rearViewMirrorsDataList.copCertList)
                        ? [
                            new Paragraph({
                              style: "table1Header",
                              children: [
                                new TextRun({
                                  size: "12pt",
                                  bold: true,
                                  text: getCOPHeader(rearViewMirrorsDataList.copCertList),
                                }),
                              ],
                            }),
                          ]
                        : []),
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: rearViewMirrorsDataList.copCertList.join(","),
                          }),
                        ],
                      }),
                    ],
                  }),
                  
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "125/1C",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Seat Size, Anchorages and Head Restraints",
                            size: "12pt",
                          }),
                          new TextRun({
                            text: "( For four wheelers )",
                            size: "12pt",
                            break: 1,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            bold: true,
                            text: "138",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Warning Triangles",
                            size: "12pt",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "paragrapgBold",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "table1Header",
                        children: [
                          new TextRun({
                            size: "12pt",
                            text: "NA",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    columnSpan: 6,
                    children: [
                      new Paragraph({
                        spacing: {
                          before: 240,
                          after: 240,
                        },
                        children: [
                          new TextRun({
                            text: "Note:",
                            bold: true,
                            size: "12pt",
                          }),
                          new TextRun({
                            text: "Please enclose copies for TAC / CoP / BIS License / ECE Certificate / Test Reports wherever required by the testing agency.",
                            size: "12pt",
                            break: 1,
                          }),
                          new TextRun({
                            text: "Fill all the columns. If any clause is not applicable, mention “NA” in corresponding column.  Do not keep it blank.",
                            size: "12pt",
                            break: 1,
                          }),
                          new TextRun({
                            text: "In case samples are submitted to testing agency, please provide Reference No. if the approval is in process.)",
                            size: "12pt",
                            break: 1,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
            size: "12pt",
          }),
        ],
        footers: {
          default: new Footer({
            children: [
              new Table({
                width: {
                  size: 9025,
                  type: WidthType.DXA,
                },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        width: {
                          size: 3000,
                          WidthType: WidthType.DXA,
                        },
                        children: [
                          new Paragraph({
                            style: "redColorText",
                            children: [
                              new TextRun({
                                text: "Manufacturer :" + manufacturer_Name,
                                font: "Times New Roman",
                                color: "#B22222", // Light Red color
                              }),
                            ],
                          }),
                        ],
                      }),

                      new TableCell({
                        width: {
                          size: 3025,
                          WidthType: WidthType.DXA,
                        },
                        children: [
                          new Paragraph({
                            style: "redColorText",
                            children: [
                              new TextRun({
                                text: "Sheet No : ",
                                font: "Times New Roman",
                                color: "#B22222", // Light Red color
                              }),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        width: {
                          size: 3000,
                          WidthType: WidthType.DXA,
                        },
                        children: [
                          new Paragraph({
                            style: "redColorText",
                            children: [
                              new TextRun({
                                text: "Test Agency : ",
                                font: "Times New Roman",
                                color: "#B22222", // Light Red color
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        width: {
                          size: 3000,
                          type: WidthType.DXA,
                        },
                        children: [
                          new Paragraph({
                            style: "redColorText",
                            children: [docSealImage],

                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                      }),
                      new TableCell({
                        width: {
                          size: 3025,
                          WidthType: WidthType.DXA,
                        },
                        children: [
                          new Paragraph({
                            style: "redColorText",
                            children: [
                              new TextRun({
                                text:
                                  "Document No: " +
                                  dataOfFooter.Document_No.value,
                                font: "Times New Roman",
                                color: "#B22222", // Light Red color
                              }),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        width: {
                          size: 3000,
                          WidthType: WidthType.DXA,
                        },
                        children: [
                          new Paragraph({
                            style: "redColorText",
                            children: [
                              new TextRun({
                                text: "",
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        width: {
                          size: 3000,
                          WidthType: WidthType.DXA,
                        },
                        children: [
                          new Paragraph({
                            style: "redColorText",
                            children: [
                              new TextRun({
                                // text: "Name: " + dataOfFooter.Homologation_Engineer_Name.value,
                                text: "Name: " + homologation_Engg_Name,
                                font: "Times New Roman",
                                color: "#B22222", // Light Red color
                              }),
                              new TextRun({
                                text: "Designation:",
                                font: "Times New Roman",
                                color: "#B22222", // Light Red color
                                break: 1,
                              }),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        width: {
                          size: 3025,
                          WidthType: WidthType.DXA,
                        },
                        children: [
                          new Paragraph({
                            style: "redColorText",
                            children: [
                              new TextRun({
                                 text: `Date : ${formattedDate}`,
                                font: "Times New Roman",
                                color: "#B22222", // Light Red color
                              }),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        width: {
                          size: 3000,
                          WidthType: WidthType.DXA,
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
                                break: 1,
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    children: ["Page | ", PageNumber.CURRENT],
                    font: "Times New Roman",
                    style: {
                      color: "#B22222", // Firebrick red
                    },
                  }),
                ],
                alignment: AlignmentType.RIGHT,
              }),
            ],
          }),
        },
      },
    ],
  });
  exportDoc(form8Document, "form8Document.docx");
}



export default generateForm8;