import { FC } from 'react';
import {
    Container,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
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
    useDisclosure,
    Image,
    HStack
} from '@chakra-ui/react';
import { CopyIcon as CloneIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';

import { EditIcon, AddIcon, ArrowDownIcon } from '@chakra-ui/icons'
import Newhomologation from "../homologation/NewHomologation";
import { setRequestId, setHomologationDatas, setCategory } from '../../features/homologation/homologationSlice';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from "../../app/store";
import { Get,Post } from "../../utilities/service";
import { useState, useEffect } from "react";
import { Table, createColumn } from "react-chakra-pagination";
import { typeOfVehicle } from "../../constant/homologation";
import generateForm13 from '../../utilities/form13GenUtil';
import generateForm11 from '../../utilities/form11GenUtil';
import generateForm7 from '../../utilities/form7GenUtil';
// import generateForm1A from '../../utilities/form1AGenUtil';
import { generateForm1A }from '../../utilities/form1AGenUtil';
import generateForm8 from '../../utilities/form8GenUtil';
import ok from '../../assets/images/ok.png';
import user from '../../assets/images/socialIcons/user.png'
import phone from '../../assets/images/socialIcons/phone.png'
import mail from '../../assets/images/socialIcons/mail.png'
import chat from '../../assets/images/socialIcons/chat.png'
import cancel from '../../assets/images/cancel.png';
import { Id } from '@reduxjs/toolkit/dist/tsHelpers';
import axios from 'axios';
import { useToast } from '@chakra-ui/react';


interface homologation {
    vehicle_type: string;
    _id: string;
}
interface PercentileData {
    [key: string]: {
        percentageFilled: number;
        // other properties
    };
}
let twoWheeler: any;
let twoColumnHelper: any;
let twoColumns: any;

let threeWheeler: any;
let threeColumnHelper: any;
let threeColumns: any;
let twoWheelerData: any = [];
let threeWheelerData: any = [];
// let busData:any=[];
// let bus: any;
// let busColumnHelper: any;
// let busColumns: any;
let circlestate: string = '';

const Dashboard: FC = () => {

    const { isOpen, onOpen, onClose } = useDisclosure();
    const navigate = useNavigate();
    const [homologationData, setHomologationData] = useState<homologation[]>([]);
    const [PercentileData, setPercentileData] = useState<PercentileData>({});
    const [typeOfVehicleSelected, setTypeOfVehicleSelected] = useState([]);
    const [fileData, setFileData] = useState([]);
    const token: string = useSelector((state: RootState) => state.loginCredential.token);
    const userData: any = useSelector((state: RootState) => state.loginCredential.userData);
    const dispatch = useDispatch()
    const [page, setPage] = useState(0);
    const [threeCirclestate, setThreeCirclestate] = useState<string>("");
    const [tabIndex, setTabIndex] = useState(0);
    const [visible, setVisible] = useState<boolean>(false);
    const [socialIcon, setSocialIcon] = useState<boolean>(false);
    const toast = useToast();
    let res = [];
    let arr: any = [];
    let removedDuplicateValue = []
    const config = {
        headers: {
            Authorization: 'Bearer ' + token
        }
    }

    const searchApiURL = "homologationRequest/";


    const getHomologationData = async () => {
        console.log("API URL:", searchApiURL);
        await Get(searchApiURL, config)
            .then(resp => {
                if (resp.data.status === 'success') {
                     console.log("API Response:", resp.data.body);

    console.log(
        "Vehicle Types:",
        resp.data.body.map((item: any) => item.vehicle_type.value)
    );
                    setHomologationData(resp.data.body);
                    // console.log('resp.data.bodyresp.data.bodyresp.data.body', resp.data.body)

                    res = resp.data.body.filter((el: any) => {
                        return typeOfVehicle.find(element => {
                            return element.value === el.vehicle_type.value ? arr.push(el.vehicle_type.value) : '';
                        });
                    });
                    removedDuplicateValue = arr.filter((c: string, index: number) => {
                        return arr.indexOf(c) === index;
                    });
                    setTypeOfVehicleSelected(removedDuplicateValue);
                    console.log("Available Vehicle Types:", removedDuplicateValue);
                    const twoWheelerDatas = resp.data.body.filter((item: any) => item.vehicle_type.value === '2-Wheeler');
                    const threeWheelerDatas = resp.data.body.filter((item: any) => item.vehicle_type.value === '3-Wheeler');
                    // const busDatas = resp.data.body.filter((item:any) => item.vehicle_type.value === "Bus"); 
                    // console.log("Bus Data:", busDatas);
                    twoWheelerData = twoWheelerDatas
                    threeWheelerData = threeWheelerDatas
                    // busData = busDatas;
                    dataPagination();

                }
                if (resp.data.status === 'failure') {
                    // console.log(resp.data.body.split('key: '));                    
                }

            })
            .catch((error) => {
                // console.log(error)
            })
    };
    const homologationRequestId = (
  requestId: string,
  homoData: any
) => {
  const vehicleType = homoData.vehicle_type.value;

  const requestType = {
    fuel_type: homoData.fuel_type.value,
    vehicle_type: vehicleType
  };

  dispatch(setHomologationDatas(requestType));
  dispatch(setCategory(homoData.vehicle_category.value));
  dispatch(setRequestId(requestId));

  if (vehicleType === "Bus") {
    navigate("/BusHomologation");
  } else {
    navigate("/Homologation");
  }
};
    const cloneApiURL = "homologationRequest/cloneHomologationRequest/";
    const handleCloneRequest = async (sourceRequestId: string) => {
        try {
          const res = await Post(`${cloneApiURL}${sourceRequestId}`, {}, config);
      
          if (res?.data?.status === "success") {
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
      
            getHomologationData();
          } else {
            const errorMessage =
              res?.data?.body || res?.data?.message || "Failed to clone";
      
            const isAlreadyCloned = errorMessage
              ?.toLowerCase()
              .includes("already been cloned");
      
            toast({
              title: "Clone failed",
              description: errorMessage,
            //   status: "error",
              isClosable: true,
              duration: 4000,
              position: "top",
              containerStyle: isAlreadyCloned
                ? {
                    border: "1px solid #3182CE", // Blue
                    backgroundColor: "#EBF8FF",
                    color: "#2B6CB0",
                    borderRadius: "8px",
                  }
                : {
                    border: "1px solid #E53E3E", // Red
                    backgroundColor: "#FFF5F5",
                    color: "#9B2C2C",
                    borderRadius: "8px",
                  },
            });
          }
        } catch (err: any) {
          const errorMessage =
            err?.response?.data?.body ||
            err?.response?.data?.message ||
            "Unexpected error";
      
          const isAlreadyCloned = errorMessage
            ?.toLowerCase()
            .includes("already been cloned");
      
          toast({
            title: "Clone failed",
            description: errorMessage,
            // status: "error",
            isClosable: true,
            duration: 4000,
            position: "top",
            containerStyle: isAlreadyCloned
              ? {
                  border: "1px solid #3182CE",
                  backgroundColor: "#EBF8FF",
                  color: "#2B6CB0",
                  borderRadius: "8px",
                }
              : {
                  border: "1px solid #E53E3E",
                  backgroundColor: "#FFF5F5",
                  color: "#9B2C2C",
                  borderRadius: "8px",
                },
          });
        }
      };

    const getAllFormsData = async (requestId: string) => {
        const formDataApiURL = `${'forms/'}${requestId}`;


        await Get(formDataApiURL, config)
            .then(resp => {
                setPercentileData(resp?.data?.body);
                let filseField: any = [];
                let formsData: any = [];


                let fileUploadData = resp?.data?.body.fileUploadData && Object.keys(resp?.data?.body.fileUploadData)
                fileUploadData && fileUploadData.forEach(function (allDatavalue: any, formKey: any) {
                    if (allDatavalue !== '_id' && allDatavalue !== 'footerData' && allDatavalue !== 'homologationRequest' && allDatavalue !== 'createdAt' && allDatavalue !== 'updatedAt' && allDatavalue !== '__v') {
                        let formData = Object.keys(resp.data.body.fileUploadData[allDatavalue]);
                        filseField = [];
                        formData.forEach(function (formValue: any, formKey: any) {
                            if (formValue !== '_id') {
                                let formFeild = Object.keys(resp.data.body.fileUploadData[allDatavalue][formValue].properties);
                                formFeild.forEach(function (val: any, formKey: any) {
                                    filseField.push(
                                        {
                                            'lable': resp.data.body.fileUploadData[allDatavalue][formValue].properties[val].label,
                                            'file_name': resp.data.body.fileUploadData[allDatavalue][formValue].properties[val].file_name
                                        }
                                    )
                                })
                            }
                        })
                        formsData.push(
                            {
                                'formName': allDatavalue,
                                'filseField': filseField
                            }
                        );


                    }
                })

                // console.log("formsData", formsData)
                setFileData(formsData)

            });
        circlestate = requestId;

    }
    const resetPercentageData = () => {
        setPercentileData({})
        getAllFormsData(threeCirclestate);
        dataPagination(threeCirclestate)
    }

    const downloadFile = async (fileName: any) => {
        const downloadFileUrl = "files/download/" + fileName;
        try {
            const response = await axios.get(downloadFileUrl, {
                responseType: 'blob', // Important to handle binary data
                headers: config.headers  // Pass any necessary headers
            });

            // console.log(response.data); // Inspect the response data

            // Create a Blob from the response data
            const blob = new Blob([response.data], { type: 'application/pdf' });

            // Create a URL for the Blob
            const url = window.URL.createObjectURL(blob);

            // Create a temporary anchor element
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);

            // Append the anchor to the body and click it to trigger the download
            document.body.appendChild(link);
            link.click();

            // Clean up
            URL.revokeObjectURL(url);
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading the file:', error);
        }
    };



    const downloadDocument = (item: any) => {

        if (item === "form13Data") {
            generateForm13(PercentileData.form13Data, PercentileData.fileUploadData);

        }
        else if (item === "form11Data") {
            generateForm11(PercentileData.form11Data, PercentileData.fileUploadData);
        }
        else if (item === "form7Data") {
            generateForm7(PercentileData.form7Data, PercentileData.fileUploadData);
        }
        else if (item === "form1AData") {
            generateForm1A(PercentileData.form1AData, PercentileData.fileUploadData);
        }
        else if (item === "form8Data") {
            generateForm8(PercentileData.form8Data, PercentileData.fileUploadData);
        }
    }

    const dataPagination = (circlestates?: any) => {

        let twoWheelerRquestId: string = '';
        // circlestates ? twoWheelerRquestId = circlestates : twoWheelerData.filter((item: any, key: number) => key === 0 ? twoWheelerRquestId = item._id : null)
        // Determine the two-wheeler request ID
        if (circlestates && twoWheelerData.some((item: any) => item._id === circlestates)) {
            twoWheelerRquestId = circlestates;
        } else {
            // If circlestate is not provided or invalid, set it to the first entry in two-wheeler data
            twoWheelerRquestId = twoWheelerData.length > 0 ? twoWheelerData[0]._id : null;
        }

        twoWheeler = twoWheelerData.map((homoData: any) => ({
            homoID: (
                <Text onClick={() => getAllFormsData(homoData._id)}>
                    {twoWheelerRquestId === homoData._id || circlestate === homoData._id ?
                        <Text as={'span'} display={'block'} w={"24px"} h={"24px"} bg={"#7FBD2C"} borderRadius={"24px"}></Text> :
                        <Text as={'span'} display={'block'} w={"24px"} h={"24px"} bg={"#ccc"} borderRadius={"24px"}></Text>}
                </Text>

            ),
            RequestNumber: (
                <Text onClick={() => getAllFormsData(homoData._id)}>
                    {homoData.request_number}
                </Text>

            ),
            CompanyName: (
                <Text onClick={() => getAllFormsData(homoData._id)}>
                    {userData.businessName}
                </Text>

            ),
            VehicleType: (
                <Text onClick={() => getAllFormsData(homoData._id)}>
                    {homoData.vehicle_type.value}
                </Text>

            ),
            version: homoData.version ?? 0,
            // passRequestId: (
            //     <Text>
            //         <EditIcon cursor={'pointer'} w={4} h={4} onClick={() => homologationRequestId(homoData._id, homoData)} />
            //     </Text>

            // ),
            passRequestId: (
                <HStack spacing={3}>
                  <EditIcon 
                    cursor="pointer" 
                    w={4} 
                    h={4} 
                    onClick={() => homologationRequestId(homoData._id, homoData)} 
                  />
                  <CloneIcon 
                    cursor="pointer" 
                    w={4} 
                    h={4} 
                    onClick={() => handleCloneRequest(homoData._id)} 
                  />
                </HStack>
              ),
        }));

        // Need pass type of `tableDate` for ts autocomplete
        twoColumnHelper = createColumn<typeof twoWheeler[0]>();

        twoColumns = [
            twoColumnHelper.accessor("homoID", {
                cell: (info: any) => info.getValue(),
                header: ""
            }),
            twoColumnHelper.accessor("RequestNumber", {
                cell: (info: any) => info.getValue(),
                header: "Request Number"
            }),
            twoColumnHelper.accessor("CompanyName", {
                cell: (info: any) => info.getValue(),
                header: "Company Name"
            }),
            twoColumnHelper.accessor("VehicleType", {
                cell: (info: any) => info.getValue(),
                header: "Vehicle Type"
            }),
            twoColumnHelper.accessor("version", {
                cell: (info: any) => `v${info.getValue() ?? 0}`,
                header: "version"
              }),
            twoColumnHelper.accessor("passRequestId", {
                cell: (info: any) => info.getValue(),
                header: "Action"
            })
        ];

        // three wheeler pagination starts
        let threeWheelerRquestId: string = '';
        // circlestates ? threeWheelerRquestId = circlestates : threeWheelerData.filter((item: any, key: number) => key === 0 ? threeWheelerRquestId = item._id : null)
        // Determine the three-wheeler request ID
        if (circlestates && threeWheelerData.some((item: any) => item._id === circlestates)) {
            threeWheelerRquestId = circlestates;
        } else {
            // If circlestate is not provided or invalid, set it to the first entry in three-wheeler data
            threeWheelerRquestId = threeWheelerData.length > 0 ? threeWheelerData[0]._id : null;
        }
        threeWheeler = threeWheelerData.map((homoData: any) => ({
            homoID: (
                <Text onClick={() => getAllFormsData(homoData._id)}>
                    {threeWheelerRquestId === homoData._id || circlestate === homoData._id ?
                        <Text as={'span'} display={'block'} w={"24px"} h={"24px"} bg={"#7FBD2C"} borderRadius={"24px"}></Text> :
                        <Text as={'span'} display={'block'} w={"24px"} h={"24px"} bg={"#ccc"} borderRadius={"24px"}></Text>}
                </Text>

            ),
            RequestNumber: (
                <Text onClick={() => getAllFormsData(homoData._id)}>
                    {homoData.request_number}
                </Text>

            ),
            CompanyName: (
                <Text onClick={() => getAllFormsData(homoData._id)}>
                    {userData.businessName}
                </Text>

            ),
            VehicleType: (
                <Text onClick={() => getAllFormsData(homoData._id)}>
                    {homoData.vehicle_type.value}
                </Text>

            ),
            version: homoData.version ?? 0,
            // passRequestId: (
            //     <Text>
            //         <EditIcon cursor={'pointer'} w={4} h={4} onClick={() => homologationRequestId(homoData._id, homoData)} />
            //     </Text>

            // ),
            passRequestId: (
                <HStack spacing={3}>
                  <EditIcon 
                    cursor="pointer" 
                    w={4} 
                    h={4} 
                    onClick={() => homologationRequestId(homoData._id, homoData)} 
                  />
                  <CloneIcon 
                    cursor="pointer" 
                    w={4} 
                    h={4} 
                    onClick={() => handleCloneRequest(homoData._id)} 
                  />
                </HStack>
              ),
        }));

        // Need pass type of `tableDate` for ts autocomplete
        threeColumnHelper = createColumn<typeof threeWheeler[0]>();

        threeColumns = [
            threeColumnHelper.accessor("homoID", {
                cell: (info: any) => info.getValue(),
                header: ""
            }),
            threeColumnHelper.accessor("RequestNumber", {
                cell: (info: any) => info.getValue(),
                header: "Request Number"
            }),
            threeColumnHelper.accessor("CompanyName", {
                cell: (info: any) => info.getValue(),
                header: "Company Name"
            }),
            threeColumnHelper.accessor("VehicleType", {
                cell: (info: any) => info.getValue(),
                header: "Vehicle Type"
            }),
            threeColumnHelper.accessor("version", {
                cell: (info: any) => `v${info.getValue() ?? 0}`,
                header: "version"
              }),
            threeColumnHelper.accessor("passRequestId", {
                cell: (info: any) => info.getValue(),
                header: "Action"
            })
        ];

        // Bus pagination starts
        // let busRquestId: string = '';
        // // circlestates ? threeWheelerRquestId = circlestates : threeWheelerData.filter((item: any, key: number) => key === 0 ? threeWheelerRquestId = item._id : null)
        // // Determine the three-wheeler request ID
        // if (circlestates && busData.some((item: any) => item._id === circlestates)) {
        //     busRquestId = circlestates;
        // } else {
        //     // If circlestate is not provided or invalid, set it to the first entry in three-wheeler data
        //     busRquestId = busData.length > 0 ? busData[0]._id : null;
        // }
        //  bus = busData.map((homoData: any) => ({
        //     homoID: (
        //         <Text onClick={() => getAllFormsData(homoData._id)}>
        //             {busRquestId === homoData._id || circlestate === homoData._id ?
        //                 <Text as={'span'} display={'block'} w={"24px"} h={"24px"} bg={"#7FBD2C"} borderRadius={"24px"}></Text> :
        //                 <Text as={'span'} display={'block'} w={"24px"} h={"24px"} bg={"#ccc"} borderRadius={"24px"}></Text>}
        //         </Text>

        //     ),
        //     RequestNumber: (
        //         <Text onClick={() => getAllFormsData(homoData._id)}>
        //             {homoData.request_number}
        //         </Text>

        //     ),
        //     CompanyName: (
        //         <Text onClick={() => getAllFormsData(homoData._id)}>
        //             {userData.businessName}
        //         </Text>

        //     ),
        //     VehicleType: (
        //         <Text onClick={() => getAllFormsData(homoData._id)}>
        //             {homoData.vehicle_type.value}
        //         </Text>

        //     ),
        //     version: homoData.version ?? 0,
        //     // passRequestId: (
        //     //     <Text>
        //     //         <EditIcon cursor={'pointer'} w={4} h={4} onClick={() => homologationRequestId(homoData._id, homoData)} />
        //     //     </Text>

        //     // ),
        //     passRequestId: (
        //         <HStack spacing={3}>
        //           <EditIcon 
        //             cursor="pointer" 
        //             w={4} 
        //             h={4} 
        //             onClick={() => homologationRequestId(homoData._id, homoData)} 
        //           />
        //           <CloneIcon 
        //             cursor="pointer" 
        //             w={4} 
        //             h={4} 
        //             onClick={() => handleCloneRequest(homoData._id)} 
        //           />
        //         </HStack>
        //       ),
        // }));

        // // Need pass type of `tableDate` for ts autocomplete
        // busColumnHelper = createColumn<typeof bus[0]>();

        // busColumns = [
        //     busColumnHelper.accessor("homoID", {
        //         cell: (info: any) => info.getValue(),
        //         header: ""
        //     }),
        //     busColumnHelper.accessor("RequestNumber", {
        //         cell: (info: any) => info.getValue(),
        //         header: "Request Number"
        //     }),
        //     busColumnHelper.accessor("CompanyName", {
        //         cell: (info: any) => info.getValue(),
        //         header: "Company Name"
        //     }),
        //     busColumnHelper.accessor("VehicleType", {
        //         cell: (info: any) => info.getValue(),
        //         header: "Vehicle Type"
        //     }),
        //     busColumnHelper.accessor("version", {
        //         cell: (info: any) => `v${info.getValue() ?? 0}`,
        //         header: "version"
        //       }),
        //     busColumnHelper.accessor("passRequestId", {
        //         cell: (info: any) => info.getValue(),
        //         header: "Action"
        //     })
        // ];  
        



        // getAllFormsData(twoWheelerRquestId);
        // setThreeCirclestate(threeWheelerRquestId)


        // // Trigger the appropriate function based on the selected state
        // if (tabIndex === 0) {
        //     getAllFormsData(twoWheelerRquestId); // For 2-wheeler
        //     setThreeCirclestate(twoWheelerRquestId);
        // } else if (tabIndex === 1) {
        //     getAllFormsData(threeWheelerRquestId); // For 3-wheeler
        //     setThreeCirclestate(threeWheelerRquestId);
        // }


        // Trigger the appropriate function based on the selected state
        if (tabIndex === 0) {
            getAllFormsData(twoWheelerRquestId); // For 2-wheeler
            setThreeCirclestate(twoWheelerRquestId);
        } else if (tabIndex === 1) {
            getAllFormsData(threeWheelerRquestId); // For 3-wheeler
            setThreeCirclestate(threeWheelerRquestId);
        }
        //   else if (tabIndex === 2) {
        //  getAllFormsData(busRquestId);
        //   setThreeCirclestate(busRquestId);
        //   }
    }


    const socialIcons = () => {
        socialIcon ? setSocialIcon(false) : setSocialIcon(true)
    }
    const handleClose = () => {
        const dialog = document.querySelector("dialog");
        dialog && dialog.showModal()
    }
    const cancelClose = () => {
        const dialog = document.querySelector("dialog");
        dialog && dialog.close()
    }
    const closeModal = () => {
        setVisible(false)
    }
    const openAddRequest = () => {
        setVisible(true)
    }


    useEffect(() => {
        getHomologationData();
    }, [])
    useEffect(() => {
        circlestate && dataPagination(circlestate)
    }, [circlestate])

    useEffect(() => {
        getHomologationData();
    }, [tabIndex]);
    return (
        <>
            {/* <Container maxW={'1586px'} p={"50px"}> */}
            {/* added the minimum heigh before the blank req  */}
            <Container maxW={'1586px'} p={'50px'} minH={'70vh'}>
                <Tabs variant='unstyled' onChange={(index) => setTabIndex(index)}>
                    <TabList>
                        <Tab
                            _selected={{
                                color: 'rgba(0,0,0,1)',
                                borderBottom: '5px solid #7FBD2C'
                            }}
                            borderBottom="5px solid #fff"
                            maxW={"175px"}
                            mr={"40px"}
                            fontWeight={"800"}
                            color={"rgba(0,0,0,0.4)"}
                        >2-Wheeler</Tab>
                        <Tab
                            _selected={{
                                color: 'rgba(0,0,0,1)',
                                borderBottom: '5px solid #7FBD2C'
                            }}
                            borderBottom="5px solid #fff"
                            maxW={"175px"}
                            mr={"40px"}
                            fontWeight={"800"}
                            color={"rgba(0,0,0,0.4)"}
                            onClick={resetPercentageData}
                        >3-Wheeler</Tab>
                        {/* <Tab
                            _selected={{
                                color: 'rgba(0,0,0,1)',
                                borderBottom: '5px solid #7FBD2C'
                            }}
                            borderBottom="5px solid #fff"
                            maxW={"175px"}
                            mr={"40px"}
                            fontWeight={"800"}
                            color={"rgba(0,0,0,0.4)"}
                            onClick={resetPercentageData}
                        >BUS</Tab> */}


                        <Spacer />
                        <Button
                            height='42px'
                            maxWidth={["90px", "185px"]}
                            bg="#7FBF28"
                            color='#fff'
                            fontWeight={"800"}
                            maxW={"175px"}
                            fontSize="14px"
                            _hover={{ bg: '#7FBF28' }}
                            _focus={{ bg: '#7FBF28' }}
                            onClick={openAddRequest}>
                            <Show breakpoint='(max-width: 767px)'><AddIcon color={"#fff"} /></Show>
                            <Show breakpoint='(min-width: 768px)'>Add New Request</Show>
                        </Button>
                    </TabList>

                    <TabPanels>
                        <TabPanel p={0}>
                            <TableContainer className='table-container'>
                                <>
                                    {twoWheelerData.length > 0 &&
                                        <Table

                                            colorScheme="blue"
                                            // Fallback component when list is empty
                                            emptyData={{
                                                text: "Nobody is registered here."
                                            }}
                                            totalRegisters={twoWheelerData.length}
                                            // Listen change page event and control the current page using state
                                            onPageChange={(page: number) => setPage(page)}
                                            columns={twoColumns}
                                            data={twoWheeler}
                                        />
                                    }
                                    <Flex mt={"100px"} mb={"50px"} gap={14} p={"30px 25px"}
                                        overflow={["scroll", "scroll", "visible"]}
                                        flexWrap={['nowrap', 'nowrap', 'nowrap', 'nowrap']}
                                        justifyContent={'flex-start'}
                                        columnGap={'15px'}
                                    >

                                        {

//2-Wheeler
                                            PercentileData && Object.keys(PercentileData).sort().map((item: any, key: number) => {
                                                //  let fileUpload = Object.keys(PercentileData.fileUploadData)

                                                if (item !== 'fileUploadData') {
                                                    let checkDownLoad = process.env.REACT_APP_CHECK_DOWNLOAD
                                                    let percentageFilled = Math.round(PercentileData[item] && PercentileData[item].percentageFilled);
                                                    if (checkDownLoad === 'true') {
                                                        percentageFilled = 100;
                                                    }
                                                    // if (item === 'form1AData' && percentageFilled>70 ) {
                                                    //     percentageFilled = 100;
                                                    //     // percentageFilled +=28;   
                                                    //     // console.log('form1AData:',item);
                                                    // }
                                                    if (item === 'form1AData') {
                                                        percentageFilled = percentageFilled >= 70 ? 100 : Math.round((percentageFilled / 70) * 100);
                                                        // console.log('form1AData:', item);
                                                    }
                                                    
                                                    // if (item === 'form13Data' && percentageFilled>50 ) {
                                                    //     percentageFilled += 6;   
                                                    // }
                                                    // if (item === 'form7Data' && percentageFilled>74 ) {
                                                    //     percentageFilled = 100;
                                                    //     // percentageFilled += 23;     
                                                    //     // console.log('form7Data:',item)
                                                    // }
                                                    if (item === 'form7Data') {
                                                        percentageFilled = percentageFilled >= 74 ? 100 : Math.round((percentageFilled / 74) * 100);
                                                        // console.log('form7Data:', item);
                                                    }
                                                    
                                                    // if (item === 'form8Data' && percentageFilled>70 ) {
                                                    //     percentageFilled = 100;
                                                    //     // percentageFilled += 22;  
                                                    //     // console.log('form8Data:',item)   
                                                    // }
                                                    if (item === 'form8Data') {
                                                        percentageFilled = percentageFilled >= 70 ? 100 : Math.round((percentageFilled / 70) * 100);
                                                        // console.log('form8Data:', item);
                                                    }
                                                    
                                                    let filledValue: any = percentageFilled;
                                                    let integer: number = 0;
                                                    let decimal: number = 0;
                                                    let pushPercentageValue: any = []
                                                    let handredPercentData = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10]
                                                    let getPercentageLength: number = 0;
                                                    if (filledValue >= 10) {
                                                        filledValue = percentageFilled >= 10 ? Math.round(Math.round(percentageFilled / 100 * 100) / 10) : Math.round(Math.round(percentageFilled / 100 * 100));
                                                        filledValue = filledValue.toString().split('.')
                                                        integer = filledValue[0];
                                                        if (filledValue[1] > 0) {
                                                            decimal = filledValue[1];
                                                        }
                                                    } else {
                                                        decimal = filledValue;
                                                    }

                                                    const bgColor = percentageFilled < 100 && percentageFilled > 1 ? '#05637D' : percentageFilled >= 95 ? '#7FBD2C' : '#E1E1E1';
                                                    for (let i = 1; i <= integer; i++) {
                                                        pushPercentageValue.push({ 'integer': 10 })
                                                    }
                                                    decimal > 0 && pushPercentageValue.push({ 'integer': decimal })
                                                    return (
                                                        <Box key={key} position={'relative'}>
                                                            <Text fontSize={"16px"} color="#000000"
                                                                textAlign={"center"}
                                                                textTransform={'capitalize'}
                                                                fontFamily={'Open Sans'}
                                                                mb={'10px'}
                                                                fontWeight={"700"}>{item.replace("Data", "")}</Text>

                                                            <Text
                                                                fontSize={"20px"}
                                                                color="#000000"
                                                                textAlign={"center"}
                                                                position={'absolute'}
                                                                top={'74px'}
                                                                left={'40%'}
                                                                zIndex={'1'}
                                                                fontWeight={"700"}>{percentageFilled} %</Text>

                                                            <Box
                                                                bg={"#D9D9D9"}
                                                                borderRadius={"10px"}
                                                                w={"210px"}
                                                                h={"103px"}
                                                                p={"10px"}
                                                                display={"flex"}
                                                                position={"relative"}
                                                            >
                                                                {
                                                                    (percentageFilled >= 95 || percentageFilled >= 0 && checkDownLoad === 'false') &&
                                                                    <Box bg={"#EE7623"}
                                                                        w={"42px"}
                                                                        h={"42px"}
                                                                        borderRadius="45px"
                                                                        position={"absolute"}
                                                                        top={"-17px"}
                                                                        left={"-11px"}
                                                                        border={"6px solid #fff"}
                                                                        textAlign={"center"}
                                                                        cursor={'pointer'}
                                                                    >
                                                                        <ArrowDownIcon onClick={() => downloadDocument(item)} mt={"5px"} boxSize={4} color={"#fff"} />
                                                                    </Box>
                                                                }


                                                                {
                                                                    pushPercentageValue.map((value: any, key: number) => {
                                                                        getPercentageLength = pushPercentageValue.length;
                                                                        return (
                                                                            value.integer >= 5 &&
                                                                            <Box bg={bgColor} w={"10%"}
                                                                                h={Math.round(value.integer) >= 5 ? "85px" : (value.integer * 8.5) + 'px'}
                                                                                ml={"3px"}
                                                                                mr={'3px'}
                                                                            >
                                                                            </Box>
                                                                        )
                                                                    })

                                                                }
                                                                {
                                                                    handredPercentData.map((value: any, key: number) => {
                                                                        return (
                                                                            key > getPercentageLength - 1 &&
                                                                            <>
                                                                                <Box bg={'#E1E1E1'} w={"10%"} h={"85px"} m={"0px 3px"} />
                                                                            </>
                                                                        )

                                                                    })
                                                                }

                                                            </Box>



                                                            <Text
                                                                fontSize={"16px"}
                                                                mt={'20px'}
                                                                color="#000000"
                                                                textAlign={"center"}
                                                                fontFamily={'Open Sans'}
                                                                fontWeight={"700"}>Uploaded Design Docs</Text>

                                                            {
                                                                fileData.sort().map((formsdata: any, key: number) => {
                                                                    if (formsdata.formName === item) {
                                                                        return (
                                                                            <>
                                                                                {

                                                                                    (formsdata.filseField || []).map((formValue: any, key: number) => {


                                                                                        return (
                                                                                            <>
                                                                                                {
                                                                                                    formValue.file_name !== '' ?

                                                                                                        <Text
                                                                                                            display={'flex'}
                                                                                                            flexWrap={'nowrap'}
                                                                                                            alignItems='center'
                                                                                                            gap={'5px'}
                                                                                                            fontSize={"12px"}
                                                                                                            justifyContent={'center'}
                                                                                                            pb={'5px'}
                                                                                                            pt={'5px'}
                                                                                                            cursor={'pointer'}
                                                                                                            onClick={() => downloadFile(formValue.file_name)}
                                                                                                        >
                                                                                                            <Image src={ok} alt="brand" h={'13px'} w={'13px'} />
                                                                                                            <Text as={'span'}
                                                                                                                color={'#2373C2'}
                                                                                                                className={'filename'}
                                                                                                                display={'block'}
                                                                                                                fontFamily={'sans-serif'}
                                                                                                                title={formValue.lable}
                                                                                                            >{formValue.lable}</Text>

                                                                                                        </Text>

                                                                                                        :
                                                                                                        <Text

                                                                                                            display={'flex'}
                                                                                                            flexWrap={'nowrap'}
                                                                                                            alignItems='center'
                                                                                                            gap={'5px'}
                                                                                                            fontSize={"12px"}
                                                                                                            justifyContent={'center'}
                                                                                                            pb={'5px'}
                                                                                                            pt={'5px'}>
                                                                                                            <Image src={cancel} alt="brand" h={'13px'} w={'13px'} />
                                                                                                            <Text as={'span'}
                                                                                                                color={'#2373C2'}
                                                                                                                className={'filename'}
                                                                                                                display={'block'}
                                                                                                                fontFamily={'sans-serif'}
                                                                                                                title={formValue.lable}
                                                                                                            >{formValue.lable}</Text>

                                                                                                        </Text>
                                                                                                }
                                                                                            </>
                                                                                        )

                                                                                    })
                                                                                }
                                                                            </>
                                                                        )
                                                                    }

                                                                })

                                                            }


                                                        </Box>
                                                    )
                                                }
                                            })

                                        }


                                    </Flex>
                                </>
                            </TableContainer>
                        </TabPanel>
                        <TabPanel p={0}>
                            <TableContainer className='table-container'>
                                <>
                                    {threeWheelerData.length > 0 &&
                                        <Table

                                            colorScheme="blue"
                                            // Fallback component when list is empty
                                            emptyData={{
                                                text: "Nobody is registered here."
                                            }}
                                            totalRegisters={threeWheelerData.length}
                                            // Listen change page event and control the current page using state
                                            onPageChange={(page) => setPage(page)}
                                            columns={threeColumns}
                                            data={threeWheeler}
                                        />
                                    }

                                    <Flex mt={"100px"} mb={"50px"} gap={14} p={"30px 25px"}
                                        overflow={["scroll", "scroll", "visible"]}
                                        flexWrap={['nowrap', 'nowrap', 'wrap', 'wrap']}
                                        justifyContent={'flex-start'}
                                        columnGap={'15px'}
                                    >
                                        {
                                            //3-Wheeler
                                            PercentileData && Object.keys(PercentileData).sort().map((item: any, key: number) => {
                                                //  let fileUpload = Object.keys(PercentileData.fileUploadData)
                                                if (item !== 'fileUploadData') {
                                                    let checkDownLoad = process.env.REACT_APP_CHECK_DOWNLOAD
                                                    let percentageFilled = Math.round(PercentileData[item] && PercentileData[item].percentageFilled);
                                                    if (checkDownLoad === 'true') {
                                                        percentageFilled = 100;
                                                    }
                                                    // if (item === 'form1AData' && percentageFilled>89 ) {
                                                    //     percentageFilled = 100;
                                                    //     // percentageFilled += 10;                                                 
                                                    // //   console.log('form1AData:',item);
                                                        
                                                    // }
                                                    if (item === 'form1AData') {
                                                        percentageFilled = percentageFilled >= 89 ? 100 : Math.round((percentageFilled / 89) * 100);
                                                        // console.log('form1AData:', item);
                                                    }
                                                    
                                                    // if (item === 'form7Data' && percentageFilled>78 ) {
                                                    //     percentageFilled = 100;
                                                    //     // percentageFilled += 16;     
                                                    //     // console.log('form7Data:',item);
                                                    // }
                                                    if (item === 'form7Data') {
                                                        percentageFilled = percentageFilled >= 78 ? 100 : Math.round((percentageFilled / 78) * 100);
                                                        // console.log('form7Data:', item);
                                                    }
                                                    
                                                    // if (item === 'form8Data' && percentageFilled>50 ) {
                                                    //     percentageFilled +=5;     
                                                    // }
                                                    // if (item === 'form8Data' && percentageFilled>84 ) {                                                       
                                                    //         percentageFilled=100;
                                                    //         // console.log('form8Data:',item);
                                                       
                                                    // }
                                                    if (item === 'form8Data') {
                                                        percentageFilled = percentageFilled >= 84 ? 100 : Math.round((percentageFilled / 84) * 100);
                                                        // console.log('form8Data:', item);
                                                    }
                                                    
                                                    let filledValue: any = percentageFilled;
                                                    let integer: number = 0;
                                                    let decimal: number = 0;
                                                    let pushPercentageValue: any = []
                                                    let handredPercentData = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10]
                                                    let getPercentageLength: number = 0;
                                                    if (filledValue >= 10) {
                                                        filledValue = percentageFilled >= 10 ? Math.round(Math.round(percentageFilled / 100 * 100) / 10) : Math.round(Math.round(percentageFilled / 100 * 100));
                                                        filledValue = filledValue.toString().split('.')
                                                        integer = filledValue[0];
                                                        if (filledValue[1] > 0) {
                                                            decimal = filledValue[1];
                                                        }
                                                    } else {
                                                        decimal = filledValue;
                                                    }

                                                    const bgColor = percentageFilled < 100 && percentageFilled > 1 ? '#05637D' : percentageFilled >= 95 ? '#7FBD2C' : '#E1E1E1';
                                                    for (let i = 1; i <= integer; i++) {
                                                        pushPercentageValue.push({ 'integer': 10 })
                                                    }
                                                    decimal > 0 && pushPercentageValue.push({ 'integer': decimal })
                                                    return (
                                                        <Box key={key} position={'relative'}>
                                                            <Text fontSize={"16px"} color="#000000"
                                                                textAlign={"center"}
                                                                textTransform={'capitalize'}
                                                                fontFamily={'Open Sans'}
                                                                mb={'10px'}
                                                                fontWeight={"700"}>{item.replace("Data", "")}</Text>

                                                            <Text
                                                                fontSize={"20px"}
                                                                color="#000000"
                                                                textAlign={"center"}
                                                                position={'absolute'}
                                                                top={'74px'}
                                                                left={'40%'}
                                                                zIndex={'1'}
                                                                fontWeight={"700"}>{percentageFilled} %</Text>

                                                            <Box
                                                                bg={"#D9D9D9"}
                                                                borderRadius={"10px"}
                                                                w={"210px"}
                                                                h={"103px"}
                                                                p={"10px"}
                                                                display={"flex"}
                                                                position={"relative"}
                                                            >
                                                                {
                                                                    (percentageFilled >= 95 || percentageFilled >= 0 && checkDownLoad === 'false') &&
                                                                    <Box bg={"#EE7623"}
                                                                        w={"42px"}
                                                                        h={"42px"}
                                                                        borderRadius="45px"
                                                                        position={"absolute"}
                                                                        top={"-17px"}
                                                                        left={"-11px"}
                                                                        border={"6px solid #fff"}
                                                                        textAlign={"center"}
                                                                        cursor={'pointer'}
                                                                    >
                                                                        <ArrowDownIcon onClick={() => downloadDocument(item)} mt={"5px"} boxSize={4} color={"#fff"} />
                                                                    </Box>
                                                                }


                                                                {
                                                                    pushPercentageValue.map((value: any, key: number) => {
                                                                        getPercentageLength = pushPercentageValue.length;
                                                                        return (
                                                                            value.integer >= 5 &&
                                                                            <Box bg={bgColor} w={"10%"}
                                                                                h={Math.round(value.integer) >= 5 ? "85px" : (value.integer * 8.5) + 'px'}
                                                                                ml={"3px"}
                                                                                mr={'3px'}
                                                                            >
                                                                            </Box>
                                                                        )
                                                                    })

                                                                }
                                                                {
                                                                    handredPercentData.map((value: any, key: number) => {
                                                                        return (
                                                                            key > getPercentageLength - 1 &&
                                                                            <>
                                                                                <Box bg={'#E1E1E1'} w={"10%"} h={"85px"} m={"0px 3px"} />
                                                                            </>
                                                                        )

                                                                    })
                                                                }

                                                            </Box>



                                                            <Text
                                                                fontSize={"16px"}
                                                                mt={'20px'}
                                                                color="#000000"
                                                                textAlign={"center"}
                                                                fontFamily={'Open Sans'}
                                                                fontWeight={"700"}>Uploaded Design Docs</Text>

                                                            {
                                                                fileData.sort().map((formsdata: any, key: number) => {
                                                                    if (formsdata.formName === item) {
                                                                        return (
                                                                            <>
                                                                                {

                                                                                    (formsdata.filseField || []).map((formValue: any, key: number) => {


                                                                                        return (
                                                                                            <>
                                                                                                {
                                                                                                    formValue.file_name !== '' ?

                                                                                                        <Text
                                                                                                            display={'flex'}
                                                                                                            flexWrap={'nowrap'}
                                                                                                            alignItems='center'
                                                                                                            gap={'5px'}
                                                                                                            fontSize={"12px"}
                                                                                                            justifyContent={'center'}
                                                                                                            pb={'5px'}
                                                                                                            pt={'5px'}
                                                                                                            cursor={'pointer'}
                                                                                                            onClick={() => downloadFile(formValue.file_name)}
                                                                                                        >
                                                                                                            <Image src={ok} alt="brand" h={'13px'} w={'13px'} />
                                                                                                            <Text as={'span'}
                                                                                                                color={'#2373C2'}
                                                                                                                className={'filename'}
                                                                                                                display={'block'}
                                                                                                                fontFamily={'sans-serif'}
                                                                                                                title={formValue.lable}
                                                                                                            >{formValue.lable}</Text>

                                                                                                        </Text>

                                                                                                        :
                                                                                                        <Text

                                                                                                            display={'flex'}
                                                                                                            flexWrap={'nowrap'}
                                                                                                            alignItems='center'
                                                                                                            gap={'5px'}
                                                                                                            fontSize={"12px"}
                                                                                                            justifyContent={'center'}
                                                                                                            pb={'5px'}
                                                                                                            pt={'5px'}>
                                                                                                            <Image src={cancel} alt="brand" h={'13px'} w={'13px'} />
                                                                                                            <Text as={'span'}
                                                                                                                color={'#2373C2'}
                                                                                                                className={'filename'}
                                                                                                                display={'block'}
                                                                                                                fontFamily={'sans-serif'}
                                                                                                                title={formValue.lable}
                                                                                                            >{formValue.lable}</Text>

                                                                                                        </Text>
                                                                                                }
                                                                                            </>
                                                                                        )

                                                                                    })
                                                                                }
                                                                            </>
                                                                        )
                                                                    }

                                                                })

                                                            }


                                                        </Box>
                                                    )
                                                }
                                            })
                                        }


                                    </Flex>
                                </>
                            </TableContainer>
                        </TabPanel>
                        {/* <TabPanel p={0}>

    <TableContainer className="table-container">

        <>

            {busData.length > 0 && (

                <Table

                    colorScheme="blue"

                    emptyData={{

                        text: "Nobody is registered here."

                    }}

                    totalRegisters={busData.length}

                    onPageChange={(page) => setPage(page)}

                    columns={busColumns}

                    data={bus}

                />

            )}



            <Flex

                mt={"100px"}

                mb={"50px"}

                gap={14}

                p={"30px 25px"}

                overflow={["scroll", "scroll", "visible"]}

                flexWrap={['nowrap', 'nowrap', 'wrap', 'wrap']}

                justifyContent={'flex-start'}

                columnGap={'15px'}

            >

                {

                    // Bus

                    PercentileData &&

                    Object.keys(PercentileData).sort().map((item: any, key: number) => {
if (item !== 'fileUploadData') {
                                                    let checkDownLoad = process.env.REACT_APP_CHECK_DOWNLOAD
                                                    let percentageFilled = Math.round(PercentileData[item] && PercentileData[item].percentageFilled);
                                                    if (checkDownLoad === 'true') {
                                                        percentageFilled = 100;
                                                    }
                                                    // if (item === 'form1AData' && percentageFilled>89 ) {
                                                    //     percentageFilled = 100;
                                                    //     // percentageFilled += 10;                                                 
                                                    // //   console.log('form1AData:',item);
                                                        
                                                    // }
                                                    if (item === 'form1AData') {
                                                        percentageFilled = percentageFilled >= 89 ? 100 : Math.round((percentageFilled / 89) * 100);
                                                        // console.log('form1AData:', item);
                                                    }
                                                    
                                                    // if (item === 'form7Data' && percentageFilled>78 ) {
                                                    //     percentageFilled = 100;
                                                    //     // percentageFilled += 16;     
                                                    //     // console.log('form7Data:',item);
                                                    // }
                                                    if (item === 'form7Data') {
                                                        percentageFilled = percentageFilled >= 78 ? 100 : Math.round((percentageFilled / 78) * 100);
                                                        // console.log('form7Data:', item);
                                                    }
                                                    
                                                    // if (item === 'form8Data' && percentageFilled>50 ) {
                                                    //     percentageFilled +=5;     
                                                    // }
                                                    // if (item === 'form8Data' && percentageFilled>84 ) {                                                       
                                                    //         percentageFilled=100;
                                                    //         // console.log('form8Data:',item);
                                                       
                                                    // }
                                                    if (item === 'form8Data') {
                                                        percentageFilled = percentageFilled >= 84 ? 100 : Math.round((percentageFilled / 84) * 100);
                                                        // console.log('form8Data:', item);
                                                    }
                                                    
                                                    let filledValue: any = percentageFilled;
                                                    let integer: number = 0;
                                                    let decimal: number = 0;
                                                    let pushPercentageValue: any = []
                                                    let handredPercentData = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10]
                                                    let getPercentageLength: number = 0;
                                                    if (filledValue >= 10) {
                                                        filledValue = percentageFilled >= 10 ? Math.round(Math.round(percentageFilled / 100 * 100) / 10) : Math.round(Math.round(percentageFilled / 100 * 100));
                                                        filledValue = filledValue.toString().split('.')
                                                        integer = filledValue[0];
                                                        if (filledValue[1] > 0) {
                                                            decimal = filledValue[1];
                                                        }
                                                    } else {
                                                        decimal = filledValue;
                                                    }

                                                    const bgColor = percentageFilled < 100 && percentageFilled > 1 ? '#05637D' : percentageFilled >= 95 ? '#7FBD2C' : '#E1E1E1';
                                                    for (let i = 1; i <= integer; i++) {
                                                        pushPercentageValue.push({ 'integer': 10 })
                                                    }
                                                    decimal > 0 && pushPercentageValue.push({ 'integer': decimal })
                                                    return (
                                                        <Box key={key} position={'relative'}>
                                                            <Text fontSize={"16px"} color="#000000"
                                                                textAlign={"center"}
                                                                textTransform={'capitalize'}
                                                                fontFamily={'Open Sans'}
                                                                mb={'10px'}
                                                                fontWeight={"700"}>{item.replace("Data", "")}</Text>

                                                            <Text
                                                                fontSize={"20px"}
                                                                color="#000000"
                                                                textAlign={"center"}
                                                                position={'absolute'}
                                                                top={'74px'}
                                                                left={'40%'}
                                                                zIndex={'1'}
                                                                fontWeight={"700"}>{percentageFilled} %</Text>

                                                            <Box
                                                                bg={"#D9D9D9"}
                                                                borderRadius={"10px"}
                                                                w={"210px"}
                                                                h={"103px"}
                                                                p={"10px"}
                                                                display={"flex"}
                                                                position={"relative"}
                                                            >
                                                                {
                                                                    (percentageFilled >= 95 || percentageFilled >= 0 && checkDownLoad === 'false') &&
                                                                    <Box bg={"#EE7623"}
                                                                        w={"42px"}
                                                                        h={"42px"}
                                                                        borderRadius="45px"
                                                                        position={"absolute"}
                                                                        top={"-17px"}
                                                                        left={"-11px"}
                                                                        border={"6px solid #fff"}
                                                                        textAlign={"center"}
                                                                        cursor={'pointer'}
                                                                    >
                                                                        <ArrowDownIcon onClick={() => downloadDocument(item)} mt={"5px"} boxSize={4} color={"#fff"} />
                                                                    </Box>
                                                                }


                                                                {
                                                                    pushPercentageValue.map((value: any, key: number) => {
                                                                        getPercentageLength = pushPercentageValue.length;
                                                                        return (
                                                                            value.integer >= 5 &&
                                                                            <Box bg={bgColor} w={"10%"}
                                                                                h={Math.round(value.integer) >= 5 ? "85px" : (value.integer * 8.5) + 'px'}
                                                                                ml={"3px"}
                                                                                mr={'3px'}
                                                                            >
                                                                            </Box>
                                                                        )
                                                                    })

                                                                }
                                                                {
                                                                    handredPercentData.map((value: any, key: number) => {
                                                                        return (
                                                                            key > getPercentageLength - 1 &&
                                                                            <>
                                                                                <Box bg={'#E1E1E1'} w={"10%"} h={"85px"} m={"0px 3px"} />
                                                                            </>
                                                                        )

                                                                    })
                                                                }

                                                            </Box>



                                                            <Text
                                                                fontSize={"16px"}
                                                                mt={'20px'}
                                                                color="#000000"
                                                                textAlign={"center"}
                                                                fontFamily={'Open Sans'}
                                                                fontWeight={"700"}>Uploaded Design Docs</Text>

                                                            {
                                                                fileData.sort().map((formsdata: any, key: number) => {
                                                                    if (formsdata.formName === item) {
                                                                        return (
                                                                            <>
                                                                                {

                                                                                     (formsdata.filseField || []).map((formValue: any, key: number) => {


                                                                                        return (
                                                                                            <>
                                                                                                {
                                                                                                    formValue.file_name !== '' ?

                                                                                                        <Text
                                                                                                            display={'flex'}
                                                                                                            flexWrap={'nowrap'}
                                                                                                            alignItems='center'
                                                                                                            gap={'5px'}
                                                                                                            fontSize={"12px"}
                                                                                                            justifyContent={'center'}
                                                                                                            pb={'5px'}
                                                                                                            pt={'5px'}
                                                                                                            cursor={'pointer'}
                                                                                                            onClick={() => downloadFile(formValue.file_name)}
                                                                                                        >
                                                                                                            <Image src={ok} alt="brand" h={'13px'} w={'13px'} />
                                                                                                            <Text as={'span'}
                                                                                                                color={'#2373C2'}
                                                                                                                className={'filename'}
                                                                                                                display={'block'}
                                                                                                                fontFamily={'sans-serif'}
                                                                                                                title={formValue.lable}
                                                                                                            >{formValue.lable}</Text>

                                                                                                        </Text>

                                                                                                        :
                                                                                                        <Text

                                                                                                            display={'flex'}
                                                                                                            flexWrap={'nowrap'}
                                                                                                            alignItems='center'
                                                                                                            gap={'5px'}
                                                                                                            fontSize={"12px"}
                                                                                                            justifyContent={'center'}
                                                                                                            pb={'5px'}
                                                                                                            pt={'5px'}>
                                                                                                            <Image src={cancel} alt="brand" h={'13px'} w={'13px'} />
                                                                                                            <Text as={'span'}
                                                                                                                color={'#2373C2'}
                                                                                                                className={'filename'}
                                                                                                                display={'block'}
                                                                                                                fontFamily={'sans-serif'}
                                                                                                                title={formValue.lable}
                                                                                                            >{formValue.lable}</Text>

                                                                                                        </Text>
                                                                                                }
                                                                                            </>
                                                                                        )

                                                                                    })
                                                                                }
                                                                            </>
                                                                        )
                                                                    }

                                                                })

                                                            }


                                                        </Box>
                                                    )
                                                }
                                            })
                                        }


                                    </Flex>
                                </>
                            </TableContainer>
                        </TabPanel> */}


                    </TabPanels>
                </Tabs>


                <Modal isOpen={visible} onClose={onClose} size='6xl' closeOnOverlayClick={false}>
                    <ModalOverlay onClick={() => handleClose()} />
                    <ModalContent>
                        <ModalHeader bg={"#05637D"} fontWeight={"700"} fontSize={"18px"} textAlign="center" color={"#fff"}>Homologation Registration Request</ModalHeader>
                        <ModalCloseButton color={"#fff"} onClick={() => handleClose()} />
                        <ModalBody bg="#F1F1F1" p={["5px", "45px"]}>
                           <Newhomologation
  onClose={handleClose}
  onSuccess={async () => {}}
/>
                        </ModalBody>
                    </ModalContent>
                    <dialog>
                        <Text color={"red"} fontSize={"18px"}>Are you sure you want to close?</Text>
                        <Text color={"red"} fontSize={"18px"} marginBottom={"20px"}>You will lose all the filled data</Text>
                        <Button marginRight={"15px"} colorScheme='red' variant='solid' onClick={closeModal}>
                            Yes
                        </Button>
                        <Button colorScheme='teal' variant='solid' onClick={cancelClose}>
                            No
                        </Button>
                    </dialog>
                </Modal>

                <Box>
                    <Box className='userIcon' onClick={() => socialIcons()} >
                        <Image
                            src={user}
                            alt='userIcon'
                            w={'44px'}
                            h={'44px'}
                        />
                    </Box>

                    <Box className={socialIcon ? ' mailIcon' : 'mailIcon hide-the-icon'}>
                        <a href="mailto:support@auto-canon.in">
                            <Image
                                src={mail}
                                alt='mailIcon'
                                w={'36px'}
                                h={'36px'}
                            />
                        </a>
                    </Box>

                    <Box className={socialIcon ? ' phoneIcon' : 'phoneIcon hide-the-icon'}>
                        <a href="tel:8312950473">
                            <Image
                                src={phone}
                                alt='phoneIcon'
                                w={'36px'}
                                h={'36px'}
                            />
                        </a>
                    </Box>

                    <Box className={socialIcon ? ' chatIcon' : 'chatIcon hide-the-icon'}>
                        <Image
                            src={chat}
                            alt='chatIcon'
                            w={'36px'}
                            h={'36px'}
                        />
                    </Box>

                </Box>

            </Container>
        </>
    )
}

export default Dashboard;