import React, { useState } from "react";

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

import { BusFormData } from "../formData/BusFormData";

/* ================= INPUT WITH INFO ================= */

const InputWithInfo = ({
  type = "text",
  value,
  onChange,
}: {
  type?: string;
  value: string;
  onChange: (value: string) => void;
}) => {
  return (
    <HStack
      spacing={2}
      width="100%"
      align="center"
    >
      <Input
        height="42px"
        fontSize="15px"
        type={type}
        flex="1"
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


/* ================= PROPS ================= */

type SettingProps = {
  data: BusFormData["setting"];

  onSave: (
    data: BusFormData["setting"]
  ) => void;
};


/* ================= SETTING ================= */

const Setting = ({
  data,
  onSave,
}: SettingProps) => {

  const [formData, setFormData] =
    useState<BusFormData["setting"]>(data);


  /* ================= SUCCESS POPUP ================= */

  const {
    isOpen: isSuccessOpen,
    onOpen: onSuccessOpen,
    onClose: onSuccessClose,
  } = useDisclosure();


  /* ================= HANDLE INPUT ================= */

  const handleChange = (
    field: keyof BusFormData["setting"],
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };


  /* ================= CANCEL ================= */

  const handleCancel = () => {
    setFormData(data);
  };


  /* ================= SAVE ================= */

  const handleSave = () => {

    console.log(
      "Settings Data:",
      formData
    );

    // Send settings data to parent
    onSave(formData);

    onSuccessOpen();
  };

  return (
    <Box
      width="100%"
      pl={{ base: 0, md:0 }}
      pr={{ base: 5, md: 5 }}
    >
      {/* ================= SETTINGS CARD ================= */}

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
          Settings
        </Text>

        {/* Divider */}
        <Box
          borderTop="1px solid #E5E7EB"
          mb={7}
        />

        {/* ================= FORM CONTENT ================= */}

        <SimpleGrid
          columns={{
            base: 1,
            md: 2,
            lg: 3,
          }}
          spacingX={8}
          spacingY={7}
        >
          {/* User Name */}
          <FormControl>
            <FormLabel
              fontSize="15px"
              fontWeight="500"
              color="#4A5568"
            >
              User Name
            </FormLabel>

            <InputWithInfo
              value={formData.userName}
              onChange={(value) =>
                handleChange("userName", value)
              }
            />
          </FormControl>

          {/* Email ID */}
          <FormControl>
            <FormLabel
              fontSize="15px"
              fontWeight="500"
              color="#4A5568"
            >
              Email ID
            </FormLabel>

            <InputWithInfo
              type="email"
              value={formData.emailId}
              onChange={(value) =>
                handleChange("emailId", value)
              }
            />
          </FormControl>

          {/* Contact Number */}
          <FormControl>
            <FormLabel
              fontSize="15px"
              fontWeight="500"
              color="#4A5568"
            >
              Contact Number
            </FormLabel>

            <InputWithInfo
              value={formData.contactNumber}
              onChange={(value) =>
                handleChange("contactNumber", value)
              }
            />
          </FormControl>

          {/* Company Name */}
          <FormControl>
            <FormLabel
              fontSize="15px"
              fontWeight="500"
              color="#4A5568"
            >
              Company Name
            </FormLabel>

            <InputWithInfo
              value={formData.companyName}
              onChange={(value) =>
                handleChange("companyName", value)
              }
            />
          </FormControl>

          {/* Vehicle Type */}
          <FormControl>
            <FormLabel
              fontSize="15px"
              fontWeight="500"
              color="#4A5568"
            >
              Vehicle Type
            </FormLabel>

            <InputWithInfo
              value={formData.vehicleType}
              onChange={(value) =>
                handleChange("vehicleType", value)
              }
            />
          </FormControl>

          {/* Language */}
          <FormControl>
            <FormLabel
              fontSize="15px"
              fontWeight="500"
              color="#4A5568"
            >
              Language
            </FormLabel>

            <InputWithInfo
              value={formData.language}
              onChange={(value) =>
                handleChange("language", value)
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

export default Setting;