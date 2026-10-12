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
  Packer,
  WidthType,
  Footer,
  PageNumber,
  ImageRun,
  VerticalAlign,
  VerticalPositionRelativeFrom,
  VerticalPositionAlign,
  convertInchesToTwip,
} from "docx";
// import docSeal from '../assets/images/docSeal.png';


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
async function fetchAndProcessImage(footerData) {
  const dataOfFooterr = footerData.footerData.SealSign.properties;
  const fileName = dataOfFooterr.Upload_Seal.file_name;
  const imageUrl = `https://bv-reg.com/api/files/downloads/${fileName}`; 
  // const imageUrl = `/files/downloads/${fileName}`; 
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
function getWheelRimsTableData(dataList) {
  if (Array.isArray(dataList) && dataList.length > 0) {
    // Extract 'Wheel_rim_size' or 'value' from each wheelRim and join them into a single string
    const values = dataList.map(
      (wheelRim) =>
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
docSealImage: Image used as a seal or watermark for document authenticity.
fileName: Name of the image file (e.g., "image.png").
imageUrl: URL where the image is hosted online.
*/

// let docSeal; // Declare it globally or at the required scope
// Declare docSealImage

async function generateForm7(form7Data, footerData) {
  const docSealImage = await fetchAndProcessImage(footerData);

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

  // console.log("data of form7:", form7Data);
  //     // const drawing=footerData.form7Data.Body_Overhang.properties.Upload_drawing_showing_the_seating_layout_of_the_vehicle.file_name;
  //     // let drawing1=[];

  //     // const extractFileName = (fileName) => {
  //     //     const parts = fileName.split('-');
  //     //     return parts.slice(1).join('-');
  //     // };

  //     // const vehModel = [{ value: extractFileName(drawing) }];
  //     // drawing1.push(vehModel);

  const drawing =
    footerData.form7Data.Body_Overhang.properties
      .Upload_drawing_showing_the_seating_layout_of_the_vehicle.file_name;
  // const extractFileName = (fileName) => {
  //   const parts = fileName.split("-");
  //   return parts.slice(1).join("-");
  // };
  const extractFileName = (fileName) => {
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
    const parts = nameWithoutExt.split('-');
    const name = parts.length > 1 ? parts.slice(1).join('-') : parts[0];
    return name ? `ref: ${name}` : " ";
  };
  

  let drawing1 = [];

  drawing1 = [{ value: extractFileName(drawing) }];
  const drawing_Rows = getWheelRimsTableData(drawing1);

  
  
  const vehicleGeneralInformationList =
    form7Data.Vehicle_General_Information.VehicleGeneralInformation;
  const vehicleDimensionsList = form7Data.Vehicle_Dimensions.VehicleDimensions;
  const VehicleElectricalSpecificationList =
    form7Data.Vehicle_Electrical_Specification.VehicleElectricalSpecification;
  // Set suspensionList based on available data in form7Data; prioritize Suspension data over SteeringSuspension data because of 2 Wheeler and 3 Wheeler
  let suspensionList = null;
  if (
    form7Data?.Suspension?.Suspension &&
    form7Data.Suspension.Suspension.length > 0
  ) {
    suspensionList = form7Data.Suspension.Suspension;
  } else if (
    form7Data?.SteeringSuspension?.SteeringSuspensionData &&
    form7Data.SteeringSuspension.SteeringSuspensionData.length > 0
  ) {
    suspensionList = form7Data.SteeringSuspension.SteeringSuspensionData;
  }
  //const brakes = form7Data.Brakes.Brakes[0];
  //const tyres = form7Data.Tyres.TyresData[0];
  //const weights = form7Data.Weights.Weights[0];
  const brakesList = form7Data.Brakes.Brakes;
  const tyresList = form7Data.Tyres.TyresData;
  const weightsList = form7Data.Weights.Weights;
  const WindscreenWipingList = form7Data.Windscreen_wiping.Windscreenwiping;
  const TractionBatterypackList =
    form7Data.Traction_Battery_Pack.TractionBatterypack;
  const VehiclePerformanceList =
    form7Data.Vehicle_Performance.VehiclePerformance;
  const GeneralarrangementofthevehicleList =
    form7Data.General_arrangement_of_the_vehicle.Generalarrangementofthevehicle;
  const WheelRimSizeList = form7Data.Wheel_Rim.WheelRim;
  const DriveTrainSystemList = form7Data.Drive_Train_System.DriveTrainSystemData;
  let Front_Wheel_Rim_Size_List = [];
  let Rear_Wheel_Rim_Size_List = [];
  WheelRimSizeList.map((vehDesc) => {
    if (vehDesc.supplier.active === true) {
      const supplierName = vehDesc?.supplier?.nameOfSupplier;
      const Front_Wheel_Rim_Size = {
        supplier: supplierName,
        value: vehDesc?.Wheel_Rim_Size?.properties?.Front_Wheel_Rim_Size?.value,
      };
      Front_Wheel_Rim_Size_List.push(Front_Wheel_Rim_Size);
      const Rear_Wheel_Rim_Size = {
        supplier: supplierName,
        value: vehDesc?.Wheel_Rim_Size?.properties?.Rear_Wheel_Rim_Size?.value,
      };
      Rear_Wheel_Rim_Size_List.push(Rear_Wheel_Rim_Size);
    }
  });

  const Front_Wheel_Rim_Size_Rows = getWheelRimsTableData(
    Front_Wheel_Rim_Size_List
  );
  const Rear_Wheel_Rim_Size_Rows = getWheelRimsTableData(
    Rear_Wheel_Rim_Size_List
  );

  
 
  // Front-specific lists
  let Front_Tyre_Size_Designation_Including_Ply_Rating_List = [];
  let Front_Speed_Index_List = [];
  let Front_Load_Index_Load_Rating_List = [];
  let Front_Tyre_Type_List = [];
  let Front_Laden_List = [];
  let Front_Veh_Type_List = [];

  // Rear-specific lists
  let Rear_Tyre_Size_Designation_Including_Ply_Rating_List = [];
  let Rear_Speed_Index_List = [];
  let Rear_Load_Index_Load_Rating_List = [];
  let Rear_Tyre_Type_List = [];
  let Rear_Laden_List = [];
  let Rear_Veh_Type_List = [];

  tyresList.map((vehDesc) => {
    if (vehDesc.supplier.active === true) {
      const supplierName = vehDesc.supplier.nameOfSupplier;

      // FRONT TYRE
      const front = vehDesc?.Front_Tyre?.properties;
      if (front) {
        Front_Tyre_Size_Designation_Including_Ply_Rating_List.push({
          supplier: supplierName,
          value: front?.Tyre_size_designation_including_ply_rating?.value,
        });

        Front_Speed_Index_List.push({
          supplier: supplierName,
          value: front?.Speed_index?.value,
        });

        Front_Load_Index_Load_Rating_List.push({
          supplier: supplierName,
          value: front?.Load_index_Load_rating?.value,
        });

        Front_Tyre_Type_List.push({
          supplier: supplierName,
          value: front?.Tyre_Type?.value,
        });

        Front_Laden_List.push({
          supplier: supplierName,
          value: front?.Laden?.value,
        });

        Front_Veh_Type_List.push({
          supplier: supplierName,
          value: front?.tyre_vehicle_type?.value,
        });
      }

      // REAR TYRE
      const rear = vehDesc?.Rear_Tyre?.properties;
      if (rear) {
        Rear_Tyre_Size_Designation_Including_Ply_Rating_List.push({
          supplier: supplierName,
          value: rear?.Tyre_size_designation_including_ply_rating?.value,
        });

        Rear_Speed_Index_List.push({
          supplier: supplierName,
          value: rear?.Speed_index?.value,
        });

        Rear_Load_Index_Load_Rating_List.push({
          supplier: supplierName,
          value: rear?.Load_index_Load_rating?.value,
        });

        Rear_Tyre_Type_List.push({
          supplier: supplierName,
          value: rear?.Tyre_Type?.value,
        });

        Rear_Laden_List.push({
          supplier: supplierName,
          value: rear?.Laden?.value,
        });

        Rear_Veh_Type_List.push({
          supplier: supplierName,
          value: rear?.tyre_vehicle_type?.value,
        });
      }
    }
  });

  // Front Tyre Rows
  const Front_Tyre_size_designation_including_ply_rating_Rows =
    getWheelRimsTableData(
      Front_Tyre_Size_Designation_Including_Ply_Rating_List
    );
  const Front_Speed_index_Rows = getWheelRimsTableData(Front_Speed_Index_List);
  const Front_Load_index_Load_rating_Rows = getWheelRimsTableData(
    Front_Load_Index_Load_Rating_List
  );
  const Front_Tyre_Type_Rows = getWheelRimsTableData(Front_Tyre_Type_List);
  const Front_Laden_Rows = getWheelRimsTableData(Front_Laden_List);
  const Front_veh_Type_Rows = getWheelRimsTableData(Front_Veh_Type_List);

  // Rear Tyre Rows
  const Rear_Tyre_size_designation_including_ply_rating_Rows =
    getWheelRimsTableData(Rear_Tyre_Size_Designation_Including_Ply_Rating_List);
  const Rear_Speed_index_Rows = getWheelRimsTableData(Rear_Speed_Index_List);
  const Rear_Load_index_Load_rating_Rows = getWheelRimsTableData(
    Rear_Load_Index_Load_Rating_List
  );
  const Rear_Tyre_Type_Rows = getWheelRimsTableData(Rear_Tyre_Type_List);
  const Rear_Laden_Rows = getWheelRimsTableData(Rear_Laden_List);

  // console.log("veh_Type_Rows:", Front_veh_Type_Rows);
  // firstValue = Front_veh_Type_Rows;
  // if (firstValue === "2-Wheeler") {
  //   twoWheeler = true;
  //   console.log("true");
  //   console.log("inside firstValue :", firstValue);
  //   console.log("inside firstValue twoWheeler:", twoWheeler);
  // }

  let vehModelList = [];
  let vehTypeList = [];
  let vehCategoryList = [];
  let importerNameAddressList = [];
  let mfNameAddressList = [];
  let variantList = [];
  let variant_typeList = [];
  let variant_Vehicle_CategoryList = [];
  vehicleGeneralInformationList.map((vehDesc) => {
    if (vehDesc.supplier.active === true) {
      const supplierName = vehDesc?.supplier?.nameOfSupplier;
      const vehModel = {
        supplier: supplierName,
        value: vehDesc?.Manufacturer_Details?.properties?.Basic_model?.value,
      };
      vehModelList.push(vehModel);
      const vehType = {
        supplier: supplierName,
        value:
          vehDesc?.Manufacturer_Details?.properties?.Type_Of_Vehicle?.value,
      };
      vehTypeList.push(vehType);
      const vehCategory = {
        supplier: supplierName,
        value:
          vehDesc?.Manufacturer_Details?.properties?.Vehicle_category?.value,
      };
      vehCategoryList.push(vehCategory);
      const vehNameAddress = {
        supplier: supplierName,
        value:
          vehDesc?.Manufacturer_Details?.properties
            ?.Name_and_address_of_the_vehicle_importer?.value,
      };
      importerNameAddressList.push(vehNameAddress);
      const mfNameAddress = {
        supplier: supplierName,
        value:
          vehDesc?.Manufacturer_Details?.properties
            ?.Manufacturer_name_and_address?.value,
      };
      mfNameAddressList.push(mfNameAddress);
      const variant = {
          supplier: supplierName,
          value: vehDesc?.Manufacturer_Details?.properties?.variant?.value
      }
      variantList.push(variant);
      const variant_type = {
        supplier: supplierName,
        value: vehDesc?.Variants?.properties?.Type_Of_Vehicle?.value,
      };
      variant_typeList.push(variant_type);
      const variant_Vehicle_Category = {
        supplier: supplierName,
        value: vehDesc?.Variants?.properties?.Vehicle_category?.value,
      };
      variant_Vehicle_CategoryList.push(variant_Vehicle_Category);
    }
  });

  const vehModelRows = getWheelRimsTableData(vehModelList);
  const vehTypeRows = getWheelRimsTableData(vehTypeList);
  const categoryRows = getWheelRimsTableData(vehCategoryList);
  firstValue = categoryRows;
  if (firstValue === "L2" || firstValue === "L1") {
    twoWheeler = true;
  }

  const importerNameAddressRows = getWheelRimsTableData(
    importerNameAddressList
  );
  const mfNameAddressRows = getWheelRimsTableData(mfNameAddressList);
  const updatedmfNameAddressRows= normalizeMsPrefix(mfNameAddressRows);
  const variantRows = getWheelRimsTableData(variantList);
  const variant_typeRows = getWheelRimsTableData(variant_typeList);
  const variant_Vehicle_CategoryRows = getWheelRimsTableData(
    variant_Vehicle_CategoryList
  );

  // Updated code: Mapping General arrangement of the vehicle data and pushing to table
  let Frames_Long_member_size_list = [];
  let Number_of_cross_members_if_any_list = [];
  let Wheel_base_list = [];

  let Overall_width_list = [];
  let Overall_length_list = [];
  let Overall_height_list = [];
  let Front_track_list = [];
  let Rear_track_list = [];
  let Min_ground_clearance_list = [];
  let Cargo_box_dimensions_if_fitted_list = [];
  let Front_Body_Overhang_list = [];
  let Rear_Body_Overhang_list = [];
  let Frames_overhang_at_front_list = [];
  let Frames_overhang_at_rear_end_list = [];
  let Load_body_platform_area_list = [];
  let Upload_drawing_showing_the_seating_layout_of_the_vehicle_List = [];

  vehicleDimensionsList.map((vehDesc) => {
    if (vehDesc.supplier.active === true) {
      const supplierName = vehDesc?.supplier?.nameOfSupplier;
      const Frames_Long_member_size = {
        supplier: supplierName,
        value: vehDesc?.Frame.properties?.Frames_Long_member_size?.value,
      };
      Frames_Long_member_size_list.push(Frames_Long_member_size);
      const Number_of_cross_members_if_any = {
        supplier: supplierName,
        value: vehDesc?.Frame.properties?.Number_of_cross_members_if_any?.value,
      };
      Number_of_cross_members_if_any_list.push(Number_of_cross_members_if_any);
      const Wheel_base = {
        supplier: supplierName,
        value:
          vehDesc?.General_arrangement_of_the_vehicle_dimension?.properties
            ?.Wheel_base?.value,
      };
      Wheel_base_list.push(Wheel_base);
      const Overall_width = {
        supplier: supplierName,
        value:
          vehDesc?.General_arrangement_of_the_vehicle_dimension?.properties
            .Overall_width?.value,
      };
      Overall_width_list.push(Overall_width);
      const Overall_length = {
        supplier: supplierName,
        value:
          vehDesc?.General_arrangement_of_the_vehicle_dimension?.properties
            .Overall_length?.value,
      };
      Overall_length_list.push(Overall_length);
      const Overall_height = {
        supplier: supplierName,
        value:
          vehDesc?.General_arrangement_of_the_vehicle_dimension?.properties
            ?.Overall_height?.value,
      };
      Overall_height_list.push(Overall_height);
      const Front_track = {
        supplier: supplierName,
        value:
          vehDesc?.General_arrangement_of_the_vehicle_dimension?.properties
            .Front_track?.value,
      };
      Front_track_list.push(Front_track);
      const Rear_track = {
        supplier: supplierName,
        value:
          vehDesc?.General_arrangement_of_the_vehicle_dimension?.properties
            ?.Rear_track?.value,
      };
      Rear_track_list.push(Rear_track);
      const Min_ground = {
        supplier: supplierName,
        value:
          vehDesc?.General_arrangement_of_the_vehicle_dimension?.properties
            .Min_ground_clearance?.value,
      };
      Min_ground_clearance_list.push(Min_ground);
      const Cargo_box_dimensions = {
        supplier: supplierName,
        value:
          vehDesc?.General_arrangement_of_the_vehicle_dimension?.properties
            ?.Cargo_box_dimensions_if_fitted?.value,
      };
      Cargo_box_dimensions_if_fitted_list.push(Cargo_box_dimensions);
      const Front_Body_Overhang = {
        supplier: supplierName,
        value: vehDesc?.Body_Overhang.properties?.Front_Body_Overhang?.value,
      };
      Front_Body_Overhang_list.push(Front_Body_Overhang);
      const Rear_Body_Overhang = {
        supplier: supplierName,
        value: vehDesc?.Body_Overhang?.properties?.Rear_Body_Overhang?.value,
      };
      Rear_Body_Overhang_list.push(Rear_Body_Overhang);
      const Frames_overhang_at_front = {
        supplier: supplierName,
        value:
          vehDesc?.Frame_Overhang?.properties?.Frames_overhang_at_front?.value,
      };
      Frames_overhang_at_front_list.push(Frames_overhang_at_front);
      const Frames_overhang_at_rear_end = {
        supplier: supplierName,
        value:
          vehDesc?.Frame_Overhang?.properties?.Frames_overhang_at_rear_end
            ?.value,
      };
      Frames_overhang_at_rear_end_list.push(Frames_overhang_at_rear_end);
      const Load_body_platform_area = {
        supplier: supplierName,
        value:
          vehDesc?.Frame_Overhang?.properties?.Load_body_platform_area?.value,
      };
      Load_body_platform_area_list.push(Load_body_platform_area);
      const Upload_drawing_showing_the_seating_layout_of_the_vehicle = {
        supplier: supplierName,
        value:
          vehDesc?.Body_Overhang?.properties
            ?.Upload_drawing_showing_the_seating_layout_of_the_vehicle?.value,
      };
      Upload_drawing_showing_the_seating_layout_of_the_vehicle_List.push(
        Upload_drawing_showing_the_seating_layout_of_the_vehicle
      );
    }
  });

  const Frames_Long_member_size_Rows = getWheelRimsTableData(
    Frames_Long_member_size_list
  );
  // let Frames_Long_member_size_Rows = normalizeWithUnit(Frames_Long_member_size_Rows1, MM);
  const Number_of_cross_members_if_any_Rows = getWheelRimsTableData(
    Number_of_cross_members_if_any_list
  );
  const Wheel_base_Rows1 = getWheelRimsTableData(Wheel_base_list);
  let Wheel_base_Rows = normalizeWithUnit(Wheel_base_Rows1, MM);
  // console.log("Wheel_base:", Wheel_base_list);
  const Overall_width_Rows1 = getWheelRimsTableData(Overall_width_list);
  let Overall_width_Rows = normalizeWithUnit(Overall_width_Rows1, MM);
  const Overall_length_Rows1 = getWheelRimsTableData(Overall_length_list);
  let Overall_length_Rows = normalizeWithUnit(Overall_length_Rows1, MM);
  const Overall_height_Rows1 = getWheelRimsTableData(Overall_height_list);
  let Overall_height_Rows = normalizeWithUnit(Overall_height_Rows1, MM);
  const Front_track_Rows1 = getWheelRimsTableData(Front_track_list);
  let Front_track_Rows = normalizeWithUnit(Front_track_Rows1, MM);
  const Rear_track_Rows1 = getWheelRimsTableData(Rear_track_list);
  let Rear_track_Rows = normalizeWithUnit(Rear_track_Rows1, MM);
  const Min_ground_clearance_Rows1 = getWheelRimsTableData(
    Min_ground_clearance_list
  );
  let Min_ground_clearance_Rows = normalizeWithUnit(Min_ground_clearance_Rows1, MM);
  const Cargo_box_dimensions_if_fitted_Rows1 = getWheelRimsTableData(
    Cargo_box_dimensions_if_fitted_list
  );
  let Cargo_box_dimensions_if_fitted_Rows = normalizeWithUnit(Cargo_box_dimensions_if_fitted_Rows1, MM);
  const Front_Body_Overhang_Rows1 = getWheelRimsTableData(
    Front_Body_Overhang_list
  );
  let Front_Body_Overhang_Rows = normalizeWithUnit(Front_Body_Overhang_Rows1, MM);
  const Rear_Body_Overhang_Rows1 = getWheelRimsTableData(
    Rear_Body_Overhang_list
  );
  let Rear_Body_Overhang_Rows = normalizeWithUnit(Rear_Body_Overhang_Rows1, MM);
  const Frames_overhang_at_front_Rows1 = getWheelRimsTableData(
    Frames_overhang_at_front_list
  );
  let Frames_overhang_at_front_Rows = normalizeWithUnit(Frames_overhang_at_front_Rows1, MM);
  const Frames_overhang_at_rear_end_Rows1 = getWheelRimsTableData(
    Frames_overhang_at_rear_end_list
  );
  let Frames_overhang_at_rear_end_Rows = normalizeWithUnit(Frames_overhang_at_rear_end_Rows1, MM);
  const Load_body_platform_area_Rows1 = getWheelRimsTableData(
    Load_body_platform_area_list
  );
  let Load_body_platform_area_Rows = normalizeWithUnit(Load_body_platform_area_Rows1, MM_SQ);
  const Upload_drawing_showing_the_seating_layout_of_the_vehicle_Rows =
    getWheelRimsTableData(
      Upload_drawing_showing_the_seating_layout_of_the_vehicle_List
    );
  // Updated code: Mapping Steering System data and pushing to table
  let Type_of_Shock_absorbers_provided_at_the_front_and_Rear_list = [];
  let Type_of_springs_provided_at_front_and_Rear_list = [];
  let Antiroll_bar_if_provided_list = [];

  let Front_Type_Desc_List = [];
  let Rear_Type_Desc_List = [];

  let Type_of_Shock_absorbers_front_list = [];
  let Type_of_Shock_absorbers_rear_list = [];

  let Type_of_springs_front_list = [];
  let Type_of_springs_rear_list = [];

  let Antiroll_bar_front_list = [];
  let Antiroll_bar_rear_list = [];

  let Select_Type_Steering_control_provided_list = [];
  let Specify_steering_gear_ratio_list = [];
  let Steering_wheel_diameter_list = [];

  suspensionList.map((vehDesc) => {
    if (vehDesc.supplier.active === true) {
      const supplierName = vehDesc.supplier.nameOfSupplier;
      const Type_of_Shock_absorbers_provided_at_the_front_and_Rear = {
        supplier: supplierName,
        value:
          vehDesc?.Suspension?.properties
            ?.Type_of_Shock_absorbers_provided_at_the_front_and_Rear?.value,
      };
      Type_of_Shock_absorbers_provided_at_the_front_and_Rear_list.push(
        Type_of_Shock_absorbers_provided_at_the_front_and_Rear
      );

      const Type_of_springs_provided_at_front_and_Rear = {
        supplier: supplierName,
        value:
          vehDesc?.Suspension?.properties
            ?.Type_of_springs_provided_at_front_and_Rear?.value,
      };
      Type_of_springs_provided_at_front_and_Rear_list.push(
        Type_of_springs_provided_at_front_and_Rear
      );
      const Antiroll_bar_if_provided = {
        supplier: supplierName,
        value: vehDesc?.Suspension?.properties?.Antiroll_bar_if_provided?.value,
      };
      Antiroll_bar_if_provided_list.push(Antiroll_bar_if_provided);

      const Front_Type_Desc = {
        supplier: supplierName,
        value:
          vehDesc?.Front_Suspension?.properties?.Front_Type_Description?.value,
      };
      Front_Type_Desc_List.push(Front_Type_Desc);
      // console.log(
      //   "Type_of_Shock_absorbers_front_list:",
      //   Type_of_Shock_absorbers_front_list
      // );
      const Rear_Type_Desc = {
        supplier: supplierName,
        value:
          vehDesc?.Rear_Suspension?.properties?.Rear_Type_Description?.value,
      };
      Rear_Type_Desc_List.push(Rear_Type_Desc);

      const Type_of_Shock_absorbers_front = {
        supplier: supplierName,
        value:
          vehDesc?.Front_Suspension?.properties
            ?.Type_of_Shock_absorbers_provided_at_the_Front?.value,
      };
      Type_of_Shock_absorbers_front_list.push(Type_of_Shock_absorbers_front);
      // console.log(
      //   "Type_of_Shock_absorbers_front_list:",
      //   Type_of_Shock_absorbers_front_list
      // );
      const Type_of_Shock_absorbers_rear = {
        supplier: supplierName,
        value:
          vehDesc?.Rear_Suspension?.properties
            ?.Type_of_Shock_absorbers_provided_at_the_Rear?.value,
      };
      Type_of_Shock_absorbers_rear_list.push(Type_of_Shock_absorbers_rear);

      const Type_of_springs_front = {
        supplier: supplierName,
        value:
          vehDesc?.Front_Suspension?.properties
            ?.Type_of_springs_provided_at_Front?.value,
      };
      Type_of_springs_front_list.push(Type_of_springs_front);

      const Type_of_springs_rear = {
        supplier: supplierName,
        value:
          vehDesc?.Rear_Suspension?.properties
            ?.Type_of_springs_provided_at_Rear?.value,
      };
      Type_of_springs_rear_list.push(Type_of_springs_rear);

      const Antiroll_bar_front = {
        supplier: supplierName,
        value:
          vehDesc?.Front_Suspension?.properties?.Antiroll_bar_if_provided
            ?.value,
      };
      Antiroll_bar_front_list.push(Antiroll_bar_front);

      const Antiroll_bar_rear = {
        supplier: supplierName,
        value:
          vehDesc?.Rear_Suspension?.properties?.Antiroll_bar_if_provided?.value,
      };
      Antiroll_bar_rear_list.push(Antiroll_bar_rear);

      const Select_Type_Steering_control_provided = {
        supplier: supplierName,
        value:
          vehDesc?.Steering_System?.properties
            ?.Select_Type_Steering_control_provided.value,
      };
      Select_Type_Steering_control_provided_list.push(
        Select_Type_Steering_control_provided
      );
      const Steering_wheel_diameter = {
        supplier: supplierName,
        value:
          vehDesc?.Steering_System?.properties?.Steering_wheel_diameter.value,
      };
      Steering_wheel_diameter_list.push(Steering_wheel_diameter);
      const Specify_steering_gear_ratio = {
        supplier: supplierName,
        value:
          vehDesc?.Steering_System?.properties?.Specify_steering_gear_ratio
            .value,
      };
      Specify_steering_gear_ratio_list.push(Specify_steering_gear_ratio);
    }
  });

  const Type_of_Shock_absorbers_provided_at_the_front_and_Rear_Rows =
    getWheelRimsTableData(
      Type_of_Shock_absorbers_provided_at_the_front_and_Rear_list
    );
  const Type_of_springs_provided_at_front_and_Rear_Rows = getWheelRimsTableData(
    Type_of_springs_provided_at_front_and_Rear_list
  );
  const Antiroll_bar_if_provided_Rows = getWheelRimsTableData(
    Antiroll_bar_if_provided_list
  );

  const Front_Type_Desc_Rows = getWheelRimsTableData(Front_Type_Desc_List);
  const Rear_Type_Desc_Rows = getWheelRimsTableData(Rear_Type_Desc_List);

  const Type_of_Shock_absorbers_front_Rows = getWheelRimsTableData(
    Type_of_Shock_absorbers_front_list
  );
  const Type_of_Shock_absorbers_rear_Rows = getWheelRimsTableData(
    Type_of_Shock_absorbers_rear_list
  );

  const Type_of_springs_front_Rows = getWheelRimsTableData(
    Type_of_springs_front_list
  );
  const Type_of_springs_rear_Rows = getWheelRimsTableData(
    Type_of_springs_rear_list
  );

  const Antiroll_bar_front_Rows = getWheelRimsTableData(
    Antiroll_bar_front_list
  );
  const Antiroll_bar_rear_Rows = getWheelRimsTableData(Antiroll_bar_rear_list);

  // const Select_Type_Steering_control_provided_Rows = getWheelRimsTableData(Select_Type_Steering_control_provided_list);
  const Select_Type_Steering_control_provided_Rows = twoWheeler
    ? "Handle Bar"
    : getWheelRimsTableData(Select_Type_Steering_control_provided_list);

  // const Steering_wheel_diameter_Rows = getWheelRimsTableData(Steering_wheel_diameter_list);
  const Steering_wheel_diameter_Rows1 = twoWheeler
    ? "NA"
    : getWheelRimsTableData(Steering_wheel_diameter_list);

    let Steering_wheel_diameter_Rows = normalizeWithUnit(Steering_wheel_diameter_Rows1, MM);

  // const Specify_steering_gear_ratio_Rows = getWheelRimsTableData(Specify_steering_gear_ratio_list);
  const Specify_steering_gear_ratio_Rows = twoWheeler
    ? "NA"
    : getWheelRimsTableData(Specify_steering_gear_ratio_list);
  // Updated code: Mapping Brief Brake Information data and pushing to table
  let Select_Type_of_Braking_System_list = [];
  let Whether_ABS_provided_list = [];
  let Parking_Brake_list = [];
  let Is_there_any_secondary_brake_list = [];
  let whether_Auto_Slac__Fitted_list = [];
  let Front_and_rear_braking_area_List = [];
  let type_of_friction_front_wheel_brakes_List = [];
  let type_of_friction_rear_wheel_brakes_List = [];
  brakesList.map((vehDesc) => {
    if (vehDesc.supplier.active === true) {
      const supplierName = vehDesc.supplier.nameOfSupplier;
      const Select_Type_of_Braking_System = {
        supplier: supplierName,
        value:
          vehDesc?.Parking_Brake?.properties
            ?.Select_Type_of_Braking_System?.value,
      };
      Select_Type_of_Braking_System_list.push(Select_Type_of_Braking_System);
      const Whether_ABS_provided = {
        supplier: supplierName,
        value: vehDesc?.ABS?.properties?.Whether_ABS_provided?.value,
      };
      Whether_ABS_provided_list.push(Whether_ABS_provided);
      const Parking_Brake = {
        supplier: supplierName,
        value: vehDesc?.Parking_Brake?.properties?.Parking_Brake1?.value,
      };
      Parking_Brake_list.push(Parking_Brake);
      const Is_there_any_secondary_brake = {
        supplier: supplierName,
        value:
          vehDesc?.Re_Generative_Brake?.properties?.Is_there_any_secondary_brake
            ?.value,
      };
      Is_there_any_secondary_brake_list.push(Is_there_any_secondary_brake);

      const whether_Auto_Slac__Fitted = {
        supplier: supplierName,
        value:
          vehDesc?.Free_Play_and_Ratio?.properties?.whether_Auto_Slac__Fitted
            ?.value,
      };
      whether_Auto_Slac__Fitted_list.push(whether_Auto_Slac__Fitted);
      const Front_and_rear_braking_area = {
        supplier: supplierName,
        value:
          vehDesc?.Parts_of_Brake_System?.properties
            ?.Front_and_rear_braking_area?.value,
      };
      Front_and_rear_braking_area_List.push(Front_and_rear_braking_area);
      const type_of_friction_front_wheel_brakes = {
        supplier: supplierName,
        value:
          vehDesc?.Brake_Types?.properties?.type_of_friction_front_wheel_brakes
            ?.value,
      };
      type_of_friction_front_wheel_brakes_List.push(
        type_of_friction_front_wheel_brakes
      );
      const type_of_friction_rear_wheel_brakes = {
        supplier: supplierName,
        value:
          vehDesc?.Brake_Types?.properties?.type_of_friction_Rear_wheel_brakes
            ?.value,
      };
      type_of_friction_rear_wheel_brakes_List.push(
        type_of_friction_rear_wheel_brakes
      );
    }
  });

  const Select_Type_of_Braking_System_Rows = getWheelRimsTableData(
    Select_Type_of_Braking_System_list
  );
  const Whether_ABS_provided_Rows = getWheelRimsTableData(
    Whether_ABS_provided_list
  );
  const Parking_Brake_Rows = getWheelRimsTableData(Parking_Brake_list);
  const Is_there_any_secondary_brake_Rows = getWheelRimsTableData(
    Is_there_any_secondary_brake_list
  );
  const whether_Auto_Slac__Fitted_list_Rows = getWheelRimsTableData(
    whether_Auto_Slac__Fitted_list
  );
  const Front_and_rear_braking_area_Rows1 = getWheelRimsTableData(
    Front_and_rear_braking_area_List
  );
  let Front_and_rear_braking_area_Rows = normalizeWithUnit(Front_and_rear_braking_area_Rows1, CM_SQ);
  const type_of_friction_front_wheel_brakes_Rows = getWheelRimsTableData(
    type_of_friction_front_wheel_brakes_List
  );
  const type_of_friction_rear_wheel_brakes_Rows = getWheelRimsTableData(
    type_of_friction_rear_wheel_brakes_List
  );

  
  
  let Vehicle_kerb_weight_list = [];
  let Kerb_weight_front_axle_list=[];
  let Kerb_weight_rear_axle_list=[];
  let Kerb_weight_Total_list=[];
  let Maximum_gradeability_list = [];
  let GVW_Distribution_on_front_axle_List = [];
  let GVW_Distribution_on_rear_axle_List = [];
  let GVW_Other_axle_List=[];
  let GVW_Max_GVW_List = [];
  let Gcw_Max_Kg_List = [];
  // Max_GCW_kg
  weightsList.map((vehDesc) => {
    if (vehDesc.supplier.active === true) {
      const supplierName = vehDesc?.supplier?.nameOfSupplier;
      const Vehicle_kerb_weight = {
        supplier: supplierName,
        value: vehDesc?.Kerb_Weight?.properties?.Vehicle_kerb_weight?.value,
      };
      Vehicle_kerb_weight_list.push(Vehicle_kerb_weight);

      const Kerb_weight_front_axle = {
        supplier: supplierName,
        value: vehDesc?.Kerb_Weight?.properties?.Kerb_weight_front_axle?.value,
      };
      Kerb_weight_front_axle_list.push(Kerb_weight_front_axle);
      

      
      const Kerb_weight_rear_axle = {
        supplier: supplierName,
        value: vehDesc?.Kerb_Weight?.properties?.Kerb_weight_rear_axle?.value,
      };
      Kerb_weight_rear_axle_list.push(Kerb_weight_rear_axle);

      const Kerb_weight_Total = {
        supplier: supplierName,
        value: vehDesc?.Kerb_Weight?.properties?.Kerb_weight_Total?.value,
      };
      Kerb_weight_Total_list.push(Kerb_weight_Total);

      const Maximum_gradeability = {
        supplier: supplierName,
        value: vehDesc?.Gradability?.properties?.Maximum_gradeability?.value,
      };
      Maximum_gradeability_list.push(Maximum_gradeability);
      const GVW_Distribution_on_front_axle = {
        supplier: supplierName,
        value:
          vehDesc?.Gross_Vehicle_Weight?.properties
            ?.GVW_Distribution_on_front_axle?.value,
      };
      GVW_Distribution_on_front_axle_List.push(GVW_Distribution_on_front_axle);
      const GVW_Distribution_on_rear_axle = {
        supplier: supplierName,
        value:
          vehDesc?.Gross_Vehicle_Weight?.properties
            ?.GVW_Distribution_on_rear_axle?.value,
      };
      GVW_Distribution_on_rear_axle_List.push(GVW_Distribution_on_rear_axle);

      const GVW_Other_axle = {
        supplier: supplierName,
        value:
          vehDesc?.Gross_Vehicle_Weight?.properties
            ?.Other_axle?.value,
      };
      GVW_Other_axle_List.push(GVW_Other_axle);

      const GVW_Max_GVW = {
        supplier: supplierName,
        value:
          vehDesc?.Gross_Vehicle_Weight?.properties?.Gross_Vehicle_Weight
            ?.value,
      };
      GVW_Max_GVW_List.push(GVW_Max_GVW);
      const Gcw_Max_Kg = {
        supplier: supplierName,
        value:
          vehDesc?.Maximum_Carrying_capacity?.properties?.Max_GCW_kg?.value,
      };
      Gcw_Max_Kg_List.push(Gcw_Max_Kg);
    }
  });
  const Vehicle_kerb_weight_Rows1 = getWheelRimsTableData(
    Vehicle_kerb_weight_list
  );
  let Vehicle_kerb_weight_Rows = normalizeWithUnit(Vehicle_kerb_weight_Rows1, KG);

  let Kerb_weight_front_axle_Rows1= getWheelRimsTableData(Kerb_weight_front_axle_list);
  let Kerb_weight_front_axle_Rows = normalizeWithUnit(Kerb_weight_front_axle_Rows1, KG);
  let Kerb_weight_rear_axle_Rows1= getWheelRimsTableData(Kerb_weight_rear_axle_list);
  let Kerb_weight_rear_axle_Rows = normalizeWithUnit(Kerb_weight_rear_axle_Rows1, KG);
  let Kerb_weight_Total_Rows1= getWheelRimsTableData(Kerb_weight_Total_list);
  let Kerb_weight_Total_Rows = normalizeWithUnit(Kerb_weight_Total_Rows1, KG);
  
  
  const Maximum_gradeability_Rows = getWheelRimsTableData(
    Maximum_gradeability_list
  );
  // let Maximum_gradeability_Rows = normalizeWithUnit(Maximum_gradeability_Rows1, PERCENT_OR_DEGREE);
  const GVW_Distribution_on_front_axle_Rows1 = getWheelRimsTableData(
    GVW_Distribution_on_front_axle_List
  );
  let GVW_Distribution_on_front_axle_Rows = normalizeWithUnit(GVW_Distribution_on_front_axle_Rows1, KG);
  const GVW_Distribution_on_rear_axle_Rows1 = getWheelRimsTableData(
    GVW_Distribution_on_rear_axle_List
  );
  let GVW_Distribution_on_rear_axle_Rows = normalizeWithUnit(GVW_Distribution_on_rear_axle_Rows1, KG);
  const GVW_Other_axle_Rows1 = getWheelRimsTableData(
    GVW_Other_axle_List
  );
  let GVW_Other_axle_Rows = normalizeWithUnit(GVW_Other_axle_Rows1, KG);
  const GVW_Max_GVW_Rows1 = getWheelRimsTableData(GVW_Max_GVW_List);
  let GVW_Max_GVW_Rows = normalizeWithUnit(GVW_Max_GVW_Rows1, KG);
  const Gcw_Max_Kg_Rows1 = getWheelRimsTableData(Gcw_Max_Kg_List);
  let Gcw_Max_Kg_Rows = normalizeWithUnit(Gcw_Max_Kg_Rows1, KG);
  // Updated code: Mapping Wiping System data and pushing to table
  let Make_of_Wiper_Motor_List = [];
  let Wiping_system_List = [];
  WindscreenWipingList.map((vehDesc) => {
    if (vehDesc.supplier.active === true) {
      const supplierName = vehDesc?.supplier?.nameOfSupplier;
      const Make_of_Wiper_Motor = {
        supplier: supplierName,
        value: vehDesc?.Wiping_System?.properties?.Make_of_Wiper_Motor?.value,
      };
      Make_of_Wiper_Motor_List.push(Make_of_Wiper_Motor);
      const Wiping_system = {
        supplier: supplierName,
        value: vehDesc?.Wiping_System?.properties?.Wiping_system?.value,
      };
      Wiping_system_List.push(Wiping_system);
    }
  });
  // const Make_of_Wiper_Motor_Rows = getWheelRimsTableData(Make_of_Wiper_Motor_List);
  const Make_of_Wiper_Motor_Rows = twoWheeler
    ? "NA"
    : getWheelRimsTableData(Make_of_Wiper_Motor_List);

    const updatedMake_of_Wiper_Motor_Rows = normalizeMsPrefix(Make_of_Wiper_Motor_Rows);
  // const Wiping_system_Rows = getWheelRimsTableData(Wiping_system_List);
  const Wiping_system_Rows = twoWheeler
    ? "NA"
    : getWheelRimsTableData(Wiping_system_List);
  // Updated code: Mapping Electrical system data and pushing to table
  let Traction_Battery_Pack_List = [];
  TractionBatterypackList.map((vehDesc) => {
    if (vehDesc.supplier.active === true) {
      const supplierName = vehDesc?.supplier?.nameOfSupplier;
      const Traction_Battery_Pack = {
        supplier: supplierName,
        value:
          vehDesc?.Traction_Battery_Pack?.properties?.Battery_rating?.value,
      };
      Traction_Battery_Pack_List.push(Traction_Battery_Pack);
    }
  });
  const Traction_Battery_Pack_Rows1 = getWheelRimsTableData(
    Traction_Battery_Pack_List
  );
  let Traction_Battery_Pack_Rows = normalizeWithUnit(Traction_Battery_Pack_Rows1, AH);
  // Updated code: Mapping Electrical system data and pushing to table
  let Working_voltage_Operating_Voltage_List = [];
  VehicleElectricalSpecificationList.map((vehDesc) => {
    if (vehDesc.supplier.active === true) {
      const supplierName = vehDesc?.supplier?.nameOfSupplier;
      const Working_voltage_Operating_Voltage = {
        supplier: supplierName,
        value:
          vehDesc?.Electrical_system?.properties
            ?.Working_voltage_Operating_Voltage?.value,
      };
      Working_voltage_Operating_Voltage_List.push(
        Working_voltage_Operating_Voltage
      );
    }
  });
 const Working_voltage_Operating_Voltage_Rows1 = getWheelRimsTableData(
    Working_voltage_Operating_Voltage_List
  );
  let Working_voltage_Operating_Voltage_Rows  = normalizeWithUnit(Working_voltage_Operating_Voltage_Rows1, V);
  // const Working_voltage_Operating_Voltage_Rows = getWheelRimsTableData(
  //   Working_voltage_Operating_Voltage_List
  // );
  // Updated code: Mapping General arrangement of the vehicle data and pushing to table
  let Number_of_seating_positions_List = [];
  GeneralarrangementofthevehicleList.map((vehDesc) => {
    if (vehDesc.supplier.active === true) {
      const supplierName = vehDesc?.supplier?.nameOfSupplier;
      const Number_of_seating_positions = {
        supplier: supplierName,
        value:
          vehDesc?.General_arrangement_of_the_vehicle?.properties
            ?.Number_of_seating_positions?.value,
      };
      Number_of_seating_positions_List.push(Number_of_seating_positions);
    }
  });
  const Number_of_seating_positions_Rows = getWheelRimsTableData(
    Number_of_seating_positions_List
  );
  // Updated code: Mapping Performance data and pushing to table
  let Vehicle_Max_Speed_in_unladen_condition_List = [];
  let Vehicle_Max_Speed_in_laden_condition_List = [];
  VehiclePerformanceList.map((vehDesc) => {
    if (vehDesc.supplier.active === true) {
      const supplierName = vehDesc?.supplier?.nameOfSupplier;
      const Vehicle_Max_Speed_in_unladen_condition = {
        supplier: supplierName,
        value:
          vehDesc?.Performance?.properties
            ?.Vehicle_Max_Speed_in_unladen_condition?.value,
      };
      Vehicle_Max_Speed_in_unladen_condition_List.push(
        Vehicle_Max_Speed_in_unladen_condition
      );
      const Vehicle_Max_Speed_in_laden_condition = {
        supplier: supplierName,
        value:
          vehDesc?.Performance?.properties?.Vehicle_Max_Speed_in_laden_condition
            ?.value,
      };
      Vehicle_Max_Speed_in_laden_condition_List.push(
        Vehicle_Max_Speed_in_laden_condition
      );
    }
  });
  const Vehicle_Max_Speed_in_unladen_condition_Rows1 = getWheelRimsTableData(
    Vehicle_Max_Speed_in_unladen_condition_List
  );
  let Vehicle_Max_Speed_in_unladen_condition_Rows = normalizeWithUnit(Vehicle_Max_Speed_in_unladen_condition_Rows1, KM_H);
  const Vehicle_Max_Speed_in_laden_condition_Rows1 = getWheelRimsTableData(
    Vehicle_Max_Speed_in_laden_condition_List
  );
  let Vehicle_Max_Speed_in_laden_condition_Rows = normalizeWithUnit(Vehicle_Max_Speed_in_laden_condition_Rows1, KM_H);




  let Type_Gear_box_vehicle_List = [];
  let Make_or_Model_List = [];
  let Number_of_gears_List = [];
  let First_gear_ratio_List = [];
  let Second_gear_ratio_List = [];
  let Third_gear_ratio_List = [];
  let Fourth_gear_ratio_List = [];
  let Fifth_gear_ratio_List = [];
  let Sixth_gear_ratio_List = [];
  let Clutch_Type_List = [];
  let Reverse_Gear_List=[];
  
      DriveTrainSystemList.map(Drivetrain => {
          if (Drivetrain.supplier.active === true) {
              const supplierName = Drivetrain?.supplier?.nameOfSupplier;
              const Type_Gear_box_vehicle = {
                  supplier: supplierName,
                  value: Drivetrain?.Transmission?.properties?.Type_Gear_box_vehicle?.value
              };
              Type_Gear_box_vehicle_List.push(Type_Gear_box_vehicle);
              
              const Make_or_Model = {
                  supplier: supplierName,
                  value: Drivetrain?.Transmission?.properties?.Make_or_Model?.value
              };
              Make_or_Model_List.push(Make_or_Model);
              
              const Number_of_gears = {
                  supplier: supplierName,
                  value: Drivetrain?.Transmission?.properties?.Number_of_gears?.value
              };
              Number_of_gears_List.push(Number_of_gears);
              
              const First_gear_ratio = {
                  supplier: supplierName,
                  value: Drivetrain?.Transmission?.properties?.First_gear_ratio?.value
              };
              First_gear_ratio_List.push(First_gear_ratio);
              
              const Second_gear_ratio = {
                  supplier: supplierName,
                  value: Drivetrain?.Transmission?.properties?.Second_gear_ratio?.value
              };
              Second_gear_ratio_List.push(Second_gear_ratio);
              
              const Third_gear_ratio = {
                  supplier: supplierName,
                  value: Drivetrain?.Transmission?.properties?.Third_gear_ratio?.value
              };
              Third_gear_ratio_List.push(Third_gear_ratio);
              
              const Fourth_gear_ratio = {
                  supplier: supplierName,
                  value: Drivetrain?.Transmission?.properties?.Fourth_gear_ratio?.value
              };
              Fourth_gear_ratio_List.push(Fourth_gear_ratio);
              
              const Fifth_gear_ratio = {
                  supplier: supplierName,
                  value: Drivetrain?.Transmission?.properties?.Fifth_gear_ratio?.value
              };
              Fifth_gear_ratio_List.push(Fifth_gear_ratio);
              
              const Sixth_gear_ratio = {
                  supplier: supplierName,
                  value: Drivetrain?.Transmission?.properties?.Sixth_gear_ratio?.value
              };
              Sixth_gear_ratio_List.push(Sixth_gear_ratio);
              
              const Clutch_Type = {
                  supplier: supplierName,
                  value: Drivetrain?.Clutch?.properties?.Type?.value
              };
              Clutch_Type_List.push(Clutch_Type);
              const Reverse_Gear = {
                supplier: supplierName,
                value: Drivetrain?.Transmission?.properties?.Reverse_gear_max_speed?.value
            };
            Reverse_Gear_List.push(Reverse_Gear);
              
          }
      });
      const Type_Gear_box_vehicle_Rows = getWheelRimsTableData(Type_Gear_box_vehicle_List);
      const Make_or_Model_Rows = getWheelRimsTableData(Make_or_Model_List);
      const Number_of_gears_Rows = getWheelRimsTableData(Number_of_gears_List);
      const First_gear_ratio_Rows = getWheelRimsTableData(First_gear_ratio_List);
      const Second_gear_ratio_Rows = getWheelRimsTableData(Second_gear_ratio_List);
      const Third_gear_ratio_Rows = getWheelRimsTableData(Third_gear_ratio_List);
      const Fourth_gear_ratio_Rows = getWheelRimsTableData(Fourth_gear_ratio_List);
      const Fifth_gear_ratio_Rows = getWheelRimsTableData(Fifth_gear_ratio_List);
      const Sixth_gear_ratio_Rows = getWheelRimsTableData(Sixth_gear_ratio_List);
      const Clutch_Type_Rows = getWheelRimsTableData(Clutch_Type_List);
      const Reverse_Gear_Rows = getWheelRimsTableData(Reverse_Gear_List);

  // docSealImage = new ImageRun({
  //     data: docSeal,
  //     transformation: {
  //         width: 90,
  //         height: 50,
  //     }
  // });

  let wheelRimsRows = getWheelRimsTableData(form7Data.Wheel_Rim.WheelRim);

       const today = new Date();
const formattedDate = today.toLocaleDateString("en-GB");
  const form7Document = new Document({
    styles: {
      paragraphStyles: [
        {
          id: "TableBoldTitle",
          name: "TableBoldTitle",
          basedOn: "Normal",
          run: {
            bold: true,
            size: "12pt",
          },
          paragraph: {
            indent: {
              left: 100,
            },
          },
        },
        {
          id: "TableRowContent",
          name: "TableRowContent",
          basedOn: "Normal",
          run: {
            size: "12pt",
          },
          paragraph: {
            spacing: {
              line: 276,
              after: 120,
              before: 120,
            },
            indent: {
              left: 100,
            },
          },
        },
        {
          id: "redColorText",
          name: "redColorText",
          basedOn: "Normal",
          run: {
            color: "#880808",
            size: "11pt",
            font: "Calibri",
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
                    text: "Table 7 of AIS-007 (Revision 5)",
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
            columnWidths: [6000, 4000],
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    columnSpan: 6,
                    width: {
                      size: 10000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableBoldTitle",
                        children: [
                          new TextRun({
                            text: "BRIEF TECHNICAL SPECIFICATIONS FOR MOTOR VEHICLES",
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                  }),
                ],
              }),

              new TableRow({
                children: [
                  new TableCell({
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableBoldTitle",
                        children: [
                          new TextRun({
                            text: "Manufacturer’s name and address",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: updatedmfNameAddressRows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableBoldTitle",
                        children: [
                          new TextRun({
                            text: "Importer’s name and address (in case of CBU)",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: importerNameAddressRows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableBoldTitle",
                        children: [
                          new TextRun({
                            text: "Vehicle data",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Basic model",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: vehModelRows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Type / Description",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: vehTypeRows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Category of vehicle as per IS 14272:2011",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: categoryRows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Variant(s)",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: variantRows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Type / Description",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: variant_typeRows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Category of variant(s) as per IS 14272:2011",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: variant_Vehicle_CategoryRows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableBoldTitle",
                        children: [
                          new TextRun({
                            text: "Engine",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Make",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Model name / identification",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Type",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Bore  x  stroke  (mm)",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "No. of cylinders",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Displacement (cm3)",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Compression ratio",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Max. Engine output  (kW @ rpm)",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Max. Torque  (Nm @ rpm)",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Air filter type ",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Type of Fuel",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Electric Vehicle",
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableBoldTitle",
                        children: [
                          new TextRun({
                            text: "Clutch",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: " ",
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Type",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Clutch_Type_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableBoldTitle",
                        children: [
                          new TextRun({
                            text: "Gear box",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: " ",
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Make/ model",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Make_or_Model_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Type",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Type_Gear_box_vehicle_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "No. of gears",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Number_of_gears_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Gear ratio \n\t\t ",
                          }),
                          new TextRun({
                            text: "\t\t\t\t 1st",
                            break: 1,
                          }),
                          new TextRun({
                            text: "\t\t\t\t 2nd",
                            break: 1,
                          }),
                          new TextRun({
                            text: "\t\t\t\t 3rd",
                            break: 1,
                          }),
                          new TextRun({
                            text: "\t\t\t\t 4th",
                            break: 1,
                          }),
                          new TextRun({
                            text: "\t\t\t\t 5th",
                            break: 1,
                          }),
                          new TextRun({
                            text: "\t\t\t\t 6th",
                            break: 1,
                          }),
                          new TextRun({
                            text: "\t\t\t\t Reverse",
                            break: 1,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    // children: [
                    //   new Paragraph({
                    //     style: "TableRowContent",
                    //     children: [
                    //       new TextRun({
                    //         text: "NA",
                    //       }),
                    //     ],
                    //   }),
                    // ],

                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          // new TextRun({
                          //   text: "Gear ratio",
                          //   break: 1
                          // }),
                          new TextRun({
                            text: First_gear_ratio_Rows,
                            break: 1
                          }),
                          new TextRun({
                            text: Second_gear_ratio_Rows,
                            break: 1
                          }),
                          new TextRun({
                            text: Third_gear_ratio_Rows,
                            break: 1
                          }),
                          new TextRun({
                            text: Fourth_gear_ratio_Rows,
                            break: 1
                          }),
                          new TextRun({
                            text: Fifth_gear_ratio_Rows,
                            break: 1
                          }),
                          new TextRun({
                            text: Sixth_gear_ratio_Rows,
                            break: 1
                          }),
                          new TextRun({
                            text: Reverse_Gear_Rows, // or replace with reverse gear value if available
                            break: 1
                          })
                        ]
                      })
                    ]
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Drive Axle (Front / Rear / All)",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Front axle ratio",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Rear axle ratio",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableBoldTitle",
                        children: [
                          new TextRun({
                            text: "Steering",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Type / Description (Manual / Power assisted – Hydraulic / Power assisted – Electric / Other)",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Select_Type_Steering_control_provided_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Steering wheel diameter mm",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Steering_wheel_diameter_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Steering Gear Ratio",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Specify_steering_gear_ratio_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableBoldTitle",
                        children: [
                          new TextRun({
                            text: "Frame",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Long member size (mm)",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Frames_Long_member_size_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Number of cross members",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Number_of_cross_members_if_any_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableBoldTitle",
                        children: [
                          new TextRun({
                            text: "Suspension",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Type / Description",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            // text: Type_of_Shock_absorbers_provided_at_the_front_and_Rear_Rows
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Front",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Front_Type_Desc_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Rear",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Rear_Type_Desc_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Spring",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Front",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Type_of_springs_front_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Rear",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Type_of_springs_rear_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Anti-roll bar / Suspension- Stabilizer",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Front",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Antiroll_bar_front_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Rear",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Antiroll_bar_rear_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Shock absorbers (Type & Number)",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Front",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Type_of_Shock_absorbers_front_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Rear",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Type_of_Shock_absorbers_rear_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableBoldTitle",
                        children: [
                          new TextRun({
                            text: "Brake",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Service brake Type (Mechanical/hydraulic/air/air assisted/vacuum assisted/others)",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Select_Type_of_Braking_System_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Auto Slack Adjuster Fitted ( Yes / No / Optional )",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: whether_Auto_Slac__Fitted_list_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Anti-Lock braking system Provided (Yes/No/Optional)",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Whether_ABS_provided_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Front (Disc / Drum)",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: type_of_friction_front_wheel_brakes_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Rear (Disc / Drum)",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: type_of_friction_rear_wheel_brakes_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Total braking area (cm²)",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Front_and_rear_braking_area_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Parking brake type",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Parking_Brake_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Secondary brake type",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Is_there_any_secondary_brake_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableBoldTitle",
                        children: [
                          new TextRun({
                            text: "Wheels and tyres",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Wheel rim size",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Front",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Front_Wheel_Rim_Size_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Rear",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Rear_Wheel_Rim_Size_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Tyre size designation including ply rating",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Front",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Front_Tyre_size_designation_including_ply_rating_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Rear",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Rear_Tyre_size_designation_including_ply_rating_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Speed index",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Front",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Front_Speed_index_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Rear",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Rear_Speed_index_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Load index / Load rating ",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Front",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Front_Load_index_Load_rating_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Rear",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Rear_Load_index_Load_rating_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Tyre Type (Radial / Cross / Tube / Tubeless)",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Front",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Front_Tyre_Type_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Rear",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Rear_Tyre_Type_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Laden Tyre pressure (kg/cm2 /kPa/ psi)",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Front",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Front_Laden_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Rear",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Rear_Laden_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableBoldTitle",
                        children: [
                          new TextRun({
                            text: "Electrical system",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "System voltage  (V)",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Working_voltage_Operating_Voltage_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Battery rating  (Ah)",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Traction_Battery_Pack_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Wiper motor type",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: updatedMake_of_Wiper_Motor_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Wiping system Type (Manual/power)",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Wiping_system_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 10000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableBoldTitle",
                        children: [
                          new TextRun({
                            text: "Fuel tank",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Material",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Capacity , liter",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableBoldTitle",
                        children: [
                          new TextRun({
                            text: "Vehicle Dimensions",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Wheel base  (mm)",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Wheel_base_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Overall width  (mm)",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Overall_width_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Overall length  (mm)",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Overall_length_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Overall height (Unladen) (mm)",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Overall_height_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Wheel Track (mm)",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Front track  (mm)",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Front_track_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Rear track  (mm)",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Rear_track_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Minimum Ground Clearance as per IS 9435:2004 (mm) (M1)",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Min. ground clearance (mm) (other than M1)",
                          }),
                        ],
                      }),
                    ],
                  }),

                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Min_ground_clearance_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableBoldTitle",
                        children: [
                          new TextRun({
                            text: "Maximum gradeability in 1st gear",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Maximum_gradeability_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableBoldTitle",
                        children: [
                          new TextRun({
                            text: "Dimensions",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Cargo box dimensions (l x b x h) (mm)",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Cargo_box_dimensions_if_fitted_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Load body platform area (l x b x h) (mm)",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Load_body_platform_area_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableBoldTitle",
                        children: [
                          new TextRun({
                            text: "Body overhang (mm)",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Front end",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Front_Body_Overhang_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Rear end",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Rear_Body_Overhang_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableBoldTitle",
                        children: [
                          new TextRun({
                            text: "Frame overhang mm (in case of vehicles without complete body)",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Front end",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Frames_overhang_at_front_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Rear end",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Frames_overhang_at_rear_end_Rows,
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
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableBoldTitle",
                        children: [
                          new TextRun({
                            text: "Weights",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Base",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Var 1",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Var 2",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Var 3",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Var 4",
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
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableBoldTitle",
                        children: [
                          new TextRun({
                            text: "Maximum GVW  kg (for rigid vehicles)",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: GVW_Max_GVW_Rows,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
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
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Maximum Permissible FAW",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: GVW_Distribution_on_front_axle_Rows,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
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
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Maximum Permissible RAW",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: GVW_Distribution_on_rear_axle_Rows,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
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
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Other axle",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
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
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableBoldTitle",
                        children: [
                          new TextRun({
                            text: "Maximum GCW  kg (for articulated / combination vehicles)",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Gcw_Max_Kg_Rows,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
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
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Maximum Permissible FAW",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
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
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Maximum Permissible RAW",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
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
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Other axle",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
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
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableBoldTitle",
                        children: [
                          new TextRun({
                            text: "Kerb weight with 90% fuel \n (with spare wheel , tools, etc.)  (kg)",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Vehicle_kerb_weight_Rows,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
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
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Front axle",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Kerb_weight_front_axle_Rows,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
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
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Rear axle",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Kerb_weight_rear_axle_Rows,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
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
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Other axle",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
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
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableBoldTitle",
                        children: [
                          new TextRun({
                            text: "Total",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 5000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Kerb_weight_Total_Rows,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                        style: "TableRowContent",
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
                    columnSpan: 6,
                    width: {
                      size: 10000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableBoldTitle",
                        children: [
                          new TextRun({
                            text: "CO2 (g/km) (Applicable for category M1 with GVW<3.5 T)",
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableBoldTitle",
                        children: [
                          new TextRun({
                            text: "Declared  : (rounded to 3 decimal places)",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
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
                    columnSpan: 6,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableBoldTitle",
                        children: [
                          new TextRun({
                            text: "Fuel consumption (l/100 km) for Petrol, LPG or Diesel  and (kg/100km) for CNG and (kWh/100 km) for Electric Driven Vehicles(Applicable for category M1 with GVW<3.5 T) \n (rounded to 3 decimal places )*",
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Fuel Equivalent Fuel Consumption (Actual Fuel)",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Petrol Equivalent Fuel Consumption (Petrol Equivalent)",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Vehicle Max Speed in unladen condition",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Vehicle_Max_Speed_in_unladen_condition_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Vehicle Max Speed in laden condition",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Vehicle_Max_Speed_in_laden_condition_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableBoldTitle",
                        children: [
                          new TextRun({
                            text: "Seating",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Seating capacity",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: Number_of_seating_positions_Rows,
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
                    columnSpan: 5,
                    width: {
                      size: 7000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: "Sketch showing seating layout with vehicle dimensions \n (mm) (all category of vehicles)",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    // // columnSpan: 5,
                    width: {
                      size: 3000,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        style: "TableRowContent",
                        children: [
                          new TextRun({
                            text: drawing_Rows,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
        size: 3300,
       
  
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
                                text: "Name: " + homologation_Engg_Name,
                                font: "Times New Roman",
                                color: "#B22222", // Light Red color
                              }),
                              new TextRun({
                                text:"Designation:" + dataOfFooter.Engineer_Designation.value,
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
  exportDoc(form7Document, "form7Document.docx");
}

export default generateForm7;