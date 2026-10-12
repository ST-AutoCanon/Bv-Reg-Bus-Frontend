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
  VStack,
  Icon,
  useDisclosure,
} from "@chakra-ui/react";
import {  Info } from "lucide-react";
import {
  BusFormData,
  ManufacturerPlantData,
} from "../formData/BusFormData";
import { current } from "@reduxjs/toolkit";

type ManufacturerPlantDetailsProps = {
  data: BusFormData["manufacturerPlantDetails"];

  onSave: (
    data: BusFormData["manufacturerPlantDetails"]
  ) => void;
};

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
      align="center"
      width="100%"
      minW={0}
    >
      <Input
        size="md"
        height="42px"
        fontSize="15px"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        flex="1"
        minW={0}
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
        <Info size={14} color="white" />
      </Box>
    </HStack>
  );
};
const Manufacturerplantdetails = ({
  data,
  onSave,
}: ManufacturerPlantDetailsProps) => {
  const {
    isOpen: isSuccessOpen,
    onOpen: onSuccessOpen,
    onClose: onSuccessClose,
  } = useDisclosure();

const [activeMPD, setActiveMPD] = useState(1);

const [formData, setFormData] =
  useState<Record<number, ManufacturerPlantData>>(data);

useEffect(() => {
  setFormData(data);
}, [data]);

const currentData = formData[activeMPD];

  const handleChange = (
  field: keyof ManufacturerPlantData,
  value: string
) => {
  setFormData((prev) => ({
    ...prev,
    [activeMPD]: {
      ...prev[activeMPD],
      [field]: value,
    },
  }));
};

  const handleCancel = () => {
  setFormData((prev) => ({
    ...prev,
    [activeMPD]: {
      ...data[activeMPD],
    },
  }));
};

  const handleSave = () => {
  console.log(
    "Manufacturer Plant Details:",
    formData
  );

  onSave(formData);

  onSuccessOpen();
};

  return (
    <Box
      width="100%"
      pl={{ base: 0, md: 0 }}
      pr={{ base: 5, md: 5 }}
    >

      {/* MPD 1 / MPD 2 / MPD 3 */}
<Box
  display="flex"
  justifyContent="flex-start"
  width="100%"
  mb={6}
>
  <HStack spacing={2}>
    {[1, 2, 3].map((mpd) => (
      <Button
        key={mpd}
        size="md"
        borderRadius="4px"
        px={7}
        py={6}
        bg={
          activeMPD === mpd
            ? "#3375BA"
            : "white"
        }
        color={
          activeMPD === mpd
            ? "white"
            : "#4A5568"
        }
        border="1px solid #E2E8F0"
        fontSize="15px"
        fontWeight="600"
        isDisabled={mpd === 2 || mpd === 3}
        _hover={{
          bg:
            activeMPD === mpd
              ? "#2865A5"
              : "#F7FAFC",
        }}
        onClick={() => setActiveMPD(mpd)}
      >
        MPD {mpd}
      </Button>
    ))}
  </HStack>
</Box>
      {/* Manufacturer Plant Details Card */}
      <Box
        bg="white"
        borderRadius="8px"
        p={{ base: 5, md: 8 }}
        width="100%"
        minH="550px"
        boxShadow="0 1px 4px rgba(0,0,0,0.12)"
      >
        {/* Heading */}
        <Text
          fontSize={{ base: "18px", md: "21px" }}
          fontWeight="700"
          color="#17365D"
          mb={6}
          textAlign="left"
        >
          Manufacturer Plant Details — MPD {activeMPD}
        </Text>

        <Box
          borderTop="1px solid #E5E7EB"
          mb={7}

          
        />

        {/* Form */}
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
  {/* Vehicle Manufacturing Plant */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
      minH="48px"
    >
      Name and address of vehicle manufacturing plant
    </FormLabel>

    <InputWithInfo
      value={currentData.vehicleManufacturingPlant}
      onChange={(value) =>
        handleChange(
          "vehicleManufacturingPlant",
          value
        )
      }
    />
  </FormControl>

  {/* Engine Manufacturing Plant */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
      minH="48px"
    >
      Name and address of engine manufacturing plant
    </FormLabel>

    <InputWithInfo
      value={currentData.engineManufacturingPlant}
      onChange={(value) =>
        handleChange(
          "engineManufacturingPlant",
          value
        )
      }
    />
  </FormControl>

  {/* Importer */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
      minH="48px"
    >
      Importer's Name and address
    </FormLabel>


    <InputWithInfo
      value={currentData.importerNameAddress}
      onChange={(value) =>
        handleChange(
          "importerNameAddress",
          value
        )
      }
    />
  </FormControl>

  {/* Telephone */}


  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
      minH="48px"
    >
      Telephone No.
    </FormLabel>

    <InputWithInfo
      value={currentData.telephone}
      onChange={(value) =>
        handleChange("telephone", value)
      }
    />
  </FormControl>

  {/* Email */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
      minH="48px"
    >
      E-mail address
    </FormLabel>

    <InputWithInfo
      type="email"
      value={currentData.email}
      onChange={(value) =>
        handleChange("email", value)
      }
    />
  </FormControl>

  {/* Contact Person */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
      minH="48px"
    >
      Contact person
    </FormLabel>

    <InputWithInfo
      value={
        currentData.contactPerson}
      onChange={(value) =>
        handleChange("contactPerson", value)
      }
    />
  </FormControl>

  {/* Bus Body Builder Category */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
      minH="48px"
    >
      Category of Bus Body Builder
    </FormLabel>

    <InputWithInfo
      value={currentData.busBodyBuilderCategory}
      onChange={(value) =>
        handleChange(
          "busBodyBuilderCategory",
          value
        )
      }
    />
  </FormControl>

  {/* ZAB Certificate */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
      minH="48px"
    >
      ZAB Certificate Number and Date
    </FormLabel>

    <InputWithInfo
      value={currentData.zabCertificate}
      onChange={(value) =>
        handleChange(
          "zabCertificate",
          value
        )
      }
    />
  </FormControl>

  {/* NAB Certificate */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
      minH="48px"
    >
      NAB Certificate Number and Date
    </FormLabel>

    <InputWithInfo
      value={currentData.nabCertificate}
      onChange={(value) =>
        handleChange(
          "nabCertificate",
          value
        )
      }
    />
  </FormControl>

  {/* CMVR Compliance Certificate */}
  <FormControl>
    <FormLabel
      fontSize="15px"
      fontWeight="500"
      color="#4A5568"
      minH="48px"
    >
      Base CMVR Compliance Certificate Number and Date
    </FormLabel>

    <InputWithInfo
      value={currentData.cmvrComplianceCertificate}
      onChange={(value) =>
        handleChange(
          "cmvrComplianceCertificate",
          value
        )
      }
    />
  </FormControl>
</SimpleGrid>

        {/* Bottom buttons */}
        <Box
          borderTop="1px solid #E5E7EB"
          mt={10}
          pt={6}
        >
          <HStack>
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

export default Manufacturerplantdetails;