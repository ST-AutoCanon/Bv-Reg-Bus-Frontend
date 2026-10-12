
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
  WeighmentData,
} from "../formData/BusFormData";

/* ================= PROPS ================= */

type WeighmentDetailsProps = {
  data: BusFormData["weighmentDetails"];

  onSave: (
    data: BusFormData["weighmentDetails"]
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
  onChange={(e) =>
    onChange(e.target.value)
  }
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

/* ================= EMPTY DATA ================= */

const emptyWeighmentData: WeighmentData = {
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
};

/* ================= COMPONENT ================= */

const WeighmentDetails = ({
  data,
  onSave,
}: WeighmentDetailsProps) => {
  /* ================= ACTIVE WD ================= */

  const [activeWD, setActiveWD] = useState(1);

  /* ================= LOCAL FORM DATA ================= */

  const [formData, setFormData] =
    useState<BusFormData["weighmentDetails"]>(
      data
    );

  /* ================= SUCCESS POPUP ================= */

  const {
    isOpen: isSuccessOpen,
    onOpen: onSuccessOpen,
    onClose: onSuccessClose,
  } = useDisclosure();

  /* ================= SYNC WITH PARENT ================= */

  useEffect(() => {
    setFormData(data);
  }, [data]);

  /* ================= CURRENT DATA ================= */

  const currentData =
    formData[activeWD] ||
    emptyWeighmentData;

  /* ================= HANDLE CHANGE ================= */

  const handleChange = (
    field: keyof WeighmentData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [activeWD]: {
        ...(prev[activeWD] ||
          emptyWeighmentData),
        [field]: value,
      },
    }));
  };

  /* ================= SAVE ================= */

  const handleSave = () => {
    console.log(
      `WD${activeWD} data:`,
      currentData
    );

    onSave(formData);

    onSuccessOpen();
  };

  /* ================= CANCEL ================= */

  const handleCancel = () => {
    setFormData((prev) => ({
      ...prev,
      [activeWD]: {
        ...(data[activeWD] ||
          emptyWeighmentData),
      },
    }));
  };

  return (
    <Box
      width="100%"
      pl={{ base: 0, md: 0 }}
      pr={{ base: 5, md: 5 }}
    >
      {/* ================= WD TABS ================= */}

      <Box
        display="flex"
        justifyContent="flex-start"
        width="100%"
        mb={6}
      >
        <HStack spacing={2}>
        {[1, 2, 3, 4, 5].map((wd) => (
  <Button
    key={wd}
    size="md"
    borderRadius="4px"
    px={7}
    py={6}
    bg={
      activeWD === wd
        ? "#3375BA"
        : "white"
    }
    color={
      activeWD === wd
        ? "white"
        : "#4A5568"
    }
    border="1px solid #E2E8F0"
    fontSize="15px"
    fontWeight="600"
    _hover={{
      bg:
        activeWD === wd
          ? "#2865A5"
          : "#F7FAFC",
    }}
    onClick={() => setActiveWD(wd)}
  >
    {wd === 1
      ? "Base"
      : `Variant ${wd - 1}`}
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
          fontSize={{
            base: "18px",
            md: "21px",
          }}
          fontWeight="700"
          color="#17365D"
          mb={6}
          textAlign="left"
        >
          Weights — WD {activeWD}
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
>
          {/* Vehicle Kerb Weight */}

          <FormControl>
            <FormLabel
              fontSize="15px"
              fontWeight="500"
              color="#4A5568"
              minH="48px"

            >
              Vehicle kerb weight kg
            </FormLabel>

            <InputWithInfo
              value={
                currentData.vehicleKerbWeight
              }
              onChange={(value) =>
                handleChange(
                  "vehicleKerbWeight",
                  value
                )
              }
            />
          </FormControl>

          {/* Front Axle 1 */}

          <FormControl>
            <FormLabel
              fontSize="15px"
              fontWeight="500"
              color="#4A5568"
              minH="48px"

            >
              Front axle 1
            </FormLabel>

            <InputWithInfo
              value={currentData.frontAxle1}
              onChange={(value) =>
                handleChange(
                  "frontAxle1",
                  value
                )
              }
            />
          </FormControl>

          {/* Front Axle 2 */}

          <FormControl>
            <FormLabel
              fontSize="15px"
              fontWeight="500"
              color="#4A5568"
              minH="48px"

            >
              Front axle 2
            </FormLabel>

            <InputWithInfo
              value={currentData.frontAxle2}
              onChange={(value) =>
                handleChange(
                  "frontAxle2",
                  value
                )
              }
            />
          </FormControl>

          {/* Rear Axle */}

          <FormControl>
            <FormLabel
              fontSize="15px"
              fontWeight="500"
              color="#4A5568"
              minH="48px"

            >
              Rear Axle
            </FormLabel>

            <InputWithInfo
              value={currentData.rearAxle}
              onChange={(value) =>
                handleChange(
                  "rearAxle",
                  value
                )
              }
            />
          </FormControl>

          {/* Trailer Axle */}

          <FormControl>
            <FormLabel
              fontSize="15px"
              fontWeight="500"
              color="#4A5568"
              minH="48px"

            >
              Trailer axle (applicable for articulated/combination vehicles)
            </FormLabel>

            <InputWithInfo
              value={currentData.trailerAxle}
              onChange={(value) =>
                handleChange(
                  "trailerAxle",
                  value
                )
              }
            />
          </FormControl>

          {/* Total */}

          <FormControl>
            <FormLabel
              fontSize="15px"
              fontWeight="500"
              color="#4A5568"
              minH="48px"

            >
              Total
            </FormLabel>

            <InputWithInfo
              value={currentData.total}
              onChange={(value) =>
                handleChange(
                  "total",
                  value
                )
              }
            />
          </FormControl>

          {/* Gross Vehicle Weight */}

          <FormControl>
            <FormLabel
              fontSize="15px"
              fontWeight="500"
              color="#4A5568"
              minH="48px"

            >
              Gross vehicle weight kg ( for rigid vehicles ) (Front, Rear & Total)
            </FormLabel>

            <InputWithInfo
              value={
                currentData.grossVehicleWeight
              }
              onChange={(value) =>
                handleChange(
                  "grossVehicleWeight",
                  value
                )
              }
            />
          </FormControl>

          {/* ================= SECTION HEADING ================= */}

          <Box
            gridColumn={{
              base: "auto",
              md: "1 / -1",
            }}
            mt={2}
            mb={-2}
          >
            <Text
              fontSize="16px"
              fontWeight="600"
              color="#17365D"
            >
              Maximum permissible axle weights (kg)
            </Text>
          </Box>

          {/* Maximum Permissible Front Axle */}

          <FormControl>
            <FormLabel
              fontSize="15px"
              fontWeight="500"
              color="#4A5568"
              minH="48px"

            >
              Front axle
            </FormLabel>

            <InputWithInfo
              value={
                currentData.maximumPermissibleAxleWeightsFront
              }
              onChange={(value) =>
                handleChange(
                  "maximumPermissibleAxleWeightsFront",
                  value
                )
              }
            />
          </FormControl>

          {/* Maximum Permissible Rear Axle */}

          <FormControl>
            <FormLabel
              fontSize="15px"
              fontWeight="500"
              color="#4A5568"
              minH="48px"

            >
              Rear axle
            </FormLabel>

            <InputWithInfo
              value={
                currentData.maximumPermissibleAxleWeightsRear
              }
              onChange={(value) =>
                handleChange(
                  "maximumPermissibleAxleWeightsRear",
                  value
                )
              }
            />
          </FormControl>

          {/* Maximum Permissible Other Axle */}

          <FormControl>
            <FormLabel
              fontSize="15px"
              fontWeight="500"
              color="#4A5568"
              minH="48px"

            >
              Other axle
            </FormLabel>

            <InputWithInfo
              value={
                currentData.maximumPermissibleAxleWeightsOther
              }
              onChange={(value) =>
                handleChange(
                  "maximumPermissibleAxleWeightsOther",
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

export default WeighmentDetails;

