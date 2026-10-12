import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  SimpleGrid,
  HStack,
  Text,
} from "@chakra-ui/react";
import { CheckCircle, Info } from "lucide-react";
import {
  BusFormData,
  ManufacturerData,
} from "../formData/BusFormData";

type ManufacturerDetailsProps = {
  data: BusFormData["manufacturerDetails"];

  onSave: (
    data: BusFormData["manufacturerDetails"]
  ) => void;
};

const emptyManufacturerData: ManufacturerData = {
  manufacturer: "",
  manufacturerAddress: "",
  telephone: "",
  fax: "",
  email: "",
  contactPerson: "",
  modelVariant: "",
  baseFuelType: "",
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
  minW={0}
>
     <Input
  size="md"
  fontSize="15px"
  height="42px"
  type={type}
  value={value}
  onChange={(e) => onChange(e.target.value)}
  flex="1"
  minW={0}
/>s

      {/* Info Icon */}
      <Box
        width="24px"
        height="24px"
        minW="24px"
        borderRadius="50%"
        bg="#3375BA"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Info
          size={14}
          color="white"
          strokeWidth={3}
        />
      </Box>
    </HStack>
  );
};

const SelectWithInfo = ({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: {
    label: string;
    value: string;
  }[];
}) => {
  return (
    <HStack
  spacing={2}
  width="100%"
  align="center"
  minW={0}
>
      <Select
  size="md"
  height="42px"
  fontSize="15px"
  value={value}
  onChange={(e) => onChange(e.target.value)}
  placeholder="Select fuel type"
  flex="1"
  minW={0}
>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </Select>

      {/* Info Icon */}
      <Box
        width="24px"
        height="24px"
        minW="24px"
        borderRadius="50%"
        bg="#3375BA"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Info
          size={14}
          color="white"
          strokeWidth={3}
        />
      </Box>
    </HStack>
  );
};

const ManufacturerDetails = ({
  data,
  onSave,
}: ManufacturerDetailsProps) => {
  const [activeMD, setActiveMD] = useState(1);


  const [manufacturerData, setManufacturerData] =
    useState<Record<number, ManufacturerData>>(data);

  const currentData = manufacturerData[activeMD];

  const handleChange = (
    field: keyof ManufacturerData,
    value: string
  ) => {
    setManufacturerData((prev) => ({
      ...prev,
      [activeMD]: {
        ...prev[activeMD],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    console.log(`MD ${activeMD} data:`, currentData);

    // Send data to parent
    onSave(manufacturerData);
  };
  return (
    <Box
      width="100%"
      pl={{ base: 0, md: 0 }}
      pr={{ base: 3, md: 25 }}
    >
      {/* MD 1 / MD 2 / MD 3 */}
      <Box
        display="flex"
        justifyContent="flex-start"
        width="100%"
        mb={6}
      >
        <HStack spacing={2}>
          {[1, 2, 3].map((md) => (
            <Button
              key={md}
              size="md"
              borderRadius="4px"
              px={7}
              py={6}
              bg={activeMD === md ? "#3375BA" : "white"}
              color={activeMD === md ? "white" : "#4A5568"}
              border="1px solid #E2E8F0"
              fontSize="15px"
              fontWeight="600"
              isDisabled={md === 2 || md === 3}
              _hover={{
                bg:
                  activeMD === md
                    ? "#2865A5"
                    : "#F7FAFC",
              }}
              onClick={() => setActiveMD(md)}
            >
              MD {md}
            </Button>
          ))}
        </HStack>
      </Box>

      {/* Manufacturer Details Card */}
      <Box
        bg="white"
        borderRadius="8px"
        p={{ base: 5, md: 8 }}
        width="100%"
        minH="550px"
        boxShadow="0 1px 4px rgba(0,0,0,0.12)"
      >
        {/* Details content */}
        <Box
          width="100%"
          mx="0"
        >
          {/* Heading */}
          <Text
            fontSize={{ base: "18px", md: "21px" }}
            fontWeight="700"
            color="#17365D"
            mb={6}
            textAlign="left"
          >
            Manufacturer details — MD {activeMD}
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

            {/* Address */}
            <FormControl>
              <FormLabel
                fontSize="15px"
                fontWeight="500"
                color="#4A5568"
              >
                Name and address of the Manufacturer
              </FormLabel>

              <InputWithInfo
                value={currentData.manufacturerAddress}
                onChange={(value) =>
                  handleChange("manufacturerAddress", value)
                }
              />
            </FormControl>

            {/* Telephone */}
            <FormControl>
              <FormLabel
                fontSize="15px"
                fontWeight="500"
                color="#4A5568"
              >
                Telephone Number
              </FormLabel>

              <InputWithInfo
                value={currentData.telephone}
                onChange={(value) =>
                  handleChange("telephone", value)
                }
              />
            </FormControl>

            {/* Fax */}
            <FormControl>
              <FormLabel
                fontSize="15px"
                fontWeight="500"
                color="#4A5568"
              >
                Fax No
              </FormLabel>

              <InputWithInfo
                value={currentData.fax}
                onChange={(value) =>
                  handleChange("fax", value)
                }
              />
            </FormControl>

            {/* Email */}
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
              >
                Contact Person
              </FormLabel>

              <InputWithInfo
                value={currentData.contactPerson}
                onChange={(value) =>
                  handleChange("contactPerson", value)
                }
              />
            </FormControl>

            {/* Model Variant */}
            <FormControl>
              <FormLabel
                fontSize="15px"
                fontWeight="500"
                color="#4A5568"
              >
                Name of model and variant
              </FormLabel>

              <InputWithInfo
                value={currentData.modelVariant}
                onChange={(value) =>
                  handleChange("modelVariant", value)
                }
              />
            </FormControl>
            <FormControl>
  <FormLabel
    fontSize="15px"
    fontWeight="500"
    color="#4A5568"
  >
    Base fuel type used for vehicle Type approval
  </FormLabel>

  <SelectWithInfo
    value={currentData.baseFuelType}
    onChange={(value) =>
      handleChange("baseFuelType", value)
    }
    options={[
      {
        label: "Ethanol",
        value: "Ethanol",
      },
      {
        label: "Bio-diesel",
        value: "Bio-diesel",
      },
      {
        label: "Petrol",
        value: "Petrol",
      },
      {
        label: "Diesel",
        value: "Diesel",
      },
      {
        label: "CNG",
        value: "CNG",
      },
      {
        label: "LNG",
        value: "LNG",
      },
      {
        label: "LPG",
        value: "LPG",
      },
      {
        label: "Electric",
        value: "Electric",
      },
      {
        label: "Hydrogen",
        value: "Hydrogen",
      },
      {
        label: "Methanol",
        value: "Methanol",
      },
      {
        label: "Hybrid",
        value: "Hybrid",
      },
    ]}
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
                onClick={() => {
                  setManufacturerData((prev) => ({
                    ...prev,
                    [activeMD]: {
                      ...emptyManufacturerData,
                    },
                  }));
                }}
              >
                Cancel
              </Button>
            </HStack>
          </Box>
        </Box>

      </Box>
    </Box>
  );
};

export default ManufacturerDetails;