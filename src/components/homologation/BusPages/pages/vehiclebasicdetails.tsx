import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  SimpleGrid,
  HStack,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  VStack,
  Icon,
} from "@chakra-ui/react";

import { Info, CheckCircle } from "lucide-react";
import {
  BusFormData,
  VehicleBasicDetailsData,
} from "../formData/BusFormData";
/* ================= DATA TYPE ================= */


type VehicleBasicDetailsProps = {
  data: BusFormData["vehicleBasicDetails"];

  onSave: (
    data: BusFormData["vehicleBasicDetails"]
  ) => void;
};

/* ================= INPUT WITH INFO ================= */

const InputWithInfo = ({
  value,
  onChange,
  type = "text",
}: {
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) => {
  return (
    <HStack
      spacing={2}
      width="100%"
      align="center"
      minW={0}
    >
      <Input
        size="md"
        height="42px"
        fontSize="15px"
        type={type}
        flex="1"
        minW={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      <Box
        minW="24px"
        h="24px"
        borderRadius="50%"
        bg="#3375BA"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
      >
        <Info
          size={14}
          color="white"
          strokeWidth={2.5}
        />
      </Box>
    </HStack>
  );
};

/* ================= COMPONENT ================= */

const VehicleBasicDetails = ({
  data,
  onSave,
}: VehicleBasicDetailsProps) => {
  const [activeVBD, setActiveVBD] = useState(1);

const [vehicleData, setVehicleData] =
  useState<Record<number, VehicleBasicDetailsData>>(data);

const currentData = vehicleData[activeVBD];

useEffect(() => {
  setVehicleData(data);
}, [data]);

  /* ================= SUCCESS POPUP ================= */

  const {
    isOpen: isSuccessOpen,
    onOpen: onSuccessOpen,
    onClose: onSuccessClose,
  } = useDisclosure();


  

  /* ================= HANDLE CHANGE ================= */

  const handleChange = (
  field: keyof VehicleBasicDetailsData,
  value: string
) => {
  setVehicleData((prev) => ({
    ...prev,
    [activeVBD]: {
      ...prev[activeVBD],
      [field]: value,
    },
  }));
};

  /* ================= SAVE ================= */

const handleSave = () => {
  console.log(
    `VBD ${activeVBD} data:`,
    currentData
  );

  onSave(vehicleData);
};

  /* ================= CANCEL ================= */

  const handleCancel = () => {
  setVehicleData((prev) => ({
    ...prev,
    [activeVBD]: {
      ...data[activeVBD],
    },
  }));
};

  return (
    <Box
      width="100%"
      pl={{ base: 0, md: 0 }}
      pr={{ base: 5, md: 5 }}
    >

      <Box
  display="flex"
  justifyContent="flex-start"
  width="100%"
  mb={6}
>
  <HStack spacing={2}>
    {[1, 2, 3].map((vbd) => (
      <Button
        key={vbd}
        size="md"
        borderRadius="4px"
        px={7}
        py={6}
        bg={
          activeVBD === vbd
            ? "#3375BA"
            : "white"
        }
        color={
          activeVBD === vbd
            ? "white"
            : "#4A5568"
        }
        border="1px solid #E2E8F0"
        fontSize="15px"
        fontWeight="600"
        isDisabled={vbd === 2 || vbd === 3}
        _hover={{
          bg:
            activeVBD === vbd
              ? "#2865A5"
              : "#F7FAFC",
        }}
        onClick={() => setActiveVBD(vbd)}
      >
        VBD {vbd}
      </Button>
    ))}
  </HStack>
</Box>
      {/* ================= CARD ================= */}

      <Box
        bg="white"
        borderRadius="8px"
        p={{ base: 5, md: 8 }}
        width="100%"
        minH="550px"
        boxShadow="0 1px 4px rgba(0,0,0,0.12)"
      >
        {/* ================= HEADING ================= */}

        <Text
          fontSize={{ base: "18px", md: "21px" }}
          fontWeight="700"
          color="#17365D"
          mb={6}
          textAlign="left"
        >
          Vehicle Basic Details — VBD {activeVBD}
        </Text>

        <Box
          borderTop="1px solid #E5E7EB"
          mb={7}
        />

        {/* ================= FORM ================= */}

       <SimpleGrid
  templateColumns={{
    base: "1fr",
    md: "repeat(2, minmax(0, 1fr))",
    lg: "repeat(3, minmax(0, 1fr))",
  }}
  spacingX={8}
  spacingY={7}
  width="100%"
>
  {/* ================= VEHICLE TYPE ================= */}

  {/* Type of Vehicle */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
       minH="48px"
    >
      Type of vehicle (Rigid / articulated / Tractor-Trailer combination / others)
    </FormLabel>

    <InputWithInfo
      value={currentData.typeOfVehicle}
      onChange={(value) =>
        handleChange("typeOfVehicle", value)
      }
    />
  </FormControl>

  {/* Usage */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
       minH="48px"
    >
      Usage (goods / passenger / others)
    </FormLabel>

    <InputWithInfo
      value={currentData.usage}
      onChange={(value) =>
        handleChange("usage", value)
      }
    />
  </FormControl>

  {/* Control */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
       minH="48px"
    >
      Control (Forward / semi-forward / normal / others)
    </FormLabel>

    <InputWithInfo
      value={currentData.control}
      onChange={(value) =>
        handleChange("control", value)
      }
    />
  </FormControl>

  {/* Drive */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
       minH="48px"
    >
      Drive (4x2 / 4x4 / 6x2 / 6x4 / others)
    </FormLabel>

    <InputWithInfo
      value={currentData.drive}
      onChange={(value) =>
        handleChange("drive", value)
      }
    />
  </FormControl>

  {/* Cab Type */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
       minH="48px"
    >
      Cab type
    </FormLabel>

    <InputWithInfo
      value={currentData.cabType}
      onChange={(value) =>
        handleChange("cabType", value)
      }
    />
  </FormControl>

  {/* Load Body */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
       minH="48px"
    >
      Load body (fitted / not fitted)
    </FormLabel>

    <InputWithInfo
      value={currentData.loadBody}
      onChange={(value) =>
        handleChange("loadBody", value)
      }
    />
  </FormControl>

  {/* Category */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
       minH="48px"
    >
      Category of vehicle as per IS 14272:2011
    </FormLabel>

    <InputWithInfo
      value={currentData.vehicleCategoryIS14272}
      onChange={(value) =>
        handleChange(
          "vehicleCategoryIS14272",
          value
        )
      }
    />
  </FormControl>

  {/* Vehicle Available Modes */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
       minH="48px"
    >
      Vehicle available modes
    </FormLabel>

    <InputWithInfo
      value={currentData.vehicleAvailableModes}
      onChange={(value) =>
        handleChange(
          "vehicleAvailableModes",
          value
        )
      }
    />
  </FormControl>

  {/* Vehicle Default Mode */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
       minH="48px"
    >
      Vehicle Default mode Yes / No
    </FormLabel>

    <InputWithInfo
      value={currentData.vehicleDefaultMode}
      onChange={(value) =>
        handleChange(
          "vehicleDefaultMode",
          value
        )
      }
    />
  </FormControl>

  {/* Default Mode Details */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
       minH="48px"
    >
      Default mode details (if Yes)
    </FormLabel>

    <InputWithInfo
      value={currentData.vehicleDefaultModeDetails}
      onChange={(value) =>
        handleChange(
          "vehicleDefaultModeDetails",
          value
        )
      }
    />
  </FormControl>

  {/* ================= VEHICLE PERFORMANCE ================= */}

  <Box
    gridColumn={{
      base: "auto",
      md: "1 / -1",
    }}
    mt={2}
  >
    <Text
      fontSize="18px"
      fontWeight="700"
      color="#17365D"
      mb={2}
    >
      Vehicle Performance
    </Text>

    <Box borderTop="1px solid #E5E7EB" />
  </Box>

  {/* Max Gradeability */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
       minH="48px"
    >
      Max. recommended gradeability (Stand-start)  in degrees
    </FormLabel>

    <InputWithInfo
      value={currentData.maxRecommendedGradeability}
      onChange={(value) =>
        handleChange(
          "maxRecommendedGradeability",
          value
        )
      }
    />
  </FormControl>

  {/* Max Design Speed */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
       minH="48px"
    >
      Max. Design speed (km/h)
    </FormLabel>

    <InputWithInfo
      value={currentData.maxDesignSpeed}
      onChange={(value) =>
        handleChange("maxDesignSpeed", value)
      }
    />
  </FormControl>

  {/* Max Speed Unladen */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
       minH="48px"
    >
      Vehicle Max Speed in unladen condition (km/h)
    </FormLabel>

    <InputWithInfo
      value={currentData.maxSpeedUnladen}
      onChange={(value) =>
        handleChange("maxSpeedUnladen", value)
      }
    />
  </FormControl>

  {/* Max Speed Laden */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
       minH="48px"
    >
      Vehicle Max Speed in laden condition (km/h)
    </FormLabel>

    <InputWithInfo
      value={currentData.maxSpeedLaden}
      onChange={(value) =>
        handleChange("maxSpeedLaden", value)
      }
    />
  </FormControl>

  {/* ================= CO2 TECHNOLOGIES ================= */}

  <Box
    gridColumn={{
      base: "auto",
      md: "1 / -1",
    }}
    mt={2}
  >
    <Text
      fontSize="18px"
      fontWeight="700"
      color="#17365D"
      mb={2}
    >
      CO2 Reducing Technologies
    </Text>

    <Box borderTop="1px solid #E5E7EB" />
  </Box>

  {/* CO2 Available */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
       minH="48px"
    >
      CO2 Reducing technologies available (Yes / No)
    </FormLabel>

    <InputWithInfo
      value={
        currentData.co2ReducingTechnologiesAvailable
      }
      onChange={(value) =>
        handleChange(
          "co2ReducingTechnologiesAvailable",
          value
        )
      }
    />
  </FormControl>

  {/* Regenerative Braking */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
       minH="48px"
    >
      Regenerative braking
    </FormLabel>

    <InputWithInfo
      value={currentData.regenerativeBraking}
      onChange={(value) =>
        handleChange(
          "regenerativeBraking",
          value
        )
      }
    />
  </FormControl>

  {/* Start Stop */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
       minH="48px"
    >
      Start-Stop System
    </FormLabel>

    <InputWithInfo
      value={currentData.startStopSystem}
      onChange={(value) =>
        handleChange(
          "startStopSystem",
          value
        )
      }
    />
  </FormControl>

  {/* TPMS */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
       minH="48px"
    >
      Tyre pressure monitoring system
    </FormLabel>

    <InputWithInfo
      value={
        currentData.tyrePressureMonitoringSystem
      }
      onChange={(value) =>
        handleChange(
          "tyrePressureMonitoringSystem",
          value
        )
      }
    />
  </FormControl>

  {/* 6 Speed Transmission */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
       minH="48px"
    >
      6 or more Speed Transmission
    </FormLabel>

    <InputWithInfo
      value={
        currentData.sixOrMoreSpeedTransmission
      }
      onChange={(value) =>
        handleChange(
          "sixOrMoreSpeedTransmission",
          value
        )
      }
    />
  </FormControl>

  {/* Other Technology */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
       minH="48px"
    >
      Any other technology
    </FormLabel>

    <InputWithInfo
      value={currentData.otherTechnology}
      onChange={(value) =>
        handleChange(
          "otherTechnology",
          value
        )
      }
    />
  </FormControl>

  {/* ================= VEHICLE CLASS ================= */}

  <Box
    gridColumn={{
      base: "auto",
      md: "1 / -1",
    }}
    mt={2}
  >
    <Text
      fontSize="18px"
      fontWeight="700"
      color="#17365D"
      mb={2}
    >
      Vehicle Class
    </Text>

    <Box borderTop="1px solid #E5E7EB" />
  </Box>

  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
       minH="48px"
    >
      Vehicle Class (Class 1 / Class 2 / Class 3a / Class 3b)
    </FormLabel>

    <InputWithInfo
      value={currentData.vehicleClass}
      onChange={(value) =>
        handleChange("vehicleClass", value)
      }
    />
  </FormControl>

  {/* ================= VEHICLE DIMENSIONS ================= */}

  <Box
    gridColumn={{
      base: "auto",
      md: "1 / -1",
    }}
    mt={2}
  >
    <Text
      fontSize="18px"
      fontWeight="700"
      color="#17365D"
      mb={2}
    >
      Vehicle Dimensions
    </Text>

    <Box borderTop="1px solid #E5E7EB" />
  </Box>

  {/* Overall Length */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
       minH="48px"
    >
      Overall Length mm
    </FormLabel>

    <InputWithInfo
      value={currentData.overallLength}
      onChange={(value) =>
        handleChange("overallLength", value)
      }
    />
  </FormControl>

  {/* Total Length */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
       minH="48px"
    >
      Total length (mm) (for articulated/combination vehicles)
    </FormLabel>

    <InputWithInfo
      value={currentData.totalLength}
      onChange={(value) =>
        handleChange("totalLength", value)
      }
    />
  </FormControl>

  {/* Overall Width */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
       minH="48px"
    >
      Overall Width mm
    </FormLabel>

    <InputWithInfo
      value={currentData.overallWidth}
      onChange={(value) =>
        handleChange("overallWidth", value)
      }
    />
  </FormControl>

  {/* Overall Height */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
       minH="48px"
    >
      Overall Height (Unladen) (mm)
    </FormLabel>

    <InputWithInfo
      value={currentData.overallHeightUnladen}
      onChange={(value) =>
        handleChange(
          "overallHeightUnladen",
          value
        )
      }
    />
  </FormControl>

  {/* Wheel Base */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
       minH="48px"
    >
      Wheel base (mm)
    </FormLabel>

    <InputWithInfo
      value={currentData.wheelBase}
      onChange={(value) =>
        handleChange("wheelBase", value)
      }
    />
  </FormControl>

  {/* Axle Spacing */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
       minH="48px"
    >
      Axle spacing in case of multi axle vehicles
    </FormLabel>

    <InputWithInfo
      value={currentData.axleSpacing}
      onChange={(value) =>
        handleChange("axleSpacing", value)
      }
    />
  </FormControl>

  {/* ================= WHEEL TRACK ================= */}

  <Box
    gridColumn={{
      base: "auto",
      md: "1 / -1",
    }}
    mt={2}
  >
    <Text
      fontSize="17px"
      fontWeight="600"
      color="#17365D"
      mb={2}
    >
      Wheel Track (mm)
    </Text>

    <Box borderTop="1px solid #E5E7EB" />
  </Box>

  {/* Front */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
       minH="48px"
    >
      Front
    </FormLabel>

    <InputWithInfo
      value={currentData.wheelTrackFront}
      onChange={(value) =>
        handleChange(
          "wheelTrackFront",
          value
        )
      }
    />
  </FormControl>

  {/* Rear */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
       minH="48px"
    >
      Rear
    </FormLabel>

    <InputWithInfo
      value={currentData.wheelTrackRear}
      onChange={(value) =>
        handleChange(
          "wheelTrackRear",
          value
        )
      }
    />
  </FormControl>

  {/* Other Axles */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
       minH="48px"
    >
      Other axles (for articulated/combination vehicles)
    </FormLabel>

    <InputWithInfo
      value={
        currentData.wheelTrackOtherAxles
      }
      onChange={(value) =>
        handleChange(
          "wheelTrackOtherAxles",
          value
        )
      }
    />
  </FormControl>

  {/* ================= BODY OVERHANG ================= */}

  <Box
    gridColumn={{
      base: "auto",
      md: "1 / -1",
    }}
    mt={2}
  >
    <Text
      fontSize="17px"
      fontWeight="600"
      color="#17365D"
      mb={2}
    >
      Body Overhang (mm)
    </Text>

    <Box borderTop="1px solid #E5E7EB" />
  </Box>

  {/* Front End */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
       minH="48px"
    >
      Front end
    </FormLabel>

    <InputWithInfo
      value={currentData.bodyOverhangFrontEnd}
      onChange={(value) =>
        handleChange(
          "bodyOverhangFrontEnd",
          value
        )
      }
    />
  </FormControl>

  {/* Rear End */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
       minH="48px"
    >
      Rear end
    </FormLabel>

    <InputWithInfo
      value={currentData.bodyOverhangRearEnd}
      onChange={(value) =>
        handleChange(
          "bodyOverhangRearEnd",
          value
        )
      }
    />
  </FormControl>

  {/* ================= FRAME OVERHANG ================= */}

  <Box
    gridColumn={{
      base: "auto",
      md: "1 / -1",
    }}
    mt={2}
  >
    <Text
      fontSize="17px"
      fontWeight="600"
      color="#17365D"
      mb={2}
    >
      Frame Overhang (mm)
    </Text>

    <Box borderTop="1px solid #E5E7EB" />
  </Box>

  {/* Front End */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
       minH="48px"
    >
      Front end
    </FormLabel>

    <InputWithInfo
      value={
        currentData.frameOverhangFrontEnd
      }
      onChange={(value) =>
        handleChange(
          "frameOverhangFrontEnd",
          value
        )
      }
    />
  </FormControl>

  {/* Rear End */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
       minH="48px"
    >
      Rear end
    </FormLabel>

    <InputWithInfo
      value={
        currentData.frameOverhangRearEnd
      }
      onChange={(value) =>
        handleChange(
          "frameOverhangRearEnd",
          value
        )
      }
    />
  </FormControl>

  {/* ================= LOAD BODY ================= */}

  <Box
    gridColumn={{
      base: "auto",
      md: "1 / -1",
    }}
    mt={2}
  >
    <Text
      fontSize="17px"
      fontWeight="600"
      color="#17365D"
      mb={2}
    >
      Load Body
    </Text>

    <Box borderTop="1px solid #E5E7EB" />
  </Box>

  {/* Load Body Dimensions */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
       minH="48px"
    >
      Load Body dimensions (L X B X H) (mm)
    </FormLabel>

    <InputWithInfo
      value={currentData.loadBodyDimensions}
      onChange={(value) =>
        handleChange(
          "loadBodyDimensions",
          value
        )
      }
    />
  </FormControl>

  {/* Lateral Projection */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
       minH="48px"
    >
      Lateral projection
    </FormLabel>

    <InputWithInfo
      value={currentData.lateralProjection}
      onChange={(value) =>
        handleChange(
          "lateralProjection",
          value
        )
      }
    />
  </FormControl>

  {/* ================= CARGO BOX ================= */}

  <Box
    gridColumn={{
      base: "auto",
      md: "1 / -1",
    }}
    mt={2}
  >
    <Text
      fontSize="17px"
      fontWeight="600"
      color="#17365D"
      mb={2}
    >
      Cargo Box Dimensions (mm)
    </Text>

    <Box borderTop="1px solid #E5E7EB" />
  </Box>

  {/* Cargo Length */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
       minH="48px"
    >
      Length
    </FormLabel>

    <InputWithInfo
      value={currentData.cargoBoxLength}
      onChange={(value) =>
        handleChange(
          "cargoBoxLength",
          value
        )
      }
    />
  </FormControl>

  {/* Cargo Width */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
       minH="48px"
    >
      Width
    </FormLabel>

    <InputWithInfo
      value={currentData.cargoBoxWidth}
      onChange={(value) =>
        handleChange(
          "cargoBoxWidth",
          value
        )
      }
    />
  </FormControl>

  {/* Cargo Height */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
       minH="48px"
    >
      Height
    </FormLabel>

    <InputWithInfo
      value={currentData.cargoBoxHeight}
      onChange={(value) =>
        handleChange(
          "cargoBoxHeight",
          value
        )
      }
    />
  </FormControl>
</SimpleGrid>
        {/* ================= BUTTONS ================= */}

        <Box
          borderTop="1px solid #E5E7EB"
          mt={10}
          pt={6}
        >
          <HStack spacing={3}>
            {/* SAVE */}

            <Button
              bg="#3375BA"
              color="white"
              size="md"
              px={7}
              fontSize="15px"
              _hover={{
                bg: "#2865A5",
              }}
              onClick={handleSave}
            >
              Submit
            </Button>

            {/* CANCEL */}

            <Button
              type="button"
              variant="outline"
              size="md"
              px={7}
              fontSize="15px"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </HStack>
        </Box>
      </Box>

    </Box>
  );
};

export default VehicleBasicDetails;