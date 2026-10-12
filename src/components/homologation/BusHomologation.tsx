import React, { FC, useEffect, useState } from "react";

import {
  Container,
  Button,
  Spacer,
  TableContainer,
  Box,
  Flex,
  Text,
  Show,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Image,
  HStack,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";

import { CopyIcon as CloneIcon } from "@chakra-ui/icons";
import { EditIcon, AddIcon, ArrowDownIcon } from "@chakra-ui/icons";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { Table, createColumn } from "react-chakra-pagination";

import Newhomologation from "./NewHomologation";

import {
  setRequestId,
  setHomologationDatas,
  setCategory,
} from "../../features/homologation/homologationSlice";

import { RootState } from "../../app/store";

import { Get, Post } from "../../utilities/service";

import axios from "axios";

import generateForm13 from "../../utilities/form13GenUtil";
import generateForm11 from "../../utilities/form11GenUtil";
import generateForm7 from "../../utilities/form7GenUtil";
import { generateForm1A } from "../../utilities/form1AGenUtil";
import generateForm8 from "../../utilities/form8GenUtil";

import ok from "../../assets/images/ok.png";
import user from "../../assets/images/socialIcons/user.png";
import phone from "../../assets/images/socialIcons/phone.png";
import mail from "../../assets/images/socialIcons/mail.png";
import chat from "../../assets/images/socialIcons/chat.png";
import cancel from "../../assets/images/cancel.png";


interface Homologation {
  vehicle_type?: {
    value?: string;
  };
  vehicle_category?: {
    value?: string;
  };
  fuel_type?: {
    value?: string;
  };
  request_number?: string;
  version?: number;
  _id: string;
}


interface PercentileData {
  [key: string]: {
    percentageFilled: number;
  };
}


interface TableData {
  homoID: React.ReactNode;
  RequestNumber: React.ReactNode;
  CompanyName: React.ReactNode;
  VehicleType: React.ReactNode;
  version: number;
  passRequestId: React.ReactNode;
}


const BusHomologation: FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();

  const { onClose } = useDisclosure();

  const [homologationData, setHomologationData] = useState<
    Homologation[]
  >([]);

  const [busData, setBusData] = useState<Homologation[]>([]);

  const [tableData, setTableData] = useState<TableData[]>([]);

  const [percentileData, setPercentileData] =
    useState<PercentileData>({});

  const [fileData, setFileData] = useState<any[]>([]);

  const [selectedRequestId, setSelectedRequestId] =
    useState<string>("");

  const [page, setPage] = useState(0);

  const [visible, setVisible] = useState<boolean>(false);

  const [socialIcon, setSocialIcon] =
    useState<boolean>(false);

  const token: string = useSelector(
    (state: RootState) =>
      state.loginCredential.token
  );

  const userData: any = useSelector(
    (state: RootState) =>
      state.loginCredential.userData
  );


  const config = {
    headers: {
      Authorization: "Bearer " + token,
    },
  };


  const searchApiURL = "homologationRequest/";

  const cloneApiURL =
    "homologationRequest/cloneHomologationRequest/";


  // ----------------------------------------------------
  // GET BUS HOMOLOGATION DATA
  // ----------------------------------------------------

  const getHomologationData = async (
  requestIdToSelect?: string
) => {
  try {
    console.log("API URL:", searchApiURL);

    const resp = await Get(
      searchApiURL,
      config
    );

    if (resp?.data?.status === "success") {
      const allData = resp?.data?.body || [];

      console.log(
        "All Homologation Data:",
        allData
      );

      const busDatas = allData.filter(
        (item: any) =>
          item?.vehicle_type?.value === "Bus"
      );

      console.log(
        "Bus Homologation Data:",
        busDatas
      );

      setHomologationData(allData);
      setBusData(busDatas);

      // Select newly created request if provided,
      // otherwise select the first Bus request
      if (busDatas.length > 0) {
        const requestToSelect =
          requestIdToSelect &&
          busDatas.some(
            (item: Homologation) =>
              item._id === requestIdToSelect
          )
            ? requestIdToSelect
            : busDatas[0]._id;

        setSelectedRequestId(
          requestToSelect
        );

        await getAllFormsData(
          requestToSelect
        );
      } else {
        setSelectedRequestId("");
        setPercentileData({});
        setFileData([]);
      }
    } else {
      setHomologationData([]);
      setBusData([]);
      setTableData([]);
      setPercentileData({});
      setFileData([]);
    }
  } catch (error) {
    console.error(
      "Error getting homologation data:",
      error
    );

    setBusData([]);
    setTableData([]);
    setPercentileData({});
    setFileData([]);
  }
};


  // ----------------------------------------------------
  // EDIT BUS REQUEST
  // ----------------------------------------------------

  const homologationRequestId = (
  requestId: string,
  homoData: any
) => {
  const vehicleType =
    homoData?.vehicle_type?.value;

  const requestType = {
    fuel_type: homoData?.fuel_type?.value,
    vehicle_type: vehicleType,
  };

  dispatch(
    setHomologationDatas(requestType)
  );

  dispatch(
    setCategory(
      homoData?.vehicle_category?.value
    )
  );

  dispatch(
    setRequestId(requestId)
  );

  // Open detailed homologation form
  navigate("/Homologation");
};


  // ----------------------------------------------------
  // CLONE REQUEST
  // ----------------------------------------------------

  const handleCloneRequest = async (
    sourceRequestId: string
  ) => {

    try {

      const res = await Post(
        `${cloneApiURL}${sourceRequestId}`,
        {},
        config
      );


      if (
        res?.data?.status === "success"
      ) {

        toast({
          duration: 3000,
          isClosable: true,
          position: "top",

          render: () => (
            <Box
              border="1px solid #7FBF28"
              backgroundColor="#7FBF28"
              color="#fff"
              p={3}
              borderRadius="md"
            >
              Cloned successfully
            </Box>
          ),
        });


        await getHomologationData();

      } else {

        const errorMessage =
          res?.data?.body ||
          res?.data?.message ||
          "Failed to clone";


        const isAlreadyCloned =
          errorMessage
            ?.toLowerCase()
            .includes(
              "already been cloned"
            );


        toast({
          title: "Clone failed",
          description: errorMessage,
          isClosable: true,
          duration: 4000,
          position: "top",

          containerStyle:
            isAlreadyCloned
              ? {
                  border:
                    "1px solid #3182CE",
                  backgroundColor:
                    "#EBF8FF",
                  color:
                    "#2B6CB0",
                  borderRadius:
                    "8px",
                }
              : {
                  border:
                    "1px solid #E53E3E",
                  backgroundColor:
                    "#FFF5F5",
                  color:
                    "#9B2C2C",
                  borderRadius:
                    "8px",
                },
        });
      }

    } catch (err: any) {

      const errorMessage =
        err?.response?.data?.body ||
        err?.response?.data?.message ||
        "Unexpected error";


      const isAlreadyCloned =
        errorMessage
          ?.toLowerCase()
          .includes(
            "already been cloned"
          );


      toast({
        title: "Clone failed",
        description: errorMessage,
        isClosable: true,
        duration: 4000,
        position: "top",

        containerStyle:
          isAlreadyCloned
            ? {
                border:
                  "1px solid #3182CE",
                backgroundColor:
                  "#EBF8FF",
                color:
                  "#2B6CB0",
                borderRadius:
                  "8px",
              }
            : {
                border:
                  "1px solid #E53E3E",
                backgroundColor:
                  "#FFF5F5",
                color:
                  "#9B2C2C",
                borderRadius:
                  "8px",
              },
      });
    }
  };


  // ----------------------------------------------------
  // GET FORMS DATA
  // ----------------------------------------------------

  const getAllFormsData = async (
    requestId: string
  ) => {

    if (!requestId) {
      return;
    }


    try {

      const formDataApiURL =
        `forms/${requestId}`;


      const resp = await Get(
        formDataApiURL,
        config
      );


      const body =
        resp?.data?.body || {};


      setPercentileData(body);


      const formsData: any[] = [];

      const fileUploadData =
        body?.fileUploadData &&
        Object.keys(body.fileUploadData);


      fileUploadData?.forEach(
        (formName: string) => {

          if (
            formName === "_id" ||
            formName === "footerData" ||
            formName ===
              "homologationRequest" ||
            formName === "createdAt" ||
            formName === "updatedAt" ||
            formName === "__v"
          ) {
            return;
          }


          const formData =
            Object.keys(
              body.fileUploadData[
                formName
              ] || {}
            );


          const fields: any[] = [];


          formData.forEach(
            (formValue: string) => {

              if (
                formValue === "_id"
              ) {
                return;
              }


              const properties =
                body
                  .fileUploadData[
                    formName
                  ]?.[formValue]
                  ?.properties;


              if (!properties) {
                return;
              }


              Object.keys(
                properties
              ).forEach(
                (fieldName) => {

                  fields.push({
                    lable:
                      properties[
                        fieldName
                      ]?.label,

                    file_name:
                      properties[
                        fieldName
                      ]?.file_name,
                  });

                }
              );

            }
          );


          formsData.push({
            formName,
            filseField: fields,
          });

        }
      );


      setFileData(formsData);

    } catch (error) {

      console.error(
        "Error getting forms data:",
        error
      );

      setPercentileData({});

      setFileData([]);
    }
  };


  // ----------------------------------------------------
  // CREATE BUS TABLE
  // ----------------------------------------------------

  const createBusTable = (
    data: Homologation[],
    activeRequestId: string
  ) => {

    const mappedData: TableData[] =
      data.map(
        (homoData: Homologation) => {

          const requestId =
            homoData._id;


          return {

            homoID: (
                  <Text
                      cursor="pointer"
                      onClick={() =>
                          selectBusRequest(requestId)
                      }
                  >

                <Text
                  as="span"
                  display="block"
                  w="24px"
                  h="24px"
                  borderRadius="24px"
                  bg={
                    activeRequestId ===
                    requestId
                      ? "#7FBD2C"
                      : "#ccc"
                  }
                />

              </Text>
            ),


            RequestNumber: (
              <Text
                cursor="pointer"
                onClick={() =>
                  getAllFormsData(
                    requestId
                  )
                }
              >
                {homoData?.request_number}
              </Text>
            ),


            CompanyName: (
              <Text
                cursor="pointer"
                onClick={() =>
                  getAllFormsData(
                    requestId
                  )
                }
              >
                {userData?.businessName}
              </Text>
            ),


            VehicleType: (
              <Text
                cursor="pointer"
                onClick={() =>
                  getAllFormsData(
                    requestId
                  )
                }
              >
                {homoData?.vehicle_type?.value}
              </Text>
            ),


            version:
              homoData?.version ?? 0,


            passRequestId: (
              <HStack spacing={3}>

                <EditIcon
                  cursor="pointer"
                  w={4}
                  h={4}
                  onClick={() =>
                    homologationRequestId(
                      requestId,
                      homoData
                    )
                  }
                />


                <CloneIcon
                  cursor="pointer"
                  w={4}
                  h={4}
                  onClick={() =>
                    handleCloneRequest(
                      requestId
                    )
                  }
                />

              </HStack>
            ),
          };
        }
      );


    setTableData(mappedData);
  };


  // ----------------------------------------------------
  // TABLE COLUMNS
  // ----------------------------------------------------

  const busColumnHelper = createColumnHelper<any>();


  const busColumns = [

    busColumnHelper.accessor(
      "homoID",
      {
        cell: (info: any) =>
          info.getValue(),

        header: "",
      }
    ),


    busColumnHelper.accessor(
      "RequestNumber",
      {
        cell: (info: any) =>
          info.getValue(),

        header:
          "Request Number",
      }
    ),


    busColumnHelper.accessor(
      "CompanyName",
      {
        cell: (info: any) =>
          info.getValue(),

        header:
          "Company Name",
      }
    ),


    busColumnHelper.accessor(
      "VehicleType",
      {
        cell: (info: any) =>
          info.getValue(),

        header:
          "Vehicle Type",
      }
    ),


    busColumnHelper.accessor(
      "version",
      {
        cell: (info: any) =>
          `v${info.getValue() ?? 0}`,

        header: "version",
      }
    ),


    busColumnHelper.accessor(
      "passRequestId",
      {
        cell: (info: any) =>
          info.getValue(),

        header: "Action",
      }
    ),
  ];


  // ----------------------------------------------------
  // DOWNLOAD FILE
  // ----------------------------------------------------

  const downloadFile = async (
    fileName: string
  ) => {

    if (!fileName) {
      return;
    }


    const downloadFileUrl =
      "files/download/" +
      fileName;


    try {

      const response =
        await axios.get(
          downloadFileUrl,
          {
            responseType:
              "blob",

            headers:
              config.headers,
          }
        );


      const blob =
        new Blob(
          [response.data],
          {
            type:
              "application/pdf",
          }
        );


      const url =
        window.URL.createObjectURL(
          blob
        );


      const link =
        document.createElement(
          "a"
        );


      link.href = url;

      link.setAttribute(
        "download",
        fileName
      );


      document.body.appendChild(
        link
      );

      link.click();


      URL.revokeObjectURL(url);

      document.body.removeChild(
        link
      );

    } catch (error) {

      console.error(
        "Error downloading file:",
        error
      );
    }
  };


  // ----------------------------------------------------
  // DOWNLOAD GENERATED DOCUMENT
  // ----------------------------------------------------

  const downloadDocument = (
    item: string
  ) => {

    if (
      item === "form13Data"
    ) {

      generateForm13(
        percentileData.form13Data,
        percentileData.fileUploadData
      );

    } else if (
      item === "form11Data"
    ) {

      generateForm11(
        percentileData.form11Data,
        percentileData.fileUploadData
      );

    } else if (
      item === "form7Data"
    ) {

      generateForm7(
        percentileData.form7Data,
        percentileData.fileUploadData
      );

    } else if (
      item === "form1AData"
    ) {

      generateForm1A(
        percentileData.form1AData,
        percentileData.fileUploadData
      );

    } else if (
      item === "form8Data"
    ) {

      generateForm8(
        percentileData.form8Data,
        percentileData.fileUploadData
      );
    }
  };


  // ----------------------------------------------------
  // SELECT BUS REQUEST
  // ----------------------------------------------------

  const selectBusRequest = async (
    requestId: string
  ) => {

    setSelectedRequestId(
      requestId
    );

    await getAllFormsData(
      requestId
    );

  };


  // ----------------------------------------------------
  // MODAL
  // ----------------------------------------------------

  const openAddRequest = () => {
    setVisible(true);
  };


  const closeModal = () => {
    setVisible(false);
  };


  const handleClose = () => {

    const dialog =
      document.querySelector(
        "dialog"
      ) as HTMLDialogElement | null;


    if (dialog) {
      dialog.showModal();
    }
  };


  const cancelClose = () => {

    const dialog =
      document.querySelector(
        "dialog"
      ) as HTMLDialogElement | null;


    if (dialog) {
      dialog.close();
    }
  };


  // ----------------------------------------------------
  // SOCIAL ICONS
  // ----------------------------------------------------

  const socialIcons = () => {

    setSocialIcon(
      (previous) =>
        !previous
    );
  };
  const handleRequestCreated = async (
  requestId: string
) => {
  setVisible(false);

  await getHomologationData(
    requestId
  );
};


  // ----------------------------------------------------
  // INITIAL LOAD
  // ----------------------------------------------------

  useEffect(() => {

    getHomologationData();

  }, []);


  // ----------------------------------------------------
  // UPDATE TABLE WHEN BUS DATA CHANGES
  // ----------------------------------------------------

  useEffect(() => {

    if (busData.length === 0) {

      setTableData([]);

      return;
    }


    createBusTable(
      busData,
      selectedRequestId ||
        busData[0]?._id
    );

  }, [
    busData,
    selectedRequestId,
    userData?.businessName,
  ]);


  // ----------------------------------------------------
  // RENDER
  // ----------------------------------------------------

  return (
    <>
      <Container
        maxW="1586px"
        p="50px"
        minH="70vh"
      >

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <Flex
          alignItems="center"
          mb="20px"
        >

          <Box
  display="inline-block"
  borderBottom="4px solid #7FBD2C"
  pb="6px"
>
  <Text
    fontSize="22px"
    fontWeight="800"
    color="#000"
  >
    BUS
  </Text>
</Box>


          <Spacer />


          <Button
            height="42px"
            maxWidth={[
              "90px",
              "185px",
            ]}
            bg="#7FBF28"
            color="#fff"
            fontWeight="800"
            maxW="175px"
            fontSize="14px"
            _hover={{
              bg: "#7FBF28",
            }}
            _focus={{
              bg: "#7FBF28",
            }}
            onClick={
              openAddRequest
            }
          >

            <Show
              breakpoint="(max-width: 767px)"
            >
              <AddIcon color="#fff" />
            </Show>


            <Show
              breakpoint="(min-width: 768px)"
            >
              Add New Request
            </Show>

          </Button>

        </Flex>


        {/* ================================================= */}
        {/* BUS TABLE */}
        {/* ================================================= */}

        <TableContainer
          className="table-container"
        >

          {busData.length > 0 ? (

            <Table
              colorScheme="blue"

              emptyData={{
                text:
                  "Nobody is registered here.",
              }}

              totalRegisters={
                busData.length
              }

              onPageChange={(
                newPage: number
              ) =>
                setPage(newPage)
              }

              columns={
                busColumns
              }

              data={
                tableData
              }
            />

          ) : (

            <Box
              textAlign="center"
              py="40px"
            >

              <Text
                fontSize="16px"
                color="#777"
              >
                No Bus requests found.
              </Text>

            </Box>
          )}


          {/* ================================================= */}
          {/* PERCENTAGE CARDS */}
          {/* ================================================= */}

          <Flex
            mt="100px"
            mb="50px"
            gap={14}
            p="30px 25px"
            overflow={[
              "scroll",
              "scroll",
              "visible",
            ]}
            flexWrap={[
              "nowrap",
              "nowrap",
              "wrap",
              "wrap",
            ]}
            justifyContent="flex-start"
            columnGap="15px"
          >

            {percentileData &&
              Object.keys(
                percentileData
              )
                .sort()
                .map(
                  (
                    item: string,
                    key: number
                  ) => {

                    if (
                      item ===
                      "fileUploadData"
                    ) {
                      return null;
                    }


                    const checkDownload =
                      process.env
                        .REACT_APP_CHECK_DOWNLOAD;


                    let percentageFilled =
                      Math.round(
                        percentileData[
                          item
                        ]?.percentageFilled ||
                          0
                      );


                    if (
                      checkDownload ===
                      "true"
                    ) {
                      percentageFilled =
                        100;
                    }


                    // -------------------------
                    // BUS FORM CALCULATIONS
                    // -------------------------

                    if (
                      item ===
                      "form1AData"
                    ) {

                      percentageFilled =
                        percentageFilled >=
                        89
                          ? 100
                          : Math.round(
                              (percentageFilled /
                                89) *
                                100
                            );
                    }


                    if (
                      item ===
                      "form7Data"
                    ) {

                      percentageFilled =
                        percentageFilled >=
                        78
                          ? 100
                          : Math.round(
                              (percentageFilled /
                                78) *
                                100
                            );
                    }


                    if (
                      item ===
                      "form8Data"
                    ) {

                      percentageFilled =
                        percentageFilled >=
                        84
                          ? 100
                          : Math.round(
                              (percentageFilled /
                                84) *
                                100
                            );
                    }


                    // -------------------------
                    // BAR CALCULATION
                    // -------------------------

                    let filledValue: any =
                      percentageFilled;

                    let integer = 0;

                    let decimal = 0;

                    const pushPercentageValue: any[] =
                      [];

                    const hundredPercentData =
                      [
                        10,
                        10,
                        10,
                        10,
                        10,
                        10,
                        10,
                        10,
                        10,
                        10,
                      ];

                    let getPercentageLength =
                      0;


                    if (
                      filledValue >=
                      10
                    ) {

                      filledValue =
                        Math.round(
                          Math.round(
                            (percentageFilled /
                              100) *
                              100
                          ) / 10
                        );


                      filledValue =
                        filledValue
                          .toString()
                          .split(".");


                      integer =
                        Number(
                          filledValue[0]
                        );


                      if (
                        Number(
                          filledValue[1]
                        ) > 0
                      ) {

                        decimal =
                          Number(
                            filledValue[1]
                          );
                      }

                    } else {

                      decimal =
                        filledValue;
                    }


                    const bgColor =
                      percentageFilled <
                        100 &&
                      percentageFilled >
                        1
                        ? "#05637D"
                        : percentageFilled >=
                          95
                        ? "#7FBD2C"
                        : "#E1E1E1";


                    for (
                      let i = 1;
                      i <= integer;
                      i++
                    ) {

                      pushPercentageValue.push(
                        {
                          integer: 10,
                        }
                      );
                    }


                    if (
                      decimal > 0
                    ) {

                      pushPercentageValue.push(
                        {
                          integer:
                            decimal,
                        }
                      );
                    }


                    return (
                      <Box
                        key={key}
                        position="relative"
                      >

                        <Text
                          fontSize="16px"
                          color="#000"
                          textAlign="center"
                          textTransform="capitalize"
                          fontFamily="Open Sans"
                          mb="10px"
                          fontWeight="700"
                        >
                          {item.replace(
                            "Data",
                            ""
                          )}
                        </Text>


                        <Text
                          fontSize="20px"
                          color="#000"
                          textAlign="center"
                          position="absolute"
                          top="74px"
                          left="40%"
                          zIndex="1"
                          fontWeight="700"
                        >
                          {
                            percentageFilled
                          } %
                        </Text>


                        <Box
                          bg="#D9D9D9"
                          borderRadius="10px"
                          w="210px"
                          h="103px"
                          p="10px"
                          display="flex"
                          position="relative"
                        >

                          {/* DOWNLOAD BUTTON */}

                          {(
                            percentageFilled >=
                              95 ||
                            (
                              percentageFilled >=
                              0 &&
                              checkDownload ===
                                "false"
                            )
                          ) && (

                            <Box
                              bg="#EE7623"
                              w="42px"
                              h="42px"
                              borderRadius="45px"
                              position="absolute"
                              top="-17px"
                              left="-11px"
                              border="6px solid #fff"
                              textAlign="center"
                              cursor="pointer"
                            >

                              <ArrowDownIcon
                                onClick={() =>
                                  downloadDocument(
                                    item
                                  )
                                }
                                mt="5px"
                                boxSize={4}
                                color="#fff"
                              />

                            </Box>
                          )}


                          {/* FILLED BAR */}

                          {pushPercentageValue.map(
                            (
                              value: any,
                              index: number
                            ) => {

                              getPercentageLength =
                                pushPercentageValue.length;


                              if (
                                value.integer <
                                5
                              ) {
                                return null;
                              }


                              return (
                                <Box
                                  key={
                                    index
                                  }
                                  bg={
                                    bgColor
                                  }
                                  w="10%"
                                  h={
                                    Math.round(
                                      value.integer
                                    ) >=
                                    5
                                      ? "85px"
                                      : `${value.integer * 8.5}px`
                                  }
                                  ml="3px"
                                  mr="3px"
                                />
                              );
                            }
                          )}


                          {/* EMPTY BAR */}

                          {hundredPercentData.map(
                            (
                              _value,
                              index
                            ) => {

                              return (
                                index >
                                  getPercentageLength -
                                    1 && (
                                  <Box
                                    key={
                                      index
                                    }
                                    bg="#E1E1E1"
                                    w="10%"
                                    h="85px"
                                    m="0px 3px"
                                  />
                                )
                              );
                            }
                          )}

                        </Box>


                        {/* ================================================= */}
                        {/* UPLOADED DOCUMENTS */}
                        {/* ================================================= */}

                        <Text
                          fontSize="16px"
                          mt="20px"
                          color="#000"
                          textAlign="center"
                          fontFamily="Open Sans"
                          fontWeight="700"
                        >
                          Uploaded Design Docs
                        </Text>


                        {fileData
                          .sort()
                          .map(
                            (
                              formsdata: any,
                              formIndex: number
                            ) => {

                              if (
                                formsdata.formName !==
                                item
                              ) {
                                return null;
                              }


                              return (
                                <React.Fragment
                                  key={
                                    formIndex
                                  }
                                >

                                  {(
                                    formsdata
                                      .filseField ||
                                    []
                                  ).map(
                                    (
                                      formValue: any,
                                      fieldIndex: number
                                    ) => {

                                      return (
                                        <React.Fragment
                                          key={
                                            fieldIndex
                                          }
                                        >

                                          {formValue.file_name !==
                                          "" ? (

                                            <Text
                                              display="flex"
                                              flexWrap="nowrap"
                                              alignItems="center"
                                              gap="5px"
                                              fontSize="12px"
                                              justifyContent="center"
                                              pb="5px"
                                              pt="5px"
                                              cursor="pointer"
                                              onClick={() =>
                                                downloadFile(
                                                  formValue.file_name
                                                )
                                              }
                                            >

                                              <Image
                                                src={
                                                  ok
                                                }
                                                alt="uploaded"
                                                h="13px"
                                                w="13px"
                                              />


                                              <Text
                                                as="span"
                                                color="#2373C2"
                                                className="filename"
                                                display="block"
                                                fontFamily="sans-serif"
                                                title={
                                                  formValue.lable
                                                }
                                              >
                                                {
                                                  formValue.lable
                                                }
                                              </Text>

                                            </Text>

                                          ) : (

                                            <Text
                                              display="flex"
                                              flexWrap="nowrap"
                                              alignItems="center"
                                              gap="5px"
                                              fontSize="12px"
                                              justifyContent="center"
                                              pb="5px"
                                              pt="5px"
                                            >

                                              <Image
                                                src={
                                                  cancel
                                                }
                                                alt="not uploaded"
                                                h="13px"
                                                w="13px"
                                              />


                                              <Text
                                                as="span"
                                                color="#2373C2"
                                                className="filename"
                                                display="block"
                                                fontFamily="sans-serif"
                                                title={
                                                  formValue.lable
                                                }
                                              >
                                                {
                                                  formValue.lable
                                                }
                                              </Text>

                                            </Text>
                                          )}

                                        </React.Fragment>
                                      );
                                    }
                                  )}

                                </React.Fragment>
                              );
                            }
                          )}

                      </Box>
                    );
                  }
                )}

          </Flex>

        </TableContainer>


        {/* ================================================= */}
        {/* ADD NEW REQUEST MODAL */}
        {/* ================================================= */}

        <Modal
          isOpen={visible}
          onClose={onClose}
          size="6xl"
          closeOnOverlayClick={false}
        >

          <ModalOverlay
            onClick={() =>
              handleClose()
            }
          />


          <ModalContent>

            <ModalHeader
              bg="#05637D"
              fontWeight="700"
              fontSize="18px"
              textAlign="center"
              color="#fff"
            >
              Homologation Registration Request
            </ModalHeader>


            <ModalCloseButton
              color="#fff"
              onClick={() =>
                handleClose()
              }
            />


            <ModalBody
              bg="#F1F1F1"
              p={[
                "5px",
                "45px",
              ]}
            >

             <Newhomologation
  onClose={handleClose}
  onSuccess={handleRequestCreated}
/>

            </ModalBody>


            <dialog>

              <Text
                color="red"
                fontSize="18px"
              >
                Are you sure you want to close?
              </Text>


              <Text
                color="red"
                fontSize="18px"
                marginBottom="20px"
              >
                You will lose all the filled data
              </Text>


              <Button
                marginRight="15px"
                colorScheme="red"
                variant="solid"
                onClick={
                  closeModal
                }
              >
                Yes
              </Button>


              <Button
                colorScheme="teal"
                variant="solid"
                onClick={
                  cancelClose
                }
              >
                No
              </Button>

            </dialog>

          </ModalContent>

        </Modal>


        {/* ================================================= */}
        {/* SOCIAL ICONS */}
        {/* ================================================= */}

        <Box>

          <Box
            className="userIcon"
            onClick={
              socialIcons
            }
          >

            <Image
              src={user}
              alt="userIcon"
              w="44px"
              h="44px"
            />

          </Box>


          <Box
            className={
              socialIcon
                ? "mailIcon"
                : "mailIcon hide-the-icon"
            }
          >

            <a href="mailto:support@auto-canon.in">

              <Image
                src={mail}
                alt="mailIcon"
                w="36px"
                h="36px"
              />

            </a>

          </Box>


          <Box
            className={
              socialIcon
                ? "phoneIcon"
                : "phoneIcon hide-the-icon"
            }
          >

            <a href="tel:8312950473">

              <Image
                src={phone}
                alt="phoneIcon"
                w="36px"
                h="36px"
              />

            </a>

          </Box>


          <Box
            className={
              socialIcon
                ? "chatIcon"
                : "chatIcon hide-the-icon"
            }
          >

            <Image
              src={chat}
              alt="chatIcon"
              w="36px"
              h="36px"
            />

          </Box>

        </Box>

      </Container>
    </>
  );
};


export default BusHomologation;