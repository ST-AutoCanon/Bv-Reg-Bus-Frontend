import { Table, TableRow, TableCell, WidthType, Paragraph, TextRun } from "docx";
import { foot } from './form1AGenUtil.js';
let tyresList;
let allTablesData = [];
let handholdStrap3wheeler_Rows;
let dStrapRows;
// let twoWheeler;
let twoWheeler = false;
let firstValue;

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








  
  

function extractTACNumbers(input) {
    let inputList = [];
  
    // Normalize input to an array
    if (typeof input === 'string') {    
      inputList = [input];
    } else if (Array.isArray(input)) {
      inputList = input;
    } else {
      inputList = [input]; // Treat object input as single-item array
    }
  
    for (const entry of inputList) {
      let value = entry;
  
      // If entry is an object with a 'value' key, extract it
      if (typeof value === 'object' && value !== null && 'value' in value) {
        value = value.value;
      }
  
      // If still not a string, skip
      if (typeof value !== 'string') {
        // console.warn("Non-string entry in extractTACNumbers:", value);
        continue;
      }
  
      const trimmed = value.trim();
  
      // Match something like "abc123 12/12/2026"
      const datePattern = /^(.+?)\s+\d{1,2}\/\d{1,2}\/\d{4}$/;  
      const match = trimmed.match(datePattern);
  
      return match ? match[1] : trimmed;  // Return as string
    }
  
    return '';
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
  

  function normalizeWithTwoUnits(value, unit1, unit2) {
    const trimmedValue = String(value).trim();
    if (!trimmedValue || trimmedValue.toLowerCase() === "na") return trimmedValue;
  
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
  const CyclesPerMin = 'Cycles/Min';

  
function populateMultiSupData(form1AData) {
    // console.log('form1AData:', form1AData);
    let footerData = foot;
    // General_arrangement_vehicle
    const drawing1 = footerData.form1AData.General_arrangement_vehicle.properties.Upload_Drawing_Vehicle.file_name;
    const drawing2 = footerData.form1AData.General_arrangement_vehicle.properties.Upload_Drawing_complete_Vehicle.file_name;

    // Transmission
    const drawingTransmission = footerData.form1AData.Transmission.properties.Drawing_transmission_arrangement.file_name;

    // InstrumentClusterSchema
    const drawingInstrumentCluster = footerData.form1AData.InstrumentClusterSchema.properties.Drawing_showing_the_Complete_Instrument_Cluster.file_name;

    // Suspension
    const drawingSuspension = footerData.form1AData.Suspension.properties.Upload_Drawing_Suspension.file_name;

    // Brief_Brake_Information
    const drawingBrakingSystem = footerData.form1AData.Brief_Brake_Information.properties.Drawing_Braking_System.file_name;

    // ABS
    const sensorDrawing = footerData.form1AData.ABS.properties.ID_SensorsHydraulic_Reservoir.file_name;

    // Make_of_modulator
    const modulatorDrawing = footerData.form1AData.Make_of_modulator.properties.ID_Modulator_Each_wheel.file_name;
    const parkingBrakeDrawing = footerData.form1AData.Make_of_modulator.properties.Drawing_parking_brake_and_mechanism.file_name;

    // Side_Hazard_Lamp
    const diagramLighting = footerData.form1AData.Side_Hazard_Lamp.properties.Diagram_location_lighting.file_name;

    // Coupling_devices
    const couplingDeviceDrawing = footerData.form1AData.Coupling_devices.properties.Diagram_location_lighting.file_name;
    ///////////
    // VINNumbering
    const vinPhoto = footerData.form1AData.VINNumbering.properties.Photo_location_VIN.file_name;

    // Horn
    const hornDrawing = footerData.form1AData.Horn.properties.Drawing_showing_location.file_name;

    // Rear_View_Mirror
    const rearViewDrawing = footerData.form1AData.Rear_View_Mirror.properties.Drawing_Installation_Dimension.file_name;

    // Grab_handle_Straps
    const handholdDrawing = footerData.form1AData.Grab_handle_Straps.properties.Drawing_handhold_Strap.file_name;

    // Strap and hand hold
    const straphandlehold = footerData.form1AData.strap_and_HandelHold.properties.Drawing_handhold_Strap.file_name;

    // Grab_handle_Straps_3_wheeler
    const handholdStrap3wheelerDrawing = footerData.form1AData.Grab_handle_Straps_3_wheeler.properties.Drawing_handhold_Strap.file_name;

    // Spray_Suppression_Rear_Mud_Gaurd
    const spraySuppressionDrawing = footerData.form1AData.Spray_Suppression_Rear_Mud_Gaurd.properties.Diagram_spray_suppression.file_name;

    // Two_Wheeler_Stand
    const standsDrawing = footerData.form1AData.Two_Wheeler_Stand.properties.Diagram_Stands_installation.file_name;
    const footrestDrawing = footerData.form1AData.Two_Wheeler_Stand.properties.Drawing_Footrest_Floor_Boards.file_name;

    // Fire_Fighting_System
    const fireFightingPhoto = footerData.form1AData.Fire_Fighting_System.properties.Photo_fire_fighting_system.file_name;

    // Dimensions_and_weights
    const dimensionDrawing = footerData.form1AData.Dimensions_and_weights.properties.Dimensions_to_be_complied.file_name;

    // Windscreen_and_Wiping_System
    const windscreenDrawing = footerData.form1AData.Windscreen_and_Wiping_System.properties.Upload_Drawing.file_name;

    // R_Point
    const rPointCoordinates = footerData.form1AData.R_Point.properties.Coordinates_of_drawing.file_name;
    const rPointGeneralLayout = footerData.form1AData.R_Point.properties.General_layout.file_name;

    // Rear
    const rearCoordinates = footerData.form1AData.Rear.properties.Coordinates_of_drawing.file_name;

    // Device_to_protect_against_unauthorized_use
    const DeviceUnauthorizedUse = footerData.form1AData.Device_to_protect_against_unauthorized_use.properties.Drawing_showing_installation.file_name;
    // Let lists
    let drawingList1 = [];
    let drawingList2 = [];
    let transmissionListt = [];
    let instrumentClusterList = [];
    let suspensionListt = [];
    let brakingSystemList = [];
    let sensorList = [];
    let modulatorList = [];
    let parkingBrakeList = [];
    let lightingListt = [];
    let couplingList = [];
    let vinList = [];
    let hornList = [];
    let rearViewList = [];
    let handholdList = [];
    let handholdStrap3wheelerList = [];
    let straphandleholdList=[];
    let spraySuppressionList = [];
    let standsList = [];
    let footrestList = [];
    let fireFightingList = [];
    let dimensionList = [];
    let windscreenList = [];
    let rPointList = [];
    let rPointGeneralLayoutList = [];
    let rearCoordinatesList = [];
    let DeviceUnauthorizedUseList = [];

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
      
    

    // Process the filenames using extractFileName function
    drawingList1 = [{ value: extractFileName(drawing1) }];
    drawingList2 = [{ value: extractFileName(drawing2) }];
    transmissionListt = [{ value: extractFileName(drawingTransmission) }];
    instrumentClusterList = [{ value: extractFileName(drawingInstrumentCluster) }];
    suspensionListt = [{ value: extractFileName(drawingSuspension) }];
    brakingSystemList = [{ value: extractFileName(drawingBrakingSystem) }];
    sensorList = [{ value: extractFileName(sensorDrawing) }];
    modulatorList = [{ value: extractFileName(modulatorDrawing) }];
    parkingBrakeList = [{ value: extractFileName(parkingBrakeDrawing) }];
    lightingListt = [{ value: extractFileName(diagramLighting) }];
    // couplingList = [{ value: extractFileName(couplingDeviceDrawing) }];
    couplingList = [{
        value: couplingDeviceDrawing ? extractFileName(couplingDeviceDrawing) : "NA"
      }];
      
    vinList = [{ value: extractFileName(vinPhoto) }];
    hornList = [{ value: extractFileName(hornDrawing) }];
    rearViewList = [{ value: extractFileName(rearViewDrawing) }];
    handholdList = [{ value: extractFileName(handholdDrawing) }];
    handholdStrap3wheelerList = [{ value: extractFileName(handholdStrap3wheelerDrawing) }];
    straphandleholdList = [{ value: extractFileName(straphandlehold) }];
    spraySuppressionList = [{ value: extractFileName(spraySuppressionDrawing) }];
    standsList = [{ value: extractFileName(standsDrawing) }];
    footrestList = [{ value: extractFileName(footrestDrawing) }];
    fireFightingList = [{ value: extractFileName(fireFightingPhoto) }];
    dimensionList = [{ value: extractFileName(dimensionDrawing) }];
    windscreenList = [{ value: extractFileName(windscreenDrawing) }];
    rPointList = [{ value: extractFileName(rPointCoordinates) }];
    //  rPointGeneralLayoutList = [{ value: extractFileName(rPointGeneralLayout) }];
    rPointGeneralLayoutList = [{ value: extractFileName(rPointGeneralLayout) }];

    rearCoordinatesList = [{ value: extractFileName(rearCoordinates) }];
    DeviceUnauthorizedUseList = [{ value: extractFileName(DeviceUnauthorizedUse) }];

    // Rows generation
    let genVehPhotosRows = generateTableData(drawingList1);
    let genDrawingCompleteRows = generateTableData(drawingList2);
    let transmDiagramRows = generateTableData(transmissionListt);
    let ICDrawingRows = generateTableData(instrumentClusterList);
    let suspDrawingRows = generateTableData(suspensionListt);
    let brkDrawingRows = generateTableData(brakingSystemList);
    let sensor_Rows = generateTableData(sensorList);
    let brIDModulatorRows = generateTableData(modulatorList);
    let brDrawingParkingMechanismRows = generateTableData(parkingBrakeList);
    let hzlDiagramLocationRows = generateTableData(lightingListt);
    let coupling_Rows = generateTableData(couplingList);
    let plVinRows = generateTableData(vinList);
    let HornDrawingRows = generateTableData(hornList);
    let rvmDrawInstRows = generateTableData(rearViewList);
    dStrapRows = generateTableData(handholdList);
    handholdStrap3wheeler_Rows = generateTableData(handholdStrap3wheelerList);
     let straphandleholdRows = generateTableData(straphandleholdList);
    let ssDrawingRows = generateTableData(spraySuppressionList);
    let stDiagInstallRows = generateTableData(standsList);
    let twDrawingFootRows = generateTableData(footrestList);
    let FireFightingPhotoRows = generateTableData(fireFightingList);
    let dimension_Rows = generateTableData(dimensionList);
    let uDrawingRows = generateTableData(windscreenList);
    let coDrawingRows = generateTableData(rPointList);
    // let rPointGeneralLayoutRows = generateTableData(rPointGeneralLayoutList);

    let rPointGeneralLayoutRows = twoWheeler ? 'NA' : generateTableData(rPointGeneralLayoutList);


    let DeviceUnauthorizedUseRows = generateTableData(DeviceUnauthorizedUseList);

    let rearCoordinates_Rows = generateTableData(rearCoordinatesList);

    allTablesData.push({
        rowKey: "List2_812",
        value: coupling_Rows
    });
    allTablesData.push({
        rowKey: "List3_2931",
        value: coDrawingRows
    });
    allTablesData.push({
        rowKey: "List2_103",
        value: handholdStrap3wheeler_Rows
    });




    const vehicleGeneralInformationList = form1AData.Vehicle_General_Information.VehicleGeneralInformation;
    let vehMakeList = [];
    let vehModelVariantList = [];
    let vehMeansOfIdentificationList = [];
    let vehVehicleCategoryList = [];
    let vehNameAddressManufList = [];
    let vehNameAddressAssemList = [];
    let vehNameAddressVehImpList = [];
    let vehNameAddressManuAuthRepList = [];
    let vehPositAffxList = [];
    vehicleGeneralInformationList && vehicleGeneralInformationList.map(vehDesc => {
        if (vehDesc.supplier.active === true) {
            const supplierName = vehDesc?.supplier?.nameOfSupplier;
            const vehMake = {
                supplier: supplierName,
                value: vehDesc?.Manufacturer_Details?.properties?.Make?.value
            }
            vehMakeList.push(vehMake);
            const vehModelVariant = {
                supplier: supplierName,
                value: vehDesc?.Manufacturer_Details?.properties?.Basic_model_and_its_variant?.value
            }
            vehModelVariantList.push(vehModelVariant);
            const vehMeansOfIdentification = {
                supplier: supplierName,
                value: vehDesc?.Manufacturer_Details?.properties?.Means_Of_Type_identification?.value
            }
            vehMeansOfIdentificationList.push(vehMeansOfIdentification);
            const vehVehicleCategory = {
                supplier: supplierName,
                value: vehDesc?.Manufacturer_Details?.properties?.Vehicle_category?.value
            }
            vehVehicleCategoryList.push(vehVehicleCategory);
            const vehNameAddressManuf = {
                supplier: supplierName,
                value: vehDesc?.Manufacturer_Details?.properties?.Name_and_address_of_manufacturer?.value
            }
            vehNameAddressManufList.push(vehNameAddressManuf);
            const vehNameAddressAssem = {
                supplier: supplierName,
                value: vehDesc?.Manufacturer_Details?.properties?.Name_and_address_of_assembly_plants?.value
            }
            vehNameAddressAssemList.push(vehNameAddressAssem);
            const vehNameAddressVehImp = {
                supplier: supplierName,
                value: vehDesc?.Manufacturer_Details?.properties?.Name_and_address_of_the_vehicle_importer?.value
            }
            vehNameAddressVehImpList.push(vehNameAddressVehImp);
            const vehNameAddressManuAuthRep = {
                supplier: supplierName,
                value: vehDesc?.Manufacturer_Details?.properties?.Name_address_mfr_auth_rep?.value
            }
            vehNameAddressManuAuthRepList.push(vehNameAddressManuAuthRep);
            const vehPositAffx = {
                supplier: supplierName,
                value: vehDesc?.Manufacturer_Details?.properties?.Position_affixing_type_approval?.value
            }
            vehPositAffxList.push(vehPositAffx);
        }
    });
    let vehMakeRows = generateTableData(vehMakeList);
    const updatedvehMakeRows = normalizeMsPrefix(vehMakeRows);
    let vehModelVariantRows = generateTableData(vehModelVariantList);
    let vehMeansOfIdentificationRows = generateTableData(vehMeansOfIdentificationList);
    let vehVehicleCategoryRows = generateTableData(vehVehicleCategoryList);
    firstValue = vehVehicleCategoryRows;
    if (firstValue === "L2" || firstValue === "L1") {
        twoWheeler = true;        
    }
    let vehNameAddressManufRows = generateTableData(vehNameAddressManufList);
    let vehNameAddressAssemRows = generateTableData(vehNameAddressAssemList);
    let vehNameAddressVehImpRows = generateTableData(vehNameAddressVehImpList);
    let vehNameAddressManuAuthRepRows = generateTableData(vehNameAddressManuAuthRepList);
    let vehPositAffxRows = generateTableData(vehPositAffxList);
    allTablesData.push({
        rowKey: "List1_01",
        value: updatedvehMakeRows
    });
    allTablesData.push({
        rowKey: "List1_02",
        value: vehModelVariantRows
    });
    allTablesData.push({
        rowKey: "List1_03",
        value: vehMeansOfIdentificationRows
    });
    allTablesData.push({
        rowKey: "List1_05",
        value: vehVehicleCategoryRows
    });
    allTablesData.push({
        rowKey: "List1_06",
        value: vehNameAddressManufRows
    });
    allTablesData.push({
        rowKey: "List1_07",
        value: vehNameAddressAssemRows
    });
    allTablesData.push({
        rowKey: "List1_08",
        value: vehNameAddressVehImpRows
    });
    allTablesData.push({
        rowKey: "List1_09",
        value: vehNameAddressManuAuthRepRows
    });
    allTablesData.push({
        rowKey: "List1_012",
        value: vehPositAffxRows
    });
    
    tyresList = form1AData.Tyres.TyresData;
    let tyreLadenList = [];
    let tyreUnladenDriverList = [];
    let tyreWheelCombSizeList = [];
    let tyreMinSpeedCategoryList = [];
    let tyreMinLoadCapIndexList = [];
    let tyreCategCompatibleList = [];
    let vehTypeList = [];
    let tyreMAxWisthList = [];
    tyresList && tyresList.map(vehTyre => {
        if (vehTyre?.supplier?.active === true) {
            const supplierName = vehTyre.supplier.nameOfSupplier;
            tyreLadenList.push({
                supplier: supplierName,
                value: vehTyre?.Tyre_Description?.properties?.Laden?.value
            });
            tyreUnladenDriverList.push({
                supplier: supplierName,
                value: vehTyre?.Tyre_Description?.properties?.Unladen_Driver?.value
            });
            tyreWheelCombSizeList.push({
                supplier: supplierName,
                value: vehTyre?.Tyre_Description?.properties?.Tyre_wheel_combinations_Sizes?.value
            });
            tyreMinSpeedCategoryList.push({
                supplier: supplierName,
                value: vehTyre?.Tyre_Description?.properties?.Minimum_speed_category_symbol?.value
            });
            tyreMinLoadCapIndexList.push({
                supplier: supplierName,
                value: vehTyre?.Tyre_Description?.properties?.Minimum_load_capacity_index?.value
            });
            tyreCategCompatibleList.push({
                supplier: supplierName,
                value: vehTyre?.Tyre_Description?.properties?.Categories_compatible_for_vehicle?.value
            });
            vehTypeList.push({
                supplier: supplierName,
                value: vehTyre?.Front_Tyre?.properties?.tyre_vehicle_type?.value
            });
            tyreMAxWisthList.push({
                supplier: supplierName,
                value: vehTyre?.Rear_Tyre?.properties?.Tyre_max_Width?.value
            });


        }
    });
    let tyreLadenRows = generateTableData(tyreLadenList);
    // let tyreLadenRows = normalizeWithUnit(tyreLadenRows1, KG_CM2_KPA_PSI);
    let tyreUnladenDriverRows = generateTableData(tyreUnladenDriverList);
    // let tyreUnladenDriverRows = normalizeWithUnit(tyreUnladenDriverRows1, KG_CM2_KPA_PSI);
    let tyreWheelCombSizeRows = generateTableData(tyreWheelCombSizeList);
    let tyreMinSpeedCategoryRows = generateTableData(tyreMinSpeedCategoryList);
    let tyreMinLoadCapIndexRows = generateTableData(tyreMinLoadCapIndexList);
    let tyreCategCompatibleRows = generateTableData(tyreCategCompatibleList);
    let tyreMAxWisthRows1 = generateTableData(tyreMAxWisthList);
    let tyreMAxWisthRows = normalizeWithUnit(tyreMAxWisthRows1, MM);
    let vehTypeRows = generateTableData(vehTypeList);
    // console.log('vehTypeRows:', vehTypeRows);
    // firstValue = vehTypeRows;
    // if (firstValue === "2-Wheeler") {
    //     twoWheeler = true;
    //     console.log('true');
    //     console.log('inside firstValue :', firstValue);
    //     console.log('inside firstValue twoWheeler:', twoWheeler);
    // }
    allTablesData.push({
        rowKey: "List2_4211",
        value: tyreLadenRows
    });
    allTablesData.push({
        rowKey: "List2_4212",
        value: tyreUnladenDriverRows
    });
    allTablesData.push({
        rowKey: "List2_422",
        value: tyreWheelCombSizeRows
    });
    allTablesData.push({
        rowKey: "List2_423",
        value: tyreMinSpeedCategoryRows
    });
    allTablesData.push({
        rowKey: "List2_424",
        value: tyreMinLoadCapIndexRows
    });
    allTablesData.push({
        rowKey: "List2_425",
        value: tyreCategCompatibleRows
    });
    allTablesData.push({
        rowKey: "List2_112",
        value: tyreMAxWisthRows
    });

  
    const generalArrangeOfVehicleList = form1AData.General_arrangement_vehicle.GeneralArrangementVehicle;
    let genVehPhotosList = [];
    let genDrawingCompleteList = [];
    let genNoOfAxlesWheelsList = [];
    let genNoOfSeatingPositionsList = [];
    let genTypeOfFuelList = [];
    let genCommericalList = [];
    let genWheelBaseList = [];
    generalArrangeOfVehicleList && generalArrangeOfVehicleList.map(arrOfVehicle => {
        if (arrOfVehicle.supplier.active === true) {
            const supplierName = arrOfVehicle.supplier.nameOfSupplier;
            genVehPhotosList.push({
                supplier: supplierName,
                value: arrOfVehicle?.General_arrangement_vehicle?.properties?.Upload_Drawing_Vehicle?.value
            });
            genDrawingCompleteList.push({
                supplier: supplierName,
                value: arrOfVehicle?.General_arrangement_vehicle?.properties?.Upload_Drawing_complete_Vehicle?.value
            });
            genNoOfAxlesWheelsList.push({
                supplier: supplierName,
                value: arrOfVehicle?.General_arrangement_vehicle?.properties?.Number_of_axles_and_Wheels?.value
            });
            genNoOfSeatingPositionsList.push({
                supplier: supplierName,
                value: arrOfVehicle?.General_arrangement_vehicle?.properties?.Number_of_seating_positions?.value
            });

            genTypeOfFuelList.push({
                supplier: supplierName,
                value: arrOfVehicle?.General_arrangement_vehicle?.properties?.Type_possible_variants_and_versions?.value
            });
            genCommericalList.push({
                supplier: supplierName,
                value: arrOfVehicle?.General_arrangement_vehicle?.properties?.Commercial_name?.value
            });
            genWheelBaseList.push({
                supplier: supplierName,
                value: arrOfVehicle?.General_arrangement_vehicle?.properties?.Wheel_base?.value
            });
        }
    });
    // let genVehPhotosRows = generateTableData(genVehPhotosList);
    // let genDrawingCompleteRows = generateTableData(genDrawingCompleteList);
    let genNoOfAxlesWheelsRows = generateTableData(genNoOfAxlesWheelsList);
    let genNoOfSeatingPositionsRows = generateTableData(genNoOfSeatingPositionsList);
    let genTypeOfFuelRows = generateTableData(genTypeOfFuelList);
    let genCommericalRows = generateTableData(genCommericalList);
    let genWheelBaseRows1 = generateTableData(genWheelBaseList);
    let genWheelBaseRows = normalizeWithUnit(genWheelBaseRows1, MM);
    allTablesData.push({
        rowKey: "List1_11",
        value: genVehPhotosRows
    });
    allTablesData.push({
        rowKey: "List1_12",
        value: genDrawingCompleteRows
    });
    allTablesData.push({
        rowKey: "List1_13",
        value: genWheelBaseRows
    });
    allTablesData.push({
        rowKey: "List1_14",
        value: genNoOfAxlesWheelsRows
    });
    allTablesData.push({
        rowKey: "List1_15",
        value: "NA"
    });
    allTablesData.push({
        rowKey: "List1_16",
        value: genNoOfSeatingPositionsRows
    });
    allTablesData.push({
        rowKey: "List1_17",
        value: "Electric Vehicle"
    });
    allTablesData.push({
        rowKey: "List1_2",
        value: genTypeOfFuelRows
    });
    allTablesData.push({
        rowKey: "List1_21",
        value: genCommericalRows
    });
    const weights = form1AData.Weights.WeightsData;
    let kerbWeightList = [];
    let distrWeightList = [];
    let refWeightList = [];
    let divOfWeightList = [];
    let maxPermWeightList = [];
    let weightFrontAxleList = [];
    let weightRearAxleList = [];
    let divOfGWeightList = [];
    weights && weights.map(vehWeight => {
        if (vehWeight.supplier.active === true) {
            const supplierName = vehWeight?.supplier?.nameOfSupplier;
            kerbWeightList.push({
                supplier: supplierName,
                value: vehWeight?.Kerb_Weight?.properties?.Vehicle_kerb_weight?.value
            });
            distrWeightList.push({
                supplier: supplierName,
                value: vehWeight?.Kerb_Weight?.properties?.Distribution_weight_between_axles?.value
            });
            refWeightList.push({
                supplier: supplierName,
                value: vehWeight?.Kerb_Weight?.properties?.Reference_weight?.value
            });
            divOfWeightList.push({
                supplier: supplierName,
                value: vehWeight?.Gross_Vehicle_Weight?.properties.Division_of_weight_between_axles?.value
            });
            divOfGWeightList.push({
                supplier: supplierName,
                value: vehWeight?.Gross_Vehicle_Weight?.properties.Gross_Vehicle_Weight?.value
            });
            maxPermWeightList.push({
                supplier: supplierName,
                value: vehWeight?.Maximum_Carrying_capacity?.properties?.Max_permissible_weight?.value
            });
            weightFrontAxleList.push({
                supplier: supplierName,
                value: vehWeight?.Maximum_Carrying_capacity?.properties?.Max_permissible_weight_front_axle?.value
            });
            weightRearAxleList.push({
                supplier: supplierName,
                value: vehWeight?.Maximum_Carrying_capacity?.properties?.Max_permissible_weight_rear_axle?.value
            });
        }
    });
    let kerbWeightRows1 = generateTableData(kerbWeightList);
    let kerbWeightRows = normalizeWithUnit(kerbWeightRows1, KG);
    let distrWeightRows1 = generateTableData(distrWeightList);
    let distrWeightRows = normalizeWithTwoUnits(distrWeightRows1, KG,KG);
    // let distrWeightRows = normalizeWithUnit(distrWeightRows1, KG);
    let refWeightRows1 = generateTableData(refWeightList);
    let refWeightRows = normalizeWithUnit(refWeightRows1, KG);
    let divOfWeightRows1 = generateTableData(divOfWeightList);
    let divOfWeightRows = normalizeWithTwoUnits(divOfWeightRows1, KG,KG);
    // let divOfWeightRows = normalizeWithUnit(divOfWeightRows1, KG);
    let divOfGWeightRows1 = generateTableData(divOfGWeightList);
    let divOfGWeightRows = normalizeWithUnit(divOfGWeightRows1, KG);
    let maxPermWeightRows1 = generateTableData(maxPermWeightList);
    let maxPermWeightRows = normalizeWithUnit(maxPermWeightRows1, KG);
    let weightFrontAxleRows1 = generateTableData(weightFrontAxleList);
    let weightFrontAxleRows = normalizeWithUnit(weightFrontAxleRows1, KG);
    let weightRearAxleRows1 = generateTableData(weightRearAxleList);
    let weightRearAxleRows = normalizeWithUnit(weightRearAxleRows1, KG);
    allTablesData.push({
        rowKey: "List1_19",
        value: kerbWeightRows
    });
    allTablesData.push({
        rowKey: "List1_110",
        value: distrWeightRows
    });
    allTablesData.push({
        rowKey: "List1_111",
        value: refWeightRows
    });
    allTablesData.push({
        rowKey: "List1_112",
        value: divOfGWeightRows
    });
    allTablesData.push({
        rowKey: "List1_113",
        value: divOfWeightRows
    });
    allTablesData.push({
        rowKey: "List1_114",
        value: maxPermWeightRows
    });
    allTablesData.push({
        rowKey: "List1_115",
        value: weightFrontAxleRows
    });
    allTablesData.push({
        rowKey: "List1_116",
        value: weightRearAxleRows
    });

    const transmissionList = form1AData?.Drive_Train_System?.DriveTrainSystemData;
    let transmDiagramList = [];
    let transmTypeList = [];
    let transmGearBoxList = [];
    let transmPrimRatioList = [];
    let transmReverseGearList = [];
    let transmECUList = [];
    let transmMaxSpeedList = [];
    let clutchTypeList=[];
    let methodOfSelectionList = [];
let gearShiftingPatternList = [];
let secondaryRatioList = [];
let individualAndOverallRatiosList = [];
let firstGearRatioList = [];
let secondGearRatioList = [];
let thirdGearRatioList = [];
let fourthGearRatioList = [];
let fifthGearRatioList = [];
let sixthGearRatioList = [];

    transmissionList && transmissionList.map(vehTransm => {
        if (vehTransm.supplier.active === true) {
            const supplierName = vehTransm?.supplier?.nameOfSupplier;
            transmDiagramList.push({
                supplier: supplierName,
                value: vehTransm?.Transmission?.properties?.Drawing_transmission_arrangement?.value
            });
            transmTypeList.push({
                supplier: supplierName,
                value: vehTransm?.Transmission?.properties?.type_Transmission_arrangement?.value
            });
            transmGearBoxList.push({
                supplier: supplierName,
                value: vehTransm?.Transmission?.properties?.Type_Gear_box_vehicle?.value
            });
            transmPrimRatioList.push({
                supplier: supplierName,
                value: vehTransm?.Transmission?.properties?.Primary_ratio_transmission_system?.value
            });
            transmReverseGearList.push({
                supplier: supplierName,
                value: vehTransm?.Transmission?.properties?.Reverse_gear_max_speed?.value
            });
            transmECUList.push({
                supplier: supplierName,
                value: vehTransm?.Transmission?.properties?.ECUs_in_transmission?.value
            });
            transmMaxSpeedList.push({
                supplier: supplierName,
                value: vehTransm?.Transmission?.properties?.Max_Design_speed_of_vehicle?.value
            });
            clutchTypeList.push({
                supplier: supplierName,
                value: vehTransm?.Clutch?.properties?.Type?.value
            });
            methodOfSelectionList.push({
                supplier: supplierName,
                value: vehTransm?.Transmission?.properties?.Method_of_selection?.value
            });
            
            gearShiftingPatternList.push({
                supplier: supplierName,
                value: vehTransm?.Transmission?.properties?.Gear_shifting_pattern?.value
            });
            
            secondaryRatioList.push({
                supplier: supplierName,
                value: vehTransm?.Transmission?.properties?.Secondary_ratio?.value
            });
            
            individualAndOverallRatiosList.push({
                supplier: supplierName,
                value: vehTransm?.Transmission?.properties?.Individual_and_Overall_ratios?.value
            });
            
            firstGearRatioList.push({
                supplier: supplierName,
                value: vehTransm?.Transmission?.properties?.First_gear_ratio?.value
            });
            
            secondGearRatioList.push({
                supplier: supplierName,
                value: vehTransm?.Transmission?.properties?.Second_gear_ratio?.value
            });
            
            thirdGearRatioList.push({
                supplier: supplierName,
                value: vehTransm?.Transmission?.properties?.Third_gear_ratio?.value
            });
            
            fourthGearRatioList.push({
                supplier: supplierName,
                value: vehTransm?.Transmission?.properties?.Fourth_gear_ratio?.value
            });
            
            fifthGearRatioList.push({
                supplier: supplierName,
                value: vehTransm?.Transmission?.properties?.Fifth_gear_ratio?.value
            });
            
            sixthGearRatioList.push({
                supplier: supplierName,
                value: vehTransm?.Transmission?.properties?.Sixth_gear_ratio?.value
            });
            
        }
    });
    // let transmDiagramRows = generateTableData(transmDiagramList);
    let transmTypeRows = generateTableData(transmTypeList);
    let transmGearBoxRows = generateTableData(transmGearBoxList);
    let transmPrimRatioRows = generateTableData(transmPrimRatioList);
    let transmReverseGearRows = generateTableData(transmReverseGearList);
    let transmECURows = generateTableData(transmECUList);
    let transmMaxSpeedRows1 = generateTableData(transmMaxSpeedList);
    let transmMaxSpeedRows = normalizeWithUnit(transmMaxSpeedRows1, KM_H);
    let methodOfSelectionRows = generateTableData(methodOfSelectionList);
    let clutchTypeRows = generateTableData(clutchTypeList);    
let gearShiftingPatternRows = generateTableData(gearShiftingPatternList);
let secondaryRatioRows = generateTableData(secondaryRatioList);
let individualAndOverallRatiosRows = generateTableData(individualAndOverallRatiosList);
let firstGearRatioRows = generateTableData(firstGearRatioList);
let secondGearRatioRows = generateTableData(secondGearRatioList);
let thirdGearRatioRows = generateTableData(thirdGearRatioList);
let fourthGearRatioRows = generateTableData(fourthGearRatioList);
let fifthGearRatioRows = generateTableData(fifthGearRatioList);
let sixthGearRatioRows = generateTableData(sixthGearRatioList);


    allTablesData.push({
        rowKey: "List1_31",
        value: transmDiagramRows
    });
    allTablesData.push({
        rowKey: "List1_32",
        value: transmTypeRows
    });
    allTablesData.push({
        rowKey: "List1_341",
        value: transmGearBoxRows
    });
    allTablesData.push({
        rowKey: "List1_3431",
        value: transmPrimRatioRows
    });
    allTablesData.push({
        rowKey: "List1_3436",
        value: transmReverseGearRows
    });
    allTablesData.push({
        rowKey: "List1_35",
        value: transmECURows
    });
    allTablesData.push({
        rowKey: "List1_36",
        value: transmMaxSpeedRows
    });
    allTablesData.push({
        rowKey: "List1_33",
        value: clutchTypeRows
    });
    // allTablesData.push({
    //     rowKey: "List1_34",
    //     value: "NA"
    // });
    allTablesData.push({
        rowKey: "List1_342",
        value:methodOfSelectionRows
    });
    allTablesData.push({
        rowKey: "List1_3421",
        value: gearShiftingPatternRows
    });
    // allTablesData.push({
    //     rowKey: "List1_343",
    //     value: "NA"
    // });
    allTablesData.push({
        rowKey: "List1_3432",
        value: secondaryRatioRows
    });
    allTablesData.push({
        rowKey: "List1_3433",
        value: individualAndOverallRatiosRows
    });
    allTablesData.push({
        rowKey: "List1_34331",
        value: firstGearRatioRows
    });
    allTablesData.push({
        rowKey: "List1_34332",
        value: secondGearRatioRows
    });
    allTablesData.push({
        rowKey: "List1_34333",
        value: thirdGearRatioRows
    });
    allTablesData.push({
        rowKey: "List1_34334",
        value: fourthGearRatioRows
    });
    allTablesData.push({
        rowKey: "List1_34335",
        value: fifthGearRatioRows
    });
    allTablesData.push({
        rowKey: "List1_34336",
        value: sixthGearRatioRows
    });
    allTablesData.push({
        rowKey: "List1_3434",
        value: "NA"
    });
    allTablesData.push({
        rowKey: "List1_3435",
        value: "NA"
    });

    // const suspensionList = (form1AData?.Suspension?.SuspensionData && Object.keys(form1AData.Suspension.SuspensionData).length > 0)
    //     // ? form1AData.Suspension.SuspensionData
    //     ? form1AData.Handle_Lock_Anti_Theft_Device.HandleLock
    //     : form1AData?.SteeringSuspensionAntiTheft?.SteeringSuspensionAntiTheftData;
    const handleLockData = form1AData?.Suspension?.SuspensionData;
    const steeringData = form1AData?.SteeringSuspensionAntiTheft?.SteeringSuspensionAntiTheftData;
    // console.log('handleLockData:', handleLockData);
    // console.log('steeringData:', steeringData);
    const suspensionList = (
        handleLockData && Object.keys(handleLockData).length > 0
    ) ? handleLockData
        : (steeringData && Object.keys(steeringData).length > 0 ? steeringData : {});

    const handleLockDataa = form1AData.Handle_Lock_Anti_Theft_Device.HandleLock;
    // console.log('handleLockDataa:', handleLockDataa);
    // console.log("suspensionList:", suspensionList);
    let suspDrawingList = [];
    let suspBriefDescOfECUsList = [];
    let suspSpringsFrontRearList = [];
    let suspAntiRollBarList = [];
    let suspSockAbsorbersList = [];
    let sControlProvidedList = [];
    let sLocationList = [];
    let smechanismList = [];
    let sMakeList = [];
    let sGearRatioList = [];
    let sMaxWheelList = [];
    let sBreifList = [];
    let thLockList = [];
    let MatDeviceList = [];
    let thLockListt = [];
    let MatDeviceListt = [];
    suspensionList && suspensionList.map(vehSusp => {
        if (vehSusp.supplier.active === true) {
            const supplierName = vehSusp?.supplier?.nameOfSupplier;
            suspDrawingList.push({
                supplier: supplierName,
                value: vehSusp?.Suspension?.properties?.Upload_Drawing_Suspension?.value
            });
            suspBriefDescOfECUsList.push({
                supplier: supplierName,
                value: vehSusp?.Suspension?.properties?.Brief_desc_ECUs?.value
            });
            suspSpringsFrontRearList.push({
                supplier: supplierName,
                value: vehSusp?.Suspension?.properties?.springs_at_front_and_Rear?.value
            });
            suspAntiRollBarList.push({
                supplier: supplierName,
                value: vehSusp?.Suspension?.properties?.Anti_roll_bar?.value
            });
            suspSockAbsorbersList.push({
                supplier: supplierName,
                value: vehSusp?.Suspension?.properties?.Shock_absorbers_at_front_rear?.value
            });
            sControlProvidedList.push({
                supplier: supplierName,
                value: vehSusp?.Steering_System?.properties?.Steering_control_provided?.value
            });
            sLocationList.push({
                supplier: supplierName,
                value: vehSusp?.Steering_System?.properties?.location_of_steering_wheel?.value
            });
            smechanismList.push({
                supplier: supplierName,
                value: vehSusp?.Steering_System?.properties?.Steering_working_mechanism?.value
            });
            sMakeList.push({
                supplier: supplierName,
                value: vehSusp?.Steering_System?.properties?.Make_Steering_system?.value
            });
            sGearRatioList.push({
                supplier: supplierName,
                value: vehSusp?.Steering_System?.properties?.steering_gear_ratio?.value
            });
            sMaxWheelList.push({
                supplier: supplierName,
                value: vehSusp?.Steering_System?.properties?.Max_rotation_steering_wheel?.value
            });
            sBreifList.push({
                supplier: supplierName,
                value: vehSusp?.Steering_System?.properties?.Brief_desc_ECUs_Steering?.value
            });
            thLockList.push({

                value: vehSusp?.Lock_Anti_theft_device?.properties?.Type_of_handle_Lock?.value
            });
            MatDeviceList.push({

                value: vehSusp?.Lock_Anti_theft_device?.properties?.Make_of_Anti_Theft_Device?.value
            });
        }
    });

    handleLockDataa && handleLockDataa.map(vehhand => {
        if (vehhand.supplier.active === true) {

            thLockListt.push({

                value: vehhand?.Lock_Anti_theft_device?.properties?.Type_of_handle_Lock?.value
            });
            MatDeviceListt.push({

                value: vehhand?.Lock_Anti_theft_device?.properties?.Make_of_Anti_Theft_Device?.value
            });
        }
    });
    // let suspDrawingRows = generateTableData(suspDrawingList);
    let suspBriefDescOfECUsRows = generateTableData(suspBriefDescOfECUsList);
    let suspSpringsFrontRearRows = generateTableData(suspSpringsFrontRearList);
    let suspAntiRollBarRows = generateTableData(suspAntiRollBarList);
    let suspSockAbsorbersRows = generateTableData(suspSockAbsorbersList);
    // let sControlProvidedRows = generateTableData(sControlProvidedList);
    let sControlProvidedRows = twoWheeler ? 'Handle Bar' : generateTableData(sControlProvidedList);

    // let sLocationRows = generateTableData(sLocationList);
    let sLocationRows = twoWheeler ? 'NA' : generateTableData(sLocationList);

    // let smechanismRows = generateTableData(smechanismList);
    let smechanismRows = twoWheeler ? 'NA' : generateTableData(smechanismList);

    // let sMakeRows = generateTableData(sMakeList);
    let sMakeRows = twoWheeler ? 'NA' : generateTableData(sMakeList);
    const updatedsMakeRows = normalizeMsPrefix(sMakeRows);
    // let sGearRatioRows = generateTableData(sGearRatioList);
    let sGearRatioRows = twoWheeler ? 'NA' : generateTableData(sGearRatioList);

    // let sMaxWheelRows = generateTableData(sMaxWheelList);
    let sMaxWheelRows = twoWheeler ? 'NA' : generateTableData(sMaxWheelList);

    let sBreifRows = generateTableData(sBreifList);
    // let sBreifRows = twoWheeler ? 'NA' : generateTableData(sBreifList);
    // let thLockRows = generateTableData(thLockList);
    // let MatDeviceRows = generateTableData(MatDeviceList);
    // let thLockRows = generateTableData(thLockList.length ? thLockList : thLockListt);



    allTablesData.push({
        rowKey: "List2_511",
        value: sControlProvidedRows
    });

    allTablesData.push({
        rowKey: "List2_512",
        value: sLocationRows
    });
    allTablesData.push({
        rowKey: "List2_5131",
        value: updatedsMakeRows
    });

    allTablesData.push({
        rowKey: "List2_5132",
        value: sGearRatioRows
    });
    allTablesData.push({
        rowKey: "List2_5133",
        value: sMaxWheelRows
    });
    // console.log('thLockListt:', thLockListt);
    // console.log('MatDeviceListt:', MatDeviceListt);
    // console.log('thLockList length:', thLockList.length);
    // console.log('thLockListt length:', thLockListt.length);
    const isValidList = (arr) =>
        Array.isArray(arr) &&
        arr.some(item =>
            item &&
            Object.values(item).some(v => v !== undefined && v !== null && v !== '')
        );
    const finalThLockList = isValidList(thLockList) ? thLockList : (isValidList(thLockListt) ? thLockListt : []);
    // console.log('finalThLockList used for generateTableData:', finalThLockList);
    let thLockRows = generateTableData(finalThLockList);
    // For MatDeviceList
    const finalMatDeviceList = isValidList(MatDeviceList)
        ? MatDeviceList
        : (isValidList(MatDeviceListt) ? MatDeviceListt : []);

    // console.log('finalMatDeviceList used for generateTableData:', finalMatDeviceList);

    let MatDeviceRows = generateTableData(finalMatDeviceList);
    const updatedMatDeviceRows = normalizeMsPrefix(MatDeviceRows);
    

    allTablesData.push({
        rowKey: "List1_41",
        value: suspDrawingRows
    });
    allTablesData.push({
        rowKey: "List1_411",
        value: suspBriefDescOfECUsRows
    });
    allTablesData.push({
        rowKey: "List1_412",
        value: suspSpringsFrontRearRows
    });
    allTablesData.push({
        rowKey: "List1_413",
        value: suspAntiRollBarRows
    });
    allTablesData.push({
        rowKey: "List1_414",
        value: suspSockAbsorbersRows
    });
    // allTablesData.push({
    //     rowKey: "List2_511",
    //     value: sControlProvidedRows
    // });

    // allTablesData.push({
    //     rowKey: "List2_512",
    //     value: sLocationRows
    // });
    allTablesData.push({
        rowKey: "List2_513",
        value: smechanismRows
    });
    // allTablesData.push({
    //     rowKey: "List2_5131",
    //     value: sMakeRows
    // });
    // allTablesData.push({
    //     rowKey: "List2_5132",
    //     value: sGearRatioRows
    // });
    // allTablesData.push({
    //     rowKey: "List2_5133",
    //     value: sMaxWheelRows
    // });
    allTablesData.push({
        rowKey: "List2_514",
        value: sBreifRows
    });
    allTablesData.push({
        rowKey: "List2_841",
        value: thLockRows
    });
    allTablesData.push({
        rowKey: "List2_8411",
        value: updatedMatDeviceRows
    });
    allTablesData.push({
        rowKey: "List2_8412",
        value: DeviceUnauthorizedUseRows
    });

    const wheelRimList = form1AData.Wheel_Rim.WheelRim;
    let fwMakeList = [];
    let fwBISLicNumberList = [];
    let fwPartNumberList = [];
    let fwSizeList = [];
    let fwRimTypeList = [];
    let rwMakeList = [];
    let rwBISLicNumberList = [];
    let rwPartNumberList = [];
    let rwSizeList = [];
    let rwRimTypeList = [];
    wheelRimList && wheelRimList.map(wheelRim => {
        if (wheelRim.supplier.active === true) {
            const supplierName = wheelRim?.supplier?.nameOfSupplier;
            fwMakeList.push({
                supplier: supplierName,
                value: wheelRim?.Front_Wheel_Rim?.properties?.Make_of_front_wheel_Rim?.value
            });
            fwBISLicNumberList.push({
                supplier: supplierName,
                value: wheelRim?.Front_Wheel_Rim?.properties?.BIS_License_Number_validity?.value
            });
            fwPartNumberList.push({
                supplier: supplierName,
                value: wheelRim?.Front_Wheel_Rim?.properties?.Part_Number_of_wheelrim_supplier?.value
            });
            fwSizeList.push({
                supplier: supplierName,
                value: wheelRim?.Front_Wheel_Rim?.properties?.Size?.value
            });
            fwRimTypeList.push({
                supplier: supplierName,
                value: wheelRim?.Front_Wheel_Rim?.properties?.Rim_Type?.value
            });
            rwMakeList.push({
                supplier: supplierName,
                value: wheelRim?.Rear_Wheel_Rim?.properties?.Make_of_rear_wheel_Rim?.value
            });
            rwBISLicNumberList.push({
                supplier: supplierName,
                value: wheelRim?.Rear_Wheel_Rim?.properties?.BIS_License_Number_validity?.value
            });
            rwPartNumberList.push({
                supplier: supplierName,
                value: wheelRim?.Rear_Wheel_Rim?.properties?.Part_Number_of_wheelrim_supplier?.value
            });
            rwSizeList.push({
                supplier: supplierName,
                value: wheelRim?.Rear_Wheel_Rim?.properties?.Size?.value
            });
            rwRimTypeList.push({
                supplier: supplierName,
                value: wheelRim?.Rear_Wheel_Rim?.properties?.Rim_Type?.value
            });
        }
    });
    let fwMakeRows = generateTableData(fwMakeList);
    const updatedfwMakeRows= normalizeMsPrefix(fwMakeRows);
    // const fwBISLicNumberListt= extractTACNumbers(fwBISLicNumberList);
    // let fwBISLicNumberRows = generateTableData(fwBISLicNumberListt);
    let fwBISLicNumberRows1 = generateTableData(fwBISLicNumberList);
const fwBISLicNumberRows = extractTACNumbers(fwBISLicNumberRows1);
// console.log('fwBISLicNumberRows:',fwBISLicNumberRows);
    let fwPartNumberRows = generateTableData(fwPartNumberList);
    let fwSizeRows = generateTableData(fwSizeList);
    // let fwSizeRows = normalizeWithUnit(fwSizeRows1, INCH_MM);
    let fwRimTypeRows = generateTableData(fwRimTypeList);
    let rwMakeRows = generateTableData(rwMakeList);
    const updatedrwMakeRows= normalizeMsPrefix(rwMakeRows);
    let rwBISLicNumberRows1 = generateTableData(rwBISLicNumberList);
    const rwBISLicNumberRows = extractTACNumbers(rwBISLicNumberRows1);
    // console.log('rwBISLicNumberRows:',rwBISLicNumberRows);
    let rwPartNumberRows = generateTableData(rwPartNumberList);
    let rwSizeRows = generateTableData(rwSizeList);
    // let rwSizeRows = normalizeWithUnit(rwSizeRows1, INCH_MM);
    let rwRimTypeRows = generateTableData(rwRimTypeList);
    allTablesData.push({
        rowKey: "List2_4311",
        value: updatedfwMakeRows
    });
    // allTablesData.push({
    //     rowKey: "List2_432",
    //     value: fwBISLicNumberRows
    // });
    allTablesData.push({
        rowKey: "List2_4312",
        value: fwPartNumberRows
    });
    allTablesData.push({
        rowKey: "List2_4313",
        value: fwSizeRows
    });
    allTablesData.push({
        rowKey: "List2_4314",
        value: fwRimTypeRows
    });
    allTablesData.push({
        rowKey: "List2_4321",
        value: updatedrwMakeRows
    });
    allTablesData.push({
        rowKey: "List2_442",
        value: rwBISLicNumberRows
    });
    allTablesData.push({
        rowKey: "List2_4322",
        value: rwPartNumberRows
    });
    allTablesData.push({
        rowKey: "List2_4323",
        value: rwSizeRows
    });
    allTablesData.push({
        rowKey: "List2_4324",
        value: rwRimTypeRows
    });
    // Updated code: Mapping ABS,Drawing,BrakeTypes,Service Brake Controls,Free Play and Ratio's ,Wheel Cylinder,Parking Brake data and pushing to table
    const brakesList = form1AData.Brakes.BrakesData;
    let brkDrawingList = [];
    let brkMakeList = [];
    let brkTypeList = [];
    let brkSystemNumberFrontList = [];
    let brkSystemNumberRearList = [];
    let brkSelectBreakingMediumList = [];
    let brkShoesDiscsMakeList = [];
    let brkLiningPadsList = [];
    let brkActuationMethodList = [];
    let brkHydrReserList = [];
    let brkFrontRearPadsList = [];
    let brkFrontRearBrakeList = [];
    let brkDiameterFrontRearDiscList = [];
    let brkABSProvidedList = [];
    let brkABSWheelsActingList = [];
    let brkSensorsList = [];
    let brkIDModulatorList = [];
    let brkMakeOfABSECUList = [];
    let brMakeOfModulatorList = [];
    let brIDModulatorList = [];
    let brIDControllerList = [];
    let brkMakeOfControllerList = [];
    let brkBriefDescOfECUList = [];
    let brkFrontRatioList = [];
    let brkRearRatioList = [];
    let brkCombinedRatioList = [];
    let brkPedalRatioList = [];
    let brkHandLeverRatioList = [];
    let brkNomSizeMasterCylList = [];
    let brkFrontWheelCylDiaList = [];
    let brkRearWheelCylDiaList = [];
    let brkCylMakeList = [];
    let brkRegenerativeBrakeTypeList = [];
    let brkSepControlReGenBrakingList = [];
    let brkOnWhichBrakingList = [];
    let brkParkingBrakingList = [];
    let brkParkingTypeList = [];
    let brkParkingcontrollList = [];
    let brkParkingLockingList = [];
    let brFrictionFrontList = [];
    let brFrictionRearList = [];
    let brServiceFrontControlList = [];
    let brServiceRearControlList = [];
    let brServiceCombinedControlList = [];
    let brDrawingParkingMechanismList = [];
    let brDrawingBrakeShoesList = [];
    brakesList && brakesList.map(vehBrake => {
        if (vehBrake.supplier.active === true) {
            const supplierName = vehBrake?.supplier?.nameOfSupplier;
            brkDrawingList.push({
                supplier: supplierName,
                value: vehBrake?.Brief_Brake_Information?.properties?.Drawing_Braking_System?.value
            });
            brkMakeList.push({
                supplier: supplierName,
                value: vehBrake?.Brief_Brake_Information?.properties?.Make_of_Brake?.value
            });
            brkTypeList.push({
                supplier: supplierName,
                value: vehBrake?.Brief_Brake_Information.properties?.Type_of_Braking_System?.value
            });
            brkSystemNumberFrontList.push({
                supplier: supplierName,
                value: vehBrake?.Brief_Brake_Information?.properties?.Braking_System_Numbers_Front?.value
            });
            brkSystemNumberRearList.push({
                supplier: supplierName,
                value: vehBrake?.Brief_Brake_Information?.properties?.Braking_System_Numbers_Rear?.value
            });            
            brkShoesDiscsMakeList.push({
                supplier: supplierName,
                value: vehBrake?.Brief_Brake_Information?.properties?.Make_of_Brake_Shoes_or_Discs?.value
            });
            brkSelectBreakingMediumList.push({
                supplier: supplierName,
                value: vehBrake?.Brief_Brake_Information?.properties?.Braking_medium_Linkage?.value
            });
            brkLiningPadsList.push({
                supplier: supplierName,
                value: vehBrake?.Parts_of_Brake_System?.properties?.Linings_pads?.value
            });
            brDrawingBrakeShoesList.push({
                supplier: supplierName,
                value: vehBrake?.Parts_of_Brake_System?.properties?.Drawing_Brake_shoes?.value
            });
            brkActuationMethodList.push({
                supplier: supplierName,
                value: vehBrake?.Parts_of_Brake_System?.properties?.Brake_Actuation_method?.value
            });
            brkHydrReserList.push({
                supplier: supplierName,
                value: vehBrake?.Parts_of_Brake_System?.properties?.Hydraulic_Reservoir_Applicable?.value
            });
            brkFrontRearPadsList.push({
                supplier: supplierName,
                value: vehBrake?.Parts_of_Brake_System?.properties?.Front_rear_pads?.value
            });
            brkFrontRearBrakeList.push({
                supplier: supplierName,
                value: vehBrake?.Parts_of_Brake_System?.properties?.Front_rear_braking?.value
            });
            brkDiameterFrontRearDiscList.push({
                supplier: supplierName,
                value: vehBrake?.Parts_of_Brake_System?.properties?.Diameter_front_rear_disc_drum?.value
            });

            brkABSProvidedList.push({
                supplier: supplierName,
                value: vehBrake?.ABS?.properties?.ABS_provided?.value
            });
            brkABSWheelsActingList.push({
                supplier: supplierName,
                value: vehBrake?.ABS?.properties?.wheels_ABS_acting?.value
            });
            brkSensorsList.push({
                supplier: supplierName,
                value: vehBrake?.ABS?.properties?.Sensors_to_detect_wheel_lockup?.value
            });
            brkIDModulatorList.push({
                supplier: supplierName,
                value: vehBrake?.ABS?.properties?.ID_Modulator_Each_wheel?.value
            });
            brkMakeOfABSECUList.push({
                supplier: supplierName,
                value: vehBrake?.ABS?.properties?.Make_of_ABS_ECU?.value
            });
            brkMakeOfControllerList.push({
                supplier: supplierName,
                value: vehBrake?.ABS?.properties?.Make_of_ABS_controller?.value
            });
            brkBriefDescOfECUList.push({
                supplier: supplierName,
                value: vehBrake?.ECU?.properties?.Desc_ECUs_in_braking_system?.value
            });
            brkFrontRatioList.push({
                supplier: supplierName,
                value: vehBrake?.Free_Play_Ratio.properties?.Front_brake_lever?.value
            });
            brkRearRatioList.push({
                supplier: supplierName,
                value: vehBrake?.Free_Play_Ratio?.properties?.Rear_brake_lever?.value
            });
            brkCombinedRatioList.push({
                supplier: supplierName,
                value: vehBrake?.Free_Play_Ratio?.properties?.combined_brake_lever?.value
            });
            brkPedalRatioList.push({
                supplier: supplierName,
                value: vehBrake?.Free_Play_Ratio?.properties?.Brake_Pedal_ratio?.value
            });
            brkHandLeverRatioList.push({
                supplier: supplierName,
                value: vehBrake?.Free_Play_Ratio?.properties?.Hand_Lever_Ratio?.value
            });
            brkNomSizeMasterCylList.push({
                supplier: supplierName,
                value: vehBrake?.Free_Play_Ratio?.properties?.Nominal_Size_master_cylinder?.value
            });
            brkFrontWheelCylDiaList.push({
                supplier: supplierName,
                value: vehBrake?.Wheel_Cylinders?.properties?.Front_Wheel_Cylinder_Dia?.value
            });
            brkRearWheelCylDiaList.push({
                supplier: supplierName,
                value: vehBrake?.Wheel_Cylinders?.properties?.Rear_Wheel_Cylinder_Dia?.value
            });
            brkCylMakeList.push({
                supplier: supplierName,
                value: vehBrake?.Wheel_Cylinders?.properties?.Make_of_Wheel_Cylinders?.value
            });
            brkRegenerativeBrakeTypeList.push({
                supplier: supplierName,
                value: vehBrake?.Re_Generative_Brake?.properties?.Type_of_Regenerative_brake?.value
            });
            brkSepControlReGenBrakingList.push({
                supplier: supplierName,
                value: vehBrake?.Re_Generative_Brake?.properties?.separate_control_regenerative_braking?.value
            });
            brkOnWhichBrakingList.push({
                supplier: supplierName,
                value: vehBrake?.Parking_Brake?.properties?.On_which_wheel_Parking_Brake_is_Acting?.value
            });
            brkParkingBrakingList.push({
                supplier: supplierName,
                value: vehBrake?.Parking_Brake?.properties?.Parking_Brake?.value
            });
            brkParkingTypeList.push({
                supplier: supplierName,
                value: vehBrake?.Parking_Brake?.properties?.Type_parking_brake_Friction_member?.value
            });
            brkParkingcontrollList.push({
                supplier: supplierName,
                value: vehBrake?.Parking_Brake?.properties?.Parking_brake_is_actuated_or_controlled_by?.value
            });
            brkParkingLockingList.push({
                supplier: supplierName,
                value: vehBrake?.Parking_Brake?.properties?.Type_of_locking_device_used_for_parking_brake?.value
            });
            brFrictionFrontList.push({
                supplier: supplierName,
                value: vehBrake?.BrakeTypes?.properties?.friction_front_wheel_brakes?.value
            });
            brFrictionRearList.push({
                supplier: supplierName,
                value: vehBrake?.BrakeTypes?.properties?.friction_rear_wheel_brakes?.value
            });
            brServiceFrontControlList.push({
                supplier: supplierName,
                value: vehBrake?.Service_Brake_Controls?.properties?.Service_front_Brake_control?.value
            });
            brServiceRearControlList.push({
                supplier: supplierName,
                value: vehBrake?.Service_Brake_Controls?.properties?.Service_rear_Brake_control?.value
            });
            brServiceCombinedControlList.push({
                supplier: supplierName,
                value: vehBrake?.Service_Brake_Controls?.properties?.Service_combined_Brake_control?.value
            });
            brDrawingParkingMechanismList.push({
                supplier: supplierName,
                value: vehBrake?.Drawing?.properties?.Drawing_parking_brake_and_mechanism?.value
            });
            brMakeOfModulatorList.push({
                supplier: supplierName,
                value: vehBrake?.ABS?.properties?.ABS_Modulator_front_Rear_Wheel?.value
            });
            brIDModulatorList.push({
                supplier: supplierName,
                value: vehBrake?.ABS?.properties?.ID_Modulator_Each_wheel?.value
            });
            brIDControllerList.push({
                supplier: supplierName,
                value: vehBrake?.ABS?.properties?.ID_ABS_Controller?.value
            });

        }
    });
    // let brkDrawingRows = generateTableData(brkDrawingList);
    let brkMakeRows = generateTableData(brkMakeList);
    const updatedbrkMakeRows= normalizeMsPrefix(brkMakeRows);
    let brkTypeRows = generateTableData(brkTypeList);
    let brkSystemNumberFrontRows = generateTableData(brkSystemNumberFrontList);
    let brkSystemNumberRearRows = generateTableData(brkSystemNumberRearList);

    let brkSystemNumberCombined = `${brkSystemNumberFrontRows},${brkSystemNumberRearRows}`;
// console.log("Combined:", brkSystemNumberCombined);
    let brkShoesDiscsMakeRows = generateTableData(brkShoesDiscsMakeList);
    const updatedbrkShoesDiscsMakeRows= normalizeMsPrefix(brkShoesDiscsMakeRows);
    let brkLiningPadsRows = generateTableData(brkLiningPadsList);
    let brkActuationMethodRows = generateTableData(brkActuationMethodList);
    let brkHydrReserRows = generateTableData(brkHydrReserList);
    let brkFrontRearPadsRows = generateTableData(brkFrontRearPadsList);
    let brkFrontRearBrakeRows1 = generateTableData(brkFrontRearBrakeList);
     let brkFrontRearBrakeRows = normalizeWithTwoUnits(brkFrontRearBrakeRows1, CM_SQ,CM_SQ);
    // let brkFrontRearBrakeRows = normalizeWithUnit(brkFrontRearBrakeRows1, CM_SQ);
    let brkDiameterFrontRearDiscRows1 = generateTableData(brkDiameterFrontRearDiscList);
    let brkDiameterFrontRearDiscRows = normalizeWithTwoUnits(brkDiameterFrontRearDiscRows1, MM,MM);
    // let brkDiameterFrontRearDiscRows = normalizeWithUnit(brkDiameterFrontRearDiscRows1, MM);
    let brkABSProvidedRows = generateTableData(brkABSProvidedList);
    let brkABSWheelsActingRows = generateTableData(brkABSWheelsActingList);
    // const updatedbrkABSWheelsActingRows = normalizeMsPrefix(brkABSWheelsActingRows);
    let brkSensorsRows = generateTableData(brkSensorsList);
    const updatedbrkSensorsRows = normalizeMsPrefix(brkSensorsRows);
    let brkIDModulatorRows = generateTableData(brkIDModulatorList);
    let brkMakeOfABSECURows = generateTableData(brkMakeOfABSECUList);
    const updatedbbrkMakeOfABSECURows= normalizeMsPrefix(brkMakeOfABSECURows);
    let brkMakeOfControllerRows = generateTableData(brkMakeOfControllerList);
    const updatedbbrkMakeOfControllerRows= normalizeMsPrefix(brkMakeOfControllerRows);
    let brkBriefDescOfECURows = generateTableData(brkBriefDescOfECUList);
    let brkFrontRatioRows = generateTableData(brkFrontRatioList);
    let brkRearRatioRows = generateTableData(brkRearRatioList);
    let brkCombinedRatioRows = generateTableData(brkCombinedRatioList);
    let brkPedalRatioRows = generateTableData(brkPedalRatioList);
    let brkHandLeverRatioRows = generateTableData(brkHandLeverRatioList);
    let brkNomSizeMasterCylRows = generateTableData(brkNomSizeMasterCylList);
    let brkFrontWheelCylDiaRows = generateTableData(brkFrontWheelCylDiaList);
    // const updatedbrkFrontWheelCylDiaRows = normalizeMsPrefix(brkFrontWheelCylDiaRows);
    let brkRearWheelCylDiaRows = generateTableData(brkRearWheelCylDiaList);
    let brkCylMakeRows = generateTableData(brkCylMakeList);
    const updatedbbrkCylMakeRows = normalizeMsPrefix(brkCylMakeRows);
    let brkParkingBrakeTypeRows = generateTableData(brkRegenerativeBrakeTypeList);
    let brkSepControlReGenBrakingRows = generateTableData(brkSepControlReGenBrakingList);
    let brkOnWhichBrakingRows = generateTableData(brkOnWhichBrakingList);
    let brkParkingBrakingRows = generateTableData(brkParkingBrakingList);
    let brkParkingTypeRows = generateTableData(brkParkingTypeList);
    let brkParkingcontrollRows = generateTableData(brkParkingcontrollList);
    let brkParkingLockingRows = generateTableData(brkParkingLockingList);
    let brFrictionFrontRows = generateTableData(brFrictionFrontList);
    let brFrictionRearRows = generateTableData(brFrictionRearList);
    let brServiceFrontControlRows = generateTableData(brServiceFrontControlList);
    let brServiceRearControlRows = generateTableData(brServiceRearControlList);
    let brServiceCombinedControlRows = generateTableData(brServiceCombinedControlList);
    // let brDrawingParkingMechanismRows = generateTableData(brDrawingParkingMechanismList);
    let brMakeOfModulatorRows = generateTableData(brMakeOfModulatorList);
    const updatedbrMakeOfModulatorRows = normalizeMsPrefix(brMakeOfModulatorRows);
    // let brIDModulatorRows = generateTableData(brIDModulatorList);
    let brIDControllerRows = generateTableData(brIDControllerList);
    let brkSelectBreakingMediumRows = generateTableData(brkSelectBreakingMediumList);
    let brDrawingBrakeShoesRows = generateTableData(brDrawingBrakeShoesList);
    allTablesData.push({
        rowKey: "List2_61",
        value: brkDrawingRows
    });
    allTablesData.push({
        rowKey: "List2_611",
        value: updatedbrkMakeRows
    });
    allTablesData.push({
        rowKey: "List2_612",
        value: brkTypeRows
    });
    allTablesData.push({
        rowKey: "List2_62",
        value: brkSystemNumberCombined
    });
    allTablesData.push({
        rowKey: "List2_621",
        value: updatedbrkShoesDiscsMakeRows
    });
    allTablesData.push({
        rowKey: "List2_631",
        value: brDrawingBrakeShoesRows
    });
    allTablesData.push({
        rowKey: "List2_632",
        value: brkLiningPadsRows
    });
    allTablesData.push({
        rowKey: "List2_633",
        value: brkActuationMethodRows
    });
    allTablesData.push({
        rowKey: "List2_634",
        value: brkHydrReserRows
    });
    allTablesData.push({
        rowKey: "List2_635",
        value: brkFrontRearPadsRows
    });
    allTablesData.push({
        rowKey: "List2_636",
        value: brkFrontRearBrakeRows
    });
    allTablesData.push({
        rowKey: "List2_637",
        value: brkDiameterFrontRearDiscRows
    });
    allTablesData.push({
        rowKey: "List2_638",
        value: brkABSProvidedRows
    });
    allTablesData.push({
        rowKey: "List2_6381",
        value: brkABSWheelsActingRows
    });
    allTablesData.push({
        rowKey: "List2_6382",
        value: updatedbrkSensorsRows
    });
    allTablesData.push({
        rowKey: "List2_63821",
        // value: brkIDModulatorRows   
        value: sensor_Rows
    });
    allTablesData.push({
        rowKey: "List2_6384",
        value: updatedbbrkMakeOfABSECURows
    });
    allTablesData.push({
        rowKey: "List2_63841",
        value: updatedbbrkMakeOfControllerRows
    });
    allTablesData.push({
        rowKey: "List2_65",
        value: brkBriefDescOfECURows
    });
    allTablesData.push({
        rowKey: "List2_61041",
        value: brkFrontRatioRows
    });
    allTablesData.push({
        rowKey: "List2_61042",
        value: brkRearRatioRows
    });
    allTablesData.push({
        rowKey: "List2_61043",
        value: brkCombinedRatioRows
    });
    /*
   Adding a space in `rowKey` for `brkPedalRatioRows` and `brkHandLeverRatioRows`
   due to a conflict between sections 6.1.1 and 6.11 in list2 file.
   This ensures unique identifiers and prevents overlap.
*/
    allTablesData.push({
        rowKey: "List2_611 ",
        value: brkPedalRatioRows
    });
    allTablesData.push({
        rowKey: "List2_612 ",
        value: brkHandLeverRatioRows
    });
    allTablesData.push({
        rowKey: "List2_613",
        value: brkNomSizeMasterCylRows
    });
    allTablesData.push({
        rowKey: "List2_6141",
        value: brkFrontWheelCylDiaRows
    });
    allTablesData.push({
        rowKey: "List2_6142",
        value: brkRearWheelCylDiaRows
    });
    allTablesData.push({
        rowKey: "List2_6143",
        value: updatedbbrkCylMakeRows
    });
    allTablesData.push({
        rowKey: "List2_6161",
        value: brkParkingBrakeTypeRows
    });
    allTablesData.push({
        rowKey: "List2_6162",
        value: brkSepControlReGenBrakingRows
    });
    allTablesData.push({
        rowKey: "List2_615",
        value: brkParkingBrakingRows
    });
    allTablesData.push({
        rowKey: "List2_6151",
        value: brkOnWhichBrakingRows
    });
    allTablesData.push({
        rowKey: "List2_6152",
        value: brkParkingTypeRows
    });
    allTablesData.push({
        rowKey: "List2_6153",
        value: brkParkingcontrollRows
    });
    allTablesData.push({
        rowKey: "List2_6154",
        value: brkParkingLockingRows
    });
    allTablesData.push({
        rowKey: "List2_681",
        value: "NA"
    });
    allTablesData.push({
        rowKey: "List2_682",
        value: "NA"
    });
    allTablesData.push({
        rowKey: "List2_691",
        value: brFrictionFrontRows
    });
    allTablesData.push({
        rowKey: "List2_692",
        value: brFrictionRearRows
    });
    allTablesData.push({
        rowKey: "List2_693",
        value: "NA"
    });
    allTablesData.push({
        rowKey: "List2_6101",
        value: brServiceFrontControlRows
    });
    allTablesData.push({
        rowKey: "List2_6102",
        value: brServiceRearControlRows
    });
    allTablesData.push({
        rowKey: "List2_6103",
        value: brServiceCombinedControlRows
    });
    allTablesData.push({
        rowKey: "List2_64",
        value: brDrawingParkingMechanismRows
    });
    allTablesData.push({
        rowKey: "List2_6383",
        value: updatedbrMakeOfModulatorRows
    });
    allTablesData.push({
        rowKey: "List2_63831",
        value: brIDModulatorRows
    });
    allTablesData.push({
        rowKey: "List2_6385",
        value: brIDControllerRows
    });

    allTablesData.push({
        rowKey: "List2_622",
        value: brkSelectBreakingMediumRows
    });


    const DaytimeRunningList = form1AData?.Daytime_Running_Lamp?.DaytimeRunningLamp;
// console.log('DaytimeRunningList:',DaytimeRunningList);
    // Arrays for Daytime Running Lamp (regular)
    let drlMakeList = [];
    let drlTACNumberList = [];
    let drlNumberColourList = [];
    
    // Arrays for Daytime Running Lamp LED
    let drlLedMakeList = [];
    let drlLedTACNumberList = [];
    let drlLedNumberColourList = [];
    
    // Iterate over the DaytimeRunningList
    DaytimeRunningList && DaytimeRunningList.map((vehDaytimeRunning) => {
      if (vehDaytimeRunning.supplier.active === true) {
        // For Daytime Running Lamp
        drlMakeList.push({
          
          value:
            vehDaytimeRunning?.Daytime_Running_Lamp?.properties?.Make?.value,
        });
    
        drlTACNumberList.push({
        
          value:
            vehDaytimeRunning?.Daytime_Running_Lamp?.properties?.TAC_Num_Reverse_lamp?.value,
        });
    
        drlNumberColourList.push({
         
          value:
            vehDaytimeRunning?.Daytime_Running_Lamp?.properties?.Number_Colour_of_light?.value,
        });
    
        // For Daytime Running Lamp LED
        drlLedMakeList.push({
        
          value:
            vehDaytimeRunning?.Daytime_Running_Lamp_Led?.properties?.Make1?.value,
        });
    
        drlLedTACNumberList.push({
        
          value:
            vehDaytimeRunning?.Daytime_Running_Lamp_Led?.properties?.TAC_Num_Reverse_lamp1?.value,
        });
    
        drlLedNumberColourList.push({
       
          value:
            vehDaytimeRunning?.Daytime_Running_Lamp_Led?.properties?.Number_Colour_of_light1?.value,
        });
      }
    });
    
    // Generate table data
    let drlMakeRows = generateTableData(drlMakeList);
    let normalizedDrlMakeRows = normalizeMsPrefix(drlMakeRows);
    // console.log('normalizedDrlMakeRows:',normalizedDrlMakeRows)
    let drlTACNumberRows = generateTableData(drlTACNumberList);
    // console.log('drlTACNumberRows:',drlTACNumberRows)
    let drlNumberColourRows = generateTableData(drlNumberColourList);
    // console.log('drlNumberColourRows:',drlNumberColourRows)
    let drlLedMakeRows = generateTableData(drlLedMakeList);
    let normalizedDrlLedMakeRows = normalizeMsPrefix(drlLedMakeRows);
    
    let drlLedTACNumberRows = generateTableData(drlLedTACNumberList);
    let drlLedNumberColourRows = generateTableData(drlLedNumberColourList);
    // console.log('drlLedNumberColourRows:',drlLedNumberColourRows)

    allTablesData.push({
        rowKey: "List2_71111",
        value: normalizedDrlLedMakeRows
    });
    allTablesData.push({
        rowKey: "List2_71112",
        value: drlLedTACNumberRows
    });
    allTablesData.push({
        rowKey: "List2_71113",
        value: drlLedNumberColourRows
    });
    allTablesData.push({
        rowKey: "List2_75131",
        value: normalizedDrlMakeRows
    });
    allTablesData.push({
        rowKey: "List2_75132",
        value: drlTACNumberRows
    });
    allTablesData.push({
        rowKey: "List2_75133",
        value: drlNumberColourRows
    });


    const lightingList = form1AData?.Ligthing_Signaling?.LigthingSignaling;
    let alldevicesList = [];
    const headLampList = form1AData.Head_Lamp.HeadLamp;
    let hlMakeList = [];
    let hlTypeOfLensList = [];
    let hlTACNumberList = [];
    let hlNumberColorOfLightList = [];
    let hlDippedBeamMakeList = [];
    let hlDippedBeamTypeList = [];
    let hlDippedBeamTACNumberList = [];
    let hlDippedBeamNumberColorOfLightList = [];
    const positionLampsList = form1AData?.Position_Lamps?.PositionLamps;
    let fpLampMakeList = [];
    let fpTACNumberList = [];
    let fpNumberColorOfLightList = [];
    let fplMakeList = [];
    let fplTACNumberList = [];
    let fplNumberColorOfLightList = [];
    let slMakeList = [];
    let slTACNumberList = [];
    let slNumberColorOfLightList = [];
    const regPlateLampList = form1AData?.Rear_Registration_Plate?.RearRegistrationPlate;
    let rrpMakeList = [];
    let rrpTACNumberList = [];
    let rrpNumberColorofLightList = [];
    const dirIndLampList = form1AData?.Direction_Indicator_Lamp?.DirectionIndicatorLamp;
    let fdlMakeList = [];
    let fdlTACNumberList = [];
    let fdlNumberColorOfLightList = [];
    let rdlMakeList = [];
    let rdlTACNumberList = [];
    let rdlNumberColorOfLightList = [];
    let sdlMakeList = [];
    let sdlTACNumberList = [];
    let sdlNumberColorOfLightList = [];
    let sdlFlashedMakeList = [];
    let sdlFashFreqList = [];
    let hlBulbMakeList = [];
    let hlBulbCategoryList = [];
    let hlBulbTACNumberList = [];
    let dbMakeList = [];
    let dbCategoryList = [];
    let dbTACNumberList = [];
    let dbAdditionalList = [];
    let dbBriefDescList = [];
    let dbListOFBulbList = [];

    let fplBulbMakeList = [];
    let fplBulbCategoryList = [];
    let fplBulbTACNumberList = [];
    let slBulbMakeList = [];
    let slBulbCategoryList = [];
    let slBulbTACNumberList = [];
    let npBulbMakeList = [];
    let npBulbCategoryList = [];
    let npBulbTACNumberList = [];
    let dilBulbFrontMakeList = [];
    let dilBulbFrontCategoryList = [];
    let dilBulbFrontTACNumberList = [];
    let dilBulbRearMakeList = [];
    let dilBulbRearCategoryList = [];
    let dilBulbRearTACNumberList = [];
    let dilBulbRearFlashedDirList = [];
    let dilBulbRearFlashFreqList = [];
    let plBulbFrontMakeList = [];
    let plBulbFrontCategoryList = [];
    let plBulbFrontTACNumberList = [];
    let plBulbRearMakeList = [];
    let plBulbRearCategoryList = [];
    let plBulbRearTACNumberList = [];

    let RPBulbRearMakeList = [];
    let RPBulbRearCategoryList = [];
    let RPBulbRearTACNumberList = [];

 let plLedbRearMakeList = [];
    let plLedRearCategoryList = [];
    let plLedRearTACNumberList = [];
    let RPLedbRearMakeList = [];
    let RPLedRearCategoryList = [];
    let RPLedRearTACNumberList = [];
    lightingList && lightingList.map(vehLighting => {
        if (vehLighting.supplier.active === true) {
            const supplierName = vehLighting?.supplier?.nameOfSupplier;
            alldevicesList.push({
                supplier: supplierName,
                value: vehLighting?.Headline?.properties?.Lighting_signaling_devices?.value
            });
        }
    });
    headLampList && headLampList.map(vehHeadLamp => {
        if (vehHeadLamp.supplier.active === true) {
            const supplierName = vehHeadLamp?.supplier?.nameOfSupplier;
            hlMakeList.push({
                supplier: supplierName,
                value: vehHeadLamp?.Main_Beam_Head_Lamp?.properties?.Main_Beam_Head_Lamp_make?.value
            });
            hlTypeOfLensList.push({
                supplier: supplierName,
                value: vehHeadLamp?.Main_Beam_Head_Lamp?.properties?.Select_Type_led_head_lamp?.value
            });
            hlTACNumberList.push({
                supplier: supplierName,
                value: vehHeadLamp?.Main_Beam_Head_Lamp?.properties?.TAC_Number?.value
            });
            hlNumberColorOfLightList.push({
                supplier: supplierName,
                value: vehHeadLamp?.Main_Beam_Head_Lamp?.properties?.Number_of_beam_lights_and_Colour_of_light?.value
            });
            hlDippedBeamMakeList.push({
                supplier: supplierName,
                value: vehHeadLamp?.Dipped_Beam_Headlamp_LED_Type?.properties?.Make_of_dipped_beam_head_lamp?.value
            });
            hlDippedBeamTypeList.push({
                supplier: supplierName,
                value: vehHeadLamp?.Dipped_Beam_Headlamp_LED_Type?.properties?.Select_Type_led_dipped_beam_headlamp?.value
            });
            hlDippedBeamTACNumberList.push({
                supplier: supplierName,
                value: vehHeadLamp?.Dipped_Beam_Headlamp_LED_Type?.properties?.TAC_Number?.value
            });
            hlDippedBeamNumberColorOfLightList.push({
                supplier: supplierName,
                value: vehHeadLamp?.Dipped_Beam_Headlamp_LED_Type?.properties?.Number_and_Colour_of_light?.value
            });
            hlBulbMakeList.push({
                supplier: supplierName,
                value: vehHeadLamp?.Main_Beam_Headlamp_Filament_Type?.properties?.Make_of_main_beam_bulb?.value
            });
            hlBulbCategoryList.push({
                supplier: supplierName,
                value: vehHeadLamp?.Main_Beam_Headlamp_Filament_Type?.properties?.Category_bulb_per_AIS034?.value
            });
            hlBulbTACNumberList.push({
                supplier: supplierName,
                value: vehHeadLamp?.Main_Beam_Headlamp_Filament_Type?.properties?.TAC_Number_Main_beam_headlamp_bulb?.value
            });
            dbMakeList.push({
                supplier: supplierName,
                value: vehHeadLamp?.Dipped_Beam_Headlamp_Filament_Type?.properties?.Make_of_dipped_beam_head_lamp?.value
            });
            dbCategoryList.push({
                supplier: supplierName,
                value: vehHeadLamp?.Dipped_Beam_Headlamp_Filament_Type?.properties?.Category_per_AIS034?.value
            });
            dbTACNumberList.push({
                supplier: supplierName,
                value: vehHeadLamp?.Dipped_Beam_Headlamp_Filament_Type?.properties?.TAC_Number?.value
            });
            dbAdditionalList.push({
                supplier: supplierName,
                value: vehHeadLamp?.Dipped_Beam_Headlamp_Filament_Type?.properties?.Additional_Req?.value
            });
            dbBriefDescList.push({
                supplier: supplierName,
                value: vehHeadLamp?.Dipped_Beam_Headlamp_Filament_Type?.properties?.Brief_Desc?.value
            });
            dbListOFBulbList.push({
                supplier: supplierName,
                value: vehHeadLamp?.Dipped_Beam_Headlamp_Filament_Type?.properties?.List_Of_All_Bulbs?.value
            });
        }
    });

    positionLampsList && positionLampsList.map(vehPosLamp => {
        if (vehPosLamp.supplier.active === true) {
            const supplierName = vehPosLamp?.supplier?.nameOfSupplier;
            fpLampMakeList.push({
                supplier: supplierName,
                value: vehPosLamp?.Front_Position_Lamp_LED_Type?.properties?.Make_of_front_Position_lamp?.value
            });
            fpTACNumberList.push({
                supplier: supplierName,
                value: vehPosLamp?.Front_Position_Lamp_LED_Type?.properties?.TAC_Number_of_Front_Position_Lamp?.value
            });
            fpNumberColorOfLightList.push({
                supplier: supplierName,
                value: vehPosLamp?.Front_Position_Lamp_LED_Type.properties?.Number_of_Front_Position_lamps_and_Colour_of_light?.value
            });
            fplMakeList.push({
                supplier: supplierName,
                value: vehPosLamp?.Front_Parking_Lamp_LED_Type?.properties?.Make_of_Front_Parking_Lamp?.value
            });
            fplTACNumberList.push({
                supplier: supplierName,
                value: vehPosLamp?.Front_Parking_Lamp_LED_Type.properties?.TAC_No_Front_Parking_lamp?.value
            });
            fplNumberColorOfLightList.push({
                supplier: supplierName,
                value: vehPosLamp?.Front_Parking_Lamp_LED_Type?.properties?.Number_of_Front_parking_lamps_and_their_colour?.value
            });
            slMakeList.push({
                supplier: supplierName,
                value: vehPosLamp?.Stop_Lamp_LED_Type?.properties?.Make_of_Stop_lamp?.value
            });
            slTACNumberList.push({
                supplier: supplierName,
                value: vehPosLamp?.Stop_Lamp_LED_Type?.properties?.TAC_Number?.value
            });
            slNumberColorOfLightList.push({
                supplier: supplierName,
                value: vehPosLamp?.Stop_Lamp_LED_Type?.properties?.Number_of_Stop_lamps_installed_and_Colour_of_light?.value
            });
            fplBulbMakeList.push({
                supplier: supplierName,
                value: vehPosLamp?.Front_Position_Lamp_Bulb_Type?.properties?.Make_of_Front_Position_Lamp?.value
            });
            fplBulbCategoryList.push({
                supplier: supplierName,
                value: vehPosLamp?.Front_Position_Lamp_Bulb_Type?.properties?.Category_as_per_AIS034?.value
            });
            fplBulbTACNumberList.push({
                supplier: supplierName,
                value: vehPosLamp?.Front_Position_Lamp_Bulb_Type?.properties?.TAC_Number_of_Front_Position_Lamp?.value
            });
            slBulbMakeList.push({
                supplier: supplierName,
                value: vehPosLamp?.Stop_Lamp_bulb_Type?.properties?.Make_of_Stop_lamp_bulb?.value
            });
            slBulbCategoryList.push({
                supplier: supplierName,
                value: vehPosLamp?.Stop_Lamp_bulb_Type.properties?.Category_as_per_AIS035?.value
            });
            slBulbTACNumberList.push({
                supplier: supplierName,
                value: vehPosLamp?.Stop_Lamp_bulb_Type?.properties?.TAC_Number?.value
            });
            plBulbFrontMakeList.push({
                supplier: supplierName,
                value: vehPosLamp?.Front_Parking_Lamp_Bulb_type?.properties?.Make_of_Front_parking_lamp_bulb?.value
            });
            plBulbFrontCategoryList.push({
                supplier: supplierName,
                value: vehPosLamp?.Front_Parking_Lamp_Bulb_type?.properties?.Category_as_per_AIS_035?.value
            });
            plBulbFrontTACNumberList.push({
                supplier: supplierName,
                value: vehPosLamp?.Front_Parking_Lamp_Bulb_type?.properties?.TAC_No_Front_Parking_lamp?.value
            });
            plBulbRearMakeList.push({
                supplier: supplierName,
                value: vehPosLamp?.Parking_Lamp_Bulb_Rear?.properties?.Make_of_Parking_lamp_bulb_rear?.value
            });
            plBulbRearCategoryList.push({
                supplier: supplierName,
                value: vehPosLamp?.Parking_Lamp_Bulb_Rear?.properties?.Category_as_per_AIS035?.value
            });
            plBulbRearTACNumberList.push({
                supplier: supplierName,
                value: vehPosLamp?.Parking_Lamp_Bulb_Rear?.properties?.TAC_Number?.value
            });


            RPBulbRearMakeList.push({
                supplier: supplierName,
                value: vehPosLamp?.Rear_Position_Lamp_Bulb_Type?.properties?.Make_of_Rear_Position_Lamp?.value
            });
            RPBulbRearCategoryList.push({
                supplier: supplierName,
                value: vehPosLamp?.Rear_Position_Lamp_Bulb_Type?.properties?.Category_as_per_AIS034?.value
            });
            RPBulbRearTACNumberList.push({
                supplier: supplierName,
                value: vehPosLamp?.Rear_Position_Lamp_Bulb_Type?.properties?.TAC_Number_of_Rear_Position_Lamp?.value
            });

            plLedbRearMakeList.push({
                supplier: supplierName,
                value: vehPosLamp?.Rear_Position_Lamp_LED_Type?.properties?.Make_of_front_Position_lamp?.value
            });
            plLedRearCategoryList.push({
                supplier: supplierName,
                value: vehPosLamp?.Rear_Position_Lamp_LED_Type?.properties?.Category_as_per_AIS035?.value
            });
            plLedRearTACNumberList.push({
                supplier: supplierName,
                value: vehPosLamp?.Rear_Position_Lamp_LED_Type?.properties?.TAC_Number_of_Rear_Position_Lamp?.value
            });


            RPLedbRearMakeList.push({
                supplier: supplierName,
                value: vehPosLamp?.Rear_Position_Lamp_LED_Type?.properties?.Make_of_front_Position_lamp?.value
            });
            RPLedRearCategoryList.push({
                supplier: supplierName,
                value: vehPosLamp?.Rear_Position_Lamp_LED_Type?.properties?.Number_of_Rear_Position_lamps_and_Colour_of_light?.value
            });
            RPLedRearTACNumberList.push({
                supplier: supplierName,
                value: vehPosLamp?.Rear_Position_Lamp_LED_Type?.properties?.TAC_Number_of_Rear_Position_Lamp?.value
            });
        }
    });
    regPlateLampList && regPlateLampList.map(vehRegPlateLamp => {
        if (vehRegPlateLamp.supplier.active === true) {
            const supplierName = vehRegPlateLamp?.supplier?.nameOfSupplier;
            rrpMakeList.push({
                supplier: supplierName,
                value: vehRegPlateLamp?.Registration_Plate_Lamp_LED_Type?.properties?.Make_Rear_Reg_Plate_Lamp?.value
            });
            rrpTACNumberList.push({
                supplier: supplierName,
                value: vehRegPlateLamp?.Registration_Plate_Lamp_LED_Type.properties?.TAC_Rear_Reg_Plate_Lamp?.value
            });
            rrpNumberColorofLightList.push({
                supplier: supplierName,
                value: vehRegPlateLamp?.Registration_Plate_Lamp_LED_Type?.properties?.Number_and_Colour_light?.value
            });
            npBulbMakeList.push({
                supplier: supplierName,
                value: vehRegPlateLamp?.Registration_Plate_Lamp_bulb_type?.properties?.Make_Number_Plate_Lamp_Bulb?.value
            });
            npBulbCategoryList.push({
                supplier: supplierName,
                value: vehRegPlateLamp?.Registration_Plate_Lamp_bulb_type?.properties?.Category_per_AIS_035?.value
            });
            npBulbTACNumberList.push({
                supplier: supplierName,
                value: vehRegPlateLamp?.Registration_Plate_Lamp_bulb_type?.properties?.TAC_Number_Plate_Lamp_Bulb?.value
            });
        }
    });
    dirIndLampList && dirIndLampList.map(vehDirIndLamp => {
        if (vehDirIndLamp.supplier.active === true) {
            const supplierName = vehDirIndLamp?.supplier?.nameOfSupplier;
            fdlMakeList.push({
                supplier: supplierName,
                value: vehDirIndLamp?.Front_Dir_Indicator_LED_Type?.properties?.Make_Front_Direction_Indicator?.value
            });
            fdlTACNumberList.push({
                supplier: supplierName,
                value: vehDirIndLamp?.Front_Dir_Indicator_LED_Type?.properties?.TAC_Num_Front_Direction_Indicator?.value
            });
            fdlNumberColorOfLightList.push({
                supplier: supplierName,
                value: vehDirIndLamp?.Front_Dir_Indicator_LED_Type?.properties?.Front_Dir_Indiactors_colors?.value
            });
            rdlMakeList.push({
                supplier: supplierName,
                value: vehDirIndLamp?.Rear_Direction_Indicator_LED_Type?.properties?.Make_Front_Direction_Indicator?.value
            });
            rdlTACNumberList.push({
                supplier: supplierName,
                value: vehDirIndLamp?.Rear_Direction_Indicator_LED_Type?.properties?.TAC_Front_Direction_Indicator?.value
            });
            rdlNumberColorOfLightList.push({
                supplier: supplierName,
                value: vehDirIndLamp?.Rear_Direction_Indicator_LED_Type?.properties?.Number_and_Colour_of_light?.value
            });
            sdlMakeList.push({
                supplier: supplierName,
                value: vehDirIndLamp?.Side_Direction_Indicator?.properties?.Make_Side_Direction_Indicator?.value
            });
            sdlTACNumberList.push({
                supplier: supplierName,
                value: vehDirIndLamp?.Side_Direction_Indicator?.properties?.TAC_Num_Side_Direc_Indiacator?.value
            });
            sdlNumberColorOfLightList.push({
                supplier: supplierName,
                value: vehDirIndLamp?.Side_Direction_Indicator?.properties?.Num_and_Colour_light?.value
            });
            sdlFlashedMakeList.push({
                supplier: supplierName,
                value: vehDirIndLamp?.Side_Direction_Indicator?.properties?.Make_Flasher_Direc_Indicators?.value
            });
            sdlFashFreqList.push({
                supplier: supplierName,
                value: vehDirIndLamp?.Side_Direction_Indicator?.properties?.Flashing_Freq_direc_indicator?.value
            });
            dilBulbFrontMakeList.push({
                supplier: supplierName,
                value: vehDirIndLamp?.Front_Dir_indicator_Bulb_Type?.properties?.Make_Front_Dir_Indicators?.value
            });
            dilBulbFrontCategoryList.push({
                supplier: supplierName,
                value: vehDirIndLamp?.Front_Dir_indicator_Bulb_Type?.properties?.Category_per_AIS_035?.value
            });
            dilBulbFrontTACNumberList.push({
                supplier: supplierName,
                value: vehDirIndLamp?.Front_Dir_indicator_Bulb_Type?.properties?.TAC_Dir_Indicator?.value
            });
            dilBulbRearMakeList.push({
                supplier: supplierName,
                value: vehDirIndLamp?.Rear_Direction_Indicator_Bulb_Type?.properties?.Make.value
            });
            dilBulbRearCategoryList.push({
                supplier: supplierName,
                value: vehDirIndLamp?.Rear_Direction_Indicator_Bulb_Type?.properties?.Category_per_AIS_035?.value
            });
            dilBulbRearTACNumberList.push({
                supplier: supplierName,
                value: vehDirIndLamp?.Rear_Direction_Indicator_Bulb_Type?.properties?.TAC_BIS_License_E_Marking_no?.value
            });
            dilBulbRearFlashedDirList.push({
                supplier: supplierName,
                value: vehDirIndLamp?.Rear_Direction_Indicator_Bulb_Type?.properties?.Flasher_Direc_Indicators?.value
            });
            dilBulbRearFlashFreqList.push({
                supplier: supplierName,
                value: vehDirIndLamp?.Rear_Direction_Indicator_Bulb_Type?.properties?.Flashing_Frequency?.value
            });
        }
    });
    let alldevicesRows = generateTableData(alldevicesList);
    let hlMakeRows = generateTableData(hlMakeList);
    const updatedhlMakeRows = normalizeMsPrefix(hlMakeRows);
    // console.log('updatedhlMakeRows 71111:',updatedhlMakeRows);
    let hlTypeOfLensRows = generateTableData(hlTypeOfLensList);
    let hlTACNumberRows = generateTableData(hlTACNumberList);
    let hlNumberColorOfLightRows = generateTableData(hlNumberColorOfLightList);
    let hlDippedBeamMakeRows = generateTableData(hlDippedBeamMakeList);
    const updatedhlDippedBeamMakeRows = normalizeMsPrefix(hlDippedBeamMakeRows);
    let hlDippedBeamTypeRows = generateTableData(hlDippedBeamTypeList);
    let hlDippedBeamTACNumberRows = generateTableData(hlDippedBeamTACNumberList);
    let hlDippedBeamNumberColorOfLightRows = generateTableData(hlDippedBeamNumberColorOfLightList);
    let fpLampMakeRows = generateTableData(fpLampMakeList);
    const updatedfpLampMakeRows = normalizeMsPrefix(fpLampMakeRows);
    let fpTACNumberRows = generateTableData(fpTACNumberList);
    let fpNumberColorOfLightRows = generateTableData(fpNumberColorOfLightList);
    let fplMakeRows = generateTableData(fplMakeList);
    const updatedfplMakeRows = normalizeMsPrefix(fplMakeRows);
    let fplTACNumberRows = generateTableData(fplTACNumberList);
    let fplNumberColorOfLightRows = generateTableData(fplNumberColorOfLightList);
    let slMakeRows = generateTableData(slMakeList);
    const updatedslMakeRows = normalizeMsPrefix(slMakeRows);
    let slTACNumberRows = generateTableData(slTACNumberList);
    let slNumberColorOfLightRows = generateTableData(slNumberColorOfLightList);
    let rrpMakeRows = generateTableData(rrpMakeList);
    
    const updatedRrpMakeRow = normalizeMsPrefix(rrpMakeRows);

    let rrpTACNumberRows = generateTableData(rrpTACNumberList);
    let rrpNumberColorofLightRows = generateTableData(rrpNumberColorofLightList);
    let fdlMakeRows = generateTableData(fdlMakeList);
    const updatedfdlMakeRows = normalizeMsPrefix(fdlMakeRows);
    let fdlTACNumberRows = generateTableData(fdlTACNumberList);
    let fdlNumberColorOfLightRows = generateTableData(fdlNumberColorOfLightList);
    let rdlMakeRows = generateTableData(rdlMakeList);
    const updatedrdlMakeRows = normalizeMsPrefix(rdlMakeRows);
    let rdlTACNumberRows = generateTableData(rdlTACNumberList);
    let rdlNumberColorOfLightRows = generateTableData(rdlNumberColorOfLightList);
    let sdlMakeRows = generateTableData(sdlMakeList);
    const updatedsdlMakeRows = normalizeMsPrefix(sdlMakeRows);
    let sdlTACNumberRows = generateTableData(sdlTACNumberList);
    let sdlNumberColorOfLightRows = generateTableData(sdlNumberColorOfLightList);
    let sdlFlashedMakeRows = generateTableData(sdlFlashedMakeList);
    const updatedsdlFlashedMakeRows = normalizeMsPrefix(sdlFlashedMakeRows);
    let sdlFashFreqRows = generateTableData(sdlFashFreqList);
    let hlBulbMakeRows = generateTableData(hlBulbMakeList);
    const updatedhlBulbMakeRows = normalizeMsPrefix(hlBulbMakeRows);
    let hlBulbCategoryRows = generateTableData(hlBulbCategoryList);
    let hlBulbTACNumberRows = generateTableData(hlBulbTACNumberList);
    let dbMakeRows = generateTableData(dbMakeList);
    const updateddbMakeRows = normalizeMsPrefix(dbMakeRows);
    let dbCategoryRows = generateTableData(dbCategoryList);
    let dbTACNumberRows = generateTableData(dbTACNumberList);
    let dbAdditionalRows = generateTableData(dbAdditionalList);
    let dbBriefDescRows = generateTableData(dbBriefDescList);
    let dbListOFBulbRows = generateTableData(dbListOFBulbList);
    let fplBulbMakeRows = generateTableData(fplBulbMakeList);
    const updatedfplBulbMakeRows = normalizeMsPrefix(fplBulbMakeRows);
    let fplBulbCategoryRows = generateTableData(fplBulbCategoryList);
    let fplBulbTACNumberRows = generateTableData(fplBulbTACNumberList);
    let slBulbMakeRows = generateTableData(slBulbMakeList);
    const updatedfplBulbTACNumberRows = normalizeMsPrefix(slBulbMakeRows);
    let slBulbCategoryRows = generateTableData(slBulbCategoryList);
    let slBulbTACNumberRows = generateTableData(slBulbTACNumberList);
    let npBulbMakeRows = generateTableData(npBulbMakeList);
    const updatednpBulbMakeRows = normalizeMsPrefix(npBulbMakeRows);
    let npBulbCategoryRows = generateTableData(npBulbCategoryList);
    let npBulbTACNumberRows = generateTableData(npBulbTACNumberList);
    let dilBulbFrontMakeRows = generateTableData(dilBulbFrontMakeList);
    const updateddilBulbFrontMakeRows = normalizeMsPrefix(dilBulbFrontMakeRows);
    let dilBulbFrontCategoryRows = generateTableData(dilBulbFrontCategoryList);
    let dilBulbFrontTACNumberRows = generateTableData(dilBulbFrontTACNumberList);
    let dilBulbRearMakeRows = generateTableData(dilBulbRearMakeList);
    const updateddilBulbRearMakeRows = normalizeMsPrefix(dilBulbRearMakeRows);
    let dilBulbRearCategoryRows = generateTableData(dilBulbRearCategoryList);
    let dilBulbRearTACNumberRows = generateTableData(dilBulbRearTACNumberList);
    let dilBulbRearFlashedDirRows = generateTableData(dilBulbRearFlashedDirList);
    let dilBulbRearFlashFreqRows = generateTableData(dilBulbRearFlashFreqList);
    let plBulbFrontMakeRows = generateTableData(plBulbFrontMakeList);
    const updatedplBulbFrontMakeRows = normalizeMsPrefix(plBulbFrontMakeRows);
    let plBulbFrontCategoryRows = generateTableData(plBulbFrontCategoryList);
    let plBulbFrontTACNumberRows = generateTableData(plBulbFrontTACNumberList);

    let plBulbRearMakeRows = generateTableData(plBulbRearMakeList);
    const updatedplBulbRearMakeRows = normalizeMsPrefix(plBulbRearMakeRows);
    let plBulbRearCategoryRows = generateTableData(plBulbRearCategoryList);
    let plBulbRearTACNumberRows = generateTableData(plBulbRearTACNumberList);


    let RPBulbRearMakeRows = generateTableData(RPBulbRearMakeList);
    const updatedRPBulbRearMakeRows = normalizeMsPrefix(RPBulbRearMakeRows);
    let RPBulbRearCategoryRows = generateTableData(RPBulbRearCategoryList);
    let RPBulbRearTACNumberRows = generateTableData(RPBulbRearTACNumberList);


    // let plLedRearMakeRows = generateTableData(plLedbRearMakeList);
    // const updatedpLedRearMakeRows = normalizeMsPrefix(plLedRearMakeRows);
    // console.log('updatedpLedRearMakeRows 7110:',plLedRearMakeRows)
    // let plLedRearCategoryRows = generateTableData(plLedRearCategoryList);
    // console.log('plLedRearCategoryRows 7110:',plLedRearCategoryRows)
    // let plLedRearTACNumberRows = generateTableData(plLedRearTACNumberList);



    let RPLedRearMakeRows = generateTableData(RPLedbRearMakeList);
    const updatedRPedRearMakeRows = normalizeMsPrefix(RPLedRearMakeRows);
    
    let RPLedRearCategoryRows = generateTableData(RPLedRearCategoryList);
    
    let RPLedRearTACNumberRows = generateTableData(RPLedRearTACNumberList);

    allTablesData.push({
        rowKey: "List2_71",
        value: alldevicesRows
    });
    allTablesData.push({
        rowKey: "List2_71111 ",
        value: updatedhlMakeRows
    });
    allTablesData.push({
        rowKey: "List2_71112 ",
        value: hlTypeOfLensRows
    });
    allTablesData.push({
        rowKey: "List2_71113 ",
        value: hlTACNumberRows
    });
    allTablesData.push({
        rowKey: "List2_71114",
        value: hlNumberColorOfLightRows
    });
    allTablesData.push({
        rowKey: "List2_71121 ",
        value: updatedhlDippedBeamMakeRows
    });
    allTablesData.push({
        rowKey: "List2_71122 ",
        value: hlDippedBeamTypeRows
    });
    allTablesData.push({
        rowKey: "List2_71123",
        value: hlDippedBeamTACNumberRows
    });
    allTablesData.push({
        rowKey: "List2_71124",
        value: hlDippedBeamNumberColorOfLightRows
    });
    allTablesData.push({
        rowKey: "List2_71211",
        value: updatedfpLampMakeRows
    });
    allTablesData.push({
        rowKey: "List2_71212",
        value: fpTACNumberRows
    });
    allTablesData.push({
        rowKey: "List2_71213",
        value: fpNumberColorOfLightRows
    });
    allTablesData.push({
        rowKey: "List2_71221",
        value: updatedfplMakeRows
    });
    allTablesData.push({
        rowKey: "List2_71222",
        value: fplTACNumberRows
    });
    allTablesData.push({
        rowKey: "List2_71223",
        value: fplNumberColorOfLightRows
    });
    allTablesData.push({
        rowKey: "List2_7131",
        value: updatedslMakeRows
    });
    allTablesData.push({
        rowKey: "List2_7132",
        value: slTACNumberRows
    });
    allTablesData.push({
        rowKey: "List2_7133",
        value: slNumberColorOfLightRows
    });
    allTablesData.push({
        rowKey: "List2_7141",
        value: updatedRrpMakeRow
    });
    allTablesData.push({
        rowKey: "List2_7142",
        value: rrpTACNumberRows
    });
    allTablesData.push({
        rowKey: "List2_7143",
        value: rrpNumberColorofLightRows
    });
    allTablesData.push({
        rowKey: "List2_71511",
        value: updatedfdlMakeRows
    });
    allTablesData.push({
        rowKey: "List2_71512",
        value: fdlTACNumberRows
    });
    allTablesData.push({
        rowKey: "List2_71513",
        value: fdlNumberColorOfLightRows
    });
    allTablesData.push({
        rowKey: "List2_71521",
        value: updatedrdlMakeRows
    });
    allTablesData.push({
        rowKey: "List2_71522",
        value: rdlTACNumberRows
    });
    allTablesData.push({
        rowKey: "List2_71523",
        value: rdlNumberColorOfLightRows
    });
    allTablesData.push({
        rowKey: "List2_71531",
        value: updatedsdlMakeRows
    });
    allTablesData.push({
        rowKey: "List2_71532",
        value: sdlTACNumberRows
    });
    
    allTablesData.push({
        rowKey: "List2_71533",
        value: sdlNumberColorOfLightRows
    });
    allTablesData.push({
        rowKey: "List2_71534",
        value: updatedsdlFlashedMakeRows
    });
    allTablesData.push({
        rowKey: "List2_71535",
        value: sdlFashFreqRows
    });

    const reflectorsList = form1AData.Retro_Reflectors.RetroReflectors;
    let reflFrontMakeList = [];
    let reflFrontTypeList = [];
    let reflFrontTACNumberList = [];
    let reflFrontNumberColorOfLightList = [];
    let reflFrontSurfAreaList = [];
    let reflFrontShapeList = [];
    let reflRearMakeList = [];
    let reflRearTypeList = [];
    let reflRearTACNumberList = [];
    let reflRearNumberColorOfLightList = [];
    let reflRearSurfAreaList = [];
    let reflRearShapeList = [];
    let reflSideMakeList = [];
    let reflSideTypeList = [];
    let reflSideTACNumberList = [];
    let reflSideNumberColorOfLightList = [];
    let reflSideSurfAreaList = [];
    let reflSideShapeList = [];

    let Reflective_Tape_Front_MakeList = [];
    let Reflective_Tape_Front_WidthList = [];
    let Reflective_Tape_TAC_NOList = [];
    let Reflective_Tape_Rear_MakeList = [];
    let Reflective_Tape_Rear_WidthList = [];
    let Reflective_Tape_Rear_TAC_NOList = [];

    reflectorsList && reflectorsList.map(vehRefl => {
        if (vehRefl.supplier.active === true) {
            const supplierName = vehRefl?.supplier?.nameOfSupplier;
            reflFrontMakeList.push({
                supplier: supplierName,
                value: vehRefl?.Front_White_Reflector?.properties?.Make_Front_Reflector?.value
            });
            reflFrontTypeList.push({
                supplier: supplierName,
                value: vehRefl?.Front_White_Reflector?.properties?.Type_Front_Reflector?.value
            });
            reflFrontTACNumberList.push({
                supplier: supplierName,
                value: vehRefl?.Front_White_Reflector?.properties?.TAC_Num_Front_Reflector?.value
            });
            reflFrontNumberColorOfLightList.push({
                supplier: supplierName,
                value: vehRefl?.Front_White_Reflector?.properties?.Num_and_Colour_of_light?.value
            });
            reflFrontSurfAreaList.push({
                supplier: supplierName,
                value: vehRefl?.Front_White_Reflector?.properties?.Reflective_Surface_Area?.value
            });
            reflFrontShapeList.push({
                supplier: supplierName,
                value: vehRefl?.Front_White_Reflector?.properties?.Shape?.value
            });
            reflRearMakeList.push({
                supplier: supplierName,
                value: vehRefl?.Rear_Red_Reflector?.properties?.Make_Rear_Red_Reflector?.value
            });
            reflRearTypeList.push({
                supplier: supplierName,
                value: vehRefl?.Rear_Red_Reflector?.properties?.Type_Rear_Reflector?.value
            });
            reflRearTACNumberList.push({
                supplier: supplierName,
                value: vehRefl?.Rear_Red_Reflector?.properties?.TAC_Num_Rear_Reflector?.value
            });
            reflRearNumberColorOfLightList.push({
                supplier: supplierName,
                value: vehRefl?.Rear_Red_Reflector?.properties?.Num_and_Colour_of_light?.value
            });
            reflRearSurfAreaList.push({
                supplier: supplierName,
                value: vehRefl?.Rear_Red_Reflector?.properties?.Reflective_surface_Area?.value
            });
            reflRearShapeList.push({
                supplier: supplierName,
                value: vehRefl?.Rear_Red_Reflector?.properties?.Shape?.value
            });
            reflSideMakeList.push({
                supplier: supplierName,
                value: vehRefl?.Side_Amber_Reflector?.properties?.Make_side_amber_reflector?.value
            });
            reflSideTypeList.push({
                supplier: supplierName,
                value: vehRefl?.Side_Amber_Reflector?.properties?.Type_Side_Reflector?.value
            });
            reflSideTACNumberList.push({
                supplier: supplierName,
                value: vehRefl?.Side_Amber_Reflector?.properties?.TAC_Num_Side_Reflector?.value
            });
            reflSideNumberColorOfLightList.push({
                supplier: supplierName,
                value: vehRefl?.Side_Amber_Reflector?.properties?.Num_and_Colour_of_light?.value
            });
            reflSideSurfAreaList.push({
                supplier: supplierName,
                value: vehRefl?.Side_Amber_Reflector?.properties?.Reflective_surface_Area?.value
            });
            reflSideShapeList.push({
                supplier: supplierName,
                value: vehRefl?.Side_Amber_Reflector?.properties?.Shape?.value
            });


            Reflective_Tape_Front_MakeList.push({

                value: vehRefl?.Reflective_Tape?.properties?.Front_Make?.value
            });
            Reflective_Tape_Front_WidthList.push({

                value: vehRefl?.Reflective_Tape?.properties?.Front_Width?.value
            });
            Reflective_Tape_TAC_NOList.push({

                value: vehRefl?.Reflective_Tape?.properties?.TAC_NO_BIS_License_NO?.value
            });
            Reflective_Tape_Rear_MakeList.push({

                value: vehRefl?.Reflective_Tape?.properties?.Rear_Make?.value
            });
            Reflective_Tape_Rear_WidthList.push({

                value: vehRefl?.Reflective_Tape?.properties?.Rear_Width?.value
            });
            Reflective_Tape_Rear_TAC_NOList.push({

                value: vehRefl?.Reflective_Tape?.properties?.Rear_TAC_NO_BIS_License_NO?.value
            });


        }
    });
    let reflFrontMakeRows = generateTableData(reflFrontMakeList);
    const updatedreflFrontMakeRows = normalizeMsPrefix(reflFrontMakeRows);
    let reflFrontTypeRows = generateTableData(reflFrontTypeList);
    let reflFrontTACNumberRows = generateTableData(reflFrontTACNumberList);
    let reflFrontNumberColorOfLightRows = generateTableData(reflFrontNumberColorOfLightList);
    let reflFrontSurfAreaRows = generateTableData(reflFrontSurfAreaList);
    // let reflFrontSurfAreaRows = normalizeWithUnit(reflFrontSurfAreaRows1, SQ_CM_MM);
    let reflFrontShapeRows = generateTableData(reflFrontShapeList);
    let reflRearMakeRows = generateTableData(reflRearMakeList);
    const updatedreflRearMakeRows = normalizeMsPrefix(reflRearMakeRows);
    let reflRearTypeRows = generateTableData(reflRearTypeList);
    let reflRearTACNumberRows = generateTableData(reflRearTACNumberList);
    let reflRearNumberColorOfLightRows = generateTableData(reflRearNumberColorOfLightList);
    let reflRearSurfAreaRows = generateTableData(reflRearSurfAreaList);
    // let reflRearSurfAreaRows = normalizeWithUnit(reflRearSurfAreaRows1, SQ_CM_MM);
    let reflRearShapeRows = generateTableData(reflRearShapeList);
    let reflSideMakeRows = generateTableData(reflSideMakeList);
    const updatedreflSideMakeRows = normalizeMsPrefix(reflSideMakeRows);
    let reflSideTypeRows = generateTableData(reflSideTypeList);
    let reflSideTACNumberRows = generateTableData(reflSideTACNumberList);
    let reflSideNumberColorOfLightRows = generateTableData(reflSideNumberColorOfLightList);
    let reflSideSurfAreaRows = generateTableData(reflSideSurfAreaList);
    // let reflSideSurfAreaRows = normalizeWithUnit(reflSideSurfAreaRows1, SQ_CM_MM);
    let reflSideShapeRows = generateTableData(reflSideShapeList);


    let Reflective_Tape_Front_MakeRows = generateTableData(Reflective_Tape_Front_MakeList);
    const updatedReflective_Tape_Front_MakeRows = normalizeMsPrefix(Reflective_Tape_Front_MakeRows);
    let Reflective_Tape_Front_WidthRows1 = generateTableData(Reflective_Tape_Front_WidthList);
    let Reflective_Tape_Front_WidthRows = normalizeWithUnit(Reflective_Tape_Front_WidthRows1, MM);
    let Reflective_Tape_TAC_NORows1 = generateTableData(Reflective_Tape_TAC_NOList);
    const Reflective_Tape_TAC_NORows = extractTACNumbers(Reflective_Tape_TAC_NORows1);
    let Reflective_Tape_Rear_MakeRows = generateTableData(Reflective_Tape_Rear_MakeList);

    let Reflective_Tape_Rear_WidthRows1 = generateTableData(Reflective_Tape_Rear_WidthList);
    let Reflective_Tape_Rear_WidthRows = normalizeWithUnit(Reflective_Tape_Rear_WidthRows1, MM);
    let Reflective_Tape_Rear_TAC_NORows = generateTableData(Reflective_Tape_Rear_TAC_NOList);

    allTablesData.push({
        rowKey: "List2_71711",
        value: updatedreflFrontMakeRows
    });
    allTablesData.push({
        rowKey: "List2_71712",
        value: reflFrontTypeRows
    });
    allTablesData.push({
        rowKey: "List2_71713",
        value: reflFrontTACNumberRows
    });
    allTablesData.push({
        rowKey: "List2_71714",
        value: reflFrontNumberColorOfLightRows
    });
    allTablesData.push({
        rowKey: "List2_71715",
        value: reflFrontSurfAreaRows
    });
    allTablesData.push({
        rowKey: "List2_71716",
        value: reflFrontShapeRows
    });
    allTablesData.push({
        rowKey: "List2_71721",
        value: updatedreflRearMakeRows
    });
    allTablesData.push({
        rowKey: "List2_71722",
        value: reflRearTypeRows
    });
    allTablesData.push({
        rowKey: "List2_71723",
        value: reflRearTACNumberRows
    });
    allTablesData.push({
        rowKey: "List2_71724",
        value: reflRearNumberColorOfLightRows
    });
    allTablesData.push({
        rowKey: "List2_71725",
        value: reflRearSurfAreaRows
    });
    allTablesData.push({
        rowKey: "List2_71726",
        value: reflRearShapeRows
    });
    allTablesData.push({
        rowKey: "List2_71731",
        value: updatedreflSideMakeRows
    });
    allTablesData.push({
        rowKey: "List2_71732",
        value: reflSideTypeRows
    });
    allTablesData.push({
        rowKey: "List2_71733",
        value: reflSideTACNumberRows
    });
    allTablesData.push({
        rowKey: "List2_71734",
        value: reflSideNumberColorOfLightRows
    });
    allTablesData.push({
        rowKey: "List2_71735",
        value: reflSideSurfAreaRows
    });
    allTablesData.push({
        rowKey: "List2_71736",
        value: reflSideShapeRows
    });




    allTablesData.push({
        rowKey: "List3_1011",
        value: updatedReflective_Tape_Front_MakeRows
    });
    allTablesData.push({
        rowKey: "List3_1012",
        value: Reflective_Tape_Front_WidthRows
    });
    allTablesData.push({
        rowKey: "List3_1013",
        value: Reflective_Tape_TAC_NORows
    });
    allTablesData.push({
        rowKey: "List3_1021",
        value: Reflective_Tape_Rear_MakeRows
    });
    allTablesData.push({
        rowKey: "List3_1022",
        value: Reflective_Tape_Rear_WidthRows
    });
    allTablesData.push({
        rowKey: "List3_1023",
        value: Reflective_Tape_Rear_TAC_NORows
    });
    allTablesData.push({
        rowKey: "List3_1024",
        value: rearCoordinates_Rows
    });
    const hazardLightsList = form1AData?.Hazard_Warning_Lamp?.HazardWarningLamp;
    let hzlFrontMakeList = [];
    let hzlFrontTACNumberList = [];
    let hzlFrontNumberColorOfLightList = [];
    let hzlRearMakeList = [];
    let hzlRearTACNumberList = [];
    let hzlRearNumberColorOfLightList = [];
    let hzlSideMakeList = [];
    let hzlSideTACNumberList = [];
    let hzlSideNumberColorOfLightList = [];
    let hzlMaxIntensityList = [];
    let hzlDiagramLocationList = [];
    let hwBulbMakeList = [];
    let hwBulbCategoryList = [];
    let hwBulbTACNumberList = [];
    hazardLightsList && hazardLightsList.map(vehHazard => {
        if (vehHazard.supplier.active === true) {
            const supplierName = vehHazard?.supplier?.nameOfSupplier;
            hzlFrontMakeList.push({
                supplier: supplierName,
                value: vehHazard?.Hazard_Warn_lamp_Front_Led?.properties?.Make?.value
            });
            hzlFrontTACNumberList.push({
                supplier: supplierName,
                value: vehHazard?.Hazard_Warn_lamp_Front_Led?.properties?.TAC_BIS_License_EMarking_num?.value
            });
            hzlFrontNumberColorOfLightList.push({
                supplier: supplierName,
                value: vehHazard?.Hazard_Warn_lamp_Front_Led?.properties?.Num_and_Colour_of_light?.value
            });
            hzlRearMakeList.push({
                supplier: supplierName,
                value: vehHazard?.Rear_Hazard_Lamp?.properties?.Make?.value
            });
            hzlRearTACNumberList.push({
                supplier: supplierName,
                value: vehHazard?.Rear_Hazard_Lamp?.properties?.TAC_BIS_License_E_Marking_no?.value
            });
            hzlRearNumberColorOfLightList.push({
                supplier: supplierName,
                value: vehHazard?.Rear_Hazard_Lamp?.properties?.Num_and_Colour_light?.value
            });
            hzlSideMakeList.push({
                supplier: supplierName,
                value: vehHazard?.Side_Hazard_Lamp?.properties?.Make?.value
            });
            hzlSideTACNumberList.push({
                supplier: supplierName,
                value: vehHazard?.Side_Hazard_Lamp?.properties?.TAC_BIS_LicenseEMarking_num?.value
            });
            hzlSideNumberColorOfLightList.push({
                supplier: supplierName,
                value: vehHazard?.Side_Hazard_Lamp?.properties?.Num_and_Colour_light?.value
            });
            hzlMaxIntensityList.push({
                supplier: supplierName,
                value: vehHazard?.Side_Hazard_Lamp?.properties?.Max_intensity_Head_lamp?.value
            });
            hzlDiagramLocationList.push({
                supplier: supplierName,
                value: vehHazard?.Side_Hazard_Lamp?.properties?.Diagram_location_lighting?.value
            });
            hwBulbMakeList.push({
                supplier: supplierName,
                value: vehHazard?.Front_Dir_indicator_Bulb_Type?.properties?.Make_Front_Dir_Indicators?.value
            });
            hwBulbCategoryList.push({
                supplier: supplierName,
                value: vehHazard?.Front_Dir_indicator_Bulb_Type?.properties?.Category_per_AIS_035?.value
            });
            hwBulbTACNumberList.push({
                supplier: supplierName,
                value: vehHazard?.Front_Dir_indicator_Bulb_Type?.properties?.TAC_Dir_Indicator?.value
            });
        }
    });
    let hzlFrontMakeRows = generateTableData(hzlFrontMakeList);
    const updatedhzlFrontMakeRows = normalizeMsPrefix(hzlFrontMakeRows);
    let hzlFrontTACNumberRows = generateTableData(hzlFrontTACNumberList);
    let hzlFrontNumberColorOfLightRows = generateTableData(hzlFrontNumberColorOfLightList);
    let hzlRearMakeRows = generateTableData(hzlRearMakeList);
    const updatedhzlRearMakeRows = normalizeMsPrefix(hzlRearMakeRows);
    let hzlRearTACNumberRows = generateTableData(hzlRearTACNumberList);
    let hzlRearNumberColorOfLightRows = generateTableData(hzlRearNumberColorOfLightList);
    let hzlSideMakeRows = generateTableData(hzlSideMakeList);
    const updatedhzlSideMakeRows = normalizeMsPrefix(hzlSideMakeRows);
    let hzlSideTACNumberRows = generateTableData(hzlSideTACNumberList);
    let hzlSideNumberColorOfLightRows = generateTableData(hzlSideNumberColorOfLightList);
    let hzlMaxIntensityRows = generateTableData(hzlMaxIntensityList);
    // let hzlDiagramLocationRows = generateTableData(hzlDiagramLocationList);
    let hwBulbMakeRows = generateTableData(hwBulbMakeList);
    const updatedhwBulbMakeRows = normalizeMsPrefix(hwBulbMakeRows);
    let hwBulbCategoryRows = generateTableData(hwBulbCategoryList);
    let hwBulbTACNumberRows = generateTableData(hwBulbTACNumberList);
    allTablesData.push({
        rowKey: "List2_71811",
        value: updatedhzlFrontMakeRows
    });
    allTablesData.push({
        rowKey: "List2_71812",
        value: hzlFrontTACNumberRows
    });
    allTablesData.push({
        rowKey: "List2_71813",
        value: hzlFrontNumberColorOfLightRows
    });
    allTablesData.push({
        rowKey: "List2_71821",
        value: updatedhzlRearMakeRows
    });
    allTablesData.push({
        rowKey: "List2_71822",
        value: hzlRearTACNumberRows
    });
    allTablesData.push({
        rowKey: "List2_71823",
        value: hzlRearNumberColorOfLightRows
    });
    allTablesData.push({
        rowKey: "List2_71831",
        value: updatedhzlSideMakeRows
    });
    allTablesData.push({
        rowKey: "List2_71832",
        value: hzlSideTACNumberRows
    });
    allTablesData.push({
        rowKey: "List2_71833",
        value: hzlSideNumberColorOfLightRows
    });
    allTablesData.push({
        rowKey: "List2_719",
        value: hzlMaxIntensityRows
    });
    allTablesData.push({
        rowKey: "List2_72",
        value: hzlDiagramLocationRows
    });
    allTablesData.push({
        rowKey: "List2_7511",
        value: updatedhlBulbMakeRows
    });
    allTablesData.push({
        rowKey: "List2_7512",
        value: hlBulbCategoryRows
    });
    allTablesData.push({
        rowKey: "List2_7513",
        value: hlBulbTACNumberRows
    });
    allTablesData.push({
        rowKey: "List2_7521",
        value: updateddbMakeRows
    });
    allTablesData.push({
        rowKey: "List2_7522",
        value: dbCategoryRows
    });
    allTablesData.push({
        rowKey: "List2_7523",
        value: dbTACNumberRows
    });
    allTablesData.push({
        rowKey: "List2_73",
        value: dbAdditionalRows
    });
    allTablesData.push({
        rowKey: "List2_74",
        value: dbBriefDescRows
    });
    allTablesData.push({
        rowKey: "List2_75",
        value: dbListOFBulbRows
    });
    allTablesData.push({
        rowKey: "List2_7531",
        value: updatedfplBulbMakeRows
    });
    allTablesData.push({
        rowKey: "List2_7532",
        value: fplBulbCategoryRows
    });
    allTablesData.push({
        rowKey: "List2_7533",
        value: fplBulbTACNumberRows
    });
    allTablesData.push({
        rowKey: "List2_7541",
        value: updatedfplBulbTACNumberRows
    });
    allTablesData.push({
        rowKey: "List2_7542",
        value: slBulbCategoryRows
    });
    allTablesData.push({
        rowKey: "List2_7543",
        value: slBulbTACNumberRows
    });
    allTablesData.push({
        rowKey: "List2_7551 ",
        value: updatednpBulbMakeRows
    });
    allTablesData.push({
        rowKey: "List2_7552 ",
        value: npBulbCategoryRows
    });
    allTablesData.push({
        rowKey: "List2_7553",
        value: npBulbTACNumberRows
    });
    allTablesData.push({
        rowKey: "List2_7561",
        value: updateddilBulbFrontMakeRows
    });
    allTablesData.push({
        rowKey: "List2_7562",
        value: dilBulbFrontCategoryRows
    });
    allTablesData.push({
        rowKey: "List2_7563",
        value: dilBulbFrontTACNumberRows
    });
    allTablesData.push({
        rowKey: "List2_7571",
        value: updateddilBulbRearMakeRows
    });
    allTablesData.push({
        rowKey: "List2_7572",
        value: dilBulbRearCategoryRows
    });
    allTablesData.push({
        rowKey: "List2_7573",
        value: dilBulbRearTACNumberRows
    });
    allTablesData.push({
        rowKey: "List2_7574",
        value: dilBulbRearFlashedDirRows
    });
    allTablesData.push({
        rowKey: "List2_7575",
        value: dilBulbRearFlashFreqRows
    });
    allTablesData.push({
        rowKey: "List2_7581",
        value: updatedplBulbFrontMakeRows
    });
    allTablesData.push({
        rowKey: "List2_7582",
        value: plBulbFrontCategoryRows
    });
    allTablesData.push({
        rowKey: "List2_7583",
        value: plBulbFrontTACNumberRows
    });
    allTablesData.push({
        rowKey: "List2_7591",
        value: updatedplBulbRearMakeRows
    });
    allTablesData.push({
        rowKey: "List2_7592",
        value: plBulbRearCategoryRows
    });
    allTablesData.push({
        rowKey: "List2_7593",
        value: plBulbRearTACNumberRows
    });

    allTablesData.push({
        rowKey: "List2_75121",
        value: updatedRPBulbRearMakeRows
    });
    allTablesData.push({
        rowKey: "List2_75122",
        value: RPBulbRearCategoryRows
    });
    allTablesData.push({
        rowKey: "List2_75123",
        value: RPBulbRearTACNumberRows
    });
    allTablesData.push({
        rowKey: "List2_71101",
        value: updatedRPedRearMakeRows
    });
    allTablesData.push({
        rowKey: "List2_71102",
        value: RPLedRearTACNumberRows
    });
    allTablesData.push({
        rowKey: "List2_71103",
        value: RPLedRearCategoryRows
    });
    allTablesData.push({
        rowKey: "List2_75111",
        value: updatedhwBulbMakeRows
    });
    allTablesData.push({
        rowKey: "List2_75112",
        value: hwBulbCategoryRows
    });
    allTablesData.push({
        rowKey: "List2_75113",
        value: hwBulbTACNumberRows
    });

    const tellTalesList = form1AData?.Tell_Tales?.TellTales;
    let ttHeadLampDrivingBeamList = [];
    let ttHeadLampPassingBeamList = [];
    let ttFogLampsFrontList = [];
    let ttFogLampsRearList = [];
    let ttDirIndList = [];
    let ttHazWarSignalList = [];
    let ttPosLampList = [];
    let ttMasterLampList = [];
    let ttParkingLampList = [];
    let ttFuelIndicatorList = [];
    let ttEngineCoolantTempList = [];
    let ttElectricalChargingList = [];
    let ttEngineOilList = [];
    let ttAntiLockBrakeList = [];
    let ttMalfunctionIndLampList = [];
    let ttOtherList = [];
    let ttNeutralList = [];
    tellTalesList && tellTalesList.map(vehtellTale => {
        if (vehtellTale.supplier.active === true) {
            const supplierName = vehtellTale?.supplier?.nameOfSupplier;
            ttHeadLampDrivingBeamList.push({
                supplier: supplierName,
                value: vehtellTale?.Tell_Tales?.properties?.Head_lamp_Driving_beam?.value
            });
            ttHeadLampPassingBeamList.push({
                supplier: supplierName,
                value: vehtellTale?.Tell_Tales?.properties?.Head_lamp_Passing_beam?.value
            });
            ttFogLampsFrontList.push({
                supplier: supplierName,
                value: vehtellTale?.Tell_Tales?.properties?.Fog_Lamps_Front?.value
            });
            ttFogLampsRearList.push({
                supplier: supplierName,
                value: vehtellTale?.Tell_Tales?.properties?.Fog_Lamps_Rear?.value
            });
            ttDirIndList.push({
                supplier: supplierName,
                value: vehtellTale?.Tell_Tales?.properties?.Direction_indicators?.value
            });
            ttHazWarSignalList.push({
                supplier: supplierName,
                value: vehtellTale?.Tell_Tales?.properties?.Hazard_warning_signal?.value
            });
            ttPosLampList.push({
                supplier: supplierName,
                value: vehtellTale?.Tell_Tales?.properties?.Position_Lamp?.value
            });
            ttMasterLampList.push({
                supplier: supplierName,
                value: vehtellTale?.Tell_Tales?.properties?.Master_lamp?.value
            });
            ttParkingLampList.push({
                supplier: supplierName,
                value: vehtellTale?.Tell_Tales?.properties?.Parking_Lamp?.value
            });
            ttOtherList.push({
                supplier: supplierName,
                value: vehtellTale?.Tell_Tales?.properties?.Other_tell_tale?.value
            });

            ttFuelIndicatorList.push({
                supplier: supplierName,
                value: vehtellTale?.Tell_Tales?.properties?.Fuel_Indicator?.value
            });
            ttEngineCoolantTempList.push({
                supplier: supplierName,
                value: vehtellTale?.Tell_Tales?.properties?.Engine_coolant_temperature?.value
            });
            ttElectricalChargingList.push({
                supplier: supplierName,
                value: vehtellTale?.Tell_Tales?.properties?.Electrical_Charging?.value
            });
            ttEngineOilList.push({
                supplier: supplierName,
                value: vehtellTale?.Tell_Tales?.properties?.Engine_Oil?.value
            });
            ttAntiLockBrakeList.push({
                supplier: supplierName,
                value: vehtellTale?.Tell_Tales?.properties?.Anti_Lock_Brake?.value
            });
            ttMalfunctionIndLampList.push({
                supplier: supplierName,
                value: vehtellTale?.Tell_Tales?.properties?.Malfunction_Ind_Lamp?.value
            });
            ttNeutralList.push({
                supplier: supplierName,
                value: vehtellTale?.Tell_Tales?.properties?.Neutral?.value
            });
        }
    });
    let ttHeadLampDrivingBeamRows = generateTableData(ttHeadLampDrivingBeamList);
    let ttHeadLampPassingBeamRows = generateTableData(ttHeadLampPassingBeamList);
    let ttFogLampsFrontRows = generateTableData(ttFogLampsFrontList);
    let ttFogLampsRearRows = generateTableData(ttFogLampsRearList);
    let ttDirIndRows = generateTableData(ttDirIndList);
    let ttHazWarSignalRows = generateTableData(ttHazWarSignalList);
    let ttPosLampRows = generateTableData(ttPosLampList);
    let ttMasterLampRows = generateTableData(ttMasterLampList);
    let ttParkingLampRows = generateTableData(ttParkingLampList);
    let ttOtherRows = generateTableData(ttOtherList);

    let ttFuelIndicatorRows = generateTableData(ttFuelIndicatorList);
    let ttEngineCoolantTempRows = generateTableData(ttEngineCoolantTempList);
    let ttElectricalChargingRows = generateTableData(ttElectricalChargingList);
    let ttEngineOilRows = generateTableData(ttEngineOilList);
    let ttAntiLockBrakeRows = generateTableData(ttAntiLockBrakeList);
    let ttMalfunctionIndLampRows = generateTableData(ttMalfunctionIndLampList);
    let ttNeutralRows = generateTableData(ttNeutralList);
    // let ttFuelIndicatorRows = twoWheeler ? 'NA' : generateTableData(ttFuelIndicatorList);
    // let ttEngineCoolantTempRows = twoWheeler ? 'NA' : generateTableData(ttEngineCoolantTempList);
    // let ttElectricalChargingRows = twoWheeler ? 'NA' : generateTableData(ttElectricalChargingList);
    // let ttEngineOilRows = twoWheeler ? 'NA' : generateTableData(ttEngineOilList);
    // let ttAntiLockBrakeRows = twoWheeler ? 'NA' : generateTableData(ttAntiLockBrakeList);
    // let ttMalfunctionIndLampRows = twoWheeler ? 'NA' : generateTableData(ttMalfunctionIndLampList);
    allTablesData.push({
        rowKey: "List2_82251",
        value: "NA"
    });
    allTablesData.push({
        rowKey: "List2_82252",
        value: ttNeutralRows
    });
    allTablesData.push({
        rowKey: "List2_82253",
        value: ttHeadLampDrivingBeamRows
    });
    allTablesData.push({
        rowKey: "List2_82254",
        value: ttHeadLampPassingBeamRows
    });
    allTablesData.push({
        rowKey: "List2_82255",
        value: ttFogLampsFrontRows
    });
    allTablesData.push({
        rowKey: "List2_82256",
        value: ttFogLampsRearRows
    });
    allTablesData.push({
        rowKey: "List2_82257",
        value: ttDirIndRows
    });
    allTablesData.push({
        rowKey: "List2_82258",
        value: ttHazWarSignalRows
    });
    allTablesData.push({
        rowKey: "List2_82259",
        value: ttPosLampRows
    });
    allTablesData.push({
        rowKey: "List2_822510",
        value: ttMasterLampRows
    });
    allTablesData.push({
        rowKey: "List2_822511",
        value: ttParkingLampRows
    });
    allTablesData.push({
        rowKey: "List2_822518",
        value: ttOtherRows
    });
    /////
    allTablesData.push({
        rowKey: "List2_822512",
        value: ttFuelIndicatorRows
    });
    allTablesData.push({
        rowKey: "List2_822513",
        value: ttEngineCoolantTempRows
    });
    allTablesData.push({
        rowKey: "List2_822514",
        value: ttElectricalChargingRows
    });
    allTablesData.push({
        rowKey: "List2_822515",
        value: ttEngineOilRows
    });
    allTablesData.push({
        rowKey: "List2_822516",
        value: ttAntiLockBrakeRows
    });
    allTablesData.push({
        rowKey: "List2_822517",
        value: ttMalfunctionIndLampRows
    });

    const indicatorsList = form1AData?.Indicators?.IndicatorsData;
    let indSpeedometerList = [];
    let indOthersList = [];
    let FuelIndicatorList = [];
    let EngineCoolantTempList = [];
    let ElectricalChargingList = [];
    let EngineOilList = [];
    indicatorsList && indicatorsList.map(vehInd => {
        if (vehInd.supplier.active === true) {
            const supplierName = vehInd?.supplier?.nameOfSupplier;
            indSpeedometerList.push({
                supplier: supplierName,
                value: vehInd?.Indicators?.properties?.Speedometer?.value
            });
            indOthersList.push({
                supplier: supplierName,
                value: vehInd?.Indicators?.properties?.Any_other_Indicator?.value
            });

            FuelIndicatorList.push({
                supplier: supplierName,
                value: vehInd?.Indicators?.properties?.Fuel_Indicator?.value
            });
            EngineCoolantTempList.push({
                supplier: supplierName,
                value: vehInd?.Indicators?.properties?.Engine_coolant_temperature?.value
            });
            ElectricalChargingList.push({
                supplier: supplierName,
                value: vehInd?.Indicators?.properties?.Electrical_Charging?.value
            });
            EngineOilList.push({
                supplier: supplierName,
                value: vehInd?.Indicators?.properties?.Engine_Oil?.value
            });
        }
    });
    let indSpeedometerRows = generateTableData(indSpeedometerList);
    let indOthersRows = generateTableData(indOthersList);
    let FuelIndicatorRows = generateTableData(FuelIndicatorList);
    let EngineCoolantTempRows = generateTableData(EngineCoolantTempList);
    let ElectricalChargingRows = generateTableData(ElectricalChargingList);
    let EngineOilRows = generateTableData(EngineOilList);
    allTablesData.push({
        rowKey: "List2_82261",
        value: indSpeedometerRows
    });
    allTablesData.push({
        rowKey: "List2_82266",
        value: indOthersRows
    });
    allTablesData.push({
        rowKey: "List2_82262",
        value: FuelIndicatorRows
    });
    allTablesData.push({
        rowKey: "List2_82263",
        value: EngineCoolantTempRows
    });
    allTablesData.push({
        rowKey: "List2_82264",
        value: ElectricalChargingRows
    });
    allTablesData.push({
        rowKey: "List2_82265",
        value: EngineOilRows
    });
    const rearViewMirrorsList = form1AData?.Rear_View_Mirror?.RearViewMirror;
    let rvmMakeList = [];
    let rvmTACNumberList = [];
    let rvmMirrorClassList = [];
    let rvmDrawInstList = [];
    let rvmPrecInfoList = [];
    rearViewMirrorsList && rearViewMirrorsList.map(vehRearViewMirror => {
        if (vehRearViewMirror.supplier.active === true) {
            const supplierName = vehRearViewMirror?.supplier?.nameOfSupplier;
            rvmMakeList.push({
                supplier: supplierName,
                value: vehRearViewMirror?.Rear_View_Mirror?.properties?.Make_Rear_View_Mirrors?.value
            });
            rvmTACNumberList.push({
                supplier: supplierName,
                value: vehRearViewMirror?.Rear_View_Mirror?.properties?.TAC_Number_Validity?.value
            });
            rvmMirrorClassList.push({
                supplier: supplierName,
                value: vehRearViewMirror?.Rear_View_Mirror?.properties?.Select_Mirror_Class?.value
            });
            rvmDrawInstList.push({
                supplier: supplierName,
                value: vehRearViewMirror?.Rear_View_Mirror?.properties?.Drawing_Installation_Dimension?.value
            });
            rvmPrecInfoList.push({
                supplier: supplierName,
                value: vehRearViewMirror?.Rear_View_Mirror?.properties?.Precise_vehicle_structure?.value
            });
        }
    });
    let rvmMakeRows = generateTableData(rvmMakeList);
    const updatedrvmMakeRows = normalizeMsPrefix(rvmMakeRows);
    let rvmTACNumberRows1 = generateTableData(rvmTACNumberList);
    const rvmTACNumberRows = extractTACNumbers(rvmTACNumberRows1);
    let rvmMirrorClassRows = generateTableData(rvmMirrorClassList);
    // let rvmDrawInstRows = generateTableData(rvmDrawInstList);
    let rvmPrecInfoRows = generateTableData(rvmPrecInfoList);
    allTablesData.push({
        rowKey: "List2_91",
        value: updatedrvmMakeRows
    });
    allTablesData.push({
        rowKey: "List2_911",
        value: rvmTACNumberRows
    });
    allTablesData.push({
        rowKey: "List2_92",
        value: rvmMirrorClassRows
    });
    allTablesData.push({
        rowKey: "List2_93",
        value: rvmDrawInstRows
    });
    allTablesData.push({
        rowKey: "List2_94",
        value: rvmPrecInfoRows
    });



    const electricalSysList = form1AData?.Critical_Electrical_Devices?.CriticalElectricalDevices;
    let eleAllSubAssemList = [];
    let eleDeviceNameList = [];
    let eleMakeList = [];
    let eleIdNumberList = [];
    let eleCompList = [];
    let eleCompDeviceNameList = [];
    let eleCompMakeList = [];
    let eleCompIdNumberList = [];
    electricalSysList && electricalSysList.map(vehElec => {
        if (vehElec.supplier.active === true) {
            const supplierName = vehElec?.supplier?.nameOfSupplier;
            eleAllSubAssemList.push({
                supplier: supplierName,
                value: vehElec?.Critical_Electrical_Devices?.properties?.List_of_all_subassemblies?.value
            });
            eleDeviceNameList.push({
                supplier: supplierName,
                value: vehElec?.Critical_Electrical_Devices?.properties?.Device_Name?.value
            });
            eleCompDeviceNameList.push({
                supplier: supplierName,
                value: vehElec?.Critical_Electrical_Devices?.properties?.Device_Name_Electrical_Components?.value
            });
            eleMakeList.push({
                supplier: supplierName,
                value: vehElec?.Critical_Electrical_Devices?.properties?.Make?.value
            });
            eleCompMakeList.push({
                supplier: supplierName,
                value: vehElec?.Critical_Electrical_Devices?.properties?.Make_Electrical_Components?.value
            });
            eleIdNumberList.push({
                supplier: supplierName,
                value: vehElec?.Critical_Electrical_Devices?.properties?.Identification_number_or_PartNo_or_DrawingNo?.value
            });
            eleCompIdNumberList.push({
                supplier: supplierName,
                value: vehElec?.Critical_Electrical_Devices?.properties?.Identification_number_or_PartNo_or_DrawingNo_Electrical_Components?.value
            });
            eleCompList.push({
                supplier: supplierName,
                value: vehElec?.Critical_Electrical_Devices?.properties.List_of_all_Electrical_components?.value
            });
        }
    });
    let eleAllSubAssemRows = generateTableData(eleAllSubAssemList);
    let eleDeviceNameRows = generateTableData(eleDeviceNameList);
    let eleCompDeviceNameRows = generateTableData(eleCompDeviceNameList);
    let eleMakeRows = generateTableData(eleMakeList);
    const updatedeleMakeRows = normalizeMsPrefix(eleMakeRows);
    let eleCompMakeRows = generateTableData(eleCompMakeList);
    const updatedeleCompMakeRows = normalizeMsPrefix(eleCompMakeRows);
    let eleIdNumberRows = generateTableData(eleIdNumberList);
    let eleCompIdNumberRows = generateTableData(eleCompIdNumberList);
    let eleCompRows = generateTableData(eleCompList);
    allTablesData.push({
        rowKey: "List2_121",
        value: eleAllSubAssemRows
    });
    allTablesData.push({
        rowKey: "List2_1211",
        value: eleDeviceNameRows
    });
    allTablesData.push({
        rowKey: "List2_1212",
        value: updatedeleMakeRows
    });
    allTablesData.push({
        rowKey: "List2_1213",
        value: eleIdNumberRows
    });
    allTablesData.push({
        rowKey: "List2_122",
        value: eleCompRows
    });
    allTablesData.push({
        rowKey: "List2_1221",
        value: eleCompDeviceNameRows
    });
    allTablesData.push({
        rowKey: "List2_1222",
        value: updatedeleCompMakeRows
    });
    allTablesData.push({
        rowKey: "List2_1223",
        value: eleCompIdNumberRows
    });
    // Updated code: Mapping Rear Entry Provision data and pushing to table
    const rearEntryList = form1AData?.Rear_Entry_Provision?.RearEntryProvision;
    let reUploadList = [];
    let reHeightList = [];
    let reWidthList = [];
    let reDepthList = [];
    let reProtectiveEdgeList = [];
    rearEntryList && rearEntryList.map(rearEntry => {
        if (rearEntry.supplier.active === true) {
            const supplierName = rearEntry?.supplier?.nameOfSupplier;
            reUploadList.push({
                supplier: supplierName,
                value: rearEntry?.Rear_Entry_Provision?.properties?.Upload_drawing_showing_rear_of_vehicle?.value
            });
            reHeightList.push({
                supplier: supplierName,
                value: rearEntry?.Rear_Entry_Provision?.properties?.Maximum_height_from_ground?.value
            });
            reWidthList.push({
                supplier: supplierName,
                value: rearEntry?.Rear_Entry_Provision?.properties?.Width_of_step?.value
            });
            reDepthList.push({
                supplier: supplierName,
                value: rearEntry?.Rear_Entry_Provision?.properties?.Depth_of_step?.value
            });
            reProtectiveEdgeList.push({
                supplier: supplierName,
                value: rearEntry?.Rear_Entry_Provision?.properties?.Protective_structure_adjacent_seat?.value
            });

        }
    });
    let reUploadRows1 = generateTableData(reUploadList);
    let reUploadRows = normalizeWithUnit(reUploadRows1, MM);
    let reHeightRows1 = generateTableData(reHeightList);
    let reHeightRows = normalizeWithUnit(reHeightRows1, MM);
    let reWidthRows1 = generateTableData(reWidthList);
    let reWidthRows = normalizeWithUnit(reWidthRows1, MM);
    let reDepthRows1 = generateTableData(reDepthList);
    let reDepthRows = normalizeWithUnit(reDepthRows1, MM);
    let reProtectiveEdgeRows1 = generateTableData(reProtectiveEdgeList);
    let reProtectiveEdgeRows = normalizeWithUnit(reProtectiveEdgeRows1, MM);

    allTablesData.push({
        rowKey: "List3_91",
        value: reUploadRows
    });
    allTablesData.push({
        rowKey: "List3_911",
        value: reHeightRows
    });
    allTablesData.push({
        rowKey: "List3_912",
        value: reWidthRows
    });
    allTablesData.push({
        rowKey: "List3_913",
        value: reDepthRows
    });
    allTablesData.push({
        rowKey: "List3_914",
        value: reProtectiveEdgeRows
    });

    // Updated code: Mapping H Point data and pushing to table
    const hPointList = form1AData?.H_Point?.HPointData;
    let seDriverList = [];
    let sePassengerList = [];
    let shDriverList = [];
    let shPassengerList = [];
    let fhDriverList = [];
    let fhPassengerList = [];
    hPointList && hPointList.map(hPoint => {
        if (hPoint.supplier.active === true) {
            const supplierName = hPoint?.supplier?.nameOfSupplier;
            seDriverList.push({
                supplier: supplierName,
                value: hPoint?.HPoint?.properties?.seat_back_upper_edge_driver?.value
            });
            sePassengerList.push({
                supplier: supplierName,
                value: hPoint?.HPoint?.properties?.seat_back_upper_edge_passenger?.value
            });
            shDriverList.push({
                supplier: supplierName,
                value: hPoint?.HPoint?.properties?.Seat_back_height_of_Driver_seat?.value
            });
            shPassengerList.push({
                supplier: supplierName,
                value: hPoint?.HPoint?.properties?.Seat_back_height_of_Passenger_seat?.value
            });
            fhDriverList.push({
                supplier: supplierName,
                value: hPoint?.HPoint?.properties?.Free_height_Driver_Seat?.value
            });
            fhPassengerList.push({
                supplier: supplierName,
                value: hPoint?.HPoint?.properties?.Free_height_Passenger_Seat?.value
            });

        }
    });
    let seDriverRows1 = generateTableData(seDriverList);
    let seDriverRows = normalizeWithUnit(seDriverRows1, MM);
    let sePassengerRows1 = generateTableData(sePassengerList);
    let sePassengerRows = normalizeWithUnit(sePassengerRows1, MM);
    let shDriverRows1 = generateTableData(shDriverList);
    let shDriverRows = normalizeWithUnit(shDriverRows1, MM);
    let shPassengerRows1 = generateTableData(shPassengerList);
    let shPassengerRows = normalizeWithUnit(shPassengerRows1, MM);
    let fhDriverRows1 = generateTableData(fhDriverList);
    let fhDriverRows = normalizeWithUnit(fhDriverRows1, MM);
    let fhPassengerRows1 = generateTableData(fhPassengerList);
    let fhPassengerRows = normalizeWithUnit(fhPassengerRows1, MM);

    allTablesData.push({
        rowKey: "List3_711",
        value: seDriverRows
    });
    allTablesData.push({
        rowKey: "List3_712",
        value: sePassengerRows
    });
    allTablesData.push({
        rowKey: "List3_721",
        value: shDriverRows
    });
    allTablesData.push({
        rowKey: "List3_722",
        value: shPassengerRows
    });
    allTablesData.push({
        rowKey: "List3_81",
        value: fhDriverRows
    });
    allTablesData.push({
        rowKey: "List3_82",
        value: fhPassengerRows
    });
    // Updated code: Mapping Seating Dimension data and pushing to table
    const SeatingDimensionList = form1AData?.SeatingDimension?.SeatingDimensionData;
    let wFrontRearList = [];
    let wMMList = [];
    let stPassengerList = [];
    let psWidthList = [];
    let psDepthList = [];
    let plDimensionList = [];
    let flHeadLampList = [];
    let sbhDriverList = [];
    let sbhPassengerList = [];
    let iiDrivingSeatList = [];
    let coDrawingList = [];
    SeatingDimensionList && SeatingDimensionList.map(SeatingDimension => {
        if (SeatingDimension.supplier.active === true) {
            const supplierName = SeatingDimension?.supplier?.nameOfSupplier;
            wFrontRearList.push({
                supplier: supplierName,
                value: SeatingDimension?.SeatingDimension?.properties?.width_front_and_rear?.value
            });
            wMMList.push({
                supplier: supplierName,
                value: SeatingDimension?.SeatingDimension?.properties?.width_mm?.value
            });
            stPassengerList.push({
                supplier: supplierName,
                value: SeatingDimension?.SeatingDimension?.properties?.Select_type_of_seats_provided_for_Passenger?.value
            });
            psWidthList.push({
                supplier: supplierName,
                value: SeatingDimension?.SeatingDimension?.properties?.Passenger_seat_width?.value
            });
            psDepthList.push({
                supplier: supplierName,
                value: SeatingDimension?.SeatingDimension?.properties?.Passenger_seat_depth?.value
            });
            plDimensionList.push({
                supplier: supplierName,
                value: SeatingDimension?.SeatingDimension?.properties?.Passengers_Leg_space_dimension?.value
            });
            flHeadLampList.push({
                supplier: supplierName,
                value: SeatingDimension?.SeatingDimension?.properties?.Filament_lamp_category_for_headlamp?.value
            });
            sbhDriverList.push({
                supplier: supplierName,
                value: SeatingDimension?.SeatingDimension?.properties?.Seat_base_height_of_driver_seat?.value
            });
            sbhPassengerList.push({
                supplier: supplierName,
                value: SeatingDimension?.SeatingDimension?.properties?.Seat_base_height_og_passenger_seat?.value
            });
            coDrawingList.push({
                supplier: supplierName,
                value: SeatingDimension?.R_Point?.properties?.Coordinates_of_drawing?.value
            });
            iiDrivingSeatList.push({
                supplier: supplierName,
                value: SeatingDimension?.R_Point?.properties?.Intended_seat_back_inclination_Driving_seat?.value
            });

        }
    });
    let wFrontRearRows1 = generateTableData(wFrontRearList);
    let wFrontRearRows = normalizeWithUnit(wFrontRearRows1, MM);
    let wMMRows1 = generateTableData(wMMList);
    let wMMRows = normalizeWithUnit(wMMRows1, MM);
    let stPassengerRows = generateTableData(stPassengerList);
    let psWidthRows1 = generateTableData(psWidthList);
    let psWidthRows = normalizeWithUnit(psWidthRows1, MM);
    let psDepthRows1 = generateTableData(psDepthList);
    let psDepthRows = normalizeWithUnit(psDepthRows1, MM);
    let plDimensionRows1 = generateTableData(plDimensionList);
    let plDimensionRows = normalizeWithUnit(plDimensionRows1, MM);
    let flHeadLampRows = generateTableData(flHeadLampList);
    let sbhDriverRows1 = generateTableData(sbhDriverList);
    let sbhDriverRows = normalizeWithUnit(sbhDriverRows1, MM);
    let sbhPassengerRows1 = generateTableData(sbhPassengerList);
    let sbhPassengerRows = normalizeWithUnit(sbhPassengerRows1, MM);
    let iiDrivingSeatRows1 = generateTableData(iiDrivingSeatList);
    let iiDrivingSeatRows = normalizeWithUnit(iiDrivingSeatRows1, DEGREES);
    allTablesData.push({
        rowKey: "List3_311",
        value: wFrontRearRows
    });
    allTablesData.push({
        rowKey: "List3_312",
        value: wMMRows
    });
    allTablesData.push({
        rowKey: "List3_321",
        value: stPassengerRows
    });
    allTablesData.push({
        rowKey: "List3_322",
        value: psWidthRows
    });
    allTablesData.push({
        rowKey: "List3_323",
        value: psDepthRows
    });
    allTablesData.push({
        rowKey: "List3_4",
        value: rPointGeneralLayoutRows
    });
    allTablesData.push({
        rowKey: "List3_5",
        value: plDimensionRows
    });
    // allTablesData.push({
    //     rowKey: "List3_61",
    //     value: flHeadLampRows
    // });
    allTablesData.push({
        rowKey: "List3_61",
        value: sbhDriverRows
    });
    allTablesData.push({
        rowKey: "List3_62",
        value: sbhPassengerRows
    });
    allTablesData.push({
        rowKey: "List3_2941",
        value: iiDrivingSeatRows
    });
    
    
    const sArrangementList = form1AData?.Seating_Arrangement?.SeatingArrangementData;
    // console.log('sArrangementList:',sArrangementList)
    let noSeatsList = [];
    let loSeatsList = [];
    sArrangementList && sArrangementList.map(sArrangement => {
        if (sArrangement.supplier.active === true) {
            const supplierName = sArrangement?.supplier?.nameOfSupplier;
            noSeatsList.push({
                supplier: supplierName,
                value: sArrangement?.Seating_Arrangement?.properties?.Number_of_seats?.value
            });
            loSeatsList.push({
                supplier: supplierName,
                value: sArrangement?.Seating_Arrangement?.properties?.Location_of_seats?.value
            });
        }
    });
    let noSeatsRows = generateTableData(noSeatsList);
    let loSeatsRows = generateTableData(loSeatsList);
    allTablesData.push({
        rowKey: "List3_291",
        value: noSeatsRows
    });
    allTablesData.push({
        rowKey: "List3_292",
        value: loSeatsRows
    });

    // Updated code: Mapping Windscreen and Wiping System data and pushing to table
    const wswSystemList = form1AData?.Windscreen_and_Wiping_System?.WindscreenAndWipingSystem;
    // console.log('wswSystemList:',wswSystemList);
    let moWindScreemList = [];
    let biswList = [];
    let mMaterialList = [];
    let thickness1List = [];
    let partNumberList = [];
    let typeList = [];
    let thickness2List = [];
    let bisList = [];
    let uDrawingList = [];
    let thicknessList = [];
    let rakeAngleList = [];
    let partNoList = [];
    let identificationList = [];
    let typeDescriptionList = [];

    let wswTypeList =[];
    let wswNumber_Of_WipersLisy =[];
    
    let wswMakeList =[];
    let wswType_DuplicateList =[];
    let wswIdentification_MarkList =[];
    let wswRated_VoltageList =[];
    let wswSweep_FrequencyList =[];
    let wswHighest_Sweep_FrequencyList =[];
    let wswLowest_Sweep_FrequencyList =[];
    let waWiper_Arm_LengthList =[];
    let waWiper_Arm_MakeList =[];
    let wbWiper_Blade_LengthList =[];
    let wbWiper_Blade_MakeList =[];
    let wtWasher_Tank_TypeList =[];
    let wtWasher_Tank_MakeList =[];
    let wtWasher_Tank_Identification_NoList =[];
    let wtWasher_Tank_CapacityList =[];
    let wtWasher_Tank_MaterialList =[];
    let wtmWasher_Pump_MakeList =[];
    let wtmNumber_Of_NozzlesList =[];

    // console.log('wswSystemList:',wswSystemList);
    wswSystemList && wswSystemList.map(wswSystem => {
        if (wswSystem.supplier.active === true) {
            const supplierName = wswSystem?.supplier?.nameOfSupplier;
            moWindScreemList.push({
                supplier: supplierName,
                value: wswSystem?.Windscreen_and_Wiping_System?.properties?.Make_of_windscreen?.value
            });
            biswList.push({
                supplier: supplierName,
                value: wswSystem?.Windscreen_and_Wiping_System?.properties?.BIS_License_Number_of_Windscreen?.value
            });

            thicknessList.push({
                supplier: supplierName,
                value: wswSystem?.Windscreen_and_Wiping_System?.properties?.Thickness_mm?.value
              });

              rakeAngleList.push({
                supplier: supplierName,
                value: wswSystem?.Windscreen_and_Wiping_System?.properties?.Rake_Angle?.value
              });
              partNoList.push({
                supplier: supplierName,
                value: wswSystem?.Windscreen_and_Wiping_System?.properties?.Part_No_If_Applicable?.value
              });

              identificationList.push({
                supplier: supplierName,
                value: wswSystem?.Windscreen_and_Wiping_System?.properties?.Identification?.value
              });

              typeDescriptionList.push({
                supplier: supplierName,
                value: wswSystem?.Windscreen_and_Wiping_System?.properties?.Type_Description?.value
              });
            mMaterialList.push({
                supplier: supplierName,
                value: wswSystem?.Other_Glazing?.properties?.Make_and_Materials_used?.value
            });
            bisList.push({
                supplier: supplierName,
                value: wswSystem?.Other_Glazing?.properties?.BIS_license_number?.value
            });
            thickness1List.push({
                supplier: supplierName,
                value: wswSystem?.Other_Glazing?.properties?.Thickness_mm_1?.value
              });
              partNumberList.push({
                supplier: supplierName,
                value: wswSystem?.Other_Glazing?.properties?.Part_No_If_Applicable?.value
              });
              typeList.push({
                supplier: supplierName,
                value: wswSystem?.Other_Glazing?.properties?.Type_Toughened_Laminated?.value
              });
              thickness2List.push({
                supplier: supplierName,
                value: wswSystem?.Other_Glazing?.properties?.Thickness_mm_2?.value
              });


              wswTypeList.push({
                supplier: supplierName,
                value: wswSystem?.Windscreen_wiper?.properties?.Type?.value
              });
              wswNumber_Of_WipersLisy.push({
                supplier: supplierName,
                value: wswSystem?.Windscreen_wiper?.properties?.Number_Of_Wipers?.value
              });


              wswMakeList.push({
                supplier: supplierName,
                value: wswSystem?.Wiper_Motor?.properties?.Make?.value
              });
              wswType_DuplicateList.push({
                supplier: supplierName,
                value: wswSystem?.Wiper_Motor?.properties?.Type_Duplicate?.value
              });
              wswIdentification_MarkList.push({
                supplier: supplierName,
                value: wswSystem?.Wiper_Motor?.properties?.Identification_Mark?.value
              });
              wswRated_VoltageList.push({
                supplier: supplierName,
                value: wswSystem?.Wiper_Motor?.properties?.Rated_Voltage?.value
              });
              wswSweep_FrequencyList.push({
                supplier: supplierName,
                value: wswSystem?.Wiper_Motor?.properties?.Sweep_Frequency?.value
              });
              wswHighest_Sweep_FrequencyList.push({
                supplier: supplierName,
                value: wswSystem?.Wiper_Motor?.properties?.Highest_Sweep_Frequency?.value
              });
              wswLowest_Sweep_FrequencyList.push({
                supplier: supplierName,
                value: wswSystem?.Wiper_Motor?.properties?.Lowest_Sweep_Frequency?.value
              });

              waWiper_Arm_LengthList.push({
                supplier: supplierName,
                value: wswSystem?.Wiper_arm?.properties?.Wiper_Arm_Length?.value
              });
              waWiper_Arm_MakeList.push({
                supplier: supplierName,
                value: wswSystem?.Wiper_arm?.properties?.Wiper_Arm_Make?.value
              });

              wbWiper_Blade_LengthList.push({
                supplier: supplierName,
                value: wswSystem?.Wiper_Blade?.properties?.Wiper_Blade_Length?.value
              });
              wbWiper_Blade_MakeList.push({
                supplier: supplierName,
                value: wswSystem?.Wiper_Blade?.properties?.Wiper_Blade_Make?.value
              });
              





              wtWasher_Tank_TypeList.push({
                supplier: supplierName,
                value: wswSystem?.Washer_Tank?.properties?.Washer_Tank_Type?.value
              });
              wtWasher_Tank_MakeList.push({
                supplier: supplierName,
                value: wswSystem?.Washer_Tank?.properties?.Washer_Tank_Make?.value
              });
              wtWasher_Tank_Identification_NoList.push({
                supplier: supplierName,
                value: wswSystem?.Washer_Tank?.properties?.Washer_Tank_Identification_No?.value
              });
              wtWasher_Tank_CapacityList.push({
                supplier: supplierName,
                value: wswSystem?.Washer_Tank?.properties?.Washer_Tank_Capacity?.value
              });
              wtWasher_Tank_MaterialList.push({
                supplier: supplierName,
                value: wswSystem?.Washer_Tank?.properties?.Washer_Tank_Material?.value
              });
              wtmWasher_Pump_MakeList.push({
                supplier: supplierName,
                value: wswSystem?.Washer_tank_motor_or_Washer_Pump_if_provided?.properties?.Washer_Pump_Make?.value
              });
              wtmNumber_Of_NozzlesList.push({
                supplier: supplierName,
                value: wswSystem?.Washer_tank_motor_or_Washer_Pump_if_provided?.properties?.Number_Of_Nozzles?.value
              });





            uDrawingList.push({
                supplier: supplierName,
                value: wswSystem?.Windscreen_and_Wiping_System?.properties?.Upload_Drawing?.value
            });

        }
    });
    let moWindScreemRows = generateTableData(moWindScreemList);
    const updatedmoWindScreemRows= normalizeMsPrefix(moWindScreemRows);
    let biswRows = generateTableData(biswList);   
    let thicknessRows1 = twoWheeler ? 'NA' : generateTableData(thicknessList);
    let thicknessRows = normalizeWithUnit(thicknessRows1, MM);
let rakeAngleRows1 = twoWheeler ? 'NA' : generateTableData(rakeAngleList);
let rakeAngleRows = normalizeWithUnit(rakeAngleRows1, DEGREES);
let partNoRows = twoWheeler ? 'NA' : generateTableData(partNoList);
let identificationRows = twoWheeler ? 'NA' : generateTableData(identificationList);
let typeDescriptionRows = twoWheeler ? 'NA' : generateTableData(typeDescriptionList);

    let mMaterialRows = generateTableData(mMaterialList);
    const updatedmMaterialRows = normalizeMsPrefix(mMaterialRows);
    let bisRows = generateTableData(bisList);  
    let thickness1Rows1 = twoWheeler ? 'NA' : generateTableData(thickness1List);
    let thickness1Rows = normalizeWithUnit(thickness1Rows1, MM);    
    let partNumberRows = twoWheeler ? 'NA' : generateTableData(partNumberList);    
    let typeRows = twoWheeler ? 'NA' : generateTableData(typeList);    
    let thickness2Rows1 = twoWheeler ? 'NA' : generateTableData(thickness2List);
    let thickness2Rows = normalizeWithUnit(thickness2Rows1, MM);
    


    let wswTypeRows = twoWheeler ? 'NA' : generateTableData(wswTypeList);
    let wswNumber_Of_WipersRows = twoWheeler ? 'NA' : generateTableData(wswNumber_Of_WipersLisy);
    let wswMakeRows = twoWheeler ? 'NA' : generateTableData(wswMakeList);
    const updatedwswMakeRows = twoWheeler ? 'NA' : normalizeMsPrefix(wswMakeRows);
    let wswType_DuplicateRows = twoWheeler ? 'NA' : generateTableData(wswType_DuplicateList);
    let wswIdentification_MarkRows = twoWheeler ? 'NA' : generateTableData(wswIdentification_MarkList);
    let wswRated_VoltageRows1 = twoWheeler ? 'NA' : generateTableData(wswRated_VoltageList);
    let wswRated_VoltageRows = normalizeWithUnit(wswRated_VoltageRows1, V);
    let wswSweep_FrequencyRows1 = twoWheeler ? 'NA' : generateTableData(wswSweep_FrequencyList);
    let wswSweep_FrequencyRows = normalizeWithUnit(wswSweep_FrequencyRows1, CyclesPerMin);

    let wswHighest_Sweep_FrequencyRows1 = twoWheeler ? 'NA' : generateTableData(wswHighest_Sweep_FrequencyList);
    let wswHighest_Sweep_FrequencyRows = normalizeWithUnit(wswHighest_Sweep_FrequencyRows1, CyclesPerMin);

    let wswLowest_Sweep_FrequencyRows1 = twoWheeler ? 'NA' : generateTableData(wswLowest_Sweep_FrequencyList);
    let wswLowest_Sweep_FrequencyRows = normalizeWithUnit(wswLowest_Sweep_FrequencyRows1, CyclesPerMin);

    let waWiper_Arm_LengthRows1 = twoWheeler ? 'NA' : generateTableData(waWiper_Arm_LengthList);
    let waWiper_Arm_LengthRows = normalizeWithUnit(waWiper_Arm_LengthRows1, MM);
    let waWiper_Arm_MakeRows = twoWheeler ? 'NA' : generateTableData(waWiper_Arm_MakeList);
    const updatedwaWiper_Arm_MakeRows = twoWheeler ? 'NA' : normalizeMsPrefix(waWiper_Arm_MakeRows);
    let wbWiper_Blade_LengthRows1 = twoWheeler ? 'NA' : generateTableData(wbWiper_Blade_LengthList);
    let wbWiper_Blade_LengthRows = normalizeWithUnit(wbWiper_Blade_LengthRows1, MM);
    let wbWiper_Blade_MakeRows = twoWheeler ? 'NA' : generateTableData(wbWiper_Blade_MakeList);
    const updatedwbWiper_Blade_MakeRows = twoWheeler ? 'NA' : normalizeMsPrefix(wbWiper_Blade_MakeRows);
    let wtWasher_Tank_TypeRows = twoWheeler ? 'NA' : generateTableData(wtWasher_Tank_TypeList);
    let wtWasher_Tank_MakeRows = twoWheeler ? 'NA' : generateTableData(wtWasher_Tank_MakeList);
    const updatedwtWasher_Tank_MakeRows = twoWheeler ? 'NA' : normalizeMsPrefix(wtWasher_Tank_MakeRows);
    let wtWasher_Tank_Identification_NoRows = twoWheeler ? 'NA' : generateTableData(wtWasher_Tank_Identification_NoList);
    let wtWasher_Tank_CapacityRows = twoWheeler ? 'NA' : generateTableData(wtWasher_Tank_CapacityList);
    let wtWasher_Tank_MaterialRows = twoWheeler ? 'NA' : generateTableData(wtWasher_Tank_MaterialList);
    let wtmWasher_Pump_MakeRows = twoWheeler ? 'NA' : generateTableData(wtmWasher_Pump_MakeList);
    const updatedwtmWasher_Pump_MakeRows = twoWheeler ? 'NA' : normalizeMsPrefix(wtmWasher_Pump_MakeRows);
    let wtmNumber_Of_NozzlesRows = twoWheeler ? 'NA' : generateTableData(wtmNumber_Of_NozzlesList);
    


    allTablesData.push({
        rowKey: "List3_2111",
        value: updatedmoWindScreemRows
    });
    allTablesData.push({
        rowKey: "List3_2112",
        value: biswRows
    });
    allTablesData.push({
        rowKey: "List3_2113",
        value: thicknessRows
    });
    allTablesData.push({
        rowKey: "List3_2114",
        value: rakeAngleRows
    });
    allTablesData.push({
        rowKey: "List3_2115",
        value: partNoRows
    });
    allTablesData.push({
        rowKey: "List3_2116",
        value: identificationRows
    });
    allTablesData.push({
        rowKey: "List3_2117",
        value: typeDescriptionRows
    });
    allTablesData.push({
        rowKey: "List3_2121",
        value: updatedmMaterialRows
    });
    allTablesData.push({
        rowKey: "List3_2122",
        value: bisRows
    });

    allTablesData.push({
        rowKey: "List3_2123",
        value: thickness1Rows
    });
    allTablesData.push({
        rowKey: "List3_2124",
        value: partNumberRows
    });
    allTablesData.push({
        rowKey: "List3_2125",
        value: typeRows
    });
    allTablesData.push({
        rowKey: "List3_2126",
        value: thickness2Rows
    });





    allTablesData.push({
        rowKey: "List3_221",
        value: wswTypeRows
    });
    allTablesData.push({
        rowKey: "List3_222",
        value: wswNumber_Of_WipersRows
    });
    allTablesData.push({
        rowKey: "List3_231",
        value: updatedwswMakeRows
    });
    allTablesData.push({
        rowKey: "List3_232",
        value: wswType_DuplicateRows
    });
    allTablesData.push({
        rowKey: "List3_233",
        value: wswIdentification_MarkRows
    });
    allTablesData.push({
        rowKey: "List3_234",
        value: wswRated_VoltageRows
    });
    allTablesData.push({
        rowKey: "List3_235",
        value: wswSweep_FrequencyRows
    });
    allTablesData.push({
        rowKey: "List3_236",
        value: wswHighest_Sweep_FrequencyRows
    });
    allTablesData.push({
        rowKey: "List3_237",
        value: wswLowest_Sweep_FrequencyRows
    });
    allTablesData.push({
        rowKey: "List3_241",
        value: waWiper_Arm_LengthRows
    });
    allTablesData.push({
        rowKey: "List3_242",
        value: updatedwaWiper_Arm_MakeRows
    });
    allTablesData.push({
        rowKey: "List3_251",
        value: wbWiper_Blade_LengthRows
    });
    allTablesData.push({
        rowKey: "List3_252",
        value: updatedwbWiper_Blade_MakeRows
    });
    allTablesData.push({
        rowKey: "List3_261",
        value: wtWasher_Tank_TypeRows
    });
    allTablesData.push({
        rowKey: "List3_262",
        value: updatedwtWasher_Tank_MakeRows
    });
    allTablesData.push({
        rowKey: "List3_263",
        value: wtWasher_Tank_Identification_NoRows
    });
    allTablesData.push({
        rowKey: "List3_264",
        value: wtWasher_Tank_CapacityRows
    });
    allTablesData.push({
        rowKey: "List3_265",
        value: wtWasher_Tank_MaterialRows
    });


    allTablesData.push({
        rowKey: "List3_271",
        value: updatedwtmWasher_Pump_MakeRows
    });
    allTablesData.push({
        rowKey: "List3_272",
        value: wtmNumber_Of_NozzlesRows
    });
    allTablesData.push({
        rowKey: "List3_28",
        value: uDrawingRows
    });

    // Updated code: Mapping Payload data and pushing to table
    const PayloadList = form1AData?.Payload?.PayloadData;
    let mLoadList = [];

    PayloadList && PayloadList.map(Payload => {
        if (Payload.supplier.active === true) {
            const supplierName = Payload?.supplier?.nameOfSupplier;
            mLoadList.push({
                supplier: supplierName,
                value: Payload?.Payload?.properties?.Maximum_payload_declared_by_manufacturer?.value
            });

        }
    });
    let mLoadRows1 = generateTableData(mLoadList);
    let mLoadRows = normalizeWithUnit(mLoadRows1, KG);
    allTablesData.push({
        rowKey: "List3_121",
        value: mLoadRows
    });
    
    // Updated code: Mapping Dimension data and pushing to table
    const DimensionList = form1AData?.Dimension?.DimensionData;
    let oLengthList = [];
    let oWidthList = [];
    let uWidthList = [];
    let fOverhangList = [];
    let rOverhangList = [];
    DimensionList && DimensionList.map(Dimension => {
        if (Dimension.supplier.active === true) {
            const supplierName = Dimension?.supplier?.nameOfSupplier;
            oLengthList.push({
                supplier: supplierName,
                value: Dimension?.Dimension?.properties?.Over_all_length_of_Vehicle?.value
            });
            oWidthList.push({
                supplier: supplierName,
                value: Dimension?.Dimension?.properties?.Over_all_width_of_Vehicle?.value
            });
            uWidthList.push({
                supplier: supplierName,
                value: Dimension?.Dimension?.properties?.Unladen_weight_of_the_vehicle?.value
            });
            fOverhangList.push({
                supplier: supplierName,
                value: Dimension?.Dimension?.properties?.Front_overhang?.value
            });
            rOverhangList.push({
                supplier: supplierName,
                value: Dimension?.Dimension?.properties?.Rear_overhang?.value
            });

        }
    });
    let oLengthRows1 = generateTableData(oLengthList);
    let oLengthRows = normalizeWithUnit(oLengthRows1, MM);
    let oWidthRows1 = generateTableData(oWidthList);
    let oWidthRows = normalizeWithUnit(oWidthRows1, MM);
    let uWidthRows1 = generateTableData(uWidthList);
    let uWidthRows = normalizeWithUnit(uWidthRows1, KG);
    let fOverhangRows1 = generateTableData(fOverhangList);
    let fOverhangRows = normalizeWithUnit(fOverhangRows1, MM);
    let rOverhangRows1 = generateTableData(rOverhangList);
    let rOverhangRows = normalizeWithUnit(rOverhangRows1, MM);
    allTablesData.push({
        rowKey: "List3_11",
        value: dimension_Rows
    });
    allTablesData.push({
        rowKey: "List3_111",
        value: oLengthRows
    });
    allTablesData.push({
        rowKey: "List3_112",
        value: oWidthRows
    });
    allTablesData.push({
        rowKey: "List3_113",
        value: uWidthRows
    });
    allTablesData.push({
        rowKey: "List3_114",
        value: fOverhangRows
    });
    allTablesData.push({
        rowKey: "List3_115",
        value: rOverhangRows
    });

    // Updated code: Mapping VIN Numbering data and pushing to table
    const VehicleIdentificationNumberList = form1AData?.Vehicle_Identification_Number?.VehicleIdentificationNumber;
    let lvChasisList = [];
    let mivChasisList = [];
    let sntypeList = [];
    let plVinList = [];
    let HeightVinList = [];

    VehicleIdentificationNumberList && VehicleIdentificationNumberList.map(VehicleIdentificationNumber => {
        if (VehicleIdentificationNumber.supplier.active === true) {
            const supplierName = VehicleIdentificationNumber?.supplier?.nameOfSupplier;
            lvChasisList.push({
                supplier: supplierName,
                value: VehicleIdentificationNumber?.VINNumbering?.properties?.Location_VIN_on_Chassis?.value
            });
            mivChasisList.push({
                supplier: supplierName,
                value: VehicleIdentificationNumber?.VINNumbering?.properties?.Method_inscription_VIN_Chassis?.value
            });
            sntypeList.push({
                supplier: supplierName,
                value: VehicleIdentificationNumber?.VINNumbering?.properties?.Seria_number_type?.value
            });
            plVinList.push({
                supplier: supplierName,
                value: VehicleIdentificationNumber?.VINNumbering?.properties?.Photo_location_VIN?.value
            });
            HeightVinList.push({
                supplier: supplierName,
                value: VehicleIdentificationNumber?.VINNumbering?.properties?.Height_VIN_characters?.value
            });


        }
    });
    let lvChasisRows = generateTableData(lvChasisList);
    let mivChasisRows = generateTableData(mivChasisList);
    let sntypeRows = generateTableData(sntypeList);
    // let plVinRows = generateTableData(plVinList);
    let HeightVinRows1 = generateTableData(HeightVinList);
    let HeightVinRows = normalizeWithUnit(HeightVinRows1, MM);
    allTablesData.push({
        rowKey: "List1_04",
        value: lvChasisRows
    });
    allTablesData.push({
        rowKey: "List1_010",
        value: mivChasisRows
    });
    allTablesData.push({
        rowKey: "List1_011",
        value: sntypeRows
    });
    allTablesData.push({
        rowKey: "List2_831",
        value: plVinRows
    });
    allTablesData.push({
        rowKey: "List2_832",
        value: HeightVinRows
    });
    // Updated code: Mapping Vehicle Controls data and pushing to table
    const VehicleControlsLocationList = form1AData?.Vehicle_Controls_and_Their_Location?.VehicleControlsLocation;
    let HornControlList = [];
    let HeadLampSwitchList = [];
    let FrontLampList = [];
    let RearLampList = [];
    let DirectionIndicatorList = [];
    let HazardWarningList = [];
    let PositionLampList = [];
    let ParkingLampList = [];
    let fBrakeList = [];
    let rBrakeList = [];
    let hrWheelBrakeList = [];
    let ParkingBrakeList = [];
    let anyOtherControlList = [];

    let MasterLampList = [];
    let SupplementalEngList = [];
    let IgnitionSwitchList = [];
    let ElectricStarterList = [];
    let ManualChokeList = [];
    let FuelShutoffValveList = [];

    VehicleControlsLocationList && VehicleControlsLocationList.map(VehicleControlsLocation => {
        if (VehicleControlsLocation.supplier.active === true) {
            const supplierName = VehicleControlsLocation?.supplier?.nameOfSupplier;
            HornControlList.push({
                supplier: supplierName,
                value: VehicleControlsLocation?.Vehicle_Controls?.properties?.Horn_control_Provided?.value
            });
            HeadLampSwitchList.push({
                supplier: supplierName,
                value: VehicleControlsLocation?.Vehicle_Controls?.properties?.Head_lamp_Beam_switch?.value
            });
            FrontLampList.push({
                supplier: supplierName,
                value: VehicleControlsLocation?.Vehicle_Controls?.properties?.Front_Fog_Lamp_Control?.value
            });
            RearLampList.push({
                supplier: supplierName,
                value: VehicleControlsLocation?.Vehicle_Controls?.properties?.Rear_Fog_Lamp_Control?.value
            });
            DirectionIndicatorList.push({
                supplier: supplierName,
                value: VehicleControlsLocation?.Vehicle_Controls?.properties?.Direction_indicators?.value
            });
            HazardWarningList.push({
                supplier: supplierName,
                value: VehicleControlsLocation?.Vehicle_Controls?.properties?.Hazard_warning_signal?.value
            });
            PositionLampList.push({
                supplier: supplierName,
                value: VehicleControlsLocation?.Vehicle_Controls?.properties?.Position_Lamp?.value
            });
            ParkingLampList.push({
                supplier: supplierName,
                value: VehicleControlsLocation?.Vehicle_Controls?.properties?.Parking_Lamps?.value
            });
            fBrakeList.push({
                supplier: supplierName,
                value: VehicleControlsLocation?.Vehicle_Controls?.properties?.Front_brake_control?.value
            });
            rBrakeList.push({
                supplier: supplierName,
                value: VehicleControlsLocation?.Vehicle_Controls?.properties?.Rear_brake_control?.value
            });
            hrWheelBrakeList.push({
                supplier: supplierName,
                value: VehicleControlsLocation?.Vehicle_Controls?.properties?.Hand_Rear_Wheel_Brake?.value
            });
            ParkingBrakeList.push({
                supplier: supplierName,
                value: VehicleControlsLocation?.Vehicle_Controls?.properties?.parking_brake?.value
            });
            anyOtherControlList.push({
                supplier: supplierName,
                value: VehicleControlsLocation?.Vehicle_Controls?.properties?.Any_other_control?.value
            });



            SupplementalEngList.push({
                supplier: supplierName,
                value: VehicleControlsLocation?.Vehicle_Controls?.properties?.Supplemental_engine_stop?.value
            });
            MasterLampList.push({
                supplier: supplierName,
                value: VehicleControlsLocation?.Vehicle_Controls?.properties?.Master_Lamp?.value
            });
            IgnitionSwitchList.push({
                supplier: supplierName,
                value: VehicleControlsLocation?.Vehicle_Controls?.properties?.Ignition_Switch?.value
            });
            ElectricStarterList.push({
                supplier: supplierName,
                value: VehicleControlsLocation?.Vehicle_Controls?.properties?.Electric_Starter?.value
            });
            ManualChokeList.push({
                supplier: supplierName,
                value: VehicleControlsLocation?.Vehicle_Controls?.properties?.Manual_Choke?.value
            });
            FuelShutoffValveList.push({
                supplier: supplierName,
                value: VehicleControlsLocation?.Vehicle_Controls?.properties?.Fuel_Tank_Shutoff_Valve?.value
            });

        }
    });

    let HornControlRows = generateTableData(HornControlList);
    let HeadLampSwitchRows = generateTableData(HeadLampSwitchList);
    let FrontLampRows = generateTableData(FrontLampList);
    let RearLampRows = generateTableData(RearLampList);
    let DirectionIndicatorRows = generateTableData(DirectionIndicatorList);
    let HazardWarningRows = generateTableData(HazardWarningList);
    let PositionLampRows = generateTableData(PositionLampList);
    let ParkingLampRows = generateTableData(ParkingLampList);
    let fBrakeRows = generateTableData(fBrakeList);
    let rBrakeRows = generateTableData(rBrakeList);
    let hrWheelBrakeRows = generateTableData(hrWheelBrakeList);
    let ParkingBrakeRows = generateTableData(ParkingBrakeList);
    let anyOtherControlRows = generateTableData(anyOtherControlList);

    let SupplementalEngRows = generateTableData(SupplementalEngList);
    let MasterLampRows = generateTableData(MasterLampList);
    let IgnitionSwitchRows = generateTableData(IgnitionSwitchList);
    let ElectricStarterRows = generateTableData(ElectricStarterList);
    let ManualChokeRows = generateTableData(ManualChokeList);
    let FuelShutoffValveRows = generateTableData(FuelShutoffValveList);

    allTablesData.push({
        rowKey: "List2_826",
        value: HornControlRows
    });
    allTablesData.push({
        rowKey: "List2_827",
        value: HeadLampSwitchRows
    });
    allTablesData.push({
        rowKey: "List2_828",
        value: "NA"
    });
    allTablesData.push({
        rowKey: "List2_829",
        value: FrontLampRows
    });
    allTablesData.push({
        rowKey: "List2_8210",
        value: RearLampRows
    });
    allTablesData.push({
        rowKey: "List2_8211",
        value: DirectionIndicatorRows
    });
    allTablesData.push({
        rowKey: "List2_8212",
        value: HazardWarningRows
    });
    allTablesData.push({
        rowKey: "List2_8213",
        value: PositionLampRows
    });
    allTablesData.push({
        rowKey: "List2_8214",
        value: MasterLampRows
    });
    allTablesData.push({
        rowKey: "List2_8215",
        value: ParkingLampRows
    });
    allTablesData.push({
        rowKey: "List2_8216",
        value: "NA"
    });
    allTablesData.push({
        rowKey: "List2_8217",
        value: fBrakeRows
    });
    allTablesData.push({
        rowKey: "List2_8218",
        value: rBrakeRows
    });
    allTablesData.push({
        rowKey: "List2_8219",
        value: hrWheelBrakeRows
    });
    allTablesData.push({
        rowKey: "List2_8220",
        value: ParkingBrakeRows
    });
    allTablesData.push({
        rowKey: "List2_8221",
        value: "NA"
    });
    allTablesData.push({
        rowKey: "List2_8222",
        value: "NA"
    });
    allTablesData.push({
        rowKey: "List2_8224",
        value: anyOtherControlRows
    });

    allTablesData.push({
        rowKey: "List2_821",
        value: SupplementalEngRows
    });
    allTablesData.push({
        rowKey: "List2_822",
        value: IgnitionSwitchRows
    });
    allTablesData.push({
        rowKey: "List2_823",
        value: ElectricStarterRows
    });
    allTablesData.push({
        rowKey: "List2_824",
        value: ManualChokeRows
    });
    allTablesData.push({
        rowKey: "List2_825",
        value: FuelShutoffValveRows
    });
    // Updated code: Mapping Reversing Lamp data and pushing to table
    const ReversingLampList = form1AData?.Reversing_Lamp?.ReversingLamp;
    let rLampList = [];
    let trLampList = [];
    let ncLightList = [];
    let rBulbList = [];
    let categoryBulbList = [];
    let trBulbList = [];
    ReversingLampList && ReversingLampList.map(ReversingLamp => {
        if (ReversingLamp.supplier.active === true) {
            const supplierName = ReversingLamp?.supplier?.nameOfSupplier;
            rLampList.push({
                supplier: supplierName,
                value: ReversingLamp?.Reversing_Lamp?.properties?.Make_Reverse_Lamp?.value
            });
            trLampList.push({
                supplier: supplierName,
                value: ReversingLamp?.Reversing_Lamp?.properties?.TAC_Num_Reverse_lamp?.value
            });
            ncLightList.push({
                supplier: supplierName,
                value: ReversingLamp?.Reversing_Lamp?.properties?.Number_Colour_of_light?.value
            });
            rBulbList.push({
                supplier: supplierName,
                value: ReversingLamp?.Reverse_Lamp_Bulb_Type?.properties?.Make_Reverse_Lamp?.value
            });
            categoryBulbList.push({
                supplier: supplierName,
                value: ReversingLamp?.Reverse_Lamp_Bulb_Type?.properties?.Category_per_AIS_035?.value
            });
            trBulbList.push({
                supplier: supplierName,
                value: ReversingLamp?.Reverse_Lamp_Bulb_Type?.properties?.TAC_Number_Reverse_Lamp?.value
            });
        }
    });
    let rLampRows = generateTableData(rLampList);
    const updatedrLampRows = normalizeMsPrefix(rLampRows);
    let trLampRows = generateTableData(trLampList);
    let ncLightRows = generateTableData(ncLightList);
    let rBulbRows = generateTableData(rBulbList);
    const updatedrBulbRows= normalizeMsPrefix(rBulbRows);
    let categoryBulbRows = generateTableData(categoryBulbList);
    let trBulbRows = generateTableData(trBulbList);
    allTablesData.push({
        rowKey: "List2_7161",
        value: updatedrLampRows
    });
    allTablesData.push({
        rowKey: "List2_7162",
        value: trLampRows
    });
    allTablesData.push({
        rowKey: "List2_7163",
        value: ncLightRows
    });
    allTablesData.push({
        rowKey: "List2_75101",
        value: updatedrBulbRows
    });
    allTablesData.push({
        rowKey: "List2_75102",
        value: categoryBulbRows
    });
    allTablesData.push({
        rowKey: "List2_75103",
        value: trBulbRows
    });
    // Updated code: Mapping Grab handle or Straps data and pushing to table
    // const TwoWheelerAggregatesListt = form1AData?.Two_Wheeler_Aggregates?.TwoWheelerAggregatesData;
    // const GrabHandleList = form1AData?.Grab_handle?.GrabHandle;
    const twoWheelerData = form1AData?.Two_Wheeler_Aggregates?.TwoWheelerAggregatesData;
    const grabHandleData = form1AData?.Grab_handle?.GrabHandle;

    const TwoWheelerAggregatesListt = (
        twoWheelerData && Object.keys(twoWheelerData).length > 0
    ) ? twoWheelerData
        : (grabHandleData && Object.keys(grabHandleData).length > 0 ? grabHandleData : {});

    let dStrapList = [];
    let hTwoWheelerList = [];
    let hWheelerList = [];
    let hHTypeList = [];
    let typeHWheelerList = [];
    TwoWheelerAggregatesListt && TwoWheelerAggregatesListt.map(GrabHandle => {
        if (GrabHandle.supplier.active === true) {
            const supplierName = GrabHandle?.supplier?.nameOfSupplier;
            dStrapList.push({
                supplier: supplierName,
                value: GrabHandle?.Grab_handle_Straps?.properties?.Drawing_handhold_Strap?.value
            });
            hTwoWheelerList.push({
                supplier: supplierName,
                value: GrabHandle?.Grab_handle_Straps?.properties?.Handholds_pillion_Rider?.value
            });
            hWheelerList.push({
                supplier: supplierName,
                value: GrabHandle?.Grab_handle_Straps?.properties?.Handholds_passenger_3_wheeler?.value
            });
            hHTypeList.push({
                supplier: supplierName,
                value: GrabHandle?.Grab_handle_Straps?.properties?.Handholds_passenger_Type?.value
            });
            typeHWheelerList.push({
                supplier: supplierName,
                value: GrabHandle?.Grab_handle_Straps?.properties?.Type_Handhold_Pillion_rider?.value
            });
        }
    });
    // let dStrapRows = generateTableData(dStrapList);
    let hWheelerRows = generateTableData(hWheelerList);
    let hHTypeRows = generateTableData(hHTypeList);
    let hTwoWheelerRows = generateTableData(hTwoWheelerList);
    let typeHWheelerListRows = generateTableData(typeHWheelerList);
    allTablesData.push({
        rowKey: "List2_101",
        value: hTwoWheelerRows
    });
    allTablesData.push({
        rowKey: "List2_1012",
        value: dStrapRows
    });
    allTablesData.push({
        rowKey: "List2_1011",
        value: typeHWheelerListRows
    });
    allTablesData.push({
        rowKey: "List2_1013",
        value: hWheelerRows
    });
    allTablesData.push({
        rowKey: "List2_1014",
        value: hHTypeRows
    });
    allTablesData.push({
        rowKey: "List2_1015",
        value: straphandleholdRows
    });

    // Updated code: Mapping Fire Fighting System data and pushing to table
    const FireFightingSysteList = form1AData?.FireFightingSystem?.FireFightingSystemData;
    let FireFightingMakeList = [];
    let FireFightingWeightList = [];
    let FireFightingPosistionList = [];
    let FireFightingAlertationsList = [];
    let FireFightingPhotoList = [];

    FireFightingSysteList && FireFightingSysteList.map(FireFightingSystem => {
        if (FireFightingSystem.supplier.active === true) {

            const supplierName = FireFightingSystem?.supplier?.nameOfSupplier;
            FireFightingMakeList.push({
                supplier: supplierName,
                value: FireFightingSystem?.Fire_Fighting_System?.properties?.Make?.value
            });
            FireFightingWeightList.push({
                supplier: supplierName,
                value: FireFightingSystem?.Fire_Fighting_System?.properties?.Weight?.value
            });
            FireFightingPosistionList.push({
                supplier: supplierName,
                value: FireFightingSystem?.Fire_Fighting_System?.properties?.Schematic_Arrangement_position?.value
            });
            FireFightingAlertationsList.push({
                supplier: supplierName,
                value: FireFightingSystem?.Fire_Fighting_System?.properties?.Alterations_on_original_vehicle?.value
            });
            FireFightingPhotoList.push({
                supplier: supplierName,
                value: FireFightingSystem?.Fire_Fighting_System?.properties?.Photo_fire_fighting_system?.value
            });


        }
    });
    // let FireFightingMakeRows = generateTableData(FireFightingMakeList);
    let FireFightingMakeRows1 = twoWheeler ? 'NA' : generateTableData(FireFightingMakeList);
    const updatedFireFightingMakeRows= normalizeMsPrefix(FireFightingMakeRows1);
    // let FireFightingWeightRows1 = generateTableData(FireFightingWeightList);
    let FireFightingWeightRows1 = twoWheeler ? 'NA' : generateTableData(FireFightingWeightList);
    let FireFightingWeightRows = normalizeWithUnit(FireFightingWeightRows1, KG);
    // let FireFightingPosistionRows = generateTableData(FireFightingPosistionList);
    let FireFightingPosistionRows = twoWheeler ? 'NA' : generateTableData(FireFightingPosistionList);
    // let FireFightingAlertationsRows = generateTableData(FireFightingAlertationsList);
    let FireFightingAlertationsRows = twoWheeler ? 'NA' : generateTableData(FireFightingAlertationsList);
    // let FireFightingPhotoRows = generateTableData(FireFightingPhotoList);

  


    allTablesData.push({
        rowKey: "List2_181",
        value: updatedFireFightingMakeRows
    });
    allTablesData.push({
        rowKey: "List2_182",
        value: FireFightingWeightRows
    });
    allTablesData.push({
        rowKey: "List2_183",
        value: FireFightingPosistionRows
    });
    allTablesData.push({
        rowKey: "List2_184",
        value: FireFightingAlertationsRows
    });
    allTablesData.push({
        rowKey: "List2_185",
        value: FireFightingPhotoRows
    });
    // Updated code: Mapping Horn data and pushing to table
    const HornList = form1AData?.Horn?.Horn;
    let HornMakeList = [];
    let HornSelectList = [];
    let HornOperatingList = [];
    let HornNumberList = [];
    let HornTacList = [];
    let HornDrawingList = [];
    let HornDimensionalList = [];

    HornList && HornList.map(Horn => {
        if (Horn.supplier.active === true) {

            const supplierName = Horn?.supplier?.nameOfSupplier;
            HornMakeList.push({
                supplier: supplierName,
                value: Horn?.Horn?.properties?.Make_of_the_Horn?.value
            });
            HornSelectList.push({
                supplier: supplierName,
                value: Horn?.Horn?.properties?.Select_Horn_Type?.value
            });
            HornOperatingList.push({
                supplier: supplierName,
                value: Horn?.Horn?.properties?.Operating_voltage_of_Horn?.value
            });
            HornNumberList.push({
                supplier: supplierName,
                value: Horn?.Horn?.properties?.No_of_Horns?.value
            });
            HornTacList.push({
                supplier: supplierName,
                value: Horn?.Horn?.properties?.TAC_Number_Validity?.value
            });
            HornDrawingList.push({
                supplier: supplierName,
                value: Horn?.Horn?.properties?.Drawing_showing_location?.value
            });
            HornDimensionalList.push({
                supplier: supplierName,
                value: Horn?.Horn?.properties?.Dimensional_material_Details?.value
            });


        }
    });
    let HornMakeRows = generateTableData(HornMakeList);
    const updatedHornMakeRows = normalizeMsPrefix(HornMakeRows);
    let HornSelectRows = generateTableData(HornSelectList);
    let HornOperatingRows1 = generateTableData(HornOperatingList);
    let HornOperatingRows = normalizeWithUnit(HornOperatingRows1, V);
    let HornNumberRows = generateTableData(HornNumberList);
    let HornTacRows1 = generateTableData(HornTacList);
    const HornTacRows = extractTACNumbers(HornTacRows1);
    // let HornDrawingRows = generateTableData(HornDrawingList);
    let HornDimensionalRows = generateTableData(HornDimensionalList);


    allTablesData.push({
        rowKey: "List2_851",
        value: updatedHornMakeRows
    });
    allTablesData.push({
        rowKey: "List2_852",
        value: HornSelectRows
    });
    allTablesData.push({
        rowKey: "List2_8521",
        value: HornOperatingRows
    });
    allTablesData.push({
        rowKey: "List2_8522",
        value: HornNumberRows
    });
    allTablesData.push({
        rowKey: "List2_853",
        value: HornTacRows
    });
    allTablesData.push({
        rowKey: "List2_854",
        value: HornDrawingRows
    });
    allTablesData.push({
        rowKey: "List2_855",
        value: HornDimensionalRows
    });
    // Updated code: Mapping Instrument Cluster data and pushing to table
    const InstrumentClusterList = form1AData?.Instrument_Cluster?.InstrumentCluster;

    let ICMakeList = [];
    let ICTypeList = [];
    let ICRangeList = [];
    let ICMajorGraduationList = [];
    let ICMinorGraduationList = [];
    let ICToleranceList = [];
    let ICTechnicalList = [];
    let ICMSpeedList = [];
    let ICRatioList = [];
    let ICDrawingList = [];

    InstrumentClusterList && InstrumentClusterList.map(InstrumentCluster => {
        if (InstrumentCluster.supplier.active === true) {
            const supplierName = InstrumentCluster?.supplier?.nameOfSupplier;
            ICMakeList.push({
                supplier: supplierName,
                value: InstrumentCluster?.Instrument_Cluster?.properties?.Make_of_the_Instrument_Cluster?.value
            });
            ICTypeList.push({
                supplier: supplierName,
                value: InstrumentCluster?.Instrument_Cluster?.properties?.Type_of_Instrument_Cluster?.value
            });
            ICRangeList.push({
                supplier: supplierName,
                value: InstrumentCluster?.Instrument_Cluster?.properties?.Range_of_Speed_Displayed_min_to_max?.value
            });
            ICMajorGraduationList.push({
                supplier: supplierName,
                value: InstrumentCluster?.Instrument_Cluster?.properties?.Major_markings_in_graduation?.value
            });
            ICMinorGraduationList.push({
                supplier: supplierName,
                value: InstrumentCluster?.Instrument_Cluster?.properties?.Minor_markings_in_graduation?.value
            });
            ICToleranceList.push({
                supplier: supplierName,
                value: InstrumentCluster?.Instrument_Cluster?.properties?.Tolerance_of_measuring_mechanism_of_the_speedometer?.value
            });
            ICTechnicalList.push({
                supplier: supplierName,
                value: InstrumentCluster?.Instrument_Cluster?.properties?.Technical_Contant_of_the_Speedometer?.value
            })
            ICMSpeedList.push({
                supplier: supplierName,
                value: InstrumentCluster?.Instrument_Cluster?.properties?.Method_of_speed_or_Drive_mechanism_utilized?.value
            });
            ICRatioList.push({
                supplier: supplierName,
                value: InstrumentCluster?.Instrument_Cluster?.properties?.Overall_transmission_ratio_or_wheel_revolution?.value
            });
            ICDrawingList.push({
                supplier: supplierName,
                value: InstrumentCluster?.Instrument_Cluster?.properties?.Drawing_showing_the_Complete_Instrument_Cluster?.value
            });

        }
    });
    let ICMakeRows = generateTableData(ICMakeList);
    const updatedICMakeRows= normalizeMsPrefix(ICMakeRows);
    let ICTypeRows = generateTableData(ICTypeList);
    let ICRangeRows = generateTableData(ICRangeList);
    let ICMajorGraduationRows = generateTableData(ICMajorGraduationList);
    let ICMinorGraduationRows = generateTableData(ICMinorGraduationList);
    let ICToleranceRows = generateTableData(ICToleranceList);
    let ICTechnicalRows = generateTableData(ICTechnicalList);
    let ICMSpeedRows = generateTableData(ICMSpeedList);
    let ICRatioRows = generateTableData(ICRatioList);
    // let ICDrawingRows = generateTableData(ICDrawingList);
    allTablesData.push({
        rowKey: "List1_371",
        value: updatedICMakeRows
    });
    allTablesData.push({
        rowKey: "List1_372",
        value: ICTypeRows
    });
    allTablesData.push({
        rowKey: "List1_374",
        value: ICRangeRows
    });
    allTablesData.push({
        rowKey: "List1_3741",
        value: ICMajorGraduationRows
    });
    allTablesData.push({
        rowKey: "List1_3742",
        value: ICMinorGraduationRows
    });
    allTablesData.push({
        rowKey: "List1_375",
        value: ICToleranceRows
    });
    allTablesData.push({
        rowKey: "List1_376",
        value: ICTechnicalRows
    });
    allTablesData.push({
        rowKey: "List1_377",
        value: ICMSpeedRows
    });
    allTablesData.push({
        rowKey: "List1_378",
        value: ICRatioRows
    });
    allTablesData.push({
        rowKey: "List1_373",
        value: ICDrawingRows
    });
    // Updated code: Mapping Vehicle Performance data and pushing to table
    const VehiclePerformanceList = form1AData?.VehiclePerformance?.VehiclePerformanceData;
    let vehMaxHillAbilityList = [];
    let vehAnyOthFeatureList = [];
    VehiclePerformanceList && VehiclePerformanceList.map(VehiclePerformance => {
        if (VehiclePerformance.supplier.active === true) {
            const supplierName = VehiclePerformance?.supplier?.nameOfSupplier;
            vehMaxHillAbilityList.push({
                supplier: supplierName,
                value: VehiclePerformance?.Vehicle_Performance?.properties?.Max_hill_star_ability?.value
            });
            vehAnyOthFeatureList.push({
                supplier: supplierName,
                value: VehiclePerformance?.Vehicle_Performance?.properties?.Any_Other_Feature_Manf_Desire?.value
            });

        }
    });
    let vehMaxHillAbilityRows1 = generateTableData(vehMaxHillAbilityList);
    let vehMaxHillAbilityRows = normalizeWithUnit(vehMaxHillAbilityRows1, DEGREES);
    let vehAnyOthFeatureRows = generateTableData(vehAnyOthFeatureList);
    allTablesData.push({
        rowKey: "List1_117",
        value: vehMaxHillAbilityRows
    });
    allTablesData.push({
        rowKey: "List2_19",
        value: vehAnyOthFeatureRows
    });
    // Updated code: Mapping Hydraulic Brake Hose data and pushing to tables
    const HydraulicBrakeHoseList = form1AData?.Hydraulic_Brake_Hose?.HydraulicBrakeHose;
    let hyMakeList = [];
    let hyTACList = [];
    HydraulicBrakeHoseList && HydraulicBrakeHoseList.map(HydraulicBrakeHose => {
        if (HydraulicBrakeHose.supplier.active === true) {
            const supplierName = HydraulicBrakeHose?.supplier?.nameOfSupplier;
            hyMakeList.push({
                supplier: supplierName,
                value: HydraulicBrakeHose?.Hydraulic_Brake_Hose?.properties?.Make_Brake_Hose?.value
            });
            hyTACList.push({
                supplier: supplierName,
                value: HydraulicBrakeHose?.Hydraulic_Brake_Hose?.properties?.TAC_Num_Brake_Hose?.value
            });
        }
    });
    let hyMakeRows = generateTableData(hyMakeList);
    const updatedhyMakeRows = normalizeMsPrefix(hyMakeRows);
    let hyTACRows = generateTableData(hyTACList);
    allTablesData.push({
        rowKey: "List2_66",
        value: updatedhyMakeRows
    });
    allTablesData.push({
        rowKey: "List2_661",
        value: hyTACRows
    });

    // Updated code: Mapping Two Wheeler External Projection data and pushing to tables
    const TwoWheelerExternalProjectionList = form1AData?.Two_Wheeler_External_Projection?.TwoWheelerExternalProjection;
    let twComplianceList = [];
    let twLegGuardList = [];
    let twLegMaterialList = [];
    let twWidthList = [];

    TwoWheelerExternalProjectionList && TwoWheelerExternalProjectionList.map(TwoWheelerExternalProjection => {
        if (TwoWheelerExternalProjection.supplier.active === true) {
            const supplierName = TwoWheelerExternalProjection?.supplier?.nameOfSupplier;
            twComplianceList.push({
                supplier: supplierName,
                value: TwoWheelerExternalProjection?.External_Projection_Details?.properties?.compliance_per_AIS_120?.value
            });
            twLegGuardList.push({
                supplier: supplierName,
                value: TwoWheelerExternalProjection?.External_Projection_Details?.properties?.Leg_Guard_two_wheelers?.value
            });
            twLegMaterialList.push({
                supplier: supplierName,
                value: TwoWheelerExternalProjection?.External_Projection_Details?.properties?.Material_of_Leg_Gaurd?.value
            });
            twWidthList.push({
                supplier: supplierName,
                value: TwoWheelerExternalProjection?.External_Projection_Details?.properties?.Width_of_Guard?.value
            });


        }
    });
    let twComplianceRows = generateTableData(twComplianceList);
    let twLegGuardRows = generateTableData(twLegGuardList);
    let twLegMaterialRows = generateTableData(twLegMaterialList);
    let twWidthRows = generateTableData(twWidthList);

    allTablesData.push({
        rowKey: "List2_152",
        value: twComplianceRows
    });
    allTablesData.push({
        rowKey: "List2_153",
        value: twLegGuardRows
    });
    allTablesData.push({
        rowKey: "List2_1531",
        value: twLegMaterialRows
    });
    allTablesData.push({
        rowKey: "List2_1532",
        value: twWidthRows
    });

    
    // Updated code: Mapping Two Wheeler Aggregates data and pushing to tables
    const TwoWheelerAggregatesList = form1AData?.Two_Wheeler_Aggregates?.TwoWheelerAggregatesData;
    let twNumberOfFootRestList = [];
    let twDrawingFootRestList = [];
    let stTypeOfStandList = [];
    let stNoOfStandsList = [];
    let stSpringStandList = [];
    let stRetSysList = [];
    let stWireDiamList = [];
    let stFreeLengthList = [];
    let stOuterCoilDiamList = [];
    let ssAssLengthList = [];
    let ssAssLengthNotInUseList = [];
    let ssSpringMaterialList = [];
    let stDiagInstallList = [];
    let ssDrawingList = [];
    // let ssTyreMaxWidthList = [];

    TwoWheelerAggregatesList && TwoWheelerAggregatesList.map(TwoWheelerAggregates => {
        if (TwoWheelerAggregates.supplier.active === true) {
            const supplierName = TwoWheelerAggregates?.supplier?.nameOfSupplier;
            twNumberOfFootRestList.push({
                supplier: supplierName,
                value: TwoWheelerAggregates?.Two_Wheeler_Foot_Rest?.properties?.No_Foot_Rests_Floor_Boards?.value
            });
            twDrawingFootRestList.push({
                supplier: supplierName,
                value: TwoWheelerAggregates?.Two_Wheeler_Foot_Rest?.properties?.Drawing_Footrest_Floor_Boards?.value
            });
            stTypeOfStandList.push({
                supplier: supplierName,
                value: TwoWheelerAggregates?.Two_Wheeler_Stand?.properties?.Type_Stand_vehicle?.value
            });
            stNoOfStandsList.push({
                supplier: supplierName,
                value: TwoWheelerAggregates?.Two_Wheeler_Stand?.properties?.No_stands_In_vehicle?.value
            });
            stRetSysList.push({
                supplier: supplierName,
                value: TwoWheelerAggregates?.Two_Wheeler_Stand?.properties?.Retention_system_vehicle?.value
            });
            stSpringStandList.push({
                supplier: supplierName,
                value: TwoWheelerAggregates?.Two_Wheeler_Stand?.properties?.One_spring_per_stand?.value
            });
            stWireDiamList.push({
                supplier: supplierName,
                value: TwoWheelerAggregates?.Two_Wheeler_Stand?.properties?.Wire_Diameter_Spring?.value
            });
            stFreeLengthList.push({
                supplier: supplierName,
                value: TwoWheelerAggregates?.Two_Wheeler_Stand?.properties?.Free_length_spring?.value
            });
            stOuterCoilDiamList.push({
                supplier: supplierName,
                value: TwoWheelerAggregates?.Two_Wheeler_Stand?.properties?.Outer_Coil_diameter?.value
            });
            ssAssLengthList.push({
                supplier: supplierName,
                value: TwoWheelerAggregates?.Two_Wheeler_Stand?.properties?.Assembled_length?.value
            });
            ssAssLengthNotInUseList.push({
                supplier: supplierName,
                value: TwoWheelerAggregates?.Two_Wheeler_Stand?.properties?.Assembled_length_not_in_use?.value
            });
            ssSpringMaterialList.push({
                supplier: supplierName,
                value: TwoWheelerAggregates?.Two_Wheeler_Stand?.properties?.Specify_Spring_Material?.value
            });
            stDiagInstallList.push({
                supplier: supplierName,
                value: TwoWheelerAggregates?.Two_Wheeler_Stand?.properties?.Diagram_Stands_installation?.value
            });
            ssDrawingList.push({
                supplier: supplierName,
                value: TwoWheelerAggregates?.Spray_Suppression_Rear_Mud_Gaurd?.properties?.Diagram_spray_suppression?.value
            });
            // ssTyreMaxWidthList.push({
            //     supplier: supplierName,
            //     value: TwoWheelerAggregates?.Spray_Suppression_Rear_Mud_Gaurd?.properties?.Tyre_max_Width?.value
            // });
        }
    });
    // let twNumberOfFootRows = generateTableData(twNumberOfFootRestList);
    let twNumberOfFootRows = twoWheeler ? generateTableData(twNumberOfFootRestList) : 'NA';

    // let twDrawingFootRows = generateTableData(twDrawingFootRestList);
    // let stNoOfStandsRows = generateTableData(stNoOfStandsList);
    let stNoOfStandsRows = twoWheeler ? generateTableData(stNoOfStandsList) : 'NA';

    // let stTypeOfStandRows = generateTableData(stTypeOfStandList);
    let stTypeOfStandRows = twoWheeler ? generateTableData(stTypeOfStandList) : 'NA';
    // let stRetSysRows = generateTableData(stRetSysList);
    let stRetSysRows = twoWheeler ? generateTableData(stRetSysList) : 'NA';

    // let stSpringStandRows = generateTableData(stSpringStandList);
    let stSpringStandRows = twoWheeler ? generateTableData(stSpringStandList) : 'NA';

    // let stWireDiamRows = generateTableData(stWireDiamList);
    // let stFreeLengthRows = generateTableData(stFreeLengthList);
    // let stOuterCoilDiamRows = generateTableData(stOuterCoilDiamList);
    // let ssAssLengthRows = generateTableData(ssAssLengthList);
    // let ssAssLengthNotInUseRows = generateTableData(ssAssLengthNotInUseList);
    // let ssSpringMaterialRows = generateTableData(ssSpringMaterialList);

    let stWireDiamRows1 = twoWheeler ? generateTableData(stWireDiamList) : 'NA';
    let stWireDiamRows = normalizeWithUnit(stWireDiamRows1, MM);
    let stFreeLengthRows1 = twoWheeler ? generateTableData(stFreeLengthList) : 'NA';
    let stFreeLengthRows = normalizeWithUnit(stFreeLengthRows1, MM);
    let stOuterCoilDiamRows1 = twoWheeler ? generateTableData(stOuterCoilDiamList) : 'NA';
    let stOuterCoilDiamRows = normalizeWithUnit(stOuterCoilDiamRows1, MM);
    let ssAssLengthRows1 = twoWheeler ? generateTableData(ssAssLengthList) : 'NA';
    let ssAssLengthRows = normalizeWithUnit(ssAssLengthRows1, MM);
    let ssAssLengthNotInUseRows1 = twoWheeler ? generateTableData(ssAssLengthNotInUseList) : 'NA';
    let ssAssLengthNotInUseRows = normalizeWithUnit(ssAssLengthNotInUseRows1, MM);
    let ssSpringMaterialRows = twoWheeler ? generateTableData(ssSpringMaterialList) : 'NA';
    

    // let stDiagInstallRows = generateTableData(stDiagInstallList);
    // let ssDrawingRows = generateTableData(ssDrawingList);
    // let ssTyreMaxWidthRows = generateTableData(ssTyreMaxWidthList);
    allTablesData.push({
        rowKey: "List2_16",
        value: twNumberOfFootRows
    });
    allTablesData.push({
        rowKey: "List2_17",
        value: twDrawingFootRows
    });
    allTablesData.push({
        rowKey: "List2_13",
        value: stTypeOfStandRows
    });
    allTablesData.push({
        rowKey: "List2_131",
        value: stNoOfStandsRows 
    });
    allTablesData.push({
        rowKey: "List2_132",
        value: stRetSysRows 
    });
    allTablesData.push({
        rowKey: "List2_133", 
        value: stSpringStandRows
    });
    allTablesData.push({
        rowKey: "List2_1331",
        value: stWireDiamRows
    });
    allTablesData.push({
        rowKey: "List2_1332",
        value: stFreeLengthRows
    });
    allTablesData.push({
        rowKey: "List2_1333",
        value: stOuterCoilDiamRows
    });
    allTablesData.push({
        rowKey: "List2_1334",
        value: ssAssLengthRows
    });
    allTablesData.push({
        rowKey: "List2_1335",
        value: ssAssLengthNotInUseRows
    });
    allTablesData.push({
        rowKey: "List2_1336",
        value: ssSpringMaterialRows
    });
    allTablesData.push({
        rowKey: "List2_134",
        value: stDiagInstallRows
    });
    allTablesData.push({
        rowKey: "List2_111",
        value: ssDrawingRows
    });
    // allTablesData.push({
    //     rowKey: "List2_112",
    //     value: ssTyreMaxWidthRows
    // });
    // Updated code: Mapping Brake Fluid data and pushing to table
    const BrakeFluidList = form1AData?.Brake_Fluid?.BrakeFluid;

    let brMakeList = [];
    let brTypeList = [];
    BrakeFluidList && BrakeFluidList.map(BrakeFluid => {
        if (BrakeFluid.supplier.active === true) {
            const supplierName = BrakeFluid?.supplier?.nameOfSupplier;
            brMakeList.push({
                supplier: supplierName,
                value: BrakeFluid?.Hydraulic_Brake_Fluid?.properties?.Make_of_Brake_Fluid?.value
            });
            brTypeList.push({
                supplier: supplierName,
                value: BrakeFluid?.Hydraulic_Brake_Fluid?.properties?.Type_of_Brake_Fluid?.value
            });

        }
    });
    let brMakeRows = generateTableData(brMakeList);
    const updatedbrMakeRows= normalizeMsPrefix(brMakeRows);
    let brTypeRows = generateTableData(brTypeList);

    allTablesData.push({
        rowKey: "List2_671",
        value: updatedbrMakeRows
    });
    allTablesData.push({
        rowKey: "List2_672",
        value: brTypeRows
    });
    return allTablesData;
}

function generateTableData(dataList) {
    if (Array.isArray(dataList) && dataList.length > 0) {
        // Extract 'Wheel_rim_size' or 'value' from each wheelRim
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


/*
   Exporting `populateMultiSupData` and `tyresList` for use in other modules.
   This allows for the processing of multiple supplier data and tyre-related information.
*/
export { populateMultiSupData, tyresList, dStrapRows, handholdStrap3wheeler_Rows };










