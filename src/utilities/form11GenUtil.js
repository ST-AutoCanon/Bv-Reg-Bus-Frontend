import exportDoc from './exportUtil';
import { Document, Header, Paragraph, TextRun, AlignmentType, Table, TableRow, TableCell, WidthType, Footer, ImageRun, PageNumber } from "docx";

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
  
  function generateTableData(dataList) {
    if (Array.isArray(dataList) && dataList.length > 0) {
        // Extract 'Wheel_rim_size' or 'value' from each wheelRim and join them into a single string
        const values = dataList.map(wheelRim =>
            wheelRim?.Wheel_Rim_Size?.properties?.Wheel_rim_size?.value ||
            wheelRim?.value ||
            ""
        );
        // If there's more than one value, join them with a hyphen
        if (values.length > 1) {
            return values.join(" | ");
        } else {
            return values[0] || ""; // Return the single value if there's only one
        }
    } else {
        return ""; // Return an empty string if no data is available
    }
}
async function fetchAndProcessImage(footerData) {
    const dataOfFooterr = footerData.footerData.SealSign.properties;
    
    const fileName = dataOfFooterr.Upload_Seal.file_name;
    const imageUrl = `https://bv-reg.com/api/files/downloads/${fileName}`; 
//   const imageUrl = `http://localhost:3005/api/files/downloads/${fileName}`; 

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
async function generateForm11(form11Data, footerData) {
    const docSealImage = await fetchAndProcessImage(footerData);

    // console.log('form11Data:', form11Data);
    const dataOfFooter = footerData.footerData.footer.properties;
    const dataOfFooterr = footerData.footerData.SealSign.properties;

    let homologation_Engg_Name = dataOfFooter.Homologation_Engineer_Name.value;
    
        // Capitalize first letter and prepend "Mr/Mrs"
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

    // let imageUrl;

    // const fileName = dataOfFooterr.Upload_Seal.file_name;
    // imageUrl = `https://bv-reg.com/api/files/downloads/${fileName}`;  // Use the correct backend port



    
    const drawing1 = footerData.form11Data.diagrams.properties.Upload_drawing1.file_name;
    const drawing2 = footerData.form11Data.diagrams.properties.Upload_drawing2.file_name;
    const drawing3 = footerData.form11Data.diagrams.properties.Upload_drawing3.file_name;
    // const extractFileName = (fileName) => {
    //     const parts = fileName.split('-');
    //     return parts.slice(1).join('-');
    // };

    const extractFileName = (fileName) => {
        const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
        const parts = nameWithoutExt.split('-');
        const name = parts.length > 1 ? parts.slice(1).join('-') : parts[0];
        return name ? `ref: ${name}` : " ";
      };
      
    
    let drawingList1 = [];
    let drawingList2 = [];
    let drawingList3 = [];
    // const vehModel1 = {
    //     value: drawing1
    // }
    // drawingList1.push(vehModel1);
    // const vehModel2 = {
    //     value: drawing2
    // }
    // drawingList2.push(vehModel2);
    // const vehModel3 = {
    //     value: drawing3
    // }
    // drawingList3.push(vehModel3);

    drawingList1 = [{ value: extractFileName(drawing1) }];
    drawingList2 = [{ value: extractFileName(drawing2) }];
    drawingList3 = [{ value: extractFileName(drawing3) }];
    const drawing1_Rows = generateTableData(drawingList1);
    const drawing2_Rows = generateTableData(drawingList2);
    const drawing3_Rows = generateTableData(drawingList3);


    // const drawing1_Rows = generateTableData(drawingList1);
    // const drawing2_Rows = generateTableData(drawingList2);
    // const drawing3_Rows = generateTableData(drawingList3);
    const vehicleGeneralInformation_list = form11Data?.Vehicle_General_Information?.vehicleGeneralInformation;
    const vehicleIdentificationNumber_list = form11Data?.Vehicle_Identification_Number?.VehicleIdentificationNumber;
    const codForMonthProduction_list = form11Data?.Month_of_Production?.codeForMonthOfProduction;
    let Specify_the_Location_of_VIN_on_Chassis_List = [];
    let Position_of_the_code_for_month_in_the_Chassis_number_List = [];
    let Position_of_the_code_for_year_in_the_Chassis_number_List = [];
    let Height_of_VIN_characters_List = [];
    let Manufacturer_name_and_address_List = [];
    let Basic_model_List = [];
    let variant_List = [];

    vehicleGeneralInformation_list.map(vehDesc => {
        if (vehDesc.supplier.active === true) {
            const supplierName = vehDesc?.supplier?.nameOfSupplier;
            const Manufacturer_name_and_address = {
                supplier: supplierName,
                value: vehDesc?.Manufacturer_Details?.properties?.Manufacturer_name_and_address?.value
            }
            Manufacturer_name_and_address_List.push(Manufacturer_name_and_address);
            const Basic_model = {
                supplier: supplierName,
                value: vehDesc?.Manufacturer_Details?.properties?.Basic_model?.value
            }
            Basic_model_List.push(Basic_model);
            const variant = {
                supplier: supplierName,
                value: vehDesc?.Manufacturer_Details?.properties?.variant?.value
            }
            variant_List.push(variant);
        }
    });

    const Manufacturer_name_and_address_Rows = generateTableData(Manufacturer_name_and_address_List);
    const updatedManufacturer_name_and_address_Rows= normalizeMsPrefix(Manufacturer_name_and_address_Rows);
    const Basic_model_Rows = generateTableData(Basic_model_List);
    const variant_Rows = generateTableData(variant_List);

    let Example_of_Engine_Motor_No_List = [];
    let Example_of_Chassis_No_with_Month_Year_of_Manufacture_List = [];

    vehicleIdentificationNumber_list.map(vehDesc => {
        if (vehDesc.supplier.active === true) {
            const supplierName = vehDesc?.supplier?.nameOfSupplier;
            const Specify_the_Location_of_VIN_on_Chassis = {
                supplier: supplierName,
                value: vehDesc?.VIN_Numbering?.properties?.Specify_the_Location_of_VIN_on_Chassis?.value
            }
            Specify_the_Location_of_VIN_on_Chassis_List.push(Specify_the_Location_of_VIN_on_Chassis);
            const Position_of_the_code_for_month_in_the_Chassis_number = {
                supplier: supplierName,
                value: vehDesc?.VIN_Numbering?.properties?.Position_of_the_code_for_month_in_the_Chassis_number?.value
            }
            Position_of_the_code_for_month_in_the_Chassis_number_List.push(Position_of_the_code_for_month_in_the_Chassis_number);

            const Position_of_the_code_for_year_in_the_Chassis_number = {
                supplier: supplierName,
                value: vehDesc?.VIN_Numbering?.properties?.Position_of_the_code_for_year_in_the_Chassis_number?.value
            }
            Position_of_the_code_for_year_in_the_Chassis_number_List.push(Position_of_the_code_for_year_in_the_Chassis_number);

            const Height_of_VIN_characters = {
                supplier: supplierName,
                value: vehDesc?.VIN_Numbering?.properties?.Height_of_VIN_characters?.value
            }
            Height_of_VIN_characters_List.push(Height_of_VIN_characters);
            const Example_of_Engine_Motor_No = {
                supplier: supplierName,
                value: vehDesc?.VIN_Numbering?.properties?.Example_of_Engine_Motor_No?.value
            }
            Example_of_Engine_Motor_No_List.push(Example_of_Engine_Motor_No);
            const Example_of_Chassis_No_with_Month_Year_of_Manufacture = {
                supplier: supplierName,
                value: vehDesc?.VIN_Numbering?.properties?.Example_of_Chassis_No_with_Month_Year_of_Manufacture?.value
            }
            Example_of_Chassis_No_with_Month_Year_of_Manufacture_List.push(Example_of_Chassis_No_with_Month_Year_of_Manufacture);
        }
    });

    const Specify_the_Location_of_VIN_on_Chassis_Rows = generateTableData(Specify_the_Location_of_VIN_on_Chassis_List);
    const Position_of_the_code_for_month_in_the_Chassis_number_Rows = generateTableData(Position_of_the_code_for_month_in_the_Chassis_number_List);
    const Position_of_the_code_for_year_in_the_Chassis_number_Rows = generateTableData(Position_of_the_code_for_year_in_the_Chassis_number_List);
    // const Height_of_VIN_characters_Rows = generateTableData(Height_of_VIN_characters_List);
     const Height_of_VIN_characters_Rows1 = generateTableData(
    Height_of_VIN_characters_List
  );
  let Height_of_VIN_characters_Rows  = normalizeWithUnit(Height_of_VIN_characters_Rows1,MM);
    const Example_of_Engine_Motor_No_Rows = generateTableData(Example_of_Engine_Motor_No_List);
    const Example_of_Chassis_No_with_Month_Year_of_Manufacture_Rows = generateTableData(Example_of_Chassis_No_with_Month_Year_of_Manufacture_List);

    let year = [];
    let January_List = [];
    let January_List_Rows;

    let February_List = [];
    let February_List_Rows;

    let March_List = [];
    let March_List_Rows;

    let April_List = [];
    let April_List_Rows;

    let May_List = [];
    let May_List_Rows;

    let June_List = [];
    let June_List_Rows;

    let July_List = [];
    let July_List_Rows;

    let August_List = [];
    let August_List_Rows;

    let September_List = [];
    let September_List_Rows;

    let October_List = [];
    let October_List_Rows;

    let November_List = [];
    let November_List_Rows;

    let December_List = [];
    let December_List_Rows;

    // Generate Rows for all 30 Years
    let firstyear_List = [];
    let firstyear_List_Rows;

    let secondyear_List = [];
    let secondyear_List_Rows;

    let thirdyear_List = [];
    let thirdyear_List_Rows;

    let fourthyear_List = [];
    let fourthyear_List_Rows;

    let fifthyear_List = [];
    let fifthyear_List_Rows;

    let sixthyear_List = [];
    let sixthyear_List_Rows;

    let seventhyear_List = [];
    let seventhyear_List_Rows;

    let eighthyear_List = [];
    let eighthyear_List_Rows;

    let ninthyear_List = [];
    let ninthyear_List_Rows;

    let tenthyear_List = [];
    let tenthyear_List_Rows;

    let eleventhyear_List = [];
    let eleventhyear_List_Rows;

    let twelfthyear_List = [];
    let twelfthyear_List_Rows;

    let thirteenthyear_List = [];
    let thirteenthyear_List_Rows;

    let fourteenthyear_List = [];
    let fourteenthyear_List_Rows;

    let fifteenthyear_List = [];
    let fifteenthyear_List_Rows;

    let sixteenthyear_List = [];
    let sixteenthyear_List_Rows;

    let seventeenthyear_List = [];
    let seventeenthyear_List_Rows;

    let eighteenthyear_List = [];
    let eighteenthyear_List_Rows;

    let nineteenthyear_List = [];
    let nineteenthyear_List_Rows;

    let twentiethyear_List = [];
    let twentiethyear_List_Rows;

    let twentyfirstyear_List = [];
    let twentyfirstyear_List_Rows;

    let twentysecondyear_List = [];
    let twentysecondyear_List_Rows;

    let twentythirdyear_List = [];
    let twentythirdyear_List_Rows;

    let twentyfourthyear_List = [];
    let twentyfourthyear_List_Rows;

    let twentyfifthyear_List = [];
    let twentyfifthyear_List_Rows;

    let twentysixthyear_List = [];
    let twentysixthyear_List_Rows;

    let twentyseventhyear_List = [];
    let twentyseventhyear_List_Rows;

    let twentyeighthyear_List = [];
    let twentyeighthyear_List_Rows;

    let twentyninthyear_List = [];
    let twentyninthyear_List_Rows;

    let thirtiethyear_List = [];
    let thirtiethyear_List_Rows;

    // Generate Rows for all 30 Year Codes
    let firstYearCode_List = [];
    let firstYearCode_List_Rows;

    let secondYearCode_List = [];
    let secondYearCode_List_Rows;

    let thirdYearCode_List = [];
    let thirdYearCode_List_Rows;

    let fourthYearCode_List = [];
    let fourthYearCode_List_Rows;

    let fifthYearCode_List = [];
    let fifthYearCode_List_Rows;

    let sixthYearCode_List = [];
    let sixthYearCode_List_Rows;

    let seventhYearCode_List = [];
    let seventhYearCode_List_Rows;

    let eighthYearCode_List = [];
    let eighthYearCode_List_Rows;

    let ninthYearCode_List = [];
    let ninthYearCode_List_Rows;

    let tenthYearCode_List = [];
    let tenthYearCode_List_Rows;

    let eleventhYearCode_List = [];
    let eleventhYearCode_List_Rows;

    let twelfthYearCode_List = [];
    let twelfthYearCode_List_Rows;

    let thirteenthYearCode_List = [];
    let thirteenthYearCode_List_Rows;

    let fourteenthYearCode_List = [];
    let fourteenthYearCode_List_Rows;

    let fifteenthYearCode_List = [];
    let fifteenthYearCode_List_Rows;

    let sixteenthYearCode_List = [];
    let sixteenthYearCode_List_Rows;

    let seventeenthYearCode_List = [];
    let seventeenthYearCode_List_Rows;

    let eighteenthYearCode_List = [];
    let eighteenthYearCode_List_Rows;

    let nineteenthYearCode_List = [];
    let nineteenthYearCode_List_Rows;

    let twentiethYearCode_List = [];
    let twentiethYearCode_List_Rows;

    let twentyfirstYearCode_List = [];
    let twentyfirstYearCode_List_Rows;

    let twentysecondYearCode_List = [];
    let twentysecondYearCode_List_Rows;

    let twentythirdYearCode_List = [];
    let twentythirdYearCode_List_Rows;

    let twentyfourthYearCode_List = [];
    let twentyfourthYearCode_List_Rows;

    let twentyfifthYearCode_List = [];
    let twentyfifthYearCode_List_Rows;

    let twentysixthYearCode_List = [];
    let twentysixthYearCode_List_Rows;

    let twentyseventhYearCode_List = [];
    let twentyseventhYearCode_List_Rows;

    let twentyeighthYearCode_List = [];
    let twentyeighthYearCode_List_rows;

    let twentyninthYearCode_List = [];
    let twentyninthYearCode_List_Rows;

    let thirtiethYearCode_List = [];
    let thirtiethYearCode_List_Rows;

    let VDS_value_fourth_List = [];
    let VDS_value_fourth_List_Rows;

    let VDS_fourth_type_List = [];
    let VDS_fourth_type_List_Rows;

    let VDS_value_fifth_List = [];
    let VDS_value_fifth_List_Rows;

    let VDS_fifth_type_List = [];
    let VDS_fifth_type_List_Rows;

    let VDS_value_sixth_List = [];
    let VDS_value_sixth_List_Rows;

    let VDS_sixth_type_List = [];
    let VDS_sixth_type_List_Rows;

    let VDS_value_seventh_List = [];
    let VDS_value_seventh_List_Rows;

    let VDS_seventh_type_List = [];
    let VDS_seventh_type_List_Rows;

    let VDS_value_eighth_List = [];
    let VDS_value_eighth_List_Rows;

    let VDS_eighth_type_List = [];
    let VDS_eighth_type_List_Rows;

    let VDS_value_ninth_List = [];
    let VDS_value_ninth_List_Rows;

    let VDS_ninth_type_List = [];
    let VDS_ninth_type_List_Rows;



    let VDS_value_tenth_List = [];
    let VDS_value_tenth_List_Rows;

    let VDS_tenth_type_List = [];
    let VDS_tenth_type_List_Rows;

    let VDS_value_eleventh_List = [];
    let VDS_value_eleventh_List_Rows;

    let VDS_eleventh_type_List = [];
    let VDS_eleventh_type_List_Rows;


    let concatenatedResult_List = [];
    let concatenatedResult_List_Rows;

    let WMI_Code_List = [];
    let WMI_Code_List_Rows;
    let Month_List = [];
    let Month_List_Rows;
    let Year_List = [];
    let Year_List_Rows;
    let WMI_Extension_Code_List = [];
    let WMI_Extension_Code_List_Rows;
    let Serial_Number_List = [];
    let Serial_Number_List_Rows;

    codForMonthProduction_list.map(vehDesc => {
        if (vehDesc.supplier.active === true) {
            const supplierName = vehDesc?.supplier?.nameOfSupplier;
            //         // Months
            January_List.push({
                supplier: supplierName,
                value: vehDesc?.Month_of_Production?.properties?.January?.value,
            });
            February_List.push({
                supplier: supplierName,
                value: vehDesc?.Month_of_Production?.properties?.February?.value,
            });
            March_List.push({
                supplier: supplierName,
                value: vehDesc?.Month_of_Production?.properties?.March?.value,
            });
            April_List.push({
                supplier: supplierName,
                value: vehDesc?.Month_of_Production?.properties?.April?.value,
            });
            May_List.push({
                supplier: supplierName,
                value: vehDesc?.Month_of_Production?.properties?.May?.value,
            });
            June_List.push({
                supplier: supplierName,
                value: vehDesc?.Month_of_Production?.properties?.June?.value,
            });
            July_List.push({
                supplier: supplierName,
                value: vehDesc?.Month_of_Production?.properties?.July?.value,
            });
            August_List.push({
                supplier: supplierName,
                value: vehDesc?.Month_of_Production?.properties?.August?.value,
            });
            September_List.push({
                supplier: supplierName,
                value: vehDesc?.Month_of_Production?.properties?.September?.value,
            });
            October_List.push({
                supplier: supplierName,
                value: vehDesc?.Month_of_Production?.properties?.October?.value,
            });
            November_List.push({
                supplier: supplierName,
                value: vehDesc?.Month_of_Production?.properties?.November?.value,
            });
            December_List.push({
                supplier: supplierName,
                value: vehDesc?.Month_of_Production?.properties?.December?.value,
            });
            firstyear_List.push({
                supplier: supplierName,
                value: vehDesc?.Year_of_Production?.properties?.firstyear?.value,
            });
            secondyear_List.push({
                supplier: supplierName,
                value: vehDesc?.Year_of_Production?.properties?.secondyear?.value,
            });
            thirdyear_List.push({
                supplier: supplierName,
                value: vehDesc?.Year_of_Production?.properties?.thirdyear?.value,
            });
            fourthyear_List.push({
                supplier: supplierName,
                value: vehDesc?.Year_of_Production?.properties?.fourthyear?.value,
            });
            fifthyear_List.push({
                supplier: supplierName,
                value: vehDesc?.Year_of_Production?.properties?.fifthyear?.value,
            });
            sixthyear_List.push({
                supplier: supplierName,
                value: vehDesc?.Year_of_Production?.properties?.sixthyear?.value,
            });
            seventhyear_List.push({
                supplier: supplierName,
                value: vehDesc?.Year_of_Production?.properties?.seventhyear?.value,
            });
            eighthyear_List.push({
                supplier: supplierName,
                value: vehDesc?.Year_of_Production?.properties?.eighthyear?.value,
            });
            ninthyear_List.push({
                supplier: supplierName,
                value: vehDesc?.Year_of_Production?.properties?.ninthyear?.value,
            });
            tenthyear_List.push({
                supplier: supplierName,
                value: vehDesc?.Year_of_Production?.properties?.tenthyear?.value,
            });
            eleventhyear_List.push({
                supplier: supplierName,
                value: vehDesc?.Year_of_Production?.properties?.eleventhyear?.value,
            });
            twelfthyear_List.push({
                supplier: supplierName,
                value: vehDesc?.Year_of_Production?.properties?.twelfthyear?.value,
            });
            thirteenthyear_List.push({
                supplier: supplierName,
                value: vehDesc?.Year_of_Production?.properties?.thirteenthyear?.value,
            });
            fourteenthyear_List.push({
                supplier: supplierName,
                value: vehDesc?.Year_of_Production?.properties?.fourteenthyear?.value,
            });
            fifteenthyear_List.push({
                supplier: supplierName,
                value: vehDesc?.Year_of_Production?.properties?.fifteenthyear?.value,
            });
            sixteenthyear_List.push({
                supplier: supplierName,
                value: vehDesc?.Year_of_Production?.properties?.sixteenthyear?.value,
            });
            seventeenthyear_List.push({
                supplier: supplierName,
                value: vehDesc?.Year_of_Production?.properties?.seventeenthyear?.value,
            });
            eighteenthyear_List.push({
                supplier: supplierName,
                value: vehDesc?.Year_of_Production?.properties?.eighteenthyear?.value,
            });
            nineteenthyear_List.push({
                supplier: supplierName,
                value: vehDesc?.Year_of_Production?.properties?.nineteenthyear?.value,
            });
            twentiethyear_List.push({
                supplier: supplierName,
                value: vehDesc?.Year_of_Production?.properties?.twentiethyear?.value,
            });
            twentyfirstyear_List.push({
                supplier: supplierName,
                value: vehDesc?.Year_of_Production?.properties?.twentyfirstyear?.value,
            });
            twentysecondyear_List.push({
                supplier: supplierName,
                value: vehDesc?.Year_of_Production?.properties?.twentysecondyear?.value,
            });
            twentythirdyear_List.push({
                supplier: supplierName,
                value: vehDesc?.Year_of_Production?.properties?.twentythirdyear?.value,
            });
            twentyfourthyear_List.push({
                supplier: supplierName,
                value: vehDesc?.Year_of_Production?.properties?.twentyfourthyear?.value,
            });
            twentyfifthyear_List.push({
                supplier: supplierName,
                value: vehDesc?.Year_of_Production?.properties?.twentyfifthyear?.value,
            });
            twentysixthyear_List.push({
                supplier: supplierName,
                value: vehDesc?.Year_of_Production?.properties?.twentysixthyear?.value,
            });
            twentyseventhyear_List.push({
                supplier: supplierName,
                value: vehDesc?.Year_of_Production?.properties?.twentyseventhyear?.value,
            });
            twentyeighthyear_List.push({
                supplier: supplierName,
                value: vehDesc?.Year_of_Production?.properties?.twentyeighthyear?.value,
            });
            twentyninthyear_List.push({
                supplier: supplierName,
                value: vehDesc?.Year_of_Production?.properties?.twentyninthyear?.value,
            });
            thirtiethyear_List.push({
                supplier: supplierName,
                value: vehDesc?.Year_of_Production?.properties?.thirtiethyear?.value,
            });

            // Year Codes
            firstYearCode_List.push({
                supplier: supplierName,
                value: vehDesc?.Code_for_Year?.properties?.firstYearCode?.value,
            });
            secondYearCode_List.push({
                supplier: supplierName,
                value: vehDesc?.Code_for_Year?.properties?.secondYearCode?.value,
            });
            thirdYearCode_List.push({
                supplier: supplierName,
                value: vehDesc?.Code_for_Year?.properties?.thirdYearCode?.value,
            });
            fourthYearCode_List.push({
                supplier: supplierName,
                value: vehDesc?.Code_for_Year?.properties?.fourthYearCode?.value,
            });
            fifthYearCode_List.push({
                supplier: supplierName,
                value: vehDesc?.Code_for_Year?.properties?.fifthYearCode?.value,
            });
            sixthYearCode_List.push({
                supplier: supplierName,
                value: vehDesc?.Code_for_Year?.properties?.sixthYearCode?.value,
            });
            seventhYearCode_List.push({
                supplier: supplierName,
                value: vehDesc?.Code_for_Year?.properties?.seventhYearCode?.value,
            });
            eighthYearCode_List.push({
                supplier: supplierName,
                value: vehDesc?.Code_for_Year?.properties?.eighthYearCode?.value,
            });
            ninthYearCode_List.push({
                supplier: supplierName,
                value: vehDesc?.Code_for_Year?.properties?.ninthYearCode?.value,
            });
            tenthYearCode_List.push({
                supplier: supplierName,
                value: vehDesc?.Code_for_Year?.properties?.tenthYearCode?.value,
            });
            eleventhYearCode_List.push({
                supplier: supplierName,
                value: vehDesc?.Code_for_Year?.properties?.eleventhYearCode?.value,
            });
            twelfthYearCode_List.push({
                supplier: supplierName,
                value: vehDesc?.Code_for_Year?.properties?.twelfthYearCode?.value,
            });
            thirteenthYearCode_List.push({
                supplier: supplierName,
                value: vehDesc?.Code_for_Year?.properties?.thirteenthYearCode?.value,
            });
            fourteenthYearCode_List.push({
                supplier: supplierName,
                value: vehDesc?.Code_for_Year?.properties?.fourteenthYearCode?.value,
            });
            fifteenthYearCode_List.push({
                supplier: supplierName,
                value: vehDesc?.Code_for_Year?.properties?.fifteenthYearCode?.value,
            });
            sixteenthYearCode_List.push({
                supplier: supplierName,
                value: vehDesc?.Code_for_Year?.properties?.sixteenthYearCode?.value,
            });
            seventeenthYearCode_List.push({
                supplier: supplierName,
                value: vehDesc?.Code_for_Year?.properties?.seventeenthYearCode?.value,
            });
            eighteenthYearCode_List.push({
                supplier: supplierName,
                value: vehDesc?.Code_for_Year?.properties?.eighteenthYearCode?.value,
            });
            nineteenthYearCode_List.push({
                supplier: supplierName,
                value: vehDesc?.Code_for_Year?.properties?.nineteenthYearCode?.value,
            });
            twentiethYearCode_List.push({
                supplier: supplierName,
                value: vehDesc?.Code_for_Year?.properties?.twentiethYearCode?.value,
            });
            twentyfirstYearCode_List.push({
                supplier: supplierName,
                value: vehDesc?.Code_for_Year?.properties?.twentyFirstYearCode?.value,
            });
            twentysecondYearCode_List.push({
                supplier: supplierName,
                value: vehDesc?.Code_for_Year?.properties?.twentySecondYearCode?.value,
            });
            twentythirdYearCode_List.push({
                supplier: supplierName,
                value: vehDesc?.Code_for_Year?.properties?.twentyThirdYearCode?.value,
            });
            twentyfourthYearCode_List.push({
                supplier: supplierName,
                value: vehDesc?.Code_for_Year?.properties?.twentyFourthYearCode?.value,
            });
            twentyfifthYearCode_List.push({
                supplier: supplierName,
                value: vehDesc?.Code_for_Year?.properties?.twentyFifthYearCode?.value,
            });
            twentysixthYearCode_List.push({
                supplier: supplierName,
                value: vehDesc?.Code_for_Year?.properties?.twentySixthYearCode?.value,
            });
            twentyseventhYearCode_List.push({
                supplier: supplierName,
                value: vehDesc?.Code_for_Year?.properties?.twentySeventhYearCode?.value,
            });
            twentyeighthYearCode_List.push({
                supplier: supplierName,
                value: vehDesc?.Code_for_Year?.properties?.twentyEighthYearCode?.value,
            });
            twentyninthYearCode_List.push({
                supplier: supplierName,
                value: vehDesc?.Code_for_Year?.properties?.twentyNinthYearCode?.value,
            });
            thirtiethYearCode_List.push({
                supplier: supplierName,
                value: vehDesc?.Code_for_Year?.properties?.thirtiethYearCode?.value,
            });

            VDS_value_fourth_List.push({
                supplier: supplierName,
                value: vehDesc?.vds_Sequence?.properties?.VDS_value_fourth?.value,
            });

            VDS_fourth_type_List.push({
                supplier: supplierName,
                value: vehDesc?.vds_Sequence?.properties?.VDS_fourth_type?.value,
            });

            VDS_value_fifth_List.push({
                supplier: supplierName,
                value: vehDesc?.vds_Sequence?.properties?.VDS_value_fifth?.value,
            });

            VDS_fifth_type_List.push({
                supplier: supplierName,
                value: vehDesc?.vds_Sequence?.properties?.VDS_fifth_type?.value,
            });

            VDS_value_sixth_List.push({
                supplier: supplierName,
                value: vehDesc?.vds_Sequence?.properties?.VDS_value_sixth?.value,
            });

            VDS_sixth_type_List.push({
                supplier: supplierName,
                value: vehDesc?.vds_Sequence?.properties?.VDS_sixth_type?.value,
            });

            VDS_value_seventh_List.push({
                supplier: supplierName,
                value: vehDesc?.vds_Sequence?.properties?.VDS_value_seventh?.value,
            });

            VDS_seventh_type_List.push({
                supplier: supplierName,
                value: vehDesc?.vds_Sequence?.properties?.VDS_seventh_type?.value,
            });

            VDS_value_eighth_List.push({
                supplier: supplierName,
                value: vehDesc?.vds_Sequence?.properties?.VDS_value_eighth?.value,
            });

            VDS_eighth_type_List.push({
                supplier: supplierName,
                value: vehDesc?.vds_Sequence?.properties?.VDS_eighth_type?.value,
            });

            VDS_value_ninth_List.push({
                supplier: supplierName,
                value: vehDesc?.vds_Sequence?.properties?.VDS_value_ninth?.value,
            });

            VDS_ninth_type_List.push({
                supplier: supplierName,
                value: vehDesc?.vds_Sequence?.properties?.VDS_ninth_type?.value,
            });


            /// 
            VDS_value_tenth_List.push({
                supplier: supplierName,
                value: vehDesc?.vds_Sequence?.properties?.VDS_value_tenth?.value,
            });
            VDS_tenth_type_List.push({
                supplier: supplierName,
                value: vehDesc?.vds_Sequence?.properties?.VDS_tenth_type?.value,
            });
            //
            VDS_value_eleventh_List.push({
                supplier: supplierName,
                value: vehDesc?.vds_Sequence?.properties?.VDS_value_eleventh?.value,
            });
            VDS_eleventh_type_List.push({
                supplier: supplierName,
                value: vehDesc?.vds_Sequence?.properties?.VDS_eleventh_type?.value,
            });

            WMI_Code_List.push({
                supplier: supplierName,
                value: vehDesc?.chassis_Number?.properties?.WMI_Code?.value,
            });
            Month_List.push({
                supplier: supplierName,
                value: vehDesc?.chassis_Number?.properties?.month?.value,
            });
            Year_List.push({
                supplier: supplierName,
                value: vehDesc?.chassis_Number?.properties?.year?.value,
            });
            WMI_Extension_Code_List.push({
                supplier: supplierName,
                value: vehDesc?.chassis_Number?.properties?.wmi_extension_code?.value,
            });
            Serial_Number_List.push({
                supplier: supplierName,
                value: vehDesc?.chassis_Number?.properties?.serial_number?.value,
            });

        }
    });


    January_List_Rows = generateTableData(January_List);
    February_List_Rows = generateTableData(February_List);
    March_List_Rows = generateTableData(March_List);
    April_List_Rows = generateTableData(April_List);
    May_List_Rows = generateTableData(May_List);
    June_List_Rows = generateTableData(June_List);
    July_List_Rows = generateTableData(July_List);
    August_List_Rows = generateTableData(August_List);
    September_List_Rows = generateTableData(September_List);
    October_List_Rows = generateTableData(October_List);
    November_List_Rows = generateTableData(November_List);
    December_List_Rows = generateTableData(December_List);






    let startYear = parseInt(firstyear_List[0].value) || ''; // Extract and convert the string to an integer

    if (startYear !== '') { // Only iterate if startYear is not an empty string
        for (let i = 0; i <= 29; i++) {
            year.push({ value: (startYear + i).toString() }); // Add year as an object with "value" key
        }
    }

    let secondyear = year[1] ? [{ value: year[1].value }] : [];
    let thirdyear = year[2] ? [{ value: year[2].value }] : [];
    let fourthyear = year[3] ? [{ value: year[3].value }] : [];
    let fifthyear = year[4] ? [{ value: year[4].value }] : [];
    let sixthyear = year[5] ? [{ value: year[5].value }] : [];
    let seventhyear = year[6] ? [{ value: year[6].value }] : [];
    let eighthyear = year[7] ? [{ value: year[7].value }] : [];
    let ninthyear = year[8] ? [{ value: year[8].value }] : [];
    let tenthyear = year[9] ? [{ value: year[9].value }] : [];
    let eleventhyear = year[10] ? [{ value: year[10].value }] : [];
    let twelfthyear = year[11] ? [{ value: year[11].value }] : [];
    let thirteenthyear = year[12] ? [{ value: year[12].value }] : [];
    let fourteenthyear = year[13] ? [{ value: year[13].value }] : [];
    let fifteenthyear = year[14] ? [{ value: year[14].value }] : [];
    let sixteenthyear = year[15] ? [{ value: year[15].value }] : [];
    let seventeenthyear = year[16] ? [{ value: year[16].value }] : [];
    let eighteenthyear = year[17] ? [{ value: year[17].value }] : [];
    let nineteenthyear = year[18] ? [{ value: year[18].value }] : [];
    let twentiethyear = year[19] ? [{ value: year[19].value }] : [];
    let twentyfirstyear = year[20] ? [{ value: year[20].value }] : [];
    let twentysecondyear = year[21] ? [{ value: year[21].value }] : [];
    let twentythirdyear = year[22] ? [{ value: year[22].value }] : [];
    let twentyfourthyear = year[23] ? [{ value: year[23].value }] : [];
    let twentyfifthyear = year[24] ? [{ value: year[24].value }] : [];
    let twentysixthyear = year[25] ? [{ value: year[25].value }] : [];
    let twentyseventhyear = year[26] ? [{ value: year[26].value }] : [];
    let twentyeighthyear = year[27] ? [{ value: year[27].value }] : [];
    let twentyninthyear = year[28] ? [{ value: year[28].value }] : [];
    let thirtiethyear = year[29] ? [{ value: year[29].value }] : [];

    // Generate Rows for all 30 Years
    firstyear_List_Rows = generateTableData(firstyear_List);
    secondyear_List_Rows = generateTableData(secondyear);
    thirdyear_List_Rows = generateTableData(thirdyear);
    fourthyear_List_Rows = generateTableData(fourthyear);
    fifthyear_List_Rows = generateTableData(fifthyear);
    sixthyear_List_Rows = generateTableData(sixthyear);
    seventhyear_List_Rows = generateTableData(seventhyear);
    eighthyear_List_Rows = generateTableData(eighthyear);
    ninthyear_List_Rows = generateTableData(ninthyear);
    tenthyear_List_Rows = generateTableData(tenthyear);

    eleventhyear_List_Rows = generateTableData(eleventhyear);
    twelfthyear_List_Rows = generateTableData(twelfthyear);
    thirteenthyear_List_Rows = generateTableData(thirteenthyear);
    fourteenthyear_List_Rows = generateTableData(fourteenthyear);
    fifteenthyear_List_Rows = generateTableData(fifteenthyear);
    sixteenthyear_List_Rows = generateTableData(sixteenthyear);
    seventeenthyear_List_Rows = generateTableData(seventeenthyear);
    eighteenthyear_List_Rows = generateTableData(eighteenthyear);
    nineteenthyear_List_Rows = generateTableData(nineteenthyear);
    twentiethyear_List_Rows = generateTableData(twentiethyear);
    twentyfirstyear_List_Rows = generateTableData(twentyfirstyear);
    twentysecondyear_List_Rows = generateTableData(twentysecondyear);
    twentythirdyear_List_Rows = generateTableData(twentythirdyear);
    twentyfourthyear_List_Rows = generateTableData(twentyfourthyear);
    twentyfifthyear_List_Rows = generateTableData(twentyfifthyear);
    twentysixthyear_List_Rows = generateTableData(twentysixthyear);
    twentyseventhyear_List_Rows = generateTableData(twentyseventhyear);
    twentyeighthyear_List_Rows = generateTableData(twentyeighthyear);
    twentyninthyear_List_Rows = generateTableData(twentyninthyear);
    thirtiethyear_List_Rows = generateTableData(thirtiethyear);



    // Generate Rows for all 30 Year Codes
    firstYearCode_List_Rows = generateTableData(firstYearCode_List);
    secondYearCode_List_Rows = generateTableData(secondYearCode_List);
    thirdYearCode_List_Rows = generateTableData(thirdYearCode_List);
    fourthYearCode_List_Rows = generateTableData(fourthYearCode_List);
    fifthYearCode_List_Rows = generateTableData(fifthYearCode_List);
    sixthYearCode_List_Rows = generateTableData(sixthYearCode_List);
    seventhYearCode_List_Rows = generateTableData(seventhYearCode_List);
    eighthYearCode_List_Rows = generateTableData(eighthYearCode_List);
    ninthYearCode_List_Rows = generateTableData(ninthYearCode_List);
    tenthYearCode_List_Rows = generateTableData(tenthYearCode_List);
    eleventhYearCode_List_Rows = generateTableData(eleventhYearCode_List);
    twelfthYearCode_List_Rows = generateTableData(twelfthYearCode_List);
    thirteenthYearCode_List_Rows = generateTableData(thirteenthYearCode_List);
    fourteenthYearCode_List_Rows = generateTableData(fourteenthYearCode_List);
    fifteenthYearCode_List_Rows = generateTableData(fifteenthYearCode_List);
    sixteenthYearCode_List_Rows = generateTableData(sixteenthYearCode_List);
    seventeenthYearCode_List_Rows = generateTableData(seventeenthYearCode_List);
    eighteenthYearCode_List_Rows = generateTableData(eighteenthYearCode_List);
    nineteenthYearCode_List_Rows = generateTableData(nineteenthYearCode_List);
    twentiethYearCode_List_Rows = generateTableData(twentiethYearCode_List);
    twentyfirstYearCode_List_Rows = generateTableData(twentyfirstYearCode_List);
    twentysecondYearCode_List_Rows = generateTableData(twentysecondYearCode_List);
    twentythirdYearCode_List_Rows = generateTableData(twentythirdYearCode_List);
    twentyfourthYearCode_List_Rows = generateTableData(twentyfourthYearCode_List);
    twentyfifthYearCode_List_Rows = generateTableData(twentyfifthYearCode_List);
    twentysixthYearCode_List_Rows = generateTableData(twentysixthYearCode_List);
    twentyseventhYearCode_List_Rows = generateTableData(twentyseventhYearCode_List);
    twentyeighthYearCode_List_rows = generateTableData(twentyeighthYearCode_List);
    twentyninthYearCode_List_Rows = generateTableData(twentyninthYearCode_List);
    thirtiethYearCode_List_Rows = generateTableData(thirtiethYearCode_List);

    VDS_value_fourth_List_Rows = generateTableData(VDS_value_fourth_List);
    VDS_fourth_type_List_Rows = generateTableData(VDS_fourth_type_List);

    VDS_value_fifth_List_Rows = generateTableData(VDS_value_fifth_List);
    VDS_fifth_type_List_Rows = generateTableData(VDS_fifth_type_List);

    VDS_value_sixth_List_Rows = generateTableData(VDS_value_sixth_List);
    VDS_sixth_type_List_Rows = generateTableData(VDS_sixth_type_List);

    VDS_value_seventh_List_Rows = generateTableData(VDS_value_seventh_List);
    VDS_seventh_type_List_Rows = generateTableData(VDS_seventh_type_List);

    VDS_value_eighth_List_Rows = generateTableData(VDS_value_eighth_List);
    VDS_eighth_type_List_Rows = generateTableData(VDS_eighth_type_List);

    VDS_value_ninth_List_Rows = generateTableData(VDS_value_ninth_List);
    VDS_ninth_type_List_Rows = generateTableData(VDS_ninth_type_List);

    VDS_value_tenth_List_Rows = generateTableData(VDS_value_tenth_List);
    VDS_tenth_type_List_Rows = generateTableData(VDS_tenth_type_List);
    VDS_value_eleventh_List_Rows = generateTableData(VDS_value_eleventh_List);
    VDS_eleventh_type_List_Rows = generateTableData(VDS_eleventh_type_List);
    WMI_Code_List_Rows = generateTableData(WMI_Code_List);
    Month_List_Rows = generateTableData(Month_List);
    Year_List_Rows = generateTableData(Year_List);
    WMI_Extension_Code_List_Rows = generateTableData(WMI_Extension_Code_List);
    Serial_Number_List_Rows = generateTableData(Serial_Number_List);




let firstMonth = "";
let firstYear = "";

// Function to check and print only the first occurrences
function checkVdsType(valueData, typeData, valueLabel) {
    const lowerCaseTypeData = typeData.toLowerCase(); // Convert to lowercase
  
    if (lowerCaseTypeData.includes("month") && firstMonth === "") {
    //   console.log(`${valueLabel} contains the Month`);
      firstMonth = valueLabel;
    } else if (lowerCaseTypeData.includes("year") && firstYear === "") {
    //   console.log(`${valueLabel} contains the Year`);
      firstYear = valueLabel;
    }
  }



// Call the function with the correct mapping
checkVdsType(VDS_value_fourth_List_Rows, VDS_fourth_type_List_Rows, "4");
checkVdsType(VDS_value_fifth_List_Rows, VDS_fifth_type_List_Rows, "5");
checkVdsType(VDS_value_sixth_List_Rows, VDS_sixth_type_List_Rows, "6");
checkVdsType(VDS_value_seventh_List_Rows, VDS_seventh_type_List_Rows, "7");
checkVdsType(VDS_value_eighth_List_Rows, VDS_eighth_type_List_Rows, "8");
checkVdsType(VDS_value_ninth_List_Rows, VDS_ninth_type_List_Rows, "9");
checkVdsType(VDS_value_tenth_List_Rows, VDS_tenth_type_List_Rows, "10");
checkVdsType(VDS_eleventh_type_List_Rows, VDS_eleventh_type_List_Rows,"11");
// Output stored first occurrences
// console.log("First Month stored:", firstMonth);
// console.log("First Year stored:", firstYear);
//////////////////////////////////////

    const concatenatedResult = `#${WMI_Code_List_Rows}${VDS_value_fourth_List_Rows}${VDS_value_fifth_List_Rows}${VDS_value_sixth_List_Rows}` +
        `${VDS_value_seventh_List_Rows}${VDS_value_eighth_List_Rows}` +
        `${VDS_value_ninth_List_Rows}${VDS_value_tenth_List_Rows}${VDS_value_eleventh_List_Rows}` +
        `${WMI_Extension_Code_List_Rows}${Serial_Number_List_Rows}#`;
    // console.log(concatenatedResult);
    concatenatedResult_List = concatenatedResult || " ";
    concatenatedResult_List_Rows = generateTableData(concatenatedResult_List);




    function generateYearProductionItems() {
        let yearItems = [];

        // Title rows
        const yearTitle1 = new TableRow({
            children: [
                new TableCell({
                    columnSpan: 2,
                    width: { size: 5000, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "paragrapgBold",
                            children: [
                                new TextRun({ text: "Code for month of production:" }),
                            ],
                        }),
                    ],
                }),
                new TableCell({
                    columnSpan: 4,
                    width: { size: 10000, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "paragrapgBold",
                            children: [
                                new TextRun({ text: "Code for year of production:" }),
                            ],
                        }),
                    ],
                }),
            ],
        });

        const yearTitle2 = new TableRow({
            children: [
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [new TextRun({ text: "Month" })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [new TextRun({ text: "Month Code" })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [new TextRun({ text: "Year" })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [new TextRun({ text: "Year Code" })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [new TextRun({ text: "Year" })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [new TextRun({ text: "Year Code " })],
                        }),
                    ],
                }),
            ],
        });

        yearItems.push(yearTitle1);
        yearItems.push(yearTitle2);
        let month1code = 200;
        // console.log('month1code:', month1code);
        const row1 = new TableRow({
            children: [
                // Month Cell (1st Column)
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [new TextRun({ text: "January" })],
                        }),
                    ],
                }),
                new TableCell({
                    width: {
                        size: 2500,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [
                                new TextRun({
                                    text: January_List_Rows
                                })
                            ]
                        })
                    ]
                }),
                new TableCell({
                    width: {
                        size: 2500,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [
                                new TextRun({
                                    text: firstyear_List_Rows
                                })
                            ]
                        })
                    ]
                }),
                // Year Code Cell (4th Column)
                new TableCell({
                    width: {
                        size: 2500,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [
                                new TextRun({
                                    text: firstYearCode_List_Rows
                                })
                            ]
                        })
                    ]
                }),
                // Extended Year Cell (5th Column)
                new TableCell({
                    width: {
                        size: 2500,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [
                                new TextRun({
                                    text: sixteenthyear_List_Rows
                                })
                            ]
                        })
                    ]
                }),
                // Extended Year Code Cell (6th Column)
                new TableCell({
                    width: {
                        size: 2500,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [
                                new TextRun({
                                    text: sixteenthYearCode_List_Rows
                                })
                            ]
                        })
                    ]
                }),
            ],
        });
        const row2 = new TableRow({
            children: [
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [new TextRun({ text: "February" })],
                        }),
                    ],
                }),

                new TableCell({
                    width: {
                        size: 2500,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [
                                new TextRun({
                                    text: February_List_Rows
                                })
                            ]
                        })
                    ]
                }),
                // Second Year
                new TableCell({
                    width: {
                        size: 2500,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [
                                new TextRun({
                                    text: secondyear_List_Rows
                                })
                            ]
                        })
                    ]
                }),
                // Second Year Code
                new TableCell({
                    width: {
                        size: 2500,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [
                                new TextRun({
                                    text: secondYearCode_List_Rows
                                })
                            ]
                        })
                    ]
                }),
                // 17th Year
                new TableCell({
                    width: {
                        size: 2500,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [
                                new TextRun({
                                    text: seventeenthyear_List_Rows
                                })
                            ]
                        })
                    ]
                }),
                // 17th Year Code
                new TableCell({
                    width: {
                        size: 2500,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [
                                new TextRun({
                                    text: seventeenthYearCode_List_Rows
                                })
                            ]
                        })
                    ]
                }),
            ],
        });

        const row3 = new TableRow({
            children: [
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [new TextRun({ text: "March" })],
                        }),
                    ],
                }),
                new TableCell({
                    width: {
                        size: 2500,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [
                                new TextRun({
                                    text: March_List_Rows
                                })
                            ]
                        })
                    ]
                }),
                // Third Year

                new TableCell({
                    width: {
                        size: 2500,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [
                                new TextRun({
                                    text: thirdyear_List_Rows
                                })
                            ]
                        })
                    ]
                }),
                // Third Year Code
                new TableCell({
                    width: {
                        size: 2500,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [
                                new TextRun({
                                    text: thirdYearCode_List_Rows
                                })
                            ]
                        })
                    ]
                }),
                // 18th Year
                new TableCell({
                    width: {
                        size: 2500,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [
                                new TextRun({
                                    text: eighteenthyear_List_Rows
                                })
                            ]
                        })
                    ]
                }),
                // 18th Year Code
                new TableCell({
                    width: {
                        size: 2500,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [
                                new TextRun({
                                    text: eighteenthYearCode_List_Rows
                                })
                            ]
                        })
                    ]
                }),
            ],
        });
        const row4 = new TableRow({
            children: [
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [new TextRun({ text: "April" })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: April_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: fourthyear_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: fourthYearCode_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: nineteenthyear_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: nineteenthYearCode_List_Rows })],
                        }),
                    ],
                }),
            ],
        });

        const row5 = new TableRow({
            children: [
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [new TextRun({ text: "May" })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: May_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: fifthyear_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: fifthYearCode_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: twentiethyear_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: twentiethYearCode_List_Rows })],
                        }),
                    ],
                }),
            ],
        });

        const row6 = new TableRow({
            children: [
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [new TextRun({ text: "June" })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: June_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: sixthyear_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: sixthYearCode_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: twentyfirstyear_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: twentyfirstYearCode_List_Rows })],
                        }),
                    ],
                }),
            ],
        });

        const row7 = new TableRow({
            children: [
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [new TextRun({ text: "July" })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: July_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: seventhyear_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: seventhYearCode_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: twentysecondyear_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: twentysecondYearCode_List_Rows })],
                        }),
                    ],
                }),
            ],
        });

        const row8 = new TableRow({
            children: [
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [new TextRun({ text: "August" })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: August_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: eighthyear_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: eighthYearCode_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: twentythirdyear_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: twentythirdYearCode_List_Rows })],
                        }),
                    ],
                }),
            ],
        });
        const row9 = new TableRow({
            children: [
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [new TextRun({ text: "September" })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: September_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: ninthyear_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: ninthYearCode_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: twentyfourthyear_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: twentyfourthYearCode_List_Rows })],
                        }),
                    ],
                }),
            ],
        });

        const row10 = new TableRow({
            children: [
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [new TextRun({ text: "October" })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: October_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: tenthyear_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: tenthYearCode_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: twentyfifthyear_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: twentyfifthYearCode_List_Rows })],
                        }),
                    ],
                }),
            ],
        });

        const row11 = new TableRow({
            children: [
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [new TextRun({ text: "November" })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: November_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: eleventhyear_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: eleventhYearCode_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: twentysixthyear_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: twentysixthYearCode_List_Rows })],
                        }),
                    ],
                }),
            ],
        });

        const row12 = new TableRow({
            children: [
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [new TextRun({ text: "December" })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: December_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: twelfthyear_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: twelfthYearCode_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: twentyseventhyear_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: twentyseventhYearCode_List_Rows })],
                        }),
                    ],
                }),
            ],
        });

        const row13 = new TableRow({
            children: [
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [new TextRun({ text: "" })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: "" })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: thirteenthyear_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: thirteenthYearCode_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: twentyeighthyear_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: twentyeighthYearCode_List_rows })],
                        }),
                    ],
                }),
            ],
        });

        const row14 = new TableRow({
            children: [
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [new TextRun({ text: "" })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: "" })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: fourteenthyear_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: fourteenthYearCode_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: twentyninthyear_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: twentyninthYearCode_List_Rows })],
                        }),
                    ],
                }),
            ],
        });

        const row15 = new TableRow({
            children: [
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [new TextRun({ text: "" })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: "" })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: fifteenthyear_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: fifteenthYearCode_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: thirtiethyear_List_Rows })],
                        }),
                    ],
                }),
                new TableCell({
                    width: { size: 2500, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "TableRowContent",
                            children: [new TextRun({ text: thirtiethYearCode_List_Rows })],
                        }),
                    ],
                }),
            ],
        });


        yearItems.push(row1);
        yearItems.push(row2);
        yearItems.push(row3);
        yearItems.push(row4);
        yearItems.push(row5);
        yearItems.push(row6);
        yearItems.push(row7);
        yearItems.push(row8);
        yearItems.push(row9);
        yearItems.push(row10);
        yearItems.push(row11);
        yearItems.push(row12);
        yearItems.push(row13);
        yearItems.push(row14);
        yearItems.push(row15);



        return yearItems;
    }

    function generateYearProductionItemss() {
        let yearItems = [];
        const row1 = new TableRow({
            children: [
                new TableCell({
                    width: {
                        size: 5000,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [
                                new TextRun({
                                    text: WMI_Code_List_Rows
                                })
                            ]
                        })
                    ]
                }),
                new TableCell({
                    width: { size: 5000, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [new TextRun({ text: "WMI Code" })],
                        }),
                    ],
                }),
            ],
        });

        const row2 = new TableRow({
            children: [
                new TableCell({
                    width: {
                        size: 5000,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [
                                new TextRun({
                                    text: VDS_value_fourth_List_Rows
                                })
                            ]
                        })
                    ]
                }),
                new TableCell({
                    width: {
                        size: 5000,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [
                                new TextRun({
                                    text: VDS_fourth_type_List_Rows
                                })
                            ]
                        })
                    ]
                }),
            ],
        });

        const row3 = new TableRow({
            children: [
                new TableCell({
                    width: {
                        size: 5000,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [
                                new TextRun({
                                    text: VDS_value_fifth_List_Rows
                                })
                            ]
                        })
                    ]
                }),
                new TableCell({
                    width: {
                        size: 5000,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [
                                new TextRun({
                                    text: VDS_fifth_type_List_Rows
                                })
                            ]
                        })
                    ]
                }),
            ],
        });

        const row4 = new TableRow({
            children: [
                new TableCell({
                    width: {
                        size: 5000,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [
                                new TextRun({
                                    text: VDS_value_sixth_List_Rows
                                })
                            ]
                        })
                    ]
                }),
                new TableCell({
                    width: {
                        size: 5000,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [
                                new TextRun({
                                    text: VDS_sixth_type_List_Rows
                                })
                            ]
                        })
                    ]
                }),
            ],
        });
        const row5 = new TableRow({
            children: [
                new TableCell({
                    width: {
                        size: 5000,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [
                                new TextRun({
                                    text: VDS_value_seventh_List_Rows
                                })
                            ]
                        })
                    ]
                }),
                new TableCell({
                    width: {
                        size: 5000,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [
                                new TextRun({
                                    text: VDS_seventh_type_List_Rows
                                })
                            ]
                        })
                    ]
                }),
            ],
        });

        const row6 = new TableRow({
            children: [
                new TableCell({
                    width: {
                        size: 5000,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [
                                new TextRun({
                                    text: VDS_value_eighth_List_Rows
                                })
                            ]
                        })
                    ]
                }),
                new TableCell({
                    width: {
                        size: 5000,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [
                                new TextRun({
                                    text: VDS_eighth_type_List_Rows
                                })
                            ]
                        })
                    ]
                }),
            ],
        });

        const row7 = new TableRow({
            children: [
                new TableCell({
                    width: {
                        size: 5000,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [
                                new TextRun({
                                    text: VDS_value_ninth_List_Rows
                                })
                            ]
                        })
                    ]
                }),
                new TableCell({
                    width: {
                        size: 5000,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [
                                new TextRun({
                                    text: VDS_ninth_type_List_Rows
                                })
                            ]
                        })
                    ]
                }),
            ],
        });

        const row8 = new TableRow({
            children: [
                new TableCell({
                    width: {
                        size: 5000,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [
                                new TextRun({
                                    text: VDS_value_tenth_List_Rows
                                })
                            ]
                        })
                    ]
                }),

                new TableCell({
                    width: {
                        size: 5000,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [
                                new TextRun({
                                    text: VDS_tenth_type_List_Rows
                                })
                            ]
                        })
                    ]
                }),
            ],
        });
        const row9 = new TableRow({
            children: [
                new TableCell({
                    width: {
                        size: 5000,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [
                                new TextRun({
                                    text: VDS_value_eleventh_List_Rows
                                })
                            ]
                        })
                    ]
                }),

                new TableCell({
                    width: {
                        size: 5000,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [
                                new TextRun({
                                    text: VDS_eleventh_type_List_Rows
                                })
                            ]
                        })
                    ]
                }),
            ],
        });

        const row10 = new TableRow({
            children: [
                new TableCell({
                    width: {
                        size: 5000,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [
                                new TextRun({
                                    text: WMI_Extension_Code_List_Rows
                                })
                            ]
                        })
                    ]
                }),
                new TableCell({
                    width: { size: 5000, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [new TextRun({ text: "WMI Extension Code" })],
                        }),
                    ],
                }),
            ],
        });

        const row11 = new TableRow({
            children: [
                new TableCell({
                    width: {
                        size: 5000,
                        type: WidthType.DXA
                    },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [
                                new TextRun({
                                    text: Serial_Number_List_Rows
                                })
                            ]
                        })
                    ]
                }),
                new TableCell({
                    width: { size: 5000, type: WidthType.DXA },
                    children: [
                        new Paragraph({
                            style: "table1Header",
                            children: [new TextRun({ text: "Production Serial" })],
                        }),
                    ],
                }),
            ],
        });
        yearItems.push(row1);
        yearItems.push(row2);
        yearItems.push(row3);
        yearItems.push(row4);
        yearItems.push(row5);
        yearItems.push(row6);
        yearItems.push(row7);
        yearItems.push(row8);
        yearItems.push(row9);
        yearItems.push(row10);
        yearItems.push(row11);


        return yearItems;
    }


    // const docSealImage = new ImageRun({
    //     data: docSeal,
    //     transformation: {
    //         width: 90,
    //         height: 50,
    //     }
    // });



    const yearItems = generateYearProductionItems();
    const yearItemss = generateYearProductionItemss();
         const today = new Date();
const formattedDate = today.toLocaleDateString("en-GB");
    const form11Document = new Document({
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
                                                text: "Table 11 of AIS-007 (Revision 5)",
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
                                    text: "DETAILS OF LOCATION OF CHASSIS NUMBER AND CODE FOR MONTH AND YEAR OF MANUFACTURE AS PER RULE 122 OF CMVR",
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
                            rows: [
                                new TableRow({
                                    children: [
                                        new TableCell(
                                            {
                                                width: {
                                                    size: 7000,
                                                    type: WidthType.DXA
                                                },
                                                children: [
                                                    new Paragraph(
                                                        {
                                                            style: "table1Header",
                                                            children: [
                                                                new TextRun({
                                                                    text: "Name & Address of the Vehicle Manufacturer",
                                                                })
                                                            ]
                                                        }
                                                    )
                                                ]
                                            }
                                        ),
                                        new TableCell({
                                            // // columnSpan: 5,
                                            width: {
                                                size: 5000,
                                                type: WidthType.DXA
                                            },
                                            children: [
                                                new Paragraph({
                                                    style: "TableRowContent",
                                                    children: [
                                                        new TextRun({
                                                            text: updatedManufacturer_name_and_address_Rows
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                    ]
                                }),
                                new TableRow({
                                    children: [
                                        new TableCell(
                                            {
                                                width: {
                                                    size: 7000,
                                                    type: WidthType.DXA
                                                },
                                                children: [
                                                    new Paragraph(
                                                        {
                                                            style: "table1Header",
                                                            children: [
                                                                new TextRun({
                                                                    text: "Name of the basic model :",
                                                                })
                                                            ]
                                                        }
                                                    )
                                                ]
                                            }
                                        ),
                                        new TableCell({
                                            // // columnSpan: 5,
                                            width: {
                                                size: 5000,
                                                type: WidthType.DXA
                                            },
                                            children: [
                                                new Paragraph({
                                                    style: "TableRowContent",
                                                    children: [
                                                        new TextRun({
                                                            text: Basic_model_Rows
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                    ]
                                }),
                                new TableRow({
                                    children: [
                                        new TableCell(
                                            {
                                                width: {
                                                    size: 7000,
                                                    type: WidthType.DXA
                                                },
                                                children: [
                                                    new Paragraph(
                                                        {
                                                            style: "table1Header",
                                                            children: [
                                                                new TextRun({
                                                                    text: "Name of Variants, if any  :",
                                                                })
                                                            ]
                                                        }
                                                    )
                                                ]
                                            }
                                        ),
                                        new TableCell({
                                            // // columnSpan: 5,
                                            width: {
                                                size: 5000,
                                                type: WidthType.DXA
                                            },
                                            children: [
                                                new Paragraph({
                                                    style: "TableRowContent",
                                                    children: [
                                                        new TextRun({
                                                            text: variant_Rows
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                    ]
                                }),
                                new TableRow({
                                    children: [
                                        new TableCell(
                                            {
                                                width: {
                                                    size: 7000,
                                                    type: WidthType.DXA
                                                },
                                                children: [
                                                    new Paragraph(
                                                        {
                                                            style: "table1Header",
                                                            children: [
                                                                new TextRun({
                                                                    text: "Place of Embossing or etching the Chassis Number (Vehicle Identification Number). Supporting details by drawing or pictures may be provided if necessary.",
                                                                })
                                                            ]
                                                        }
                                                    )
                                                ]
                                            }
                                        ),
                                        new TableCell({
                                            // // columnSpan: 5,
                                            width: {
                                                size: 5000,
                                                type: WidthType.DXA
                                            },
                                            children: [
                                                new Paragraph({
                                                    style: "TableRowContent",
                                                    children: [
                                                        new TextRun({
                                                            text: drawing1_Rows
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                    ]
                                }),
                                new TableRow({
                                    children: [
                                        new TableCell(
                                            {
                                                width: {
                                                    size: 7000,
                                                    type: WidthType.DXA
                                                },
                                                children: [
                                                    new Paragraph(
                                                        {
                                                            style: "table1Header",
                                                            children: [
                                                                new TextRun({
                                                                    text: "Place of PIN Verification plate. Supporting details by drawing or pictures may be provided if necessary",
                                                                })
                                                            ]
                                                        }
                                                    )
                                                ]
                                            }
                                        ),
                                        new TableCell({
                                            // // columnSpan: 5,
                                            width: {
                                                size: 5000,
                                                type: WidthType.DXA
                                            },
                                            children: [
                                                new Paragraph({
                                                    style: "TableRowContent",
                                                    children: [
                                                        new TextRun({
                                                            text: drawing2_Rows
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                    ]
                                }),
                                new TableRow({
                                    children: [
                                        new TableCell(
                                            {
                                                width: {
                                                    size: 7000,
                                                    type: WidthType.DXA
                                                },
                                                children: [
                                                    new Paragraph(
                                                        {
                                                            style: "table1Header",
                                                            children: [
                                                                new TextRun({
                                                                    text: "Place of Local information (Importer Plate)- if machine imported. Supporting details by or pictures may be provided if necessary",
                                                                })
                                                            ]
                                                        }
                                                    )
                                                ]
                                            }
                                        ),
                                        new TableCell({
                                            width: {
                                                size: 2500,
                                                type: WidthType.DXA
                                            },
                                            children: [
                                                new Paragraph({
                                                    style: "TableRowContent",
                                                    children: [
                                                        new TextRun({
                                                            text: drawing3_Rows
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                    ]
                                })
                            ],
                            size: "12pt"
                        }
                    ),
                    new Paragraph(
                        {
                            style: "paragrapgBold",
                            children: [
                                new TextRun({
                                    break: 1,
                                    text: "Code for month and year of production:",
                                })
                            ]
                        }
                    ),
                    new Table(
                        {
                            columnWidths: [2500, 2500, 2500, 2500],
                            rows: yearItems,
                            size: "12pt"
                        }
                    ),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "",
                                break: 1
                            })
                        ]
                    }),
                    new Table({
                        columnWidths: [7000, 3000],
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        width: {
                                            size: 7000,
                                            type: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "table1Header",
                                                children: [
                                                    new TextRun({
                                                        text: "Position of the code for month of production in  the Chassis number :"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        // // columnSpan: 5,
                                        width: {
                                            size: 5000,
                                            type: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: firstMonth
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                ]
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        width: {
                                            size: 7000,
                                            type: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "table1Header",
                                                children: [
                                                    new TextRun({
                                                        text: "Position of the code for year of production in the Chassis number  :"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        // // columnSpan: 5,
                                        width: {
                                            size: 5000,
                                            type: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: firstYear
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                ]
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        width: {
                                            size: 7000,
                                            type: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "table1Header",
                                                children: [
                                                    new TextRun({
                                                        text: "Height of the Chassis number"
                                                    }),
                                                    new TextRun({
                                                        text: "(Vehicle Identification Number) :",
                                                        break: 1
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        // // columnSpan: 5,
                                        width: {
                                            size: 5000,
                                            type: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: Height_of_VIN_characters_Rows
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                ]
                            })
                        ]
                    }),
                    new Paragraph({
                        style: "table1Header",
                        children: [
                            new TextRun({
                                text: "Example of Engine/Motor No.: -"
                            })
                        ]
                    }),
                    new Paragraph({
                        style: "TableRowContent",
                        children: [
                            new TextRun({
                                text: Example_of_Engine_Motor_No_Rows
                            })
                        ]
                    }),
                    new Paragraph({
                        style: "table1Header",
                        children: [
                            new TextRun({
                                // text: "Example of Chassis No. (Vehicle Identification Number) with Month & Year of Manufacture: - "`${concatenatedResult}`
                                text: `Example of Chassis No. (Vehicle Identification Number) with Month & Year of Manufacture: - ${concatenatedResult}`,
                            })
                        ]
                    }),
                    new Paragraph({
                        style: "TableRowContent",
                        children: [
                            new TextRun({
                                text: " "
                            })
                        ]
                    }),
                    new Table(
                        {
                            columnWidths: [5000, 5000],
                            rows: yearItemss,
                            size: "12pt"
                        }
                    ),

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
    exportDoc(form11Document, "form11Document.docx");

}

export default generateForm11;