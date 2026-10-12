import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Text,
  Input,
  HStack,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  VStack,
  Icon,
} from "@chakra-ui/react";
import { CheckCircle,Info } from "lucide-react";
import { BusFormData } from "../formData/BusFormData";

type TabType =
  | "Tyre"
  | "Wheel Rim"
  | "Wheel Nut"
  | "TPMS";

const tabNames: TabType[] = [
  "Tyre",
  "Wheel Rim",
  "Wheel Nut",
  "TPMS",
];

const tabKeyMap: Record<
  TabType,
  keyof BusFormData["tyreAndWheelRim"]
> = {
  Tyre: "tyre",
  "Wheel Rim": "wheelRim",
  "Wheel Nut": "wheelNut",
  TPMS: "tpms",
};

type BusTyreWheelPageProps = {
  data: BusFormData["tyreAndWheelRim"];

  onSave: (
    data: BusFormData["tyreAndWheelRim"]
  ) => void;
};

const InputWithInfo = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  return (
    <HStack
      spacing={2}
      width="100%"
      align="center"
      minW={0}
      height="42px"
    >
      <Input
        height="42px"
        minH="42px"
        fontSize="15px"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        flex="1"
        minW={0}
      />

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

type DetailsFormProps = {
  tabName: TabType;
  formData: Record<string, string>;
  onInputChange: (
    field: string,
    value: string
  ) => void;
  onSave: () => void;
  onCancel: () => void;
};


const DetailsForm: React.FC<DetailsFormProps> = ({
  tabName,
  formData,
  onInputChange,
  onSave,
  onCancel,
}) => {
  const tabFields: Record<TabType, string[]> = {
  /* ================= TYRE ================= */

  Tyre: [
    "Make",
    "Brand(s) name(s) and/or Trade description(s)",
    "Tyres - Rolling Sound Emissions, Adhesion on Wet Surfaces, Rolling Resistance as per AIS:142 Compliance (Yes / No)",
    "Tyre rolling Resistance",

    "Tyre Class (C1 / C2 / C3) - Front",
    "Tyre Class (C1 / C2 / C3) - Rear",

    "Category of use - Front (Normal / Special / Snow / Severe Snow)",
    "Category of use - Rear (Normal / Special / Snow / Severe Snow)",

    "Tyre Tread Pattern along with Drawing",

    "Identification: TAC No. / BIS License No. / E-Marking",

    "Front - No. and arrangement of wheels",
    "Rear - No. and arrangement of wheels",
    "Spare wheel - No. and arrangement of wheels",
    "Others - No. and arrangement of wheels",

    "Front wheel - Tyre type",
    "Rear wheel - Tyre type",
    "Spare wheel - Tyre type",
    "Other - Tyre type",

    "Static rolling radius",
    "Dynamic rolling radius",

    "Inflation pressure - Unladen Front",
    "Inflation pressure - Unladen Rear",
    "Inflation pressure - Unladen Other",

    "Inflation pressure - Laden Front",
    "Inflation pressure - Laden Rear",
    "Inflation pressure - Laden Other",
  ],

  /* ================= WHEEL RIM ================= */

  "Wheel Rim": [
    "Front - Make",
    "Front - BIS license Number",
    "Front - Part number of wheelrim supplier",
    "Front - Size",
    "Front - Type (Alloy / Sheet metal / spoke)",

    "Rear - Make",
    "Rear - BIS license Number",
    "Rear - Part number of wheelrim supplier",
    "Rear - Size",
    "Rear - Type (Alloy / Sheet metal / spoke)",

    "Spare Wheel Rim - Make",
    "Spare Wheel Rim - BIS license Number",
    "Spare Wheel Rim - Part number of wheelrim supplier",
    "Spare Wheel Rim - Size",
    "Spare Wheel Rim - Type (Alloy / Sheet metal / spoke)",

    "Spare wheel / Temporary use spare wheel / Tyre Repair Kit / RFT - as per AIS-110",

    "Speed index - Front",
    "Speed index - Rear",
    "Speed index - Spare wheel",

    "Load index / Load rating - Front",
    "Load index / Load rating - Rear",
    "Load index / Load rating - Spare wheel",

    "Tyre Type (Radial / Cross / Tube / Tubeless) - Front",
    "Tyre Type (Radial / Cross / Tube / Tubeless) - Rear",
    "Tyre Type (Radial / Cross / Tube / Tubeless) - Spare wheel",
  ],

  /* ================= WHEEL NUT ================= */

  "Wheel Nut": [
    "Wheel Nut(s) / Bolt(s) - Make",
    "Wheel Nut(s) / Bolt(s) - Size",
    "Wheel Nut(s) / Bolt(s) - Nos. per wheel",
    "Wheel Nut(s) / Bolt(s) - Tightening torque (recommended by the vehicle Manufacturer)",
    "Wheel Nut(s) / Bolt(s) - Detailed dimensional drawing along with material specifications",

    "Wheel cap (if provided) - Detailed dimensional drawing along with press fit diameter as applicable",

    "Hub cap - Make",
    "Hub cap - Method of fitment (Press / bolted / others)",
    "Hub cap - Brief dimensional drawing along with pressfit diameter as applicable",
  ],

  /* ================= TPMS ================= */

  TPMS: [
    "Make (For direct TPMS)",

    "Brief Description of the system (For indirect TPMS)",

    "Sensor Part No. (For direct TPMS)",

    "Temporary Spare Wheel / RFT - as per AIS-110 (If Provided)",

    "Type as per AIS-110",

    "Make",

    "Size",

    "Load and speed rating",

    "Recommended max speed in Unladen condition",

    "Recommended max speed Laden condition",
  ],
};

  const fields = tabFields[tabName];

  return (
    <Box
      bg="white"
      borderRadius="8px"
      p={{ base: 5, md: 8 }}
      width="100%"
      minH="500px"
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
        {tabName} Details
      </Text>

      {/* Divider */}

      <Box
        borderTop="1px solid #E5E7EB"
        mb={7}
      />

      {/* Form */}

      <Box
  display="grid"
  gridTemplateColumns={{
    base: "1fr",
    md: "repeat(2, minmax(0, 1fr))",
    lg: "repeat(3, minmax(0, 1fr))",
  }}
   columnGap={{ base: 4, md: 6, lg: 8 }}
  rowGap={7}
>
        {fields.map((field) => {
          const fieldKey = field
            .replace(/\s+/g, "")
            .replace(/^(.)/, (match) =>
              match.toLowerCase()
            );

          return (
           <FormControl
  key={field}
  display="flex"
  flexDirection="column"
>
  <FormLabel
    fontSize="15px"
    fontWeight="500"
    color="#4A5568"
    lineHeight="22px"
    height="63px"
    mb={2}
    display="flex"
    alignItems="flex-start"
  >
    {field}
  </FormLabel>

  <InputWithInfo
    value={formData[fieldKey] || ""}
    onChange={(value) =>
      onInputChange(fieldKey, value)
    }
  />
</FormControl>
          );
        })}
      </Box>

      {/* Bottom Buttons */}

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
            onClick={onSave}
          >
            Submit
          </Button>

          <Button
            variant="outline"
            size="md"
            px={7}
            fontSize="15px"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </HStack>
      </Box>
    </Box>
  );
};

const BusTyreWheelPage: React.FC<
  BusTyreWheelPageProps
> = ({ data, onSave }) => {
  const [activeTab, setActiveTab] =
    useState(0);

  const [formData, setFormData] =
    useState<
      BusFormData["tyreAndWheelRim"]
    >(data);

  const {
    isOpen: isSuccessOpen,
    onOpen: onSuccessOpen,
    onClose: onSuccessClose,
  } = useDisclosure();

  const currentTab =
    tabNames[activeTab];

  const currentKey =
    tabKeyMap[currentTab];

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    setFormData(data);
  }, [data]);

  /* ================= INPUT CHANGE ================= */

  const handleInputChange = (
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [currentKey]: {
        ...prev[currentKey],
        [field]: value,
      },
    }));
  };

  /* ================= SAVE ================= */

  const handleSave = () => {
    console.log(
      "Tyre and Wheel Rim Data:",
      formData
    );

    onSave(formData);

    onSuccessOpen();
  };

  /* ================= CANCEL ================= */

  const handleCancel = () => {
    setFormData((prev) => ({
      ...prev,
      [currentKey]: {
        ...data[currentKey],
      },
    }));
  };

  return (
    <Box width="100%">
      {/* ================= TABS ================= */}

      <Tabs
        index={activeTab}
        onChange={(index) =>
          setActiveTab(index)
        }
      >
        <TabList
          mb={0}
          borderBottom="none"
        >
          {tabNames.map(
            (tab, index) => (
              <Tab
                key={tab}
                px={7}
                py={3}
                mr={2}
                borderRadius="4px 4px 0 0"
                border="1px solid #E2E8F0"
                bg={
                  activeTab === index
                    ? "#3375BA"
                    : "white"
                }
                color={
                  activeTab === index
                    ? "white"
                    : "#4A5568"
                }
                fontSize="15px"
                fontWeight="600"
                _selected={{
                  bg: "#3375BA",
                  color: "white",
                  borderColor:
                    "#3375BA",
                }}
                _hover={{
                  bg:
                    activeTab === index
                      ? "#2865A5"
                      : "#F7FAFC",
                }}
              >
                {tab}
              </Tab>
            )
          )}
        </TabList>

        {/* ================= TAB CONTENT ================= */}

        <TabPanels>
          {tabNames.map((tab) => (
            <TabPanel
              key={tab}
              px={0}
              pt={0}
            >
              
              <DetailsForm
                tabName={tab}
                formData={
                  formData[
                    tabKeyMap[tab]
                  ]
                }
                onInputChange={
                  handleInputChange
                }
                onSave={handleSave}
                onCancel={
                  handleCancel
                }
              />
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>

      
    </Box>
  );
};

export default BusTyreWheelPage;