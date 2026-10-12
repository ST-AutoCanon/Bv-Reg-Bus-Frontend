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

import {
  BusFormData,
} from "../formData/BusFormData";
type DocumentsProps = {
  data: BusFormData["documents"];

  onSave: (
    data: BusFormData["documents"]
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
      width="100%"
      align="center"
    >
      <Input
        size="md"
        height="42px"
        fontSize="15px"
        type={type}
        flex="1"
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

const Documents = ({
  data,
  onSave,
}: DocumentsProps) => {

  const [documentData, setDocumentData] =
    useState<BusFormData["documents"]>(data);

  const {
    isOpen: isSuccessOpen,
    onOpen: onSuccessOpen,
    onClose: onSuccessClose,
  } = useDisclosure();

  const handleChange = (
    field: keyof BusFormData["documents"],
    value: string
  ) => {
    setDocumentData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    console.log("Document data:", documentData);

    // Send data to parent
    onSave(documentData);

    onSuccessOpen();
  };

  const handleCancel = () => {
    setDocumentData(data);
  };

  // rest of your JSX remains same

  return (
    <Box
      width="100%"
      pl={{ base: 0, md: 0 }}
      pr={{ base: 5, md: 5 }}
    >
      {/* ================= DOCUMENTS CARD ================= */}

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
          Documents
        </Text>

        {/* Divider */}
        <Box
          borderTop="1px solid #E5E7EB"
          mb={7}
        />

        {/* ================= FORM ================= */}

        <SimpleGrid
          columns={{
            base: 1,
            md: 2,
            lg: 3,
          }}
          spacingX={8}
          spacingY={7}
        >
          {/* Document Name */}
          <FormControl>
            <FormLabel
              fontSize="15px"
              fontWeight="500"
              color="#4A5568"
            >
              Document Name
            </FormLabel>

            <InputWithInfo
              value={documentData.documentName}
              onChange={(value) =>
                handleChange("documentName", value)
              }
            />
          </FormControl>

          {/* Document Number */}
          <FormControl>
            <FormLabel
              fontSize="15px"
              fontWeight="500"
              color="#4A5568"
            >
              Document Number
            </FormLabel>

            <InputWithInfo
              value={documentData.documentNumber}
              onChange={(value) =>
                handleChange("documentNumber", value)
              }
            />
          </FormControl>

          {/* Document Type */}
          <FormControl>
            <FormLabel
              fontSize="15px"
              fontWeight="500"
              color="#4A5568"
            >
              Document Type
            </FormLabel>

            <InputWithInfo
              value={documentData.documentType}
              onChange={(value) =>
                handleChange("documentType", value)
              }
            />
          </FormControl>

          {/* Issue Date */}
          <FormControl>
            <FormLabel
              fontSize="15px"
              fontWeight="500"
              color="#4A5568"
            >
              Issue Date
            </FormLabel>

            <InputWithInfo
              type="date"
              value={documentData.issueDate}
              onChange={(value) =>
                handleChange("issueDate", value)
              }
            />
          </FormControl>

          {/* Expiry Date */}
          <FormControl>
            <FormLabel
              fontSize="15px"
              fontWeight="500"
              color="#4A5568"
            >
              Expiry Date
            </FormLabel>

            <InputWithInfo
              type="date"
              value={documentData.expiryDate}
              onChange={(value) =>
                handleChange("expiryDate", value)
              }
            />
          </FormControl>

          {/* Remarks */}
          <FormControl>
            <FormLabel
              fontSize="15px"
              fontWeight="500"
              color="#4A5568"
            >
              Remarks
            </FormLabel>

            <InputWithInfo
              value={documentData.remarks}
              onChange={(value) =>
                handleChange("remarks", value)
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

export default Documents;