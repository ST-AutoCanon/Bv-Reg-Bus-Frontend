export const VehicleCategory = [
  { name: "L1", value: "L1", disabled: false },
  { name: "L2", value: "L2", disabled: false },
  { name: "L5M", value: "L5M", disabled: false },
  { name: "L5N", value: "L5N", disabled: false },
];
export const NumberOfAxlesAndWheels = [
  {
    name: "Two axles and Two wheels",
    value: "Two axles and Two wheels",
    disabled: false,
  },
  {
    name: "Two Axles and Three Wheels",
    value: "Two Axles and Three Wheels",
    disabled: false,
  },
];
export const NumberOfSeatingPositions = [
  { name: "D+1 seater", value: "D+1 seater", disabled: false },
  { name: "D+2 seater", value: "D+2 seater", disabled: false },
  { name: "D+ 3 seater", value: "D+ 3 seater", disabled: false },
  { name: "D+4 seater", value: "D+4 seater", disabled: false },
  { name: "Only Rider/Driver", value: "Only Rider/Driver", disabled: false },
  { name: "R+1 seater", value: "R+1 seater", disabled: false },
];

export const BrakeSystemTypes = [
  {
    name: "Front Independent & Rear Independent",
    value: "Front Independent & Rear Independent",
    disabled: false,
  },
  {
    name: "Front Independent & Rear CBS",
    value: "Front Independent & Rear CBS",
    disabled: false,
  },
  {
    name: "Front Independent & Rear ABS",
    value: "Front Independent & Rear ABS",
    disabled: false,
  },
  { name: "SSBS", value: "SSBS", disabled: false },
  // {
  //   name: "Any other type (please specify)",
  //   value: "Any other type (please specify)",
  //   disabled: false,
  // },
  { name: "Mechanical", value: "Mechanical", disabled: false },
  { name: "Hydraulic", value: "Hydraulic", disabled: false },
  { name: "Air", value: "Air", disabled: false },
  { name: "Air assisted", value: "Air assisted", disabled: false },
  { name: "Vacuum assisted", value: "Vacuum assisted", disabled: false },
  
];

export const ServiceBrakeSystemTypes = [
  { name: "Mechanical", value: "Mechanical", disabled: false },
  { name: "Hydraulic", value: "Hydraulic", disabled: false },
  { name: "Air", value: "Air", disabled: false },
  { name: "Air assisted", value: "Air assisted", disabled: false },
  { name: "Vacuum assisted", value: "Vacuum assisted", disabled: false },
  
];

export const BrkTypes = [
  { name: "Front: Disc,NO:1", value: "Front: Disc,NO:1", disabled: false },
  { name: "Front: Disc,NO:2", value: "Front: Disc,NO:2", disabled: false },
  { name: "Front: Disc,NO:3", value: "Front: Disc,NO:3", disabled: false },
  { name: "Front: Disc,NO:4", value: "Front: Disc,NO:4", disabled: false },

  { name: "Rear: Drum,NO:1", value: "Rear: Drum,NO:1", disabled: false },
  { name: "Rear: Drum,NO:2", value: "Rear: Drum,NO:2", disabled: false },
  { name: "Rear: Drum,NO:3", value: "Rear: Drum,NO:3", disabled: false },
  { name: "Rear: Drum,NO:4", value: "Rear: Drum,NO:4", disabled: false },

  { name: "Front: Drum,NO:1", value: "Front: Drum,NO:1", disabled: false },
  { name: "Front: Drum,NO:2", value: "Front: Drum,NO:2", disabled: false },
  { name: "Front: Drum,NO:3", value: "Front: Drum,NO:3", disabled: false },
  { name: "Front: Drum,NO:4", value: "Front: Drum,NO:4", disabled: false },

  { name: "Rear: Disc,NO:1", value: "Rear: Disc,NO:1", disabled: false },
  { name: "Rear: Disc,NO:2", value: "Rear: Disc,NO:2", disabled: false },
  { name: "Rear: Disc,NO:3", value: "Rear: Disc,NO:3", disabled: false },
  { name: "Rear: Disc,NO:4", value: "Rear: Disc,NO:4", disabled: false },
];

export const BrkTypesRear = [
  { name: "Front: Disc,NO:1", value: "Front: Disc,NO:1", disabled: false },
  { name: "Front: Disc,NO:2", value: "Front: Disc,NO:2", disabled: false },
  { name: "Front: Disc,NO:3", value: "Front: Disc,NO:3", disabled: false },
  { name: "Front: Disc,NO:4", value: "Front: Disc,NO:4", disabled: false },

  { name: "Rear: Drum,NO:1", value: "Rear: Drum,NO:1", disabled: false },
  { name: "Rear: Drum,NO:2", value: "Rear: Drum,NO:2", disabled: false },
  { name: "Rear: Drum,NO:3", value: "Rear: Drum,NO:3", disabled: false },
  { name: "Rear: Drum,NO:4", value: "Rear: Drum,NO:4", disabled: false },

  { name: "Front: Drum,NO:1", value: "Front: Drum,NO:1", disabled: false },
  { name: "Front: Drum,NO:2", value: "Front: Drum,NO:2", disabled: false },
  { name: "Front: Drum,NO:3", value: "Front: Drum,NO:3", disabled: false },
  { name: "Front: Drum,NO:4", value: "Front: Drum,NO:4", disabled: false },

  { name: "Rear: Disc,NO:1", value: "Rear: Disc,NO:1", disabled: false },
  { name: "Rear: Disc,NO:2", value: "Rear: Disc,NO:2", disabled: false },
  { name: "Rear: Disc,NO:3", value: "Rear: Disc,NO:3", disabled: false },
  { name: "Rear: Disc,NO:4", value: "Rear: Disc,NO:4", disabled: false },
];

export const BrakingMediumOrLinkageTypes = [
  { name: "Hydraulic", value: "Hydraulic", disabled: false },
  { name: "Mechanical", value: "Mechanical", disabled: false },
  { name: "Other", value: "Other", disabled: false },
];
export const BrakeShoePadOptions = [
  // Front then Rear
  {
    name: "Front:Shoe ,Rear:Shoe",
    value: "Front:Shoe,Rear:Shoe",
    disabled: false,
  },
  {
    name: "Front:Shoe ,Rear:Pad",
    value: "Front:Shoe,Rear:Pad",
    disabled: false,
  },
  {
    name: "Front:Pad ,Rear:Shoe",
    value: "Front:Pad,Rear:Shoe",
    disabled: false,
  },
  { name: "Front:Pad ,Rear:Pad", value: "Front:Pad,Rear:Pad", disabled: false },

  // Rear then Front
  {
    name: "Rear:Shoe ,Front:Shoe",
    value: "Rear:Shoe,Front:Shoe",
    disabled: false,
  },
  {
    name: "Rear:Shoe ,Front:Pad",
    value: "Rear:Shoe,Front:Pad",
    disabled: false,
  },
  {
    name: "Rear:Pad ,Front:Shoe",
    value: "Rear:Pad,Front:Shoe",
    disabled: false,
  },
  { name: "Rear:Pad ,Front:Pad", value: "Rear:Pad,Front:Pad", disabled: false },
];

export const BrakeActuationMethodOptions = [
  // Front then Rear
  {
    name: "Front:Lever ,Rear:Lever",
    value: "Front:Lever,Rear:Lever",
    disabled: false,
  },
  {
    name: "Front:Lever ,Rear:Pedals",
    value: "Front:Lever,Rear:Pedals",
    disabled: false,
  },
  {
    name: "Front:Pedals ,Rear:Lever",
    value: "Front:Pedals,Rear:Lever",
    disabled: false,
  },
  {
    name: "Front:Pedals ,Rear:Pedals",
    value: "Front:Pedals,Rear:Pedals",
    disabled: false,
  },

  // Rear then Front
  {
    name: "Rear:Lever ,Front:Lever",
    value: "Rear:Lever,Front:Lever",
    disabled: false,
  },
  {
    name: "Rear:Lever ,Front:Pedals",
    value: "Rear:Lever,Front:Pedals",
    disabled: false,
  },
  {
    name: "Rear:Pedals ,Front:Lever",
    value: "Rear:Pedals,Front:Lever",
    disabled: false,
  },
  {
    name: "Rear:Pedals ,Front:Pedals",
    value: "Rear:Pedals,Front:Pedals",
    disabled: false,
  },
];

export const HydraulicReservoirApplicability = [
  { name: "Provided", value: "Provided", disabled: false },
  { name: "Not Applicable", value: "Not Applicable", disabled: false },
];
export const ABSProvidedOptions = [
  { name: "Yes", value: "Yes", disabled: false },
  { name: "No", value: "No", disabled: false },
];
export const ABSWheelSelectionOptions = [
  { name: "Front", value: "Front", disabled: false },
  { name: "Rear", value: "Rear", disabled: false },
  { name: "Front and Rear", value: "Front and Rear", disabled: false },
];
export const FrontWheelBrakeFrictionMemberTypes = [
  { name: "Drum", value: "Drum", disabled: false },
  { name: "Disc", value: "Disc", disabled: false },
];
export const RearWheelBrakeFrictionMemberTypes = [
  { name: "Drum", value: "Drum", disabled: false },
  { name: "Disc", value: "Disc", disabled: false },
];
export const ServiceBrakeControlOptions = [
  { name: "Operated by Hand", value: "Operated by hand", disabled: false },
];

export const RearServiceBrakeControlTypes = [
  { name: "Operated by Hand", value: "Operated by hand", disabled: false },
  { name: "Operated by Foot", value: "Operated by foot", disabled: false },
];
export const RearServiceBrakeControlOptions = [
  { name: "Operated by Hand", value: "Operated by hand", disabled: false },
  { name: "Operated by Foot", value: "Operated by foot", disabled: false },
];
export const AutoSlackAdjusterFittedOptions = [
  { name: "Yes", value: "Yes", disabled: false },
  { name: "No", value: "No", disabled: false },
];
export const ParkingBrakeWheelOptions = [
  { name: "Front", value: "Front", disabled: false },
  { name: "Rear", value: "Rear", disabled: false },
];
export const ParkingBrakeFrictionMemberTypes = [
  { name: "Disc", value: "Disc", disabled: false },
  { name: "Drum", value: "Drum", disabled: false },
];
////
export const ParkingBrakeActuatedBy = [
  { name: "Hand", value: "Hand", disabled: false },
  { name: "Foot", value: "Foot", disabled: false },
];

export const RegenerativeBrakeType = [
  { name: "Type A", value: "Type A", disabled: false },
  { name: "Type B", value: "Type B", disabled: false },
];

export const SteeringControlType = [
  { name: "Handlebar", value: "Handlebar", disabled: false },
  { name: "Wheel", value: "Wheel", disabled: false },
  { name: "Manual", value: "Manual", disabled: false },
  { name: "Power assisted – Hydraulic", value: "Power assisted – Hydraulic", disabled: false },
  { name: "Power assisted – Electric", value: "Power assisted – Electric", disabled: false },
];

export const SteeringWheelLocation = [
  { name: "Centre", value: "Centre", disabled: false },
  { name: "Offset", value: "Offset", disabled: false },
];

export const SteeringWorkingMechanism = [
  { name: "Recirculating Ball", value: "Recirculating Ball", disabled: false },
  { name: "Worm & Roller", value: "Worm & Roller", disabled: false },
  { name: "Rack & Pinion", value: "Rack & Pinion", disabled: false },
  { name: "Others", value: "Others", disabled: false },
];

export const HornControlLocation = [
  {
    name: "Provided (Left Hand/Push Type)",
    value: "Provided (Left Hand/Push Type)",
    disabled: false,
  },
  {
    name: "Provided (Right Hand/Push Type)",
    value: "Provided (Right Hand/Push Type)",
    disabled: false,
  },
];

export const HeadLampBeamSelectorSwitchLocation = [
  {
    name: "Provided (Left hand/Push Type)",
    value: "Provided (Left hand/Push Type)",
    disabled: false,
  },
  {
    name: "Provided (Left hand/Slide Type)",
    value: "Provided (Left hand/Slide Type)",
    disabled: false,
  },
  {
    name: "Provided (Right Hand/Push Type)",
    value: "Provided (Right Hand/Push Type)",
    disabled: false,
  },
  {
    name: "Provided (Right Hand/Slide Type)",
    value: "Provided (Right Hand/Slide Type)",
    disabled: false,
  },
  {
    name: "Provided (Left Hand/Piano Type)",
    value: "Provided (Left Hand/Piano Type)",
    disabled: false,
  },
  {
    name: "Provided (Right Hand/Piano Type)",
    value: "Provided (Right Hand/Piano Type)",
    disabled: false,
  },
];
export const RearFogLampControl = [
  { name: "Not Applicable", value: "Not Applicable", disabled: false },
  {
    name: "Provided (Left hand/Push Type)",
    value: "Provided (Left hand/Push Type)",
    disabled: false,
  },
  {
    name: "Provided (Left hand/Slide Type)",
    value: "Provided (Left hand/Slide Type)",
    disabled: false,
  },
  {
    name: " Provided (Right Hand/ Push Type)",
    value: "Provided (Right Hand/ Push Type)",
    disabled: false,
  },
  {
    name: "Provided (Right Hand/ Slide Type) ",
    value: "Provided (Right Hand/ Slide Type) ",
    disabled: false,
  },
  {
    name: "Provided (Left Hand / Piano Type) ",
    value: "Provided (Left Hand / Piano Type) ",
    disabled: false,
  },
  {
    name: "Provided (Right Hand / Piono Type) ",
    value: "Provided (Right Hand / Piono Type) ",
    disabled: false,
  },
];

export const RearFogLampControlLocation = [
  { name: "Not Applicable", value: "Not Applicable", disabled: false },
  {
    name: "Provided (Left hand/Push Type)",
    value: "Provided (Left hand/Push Type)",
    disabled: false,
  },
  {
    name: "Provided (Left hand/Slide Type)",
    value: "Provided (Left hand/Slide Type)",
    disabled: false,
  },
  {
    name: "Provided (Right Hand/Push Type)",
    value: "Provided (Right Hand/Push Type)",
    disabled: false,
  },
  {
    name: "Provided (Right Hand/Slide Type)",
    value: "Provided (Right Hand/Slide Type)",
    disabled: false,
  },
  {
    name: "Provided (Left Hand/Piano Type)",
    value: "Provided (Left Hand/Piano Type)",
    disabled: false,
  },
  {
    name: "Provided (Right Hand/Piano Type)",
    value: "Provided (Right Hand/Piano Type)",
    disabled: false,
  },
];

export const DirectionIndicatorControlLocation = [
  {
    name: "Provided (Left hand/Push Type)",
    value: "Provided (Left hand/Push Type)",
    disabled: false,
  },
  {
    name: "Provided (Left hand/Slide Type)",
    value: "Provided (Left hand/Slide Type)",
    disabled: false,
  },
  {
    name: "Provided (Right Hand/Push Type)",
    value: "Provided (Right Hand/Push Type)",
    disabled: false,
  },
  {
    name: "Provided (Right Hand/Slide Type)",
    value: "Provided (Right Hand/Slide Type)",
    disabled: false,
  },
  {
    name: "Provided (Left Hand/Piano Type)",
    value: "Provided (Left Hand/Piano Type)",
    disabled: false,
  },
  {
    name: "Provided (Right Hand/Piano Type)",
    value: "Provided (Right Hand/Piano Type)",
    disabled: false,
  },
];

export const HazardWarningSignalControlLocation = [
  { name: "Not Applicable", value: "Not Applicable", disabled: false },
  {
    name: "Provided (Left hand/Push Type)",
    value: "Provided (Left hand/Push Type)",
    disabled: false,
  },
  {
    name: "Provided (Left hand/Slide Type)",
    value: "Provided (Left hand/Slide Type)",
    disabled: false,
  },
  {
    name: "Provided (Right Hand/Push Type)",
    value: "Provided (Right Hand/Push Type)",
    disabled: false,
  },
  {
    name: "Provided (Right Hand/Slide Type)",
    value: "Provided (Right Hand/Slide Type)",
    disabled: false,
  },
  {
    name: "Provided (Left Hand/Piano Type)",
    value: "Provided (Left Hand/Piano Type)",
    disabled: false,
  },
  {
    name: "Provided (Right Hand/Piano Type)",
    value: "Provided (Right Hand/Piano Type)",
    disabled: false,
  },
];

// Dropdown options for different fields
export const PositionLampsControlLocation = [
  { value: "Not Applicable", name: "Not Applicable", disabled: false },
  {
    value: "Provided (Left hand/Push Type)",
    name: "Provided (Left hand/Push Type)",
    disabled: false,
  },
  {
    value: "Provided (Left hand/Slide Type)",
    name: "Provided (Left hand/Slide Type)",
    disabled: false,
  },
  {
    value: "Provided (Right Hand/Push Type)",
    name: "Provided (Right Hand/Push Type)",
    disabled: false,
  },
  {
    value: "Provided (Right Hand/Slide Type)",
    name: "Provided (Right Hand/Slide Type)",
    disabled: false,
  },
  {
    value: "Provided (Left Hand / Piano Type)",
    name: "Provided (Left Hand / Piano Type)",
    disabled: false,
  },
  {
    value: "Provided (Right Hand / Piano Type)",
    name: "Provided (Right Hand / Piano Type)",
    disabled: false,
  },
];

export const ParkingLampsControlLocation = [
  { value: "Not Applicable", name: "Not Applicable", disabled: false },
  {
    value: "Provided (Left hand/Push Type)",
    name: "Provided (Left hand/Push Type)",
    disabled: false,
  },
  {
    value: "Provided (Left hand/Slide Type)",
    name: "Provided (Left hand/Slide Type)",
    disabled: false,
  },
  {
    value: "Provided (Right Hand/Push Type)",
    name: "Provided (Right Hand/Push Type)",
    disabled: false,
  },
  {
    value: "Provided (Right Hand/Slide Type)",
    name: "Provided (Right Hand/Slide Type)",
    disabled: false,
  },
  {
    value: "Provided (Left Hand / Piano Type)",
    name: "Provided (Left Hand / Piano Type)",
    disabled: false,
  },
  {
    value: "Provided (Right Hand / Piano Type)",
    name: "Provided (Right Hand / Piano Type)",
    disabled: false,
  },
];

export const FrontBrakeControlLocation = [
  { value: "Not Applicable", name: "Not Applicable", disabled: false },
  {
    value: "Control Provided (right hand/lever)",
    name: "Control Provided (right hand/lever)",
    disabled: false,
  },
  {
    value: "Not Applicable-SSBS",
    name: "Not Applicable-SSBS",
    disabled: false,
  },
];

export const FootRearBrakeControlLocation = [
  { value: "Not Applicable", name: "Not Applicable", disabled: false },
  {
    value: "Control Provided Right Leg",
    name: "Control Provided on Right leg",
    disabled: false,
  },
  {
    value: "Control Provided Right Leg SSBS",
    name: "Control Provided- Right leg-SSBS",
    disabled: false,
  },
];

export const HandRearWheelBrakeControlLocation = [
  { value: "Not Applicable", name: "Not Applicable", disabled: false },
  {
    value: "Control Provided Left Hand Lever",
    name: "Control Provided-Left Hand Lever",
    disabled: false,
  },
];

export const HeadLampDrivingBeamOptions = [
  { value: "Not Applicable", name: "Not Applicable", disabled: false },
  { value: "Provided", name: "Provided", disabled: false },
];

export const HeadLampPassingBeamOptions = [
  { value: "Not Applicable", name: "Not Applicable", disabled: false },
  { value: "Provided", name: "Provided", disabled: false },
];

export const FogLampsFrontOptions = [
  { value: "Not Applicable", name: "Not Applicable", disabled: false },
  { value: "Provided", name: "Provided", disabled: false },
];

export const FogLampsRearOptions = [
  { value: "Not Applicable", name: "Not Applicable", disabled: false },
  { value: "Provided", name: "Provided", disabled: false },
];

export const DirectionIndicatorsOptions = [
  { value: "Not Applicable", name: "Not Applicable", disabled: false },
  { value: "Provided", name: "Provided", disabled: false },
];

export const HazardWarningSignalOptions = [
  { value: "Not Applicable", name: "Not Applicable", disabled: false },
  { value: "Provided", name: "Provided", disabled: false },
];

export const PositionLampOptions = [
  { value: "Not Applicable", name: "Not Applicable", disabled: false },
  { value: "Provided", name: "Provided", disabled: false },
];

export const MasterLampOptions = [
  { value: "Not Applicable", name: "Not Applicable", disabled: false },
  { value: "Provided", name: "Provided", disabled: false },
];

export const ParkingLampOptions = [
  { value: "Not Applicable", name: "Not Applicable", disabled: false },
  { value: "Provided", name: "Provided", disabled: false },
];

export const AnyOtherTellTaleOptions = [
  { value: "Not Applicable", name: "Not Applicable", disabled: false },
  { value: "Provided", name: "Provided", disabled: false },
];

export const SpeedometerOptions = [
  { value: "Not Applicable", name: "Not Applicable", disabled: false },
  { value: "Provided", name: "Provided", disabled: false },
];

export const AnyOtherIndicatorOptions = [
  { value: "Not Applicable", name: "Not Applicable", disabled: false },
  { value: "Specify", name: "Specify", disabled: false },
];

export const HandleLockAntiTheftOptions = [
  { value: "Type-1", name: "Type - 1", disabled: false },
  { value: "Type-2", name: "Type - 2", disabled: false },
  { value: "Type-3", name: "Type - 3", disabled: false },
  { value: "Type-4", name: "Type - 4", disabled: false },
];
export const NosOfHandholdsForPillionRiderOptions = [
  { value: "one", name: "One", disabled: false },
  { value: "Two", name: "Two", disabled: false },
  { value: "NA", name: "NA", disabled: false },
];

export const SelectTypeOfHandholdProvidedForPillionRiderOptions = [
  { value: "Strap", name: "Strap", disabled: false },
  { value: "Handle", name: "Handle", disabled: false },
];

export const NosOfHandholdsProvidedForPassengerOn3WheelerOptions = [
  { value: "1", name: "1", disabled: false },
  { value: "2", name: "2", disabled: false },
  { value: "3", name: "3", disabled: false },
  { value: "4", name: "4", disabled: false },
  { value: "NA", name: "NA", disabled: false },
];

export const SelectNoOfFootRestsOrFloorBoardsProvidedOptions = [
  {
    value: " 2 Foot Rests & 1 Floor Board",
    name: "2 Foot Rests & 1 Floor Board",
    disabled: false,
  },
  { value: "4 Foot Rests", name: "4 Foot Rests", disabled: false },
  { value: "3 Floor Boards", name: "3 Floor Boards", disabled: false },
];
export const NumberOfStandsOptions = [
  { name: "0", value: "0", disabled: false },
  { name: "1", value: "1", disabled: false },
  { name: "2", value: "2", disabled: false },
];

export const RetentionSystemOptions = [
  { name: "One Spring", value: "One Spring", disabled: false },
  { name: "Two Springs", value: "Two Springs", disabled: false },
  {
    name: "One Spring with Separate Retention System",
    value: "One Spring with Separate Retention System",
    disabled: false,
  },
];

export const SelectTypeOfStandProvidedInTheVehicleOptions = [
  { value: "Prop", name: "Prop", disabled: false },
  { value: "Center", name: "Center", disabled: false },
  { value: "Both", name: "Both", disabled: false },
];

export const SelectNoOfStandsProvidedInTheVehicleOptions = [
  { value: "0", name: "0", disabled: false },
  { value: "1", name: "1", disabled: false },
  { value: "2", name: "2", disabled: false },
];

export const SelectRetentionSystemInTheVehicleOptions = [
  { value: "one spring", name: "One Spring", disabled: false },
  { value: "two spring", name: "Two Spring", disabled: false },
  { value: "one spring with separate retention system", name: "One Spring with Separate Retention System", disabled: false, },
];

export const SelectTypeOfTransmissionArrangementOptions = [
  { value: "Mechanical", name: "Mechanical", disabled: false },
  { value: "Hydraulic", name: "Hydraulic", disabled: false },
  { value: "Electrical", name: "Electrical", disabled: false },
  { value: "Other", name: "Other", disabled: false },
];

export const SelectTypeOfGearBoxUsedOptions = [
  { value: "Automatic", name: "Automatic", disabled: false },
  { value: "Manual", name: "Manual", disabled: false },
];

export const SelectTypeOfMotorOptions = [
  { value: "Mono Motor", name: "Mono Motor", disabled: false },
  {  value: "Multi Motors (number)", name: "Multi Motors (number)",disabled: false, },
];

export const SelectTransmissionArrangementOptions = [
  { value: "Parallel", name: "Parallel", disabled: false },
  { value: "Transaxial", name: "Transaxial", disabled: false },
  { value: "Others to precise", name: "Others to precise", disabled: false },
];

export const SelectMotorTypeOptions = [
  { value: "BLDC", name: "BLDC", disabled: false },
  { value: "DC", name: "DC", disabled: false },
  { value: "AC", name: "AC", disabled: false },
  { value: "Other", name: "Other", disabled: false },
];

export const SelectCurrentTypeAndNoOfPhasesOptions = [
{ value: "Direct Current", name: "Direct Current", disabled: false },
{ value: "Alternating Current", name: "Alternating Current", disabled: false },
{ value: "Single Phase", name: "Single Phase", disabled: false },
{ value: "Three Phase", name: "Three Phase", disabled: false },
]
export const SelectExcitationTypeOptions = [
  {
    value: "Separate Excitation",
    name: "Separate Excitation",
    disabled: false,
  },
  { value: "Series", name: "Series", disabled: false },
  { value: "Compound", name: "Compound", disabled: false },
];

export const SelectSynchronTypeOptions = [
  { value: "Synchron", name: "Synchron", disabled: false },
  { value: "Asynchron", name: "Asynchron", disabled: false },
];

export const SelectRotorTypeOptions = [
  { value: "Coiled Rotor", name: "Coiled Rotor", disabled: false },
  {
    value: "With Permanent Magnets",
    name: "With Permanent Magnets",
    disabled: false,
  },
  { value: "With Housing", name: "With Housing", disabled: false },
];

export const SelectCoolingSystemOptions = [
  {
    value: "Motor: Liquid, Controller: Liquid, Battery: Liquid",
    name: "Motor: Liquid, Controller: Liquid, Battery: Liquid",
    disabled: false,
  },
  {
    value: "Motor: Liquid, Controller: Liquid, Battery: Air",
    name: "Motor: Liquid, Controller: Liquid, Battery: Air",
    disabled: false,
  },
  {
    value: "Motor: Liquid, Controller: Air, Battery: Liquid",
    name: "Motor: Liquid, Controller: Air, Battery: Liquid",
    disabled: false,
  },
  {
    value: "Motor: Liquid, Controller: Air, Battery: Air",
    name: "Motor: Liquid, Controller: Air, Battery: Air",
    disabled: false,
  },
  {
    value: "Motor: Air, Controller: Liquid, Battery: Liquid",
    name: "Motor: Air, Controller: Liquid, Battery: Liquid",
    disabled: false,
  },
  {
    value: "Motor: Air, Controller: Liquid, Battery: Air",
    name: "Motor: Air, Controller: Liquid, Battery: Air",
    disabled: false,
  },
  {
    value: "Motor: Air, Controller: Air, Battery: Liquid",
    name: "Motor: Air, Controller: Air, Battery: Liquid",
    disabled: false,
  },
  {
    value: "Motor: Air, Controller: Air, Battery: Air",
    name: "Motor: Air, Controller: Air, Battery: Air",
    disabled: false,
  },
];

export const WhetherCirculatingPumpProvidedOptions = [
  { value: "Yes", name: "Yes", disabled: false },
  { value: "No", name: "No", disabled: false },
];

export const TemperatureRegulatingSystemOptions = [
  { value: "Yes", name: "Yes", disabled: false },
  { value: "No", name: "No", disabled: false },
];

export const MakeOptions = [
  { value: "If Yes Activate these clauses", name: "If Yes Activate these clauses", disabled: false },
  {
    value: "If No Shall be filled as Not Applicable",
    name: "If No Shall be filled as Not Applicable",
    disabled: false,
  },
];

export const WeightOptions = [
  { value: "yes", name: "If Yes Activate these clauses", disabled: false },
  {
    value: "no",
    name: "If No Shall be filled as Not Applicable",
    disabled: false,
  },
];

export const SchematicRepresentationOptions = [
  { value: "yes", name: "If Yes Activate these clauses", disabled: false },
  {
    value: "no",
    name: "If No Shall be filled as Not Applicable",
    disabled: false,
  },
];

export const AlterationDetailsOptions = [
  { value: "yes", name: "If Yes Activate these clauses", disabled: false },
  {
    value: "no",
    name: "If No Shall be filled as Not Applicable",
    disabled: false,
  },
];
export const BMSBalancingTypeOptions = [
  { value: "Active", name: "Active", disabled: false },
  { value: "Passive", name: "Passive", disabled: false },
];

export const HeadlampLensTypeOptions = [
  { value: "Glass", name: "Glass", disabled: false },
  { value: "Plastic", name: "Plastic", disabled: false },
];

export const MainBeamLightNumberOptions = [
  { value: "1 and White", name: "1 and White", disabled: false },
  { value: "1 and Red", name: "1 and Red", disabled: false },
  { value: "1 and Amber", name: "1 and Amber", disabled: false },
  { value: "2 and White", name: "2 and White", disabled: false },
  { value: "2 and Red", name: "2 and Red", disabled: false },
  { value: "2 and Amber", name: "2 and Amber", disabled: false },
];

export const DippedBeamLensTypeOptions = [
  { value: "Glass", name: "Glass", disabled: false },
  { value: "Plastic", name: "Plastic", disabled: false },
];

export const InstrumentClusterTypeOptions = [
  { value: "Digital", name: "Digital", disabled: false },
  { value: "Analog", name: "Analog", disabled: false },
];

export const ChargerTypeOptions = [
  { value: "On Board", name: "On Board", disabled: false },
  { value: "Off Board", name: "Off Board", disabled: false },
  { value: "External", name: "External", disabled: false },
  { value: "Portable", name: "Protable", disabled: false },
];

export const ChargerCategoryOptions = [
  { value: "AC Fast", name: "AC Fast", disabled: false },
  { value: "AC Slow", name: "AC Slow", disabled: false },
  { value: "DC Fast", name: "DC Fast", disabled: false },
  { value: "DC Slow", name: "DC Slow", disabled: false },
];

export const ChargerPhasesOptions = [
  { value: "Single Phase", name: "Single Phase", disabled: false },
  { value: "Three Phase", name: "Three Phase", disabled: false },
];

export const SoftStartFacilityOptions = [
  { value: "Yes", name: "Yes", disabled: false },
  { value: "No", name: "No", disabled: false },
];

export const IECProtectionClassOptions = [
  { value: "Class-I", name: "Class-I", disabled: false },
  { value: "Class-II", name: "Class-II", disabled: false },
  { value: "Class-III", name: "Class-III", disabled: false },
];

export const ConduitsProvidedOptions = [
  { value: "Yes", name: "Yes", disabled: false },
  { value: "No", name: "No", disabled: false },
];

export const PotentialEqualizationResistanceOptions = [
  { value: "Yes", name: "Yes", disabled: false },
  { value: "No", name: "No", disabled: false },
];

export const ControlPrincipleOptions = [
  { value: "Vectorial", name: "Vectorial", disabled: false },
  { value: "Open Loop", name: "Open Loop", disabled: false },
  { value: "Closed", name: "Closed", disabled: false },
  {
    value: "Other (to be specified)",
    name: "Other (to be specified)",
    disabled: false,
  },
];

export const NumberOfSeatsOptions = [
  { value: "D+1", name: "D+1", disabled: false },
  { value: "D+3", name: "D+3", disabled: false },
  { name: "R+1 seater", value: "R+1 seater", disabled: false },
];

export const PassengerSeatTypeOptions = [
  { value: "separate", name: "Separate", disabled: false },
  { value: "bench", name: "Bench", disabled: false },
  { value: "NA", name: "NA", disabled: false },
];


export const LubricationMethodOptions = [
  {
    name: "Bearings: Friction, Lubricant: Grease, Seal: Yes, Circulation: With",
    value:
      "Bearings: Friction, Lubricant: Grease, Seal: Yes, Circulation: With",
    disabled: false,
  },
  {
    name: "Bearings: Friction, Lubricant: Grease, Seal: Yes, Circulation: Without",
    value:
      "Bearings: Friction, Lubricant: Grease, Seal: Yes, Circulation: Without",
    disabled: false,
  },
  {
    name: "Bearings: Friction, Lubricant: Grease, Seal: No, Circulation: With",
    value: "Bearings: Friction, Lubricant: Grease, Seal: No, Circulation: With",
    disabled: false,
  },
  {
    name: "Bearings: Friction, Lubricant: Grease, Seal: No, Circulation: Without",
    value:
      "Bearings: Friction, Lubricant: Grease, Seal: No, Circulation: Without",
    disabled: false,
  },

  {
    name: "Bearings: Friction, Lubricant: Oil, Seal: Yes, Circulation: With",
    value: "Bearings: Friction, Lubricant: Oil, Seal: Yes, Circulation: With",
    disabled: false,
  },
  {
    name: "Bearings: Friction, Lubricant: Oil, Seal: Yes, Circulation: Without",
    value:
      "Bearings: Friction, Lubricant: Oil, Seal: Yes, Circulation: Without",
    disabled: false,
  },
  {
    name: "Bearings: Friction, Lubricant: Oil, Seal: No, Circulation: With",
    value: "Bearings: Friction, Lubricant: Oil, Seal: No, Circulation: With",
    disabled: false,
  },
  {
    name: "Bearings: Friction, Lubricant: Oil, Seal: No, Circulation: Without",
    value: "Bearings: Friction, Lubricant: Oil, Seal: No, Circulation: Without",
    disabled: false,
  },

  {
    name: "Bearings: Ball, Lubricant: Grease, Seal: Yes, Circulation: With",
    value: "Bearings: Ball, Lubricant: Grease, Seal: Yes, Circulation: With",
    disabled: false,
  },
  {
    name: "Bearings: Ball, Lubricant: Grease, Seal: Yes, Circulation: Without",
    value: "Bearings: Ball, Lubricant: Grease, Seal: Yes, Circulation: Without",
    disabled: false,
  },
  {
    name: "Bearings: Ball, Lubricant: Grease, Seal: No, Circulation: With",
    value: "Bearings: Ball, Lubricant: Grease, Seal: No, Circulation: With",
    disabled: false,
  },
  {
    name: "Bearings: Ball, Lubricant: Grease, Seal: No, Circulation: Without",
    value: "Bearings: Ball, Lubricant: Grease, Seal: No, Circulation: Without",
    disabled: false,
  },

  {
    name: "Bearings: Ball, Lubricant: Oil, Seal: Yes, Circulation: With",
    value: "Bearings: Ball, Lubricant: Oil, Seal: Yes, Circulation: With",
    disabled: false,
  },
  {
    name: "Bearings: Ball, Lubricant: Oil, Seal: Yes, Circulation: Without",
    value: "Bearings: Ball, Lubricant: Oil, Seal: Yes, Circulation: Without",
    disabled: false,
  },
  {
    name: "Bearings: Ball, Lubricant: Oil, Seal: No, Circulation: With",
    value: "Bearings: Ball, Lubricant: Oil, Seal: No, Circulation: With",
    disabled: false,
  },
  {
    name: "Bearings: Ball, Lubricant: Oil, Seal: No, Circulation: Without",
    value: "Bearings: Ball, Lubricant: Oil, Seal: No, Circulation: Without",
    disabled: false,
  },
];

export const TyreTypeOptions = [
  { name: "Radial", value: "Radial", disabled: false },
  { name: "Cross", value: "Cross", disabled: false },
  { name: "Tube", value: "Tube", disabled: false },
  { name: "Tubeless", value: "Tubeless", disabled: false },
];

export const TyreTypeOptions1 = [
  { name: "Radial", value: "Radial", disabled: false },
  { name: "Cross", value: "Cross", disabled: false },
  { name: "Tube", value: "Tube", disabled: false },
  { name: "Tubeless", value: "Tubeless", disabled: false },
];

export const BISLicenseOptions = [
  { name: "BIS Certification", value: "BIS Certification", disabled: false },
  { name: "AIS Certification", value: "AIS Certification", disabled: false },
];

export const RimTypeOptions = [
  { name: "Alloy", value: "Alloy", disabled: false },
  { name: "Sheet Metal", value: "Sheet Metal", disabled: false },
  { name: "Spoke", value: "Spoke", disabled: false },
];
export const RimTypeOptionsrear = [
  { name: "Alloy ", value: "Alloy ", disabled: false },
  { name: "Sheet Metal ", value: "Sheet Metal ", disabled: false },
  { name: "Spoke ", value: "Spoke ", disabled: false },
];

export const HornTypeOptions = [
  { name: "Type -1", value: "Type -1", disabled: false },
  { name: "Type -2A", value: "Type -2A", disabled: false },
  { name: "Type -2B", value: "Type -2B", disabled: false },
  { name: "Type -3", value: "Type -3", disabled: false },
];

export const HornCountOptions = [
  { name: "1", value: "1", disabled: false },
  { name: "2", value: "2", disabled: false },
  { name: "3", value: "3", disabled: false },
];

export const MirrorClassOptions = [
  { name: "Class I", value: "Class I", disabled: false },
  { name: "Class III", value: "Class III", disabled: false },
  { name: "Class VII", value: "Class VII", disabled: false },
  { name: "Class IV", value: "Class IV", disabled: false },
  { name: "Class L", value: "Class L", disabled: false },
];

export const VentilationOptions = [
  { name: "Yes", value: "Yes", disabled: false },
  { name: "No", value: "No", disabled: false },
];

export const ProductionVehicleSerialNumbers = [
  { name: "11", value: "11", disabled: false },
  { name: "12", value: "12", disabled: false },
  { name: "13", value: "13", disabled: false },
  { name: "14", value: "14", disabled: false },
  { name: "15", value: "15", disabled: false },
  { name: "16", value: "16", disabled: false },
  { name: "17", value: "17", disabled: false },
];

export const MonthYear = [
  { value: "Month", name: "Month", disabled: false },
  { value: "Year", name: "Year", disabled: false },
];

export const VdsOptions = [
  { name: "Type of Fuel", value: "Type of Fuel", disabled: false },
  { name: "Wheel Base", value: "Wheel Base", disabled: false },
  { name: "Application", value: "Application", disabled: false },
  { name: "Type of Drive", value: "Type of Drive", disabled: false },
  { name: "Plant Code", value: "Plant Code", disabled: false },
  { name: "Check Digit", value: "Check Digit", disabled: false },
  { name: "Month/Year", value: "Month/Year", disabled: false },
  { name: "Others", value: "Others", disabled: false },
];

export const FuelOptions = [
  { name: "Diesel", value: "Diesel" },
  { name: "BOV", value: "BOV" },
  { name: "Hydrogen", value: "Hydrogen" },
  { name: "CNG", value: "CNG" },
];
export const wheelBaseOptions = [
  { name: "1 to 3m", value: "1 to 3m" },
  { name: "3 to 6m", value: "3 to 6m" },
  { name: "6m above", value: "6m above" },
];
export const driveTypeOptions = [
  { name: "City Bus", value: "City Bus" },
  { name: "Tourist Bus", value: "Tourist Bus" },
  { name: "Non Deluxe Bus", value: "Non Deluxe Bus" },
  { name: "Semi Deluxe Bus", value: "Semi Deluxe Bus" },
  { name: "Deluxe Bus", value: "Deluxe Bus" },
  { name: "AC Deluxe Bus", value: "AC Deluxe Bus" },
  { name: "Ambulance", value: "Ambulance" },
  { name: "School Bus", value: "School Bus" },
  { name: "Sleeper Coach Bus", value: "Sleeper Coach Bus" },
];
export const plantCodeOptions = [
  { name: "Plant 1", value: "Plant 1" },
  { name: "Plant 2", value: "Plant 2" },
];
export const applicationOptions = [
  { name: "Passenger", value: "Passenger" },
  { name: "Cargo", value: "Cargo" },
  { name: "Utility", value: "Utility" },
];
export const defaultOpt = [
  // VdsOptions
  { name: "Type of Fuel", value: "Type of Fuel", disabled: false },
  { name: "Wheel Base", value: "Wheel Base", disabled: false },
  { name: "Application", value: "Application", disabled: false },
  { name: "Type of Drive", value: "Type of Drive", disabled: false },
  { name: "Plant Code", value: "Plant Code", disabled: false },
  { name: "Check Digit", value: "Check Digit", disabled: false },

  // FuelOptions
  { name: "Diesel", value: "Diesel" },
  { name: "BOV", value: "BOV" },
  { name: "Hydrogen", value: "Hydrogen" },
  { name: "CNG", value: "CNG" },

  // wheelBaseOptions
  { name: "1 to 3m", value: "1 to 3m" },
  { name: "3 to 6m", value: "3 to 6m" },
  { name: "6m above", value: "6m above" },

  // driveTypeOptions
  { name: "City Bus", value: "City Bus" },
  { name: "Tourist Bus", value: "Tourist Bus" },
  { name: "Non Deluxe Bus", value: "Non Deluxe Bus" },
  { name: "Semi Deluxe Bus", value: "Semi Deluxe Bus" },
  { name: "Deluxe Bus", value: "Deluxe Bus" },
  { name: "AC Deluxe Bus", value: "AC Deluxe Bus" },
  { name: "Ambulance", value: "Ambulance" },
  { name: "School Bus", value: "School Bus" },
  { name: "Sleeper Coach Bus", value: "Sleeper Coach Bus" },

  // plantCodeOptions
  { name: "Plant 1", value: "Plant 1" },
  { name: "Plant 2", value: "Plant 2" },

  // applicationOptions
  { name: "Passenger", value: "Passenger" },
  { name: "Cargo", value: "Cargo" },
  { name: "Utility", value: "Utility" },

  { name: "Show Dropdown", value: "Show Dropdown" },
  { name: "Show Text Box", value: "Show Text Box" },
];
export const CodeValuesForth = [
  { name: "A", value: "A", disabled: false },
  { name: "B", value: "B", disabled: false },
  { name: "C", value: "C", disabled: false },
  { name: "D", value: "D", disabled: false },
  { name: "E", value: "E", disabled: false },
  { name: "F", value: "F", disabled: false },
  { name: "G", value: "G", disabled: false },
  { name: "H", value: "H", disabled: false },
  { name: "J", value: "J", disabled: false },
  { name: "K", value: "K", disabled: false },
  { name: "L", value: "L", disabled: false },
  { name: "M", value: "M", disabled: false },
  { name: "N", value: "N", disabled: false },
  { name: "P", value: "P", disabled: false },
  { name: "R", value: "R", disabled: false },
  { name: "S", value: "S", disabled: false },
  { name: "T", value: "T", disabled: false },
  { name: "U", value: "U", disabled: false },
  { name: "V", value: "V", disabled: false },
  { name: "W", value: "W", disabled: false },
  { name: "X", value: "X", disabled: false },
  { name: "Y", value: "Y", disabled: false },
  { name: "Z", value: "Z", disabled: false },
  { name: "0", value: "0", disabled: false },
  { name: "1", value: "1", disabled: false },
  { name: "2", value: "2", disabled: false },
  { name: "3", value: "3", disabled: false },
  { name: "4", value: "4", disabled: false },
  { name: "5", value: "5", disabled: false },
  { name: "6", value: "6", disabled: false },
  { name: "7", value: "7", disabled: false },
  { name: "8", value: "8", disabled: false },
  { name: "9", value: "9", disabled: false },
];

export const CodeValuesFifth = [
  { name: "A", value: "A", disabled: false },
  { name: "B", value: "B", disabled: false },
  { name: "C", value: "C", disabled: false },
  { name: "D", value: "D", disabled: false },
  { name: "E", value: "E", disabled: false },
  { name: "F", value: "F", disabled: false },
  { name: "G", value: "G", disabled: false },
  { name: "H", value: "H", disabled: false },
  { name: "J", value: "J", disabled: false },
  { name: "K", value: "K", disabled: false },
  { name: "L", value: "L", disabled: false },
  { name: "M", value: "M", disabled: false },
  { name: "N", value: "N", disabled: false },
  { name: "P", value: "P", disabled: false },
  { name: "R", value: "R", disabled: false },
  { name: "S", value: "S", disabled: false },
  { name: "T", value: "T", disabled: false },
  { name: "U", value: "U", disabled: false },
  { name: "V", value: "V", disabled: false },
  { name: "W", value: "W", disabled: false },
  { name: "X", value: "X", disabled: false },
  { name: "Y", value: "Y", disabled: false },
  { name: "Z", value: "Z", disabled: false },
  { name: "0", value: "0", disabled: false },
  { name: "1", value: "1", disabled: false },
  { name: "2", value: "2", disabled: false },
  { name: "3", value: "3", disabled: false },
  { name: "4", value: "4", disabled: false },
  { name: "5", value: "5", disabled: false },
  { name: "6", value: "6", disabled: false },
  { name: "7", value: "7", disabled: false },
  { name: "8", value: "8", disabled: false },
  { name: "9", value: "9", disabled: false },
];

export const CodeValuesSixth = [
  { name: "A", value: "A", disabled: false },
  { name: "B", value: "B", disabled: false },
  { name: "C", value: "C", disabled: false },
  { name: "D", value: "D", disabled: false },
  { name: "E", value: "E", disabled: false },
  { name: "F", value: "F", disabled: false },
  { name: "G", value: "G", disabled: false },
  { name: "H", value: "H", disabled: false },
  { name: "J", value: "J", disabled: false },
  { name: "K", value: "K", disabled: false },
  { name: "L", value: "L", disabled: false },
  { name: "M", value: "M", disabled: false },
  { name: "N", value: "N", disabled: false },
  { name: "P", value: "P", disabled: false },
  { name: "R", value: "R", disabled: false },
  { name: "S", value: "S", disabled: false },
  { name: "T", value: "T", disabled: false },
  { name: "U", value: "U", disabled: false },
  { name: "V", value: "V", disabled: false },
  { name: "W", value: "W", disabled: false },
  { name: "X", value: "X", disabled: false },
  { name: "Y", value: "Y", disabled: false },
  { name: "Z", value: "Z", disabled: false },
  { name: "0", value: "0", disabled: false },
  { name: "1", value: "1", disabled: false },
  { name: "2", value: "2", disabled: false },
  { name: "3", value: "3", disabled: false },
  { name: "4", value: "4", disabled: false },
  { name: "5", value: "5", disabled: false },
  { name: "6", value: "6", disabled: false },
  { name: "7", value: "7", disabled: false },
  { name: "8", value: "8", disabled: false },
  { name: "9", value: "9", disabled: false },
];

export const CodeValuesSeventh = [
  { name: "A", value: "A", disabled: false },
  { name: "B", value: "B", disabled: false },
  { name: "C", value: "C", disabled: false },
  { name: "D", value: "D", disabled: false },
  { name: "E", value: "E", disabled: false },
  { name: "F", value: "F", disabled: false },
  { name: "G", value: "G", disabled: false },
  { name: "H", value: "H", disabled: false },
  { name: "J", value: "J", disabled: false },
  { name: "K", value: "K", disabled: false },
  { name: "L", value: "L", disabled: false },
  { name: "M", value: "M", disabled: false },
  { name: "N", value: "N", disabled: false },
  { name: "P", value: "P", disabled: false },
  { name: "R", value: "R", disabled: false },
  { name: "S", value: "S", disabled: false },
  { name: "T", value: "T", disabled: false },
  { name: "U", value: "U", disabled: false },
  { name: "V", value: "V", disabled: false },
  { name: "W", value: "W", disabled: false },
  { name: "X", value: "X", disabled: false },
  { name: "Y", value: "Y", disabled: false },
  { name: "Z", value: "Z", disabled: false },
  { name: "0", value: "0", disabled: false },
  { name: "1", value: "1", disabled: false },
  { name: "2", value: "2", disabled: false },
  { name: "3", value: "3", disabled: false },
  { name: "4", value: "4", disabled: false },
  { name: "5", value: "5", disabled: false },
  { name: "6", value: "6", disabled: false },
  { name: "7", value: "7", disabled: false },
  { name: "8", value: "8", disabled: false },
  { name: "9", value: "9", disabled: false },
];

export const CodeValuesEighth = [
  { name: "A", value: "A", disabled: false },
  { name: "B", value: "B", disabled: false },
  { name: "C", value: "C", disabled: false },
  { name: "D", value: "D", disabled: false },
  { name: "E", value: "E", disabled: false },
  { name: "F", value: "F", disabled: false },
  { name: "G", value: "G", disabled: false },
  { name: "H", value: "H", disabled: false },
  { name: "J", value: "J", disabled: false },
  { name: "K", value: "K", disabled: false },
  { name: "L", value: "L", disabled: false },
  { name: "M", value: "M", disabled: false },
  { name: "N", value: "N", disabled: false },
  { name: "P", value: "P", disabled: false },
  { name: "R", value: "R", disabled: false },
  { name: "S", value: "S", disabled: false },
  { name: "T", value: "T", disabled: false },
  { name: "U", value: "U", disabled: false },
  { name: "V", value: "V", disabled: false },
  { name: "W", value: "W", disabled: false },
  { name: "X", value: "X", disabled: false },
  { name: "Y", value: "Y", disabled: false },
  { name: "Z", value: "Z", disabled: false },
  { name: "0", value: "0", disabled: false },
  { name: "1", value: "1", disabled: false },
  { name: "2", value: "2", disabled: false },
  { name: "3", value: "3", disabled: false },
  { name: "4", value: "4", disabled: false },
  { name: "5", value: "5", disabled: false },
  { name: "6", value: "6", disabled: false },
  { name: "7", value: "7", disabled: false },
  { name: "8", value: "8", disabled: false },
  { name: "9", value: "9", disabled: false },
];

export const CodeValuesNinth = [
  { name: "A", value: "A", disabled: false },
  { name: "B", value: "B", disabled: false },
  { name: "C", value: "C", disabled: false },
  { name: "D", value: "D", disabled: false },
  { name: "E", value: "E", disabled: false },
  { name: "F", value: "F", disabled: false },
  { name: "G", value: "G", disabled: false },
  { name: "H", value: "H", disabled: false },
  { name: "J", value: "J", disabled: false },
  { name: "K", value: "K", disabled: false },
  { name: "L", value: "L", disabled: false },
  { name: "M", value: "M", disabled: false },
  { name: "N", value: "N", disabled: false },
  { name: "P", value: "P", disabled: false },
  { name: "R", value: "R", disabled: false },
  { name: "S", value: "S", disabled: false },
  { name: "T", value: "T", disabled: false },
  { name: "U", value: "U", disabled: false },
  { name: "V", value: "V", disabled: false },
  { name: "W", value: "W", disabled: false },
  { name: "X", value: "X", disabled: false },
  { name: "Y", value: "Y", disabled: false },
  { name: "Z", value: "Z", disabled: false },
  { name: "0", value: "0", disabled: false },
  { name: "1", value: "1", disabled: false },
  { name: "2", value: "2", disabled: false },
  { name: "3", value: "3", disabled: false },
  { name: "4", value: "4", disabled: false },
  { name: "5", value: "5", disabled: false },
  { name: "6", value: "6", disabled: false },
  { name: "7", value: "7", disabled: false },
  { name: "8", value: "8", disabled: false },
  { name: "9", value: "9", disabled: false },
];
/////
export const CodeValuesTenth = [
  { name: "A", value: "A", disabled: false },
  { name: "B", value: "B", disabled: false },
  { name: "C", value: "C", disabled: false },
  { name: "D", value: "D", disabled: false },
  { name: "E", value: "E", disabled: false },
  { name: "F", value: "F", disabled: false },
  { name: "G", value: "G", disabled: false },
  { name: "H", value: "H", disabled: false },
  { name: "J", value: "J", disabled: false },
  { name: "K", value: "K", disabled: false },
  { name: "L", value: "L", disabled: false },
  { name: "M", value: "M", disabled: false },
  { name: "N", value: "N", disabled: false },
  { name: "P", value: "P", disabled: false },
  { name: "R", value: "R", disabled: false },
  { name: "S", value: "S", disabled: false },
  { name: "T", value: "T", disabled: false },
  { name: "U", value: "U", disabled: false },
  { name: "V", value: "V", disabled: false },
  { name: "W", value: "W", disabled: false },
  { name: "X", value: "X", disabled: false },
  { name: "Y", value: "Y", disabled: false },
  { name: "Z", value: "Z", disabled: false },
  { name: "0", value: "0", disabled: false },
  { name: "1", value: "1", disabled: false },
  { name: "2", value: "2", disabled: false },
  { name: "3", value: "3", disabled: false },
  { name: "4", value: "4", disabled: false },
  { name: "5", value: "5", disabled: false },
  { name: "6", value: "6", disabled: false },
  { name: "7", value: "7", disabled: false },
  { name: "8", value: "8", disabled: false },
  { name: "9", value: "9", disabled: false },
];

export const CodeValuesEleventh = [
  { name: "A", value: "A", disabled: false },
  { name: "B", value: "B", disabled: false },
  { name: "C", value: "C", disabled: false },
  { name: "D", value: "D", disabled: false },
  { name: "E", value: "E", disabled: false },
  { name: "F", value: "F", disabled: false },
  { name: "G", value: "G", disabled: false },
  { name: "H", value: "H", disabled: false },
  { name: "J", value: "J", disabled: false },
  { name: "K", value: "K", disabled: false },
  { name: "L", value: "L", disabled: false },
  { name: "M", value: "M", disabled: false },
  { name: "N", value: "N", disabled: false },
  { name: "P", value: "P", disabled: false },
  { name: "R", value: "R", disabled: false },
  { name: "S", value: "S", disabled: false },
  { name: "T", value: "T", disabled: false },
  { name: "U", value: "U", disabled: false },
  { name: "V", value: "V", disabled: false },
  { name: "W", value: "W", disabled: false },
  { name: "X", value: "X", disabled: false },
  { name: "Y", value: "Y", disabled: false },
  { name: "Z", value: "Z", disabled: false },
  { name: "0", value: "0", disabled: false },
  { name: "1", value: "1", disabled: false },
  { name: "2", value: "2", disabled: false },
  { name: "3", value: "3", disabled: false },
  { name: "4", value: "4", disabled: false },
  { name: "5", value: "5", disabled: false },
  { name: "6", value: "6", disabled: false },
  { name: "7", value: "7", disabled: false },
  { name: "8", value: "8", disabled: false },
  { name: "9", value: "9", disabled: false },
];
