import exportDoc from './exportUtil';
import React from 'react';

import { Document, Header, Paragraph, TextRun, AlignmentType, Table, TableRow, TableCell, WidthType, Footer, ImageRun, PageNumber } from "docx";
import { ms } from 'date-fns/locale';
// Converts data into row format for table generation and Removed the Supplier Name from the document

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
  

//   function normalizeWithTwoUnits(value, unit1, unit2) {
//     const trimmedValue = String(value).trim();
//     if (!trimmedValue || trimmedValue.toLowerCase() === "na") return trimmedValue;
  
//     const separators = ["&", "-"];
//     const separator = separators.find(sep => trimmedValue.includes(sep));
  
//     if (!separator) {
//       return `${trimmedValue} ${unit1}`;
//     }
  
//     const parts = trimmedValue.split(separator).map(p => p.trim());
  
//     if (parts.length === 2) {
//       const part1 = parts[0].toLowerCase() === "na" ? "NA" : `${parts[0]} ${unit1}`;
//       const part2 = parts[1].toLowerCase() === "na" ? "NA" : `${parts[1]} ${unit2}`;
//       return `${part1} ${separator} ${part2}`;
//     }
  
//     return trimmedValue;
//   }
  
function normalizeWithTwoUnits(value, unit1, unit2) {
    const trimmedValue = String(value).trim();
    if (!trimmedValue || trimmedValue.toLowerCase() === "na") return trimmedValue;
  
    // ✅ New logic for colon-separated values
    if (trimmedValue.includes(":")) {
      const parts = trimmedValue.split(":").map(p => p.trim());
      if (parts.length === 2) {
        const part1 = parts[0].toLowerCase() === "na" ? "NA" : `${parts[0]} ${unit1}`;
        const part2 = parts[1].toLowerCase() === "na" ? "NA" : `${parts[1]} ${unit2}`;
        return `${part1} ${part2}`;
      }
    }
  
    const separators = ["&", "-"];
    const separator = separators.find(sep => trimmedValue.includes(sep));
  
    if (!separator) {
      return `${trimmedValue} ${unit1}`;
    }
  
    const parts = trimmedValue.split(separator).map(p => p.trim());
  
    if (parts.length === 2) {
      const part1 = parts[0].toLowerCase() === "na" ? "NA" : `${parts[0]} ${unit1}`;
      const part2 = parts[1].toLowerCase() === "na" ? "NA" : `${parts[1]} ${unit2}`;
      return `${part1} ${separator} ${part2}`;
    }
  
    return trimmedValue;
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
  const KW = 'kW';
  const KM = 'Km';
  const KM_H = 'Km/h';
  const AH = 'AH';
  const KWH = 'KWh';
  const HERTZ = 'Hz';
  const VOLTS_AMPS = 'Volts & Amps';
  const MINUTES_HOURS = 'Minutes/Hours';
  const AMPS = 'A';
  const MS = 'ms';
  const W_H_KM = 'W-h/Km';
  const DEGREES = 'Degrees';
  const DEGREE_CELCIUS='°C'
  const HOURS = 'Hours';
  const MINUTES = 'Minutes';


async function fetchAndProcessImage(footerData) {
    const dataOfFooterr = footerData.footerData.SealSign.properties;

    const fileName = dataOfFooterr.Upload_Seal.file_name;
  const imageUrl = `https://bv-reg.com/api/files/downloads/${fileName}`; 
  
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
  
    //   console.log("ImageRun instance created:", docSealImage);
  
      return docSealImage; // Return the docSealImage after it's ready
    } catch (error) {
      console.error("Error loading or converting image:", error);
      throw error; // If the image fails to load, throw an error
    }
  }
  async function generateForm13(form13Data, footerData) {
    const docSealImage = await fetchAndProcessImage(footerData);

    // console.log('form13Data:',form13Data);
   // General Description of Vehicle
const generalDescriptionFile = footerData.form13Data.General_description_of_vehicle.properties.upload_drawing_showing_Different_views_of_the_vehicle.file_name;

// Traction Battery Pack
const batteryVentilationFile = footerData.form13Data.Traction_Battery_Pack.properties.Brief_description_of_the_battery_pack_ventilation.file_name;

// Traction Motor
const motorPowerCurveFile = footerData.form13Data.Traction_Motor.properties.Motor_power_curve.file_name;

// Cooling System
const radiatorDrawingFile = footerData.form13Data.Cooling_System.properties.Radiator_drawing_or_make_and_type.file_name;

// Charger
const chargingProfileFile = footerData.form13Data.Charger.properties.Normal_Charging_Profile.file_name;

// Electrical Details of Vehicle
const schematicDrawingFile = footerData.form13Data.Electrical_details_of_vehicle.properties.Upload_Schematic_Drawing.file_name;
const schematicHighlightingFile = footerData.form13Data.Electrical_details_of_vehicle.properties.Schematic_highlighting.file_name;
const exposedConductivePartsFile = footerData.form13Data.Electrical_details_of_vehicle.properties.List_of_exposed_conductive.file_name;

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
  

let generalDescriptionModel=[];
let batteryVentilationModel=[];
let motorPowerCurveModel=[];
let radiatorDrawingModel=[];
let chargingProfileModel=[];
let schematicDrawingModel=[];
let schematicHighlightingModel=[];
let exposedConductivePartsModel=[];

// General Description Model
 generalDescriptionModel = [{ value: extractFileName(generalDescriptionFile) }];

// Battery Ventilation Model
 batteryVentilationModel = [{ value: extractFileName(batteryVentilationFile) }];

// Motor Power Model
 motorPowerCurveModel = [{ value: extractFileName(motorPowerCurveFile) }];

// Radiator Drawing Model
 radiatorDrawingModel = [{ value: extractFileName(radiatorDrawingFile) }];

// Charging Profile Model
 chargingProfileModel = [{ value: extractFileName(chargingProfileFile) }];

// Electrical Details Models
 schematicDrawingModel = [{ value: extractFileName(schematicDrawingFile) }];
 schematicHighlightingModel = [{ value: extractFileName(schematicHighlightingFile) }];
 exposedConductivePartsModel = [{ value: extractFileName(exposedConductivePartsFile) }];


// Generate Rows
const drawingUploadRows = generateTableData(generalDescriptionModel);
const briefDescRows = generateTableData(batteryVentilationModel);
const tractioncurveRows = generateTableData(motorPowerCurveModel);
const csRadiatorTypeRows = generateTableData(radiatorDrawingModel);
const crProfileDescRows = generateTableData(chargingProfileModel);
const crUploadSchematicRows = generateTableData(schematicDrawingModel);
const vesSchematicRows = generateTableData(schematicHighlightingModel);
const vesExpoCondPartsRows = generateTableData(exposedConductivePartsModel);

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

    const generalDescOfVehicleList = form13Data?.General_arrangement_of_the_vehicle?.generalArrangementOfTheVehicle;
    const tractionBatteryPackList = form13Data?.Traction_Battery_Pack?.TractionBatterypack;
    const batteryManagementSystemList = form13Data?.Battery_Mangement_System?.BatteryMangementSystem;
    const dcConverterList = form13Data?.DC_DC_Converter?.DCDCConverter;
    const driveTrainList = form13Data?.Drive_Train?.driveTrain;
    const chargerSpecificationsList = form13Data?.Charger_Specification?.ChargerSpecification;
    const electricalSafetyDeviceList = form13Data?.Electrical_Safety_Device?.ElectricalSafetyDevice;
    const vehicleElectricalSpecificationList = form13Data?.Vehicle_Electrical_Specification?.VehicleElectricalSpecification;
    const powerControllerList = form13Data?.Controller?.PowerController;
    const coolingSystemList = form13Data?.Cooling_System?.coolingSystem;
    const insulatingCategoryList = form13Data?.Insulating_Category?.InsulatingCategory;
    const InstrumentClusterList = form13Data?.Instrument_Cluster?.InstrumentCluster;
    const TractionMotorList = form13Data?.Drive_Train_System?.DriveTrainSystemData;
    const LubricationList = form13Data?.Lubrication?.LubricationData;
    const vehiclePerformanceList=form13Data?.Vehicle_Performance?.VehiclePerformance;
    const VehicleControlUnitList=form13Data?.Vehicle_Control_Unit?.VehicleControlUnit;
    let vehModelList = [];
    let vehTypeList = [];
    let drawingUploadList = [];
    generalDescOfVehicleList.map(vehDesc => {
        if (vehDesc.supplier.active === true) {
            const supplierName = vehDesc?.supplier?.nameOfSupplier;
            const vehModel = {
                supplier: supplierName,
                value: vehDesc?.General_description_of_vehicle?.properties?.Vehicle_Model?.value
            }
            vehModelList.push(vehModel);
            const vehType = {
                supplier: supplierName,
                value: vehDesc?.General_description_of_vehicle?.properties?.Vehicle_Type?.value
            }
            vehTypeList.push(vehType);
            const drawingUpload = {
                supplier: supplierName,
                value: vehDesc?.General_description_of_vehicle?.properties?.upload_drawing_showing_Different_views_of_the_vehicle?.value
            }
            drawingUploadList.push(drawingUpload);
        }
    });

    const vehModelRows = generateTableData(vehModelList);
    const vehTypeRows = generateTableData(vehTypeList);
    // const drawingUploadRows = generateTableData(drawingUploadList);

    let makeList = [];
    let ModelList=[];
    let kindOfElectroList = [];
    let nominalVolPackLevelList = [];
    let nominalVolCellLevelList = [];
    let noOfCellsList = [];
    let batteryEnergyList = [];
    let batteryCapacityList = [];
    let endOfDischargeList = [];
    let provOfVentList = [];
    let BatteryTypeApprovalList = [];
    let briefDescList = [];
    let batteryMassList = [];
    let briefDescOfMaintList = [];

    tractionBatteryPackList && tractionBatteryPackList.map(batteryPack => {
        if (batteryPack.supplier.active === true) {
            const supplierName = batteryPack?.supplier?.nameOfSupplier;
            makeList.push({
                supplier: supplierName,
                value: batteryPack?.Traction_Battery_Pack?.properties?.Make?.value
            });
            ModelList.push({
                supplier: supplierName,
                value: batteryPack?.Traction_Battery_Pack?.properties?.Model_Number?.value
            });
            kindOfElectroList.push({
                supplier: supplierName,
                value: batteryPack?.Traction_Battery_Pack?.properties?.Kind_of_Electro_Chemical_Chemistry?.value
            });
            nominalVolPackLevelList.push({
                supplier: supplierName,
                value: batteryPack?.Traction_Battery_Pack?.properties?.Nominal_Voltage_at_Pack_level?.value
            });
            nominalVolCellLevelList.push({
                supplier: supplierName,
                value: batteryPack?.Traction_Battery_Pack?.properties?.Nominal_Voltage_at_Cell_Level?.value
            });
            noOfCellsList.push({
                supplier: supplierName,
                value: batteryPack?.Traction_Battery_Pack?.properties?.Number_of_Cells_Modules_Configuration?.value
            });
            batteryEnergyList.push({
                supplier: supplierName,
                value: batteryPack?.Traction_Battery_Pack?.properties?.Battery_Energy?.value
            });
            batteryCapacityList.push({
                supplier: supplierName,
                value: batteryPack?.Traction_Battery_Pack?.properties?.Battery_Capacity?.value
            });
            endOfDischargeList.push({
                supplier: supplierName,
                value: batteryPack?.Traction_Battery_Pack?.properties?.End_of_Discharge_Voltage_Value_Pack_Level?.value
            });
            provOfVentList.push({
                supplier: supplierName,
                value: batteryPack?.Traction_Battery_Pack?.properties?.Provision_of_ventilation_for_battery?.value
            });
            BatteryTypeApprovalList.push({
                supplier: supplierName,
                value: batteryPack?.Traction_Battery_Pack?.properties?.Type_approval_Certififcate_number?.value
            });            
            briefDescList.push({
                supplier: supplierName,
                value: batteryPack?.Traction_Battery_Pack?.properties?.Brief_description_of_the_battery_pack_ventilation?.value
            });
            batteryMassList.push({
                supplier: supplierName,
                value: batteryPack?.Traction_Battery_Pack?.properties?.Battery_Mass?.value
            });
            briefDescOfMaintList.push({
                supplier: supplierName,
                value: batteryPack?.Traction_Battery_Pack?.properties?.Brief_description_of_maintenance_procedure?.value
            });
        }
    });

    const makeRows = generateTableData(makeList);
    const updatedmakeRows = normalizeMsPrefix(makeRows);
    const ModelRows = generateTableData(ModelList);
    const kindOfElectroRows = generateTableData(kindOfElectroList);
    const nominalVolPackLevelRows1 = generateTableData(nominalVolPackLevelList);
    let nominalVolPackLevelRows = normalizeWithUnit(nominalVolPackLevelRows1, V);
    const nominalVolCellLevelRows1 = generateTableData(nominalVolCellLevelList);
    let nominalVolCellLevelRows = normalizeWithUnit(nominalVolCellLevelRows1, V);
    const noOfCellsRows = generateTableData(noOfCellsList);
    const batteryEnergyRows1 = generateTableData(batteryEnergyList);
    let batteryEnergyRows = normalizeWithUnit(batteryEnergyRows1,KWH);
    const batteryCapacityRows1 = generateTableData(batteryCapacityList);
    let batteryCapacityRows = normalizeWithUnit(batteryCapacityRows1,AH);
    const endOfDischargeRows1 = generateTableData(endOfDischargeList);
    let endOfDischargeRows = normalizeWithUnit(endOfDischargeRows1, V);
    const provOfVentRows = generateTableData(provOfVentList);
    const BatteryTypeApprovalRows = generateTableData(BatteryTypeApprovalList);
    
    // const briefDescRows = generateTableData(briefDescList);
    const batteryMassRows1 = generateTableData(batteryMassList);
    let batteryMassRows = normalizeWithUnit(batteryMassRows1, KG);
    const briefDescOfMaintRows = generateTableData(briefDescOfMaintList);

    let bmsMakeList = [];
    let modelNumberList = [];
    let bmsSoftwareVersionList = [];
    let bmsHardwareVersionlist = [];
    // let bmsArchitectureList = [];
    let bmsBalancingTypeList = [];
    let bmsCommProtocolList = [];

    batteryManagementSystemList.map(batteryManagement => {
        const supplierName = batteryManagement?.supplier?.nameOfSupplier;
        if (batteryManagement.supplier.active === true) {
            bmsMakeList.push({
                supplier: supplierName,
                value: batteryManagement?.Battery_Mangement_System?.properties?.Make_of_BMS?.value
            });
            modelNumberList.push({
                supplier: supplierName,
                value: batteryManagement?.Battery_Mangement_System?.properties?.BMS_Model_Number_Part_Number?.value
            });
            bmsSoftwareVersionList.push({
                supplier: supplierName,
                value: batteryManagement?.Battery_Mangement_System?.properties?.BMS_Software_Version?.value
            });
            bmsHardwareVersionlist.push({
                supplier: supplierName,
                value: batteryManagement?.Battery_Mangement_System?.properties?.BMS_Hardware_Version?.value
            });
            // bmsArchitectureList.push({
            //     supplier: supplierName,
            //     value: batteryManagement?.Battery_Mangement_System?.properties?.BMS_Architecture_Circuit_Diagram?.value
            // });
            bmsBalancingTypeList.push({
                supplier: supplierName,
                value: batteryManagement?.Battery_Mangement_System?.properties?.Choose_BMS_Balancing_Type?.value
            });
            bmsCommProtocolList.push({
                supplier: supplierName,
                value: batteryManagement?.Battery_Mangement_System?.properties?.BMS_Comunicating_Protocol?.value
            });
        }
    });

    let bmsMakeRows = generateTableData(bmsMakeList);
    const updatedbmsMakeRows= normalizeMsPrefix(bmsMakeRows);
    let modelNumberRows = generateTableData(modelNumberList);
    let bmsSoftwareVersionRows = generateTableData(bmsSoftwareVersionList);
    let bmsHardwareVersionRows = generateTableData(bmsHardwareVersionlist);
    // let bmsArchitectureRows = generateTableData(bmsArchitectureList);
    let bmsBalancingTypeRows = generateTableData(bmsBalancingTypeList);
    let bmsCommProtocolRows = generateTableData(bmsCommProtocolList);

    let dcMakeList = [];
    let dcModelNumberList = [];
    let dcHardwareVersionList = [];
    let dcInputRangeList = [];
    let dcOutputRangeList = [];

    dcConverterList.map(dcConverter => {
        if (dcConverter.supplier.active === true) {
            const supplierName = dcConverter?.supplier?.nameOfSupplier;
            dcMakeList.push({
                supplier: supplierName,
                value: dcConverter?.DC_DC_Converter?.properties?.Make?.value
            });
            dcModelNumberList.push({
                supplier: supplierName,
                value: dcConverter?.DC_DC_Converter?.properties?.Model_Number?.value
            });
            dcHardwareVersionList.push({
                supplier: supplierName,
                value: dcConverter?.DC_DC_Converter?.properties?.Hardware_Version?.value
            });
            dcInputRangeList.push({
                supplier: supplierName,
                value: dcConverter?.DC_DC_Converter?.properties?.Input_Voltage_range?.value
            });
            dcOutputRangeList.push({
                supplier: supplierName,
                value: dcConverter?.DC_DC_Converter?.properties?.Output_Voltage_range?.value
            });
        }
    });

    let dcMakeRows = generateTableData(dcMakeList);
    const updateddcMakeRows = normalizeMsPrefix(dcMakeRows);
    let dcModelNumberRows = generateTableData(dcModelNumberList);
    let dcHardwareVersionRows = generateTableData(dcHardwareVersionList);
    let dcInputRangeRows = generateTableData(dcInputRangeList);
    // let dcInputRangeRows = normalizeWithTwoUnits(dcInputRangeRows1, AMPS,V);
    // let dcInputRangeRows = normalizeWithUnit(dcInputRangeRows1, V);
    let dcOutputRangeRows = generateTableData(dcOutputRangeList);
    //  let dcOutputRangeRows = normalizeWithTwoUnits(dcOutputRangeRows1, AMPS,V);
    // let dcOutputRangeRows = normalizeWithUnit(dcOutputRangeRows1, V);

    let dtMakeList = [];
    let dtTypeList = [];
    let dtSelectTypeList = [];

    driveTrainList && driveTrainList.map(driveTrain => {
        if (driveTrain.supplier.active === true) {
            const supplierName = driveTrain?.supplier?.nameOfSupplier;
            dtMakeList.push({
                supplier: supplierName,
                value: driveTrain?.Drive_Train?.properties?.make_of_the_drive_train?.value
            });
            dtTypeList.push({
                supplier: supplierName,
                value: driveTrain?.Drive_Train?.properties?.type_of_drive_train?.value
            });
            dtSelectTypeList.push({
                supplier: supplierName,
                value: driveTrain?.Drive_Train?.properties?.Select_the_type_of_motor_used_in_the_vehicle?.value
            });
        }
    });

    let dtMakeRows = generateTableData(dtMakeList);   
    let dtTypeRows = generateTableData(dtTypeList);
    let dtSelectTypeRows = generateTableData(dtSelectTypeList);

    let pcMakeList = [];
    let pcModelNumberList = [];
    let pcSoftwareVersionList = [];
    let pcHardwareVersionList = [];
    let pcTypeList = [];
    let pcControlPrincipleList = [];
    let pcMaxEffectCurrentList = [];
    let pcVoltageRangeUseList = [];

    powerControllerList && powerControllerList.map(controller => {
        if (controller.supplier.active === true) {
            const supplierName = controller?.supplier?.nameOfSupplier;
            pcMakeList.push({
                supplier: supplierName,
                value: controller?.Power_Controller?.properties?.Make?.value
            });
            pcModelNumberList.push({
                supplier: supplierName,
                value: controller?.Power_Controller?.properties?.Model?.value
            });
            pcSoftwareVersionList.push({
                supplier: supplierName,
                value: controller?.Power_Controller?.properties?.Version_of_Controller_Software?.value
            });
            pcHardwareVersionList.push({
                supplier: supplierName,
                value: controller?.Power_Controller?.properties?.Version_of_Controller_Hardware?.value
            });
            pcTypeList.push({
                supplier: supplierName,
                value: controller?.Power_Controller?.properties?.Specify_the_Type_of_Controller?.value
            });
            pcControlPrincipleList.push({
                supplier: supplierName,
                value: controller?.Power_Controller?.properties?.Select_the_Control_Principle?.value
            });
            pcMaxEffectCurrentList.push({
                supplier: supplierName,
                value: controller?.Power_Controller?.properties?.Maximum_effective_current?.value
            });
            pcVoltageRangeUseList.push({
                supplier: supplierName,
                value: controller?.Power_Controller?.properties?.Voltage_Utilization?.value
            });
        }
    });

    let pcMakeRows = generateTableData(pcMakeList);
    const updatedpcMakeRows= normalizeMsPrefix(pcMakeRows);
    let pcModelNumberRows = generateTableData(pcModelNumberList);
    let pcSoftwareVersionRows = generateTableData(pcSoftwareVersionList);
    let pcHardwareVersionRows = generateTableData(pcHardwareVersionList);
    let pcTypeRows = generateTableData(pcTypeList);
    let pcControlPrincipleRows = generateTableData(pcControlPrincipleList);
    let pcMaxEffectCurrentRows1 = generateTableData(pcMaxEffectCurrentList);
    let pcMaxEffectCurrentRows = normalizeWithUnit(pcMaxEffectCurrentRows1, AMPS);
    let pcVoltageRangeUseRows1 = generateTableData(pcVoltageRangeUseList);
    let pcVoltageRangeUseRows = normalizeWithUnit(pcVoltageRangeUseRows1, V);

    let csCoolingSystemList = [];
    let csLiquidCoolingList = [];
    let csNatureOfLiquidList = [];
    let csCharOfPumpList = [];
    let csThermostatList = [];
    let csRadiatorTypeList = [];
    let csReliefValveList = [];
    let csFanCharList = [];
    let csFanDuctList = [];
    let csBlowerCharList = [];
    let csStdAirDuctList = [];
    let csTempRegSysList = [];
    let csBriefDescList = [];
    let csAirFilterList = [];
    let csMaxTempRecommList = [];
    let csMotorOutletList = [];
    let csControllerinletList = [];
    let csBatteryInletList = [];
    let csAtMotorRefPointList = [];
    let csAtControllerRefPointList = [];
    let csAtBatteryRefPointList = [];

    coolingSystemList && coolingSystemList.map(coolingSystem => {
        if (coolingSystem.supplier.active === true) {
            const supplierName = coolingSystem.supplier.nameOfSupplier;
            csCoolingSystemList.push({
                supplier: supplierName,
                value: coolingSystem?.Cooling_System?.properties?.Select_the_Cooling_System_for_each_device?.value
            });
            csLiquidCoolingList.push({
                supplier: supplierName,
                value: coolingSystem?.Cooling_System?.properties?.Liquid_cooling_equipment_characteristics?.value
            });
            csNatureOfLiquidList.push({
                supplier: supplierName,
                value: coolingSystem?.Cooling_System?.properties?.Whether_Circulating_pump_is_provided?.value
            });
            csCharOfPumpList.push({
                supplier: supplierName,
                value: coolingSystem?.Cooling_System?.properties?.Characteristics_or_make_and_type_of_the_pump?.value
            });
            csThermostatList.push({
                supplier: supplierName,
                value: coolingSystem?.Cooling_System?.properties?.Thermostat_setting?.value
            });
            csRadiatorTypeList.push({
                supplier: supplierName,
                value: coolingSystem?.Cooling_System?.properties?.Radiator_drawing_or_make_and_type?.value
            });
            csReliefValveList.push({
                supplier: supplierName,
                value: coolingSystem?.Cooling_System?.properties?.Relief_valve_pressure_setting?.value
            });
            csFanCharList.push({
                supplier: supplierName,
                value: coolingSystem?.Cooling_System?.properties?.Fan_Characteristics_or_make_and_type?.value
            });
            csFanDuctList.push({
                supplier: supplierName,
                value: coolingSystem?.Cooling_System?.properties?.Fan_duct?.value
            });
            csBlowerCharList.push({
                supplier: supplierName,
                value: coolingSystem?.Cooling_System?.properties?.Blower_Characteristics_or_make_and_type?.value
            });
            csStdAirDuctList.push({
                supplier: supplierName,
                value: coolingSystem?.Cooling_System?.properties?.Standard_air_ducting?.value
            });
            csTempRegSysList.push({
                supplier: supplierName,
                value: coolingSystem?.Cooling_System?.properties?.Temperature_regulating_system?.value
            });
            csBriefDescList.push({
                supplier: supplierName,
                value: coolingSystem?.Cooling_System?.properties?.Brief_description?.value
            });
            csAirFilterList.push({
                supplier: supplierName,
                value: coolingSystem?.Cooling_System?.properties?.Air_filter_make_type?.value
            });
            csMotorOutletList.push({
                supplier: supplierName,
                value: coolingSystem?.Cooling_System?.properties?.Motor_Outlet?.value
            });
            csControllerinletList.push({
                supplier: supplierName,
                value: coolingSystem?.Cooling_System?.properties?.Controller_inlet?.value
            });
            csBatteryInletList.push({
                supplier: supplierName,
                value: coolingSystem?.Cooling_System?.properties?.Battery_inlet?.value
            });
            csAtMotorRefPointList.push({
                supplier: supplierName,
                value: coolingSystem?.Cooling_System?.properties?.At_motor_reference_point?.value
            });
            csAtControllerRefPointList.push({
                supplier: supplierName,
                value: coolingSystem?.Cooling_System?.properties?.At_controller_reference_point?.value
            });
            csAtBatteryRefPointList.push({
                supplier: supplierName,
                value: coolingSystem?.Cooling_System?.properties?.At_Battery_reference_point?.value
            });
        }
    });

    let csCoolingSystemRows = generateTableData(csCoolingSystemList);
    let csLiquidCoolingRows = generateTableData(csLiquidCoolingList);
    let csNatureOfLiquidRows = generateTableData(csNatureOfLiquidList);
    let csCharOfPumpRows = generateTableData(csCharOfPumpList);
    let csThermostatRows = generateTableData(csThermostatList);
    // let csRadiatorTypeRows = generateTableData(csRadiatorTypeList);
    let csReliefValveRows = generateTableData(csReliefValveList);
    let csFanCharRows = generateTableData(csFanCharList);
    let csFanDuctRows = generateTableData(csFanDuctList);
    let csBlowerCharRows = generateTableData(csBlowerCharList);
    let csStdAirDuctRows = generateTableData(csStdAirDuctList);
    let csTempRegSysRows = generateTableData(csTempRegSysList);
    let csBriefDescRows = generateTableData(csBriefDescList);
    let csAirFilterRows = generateTableData(csAirFilterList);
    let csMaxTempRecommRows = generateTableData(csMaxTempRecommList);
    let csMotorOutletRows1 = generateTableData(csMotorOutletList);
    let csMotorOutletRows = normalizeWithUnit(csMotorOutletRows1, DEGREE_CELCIUS);
    let csControllerinletRows1 = generateTableData(csControllerinletList);
    let csControllerinletRows = normalizeWithUnit(csControllerinletRows1, DEGREE_CELCIUS);
    let csBatteryInletRows1 = generateTableData(csBatteryInletList);
    let csBatteryInletRows = normalizeWithUnit(csBatteryInletRows1, DEGREE_CELCIUS);
    let csAtMotorRefPointRows1 = generateTableData(csAtMotorRefPointList);
    let csAtMotorRefPointRows = normalizeWithUnit(csAtMotorRefPointRows1, DEGREE_CELCIUS);
    let csAtControllerRefPointRows1 = generateTableData(csAtControllerRefPointList);
    let csAtControllerRefPointRows = normalizeWithUnit(csAtControllerRefPointRows1, DEGREE_CELCIUS);
    let csAtBatteryRefPointRows1 = generateTableData(csAtBatteryRefPointList);
    let csAtBatteryRefPointRows = normalizeWithUnit(csAtBatteryRefPointRows1, DEGREE_CELCIUS);

    let crChargerTypeList = [];
    let crChargerMakeList = [];
    let crChargerModelList = [];
    let crChargerSoftwareVersionList = [];
    let crChargerHardwareVersionList = [];
    let crTypeList = [];
    let crStdProtocolList = [];
    let crProfileDescList = [];

    let crSpecMainsSupplyList = [];
    let crSpecInputNominalVoltageList = [];
    let crSpecOutputVoltageRangeList = [];
    let crSpecResetPeriodList = [];
    let crSpecRecommDurationOfCompleteChargeList = [];

    let crOnBoardContRatingList = [];
    let ctOnBoardTimeRatingList = [];
    let crOnBoardWhetherSoftStartList = [];
    let crOnBoardMaxInitialList = [];
    let ChargerPowerratingsList = [];
    let ChargerConnectortypeList = [];
    let ChargerPoartableMakeList = [];
    let ChargerPoartableModelList = [];


    let crUploadSchematicList = [];

    chargerSpecificationsList && chargerSpecificationsList.map(chargerSpec => {
        if (chargerSpec.supplier.active === true) {
            const supplierName = chargerSpec?.supplier?.nameOfSupplier;

            crChargerTypeList.push({
                supplier: supplierName,
                value: chargerSpec?.Charger?.properties?.Select_Type_of_Charger_used?.value
            });
            crChargerMakeList.push({
                supplier: supplierName,
                value: chargerSpec?.Charger?.properties?.Make?.value
            });
            crChargerModelList.push({
                supplier: supplierName,
                value: chargerSpec?.Charger?.properties?.Model?.value
            });
            crChargerSoftwareVersionList.push({
                supplier: supplierName,
                value: chargerSpec?.Charger?.properties?.Version_of_the_software?.value
            });
            crChargerHardwareVersionList.push({
                supplier: supplierName,
                value: chargerSpec?.Charger?.properties?.Version_of_the_hardware?.value
            });
            crTypeList.push({
                supplier: supplierName,
                value: chargerSpec?.Charger?.properties?.Select_the_the_type_of_charger?.value
            });
            crStdProtocolList.push({
                supplier: supplierName,
                value: chargerSpec?.Charger?.properties?.Charger_Standard_Protocol?.value
            });
            crProfileDescList.push({
                supplier: supplierName,
                value: chargerSpec?.Charger?.properties?.Normal_Charging_Profile?.value
            });

            crSpecMainsSupplyList.push({
                supplier: supplierName,
                value: chargerSpec?.Specifications?.properties?.Select_the_No_Phases?.value
            });
            crSpecInputNominalVoltageList.push({
                supplier: supplierName,
                value: chargerSpec?.Specifications?.properties?.Input_Nominal_Voltage?.value
            });
            crSpecOutputVoltageRangeList.push({
                supplier: supplierName,
                value: chargerSpec?.Specifications?.properties?.Output_Voltage_Range?.value
            });
            crSpecResetPeriodList.push({
                supplier: supplierName,
                value: chargerSpec?.Specifications?.properties?.Reset_period_recommended?.value
            });
            crSpecRecommDurationOfCompleteChargeList.push({
                supplier: supplierName,
                value: chargerSpec?.Specifications?.properties?.Recommended_duration_of_a_complete_charge?.value
            });

            crOnBoardContRatingList.push({
                supplier: supplierName,
                value: chargerSpec?.on_board_charger?.properties?.Continuous_rating_of_charger_socket?.value
            });
            ctOnBoardTimeRatingList.push({
                supplier: supplierName,
                value: chargerSpec?.on_board_charger?.properties?.Time_rating_charger_socket_if_any?.value
            });
            crOnBoardWhetherSoftStartList.push({
                supplier: supplierName,
                value: chargerSpec?.on_board_charger?.properties?.Whether_soft_start_facility?.value
            });
            crOnBoardMaxInitialList.push({
                supplier: supplierName,
                value: chargerSpec?.on_board_charger?.properties?.Maximum_initial_in_rush_current?.value
            });

            ChargerPowerratingsList.push({
                supplier: supplierName,
                value: chargerSpec?.on_board_charger?.properties?.Charger_Power_ratings?.value
            });
            ChargerConnectortypeList.push({
                supplier: supplierName,
                value: chargerSpec?.on_board_charger?.properties?.Charger_Connector_type?.value
            });
            crUploadSchematicList.push({
                supplier: supplierName,
                value: chargerSpec?.Electrical_details_of_vehicle?.properties?.Upload_Schematic_Drawing?.value
            });
            ChargerPoartableMakeList.push({
                supplier: supplierName,
                value: chargerSpec?.Portable_Residual_Current_Device_PRCD?.properties?.Make?.value
            });
            ChargerPoartableModelList.push({
                supplier: supplierName,
                value: chargerSpec?.Portable_Residual_Current_Device_PRCD?.properties?.Model?.value
            });


            
        }
    });

    let crChargerTypeRows = generateTableData(crChargerTypeList);
    let crChargerMakeRows = generateTableData(crChargerMakeList);
    const updatedcrChargerMakeRows = normalizeMsPrefix(crChargerMakeRows);
    let crChargerModelRows = generateTableData(crChargerModelList);
    let crChargerSoftwareVersionRows = generateTableData(crChargerSoftwareVersionList);
    let crChargerHardwareVersionRows = generateTableData(crChargerHardwareVersionList);
    let crTypeRows = generateTableData(crTypeList);
    let crStdProtocolRows = generateTableData(crStdProtocolList);
    // let crProfileDescRows = generateTableData(crProfileDescList);

    let crSpecMainsSupplyRows = generateTableData(crSpecMainsSupplyList);
    let crSpecInputNominalVoltageRows = generateTableData(crSpecInputNominalVoltageList);
    // let crSpecInputNominalVoltageRows = normalizeWithTwoUnits(crSpecInputNominalVoltageRows1, V,HERTZ);

    let crSpecOutputVoltageRangeRows = generateTableData(crSpecOutputVoltageRangeList);
    // let crSpecOutputVoltageRangeRows = normalizeWithTwoUnits(crSpecOutputVoltageRangeRows1, V,AMPS);
    let crSpecResetPeriodRows1 = generateTableData(crSpecResetPeriodList);
    let crSpecResetPeriodRows = normalizeWithUnit(crSpecResetPeriodRows1, MINUTES_HOURS);
    let crSpecRecommDurationOfCompleteChargeRows1 = generateTableData(crSpecRecommDurationOfCompleteChargeList);
    // let crSpecRecommDurationOfCompleteChargeRows = normalizeWithUnit(crSpecRecommDurationOfCompleteChargeRows1, MINUTES_HOURS);
    let crSpecRecommDurationOfCompleteChargeRows = normalizeWithTwoUnits(crSpecRecommDurationOfCompleteChargeRows1, HOURS,MINUTES);

    let crOnBoardContRatingRows1 = generateTableData(crOnBoardContRatingList);
    let crOnBoardContRatingRows = normalizeWithUnit(crOnBoardContRatingRows1, AMPS);
    let ctOnBoardTimeRatingRows = generateTableData(ctOnBoardTimeRatingList);
    let crOnBoardWhetherSoftStartRows = generateTableData(crOnBoardWhetherSoftStartList);
    let crOnBoardMaxInitialRows = generateTableData(crOnBoardMaxInitialList);
    // let crOnBoardMaxInitialRows = normalizeWithUnit(crOnBoardMaxInitialRows1, AMPS);
    let ChargerPowerratingsRows = generateTableData(ChargerPowerratingsList);
    let ChargerConnectortypeRows = generateTableData(ChargerConnectortypeList);


    let ChargerPoartableMakeRows = generateTableData(ChargerPoartableMakeList);
    const updatedChargerPoartableMakeRows= normalizeMsPrefix(ChargerPoartableMakeRows);
    let ChargerPoartableModelRows = generateTableData(ChargerPoartableModelList);
    // let crUploadSchematicRows = generateTableData(crUploadSchematicList);

    let esdISIECSpecList = [];
    let esdRatingList = [];
    let esdOpeningTimeList = [];

    electricalSafetyDeviceList && electricalSafetyDeviceList.map(electricalSafetyDevice => {
        if (electricalSafetyDevice.supplier.active === true) {
            const supplierName = electricalSafetyDevice?.supplier?.nameOfSupplier;
            esdISIECSpecList.push({
                supplier: supplierName,
                value: electricalSafetyDevice?.Specifications_of_circuit_breakers_or_fuses_used_for_protection_of_batteries_or_power_train?.properties?.IS_IEC_specifications?.value
            });
            esdRatingList.push({
                supplier: supplierName,
                value: electricalSafetyDevice?.Specifications_of_circuit_breakers_or_fuses_used_for_protection_of_batteries_or_power_train?.properties?.Rating?.value
            });
            esdOpeningTimeList.push({
                supplier: supplierName,
                value: electricalSafetyDevice?.Specifications_of_circuit_breakers_or_fuses_used_for_protection_of_batteries_or_power_train?.properties?.Opening_time?.value
            });
        }
    });

    let esdISIECSpecRows = generateTableData(esdISIECSpecList);
    let esdRatingRows1 = generateTableData(esdRatingList);
    let esdRatingRows = normalizeWithUnit(esdRatingRows1, AMPS);
    let esdOpeningTimeRows1 = generateTableData(esdOpeningTimeList);
    let esdOpeningTimeRows = normalizeWithUnit(esdOpeningTimeRows1, MS);

    let vesWorkingVoltageList = [];
    let vesSchematicList = [];
    let vesIECProtectionClassList = [];
    let vesInsulMatList = [];
    let vesIsConduitsProvidedList = [];
    let vesExpoCondPartsList = [];
    let vesPotEquaResistList = [];
    let vesIfYesList = [];
    let vesFailuresList = [];
    let vesCondList = [];

    vehicleElectricalSpecificationList && vehicleElectricalSpecificationList.map(vehicleElectricalSpecification => {
        if (vehicleElectricalSpecification.supplier.active === true) {
            const supplierName = vehicleElectricalSpecification?.supplier?.nameOfSupplier;
            vesWorkingVoltageList.push({
                supplier: supplierName,
                value: vehicleElectricalSpecification?.Electrical_system?.properties?.Working_voltage_Operating_Voltage?.value
            });
            vesSchematicList.push({
                supplier: supplierName,
                value: vehicleElectricalSpecification?.Electrical_system.properties?.Schematic_highlighting_physical_location?.value
            });
            vesIECProtectionClassList.push({
                supplier: supplierName,
                value: vehicleElectricalSpecification.Electric_harness.properties.Select_IEC_Protection_Class_of_Electric_cables.value
            });
            vesInsulMatList.push({
                supplier: supplierName,
                value: vehicleElectricalSpecification?.Electric_harness?.properties?.Specify_the_Insulation_material_Used?.value
            });
            vesIsConduitsProvidedList.push({
                supplier: supplierName,
                value: vehicleElectricalSpecification?.Electric_harness?.properties?.Is_Conduits_provided?.value
            });
            vesExpoCondPartsList.push({
                supplier: supplierName,
                value: vehicleElectricalSpecification?.Electric_harness?.properties?.List_of_exposed_conductive?.value
            });
            vesPotEquaResistList.push({
                supplier: supplierName,
                value: vehicleElectricalSpecification?.Electric_harness?.properties?.Any_potential_equalization_resistance?.value
            });
            vesIfYesList.push({
                supplier: supplierName,
                value: vehicleElectricalSpecification?.Electric_harness?.properties?.If_yes_give_details?.value
            });
            vesFailuresList.push({
                supplier: supplierName,
                value: vehicleElectricalSpecification?.Electric_harness?.properties?.List_of_failures?.value
            });
            vesCondList.push({
                supplier: supplierName,
                value: vehicleElectricalSpecification?.Electric_harness?.properties?.List_of_conditions_under_which_the_performance?.value
            });
        }
    });

    let vesWorkingVoltageRows1 = generateTableData(vesWorkingVoltageList);
    let vesWorkingVoltageRows = normalizeWithUnit(vesWorkingVoltageRows1, V);
    // let vesSchematicRows = generateTableData(vesSchematicList);
    let vesIECProtectionClassRows = generateTableData(vesIECProtectionClassList);
    let vesInsulMatRows = generateTableData(vesInsulMatList);
    let vesIsConduitsProvidedRows = generateTableData(vesIsConduitsProvidedList);
    // let vesExpoCondPartsRows = generateTableData(vesExpoCondPartsList);
    let vesPotEquaResistRows = generateTableData(vesPotEquaResistList);
    let vesIfYesRows = generateTableData(vesIfYesList);
    let vesFailuresRows = generateTableData(vesFailuresList);
    let vesCondRows = generateTableData(vesCondList);

    let icIPCodeList = [];
    insulatingCategoryList && insulatingCategoryList.map(insulatingCategory => {
        if (insulatingCategory.supplier.active === true) {
            const supplierName = insulatingCategory?.supplier?.nameOfSupplier;
            icIPCodeList.push({
                supplier: supplierName,
                value: insulatingCategory?.Insulating_Category?.properties?.Ingress_Protection_Rating?.value
            });
        }
    });
    let icIPCodeRows = generateTableData(icIPCodeList);    

    let electricalConsumptionList = [];
    vehiclePerformanceList && vehiclePerformanceList.map(vehiclePerformance => {
        if (vehiclePerformance.supplier.active === true) {
            
            electricalConsumptionList.push({
               
                value: vehiclePerformance?.Performance?.properties?.Electrical_energy_consumption?.value
            });
        }
    });
    let electricalConsumptionRows1 = generateTableData(electricalConsumptionList);
    let electricalConsumptionRows = normalizeWithUnit(electricalConsumptionRows1, W_H_KM);

    let insMakeList = [];
    let insModelList = [];
    let insDisplayList = [];
    let insRecommendedList = [];
    let insIndicationFormatList = [];
    let insIndicationFormatBatteryList = [];
    let insIndicatorList = [];
    let insIndicationBatteryList = [];
    let insIndicationBatteryCompleteList = [];
    InstrumentClusterList.map(InstrumentCluster => {
        const supplierName = InstrumentCluster?.supplier?.nameOfSupplier;
        if (InstrumentCluster.supplier.active === true) {
            insMakeList.push({
                supplier: supplierName,
                value: InstrumentCluster?.Instrument_Cluster?.properties?.Make_of_the_Instrument_Cluster?.value
            });
            insModelList.push({
                supplier: supplierName,
                value: InstrumentCluster?.Instrument_Cluster?.properties?.Model_of_the_Instrument_Cluster?.value
            });
            insDisplayList.push({
                supplier: supplierName,
                value: InstrumentCluster?.Instrument_Cluster?.properties?.How_State_of_Charge_is_being_displayed?.value
            });
            insRecommendedList.push({
                supplier: supplierName,
                value: InstrumentCluster?.Instrument_Cluster?.properties?.State_charge_vehicle_is_Recommended_to_Charge?.value
            });
            insIndicationFormatList.push({
                supplier: supplierName,
                value: InstrumentCluster?.Instrument_Cluster?.properties?.State_of_Charge_indication_format?.value
            });
            insIndicationFormatBatteryList.push({
                supplier: supplierName,
                value: InstrumentCluster?.Instrument_Cluster?.properties?.State_of_Charge_indication_format_battry?.value
            });            
            insIndicatorList.push({
                supplier: supplierName,
                value: InstrumentCluster?.Instrument_Cluster?.properties?.Relationship_of_state_of_charge_indicator?.value
            });
            insIndicationBatteryList.push({
                supplier: supplierName,
                value: InstrumentCluster?.Instrument_Cluster?.properties?.Indication_of_state_of_charge_of_battery?.value
            });
            insIndicationBatteryCompleteList.push({
                supplier: supplierName,
                value: InstrumentCluster?.Instrument_Cluster?.properties?.Indication_when_Battery_completely_run_of_charge?.value
            });
        }
    });

    let insMakeRows = generateTableData(insMakeList);
    const updatedinsMakeRows = normalizeMsPrefix(insMakeRows);
    let insModelRows = generateTableData(insModelList);
    let insDisplayRows = generateTableData(insDisplayList);
    let insRecommendedRows = generateTableData(insRecommendedList);
    let insIndicationFormatRows = generateTableData(insIndicationFormatList);
    let insIndicationFormatBatteryRows = generateTableData(insIndicationFormatBatteryList);
    let insIndicatorRows = generateTableData(insIndicatorList);
    let insIndicationBatteryRows = generateTableData(insIndicationBatteryList);
    let insIndicationBatteryCompleteRows = generateTableData(insIndicationBatteryCompleteList);
    //
    let tractionVoltageList = [];
    let tractionSpeedList = [];
    let tractionMaxSpeedList = [];
    let tractionPowerSpeedList = [];
    let tractionMaxPowerList = [];
    let tractionThirtyMinPowerList = [];
    let tractionThirtyMinSpeedList = [];
    let tractionRangeList = [];
    let tractionBeginSpeedList = [];
    let tractionEndSpeedList = [];
    let tractionMakeList = [];
    let tractionModelList = [];
    let tractionTypeList = [];
    let tractionCurrentTypeList = [];
    let tractionExcitationList = [];
    let tractionSynchronList = [];
    let tractionRotorList = [];
    let tractionPolesList = [];
    let tractioncurveList = [];
    //
    TractionMotorList.map(TractionMotor => {
        const supplierName = TractionMotor?.supplier?.nameOfSupplier;
        if (TractionMotor.supplier.active === true) {
            tractionVoltageList.push({
                supplier: supplierName,
                value: TractionMotor?.Traction_Motor?.properties?.Test_Voltage_of_motor?.value
            });
            tractionSpeedList.push({
                supplier: supplierName,
                value: TractionMotor?.Traction_Motor?.properties?.Nominal_speed_of_motor?.value
            });
            tractionMaxSpeedList.push({
                supplier: supplierName,
                value: TractionMotor?.Traction_Motor?.properties?.Motor_Maximum_Speed?.value
            });
            tractionPowerSpeedList.push({
                supplier: supplierName,
                value: TractionMotor?.Traction_Motor?.properties?.Maximum_Power_Speed?.value
            });
            tractionMaxPowerList.push({
                supplier: supplierName,
                value: TractionMotor?.Traction_Motor?.properties?.Maximum_Power_kW?.value
            });
            tractionThirtyMinPowerList.push({
                supplier: supplierName,
                value: TractionMotor?.Traction_Motor?.properties?.Maximum_Thirty_Minutes_Power?.value
            });
            tractionThirtyMinSpeedList.push({
                supplier: supplierName,
                value: TractionMotor?.Traction_Motor?.properties?.Maximum_Thirty_Minutes_speed?.value
            });
            tractionRangeList.push({
                supplier: supplierName,
                value: TractionMotor?.Traction_Motor?.properties?.Range_as_per_AIS?.value
            });
            tractionBeginSpeedList.push({
                supplier: supplierName,
                value: TractionMotor?.Traction_Motor?.properties?.Speed_at_the_beginning?.value
            });
            tractionEndSpeedList.push({
                supplier: supplierName,
                value: TractionMotor?.Traction_Motor?.properties?.Speed_at_the_end?.value
            });
            tractionMakeList.push({
                supplier: supplierName,
                value: TractionMotor?.Traction_Motor?.properties?.Make_of_Traction_motor?.value
            });
            tractionModelList.push({
                supplier: supplierName,
                value: TractionMotor?.Traction_Motor?.properties?.Model_Number?.value
            });
            tractionTypeList.push({
                supplier: supplierName,
                value: TractionMotor?.Traction_Motor?.properties?.Type_BLDC?.value
            });
            tractionCurrentTypeList.push({
                supplier: supplierName,
                value: TractionMotor?.Traction_Motor?.properties?.Select_the_Current_Type?.value
            });
            tractionExcitationList.push({
                supplier: supplierName,
                value: TractionMotor?.Traction_Motor?.properties?.Separate_excitation?.value
            });
            tractionSynchronList.push({
                supplier: supplierName,
                value: TractionMotor?.Traction_Motor?.properties?.Synchron_asynchron?.value
            });
            tractionRotorList.push({
                supplier: supplierName,
                value: TractionMotor?.Traction_Motor?.properties?.Coiled_rotor?.value
            });
            tractionPolesList.push({
                supplier: supplierName,
                value: TractionMotor?.Traction_Motor?.properties?.Number_of_Poles?.value
            });
            tractioncurveList.push({
                supplier: supplierName,
                value: TractionMotor?.Traction_Motor?.properties?.Motor_power_curve?.value
            });
            
        }
    });

    let tractionVoltageRows1 = generateTableData(tractionVoltageList);
    let tractionVoltageRows = normalizeWithUnit(tractionVoltageRows1, V);
    let tractionSpeedRows1 = generateTableData(tractionSpeedList);
    let tractionSpeedRows = normalizeWithUnit(tractionSpeedRows1, RPM);
    let tractionMaxSpeedRows1 = generateTableData(tractionMaxSpeedList);
    let tractionMaxSpeedRows = normalizeWithUnit(tractionMaxSpeedRows1, RPM);
    let tractionPowerSpeedRows1 = generateTableData(tractionPowerSpeedList);
    let tractionPowerSpeedRows = normalizeWithTwoUnits(tractionPowerSpeedRows1, RPM,KM_H);

    let tractionMaxPowerRows1 = generateTableData(tractionMaxPowerList);
    let tractionMaxPowerRows = normalizeWithUnit(tractionMaxPowerRows1, KW);
    let tractionThirtyMinPowerRows1 = generateTableData(tractionThirtyMinPowerList);
    let tractionThirtyMinPowerRows = normalizeWithUnit(tractionThirtyMinPowerRows1, KW);
    let tractionThirtyMinSpeedRows1 = generateTableData(tractionThirtyMinSpeedList);
    let tractionThirtyMinSpeedRows = normalizeWithUnit(tractionThirtyMinSpeedRows1, KM_H);
    let tractionRangeRows1 = generateTableData(tractionRangeList);
    let tractionRangeRows = normalizeWithUnit(tractionRangeRows1, KM);
    let tractionBeginSpeedRows1 = generateTableData(tractionBeginSpeedList);
    let tractionBeginSpeedRows = normalizeWithUnit(tractionBeginSpeedRows1, KM_H);
    let tractionEndSpeedRows1 = generateTableData(tractionEndSpeedList);
    let tractionEndSpeedRows = normalizeWithUnit(tractionEndSpeedRows1, KM_H);
    let tractionMakeRows = generateTableData(tractionMakeList);
    const updatedtractionMakeRows = normalizeMsPrefix(tractionMakeRows);
    let tractionModelRows = generateTableData(tractionModelList);
    let tractionTypeRows = generateTableData(tractionTypeList);
    let tractionCurrentTypeRows = generateTableData(tractionCurrentTypeList);
    let tractionExcitationRows = generateTableData(tractionExcitationList);
    let tractionSynchronRows = generateTableData(tractionSynchronList);
    let tractionRotorRows = generateTableData(tractionRotorList);
    let tractionPolesRows = generateTableData(tractionPolesList);
    // let tractioncurveRows = generateTableData(tractioncurveList);//
    ///
    let luTypeList = [];


    LubricationList && LubricationList.map(Lubrication => {
        if (Lubrication.supplier.active === true) {
            const supplierName = Lubrication?.supplier?.nameOfSupplier;
            luTypeList.push({
                supplier: supplierName,
                value: Lubrication?.Lubrication?.properties?.Select_type_of_lubrication_method?.value
            });

        }
    });

    let luTypeRows = generateTableData(luTypeList);


    let vehMakeList = [];
    let vehModeList = [];
    let vehSoftwareList = [];
    let vehHardwareList = [];


    VehicleControlUnitList && VehicleControlUnitList.map(VehicleControlUnit => {
        if (VehicleControlUnit.supplier.active === true) {
            const supplierName = VehicleControlUnit?.supplier?.nameOfSupplier;
            vehMakeList.push({
                supplier: supplierName,
                value: VehicleControlUnit?.Vehicle_Control?.properties?.Make?.value
            });
            vehModeList.push({
                supplier: supplierName,
                value: VehicleControlUnit?.Vehicle_Control?.properties?.Model_Number?.value
            });
            vehSoftwareList.push({
                supplier: supplierName,
                value: VehicleControlUnit?.Vehicle_Control?.properties?.Software_Version?.value
            });
            vehHardwareList.push({
                supplier: supplierName,
                value: VehicleControlUnit?.Vehicle_Control?.properties?.Hardware_Version?.value
            });

        }
    });

    let vehMakeRows = generateTableData(vehMakeList);
    const updatedvehMakeRows= normalizeMsPrefix(vehMakeRows);
    let vehModeRows = generateTableData(vehModeList);
    let vehSoftwareRows = generateTableData(vehSoftwareList);
    let vehHardwareRows = generateTableData(vehHardwareList);
    


    let dTrainMakeList = [];
    let dTrainTypeList = [];
    let dTrainSelectTypeList = [];
    let dTrainTransmissionList = [];
    TractionMotorList && TractionMotorList.map(vehDesc => {
        if (vehDesc.supplier.active === true) {
            const supplierName = vehDesc?.supplier?.nameOfSupplier;
            const dTrainMake = {
                supplier: supplierName,
                value: vehDesc?.Drive_Train?.properties?.make_of_the_drive_train?.value
            }
            dTrainMakeList.push(dTrainMake);
            const dTrainType = {
                supplier: supplierName,
                value: vehDesc?.Drive_Train?.properties?.type_of_drive_train?.value
            }
            dTrainTypeList.push(dTrainType);
            const dTrainSelectType = {
                supplier: supplierName,
                value: vehDesc?.Drive_Train?.properties?.Select_the_type_of_motor_used_in_the_vehicle?.value
            }
            dTrainSelectTypeList.push(dTrainSelectType);
            const dTrainTransmission = {
                supplier: supplierName,
                value: vehDesc?.Drive_Train?.properties?.Select_the_Transmission_arrangement?.value
            }
            dTrainTransmissionList.push(dTrainTransmission);
        }
    });
    const dTrainMakeRows = generateTableData(dTrainMakeList);
    const updateddTrainMakeRows= normalizeMsPrefix(dTrainMakeRows);
    const dTrainTypeRows = generateTableData(dTrainTypeList);
    const dTrainSelectTypeRows = generateTableData(dTrainSelectTypeList);
    const dTrainTransmissionRows = generateTableData(dTrainTransmissionList);
    // const docSealImage = new ImageRun({
    //     data: docSeal,
    //     transformation: {
    //         width: 90,
    //         height: 50,
    //     }
    // });
         const today = new Date();
const formattedDate = today.toLocaleDateString("en-GB");
    const form13Document = new Document({
        styles: {
            paragraphStyles: [
                {
                    id: "TableBoldTitle",
                    name: "TableBoldTitle",
                    basedOn: "Normal",
                    run: {
                        bold: true,
                        size: "12pt"
                    },
                    paragraph: {
                        indent: {
                            left: 100
                        }
                    }
                },
                {
                    id: "TableRowContent",
                    name: "TableRowContent",
                    basedOn: "Normal",
                    run: {
                        size: "12pt"
                    },
                    paragraph: {
                        spacing: {
                            line: 276,
                            after: 120,
                            before: 120
                        },
                        indent: {
                            left: 100
                        }
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
                                                text: "Table 13 of AIS-007 (Revision 5)",
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
                    new Table({
                        // columnWidths: [5000, 5000],
                        width: {
                            size: 10000,
                            WidthType: WidthType.DXA
                        },
                        rows: [
                            new TableRow({
                                children: [
                                 
                                    new TableCell({
                                        columnSpan: 3,
                                        width: {
                                            size: 10000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableBoldTitle",
                                                children: [
                                                    new TextRun({
                                                        text: "Technical Specifications - Battery Operated Vehicles"
                                                    })
                                                ],
                                                alignment: AlignmentType.CENTER
                                            })
                                        ]
                                    })
                                ]
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableBoldTitle",
                                                children: [
                                                    new TextRun({
                                                        text: "Clause  No."
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        columnSpan: 2,
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableBoldTitle",
                                                children: [
                                                    new TextRun({
                                                        text: "Description"
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "1.0"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        columnSpan: 2,
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableBoldTitle",
                                                children: [
                                                    new TextRun({
                                                        text: "General description of vehicle"
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "1.1"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),                                   
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Vehicle Model"
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
                                                        text: vehModelRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "1.2"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Vehicle Type"
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
                                                        text: vehTypeRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "1.3"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Drawing and /or Photographs of the vehicle"
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
                                                        text: drawingUploadRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableBoldTitle",
                                                children: [
                                                    new TextRun({
                                                        text: "2.0"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        columnSpan: 2,
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableBoldTitle",
                                                children: [
                                                    new TextRun({
                                                        text: "Description of The Traction Battery Pack"
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "2.1"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Make and Trade name (If any)  and manufacturer’s address"
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
                                                        text: updatedmakeRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "2.1.1"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Model No/ Part No of Battery Pack"
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
                                                        text: ModelRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "2.2"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Kind of Electro – Chemical Chemistry"
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
                                                        text: kindOfElectroRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "2.3"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Nominal Voltage (V) at Pack level"
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
                                                        text: nominalVolPackLevelRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "2.3.1"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Nominal Voltage (V) at Cell Level"
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
                                                        text: nominalVolCellLevelRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "2.4"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Number of Cells/Modules and its Configuration"
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
                                                        text: noOfCellsRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "2.5"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Battery Energy (KWh)"
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
                                                        text: batteryEnergyRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "2.6"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Battery capacity (C3 for Pure Electric Vehicle)"
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
                                                        text: batteryCapacityRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "2.7"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "End of Discharge Voltage Value (V) at Pack Level"
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
                                                        text: endOfDischargeRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "2.8"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Provision of ventilation for battery Yes / No"
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
                                                        text: provOfVentRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "2.8.1"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Brief description of the battery pack ventilation system adopted in the vehicle. Provide drawing if necessary."
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
                                                        text: briefDescRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "2.9"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Traction Battery Approval as per AIS 038 (Rev.2) and AIS-156"
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
                                                        text: ""
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "2.9.1"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "TAC No"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: BatteryTypeApprovalRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "2.10"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "On-board Indication of battery state of charge (SOC)"
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
                                                        text: insDisplayRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "2.10.1"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Details of indication when state of charge (SOC) of the battery reaches a level when the manufacturer recommends re-charging."
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
                                                        text: insRecommendedRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "2.10.1.1"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Indication format."
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
                                                        text: insIndicationFormatRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "2.10.1.2"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Relationship of state of charge indicator and the indication."
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
                                                        text: insIndicatorRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "2.10.1.3"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Make"
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
                                                        text: updatedinsMakeRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "2.10.1.4"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Model"
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
                                                        text: insModelRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "2.10.1.5"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Make of Instrument Cluster"
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
                                                        text: updatedinsMakeRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "2.10.1.6"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Model of Instrument Cluster"
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
                                                        text: insModelRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "2.10.2"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Indication of state of charge of battery reaches a level at which driving vehicle further may cause damage to batteries"
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
                                                        text: insIndicationBatteryRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "2.10.2.1"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Indication format."
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
                                                        text: insIndicationFormatBatteryRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "2.10.2.2"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Relationship of state of charge indicator and the indication."
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
                                                        text: insIndicationBatteryCompleteRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "2.11"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Battery Mass (kg)"
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
                                                        text: batteryMassRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "2.12"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Brief description of maintenance procedure of battery pack, if any"
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
                                                        text: briefDescOfMaintRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableBoldTitle",
                                                children: [
                                                    new TextRun({
                                                        text: "3.0"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        columnSpan: 2,
                                        width: {
                                            size: 10000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableBoldTitle",
                                                children: [
                                                    new TextRun({
                                                        text: "Battery Management System (BMS)"
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "3.1"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Make and manufacturer’s address"
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
                                                        text: updatedbmsMakeRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "3.2"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Model Number / Part Number"
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
                                                        text: modelNumberRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "3.3"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Software Version"
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
                                                        text: bmsSoftwareVersionRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "3.4"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Hardware Version"
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
                                                        text: bmsHardwareVersionRows
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                ]
                            }),
                            // new TableRow({
                            //     children: [
                            //         new TableCell({
                            //             width: {
                            //                 size: 5000,
                            //                 WidthType: WidthType.DXA
                            //             },
                            //             children: [
                            //                 new Paragraph({
                            //                     style: "TableRowContent",
                            //                     children: [
                            //                         new TextRun({
                            //                             text: "3.5"
                            //                         })
                            //                     ]
                            //                 })
                            //             ]
                            //         }),
                            //         new TableCell({
                            //             width: {
                            //                 size: 5000,
                            //                 WidthType: WidthType.DXA
                            //             },
                            //             children: [
                            //                 new Paragraph({
                            //                     style: "TableRowContent",
                            //                     children: [
                            //                         new TextRun({
                            //                             text: "Architecture (attach circuit board diagram and Cell configuration structure )"
                            //                         })
                            //                     ]
                            //                 })
                            //             ]
                            //         }),
                            //         new TableCell({
                            //             // // columnSpan: 5,
                            //             width: {
                            //                 size: 5000,
                            //                 type: WidthType.DXA
                            //             },
                            //             children: [
                            //                 new Paragraph({
                            //                     style: "TableRowContent",
                            //                     children: [
                            //                         new TextRun({
                            //                             text: bmsArchitectureRows
                            //                         })
                            //                     ]
                            //                 })
                            //             ]
                            //         }),
                            //     ]
                            // }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "3.5"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Balancing Type (Active/Passive)"
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
                                                        text: bmsBalancingTypeRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "3.6"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Communication Protocol"
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
                                                        text: bmsCommProtocolRows
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                ]
                            }),
                            /////////////////2222222222
                            new TableRow({
                                children: [
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableBoldTitle",
                                                children: [
                                                    new TextRun({
                                                        text: "4.0"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        columnSpan: 2,
                                        width: {
                                            size: 10000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableBoldTitle",
                                                children: [
                                                    new TextRun({
                                                        text: "DC – DC Converter"
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "4.1"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Make and manufacturer’s address"
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
                                                        text: updateddcMakeRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "4.2"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Model Number / Part Number"
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
                                                        text: dcModelNumberRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "4.3"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Hardware Version"
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
                                                        text: dcHardwareVersionRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "4.4"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Input Range (Current in A and Voltage in V) "
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
                                                        text: dcInputRangeRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "4.5"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Output Range (Current in A and Voltage in V)"
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
                                                        text: dcOutputRangeRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableBoldTitle",
                                                children: [
                                                    new TextRun({
                                                        text: "5.0"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        columnSpan: 2,
                                        width: {
                                            size: 10000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableBoldTitle",
                                                children: [
                                                    new TextRun({
                                                        text: "Description of The Drive Train"
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.1"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "General"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
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
                            /////////////111111111
                            new TableRow({
                                children: [
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.1.1"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Make and manufacturer’s address"
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
                                                        text: updateddTrainMakeRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.1.2"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Type"
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
                                                        text: dTrainTypeRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.1.3"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Use : Mono motor / multi motors (number)"
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
                                                        text: dTrainSelectTypeRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.1.4"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Transmission Arrangement parallel / Transaxial / others to precise"
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
                                                        text: dTrainTransmissionRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.1.5"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Test Voltage (V)"
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
                                                        text: tractionVoltageRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.1.6"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Motor Nominal Speed (min -1)"
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
                                                        text: tractionSpeedRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.1.7"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Motor Maximum Speed, Min –1 or by default  reducer outlet shaft / gear box speed (specify gear engaged)"
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
                                                        text: tractionMaxSpeedRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.1.8"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Maximum Power Speed  (min –1) and (km/h)	"
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
                                                        text: tractionPowerSpeedRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.1.9"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Maximum Power (kW)"
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
                                                        text: tractionMaxPowerRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.1.10"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Maximum Thirty Minutes Power (kW)"
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
                                                        text: tractionThirtyMinPowerRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.1.11"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Maximum Thirty Minutes speed km/h (Reference in AIS-039 (Rev.1) and AIS-040 (Rev.2)"
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
                                                        text: tractionThirtyMinSpeedRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.1.12"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Range as per AIS 040 (Rev.1) (km)"
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
                                                        text: tractionRangeRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.1.13"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Flexible range (where P > 90 percent of max. power)"
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
                                                        text: " "
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.1.13.1"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Speed at the beginning of the range (min –1)"
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
                                                        text: tractionBeginSpeedRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.1.13.2"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Speed at the end of the range (min –1 )"
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
                                                        text: tractionEndSpeedRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.1.14"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Speed at the end of the range (min –1 )"
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
                                                        text: tractionEndSpeedRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.2"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Traction Motor"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.2.1"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Make and manufacturer’s address"
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
                                                        text: updatedtractionMakeRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.2.2"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Model Number / Part number"
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
                                                        text: tractionModelRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.2.3"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Type (BLDC, DC, AC etc)"
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
                                                        text: tractionTypeRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.2.4"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Working Principle"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.2.4.1"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Direct current / alternating current / number of  phases"
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
                                                        text: tractionCurrentTypeRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.2.4.2"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Separate excitation / series / compound"
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
                                                        text: tractionExcitationRows  
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                ]
                            }),

                            //////////////333333
                            new TableRow({
                                children: [
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.2.4.3"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Synchron / asynchron"
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
                                                        text: tractionSynchronRows  
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.2.4.4"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Coiled rotor / with permanent magnets / with housing"
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
                                                        text: tractionRotorRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.2.4.5"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Number of Poles of the Motor"
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
                                                        text: tractionPolesRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.2.5"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Motor power curve (kW) with motor RPM (min-1) / vehicle speed in (km/h), (Provide Graph)"
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
                                                        text: tractioncurveRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.3"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Power Controller"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.3.1"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Make and manufacturer’s address"
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
                                                        text: updatedpcMakeRows
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                ]
                            }),
                            //////////111
                            new TableRow({
                                children: [
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.3.2"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Model Number / Part number"
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
                                                        text: pcModelNumberRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.3.3"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Software Version"
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
                                                        text: pcSoftwareVersionRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.3.4"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Hardware Version"
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
                                                        text: pcHardwareVersionRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.3.5"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Type"
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
                                                        text: pcTypeRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.3.6"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Control Principle : vectorial / open loop / closed / other (to be specified )"
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
                                                        text: pcControlPrincipleRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.3.7"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Maximum effective current supplied to the Motor (A)"
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
                                                        text: pcMaxEffectCurrentRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.3.8"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Voltage range use (V to V)"
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
                                                        text: pcVoltageRangeUseRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.4"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Vehicle Control Unit"
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
                                                        text: " "
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.4.1"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Make"
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
                                                        text:updatedvehMakeRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.4.2"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Model Number / Part number"
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
                                                        text: vehModeRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.4.3"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Software Version / Calibration ID"
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
                                                        text: vehSoftwareRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.4.4"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Hardware Version"
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
                                                        text: vehHardwareRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.5"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Cooling System"
                                                    }),
                                                    new TextRun({
                                                        text: "motor        : liquid / air",
                                                        break: 1
                                                    }),
                                                    new TextRun({
                                                        text: "controller  : liquid / air",
                                                        break: 1
                                                    }),
                                                    new TextRun({
                                                        text: "Battery      : liquid / air",
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
                                                        text: csCoolingSystemRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.5.1"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Liquid cooling equipment characteristics"
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
                                                        text: csLiquidCoolingRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.5.1.1"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Nature of the liquid , \ncirculating pumps, yes / no"
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
                                                        text: csNatureOfLiquidRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.5.1.2"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Characteristics or make(s) and type(s) of the pump"
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
                                                        text: csCharOfPumpRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.5.1.3"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Thermostat : setting"
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
                                                        text: csThermostatRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.5.1.4"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Radiator : drawing(s) or make(s) and type(s)"
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
                                                        text: csRadiatorTypeRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.5.1.5"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Relief valve : pressure setting"
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
                                                        text: csReliefValveRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.5.1.6"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Fan : Characteristics or  make(s) and type(s)"
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
                                                        text: csFanCharRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.5.1.7"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Fan : duct"
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
                                                        text: csFanDuctRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.5.2"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Air-cooling equipment characteristics"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.5.2.1"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Blower  : Characteristics or make(s) and type(s)"
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
                                                        text: csBlowerCharRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.5.2.2"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Standard air ducting"
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
                                                        text: csStdAirDuctRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.5.2.3"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Temperature regulating system  yes / no"
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
                                                        text: csTempRegSysRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.5.2.4"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Brief description"
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
                                                        text: csBriefDescRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.5.2.5"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Air filter  : make(s) \n\t\ttype(s)"
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
                                                        text: csAirFilterRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.5.3"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Maximum temperatures recommended by the   manufacturer:"
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
                                                        text: csMaxTempRecommRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.5.3.1"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Motor Outlet      :   oC"
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
                                                        text: csMotorOutletRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.5.3.2"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Controller inlet   :    oC"
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
                                                        text: csControllerinletRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.5.3.3"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Battery inlet       :    oC"
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
                                                        text: csBatteryInletRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.5.3.4"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "At motor reference point(s)                 oC"
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
                                                        text: csAtMotorRefPointRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.5.3.5"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "At controller reference point(s)            oC"
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
                                                        text: csAtControllerRefPointRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.5.3.6"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "At Battery reference point(s)               oC"
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
                                                        text: csAtBatteryRefPointRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.6"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Insulating Category 	  :"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.6.1"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Ingress Protection (IP)-Code	   :"
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
                                                        text: icIPCodeRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "5.7"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Lubrication System Principle\nBearings    :               friction  / ball\nLubricant   :              grease / oil\nSeal           :               yes / no\nCirculation :              with / without"
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
                                                        text: luTypeRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableBoldTitle",
                                                children: [
                                                    new TextRun({
                                                        text: "6.0"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        columnSpan: 2,
                                        width: {
                                            size: 10000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableBoldTitle",
                                                children: [
                                                    new TextRun({
                                                        text: "Charger :"
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "6.1"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Charger: On board / Portable"
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
                                                        text: crChargerTypeRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "6.1.1"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Make and manufacturer’s address"
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
                                                        text: updatedcrChargerMakeRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "6.1.2"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Model"
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
                                                        text: crChargerModelRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "6.1.3"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Software Version"
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
                                                        text: crChargerSoftwareVersionRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "6.1.4"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Hardware Version"
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
                                                        text: crChargerHardwareVersionRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "6.1.5"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Type"
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
                                                        text: crTypeRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "6.1.6"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Standard Protocol"
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
                                                        text: crStdProtocolRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "6.1.7"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Portable Residual Current Device (PRCD), if applicable"
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
                                                        text: " "
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "6.1.7.1"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Make"
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
                                                        text: updatedChargerPoartableMakeRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "6.1.7.2"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Model No"
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
                                                        text: ChargerPoartableModelRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "6.2"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Description of the normal profile of charging system"
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
                                                        text: crProfileDescRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "6.3"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Specifications"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "6.3.1"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Mains Supply : single phase/ three phase"
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
                                                        text: crSpecMainsSupplyRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "6.3.2"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Input Nominal Voltage (V) & frequency (Hz) with tolerances."
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
                                                        text: crSpecInputNominalVoltageRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "6.3.3"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Output Voltage Range (V) and Current Range (A)"
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
                                                        text: crSpecOutputVoltageRangeRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "6.4"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Reset period recommended between the end of the discharge and the start of  the charge"
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
                                                        text: crSpecResetPeriodRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "6.5"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Recommended duration of a complete charge"
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
                                                        text: crSpecRecommDurationOfCompleteChargeRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "6.6"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "In case of on-board charger"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "6.6.1"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Continuous rating of charger socket (A) :"
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
                                                        text: crOnBoardContRatingRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "6.6.2"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Time rating (h) of charger socket, if any :"
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
                                                        text: ctOnBoardTimeRatingRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "6.6.3"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Whether soft-start facility Yes / No :"
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
                                                        text: crOnBoardWhetherSoftStartRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "6.6.4"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Maximum initial in-rush current (A)"
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
                                                        text: crOnBoardMaxInitialRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "6.6.5"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({                                       
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Charger Power ratings"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({                                      
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text:ChargerPowerratingsRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "6.6.6"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Charger Connector type"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({                                      
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: ChargerConnectortypeRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "7.0"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        columnSpan: 2,
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableBoldTitle",
                                                children: [
                                                    new TextRun({
                                                        text: "Electrical details of vehicle for functional safety"
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "7.1"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Schematic diagram showing the electrical layout giving all major electrical items along with their physical location in the vehicle. It shall include batteries, power-train components, protection fuses, circuit breakers etc. "
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
                                                        text: crUploadSchematicRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "7.2"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Specifications of circuit breakers/ fuses used for protection of batteries / power-train"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "7.2.1"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "IS / IEC specifications"
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
                                                        text: esdISIECSpecRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "7.2.2"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Rating (A)"
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
                                                        text: esdRatingRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "7.2.3"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Opening time (ms)"
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
                                                        text: esdOpeningTimeRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "7.3"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Working voltage V"
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
                                                        text: vesWorkingVoltageRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "7.4"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Schematic highlighting physical location of live parts having working voltage greater than 60 V DC or 25 V AC"
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
                                                        text: vesSchematicRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "7.5"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Electric cables / connectors / wiring harness"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "7.5.1"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "IEC protection class"
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
                                                        text: vesIECProtectionClassRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "7.5.2"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Insulation material used"
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
                                                        text: vesInsulMatRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "7.5.3"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Is Conduits provided? Write Yes / No"
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
                                                        text: vesIsConduitsProvidedRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "7.6"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "List of exposed conductive parts of on-board equipment."
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
                                                        text: vesExpoCondPartsRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "7.6.1"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "Any potential equalization resistance used to electrically connect these parts Yes/ No"
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
                                                        text: vesPotEquaResistRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "7.6.2"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "If yes, give details"
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
                                                        text: vesIfYesRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "7.7"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "List of failures due to which the vehicle will come to standstill"
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
                                                        text: vesFailuresRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "7.8"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: "List of conditions under which the performance of vehicle is limited and how."
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
                                                        text: vesCondRows
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
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableBoldTitle",
                                                children: [
                                                    new TextRun({
                                                        text: "8.0"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        // columnSpan: 2,
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },

                                        children: [
                                            new Paragraph({
                                                style: "TableBoldTitle",
                                                children: [
                                                    new TextRun({
                                                        text: "Electrical energy consumption of Vehicle in W-h/km, as per AIS-039"
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 5000,
                                            WidthType: WidthType.DXA
                                        },
                                        children: [
                                            new Paragraph({
                                                style: "TableRowContent",
                                                children: [
                                                    new TextRun({
                                                        text: electricalConsumptionRows
                                                    })
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            }),
                        ]
                    })
                ],
                                        style: "redColorText",

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
    exportDoc(form13Document, "form13Document.docx");
}

export default generateForm13;

