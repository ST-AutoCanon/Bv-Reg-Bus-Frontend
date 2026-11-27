/**
 * Form 3  AIS-007 (Revision 5), Table 3
 * Technical Specification  Four Wheelers and Above / Part B  Vehicle Overall
 *
 * All clause/description rows are embedded below from the supplied Table 3.docx.
 * No CSV or external JSON file is required.
 *
 * Expected usage:
 *   import generateForm3 from "./form3GenUtil";
 *   generateForm3(formData);
 *
 * formData may be:
 *   { values: { "B1.1": "value", "B2.1": { base: "...", variant1: "..." } } }
 * or a plain object keyed by clause number.
 *
 * Each clause value can be a string/number, or an object with:
 *   base, variant1, variant2, variant3, variant4
 *
 * If no values are supplied, the full Form 3 blank template is downloaded.
 */

import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  HeadingLevel,
  PageOrientation,
  ShadingType,
} from "docx";
import exportDoc from "./exportGenerator";

const FORM3_TITLE =
  "TECHNICAL SPECIFICATION – FOUR WHEELERS AND ABOVE";

const FORM3_SUBTITLE =
  "PART B – VEHICLE OVERALL";
const VARIANTS = ["Base", "Variant 1", "Variant 2", "Variant 3", "Variant 4"];

// Source-derived clause rows. Empty clause values are retained for source sub-headings.
const FORM3_CLAUSES = [
  {
    "clause": "B1.0",
    "description": "Vehicle Dimensions :",
    "notes": []
  },
  {
    "clause": "B1.1",
    "description": "Overall Length mm",
    "notes": []
  },
  {
    "clause": "B1.1.1",
    "description": "Total length (mm) (for articulated/combination vehicles)",
    "notes": []
  },
  {
    "clause": "B1.2",
    "description": "Overall Width mm",
    "notes": []
  },
  {
    "clause": "B1.3",
    "description": "Overall, Height (Unladen) (mm)",
    "notes": []
  },
  {
    "clause": "B1.4",
    "description": "Wheel base (mm)",
    "notes": []
  },
  {
    "clause": "B1.4.1",
    "description": "Axle spacing in case of multi axle vehicles.",
    "notes": []
  },
  {
    "clause": "B1.5",
    "description": "Wheel track (mm)",
    "notes": []
  },
  {
    "clause": "B1.5.1",
    "description": "Front",
    "notes": []
  },
  {
    "clause": "B1.5.2",
    "description": "Rear",
    "notes": []
  },
  {
    "clause": "B1.5.3",
    "description": "Other axles (for articulated/combination vehicles)",
    "notes": []
  },
  {
    "clause": "B1.6",
    "description": "Body overhang (mm)",
    "notes": []
  },
  {
    "clause": "B1.6.1",
    "description": "Front end",
    "notes": []
  },
  {
    "clause": "B1.6.2",
    "description": "Rear end",
    "notes": []
  },
  {
    "clause": "B1.7",
    "description": "Frame overhang mm (in case of vehicles without complete body)",
    "notes": []
  },
  {
    "clause": "B1.7.1",
    "description": "Front end",
    "notes": []
  },
  {
    "clause": "B1.7.2",
    "description": "Rear end",
    "notes": []
  },
  {
    "clause": "B 1.8",
    "description": "Load Body dimensions (L X B X H) (mm)",
    "notes": []
  },
  {
    "clause": "B1.9",
    "description": "Lateral projection",
    "notes": []
  },
  {
    "clause": "B1.10",
    "description": "Cargo box dimensions (mm)",
    "notes": []
  },
  {
    "clause": "B1.10.1",
    "description": "Length",
    "notes": []
  },
  {
    "clause": "B1.10.2",
    "description": "Width",
    "notes": []
  },
  {
    "clause": "B1.10.3",
    "description": "Height",
    "notes": []
  },
  {
    "clause": "B2.0",
    "description": "Weights :",
    "notes": [
      "Base",
      "Variant 1",
      "Variant 2",
      "Variant 3",
      "Variant 4"
    ]
  },
  {
    "clause": "B2.1",
    "description": "Vehicle kerb weight kg",
    "notes": []
  },
  {
    "clause": "B2.1.1",
    "description": "Front axle 1",
    "notes": []
  },
  {
    "clause": "B2.1.2",
    "description": "Front axle 2",
    "notes": []
  },
  {
    "clause": "B2.1.3",
    "description": "Rear Axle",
    "notes": []
  },
  {
    "clause": "B2.1.4",
    "description": "Trailer axle (applicable for articulated/combination vehicles)",
    "notes": []
  },
  {
    "clause": "B2.1.5",
    "description": "Total",
    "notes": []
  },
  {
    "clause": "B2.2",
    "description": "Gross vehicle weight kg ( for rigid vehicles ) (Front, Rear & Total)",
    "notes": []
  },
  {
    "clause": "B2.2.1",
    "description": "Maximum permissible axle weights (kg)",
    "notes": []
  },
  {
    "clause": "B2.2.2",
    "description": "Front axle",
    "notes": []
  },
  {
    "clause": "B2.2.3",
    "description": "Rear axle",
    "notes": []
  },
  {
    "clause": "B2.2.4",
    "description": "Other axle",
    "notes": []
  },
  {
    "clause": "B2.2.5",
    "description": "Rotational mass(mr): 3 % of the sum of mass in running order and 25 kg or value, per axle (kg): &",
    "notes": []
  },
  {
    "clause": "B2.2.6",
    "description": "Technically permissible maximum laden mass kg",
    "notes": []
  },
  {
    "clause": "B2.3",
    "description": "Gross combination weight kg (applicable for articulated / Tractor Trailer combination vehicles)",
    "notes": []
  },
  {
    "clause": "B2.3.1",
    "description": "Front axle",
    "notes": []
  },
  {
    "clause": "B2.3.2",
    "description": "Rear axle",
    "notes": []
  },
  {
    "clause": "B2.3.3",
    "description": "Trailer axle / other axles",
    "notes": []
  },
  {
    "clause": "B 2.3.4",
    "description": "If applicable, maximum mass of trailer which may be coupled",
    "notes": []
  },
  {
    "clause": "B 2.3.5",
    "description": "Unbraked trailer",
    "notes": []
  },
  {
    "clause": "B2.4",
    "description": "Reference mass (for vehicles with GVW less than or equal to 3.5 ton) (kg.)",
    "notes": []
  },
  {
    "clause": "B2.5",
    "description": "Seating capacity",
    "notes": []
  },
  {
    "clause": "B2.5.1",
    "description": "Maximum (Including driver) for completely built vehicles",
    "notes": []
  },
  {
    "clause": "B3.0",
    "description": "Tyres :",
    "notes": []
  },
  {
    "clause": "B3.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B3.1.1",
    "description": "Brand(s) name(s) and/or Trade description(s)",
    "notes": [
      "This information shall be requested only after implementation of AIS-142"
    ]
  },
  {
    "clause": "B3.1.2",
    "description": "Tyres - Rolling Sound Emissions, Adhesion on Wet Surfaces, Rolling Resistance as per AIS:142",
    "notes": [
      "Compliance ( Yes / No)"
    ]
  },
  {
    "clause": "B3.1.3",
    "description": "Tyre rolling Resistance",
    "notes": []
  },
  {
    "clause": "B3.1.4",
    "description": "Tyre Class (C1 / C2 / C3) as per AIS:142",
    "notes": [
      "Front",
      "Rear"
    ]
  },
  {
    "clause": "B3.1.4",
    "description": "Tyre Class (C1 / C2 / C3) as per AIS:142",
    "notes": []
  },
  {
    "clause": "B3.1.5",
    "description": "Category of use (Normal / Special / Snow/Severe Snow)",
    "notes": []
  },
  {
    "clause": "B3.1.7",
    "description": "Tyre Tread Pattern along with Drawing",
    "notes": []
  },
  {
    "clause": "B3.1.8",
    "description": "Identification: TAC No. / BIS License No. / E- Marking",
    "notes": []
  },
  {
    "clause": "B3.2",
    "description": "No. and arrangement of wheels",
    "notes": []
  },
  {
    "clause": "B3.2.1",
    "description": "Front",
    "notes": []
  },
  {
    "clause": "B3.2.2",
    "description": "Rear",
    "notes": []
  },
  {
    "clause": "B3.2.3",
    "description": "Spare wheel",
    "notes": []
  },
  {
    "clause": "B3.2.4",
    "description": "Identification: TAC No. / BIS License No. / E- Marking",
    "notes": []
  },
  {
    "clause": "B3.2.5",
    "description": "Others (for articulated/combination vehicles)",
    "notes": []
  },
  {
    "clause": "B3.3",
    "description": "Tyre type (Radial/cross ply), (with Tube / Tube less), (Normal / Reinforced), size designation including ply rating, speed rating, Load rating or Load index. Use symbols as per IS 15633 / IS 15636 as may be applicable.",
    "notes": []
  },
  {
    "clause": "B3.3.1",
    "description": "Front wheel",
    "notes": []
  },
  {
    "clause": "B3.3.2",
    "description": "Rear wheel",
    "notes": []
  },
  {
    "clause": "B3.3.3",
    "description": "Spare wheel (Other than temporary use spare wheel)",
    "notes": []
  },
  {
    "clause": "B3.3.4",
    "description": "Other (for articulated/combination vehicles)",
    "notes": []
  },
  {
    "clause": "B 3.4",
    "description": "Rolling Radius",
    "notes": []
  },
  {
    "clause": "B 3.4.1",
    "description": "Static rolling radius (only applicable for M2, M3, N and T category of vehicles.)",
    "notes": []
  },
  {
    "clause": "B 3.4.2",
    "description": "Dynamic rolling radius, mm, as per IS 15633 / IS 15636",
    "notes": []
  },
  {
    "clause": "B3.5",
    "description": "Inflation pressure  Unladen (kg/cm2 / kPa / psi)",
    "notes": []
  },
  {
    "clause": "B3.5.1",
    "description": "Front",
    "notes": []
  },
  {
    "clause": "B3.5.2",
    "description": "Rear",
    "notes": []
  },
  {
    "clause": "B3.5.3",
    "description": "Other",
    "notes": []
  },
  {
    "clause": "B3.6",
    "description": "Inflation pressure  Laden (kg/cm2 / kPa / psi)",
    "notes": []
  },
  {
    "clause": "B3.6.1",
    "description": "Front",
    "notes": []
  },
  {
    "clause": "B3.6.2",
    "description": "Rear",
    "notes": []
  },
  {
    "clause": "B3.6.3",
    "description": "Other",
    "notes": []
  },
  {
    "clause": "B3.7",
    "description": "Tyre Pressure Monitoring System (TPMS) as per AIS-154/ Run Flat Warning System as applicable for Run-Flat tyres - as per AIS-110 (If Provided)",
    "notes": []
  },
  {
    "clause": "B3.7.1",
    "description": "Make (For direct TPMS)",
    "notes": []
  },
  {
    "clause": "B 3.7.2",
    "description": "Brief Description of the system (For indirect TPMS)",
    "notes": []
  },
  {
    "clause": "B 3.7.3",
    "description": "Sensor Part No. (For direct TPMS)",
    "notes": []
  },
  {
    "clause": "B3.8",
    "description": "Temporary Spare Wheel / RFT- as per AIS-110 (If Provided)",
    "notes": []
  },
  {
    "clause": "B3.8.1",
    "description": "Type as per AIS-110",
    "notes": []
  },
  {
    "clause": "B3.8.2",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B3.8.3",
    "description": "Size",
    "notes": []
  },
  {
    "clause": "B3.8.4",
    "description": "Load and speed rating",
    "notes": []
  },
  {
    "clause": "B3.8.5",
    "description": "Recommended max speed in Unladen condition",
    "notes": []
  },
  {
    "clause": "B3.8.6",
    "description": "Recommended max speed Laden condition",
    "notes": []
  },
  {
    "clause": "B4.0",
    "description": "Transmission :",
    "notes": []
  },
  {
    "clause": "B4.1",
    "description": "B4.1:Type(Manual/Automatic/semi-automatic/CVT/iVT/DCT/iMT) (Note: If automatic give all pertinent data)",
    "notes": []
  },
  {
    "clause": "B4.2",
    "description": "Clutch Type (wet/Dry/Single plate/ Multi plate / Hydraulic)",
    "notes": []
  },
  {
    "clause": "B4.2.1",
    "description": "Number of Clutch",
    "notes": []
  },
  {
    "clause": "B4.2.2",
    "description": "Maximum torque conversion:",
    "notes": []
  },
  {
    "clause": "B4.3",
    "description": "Gear box",
    "notes": []
  },
  {
    "clause": "B4.3.1",
    "description": "Type",
    "notes": []
  },
  {
    "clause": "B 4.3.2",
    "description": "Make / Model",
    "notes": []
  },
  {
    "clause": "B4.3.3",
    "description": "Gear shifting control system (Sketch showing gear shifting arrangement)",
    "notes": []
  },
  {
    "clause": "B4.3.4",
    "description": "No. of gears",
    "notes": []
  },
  {
    "clause": "B4.4",
    "description": "Stall ratio of torque converter",
    "notes": []
  },
  {
    "clause": "B4.4.1",
    "description": "Transmission Torque Rating (Nm)",
    "notes": []
  },
  {
    "clause": "B4.5",
    "description": "Sub transmission",
    "notes": []
  },
  {
    "clause": "B4.5.1",
    "description": "Type",
    "notes": []
  },
  {
    "clause": "B4.5.2",
    "description": "Control system",
    "notes": []
  },
  {
    "clause": "B4.5.3",
    "description": "Gear ratio High Low",
    "notes": []
  },
  {
    "clause": "B 4.6",
    "description": "Final Drive (4x2 or 4x4 or 6x2 or 6x4 or others). Front / Rear / Both",
    "notes": []
  },
  {
    "clause": "B4.6.1",
    "description": "Type",
    "notes": []
  },
  {
    "clause": "B4.6.2",
    "description": "Reduction ratio (Front & Rear)",
    "notes": []
  },
  {
    "clause": "B4.6.3",
    "description": "Differential type",
    "notes": []
  },
  {
    "clause": "B4.6.4",
    "description": "Final Drive ratio",
    "notes": []
  },
  {
    "clause": "B4.7",
    "description": "Gear ratio Gear box ratio Overall ratio",
    "notes": []
  },
  {
    "clause": "",
    "description": "1st",
    "notes": []
  },
  {
    "clause": "",
    "description": "2nd",
    "notes": []
  },
  {
    "clause": "",
    "description": "3rd",
    "notes": []
  },
  {
    "clause": "",
    "description": "4th",
    "notes": []
  },
  {
    "clause": "",
    "description": "5th",
    "notes": []
  },
  {
    "clause": "",
    "description": "6th",
    "notes": []
  },
  {
    "clause": "",
    "description": "Over drive",
    "notes": []
  },
  {
    "clause": "",
    "description": "Reverse",
    "notes": []
  },
  {
    "clause": "B 4.7.1",
    "description": "Gear ratio for CVT Transmission",
    "notes": []
  },
  {
    "clause": "",
    "description": "Gear",
    "notes": [
      "Internal gearbox ratios (Ratios of engine to gearbox output shaft revolutions)",
      "Final drive ratios (Ratio of gearbox output shaft to driven wheel revolutions",
      "Total gear ratios"
    ]
  },
  {
    "clause": "",
    "description": "Maximum for CVT",
    "notes": []
  },
  {
    "clause": "",
    "description": "1",
    "notes": []
  },
  {
    "clause": "",
    "description": "2",
    "notes": []
  },
  {
    "clause": "",
    "description": "3",
    "notes": []
  },
  {
    "clause": "",
    "description": "---",
    "notes": []
  },
  {
    "clause": "",
    "description": "Minimum for CVT",
    "notes": []
  },
  {
    "clause": "B4.7.2",
    "description": "Gearshift for WLTC preparation",
    "notes": []
  },
  {
    "clause": "B4.7.2.1",
    "description": "Gear 1 excluded: yes/no",
    "notes": []
  },
  {
    "clause": "B4.7.2.2",
    "description": "n95_high for each gear: & min1",
    "notes": []
  },
  {
    "clause": "B4.7.2.3",
    "description": "nmin_drive",
    "notes": []
  },
  {
    "clause": "B4.7.2.3.1",
    "description": "1st gear: & min1",
    "notes": []
  },
  {
    "clause": "B4.7.2.3.2",
    "description": "1st gear to 2nd: & min1",
    "notes": []
  },
  {
    "clause": "B4.7.2.3.3",
    "description": "2nd gear to standstill: & min1",
    "notes": []
  },
  {
    "clause": "B4.7.2.3.4",
    "description": "2nd gear: & min1",
    "notes": []
  },
  {
    "clause": "B4.7.2.3.5",
    "description": "3rd gear and beyond: & min1",
    "notes": []
  },
  {
    "clause": "B4.7.2.4",
    "description": "nmin_drive_set for acceleration/constant speed phases (n_min_drive_up): & min1",
    "notes": []
  },
  {
    "clause": "B4.7.2.5",
    "description": "nmin_drive_set for deceleration phases (nmin_drive_down):",
    "notes": []
  },
  {
    "clause": "B4.7.2.6",
    "description": "initial period of time",
    "notes": []
  },
  {
    "clause": "B4.7.2.6.1",
    "description": "tstart_phase: & s",
    "notes": []
  },
  {
    "clause": "B4.7.2.6.2",
    "description": "nmin_drive_start: & min1",
    "notes": []
  },
  {
    "clause": "B4.7.2.6.3",
    "description": "nmin_drive_up_start: & min1",
    "notes": []
  },
  {
    "clause": "B4.8",
    "description": "Hydraulic transmission",
    "notes": []
  },
  {
    "clause": "B4.8.1",
    "description": "Type",
    "notes": []
  },
  {
    "clause": "B5.0",
    "description": "Number of axles :",
    "notes": []
  },
  {
    "clause": "B5.1",
    "description": "Steered",
    "notes": []
  },
  {
    "clause": "B5.2",
    "description": "Non-steered",
    "notes": []
  },
  {
    "clause": "B5.3",
    "description": "Driven",
    "notes": []
  },
  {
    "clause": "B5.4",
    "description": "Non-driven",
    "notes": []
  },
  {
    "clause": "B6.0",
    "description": "Front axle :",
    "notes": []
  },
  {
    "clause": "B6.1",
    "description": "Type ( Single / Multi / Retractable )",
    "notes": []
  },
  {
    "clause": "B6.2",
    "description": "Toe-in / Toe out (mm)",
    "notes": []
  },
  {
    "clause": "B6.3",
    "description": "Camber angle",
    "notes": []
  },
  {
    "clause": "B6.4",
    "description": "Caster angle",
    "notes": []
  },
  {
    "clause": "B6.5",
    "description": "King pin angle",
    "notes": []
  },
  {
    "clause": "B7.0",
    "description": "Rear axle :",
    "notes": []
  },
  {
    "clause": "B7.1",
    "description": "Type ( Single / Tandem / Tridem / Multi/ Retractable )",
    "notes": []
  },
  {
    "clause": "B7.2",
    "description": "Toe-in/ Toe out mm, if applicable",
    "notes": []
  },
  {
    "clause": "B7.3",
    "description": "Camber angle, if applicable",
    "notes": []
  },
  {
    "clause": "B7.4",
    "description": "Caster angle, if applicable",
    "notes": []
  },
  {
    "clause": "B7.5",
    "description": "King pin angle, if applicable",
    "notes": []
  },
  {
    "clause": "B8.0",
    "description": "Steering system :",
    "notes": []
  },
  {
    "clause": "B8.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B8.1.1",
    "description": "Type (Manual / Power assisted  Hydraulic / Power assisted  Electric / Other)",
    "notes": []
  },
  {
    "clause": "B8.2",
    "description": "Steering wheel",
    "notes": []
  },
  {
    "clause": "B8.2.1",
    "description": "Identification Mark / Part No./Drawing No.",
    "notes": []
  },
  {
    "clause": "B8.2.2",
    "description": "Position (center/offset)",
    "notes": []
  },
  {
    "clause": "B8.2.3",
    "description": "Outside dia. (mm)",
    "notes": []
  },
  {
    "clause": "B8.2.4",
    "description": "Steering column",
    "notes": []
  },
  {
    "clause": "B8.2.4.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B8.2.4.2",
    "description": "Type / Model",
    "notes": []
  },
  {
    "clause": "B8.2.4.3",
    "description": "Detailed drawing with material specifications",
    "notes": []
  },
  {
    "clause": "B 8.2.4.4",
    "description": "Air Bag  Part No/ID No/Drawing No, Make",
    "notes": []
  },
  {
    "clause": "B 8.2.4.5",
    "description": "Air Bag deployment time as per IS 11939/AIS 96/AIS 98 for steering impact",
    "notes": []
  },
  {
    "clause": "B8.2.5",
    "description": "Intermediate shaft",
    "notes": []
  },
  {
    "clause": "B8.2.5.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B8.2.5.2",
    "description": "Type / Model",
    "notes": []
  },
  {
    "clause": "B8.2.5.3",
    "description": "Detailed drawing with material specifications",
    "notes": []
  },
  {
    "clause": "B8.3",
    "description": "Maximum No. of rotation of steering wheel from lock to lock",
    "notes": []
  },
  {
    "clause": "B8.4",
    "description": "Details of single / multiple combinations to be given in the form of an Annexure with reference to IS 11939:1996",
    "notes": []
  },
  {
    "clause": "B8.5",
    "description": "Detailed drawing of the mounting arrangement of Steering control assembly showing vertical / tilt / actual angle.",
    "notes": []
  },
  {
    "clause": "B8.6",
    "description": "Offset of the steering column with respect to the seat",
    "notes": []
  },
  {
    "clause": "B8.7",
    "description": "Steering Gear",
    "notes": []
  },
  {
    "clause": "B8.7.1",
    "description": "Type of steering gear (Re-circulating ball / Worm & Roller / Rack & Pinion / Others)",
    "notes": []
  },
  {
    "clause": "B8.7.2",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B8.7.3",
    "description": "Steering gear ratio",
    "notes": []
  },
  {
    "clause": "B8.8",
    "description": "Wheel lock angle (deg.)",
    "notes": []
  },
  {
    "clause": "",
    "description": "Inner",
    "notes": [
      "Outer"
    ]
  },
  {
    "clause": "B8.8.1",
    "description": "Left",
    "notes": []
  },
  {
    "clause": "B8.8.2",
    "description": "Right",
    "notes": []
  },
  {
    "clause": "B8.9",
    "description": "Power Assistance",
    "notes": []
  },
  {
    "clause": "B8.9.1",
    "description": "Type of assistance",
    "notes": []
  },
  {
    "clause": "B8.9.2",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B8.9.3",
    "description": "Identification No./ Part No.",
    "notes": []
  },
  {
    "clause": "B8.9.4",
    "description": "Pressure setting (kg/cm2 / bar / kPa)",
    "notes": []
  },
  {
    "clause": "B8.10",
    "description": "Min turning circle diameter (mm) (as per IS 12222)",
    "notes": []
  },
  {
    "clause": "B8.11",
    "description": "Min. turning circle clearance diameter (mm)",
    "notes": []
  },
  {
    "clause": "B8.12",
    "description": "Coordinates of point defining test turning circle. (Applicable in case of vehicles without complete body which does not cover this point)",
    "notes": []
  },
  {
    "clause": "B9.0",
    "description": "Clearance (Requirement as per AIS-053, If applicable):",
    "notes": []
  },
  {
    "clause": "B9.1",
    "description": "Minimum ground clearance(For other than M1)",
    "notes": []
  },
  {
    "clause": "B9.2",
    "description": "Road clearance from floor (for buses)",
    "notes": []
  },
  {
    "clause": "B9.3",
    "description": "Approach angle",
    "notes": []
  },
  {
    "clause": "B9.4",
    "description": "Departure angle",
    "notes": []
  },
  {
    "clause": "B9.5",
    "description": "Ramp-over angle",
    "notes": []
  },
  {
    "clause": "B9.6",
    "description": "Minimum Ground Clearance as per IS 9435: 2004 (mm)",
    "notes": []
  },
  {
    "clause": "B10.0",
    "description": "Max. stable inclination (For buses as per AIS-031) :",
    "notes": []
  },
  {
    "clause": "B10.1",
    "description": "Left",
    "notes": []
  },
  {
    "clause": "B10.2",
    "description": "Right",
    "notes": []
  },
  {
    "clause": "B11.0",
    "description": "Suspension :",
    "notes": []
  },
  {
    "clause": "B11.1",
    "description": "Type and description (Leaf / Coil / Air / Semi-pneumatic / Torsion bar)",
    "notes": []
  },
  {
    "clause": "B11.1.1",
    "description": "Front",
    "notes": []
  },
  {
    "clause": "B11.1.2",
    "description": "Rear",
    "notes": []
  },
  {
    "clause": "B11.2",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B11.2.1",
    "description": "Front",
    "notes": []
  },
  {
    "clause": "B11.2.2",
    "description": "Rear",
    "notes": []
  },
  {
    "clause": "B11.3",
    "description": "Type of spring",
    "notes": []
  },
  {
    "clause": "B11.4",
    "description": "If leaf spring",
    "notes": []
  },
  {
    "clause": "B11.4.1",
    "description": "Main spring",
    "notes": []
  },
  {
    "clause": "B11.4.1.1",
    "description": "Stack height, at center",
    "notes": []
  },
  {
    "clause": "B11.4.1.2",
    "description": "Width at the center point / stack point",
    "notes": []
  },
  {
    "clause": "B11.4.1.3",
    "description": "Flat length",
    "notes": []
  },
  {
    "clause": "B11.4.1.4",
    "description": "Free camber",
    "notes": []
  },
  {
    "clause": "B11.4.1.5",
    "description": "No. of leaves",
    "notes": []
  },
  {
    "clause": "",
    "description": "Left",
    "notes": [
      "Right"
    ]
  },
  {
    "clause": "",
    "description": "No. of leaves",
    "notes": []
  },
  {
    "clause": "",
    "description": "No. of spacers",
    "notes": []
  },
  {
    "clause": "B11.4.2",
    "description": "Auxiliary Spring",
    "notes": []
  },
  {
    "clause": "B11.4.2.1",
    "description": "Stack height at, at center",
    "notes": []
  },
  {
    "clause": "B11.4.2.2",
    "description": "Width at the center point / stack point",
    "notes": []
  },
  {
    "clause": "B11.4.2.3",
    "description": "Flat length",
    "notes": []
  },
  {
    "clause": "B11.4.2.4",
    "description": "Free camber",
    "notes": []
  },
  {
    "clause": "B11.4.2.5",
    "description": "No. of leaves",
    "notes": []
  },
  {
    "clause": "",
    "description": "Left",
    "notes": [
      "Right"
    ]
  },
  {
    "clause": "",
    "description": "No. of leaves",
    "notes": []
  },
  {
    "clause": "",
    "description": "No. of spacers",
    "notes": []
  },
  {
    "clause": "B12.0",
    "description": "Suspension- Shock absorber :",
    "notes": []
  },
  {
    "clause": "B12.1",
    "description": "Type and Number",
    "notes": []
  },
  {
    "clause": "B12.1.1",
    "description": "Front",
    "notes": []
  },
  {
    "clause": "B12.1.2",
    "description": "Rear",
    "notes": []
  },
  {
    "clause": "B 13.0",
    "description": "Suspension- Stabilizer /Anti-roll bar:",
    "notes": []
  },
  {
    "clause": "B13.1",
    "description": "Front",
    "notes": []
  },
  {
    "clause": "B13.2",
    "description": "Rear",
    "notes": []
  },
  {
    "clause": "B14.0",
    "description": "Chassis Frame :",
    "notes": []
  },
  {
    "clause": "B14.1",
    "description": "Type",
    "notes": []
  },
  {
    "clause": "B14.2",
    "description": "Long member size (mm)",
    "notes": []
  },
  {
    "clause": "B14.3",
    "description": "Number of cross members",
    "notes": []
  },
  {
    "clause": "B15.0",
    "description": "Displays and tell tales : Indicate the type and if the tell tales provided and whether they are symbols or letter. (AIS-071 part 1 and 2 or corresponding Indian Standard))",
    "notes": []
  },
  {
    "clause": "B15.1",
    "description": "Head lamp  upper / lower control",
    "notes": []
  },
  {
    "clause": "B15.2",
    "description": "Ignition cut-off",
    "notes": []
  },
  {
    "clause": "B15.3",
    "description": "Turn signal",
    "notes": []
  },
  {
    "clause": "B15.4",
    "description": "Fuel Gauge",
    "notes": []
  },
  {
    "clause": "B15.5",
    "description": "Engine coolant temperature",
    "notes": []
  },
  {
    "clause": "B15.6",
    "description": "Engine low oil pressure",
    "notes": []
  },
  {
    "clause": "B15.7",
    "description": "High beam indicator",
    "notes": []
  },
  {
    "clause": "B15.8",
    "description": "Electrical charge indicator (Battery charge)",
    "notes": []
  },
  {
    "clause": "B15.9",
    "description": "Brake failure",
    "notes": []
  },
  {
    "clause": "B15.10",
    "description": "Front fog light",
    "notes": []
  },
  {
    "clause": "B15.11",
    "description": "Rear fog light",
    "notes": []
  },
  {
    "clause": "B15.12",
    "description": "Horn",
    "notes": []
  },
  {
    "clause": "B 15.13",
    "description": "ABS",
    "notes": []
  },
  {
    "clause": "B 15.14",
    "description": "Seat Belt Reminder",
    "notes": []
  },
  {
    "clause": "B 15.15",
    "description": "Others (such as, Airbag, HVAC, Content gauge, LPG / CNG changeover switch etc.,)",
    "notes": []
  },
  {
    "clause": "B16.0",
    "description": "Hood latch :",
    "notes": []
  },
  {
    "clause": "B16.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B16.2",
    "description": "Type",
    "notes": []
  },
  {
    "clause": "B16.3",
    "description": "Identification No. / Part No.",
    "notes": []
  },
  {
    "clause": "B17.0",
    "description": "Wheel guard (IS 13943 for passenger cars)",
    "notes": []
  },
  {
    "clause": "B17.1",
    "description": "Dimension C",
    "notes": []
  },
  {
    "clause": "B17.2",
    "description": "Dimension p",
    "notes": []
  },
  {
    "clause": "B17.3",
    "description": "Dimension q",
    "notes": []
  },
  {
    "clause": "B18.0",
    "description": "External Projections",
    "notes": []
  },
  {
    "clause": "B18.1",
    "description": "Ornaments",
    "notes": []
  },
  {
    "clause": "B18.2",
    "description": "Projection for head light",
    "notes": []
  },
  {
    "clause": "B18.3",
    "description": "Radiator grills (Applicable of on external surface)",
    "notes": []
  },
  {
    "clause": "B18.3.1",
    "description": "Gap between individual elements",
    "notes": []
  },
  {
    "clause": "B 18.3.2",
    "description": "Radius of curvature of individual element",
    "notes": []
  },
  {
    "clause": "B18.4",
    "description": "Body Panel ( In case of radius of curvature of folds in body panels are less than 2.5mm the scaled drawing of folds contour and H value as per IS 13942 is required to be submitted) & relevant drawings as per IS 13942 / AIS 120",
    "notes": []
  },
  {
    "clause": "B18.5",
    "description": "Radius of curvature of lateral Rain/Air deflector",
    "notes": []
  },
  {
    "clause": "B19.0",
    "description": "Speedometer:",
    "notes": []
  },
  {
    "clause": "B19.1",
    "description": "Type",
    "notes": []
  },
  {
    "clause": "B19.2",
    "description": "Make, and Identification No. / Part No./ Drawing No.",
    "notes": []
  },
  {
    "clause": "B19.3",
    "description": "Range",
    "notes": []
  },
  {
    "clause": "B19.4",
    "description": "Major marking",
    "notes": []
  },
  {
    "clause": "B19.5",
    "description": "Minor marking",
    "notes": []
  },
  {
    "clause": "B 19.6",
    "description": "Speedometer ratio / Instrument constant",
    "notes": []
  },
  {
    "clause": "B19.7",
    "description": "Ratio of Speedo drive",
    "notes": []
  },
  {
    "clause": "B20.0",
    "description": "Odometer : (only in case of CNG buses)",
    "notes": []
  },
  {
    "clause": "B20.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B20.2",
    "description": "Type and Identification No. / Part No.",
    "notes": []
  },
  {
    "clause": "B21.0",
    "description": "Safety belt anchorages  specifications",
    "notes": []
  },
  {
    "clause": "B21.1",
    "description": "Design of the type of belts and retractors authorized for fit to the anchorages with which vehicle is equipped :",
    "notes": []
  },
  {
    "clause": "B21.2",
    "description": "Section views of all the seat belt anchorages.",
    "notes": []
  },
  {
    "clause": "B21.2",
    "description": "Anchorage Position",
    "notes": [
      "Anchorage on (*)"
    ]
  },
  {
    "clause": "B21.2",
    "description": "Anchorage Position",
    "notes": [
      "Vehicle Structure"
    ]
  },
  {
    "clause": "B21.2",
    "description": "Front",
    "notes": [
      "Right-hand seat",
      "Lower anchorage",
      "Outboard Inboard"
    ]
  },
  {
    "clause": "B21.2",
    "description": "Front",
    "notes": [
      "Right-hand seat",
      "Upper anchorage",
      "Outboard Inboard"
    ]
  },
  {
    "clause": "B21.2",
    "description": "Front",
    "notes": [
      "Middle seat",
      "Lower anchorage",
      "Right Left"
    ]
  },
  {
    "clause": "B21.2",
    "description": "Front",
    "notes": [
      "Middle seat",
      "Lower anchorage",
      "Right Left"
    ]
  },
  {
    "clause": "B21.2",
    "description": "Front",
    "notes": [
      "Left-hand seat",
      "Lower anchorage",
      "Outboard Inboard"
    ]
  },
  {
    "clause": "B21.2",
    "description": "Front",
    "notes": [
      "Left-hand seat",
      "Upper anchorage",
      "Outboard Inboard"
    ]
  },
  {
    "clause": "B21.2",
    "description": "Rear",
    "notes": []
  },
  {
    "clause": "B21.3",
    "description": "Reference point on body used for vehicle and seat co-ordinate measurement, X, Y, Z co-ordinates of all the seat belt anchorage points.",
    "notes": []
  },
  {
    "clause": "B21.4",
    "description": "Weight of seats",
    "notes": []
  },
  {
    "clause": "B21.5",
    "description": "C.G. of seats (Sketch, showing the C.G. location form reference point or from seat anchorage point).",
    "notes": []
  },
  {
    "clause": "B22.0",
    "description": "Seats, their anchorages and head restraints",
    "notes": []
  },
  {
    "clause": "B22.1",
    "description": "Seats, their anchorages and head restraints-specifications for M1 category.",
    "notes": []
  },
  {
    "clause": "B22.1.1",
    "description": "Description of seats",
    "notes": []
  },
  {
    "clause": "B22.1.1.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B22.1.1.2",
    "description": "Number of seats fitted or capable of being fitted with head restraints, adjustable or not adjustable.",
    "notes": []
  },
  {
    "clause": "B22.1.1.3",
    "description": "Description of the adjustment, displacement and locking systems of the seat or of its parts and a description of occupant protection system against displacement of luggage.",
    "notes": []
  },
  {
    "clause": "B22.1.2",
    "description": "Description of seat anchorage",
    "notes": []
  },
  {
    "clause": "B 22.1.2.1",
    "description": "Longitudinal / Vertical (If applicable) position of the seats",
    "notes": []
  },
  {
    "clause": "B22.1.2.2",
    "description": "Drawings, diagrams and plans of the seats, their anchorages on the vehicle, the floor layout, the adjustment and displacement system of the seats and their parts, and their locking devices and of additional occupant protection system against displacement of luggage.",
    "notes": []
  },
  {
    "clause": "B22.1.2.3",
    "description": "In the case of seats fitted with head restraints, the head restraint shall be shown on all drawings, diagrams and photographs.",
    "notes": []
  },
  {
    "clause": "B22.1.3",
    "description": "Seat Drawings showing H point co-ordinates with respect to reference point on body shell",
    "notes": []
  },
  {
    "clause": "B22.1.4",
    "description": "All designed positions i.e. Slider, Height Adjuster, Manikin settings, Torso Angle etc.",
    "notes": []
  },
  {
    "clause": "B22.1.5",
    "description": "Seat anchorage co-ordinates with respect to reference point on body shell to be shown on floor drawing.",
    "notes": []
  },
  {
    "clause": "B22.1.6",
    "description": "Seat Identification No. / Part No/Drawing Number.:",
    "notes": []
  },
  {
    "clause": "B22.1.6",
    "description": "Description",
    "notes": [
      "Make",
      "ID Number/ Part Number/Drawing number (Seat Manufacturer/ Vehicle Manufacturer)",
      "Weight (kg)"
    ]
  },
  {
    "clause": "B22.1.6",
    "description": "",
    "notes": []
  },
  {
    "clause": "B22.2",
    "description": "Seats, their anchorages and head restrains (for passenger vehicles of categories other than M1 and goods vehicles of category N).",
    "notes": []
  },
  {
    "clause": "B22.2.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B22.2.2",
    "description": "Brief description and drawings of the seat type, its attachment fittings and its adjustment, displacement and locking systems including the minimum distance between fitting points.",
    "notes": []
  },
  {
    "clause": "B22.2.3",
    "description": "Position and arrangement of seats including seat layout.",
    "notes": []
  },
  {
    "clause": "B22.2.4",
    "description": "Seats if any which incorporate a safety belt anchorage.",
    "notes": []
  },
  {
    "clause": "B22.2.5",
    "description": "Driver Seat and Front Passenger Seat drawings, their anchorages on the vehicle, the floor layout, the adjustment and displacement system of the seats and their parts, and their locking devices, drawings showing H point co-ordinates and seat anchorage co-ordinates with respect to reference point on vehicle",
    "notes": []
  },
  {
    "clause": "B22.2.6",
    "description": "Seat Identification No. / Part No/Drawing Number.:",
    "notes": []
  },
  {
    "clause": "B22.2.6",
    "description": "Description",
    "notes": [
      "Make",
      "ID Number/ Part Number/Drawing number (Seat Manufacturer/ Vehicle Manufacturer)",
      "Weight (kg)"
    ]
  },
  {
    "clause": "B22.2.6",
    "description": "",
    "notes": []
  },
  {
    "clause": "B23.0",
    "description": "Rear Under run Protective device",
    "notes": []
  },
  {
    "clause": "B23.1",
    "description": "Height of lower edge of the device from the ground (mm).",
    "notes": []
  },
  {
    "clause": "B23.2",
    "description": "Width of the device (mm).",
    "notes": []
  },
  {
    "clause": "B23.3",
    "description": "Drawing of the rear under-run protective device with dimensions , RUPD cross section, material details etc.",
    "notes": []
  },
  {
    "clause": "B23.4",
    "description": "Installation drawing showing rear extremity of vehicle, chassis rear overhang, chassis cross section details, tyre details (size, make, unladen pressure) etc., distance between tyre & RUPD RH & LH, frame rear width, P1, P2 points.",
    "notes": []
  },
  {
    "clause": "B23.5",
    "description": "RUPD Material with specific grade",
    "notes": []
  },
  {
    "clause": "B24.0",
    "description": "Lateral Protection (Side Guards)",
    "notes": []
  },
  {
    "clause": "B24.1",
    "description": "Height of the lower edge of the Side Guard from the ground (mm).",
    "notes": []
  },
  {
    "clause": "B24.2",
    "description": "Drawing of the lateral protection device with dimensions. LPD cross section, material details with grade etc.",
    "notes": []
  },
  {
    "clause": "B24.3",
    "description": "Distance between tyre & LPD front, rear, RH & LH, distance between supports of LPD, distance between device & load body.",
    "notes": []
  },
  {
    "clause": "B24.4",
    "description": "Material (Metal / Fiber / etc.)",
    "notes": []
  },
  {
    "clause": "B25.0",
    "description": "Controls - Specify method of operation, hand operated - left / right, foot operated - left / right Ref. SS 12.1 or corresponding Indian Standard).",
    "notes": []
  },
  {
    "clause": "B25.1",
    "description": "Ignition",
    "notes": []
  },
  {
    "clause": "B25.2",
    "description": "Horn",
    "notes": []
  },
  {
    "clause": "B25.3",
    "description": "Lamps (Head lamp, Tail lamp, Parking lamp and Number plate lamp)",
    "notes": []
  },
  {
    "clause": "B25.4",
    "description": "Turn signal",
    "notes": []
  },
  {
    "clause": "B25.5",
    "description": "Transmission shift lever",
    "notes": []
  },
  {
    "clause": "B25.6",
    "description": "Wind shield wiper",
    "notes": []
  },
  {
    "clause": "B25.7",
    "description": "High beam/low beam",
    "notes": []
  },
  {
    "clause": "B25.8",
    "description": "Parking brake",
    "notes": []
  },
  {
    "clause": "B25.9",
    "description": "Master switch for electrical",
    "notes": []
  },
  {
    "clause": "B25.10",
    "description": "Hazard warning signal",
    "notes": []
  },
  {
    "clause": "B25.11",
    "description": "Service Brake",
    "notes": []
  },
  {
    "clause": "B25.12",
    "description": "Accelerator Pedal (Floor hinged/hanging type)",
    "notes": []
  },
  {
    "clause": "B25.13",
    "description": "Others",
    "notes": []
  },
  {
    "clause": "B26.0",
    "description": "Safety glass",
    "notes": []
  },
  {
    "clause": "B26.1",
    "description": "Front wind shield (laminated)",
    "notes": []
  },
  {
    "clause": "B26.1.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B 26.1.2",
    "description": "Identification: TAC No. / BIS License No. / E- Marking",
    "notes": []
  },
  {
    "clause": "B26.1.3",
    "description": "Type (flat/curved, clear/tinted)",
    "notes": []
  },
  {
    "clause": "B26.1.4",
    "description": "Thickness (mm)",
    "notes": []
  },
  {
    "clause": "B26.1.5",
    "description": "Rake Angle",
    "notes": []
  },
  {
    "clause": "B26.1.6",
    "description": "Method of fixing (for approval of Demisting / Defrosting system)",
    "notes": []
  },
  {
    "clause": "B26.2",
    "description": "Side Windows (Left & Right)",
    "notes": []
  },
  {
    "clause": "B26.2.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B 26.2.2",
    "description": "Identification: TAC No. / BIS License No. / E- Marking",
    "notes": []
  },
  {
    "clause": "B26.2.3",
    "description": "Type (Toughened / Laminated)",
    "notes": []
  },
  {
    "clause": "B26.2.4",
    "description": "Thickness mm",
    "notes": []
  },
  {
    "clause": "B26.2.5",
    "description": "Colour",
    "notes": []
  },
  {
    "clause": "B26.3",
    "description": "Rear Window",
    "notes": []
  },
  {
    "clause": "B26.3.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B 26.3.2",
    "description": "Identification: TAC No. / BIS License No. / E- Marking",
    "notes": []
  },
  {
    "clause": "B26.3.3",
    "description": "Type (Toughened / Laminated)",
    "notes": []
  },
  {
    "clause": "B26.3.4",
    "description": "Thickness mm",
    "notes": []
  },
  {
    "clause": "B26.3.5",
    "description": "Radius of curvature (if curved)",
    "notes": []
  },
  {
    "clause": "B26.4",
    "description": "Sun / Moon roof glass",
    "notes": []
  },
  {
    "clause": "B26.4.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B26.4.2",
    "description": "Identification: TAC No. / BIS License No. / E- Marking",
    "notes": []
  },
  {
    "clause": "B26.4.3",
    "description": "Type (Toughened / Laminated)",
    "notes": []
  },
  {
    "clause": "B26.4.4",
    "description": "Thickness mm",
    "notes": []
  },
  {
    "clause": "B26.4.5",
    "description": "Colour",
    "notes": []
  },
  {
    "clause": "B27.0",
    "description": "Rear view mirror : [ As applicable to the category of vehicle ]",
    "notes": []
  },
  {
    "clause": "B27.1",
    "description": "Interior mirror (Class-I)",
    "notes": []
  },
  {
    "clause": "B27.1.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B27.1.2",
    "description": "Identification: TAC No. / BIS License No. / E- Marking",
    "notes": []
  },
  {
    "clause": "B27.2",
    "description": "Main mirror (Large) (Class-II)",
    "notes": []
  },
  {
    "clause": "B27.2.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B27.2.2",
    "description": "Identification: TAC No. / BIS License No. / E- Marking",
    "notes": []
  },
  {
    "clause": "B27.3",
    "description": "Main mirror (Small) (Class-III)",
    "notes": []
  },
  {
    "clause": "B27.3.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B27.3.2",
    "description": "Identification: TAC No. / BIS License No. / E- Marking",
    "notes": []
  },
  {
    "clause": "B27.4",
    "description": "Wide angle mirror (Class-IV)",
    "notes": []
  },
  {
    "clause": "B27.4.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B27.4.2",
    "description": "Identification: TAC No. / BIS License No. / E- Marking",
    "notes": []
  },
  {
    "clause": "B27.5",
    "description": "Close proximity mirror (Class-V)",
    "notes": []
  },
  {
    "clause": "B27.5.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B27.5.2",
    "description": "Identification: TAC No. / BIS License No. / E- Marking",
    "notes": []
  },
  {
    "clause": "B27.6",
    "description": "Front mirror (Class-VI)",
    "notes": []
  },
  {
    "clause": "B27.6.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B27.6.2",
    "description": "Identification: TAC No. / BIS License No. / E- Marking",
    "notes": []
  },
  {
    "clause": "B27.7",
    "description": "Devices for indirect vision other than mirrors:",
    "notes": []
  },
  {
    "clause": "B27.7.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B27.7.2",
    "description": "Identification: TAC No. / BIS License No. / E- Marking",
    "notes": []
  },
  {
    "clause": "B27.8",
    "description": "Brief drawing showing installation dimensions of all mirrors provided on the vehicle and drivers ocular point angle with RH mirror",
    "notes": []
  },
  {
    "clause": "B28.0",
    "description": "Information on safety belt / restraint system :",
    "notes": []
  },
  {
    "clause": "B28.1",
    "description": "Safety belt",
    "notes": []
  },
  {
    "clause": "B28.1.1",
    "description": "Make of seat belt",
    "notes": []
  },
  {
    "clause": "B28.1.2",
    "description": "Type and configuration",
    "notes": []
  },
  {
    "clause": "B 28.1.3",
    "description": "Identification No. / Part No / TAC No",
    "notes": []
  },
  {
    "clause": "B28.2",
    "description": "Restraint system",
    "notes": []
  },
  {
    "clause": "B28.2.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B28.2.2",
    "description": "Type and configuration",
    "notes": []
  },
  {
    "clause": "B28.2.3",
    "description": "Identification No. / Part No / TAC No",
    "notes": []
  },
  {
    "clause": "B28.2.4",
    "description": "Drawings of the relevant parts of the vehicle structure and any seat anchorage reinforcements",
    "notes": []
  },
  {
    "clause": "B28.2.5",
    "description": "Drawings of the seat, showing its structure, adjustment system and fixing components, with an indication of the materials used.",
    "notes": []
  },
  {
    "clause": "B28.3",
    "description": "Safety belts and / or other restraint systems :",
    "notes": []
  },
  {
    "clause": "B28.3.1",
    "description": "Number and position of safety belts and restraint systems and seats on which they can be used",
    "notes": []
  },
  {
    "clause": "B28.3.1",
    "description": "Row of Seat",
    "notes": [
      "Location*",
      "Type of seat belt",
      "Variant (if applicable)",
      "Belt adjustment device for height (indicate yes/no/optional)"
    ]
  },
  {
    "clause": "B28.3.1",
    "description": "First row of seats",
    "notes": [
      "L"
    ]
  },
  {
    "clause": "B28.3.1",
    "description": "First row of seats",
    "notes": [
      "C"
    ]
  },
  {
    "clause": "B28.3.1",
    "description": "First row of seats",
    "notes": [
      "R"
    ]
  },
  {
    "clause": "B28.3.1",
    "description": "Second row of seats",
    "notes": [
      "L"
    ]
  },
  {
    "clause": "B28.3.1",
    "description": "Second row of seats",
    "notes": [
      "C"
    ]
  },
  {
    "clause": "B28.3.1",
    "description": "Second row of seats",
    "notes": [
      "R"
    ]
  },
  {
    "clause": "B28.3.1",
    "description": "The table may be extended as necessary for vehicles with more than two rows of seats there are more than three seats across the width of the vehicle. *(L = left-hand side, R= right-hand side, C = Centre)",
    "notes": []
  },
  {
    "clause": "B28.4",
    "description": "Emergency exit",
    "notes": []
  },
  {
    "clause": "B28.4.1",
    "description": "Position",
    "notes": []
  },
  {
    "clause": "B28.4.2",
    "description": "Size",
    "notes": []
  },
  {
    "clause": "B29.0",
    "description": "Fuel tank :",
    "notes": []
  },
  {
    "clause": "B29.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B29.2",
    "description": "Material (Metallic / Plastic etc.)",
    "notes": []
  },
  {
    "clause": "B29.3",
    "description": "Capacity, litre",
    "notes": []
  },
  {
    "clause": "B29.4",
    "description": "Detailed drawing of the fuel tank assembly with material specifications",
    "notes": []
  },
  {
    "clause": "B29.5",
    "description": "Detailed drawing indicating the position / location of the fuel tank (s) in the vehicle.",
    "notes": []
  },
  {
    "clause": "B29.6",
    "description": "Identification No. / Part No.",
    "notes": []
  },
  {
    "clause": "B29.7",
    "description": "TAC No. / BIS License No. / E- Marking",
    "notes": []
  },
  {
    "clause": "B 30.0",
    "description": "Wheel Rim",
    "notes": []
  },
  {
    "clause": "B 30.1",
    "description": "Front",
    "notes": []
  },
  {
    "clause": "B 30.1.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B 30.1.1.1",
    "description": "BIS license Number",
    "notes": []
  },
  {
    "clause": "B 30.1.2",
    "description": "Part number of wheelrim supplier",
    "notes": []
  },
  {
    "clause": "B 30.1.3",
    "description": "Size",
    "notes": []
  },
  {
    "clause": "B 30.1.4",
    "description": "Type (Alloy / Sheet metal / spoke)",
    "notes": []
  },
  {
    "clause": "B 30.2",
    "description": "Rear",
    "notes": []
  },
  {
    "clause": "B 30.2.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B 30.2.1.1",
    "description": "BIS license Number",
    "notes": []
  },
  {
    "clause": "B 30.2.2",
    "description": "Part number of wheelrim supplier",
    "notes": []
  },
  {
    "clause": "B 30.2.3",
    "description": "Size",
    "notes": []
  },
  {
    "clause": "B 30.2.4",
    "description": "Type (Alloy / Sheet metal / spoke)",
    "notes": []
  },
  {
    "clause": "B 30.3",
    "description": "Spare Wheel Rim",
    "notes": []
  },
  {
    "clause": "B 30.3.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B 30.3.1.1",
    "description": "BIS license Number",
    "notes": []
  },
  {
    "clause": "B 30.3.2",
    "description": "Part number of wheelrim supplier",
    "notes": []
  },
  {
    "clause": "B 30.3.3",
    "description": "Size",
    "notes": []
  },
  {
    "clause": "B 30.3.4",
    "description": "Type (Alloy / Sheet metal / spoke)",
    "notes": []
  },
  {
    "clause": "B31.0",
    "description": "Door, Door locks and hinges:",
    "notes": []
  },
  {
    "clause": "B31.1",
    "description": "Doors",
    "notes": []
  },
  {
    "clause": "B31.1.1",
    "description": "No. of doors",
    "notes": []
  },
  {
    "clause": "B31.1.2",
    "description": "Position and type of door",
    "notes": []
  },
  {
    "clause": "B31.1.3",
    "description": "Detailed drawing of the door including location of the door strengthening bars, Dimensions of door reinforcements from door lower edge, cross section of the bars, material specification of the bar and door sheet metal, number of reinforcements and details of welding / bolting etc.,( for side door impact test )",
    "notes": []
  },
  {
    "clause": "B31.2",
    "description": "Door lock / latch",
    "notes": []
  },
  {
    "clause": "B31.2.1",
    "description": "Front",
    "notes": []
  },
  {
    "clause": "B31.2.1.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B31.2.1.2",
    "description": "Identification No. / Part No.",
    "notes": []
  },
  {
    "clause": "B31.1.2.3",
    "description": "TAC No. / BIS License No. / E- Marking",
    "notes": []
  },
  {
    "clause": "B31.2.2",
    "description": "Rear",
    "notes": []
  },
  {
    "clause": "B31.2.2.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B31.2.2.2",
    "description": "Identification No. / Part No.",
    "notes": []
  },
  {
    "clause": "B31.2.2.3",
    "description": "TAC No. / BIS License No. / E- Marking",
    "notes": []
  },
  {
    "clause": "B31.3",
    "description": "Door hinge",
    "notes": []
  },
  {
    "clause": "B31.3.1",
    "description": "Front",
    "notes": []
  },
  {
    "clause": "B31.3.1.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B31.3.1.2",
    "description": "Identification No. / Part No.",
    "notes": []
  },
  {
    "clause": "B31.3.1.3",
    "description": "TAC No. / BIS License No. / E- Marking",
    "notes": []
  },
  {
    "clause": "B31.3.2",
    "description": "Rear",
    "notes": []
  },
  {
    "clause": "B31.3.2.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B31.3.2.2",
    "description": "Identification No. / Part No.",
    "notes": []
  },
  {
    "clause": "B31.3.2.3",
    "description": "TAC No. / BIS License No. / E- Marking",
    "notes": []
  },
  {
    "clause": "B32.0",
    "description": "Wheel Fastener(s) and Hub cap :",
    "notes": []
  },
  {
    "clause": "B32.1",
    "description": "Wheel Nut (s) / Bolt (s)",
    "notes": []
  },
  {
    "clause": "B32.1.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B32.1.2",
    "description": "Size",
    "notes": []
  },
  {
    "clause": "B32.1.3",
    "description": "Nos. per wheel",
    "notes": []
  },
  {
    "clause": "B32.1.4",
    "description": "Tightening torque (recommended by the vehicle Manufacturer)",
    "notes": []
  },
  {
    "clause": "B32.1.5",
    "description": "Detailed dimensional drawing along with material specifications",
    "notes": []
  },
  {
    "clause": "B32.2",
    "description": "Wheel cap ( if provided )",
    "notes": []
  },
  {
    "clause": "B32.2.1",
    "description": "Detailed dimensional drawing along with press fit diameter as applicable",
    "notes": []
  },
  {
    "clause": "B32.3",
    "description": "Hub cap",
    "notes": []
  },
  {
    "clause": "B32.3.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B32.3.2",
    "description": "Method of fitment (Press/bolted/others)",
    "notes": []
  },
  {
    "clause": "B32.3.3",
    "description": "Brief dimensional drawing along with press fit diameter as applicable",
    "notes": []
  },
  {
    "clause": "B33.0",
    "description": "Towing devices :",
    "notes": []
  },
  {
    "clause": "B33.1",
    "description": "Type",
    "notes": []
  },
  {
    "clause": "B33.2",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B33.3",
    "description": "Capacity",
    "notes": []
  },
  {
    "clause": "B34.0",
    "description": "Coupling devices (for trailers) :",
    "notes": []
  },
  {
    "clause": "B34.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B34.2",
    "description": "Identification mark",
    "notes": []
  },
  {
    "clause": "B34.3",
    "description": "Type of coupling device for mechanical",
    "notes": []
  },
  {
    "clause": "B34.4",
    "description": "Type of coupling device for electrical",
    "notes": []
  },
  {
    "clause": "B34.5",
    "description": "Type of coupling device for brake",
    "notes": []
  },
  {
    "clause": "B34.6",
    "description": "Dia. Of king pin (mm)",
    "notes": []
  },
  {
    "clause": "B35.0",
    "description": "Spray Suppression System",
    "notes": []
  },
  {
    "clause": "B35.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B35.2",
    "description": "Type (Water separator / Pulveriser)",
    "notes": []
  },
  {
    "clause": "B35.3",
    "description": "Identification No. / Part No.",
    "notes": []
  },
  {
    "clause": "B35.4",
    "description": "Size",
    "notes": []
  },
  {
    "clause": "B35.5",
    "description": "Detailed engineering drawing as specified in AIS-013 or photographs showing the mounting details with dimensions.",
    "notes": []
  },
  {
    "clause": "B36.0",
    "description": "Interior Fittings as per IS 15223 or AIS-047, as applicable",
    "notes": []
  },
  {
    "clause": "B36.1",
    "description": "Instrument Panel (Dash Board)",
    "notes": []
  },
  {
    "clause": "B36.2",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B36.3",
    "description": "Identification No. / Part No/Drawing No.",
    "notes": []
  },
  {
    "clause": "B36.4",
    "description": "Drawing showing the mounting details, overall size and all control switches with dimensions",
    "notes": []
  },
  {
    "clause": "B36.5",
    "description": "Additional details for interior fitting tests to be given (if test is already conducted, this information need not be submitted).",
    "notes": []
  },
  {
    "clause": "B36.5.1",
    "description": "Drawing of Instrument Panel Variants (With / without Airbag, Music system, AC)",
    "notes": []
  },
  {
    "clause": "B36.5.2",
    "description": "Material used for instrument Panel",
    "notes": []
  },
  {
    "clause": "B36.5.3",
    "description": "Drawings",
    "notes": []
  },
  {
    "clause": "B36.5.3.1",
    "description": "Instrument Panel mounting (With hardware details)",
    "notes": []
  },
  {
    "clause": "B36.5.3.2",
    "description": "Cross sectional drawings for each projection more than 3.2",
    "notes": []
  },
  {
    "clause": "B36.5.3.3",
    "description": "Cross sectional Drawing of Gear shift lever",
    "notes": []
  },
  {
    "clause": "B36.5.3.4",
    "description": "Drawing of Grab handle with cross section",
    "notes": []
  },
  {
    "clause": "B36.5.3.5",
    "description": "Drawing of Sun visor with details of metal wire used",
    "notes": []
  },
  {
    "clause": "B36.5.3.6",
    "description": "Drawing of lamp assembly mounted at roof",
    "notes": []
  },
  {
    "clause": "B36.5.3.7",
    "description": "Drawing of Cigarrete lighter/ charging point",
    "notes": []
  },
  {
    "clause": "B36.5.3.8",
    "description": "Any other fitment",
    "notes": []
  },
  {
    "clause": "B37.0",
    "description": "Bumper (for M1 category vehicle) :",
    "notes": []
  },
  {
    "clause": "B37.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B37.2",
    "description": "Identification No. / Part No./Drawing No.",
    "notes": []
  },
  {
    "clause": "B37.3",
    "description": "Installation drawing showing location of Bumper in the front and rear, fitment of the Bumper, dimensions of Bumper, mounting points, details of mounting fasteners and additional fitments on it.",
    "notes": []
  },
  {
    "clause": "B37.4",
    "description": "Material of Bumper with details (metallic / non-metallic)",
    "notes": []
  },
  {
    "clause": "B37.5",
    "description": "Test method to be adopted by the test agency (Pendulum impact test, Component level vibration test, or Vehicle level four poster test )",
    "notes": []
  },
  {
    "clause": "B 38.0",
    "description": "Flammability requirements of interior materials as per IS 15061, as applicable.",
    "notes": []
  },
  {
    "clause": "B 38.1",
    "description": "Seat Upholstery",
    "notes": []
  },
  {
    "clause": "B 38.1.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B 38.1.2",
    "description": "Material",
    "notes": []
  },
  {
    "clause": "B 38.1.3",
    "description": "Identification No. / Part No./Drawing No.",
    "notes": []
  },
  {
    "clause": "B 38.2",
    "description": "Roof lining",
    "notes": []
  },
  {
    "clause": "B 38.2.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B 38.2.2",
    "description": "Material",
    "notes": []
  },
  {
    "clause": "B 38.2.3",
    "description": "Identification No. / Part No./Drawing No.",
    "notes": []
  },
  {
    "clause": "B 38.3",
    "description": "Floor lining",
    "notes": []
  },
  {
    "clause": "B 38.3.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B 38.3.2",
    "description": "Material",
    "notes": []
  },
  {
    "clause": "B 38.3.3",
    "description": "Identification No. / Part No./Drawing No.",
    "notes": []
  },
  {
    "clause": "B 38.4",
    "description": "Side wall lining",
    "notes": []
  },
  {
    "clause": "B 38.4.1",
    "description": "Make.",
    "notes": []
  },
  {
    "clause": "B 38.4.2",
    "description": "Material",
    "notes": []
  },
  {
    "clause": "B 38.4.3",
    "description": "Identification No. / Part No./Drawing No.",
    "notes": []
  },
  {
    "clause": "B 38.5",
    "description": "Rear wall lining",
    "notes": []
  },
  {
    "clause": "B 38.5.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B 38.5.2",
    "description": "Material",
    "notes": []
  },
  {
    "clause": "B 38.5.3",
    "description": "Identification No. / Part No./Drawing No.",
    "notes": []
  },
  {
    "clause": "B 38.6",
    "description": "Interior lining of luggage racks",
    "notes": []
  },
  {
    "clause": "B 38.6.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B 38.6.2",
    "description": "Material",
    "notes": []
  },
  {
    "clause": "B 38.6.3",
    "description": "Identification No. / Part No./Drawing No.",
    "notes": []
  },
  {
    "clause": "B 38.7",
    "description": "Heating and ventilation pipe",
    "notes": []
  },
  {
    "clause": "B 38.7.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B 38.7.2",
    "description": "Material",
    "notes": []
  },
  {
    "clause": "B 38.7.3",
    "description": "Identification No. / Part No./Drawing No.",
    "notes": []
  },
  {
    "clause": "B 38.8",
    "description": "Curtain / Blinds / Hanging material",
    "notes": []
  },
  {
    "clause": "B 38.8.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B 38.8.2",
    "description": "Material",
    "notes": []
  },
  {
    "clause": "B 38.8.3",
    "description": "Identification No. / Part No./Drawing No.",
    "notes": []
  },
  {
    "clause": "B 38.9",
    "description": "Material for Luminaries",
    "notes": []
  },
  {
    "clause": "B 38.9.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B 38.9.2",
    "description": "Material",
    "notes": []
  },
  {
    "clause": "B 38.9.3",
    "description": "Identification No. / Part No./Drawing No.",
    "notes": []
  },
  {
    "clause": "B 38.10",
    "description": "Separation wall",
    "notes": []
  },
  {
    "clause": "B 38.10.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B 38.10.2",
    "description": "Material",
    "notes": []
  },
  {
    "clause": "B 38.10.3",
    "description": "Identification No. / Part No./Drawing No.",
    "notes": []
  },
  {
    "clause": "B39.0",
    "description": "Hand holds (as per AIS-046)",
    "notes": []
  },
  {
    "clause": "B39.1",
    "description": "No. of hand holds",
    "notes": []
  },
  {
    "clause": "B39.2",
    "description": "Details and dimension of hand hold indicating length, clearance between the hand hold and body and cross sectional area. Of every hand hold (if required , details may be provided as a separate Annexure)",
    "notes": []
  },
  {
    "clause": "B39.2.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B39.2.2",
    "description": "Identification No. / Part No./Drawing No.",
    "notes": []
  },
  {
    "clause": "B39.2.3",
    "description": "Type (Grab handle / Strap / Hand Rail)",
    "notes": []
  },
  {
    "clause": "B39.2.4",
    "description": "Material",
    "notes": []
  },
  {
    "clause": "B39.2.5",
    "description": "Size",
    "notes": []
  },
  {
    "clause": "B39.3",
    "description": "Installation drawing of hand hold, showing location of mounting for every seating position, passengers details of mounting fasteners and additional fitments on it",
    "notes": []
  },
  {
    "clause": "B 40.0",
    "description": "Arrangement of foot controls ( For M1 category as per AIS-035)",
    "notes": []
  },
  {
    "clause": "B 40.1",
    "description": "Distance between the contour points of the orthogonal projections on to plane P of the accelerator pedal and service brake pedal bearing surfaces, E in mm.",
    "notes": []
  },
  {
    "clause": "B 40.2",
    "description": "Distance between the projection of the service brake pedal on to the reference plane P, to the right, H in mm.",
    "notes": []
  },
  {
    "clause": "B 40.3",
    "description": "Distance between the projection of the service brake pedal on to the reference plane P, to the left, J in mm.",
    "notes": []
  },
  {
    "clause": "B 40.4",
    "description": "Drawing showing the parts and arrangement of the foot controls along with dimensions E, H and J",
    "notes": []
  },
  {
    "clause": "B41.0",
    "description": "Statutory Plates  Vehicle Identification Number (As per AIS-065)",
    "notes": []
  },
  {
    "clause": "B41.1",
    "description": "Drawings and/or photographs of the locations of the statutory plates and inscriptions and of the vehicle identification number",
    "notes": []
  },
  {
    "clause": "B41.2",
    "description": "Drawings and / or photographs of the official part of the plates and inscriptions (completed example with dimensions)",
    "notes": []
  },
  {
    "clause": "B41.3",
    "description": "Drawings and / or photographs of the Body Builders Plates and its location on the vehicle",
    "notes": []
  },
  {
    "clause": "B41.4",
    "description": "World Manufacturers Identifier (WMI) code and its location in Vehicle Identification Number (VIN)",
    "notes": []
  },
  {
    "clause": "B41.5",
    "description": "Location of Vehicle Descriptor Section (VDS) in Vehicle Identification Number (VIN)",
    "notes": []
  },
  {
    "clause": "B41.6",
    "description": "Location of Vehicle Indicator Section (VIS) in Vehicle Identification Number (VIN)",
    "notes": []
  },
  {
    "clause": "B41.7",
    "description": "Height of characters in VIN (mm)",
    "notes": []
  },
  {
    "clause": "B42.0",
    "description": "Window retention and release for Buses as per IS 13944",
    "notes": []
  },
  {
    "clause": "B42.1",
    "description": "Type (Toughened / Laminated) of the window glass and its Thickness",
    "notes": []
  },
  {
    "clause": "B42.1.1",
    "description": "Method of Window Fixing (sliding or sealed or opening outside etc.)",
    "notes": []
  },
  {
    "clause": "B42.1.2",
    "description": "Brief description of the Provision for emergency exit provided in case of sealed windows",
    "notes": []
  },
  {
    "clause": "B42.1.3",
    "description": "Name of the Window Manufacturer",
    "notes": []
  },
  {
    "clause": "B42.2",
    "description": "Drawing (including Drawing no. & Revision no.) including Plan view, Elevation, LH, RH view of Vehicle showing the dimensions of all windows, seating layout and location of emergency exit.",
    "notes": []
  },
  {
    "clause": "B42.3",
    "description": "Detailed Brief dimensional drawing of emergency exit indicating its location(s)",
    "notes": []
  },
  {
    "clause": "B42.4",
    "description": "Number of passenger compartment doors provided in addition to drivers door.",
    "notes": []
  },
  {
    "clause": "B42.5",
    "description": "Dimensions Emergency exit identification",
    "notes": []
  },
  {
    "clause": "B42.5.1",
    "description": "Number(s) and Dimensions of Roof Exit (if provided)",
    "notes": []
  },
  {
    "clause": "B42.6",
    "description": "Dimensions of the instructions describing each motion necessary to unlatch and open the exit are provided from the release mechanism.",
    "notes": []
  },
  {
    "clause": "B 43.0",
    "description": "Front Under run Protective devices as per AIS-069",
    "notes": []
  },
  {
    "clause": "B 43.1",
    "description": "Drawing of the vehicle parts relevant to the front under run protection, i.e., drawing of the vehicle and/or chassis with position and mounting and/or fitting of the front under run protective device. Mentioning material details of FUPD & mounting hardware. If the under run protection is by no special device, the drawing should clearly show as how the required dimensions are met.",
    "notes": []
  },
  {
    "clause": "B 43.2",
    "description": "In the case of special device, full description and/or drawing of the front under run protection (including mountings and fittings) & material details, distance of P1 & P2 points from center & tyres.",
    "notes": []
  },
  {
    "clause": "B43.3",
    "description": "Installation drawing of the FUPD with dimensions like cross section, distance between tyre & FUPD RH side & LH side, distance between front extremity & FUPD, width of FUPD, ID marking of FUPD, Width measured from the outermost points of access steps to driver cabin etc.",
    "notes": []
  },
  {
    "clause": "B 44.0",
    "description": "Coupling Device (for T Category)",
    "notes": []
  },
  {
    "clause": "B 44.1",
    "description": "Trade name or mark / approval No(s):",
    "notes": []
  },
  {
    "clause": "B 44.2",
    "description": "Type (Mechanical / Close):",
    "notes": []
  },
  {
    "clause": "B 44.3",
    "description": "Class of coupling device",
    "notes": []
  },
  {
    "clause": "B 44.4",
    "description": "Maximum permissible static mass on coupling ball (kg)",
    "notes": []
  },
  {
    "clause": "B 44.5",
    "description": "Maximum permissible static vertical load on coupling ball (kgf)",
    "notes": []
  },
  {
    "clause": "B 44.6",
    "description": "Drawing showing details of mounting points on the vehicle",
    "notes": []
  },
  {
    "clause": "B 44.7",
    "description": "D..............kN Dc................kN S...............kg U...............tonnes V.............. &kN",
    "notes": []
  },
  {
    "clause": "B 45.0",
    "description": "Make of the rear marking plate:",
    "notes": []
  },
  {
    "clause": "B 45.1",
    "description": "Rear marking plate type:",
    "notes": []
  },
  {
    "clause": "B 45.2",
    "description": "Rear marking plate class:",
    "notes": []
  },
  {
    "clause": "B 45.3",
    "description": "Drawing showing Position of rear marking plate on vehicle:",
    "notes": []
  },
  {
    "clause": "B45.4",
    "description": "Identification (Applicable for Heavy and long vehicles as per AIS-089)",
    "notes": []
  },
  {
    "clause": "B 46.0",
    "description": "Child Restraint system (CRS) ;",
    "notes": []
  },
  {
    "clause": "B 46.1",
    "description": "Seating Positions for Child restraint system (As per AIS-072)",
    "notes": []
  },
  {
    "clause": "B 46.1",
    "description": "Mass Group",
    "notes": [
      "Seating Position (or other site)"
    ]
  },
  {
    "clause": "B 46.1",
    "description": "Mass Group",
    "notes": [
      "Front Passenger",
      "Rear Outboard",
      "Rear Centre",
      "Intermediate Outboard",
      "Intermediate Centre"
    ]
  },
  {
    "clause": "B 46.1",
    "description": "Group 0 up to 10 kg",
    "notes": []
  },
  {
    "clause": "B 46.1",
    "description": "Group 0+ up to 13 kg",
    "notes": []
  },
  {
    "clause": "B 46.1",
    "description": "Group I 9 to 18 kg",
    "notes": []
  },
  {
    "clause": "B 46.1",
    "description": "Group II 15 to 25 kg",
    "notes": []
  },
  {
    "clause": "B 46.1",
    "description": "Group III 22 to 36 kg",
    "notes": []
  },
  {
    "clause": "B 46.1",
    "description": "Key of letters to be inserted in the above table: U = Suitable for Universal category restraints approved for use in this mass group. UF = Suitable for forward-facing Universal category restraints approved for use in this mass group. L = Suitable for particular child restraints given on attached list. These restraints may be of the Specific vehicle. Restricted or Semi-Universal categories. B = Built in restraints approved for this mass group. X = Set position not suitable for children in this mass group.",
    "notes": []
  },
  {
    "clause": "B 46.2",
    "description": "Details of CRS (To be provided if the CRS is not of Universal category (U/UF))",
    "notes": []
  },
  {
    "clause": "B 46.3",
    "description": "Category of CRS(Semi Universal, Restricted or specific vehicle)",
    "notes": []
  },
  {
    "clause": "B 46.4",
    "description": "Belt type: (adult) three-point belt (adult) lap belt/ special type belt/retractor;",
    "notes": []
  },
  {
    "clause": "B 46.5",
    "description": "Trade name or mark",
    "notes": []
  },
  {
    "clause": "B 46.6",
    "description": "Drawings, Diagrams and plans of the child restraint, including any retractor, chair assembly, impact shield fitted",
    "notes": []
  },
  {
    "clause": "B 46.7",
    "description": "Drawings, Diagrams and plans of the child restraint, including any retractor, chair assembly, impact shield fitted;",
    "notes": []
  },
  {
    "clause": "B 46.8",
    "description": "Drawings, Diagrams and plans of the vehicle structure and the seat structure, as well as of the adjustment system and the attachments, including any energy absorber fitted;",
    "notes": []
  },
  {
    "clause": "B 46.9",
    "description": "Photographs of the child restraint and/or vehicle structure and seat structure;",
    "notes": []
  },
  {
    "clause": "B 47.0",
    "description": "Head-On Collision as per AIS-096 and Off-set frontal collision as per AIS-098",
    "notes": []
  },
  {
    "clause": "B 47.1",
    "description": "Brief description of the vehicle type as regards its structure, dimensions, lines and constituent materials:",
    "notes": []
  },
  {
    "clause": "B 47.2",
    "description": "\"Description of the protective system installed in the vehicle: (Seat Belts, Airbag, Other etc.)\"",
    "notes": []
  },
  {
    "clause": "B 47.3",
    "description": "Description of interior arrangements or fittings that might affect the tests:",
    "notes": []
  },
  {
    "clause": "B 47.4",
    "description": "(Photographs and/or diagrams and drawings permitting the basic identification of the type(s) of vehicle and its possible variants which are covered by the approval)",
    "notes": []
  },
  {
    "clause": "B 48.0",
    "description": "Side-Impact resistance as per AIS-099",
    "notes": []
  },
  {
    "clause": "B 48.1",
    "description": "A detailed description, including photographs and/or drawings, of the vehicle type with respect to the structure, the dimensions, the design and the constituent materials, the side walls of the passenger compartment (exterior and interior), including specific details of the protection system, where applicable:",
    "notes": []
  },
  {
    "clause": "B 49.0",
    "description": "Pedestrian protection as per AIS-100 :",
    "notes": []
  },
  {
    "clause": "",
    "description": "The distance, measured longitudinally on a horizontal plane, between the transverse centerline of the front axle & the R point of the drivers seat is less than 1100 mm (Yes / No).",
    "notes": []
  },
  {
    "clause": "B 49.1",
    "description": "Drawing of Bonnet & wings/ fender including material details",
    "notes": []
  },
  {
    "clause": "B 49.2",
    "description": "Drawing / Images of position & arrangement of Engine",
    "notes": []
  },
  {
    "clause": "B 49.3",
    "description": "Drawing/ Images of Under bonnet (Engine house) Components.",
    "notes": []
  },
  {
    "clause": "B 49.4",
    "description": "Drawing mentioning ground levels for correct ride attitude of the vehicle.",
    "notes": []
  },
  {
    "clause": "B 49.5",
    "description": "If lower bumper height is greater than, or equal to 425 mm and less than 500 mm, then test to be conducted with lower leg form or upper leg form",
    "notes": []
  },
  {
    "clause": "B 49.6",
    "description": "Identified zones of the bonnet top where the HIC must not exceed 1,000 (HIC1000 Zone) & 1,700 (HIC1700 Zone) respectively with drawing of the complete test impact area with 1000 and 1700 HIC zones mark on it.",
    "notes": []
  },
  {
    "clause": "B 50.0",
    "description": "Speed Governor (As applicable)",
    "notes": []
  },
  {
    "clause": "B 50.1",
    "description": "Type of Speed Governor (SLD / SLF)",
    "notes": []
  },
  {
    "clause": "B 50.2",
    "description": "Speed Limiting Device (SLD) [ For vehicles with max. speed above 80 kmph in unladen condition as per AIS-018.",
    "notes": []
  },
  {
    "clause": "B 50.3",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B 50.4",
    "description": "Model",
    "notes": []
  },
  {
    "clause": "B 50.5",
    "description": "Identification: TAC No. / BIS License No.",
    "notes": []
  },
  {
    "clause": "B 50.6",
    "description": "SLD approved for speed/s (Annexure to be provided including information for every Vehicle Model / Variants indicating various SLD approved speeds contributed due to declared transmission options)",
    "notes": []
  },
  {
    "clause": "B50.7",
    "description": "Speed Limiting Function (SLF)",
    "notes": []
  },
  {
    "clause": "B50.7.1",
    "description": "Make & country of origin of ECU",
    "notes": []
  },
  {
    "clause": "B 50.7.2",
    "description": "ECU Part No / Identification No",
    "notes": []
  },
  {
    "clause": "B 50.7.3",
    "description": "Cal ID of ECU",
    "notes": []
  },
  {
    "clause": "B 50.7.4",
    "description": "SLF approved for speed/s (Annexure to be provided including information for every Vehicle Model / Variants indicating various SLF approved speeds contributed due to declared transmission options)",
    "notes": []
  },
  {
    "clause": "B 51.0",
    "description": "Temporary Cabin for drive away chassis :",
    "notes": []
  },
  {
    "clause": "B 51.1",
    "description": "Width of the temporary cabin (mm)",
    "notes": []
  },
  {
    "clause": "B 51.2",
    "description": "Height of the temporary cabin (from seat top surface to canopy) (mm)",
    "notes": []
  },
  {
    "clause": "B 51.3",
    "description": "Depth or Length of the temporary cabin (Clearance from the rear most back rest when the seat is taken at the rear-most position) (mm)",
    "notes": []
  },
  {
    "clause": "B 51.4",
    "description": "Windshield type",
    "notes": []
  },
  {
    "clause": "B 51.5",
    "description": "Drawing showing the mounting and relevant dimensions",
    "notes": []
  },
  {
    "clause": "B 52.0",
    "description": "AIS-029 Survival Space for the Protection of the Occupants of the Cab of a Commercial Vehicle",
    "notes": []
  },
  {
    "clause": "B 52.1",
    "description": "Drawing showing R-Point height for vehicle w.r.t ground & fiducial point on the vehicle for driver",
    "notes": []
  },
  {
    "clause": "B 52.2",
    "description": "Cabin & Mounts Construction Details :",
    "notes": []
  },
  {
    "clause": "B 52.3",
    "description": "Construction: Integrated / Attached with Mounts",
    "notes": []
  },
  {
    "clause": "B 52.4",
    "description": "If attached with mounts: Number of cabin mounts: Cabin type: Tiltable / Fixed",
    "notes": []
  },
  {
    "clause": "B 52.5",
    "description": "Cabin Size: Day / Sleeper / High-Roof / Low Roof / Extended Day Cab / Any combination",
    "notes": []
  },
  {
    "clause": "B 52.6",
    "description": "Detailed drawings showing construction details of the cabin in sufficient details alongwith list of materials used in construction of the cabin",
    "notes": []
  },
  {
    "clause": "B 52.7",
    "description": "Drawings of vehicle, showing the position of the cab on the vehicle and the manner of its attachment, and by sufficiently detailed drawings relating to the structure of the cab,",
    "notes": []
  },
  {
    "clause": "B 52.8",
    "description": "Layout drawings for different types of cabin mounts available alongwith their position on chassis/frame, material properties of the mounts, attachment details, fastener details etc.",
    "notes": []
  },
  {
    "clause": "B 52.9",
    "description": "Interior Space & Standard Fitments",
    "notes": []
  },
  {
    "clause": "B 52.10",
    "description": "Layout drawings of the seating layout inside the cabin showing designated position of driver, co-driver, additional passengers, sleeper berths, second row seating positons etc.",
    "notes": []
  },
  {
    "clause": "B 52.11",
    "description": "Individual drawings of the driver & other seats showing normal position of use along with adjustment positions clearly identified",
    "notes": []
  },
  {
    "clause": "B 52.12",
    "description": "Layout drawings of the steering mechanism in mounted position along with normal position of use & adjustment positions clearly identified",
    "notes": []
  },
  {
    "clause": "B 53.0",
    "description": "Information for Speed alert",
    "notes": []
  },
  {
    "clause": "B 53.1",
    "description": "Details of audible alert (Alert above 80 km/h)",
    "notes": []
  },
  {
    "clause": "B 53.2",
    "description": "Details of audible alert Continuous /intermittent.(Alert above 120 km/h)",
    "notes": []
  },
  {
    "clause": "B 53.3.",
    "description": "if intermittent, Interval between Alerts",
    "notes": []
  },
  {
    "clause": "B 54.0",
    "description": "Information for Safety belt reminder",
    "notes": []
  },
  {
    "clause": "B 54.1.",
    "description": "Whether Visual warning for Safety belt reminder provided",
    "notes": []
  },
  {
    "clause": "B 54.2.",
    "description": "Whether audible warning for Safety belt reminder provided",
    "notes": []
  },
  {
    "clause": "B 55.0",
    "description": "Information for manual over-ride (Door, Door locks and hinges)(Yes/No):",
    "notes": []
  },
  {
    "clause": "B 56.0",
    "description": "Information for Reverse Parking Alert System",
    "notes": []
  },
  {
    "clause": "B 56.1.",
    "description": "Type of System ( Sensor based / Camera based system)",
    "notes": []
  },
  {
    "clause": "B 56.2.",
    "description": "Sensor based system (as applicable) information",
    "notes": []
  },
  {
    "clause": "B 56.2.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B 56.2.2",
    "description": "Identification No. / Part No.",
    "notes": []
  },
  {
    "clause": "B 56.2.3",
    "description": "Number of sensors and mounting location",
    "notes": []
  },
  {
    "clause": "B 56.3",
    "description": "Camera based System (as applicable)",
    "notes": []
  },
  {
    "clause": "B 56.3.1",
    "description": "Make",
    "notes": []
  },
  {
    "clause": "B 56.3.2",
    "description": "Identification No. / Part No.",
    "notes": []
  },
  {
    "clause": "B 56.3.3",
    "description": "Camera mounting location",
    "notes": []
  },
  {
    "clause": "B 56.3.4",
    "description": "Display Make",
    "notes": []
  },
  {
    "clause": "B 56.3.5",
    "description": "Display Identification No. / Part No.",
    "notes": []
  },
  {
    "clause": "B 56.3.6",
    "description": "Display location",
    "notes": []
  }
];

const clean = (value) => {
  if (value === null || value === undefined) return "";

  let text =
    typeof value === "object"
      ? JSON.stringify(value)
      : String(value);

  return text
    .replace(/\u0013/g, "–")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const getClauseData = (formData, clause, index) => {
  const source = formData?.values ?? formData ?? {};
  return source[clause] ?? source[String(index)] ?? {};
};

const getVariantValue = (entry, variant) => {
  if (entry === null || entry === undefined) return "";
  if (typeof entry !== "object" || Array.isArray(entry)) {
    return variant === "base" ? clean(entry) : "";
  }

  const keys = {
    base: ["base", "Base", "value"],
    variant1: ["variant1", "variant 1", "Variant 1"],
    variant2: ["variant2", "variant 2", "Variant 2"],
    variant3: ["variant3", "variant 3", "Variant 3"],
    variant4: ["variant4", "variant 4", "Variant 4"],
  }[variant];

  for (const key of keys) {
    if (entry[key] !== undefined && entry[key] !== null) return clean(entry[key]);
  }
  return "";
};

const cellBorders = {
  top: { style: BorderStyle.SINGLE, size: 4, color: "808080" },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: "808080" },
  left: { style: BorderStyle.SINGLE, size: 4, color: "808080" },
  right: { style: BorderStyle.SINGLE, size: 4, color: "808080" },
};

const makeCell = (text, options = {}) =>
  new TableCell({
    width: { size: options.width ?? 16, type: WidthType.PERCENTAGE },
    shading: options.header
      ? { type: ShadingType.CLEAR, fill: "D9EAF0" }
      : undefined,
    margins: { top: 80, bottom: 80, left: 90, right: 90 },
    borders: cellBorders,
    children: [
      new Paragraph({
        alignment: options.center ? AlignmentType.CENTER : AlignmentType.LEFT,
        children: [
          new TextRun({
            text: clean(text),
            bold: Boolean(options.header || options.bold),
            size: options.header ? 18 : 16,
            font: "Arial",
          }),
        ],
      }),
    ],
  });

const makeHeaderRow = () =>
  new TableRow({
    tableHeader: true,
    children: [
      makeCell("Clause No.", { header: true, width: 12 }),
      makeCell("Description", { header: true, width: 38 }),
      ...VARIANTS.map((name) => makeCell(name, { header: true, center: true, width: 10 })),
    ],
  });

const makeClauseRow = (row, index, formData) => {
  const entry = getClauseData(formData, row.clause, index);
  const isSubheading = !row.clause && Boolean(row.description);

  const description = [
    row.description,
    ...(row.notes?.length ? [`Details: ${row.notes.join(" / ")}`] : []),
  ].filter(Boolean).join("\n");

  return new TableRow({
    cantSplit: true,
    children: [
      makeCell(row.clause, { bold: Boolean(row.clause), width: 12 }),
      makeCell(description, { bold: isSubheading, width: 38 }),
      makeCell(getVariantValue(entry, "base"), { width: 10 }),
      makeCell(getVariantValue(entry, "variant1"), { width: 10 }),
      makeCell(getVariantValue(entry, "variant2"), { width: 10 }),
      makeCell(getVariantValue(entry, "variant3"), { width: 10 }),
      makeCell(getVariantValue(entry, "variant4"), { width: 10 }),
    ],
  });
};

const generateForm3 = async (formData = {}) => {
      const rows = [
    makeHeaderRow(),
    ...FORM3_CLAUSES.map((row, index) => makeClauseRow(row, index, formData)),
  ];

  const form3Document = new Document({
    creator: "BV-REG",
    title: "Form 3 – Table 3 – Vehicle Overall",
description: "AIS-007 (Revision 5), Part B – Vehicle Overall",
    sections: [
      {
        properties: {
          page: {
            size: { orientation: PageOrientation.LANDSCAPE },
            margin: { top: 650, right: 550, bottom: 650, left: 550 },
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 100 },
            children: [new TextRun({ text: FORM3_TITLE, bold: true, size: 26, font: "Arial" })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 220 },
            children: [new TextRun({ text: FORM3_SUBTITLE, bold: true, size: 22, font: "Arial" })],
          }),
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({ text: "AIS-007 (Revision 5)  Table 3", bold: true, size: 18, font: "Arial" }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            columnWidths: [1200, 3800, 1000, 1000, 1000, 1000, 1000],
            rows,
          }),
        ],
      },
    ],
  });

  await exportDoc(form3Document, "form3Document.docx");

return form3Document;
};

export { FORM3_CLAUSES };
export default generateForm3;
