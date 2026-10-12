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

type NotificationProps = {
  data: BusFormData["notification"];

  onSave: (
    data: BusFormData["notification"]
  ) => void;
};


/* ================= NOTIFICATION ================= */

const Notification = ({
  data,
  onSave,
}: NotificationProps) => {

  const [notificationData, setNotificationData] =
    useState<BusFormData["notification"]>(data);

  const {
    isOpen: isSuccessOpen,
    onOpen: onSuccessOpen,
    onClose: onSuccessClose,
  } = useDisclosure();


  /* ================= HANDLE CHANGE ================= */

  const handleChange = (
    field: keyof BusFormData["notification"],
    value: string
  ) => {
    setNotificationData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };


  /* ================= SAVE ================= */

  const handleSave = () => {

    console.log(
      "Notification data:",
      notificationData
    );

    // IMPORTANT
    // Send data to parent
    onSave(notificationData);

    onSuccessOpen();
  };


  /* ================= CANCEL ================= */

  const handleCancel = () => {

    setNotificationData(data);

  };
  return (
    <Box
      width="100%"
      pl={{ base: 0, md: 0 }}
      pr={{ base: 5, md: 5 }}
    >
      {/* Notification Details Card */}
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
          Notification
        </Text>

        {/* Divider */}
        <Box
          borderTop="1px solid #E5E7EB"
          mb={7}
        />

        {/* Form Content */}
        <SimpleGrid
          columns={{
            base: 1,
            md: 2,
            lg: 3,
          }}
          spacingX={8}
          spacingY={7}
        >
          {/* Notification Type */}
          <FormControl>
            <FormLabel
              fontSize="15px"
              fontWeight="500"
              color="#4A5568"
            >
              Notification Type
            </FormLabel>

            <InputWithInfo
              value={notificationData.notificationType}
              onChange={(value) =>
                handleChange(
                  "notificationType",
                  value
                )
              }
            />
          </FormControl>

          {/* Notification Title */}
          <FormControl>
            <FormLabel
              fontSize="15px"
              fontWeight="500"
              color="#4A5568"
            >
              Notification Title
            </FormLabel>

            <InputWithInfo
              value={notificationData.notificationTitle}
              onChange={(value) =>
                handleChange(
                  "notificationTitle",
                  value
                )
              }
            />
          </FormControl>

          {/* Notification Date */}
          <FormControl>
            <FormLabel
              fontSize="15px"
              fontWeight="500"
              color="#4A5568"
            >
              Notification Date
            </FormLabel>

            <InputWithInfo
              type="date"
              value={notificationData.notificationDate}
              onChange={(value) =>
                handleChange(
                  "notificationDate",
                  value
                )
              }
            />
          </FormControl>

          {/* Notification Status */}
          <FormControl>
            <FormLabel
              fontSize="15px"
              fontWeight="500"
              color="#4A5568"
            >
              Notification Status
            </FormLabel>

            <InputWithInfo
              value={notificationData.notificationStatus}
              onChange={(value) =>
                handleChange(
                  "notificationStatus",
                  value
                )
              }
            />
          </FormControl>

          {/* Description */}
          <FormControl>
            <FormLabel
              fontSize="15px"
              fontWeight="500"
              color="#4A5568"
            >
              Description
            </FormLabel>

            <InputWithInfo
              value={notificationData.description}
              onChange={(value) =>
                handleChange(
                  "description",
                  value
                )
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
              value={notificationData.remarks}
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

export default Notification;