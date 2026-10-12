// src/components/homologation/BusPages/formData/BusFormData.ts

export type ManufacturerData = {
  manufacturer: string;
  manufacturerAddress: string;
  telephone: string;
  fax: string;
  email: string;
  contactPerson: string;
  modelVariant: string;
  baseFuelType: string;
};

export type ManufacturerPlantData = {
  vehicleManufacturingPlant: string;
  engineManufacturingPlant: string;
  importerNameAddress: string;
  telephone: string;
  email: string;
  contactPerson: string;
  busBodyBuilderCategory: string;
  zabCertificate: string;
  nabCertificate: string;
  cmvrComplianceCertificate: string;
};

export type VehicleBasicDetailsData = {
  // ================= VEHICLE TYPE =================
  vehicleType: string;
  typeOfVehicle: string;
  usage: string;
  control: string;
  drive: string;
  cabType: string;
  loadBody: string;
  vehicleCategoryIS14272: string;
  vehicleAvailableModes: string;
  vehicleDefaultMode: string;
  vehicleDefaultModeDetails: string;

  // ================= VEHICLE PERFORMANCE =================
  maxRecommendedGradeability: string;
  maxDesignSpeed: string;
  maxSpeedUnladen: string;
  maxSpeedLaden: string;

  // ================= CO2 REDUCING TECHNOLOGIES =================
  co2ReducingTechnologiesAvailable: string;
  regenerativeBraking: string;
  startStopSystem: string;
  tyrePressureMonitoringSystem: string;
  sixOrMoreSpeedTransmission: string;
  otherTechnology: string;

  // ================= VEHICLE CLASS =================
  vehicleClass: string;

  // ================= VEHICLE DIMENSIONS =================
  overallLength: string;
  totalLength: string;
  overallWidth: string;
  overallHeightUnladen: string;
  wheelBase: string;
  axleSpacing: string;

  // ================= WHEEL TRACK =================
  wheelTrackFront: string;
  wheelTrackRear: string;
  wheelTrackOtherAxles: string;

  // ================= BODY OVERHANG =================
  bodyOverhangFrontEnd: string;
  bodyOverhangRearEnd: string;

  // ================= FRAME OVERHANG =================
  frameOverhangFrontEnd: string;
  frameOverhangRearEnd: string;

  // ================= LOAD BODY =================
  loadBodyDimensions: string;
  lateralProjection: string;

  // ================= CARGO BOX =================
  cargoBoxLength: string;
  cargoBoxWidth: string;
  cargoBoxHeight: string;
};

export type WeighmentData = {
  vehicleKerbWeight: string;

  frontAxle1: string;
  frontAxle2: string;
  rearAxle: string;

  trailerAxle: string;
  total: string;

  grossVehicleWeight: string;

  maximumPermissibleAxleWeightsFront: string;
  maximumPermissibleAxleWeightsRear: string;
  maximumPermissibleAxleWeightsOther: string;
};


export type TyreData = {
  make: string;
  brandTradeDescription: string;
  ais142Compliance: string;
  tyreRollingResistance: string;

  tyreClassFront: string;
  tyreClassRear: string;

  categoryOfUseFront: string;
  categoryOfUseRear: string;

  tyreTreadPatternDrawing: string;

  identification: string;

  wheelsFront: string;
  wheelsRear: string;
  spareWheel: string;
  otherWheels: string;

  tyreTypeFront: string;
  tyreTypeRear: string;
  spareWheelTyreType: string;
  otherTyreType: string;

  staticRollingRadius: string;
  dynamicRollingRadius: string;

  inflationPressureUnladenFront: string;
  inflationPressureUnladenRear: string;
  inflationPressureUnladenOther: string;

  inflationPressureLadenFront: string;
  inflationPressureLadenRear: string;
  inflationPressureLadenOther: string;
};
export type WheelRimData = {
  // Front
  frontMake: string;
  frontBisLicenseNumber: string;
  frontPartNumber: string;
  frontSize: string;
  frontType: string;

  // Rear
  rearMake: string;
  rearBisLicenseNumber: string;
  rearPartNumber: string;
  rearSize: string;
  rearType: string;

  // Spare Wheel Rim
  spareMake: string;
  spareBisLicenseNumber: string;
  sparePartNumber: string;
  spareSize: string;
  spareType: string;

  // Spare wheel / Temporary / Repair Kit / RFT
  spareWheelType: string;

  // Speed Index
  speedIndexFront: string;
  speedIndexRear: string;
  speedIndexSpare: string;

  // Load Index / Load Rating
  loadIndexFront: string;
  loadIndexRear: string;
  loadIndexSpare: string;

  // Tyre Type
  tyreTypeFront: string;
  tyreTypeRear: string;
  tyreTypeSpare: string;
};
export type WheelNutData = {
  // Wheel Nut(s) / Bolt(s)
  make: string;
  size: string;
  nosPerWheel: string;
  tighteningTorque: string;
  dimensionalDrawingMaterialSpecification: string;

  // Wheel Cap
  wheelCapDimensionalDrawing: string;

  // Hub Cap
  hubCapMake: string;
  hubCapFitmentMethod: string;
  hubCapDimensionalDrawing: string;
};

export type TPMSData = {
  // TPMS / Run Flat Warning System
  makeDirectTPMS: string;
  systemDescriptionIndirectTPMS: string;
  sensorPartNumberDirectTPMS: string;

  temporarySpareWheelRFT: string;

  typeAsPerAIS110: string;
  make: string;
  size: string;
  loadAndSpeedRating: string;

  recommendedMaxSpeedUnladen: string;
  recommendedMaxSpeedLaden: string;
};

export type TyreAndWheelRimData = {
  tyre: TyreData;
  wheelRim: WheelRimData;
  wheelNut: WheelNutData;
  tpms: TPMSData;
};

export type DocumentData = {
  documentName: string;
  documentNumber: string;
  documentType: string;
  issueDate: string;
  expiryDate: string;
  remarks: string;
};

export type NotificationData = {
  notificationType: string;
  notificationTitle: string;
  notificationDate: string;
  notificationStatus: string;
  description: string;
  remarks: string;
};

export type SettingData = {
  userName: string;
  emailId: string;
  contactNumber: string;
  companyName: string;
  vehicleType: string;
  language: string;
};

export type BusFormData = {
  manufacturerDetails: Record<number, ManufacturerData>;

manufacturerPlantDetails: Record<number, ManufacturerPlantData>;

   vehicleBasicDetails: Record<number, VehicleBasicDetailsData>;

  weighmentDetails: Record<number, WeighmentData>;

  tyreAndWheelRim: TyreAndWheelRimData;

  documents: DocumentData;

  notification: NotificationData;

  setting: SettingData;
};

export const initialBusFormData: BusFormData = {
  manufacturerDetails: {
    1: {
      manufacturer: "",
      manufacturerAddress: "",
      telephone: "",
      fax: "",
      email: "",
      contactPerson: "",
      modelVariant: "",
      baseFuelType: "",
    },

    2: {
      manufacturer: "",
      manufacturerAddress: "",
      telephone: "",
      fax: "",
      email: "",
      contactPerson: "",
      modelVariant: "",
      baseFuelType: "",
    },

    3: {
      manufacturer: "",
      manufacturerAddress: "",
      telephone: "",
      fax: "",
      email: "",
      contactPerson: "",
      modelVariant: "",
      baseFuelType: "",
    },
  },

  manufacturerPlantDetails: {
  1: {
    vehicleManufacturingPlant: "",
    engineManufacturingPlant: "",
    importerNameAddress: "",
    telephone: "",
    email: "",
    contactPerson: "",
    busBodyBuilderCategory: "",
    zabCertificate: "",
    nabCertificate: "",
    cmvrComplianceCertificate: "",
  },

  2: {
    vehicleManufacturingPlant: "",
    engineManufacturingPlant: "",
    importerNameAddress: "",
    telephone: "",
    email: "",
    contactPerson: "",
    busBodyBuilderCategory: "",
    zabCertificate: "",
    nabCertificate: "",
    cmvrComplianceCertificate: "",
  },

  3: {
    vehicleManufacturingPlant: "",
    engineManufacturingPlant: "",
    importerNameAddress: "",
    telephone: "",
    email: "",
    contactPerson: "",
    busBodyBuilderCategory: "",
    zabCertificate: "",
    nabCertificate: "",
    cmvrComplianceCertificate: "",
  },
},

  vehicleBasicDetails: {
  1: {
    // ================= VEHICLE TYPE =================
    vehicleType: "",
    typeOfVehicle: "",
    usage: "",
    control: "",
    drive: "",
    cabType: "",
    loadBody: "",
    vehicleCategoryIS14272: "",
    vehicleAvailableModes: "",
    vehicleDefaultMode: "",
    vehicleDefaultModeDetails: "",

    // ================= VEHICLE PERFORMANCE =================
    maxRecommendedGradeability: "",
    maxDesignSpeed: "",
    maxSpeedUnladen: "",
    maxSpeedLaden: "",

    // ================= CO2 REDUCING TECHNOLOGIES =================
    co2ReducingTechnologiesAvailable: "",
    regenerativeBraking: "",
    startStopSystem: "",
    tyrePressureMonitoringSystem: "",
    sixOrMoreSpeedTransmission: "",
    otherTechnology: "",

    // ================= VEHICLE CLASS =================
    vehicleClass: "",

    // ================= VEHICLE DIMENSIONS =================
    overallLength: "",
    totalLength: "",
    overallWidth: "",
    overallHeightUnladen: "",
    wheelBase: "",
    axleSpacing: "",

    // ================= WHEEL TRACK =================
    wheelTrackFront: "",
    wheelTrackRear: "",
    wheelTrackOtherAxles: "",

    // ================= BODY OVERHANG =================
    bodyOverhangFrontEnd: "",
    bodyOverhangRearEnd: "",

    // ================= FRAME OVERHANG =================
    frameOverhangFrontEnd: "",
    frameOverhangRearEnd: "",

    // ================= LOAD BODY =================
    loadBodyDimensions: "",
    lateralProjection: "",

    // ================= CARGO BOX =================
    cargoBoxLength: "",
    cargoBoxWidth: "",
    cargoBoxHeight: "",
  },

  2: {
    // ================= VEHICLE TYPE =================
    vehicleType: "",
    typeOfVehicle: "",
    usage: "",
    control: "",
    drive: "",
    cabType: "",
    loadBody: "",
    vehicleCategoryIS14272: "",
    vehicleAvailableModes: "",
    vehicleDefaultMode: "",
    vehicleDefaultModeDetails: "",

    // ================= VEHICLE PERFORMANCE =================
    maxRecommendedGradeability: "",
    maxDesignSpeed: "",
    maxSpeedUnladen: "",
    maxSpeedLaden: "",

    // ================= CO2 REDUCING TECHNOLOGIES =================
    co2ReducingTechnologiesAvailable: "",
    regenerativeBraking: "",
    startStopSystem: "",
    tyrePressureMonitoringSystem: "",
    sixOrMoreSpeedTransmission: "",
    otherTechnology: "",

    // ================= VEHICLE CLASS =================
    vehicleClass: "",

    // ================= VEHICLE DIMENSIONS =================
    overallLength: "",
    totalLength: "",
    overallWidth: "",
    overallHeightUnladen: "",
    wheelBase: "",
    axleSpacing: "",

    // ================= WHEEL TRACK =================
    wheelTrackFront: "",
    wheelTrackRear: "",
    wheelTrackOtherAxles: "",

    // ================= BODY OVERHANG =================
    bodyOverhangFrontEnd: "",
    bodyOverhangRearEnd: "",

    // ================= FRAME OVERHANG =================
    frameOverhangFrontEnd: "",
    frameOverhangRearEnd: "",

    // ================= LOAD BODY =================
    loadBodyDimensions: "",
    lateralProjection: "",

    // ================= CARGO BOX =================
    cargoBoxLength: "",
    cargoBoxWidth: "",
    cargoBoxHeight: "",
  },

  3: {
    // ================= VEHICLE TYPE =================
    vehicleType: "",
    typeOfVehicle: "",
    usage: "",
    control: "",
    drive: "",
    cabType: "",
    loadBody: "",
    vehicleCategoryIS14272: "",
    vehicleAvailableModes: "",
    vehicleDefaultMode: "",
    vehicleDefaultModeDetails: "",

    // ================= VEHICLE PERFORMANCE =================
    maxRecommendedGradeability: "",
    maxDesignSpeed: "",
    maxSpeedUnladen: "",
    maxSpeedLaden: "",

    // ================= CO2 REDUCING TECHNOLOGIES =================
    co2ReducingTechnologiesAvailable: "",
    regenerativeBraking: "",
    startStopSystem: "",
    tyrePressureMonitoringSystem: "",
    sixOrMoreSpeedTransmission: "",
    otherTechnology: "",

    // ================= VEHICLE CLASS =================
    vehicleClass: "",

    // ================= VEHICLE DIMENSIONS =================
    overallLength: "",
    totalLength: "",
    overallWidth: "",
    overallHeightUnladen: "",
    wheelBase: "",
    axleSpacing: "",

    // ================= WHEEL TRACK =================
    wheelTrackFront: "",
    wheelTrackRear: "",
    wheelTrackOtherAxles: "",

    // ================= BODY OVERHANG =================
    bodyOverhangFrontEnd: "",
    bodyOverhangRearEnd: "",

    // ================= FRAME OVERHANG =================
    frameOverhangFrontEnd: "",
    frameOverhangRearEnd: "",

    // ================= LOAD BODY =================
    loadBodyDimensions: "",
    lateralProjection: "",

    // ================= CARGO BOX =================
    cargoBoxLength: "",
    cargoBoxWidth: "",
    cargoBoxHeight: "",
  },
},

  weighmentDetails: {
  1: {
    vehicleKerbWeight: "",
    frontAxle1: "",
    frontAxle2: "",
    rearAxle: "",
    trailerAxle: "",
    total: "",
    grossVehicleWeight: "",
    maximumPermissibleAxleWeightsFront: "",
    maximumPermissibleAxleWeightsRear: "",
    maximumPermissibleAxleWeightsOther: "",
  },

  2: {
    vehicleKerbWeight: "",
    frontAxle1: "",
    frontAxle2: "",
    rearAxle: "",
    trailerAxle: "",
    total: "",
    grossVehicleWeight: "",
    maximumPermissibleAxleWeightsFront: "",
    maximumPermissibleAxleWeightsRear: "",
    maximumPermissibleAxleWeightsOther: "",
  },

  3: {
    vehicleKerbWeight: "",
    frontAxle1: "",
    frontAxle2: "",
    rearAxle: "",
    trailerAxle: "",
    total: "",
    grossVehicleWeight: "",
    maximumPermissibleAxleWeightsFront: "",
    maximumPermissibleAxleWeightsRear: "",
    maximumPermissibleAxleWeightsOther: "",
  },
},

  tyreAndWheelRim: {
  tyre: {
    make: "",
    brandTradeDescription: "",
    ais142Compliance: "",
    tyreRollingResistance: "",

    tyreClassFront: "",
    tyreClassRear: "",

    categoryOfUseFront: "",
    categoryOfUseRear: "",

    tyreTreadPatternDrawing: "",

    identification: "",

    wheelsFront: "",
    wheelsRear: "",
    spareWheel: "",
    otherWheels: "",

    tyreTypeFront: "",
    tyreTypeRear: "",
    spareWheelTyreType: "",
    otherTyreType: "",

    staticRollingRadius: "",
    dynamicRollingRadius: "",

    inflationPressureUnladenFront: "",
    inflationPressureUnladenRear: "",
    inflationPressureUnladenOther: "",

    inflationPressureLadenFront: "",
    inflationPressureLadenRear: "",
    inflationPressureLadenOther: "",
  },

  wheelRim: {
    frontMake: "",
    frontBisLicenseNumber: "",
    frontPartNumber: "",
    frontSize: "",
    frontType: "",

    rearMake: "",
    rearBisLicenseNumber: "",
    rearPartNumber: "",
    rearSize: "",
    rearType: "",

    spareMake: "",
    spareBisLicenseNumber: "",
    sparePartNumber: "",
    spareSize: "",
    spareType: "",

    spareWheelType: "",

    speedIndexFront: "",
    speedIndexRear: "",
    speedIndexSpare: "",

    loadIndexFront: "",
    loadIndexRear: "",
    loadIndexSpare: "",

    tyreTypeFront: "",
    tyreTypeRear: "",
    tyreTypeSpare: "",
  },

  wheelNut: {
    make: "",
    size: "",
    nosPerWheel: "",
    tighteningTorque: "",
    dimensionalDrawingMaterialSpecification: "",

    wheelCapDimensionalDrawing: "",

    hubCapMake: "",
    hubCapFitmentMethod: "",
    hubCapDimensionalDrawing: "",
  },

  tpms: {
    makeDirectTPMS: "",
    systemDescriptionIndirectTPMS: "",
    sensorPartNumberDirectTPMS: "",

    temporarySpareWheelRFT: "",

    typeAsPerAIS110: "",
    make: "",
    size: "",
    loadAndSpeedRating: "",

    recommendedMaxSpeedUnladen: "",
    recommendedMaxSpeedLaden: "",
  },
},


  documents: {
    documentName: "",
    documentNumber: "",
    documentType: "",
    issueDate: "",
    expiryDate: "",
    remarks: "",
  },

  notification: {
    notificationType: "",
    notificationTitle: "",
    notificationDate: "",
    notificationStatus: "",
    description: "",
    remarks: "",
  },

  setting: {
    userName: "",
    emailId: "",
    contactNumber: "",
    companyName: "",
    vehicleType: "",
    language: "",
  },
};