import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import {
    Flex,
    Button,
    Stack,
    Text,
    Heading,
    FormControl,
    FormLabel,
    Input,
    Select,
} from "@chakra-ui/react";
import Popup from './barrelPopup';
import { useSelector } from 'react-redux';
import { RootState } from "../../app/store";
import { Post, Get, PATCH } from "../../utilities/service";
import {
    barrel1,
    getBarrel1AOptions,
    getBarrel2Options,
    getBarrel3Options,
    getBarrel4Options,
} from "../../constant/barrel";
// interface BarrelData {
//     barrel1: string;
//     barrel1A: string;
//     barrel2: string;
//     barrel3: string;
//     barrel4: string;
//     description: string;
//     finalOutput: string;
//     submittedAt: string;
//     partNumbers: string[];  // Add an array of part numbers
//     descriptions: string[];
// }
// interface FormData {
//     barrel1: string;
//     barrel1A: string;
//     barrel2: string;
//     barrel3: string;
//     barrel4: string;
//     description: string;
//     partNumbers: string[];  // Add an array of part numbers
//     descriptions: string[];

// }
interface BarrelData {
    barrel1: string;
    barrel1A: string;
    barrel2: string;
    barrel3: string;
    barrel4: string;
    description: string;
    finalOutput: string;
    submittedAt: string;
    partNumbers: string[];  // Array of part numbers
    descriptions: string[]; // Array of descriptions
    angleA: string[];         // Angle A
    angleB: string[];         // Angle B
    length: string[];         // Length
    distA: string[];          // Distance A
    distB: string[];          // Distance B
    designer: string[];       // Designer's name
    date: string[];           // Date
    applicable: string[];     // Applicable (string)
}

interface FormData {
    barrel1: string;
    barrel1A: string;
    barrel2: string;
    barrel3: string;
    barrel4: string;
    description: string;
    partNumbers: string[];  // Array of part numbers
    descriptions: string[]; // Array of descriptions
    angleA: string[];         // Angle A
    angleB: string[];         // Angle B
    length: string[];         // Length
    distA: string[];          // Distance A
    distB: string[];          // Distance B
    designer: string[];       // Designer's name
    date: string[];           // Date
    applicable: string[];     // Applicable (string)
}

interface Result {
    message: string;
    className: string;
}

const BarrelDataForm: React.FC = (BarrelData: any) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [finalOutput, setFinalOutput] = useState("");
    const token: string = useSelector((state: RootState) => state.loginCredential.token);
    const config = {
        headers: {
            Authorization: 'Bearer ' + token, // Include the token in the Authorization header
        },
    }
    // const [formData, setFormData] = useState<FormData>({
    //     barrel1: "",
    //     barrel1A: "",
    //     barrel2: "",
    //     barrel3: "",
    //     barrel4: "",
    //     description: "",
    //     partNumbers: [],  // Initialize as an empty array
    //     descriptions: [],

    // });
    const [formData, setFormData] = useState<FormData>({
        barrel1: "",
        barrel1A: "",
        barrel2: "",
        barrel3: "",
        barrel4: "",
        description: "",
        partNumbers: [],  // Initialize as an empty array
        descriptions: [], // Initialize as an empty array
        angleA: [],           // Initialize as an empty array
        angleB: [],           // Initialize as an empty array
        length: [],           // Initialize as an empty array
        distA: [],            // Initialize as an empty array
        distB: [],            // Initialize as an empty array
        designer: [],         // Initialize as an empty array
        date: [],             // Initialize as an empty array
        applicable: [],       // Initialize as an empty array
    });

    type BarrelOption = {
        value: string;
        name: string;
    };
    const [result, setResult] = useState<Result>({
        message: "PART/ASSY NUMBER ",
        className: "info",
    });
    //
    const [popupData, setPopupData] = useState<string | null>(null);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [isPopupSubmitted, setIsPopupSubmitted] = useState(false);
    const [serialNumber, setSerialNumber] = useState('SlNo: 01');
    const userData: any = useSelector((state: RootState) => state.loginCredential.userData);
    const { username, role, _id } = userData;
    const [barrelData, setBarrelData] = useState<BarrelData[]>([]);
    const [barrelDataPop, setBarrelDataPop] = useState<BarrelData[]>([]);
    const [resultMessage, setResultMessage] = useState<string>("");
    const [selectedBarrel, setSelectedBarrel] = useState<string>("");
    const [selectedBarrelPop, setSelectedBarrelPop] = useState<string>("");
    const [selectedBarrel1A, setSelectedBarrel1A] = useState<string>("");
    const [selectedBarrel3, setSelectedBarrel3] = useState<string>("");
    const [barrel1AOptions, setBarrel1AOptions] = useState<BarrelOption[]>([]);
    const [barrel2Options, setBarrel2Options] = useState<BarrelOption[]>([]);
    const [barrel3Options, setBarrel3Options] = useState<BarrelOption[]>([]);
    const [barrel4Options, setBarrel4Options] = useState<BarrelOption[]>([]);
    const [imageName, setImageName] = useState<string>("");
    const [isSearchBarVisible, setIsSearchBarVisible] = useState(false);
    const [expandedRow, setExpandedRow] = useState<number | null>(null);

    let dataToSubmit;

    const handleBarrel1Change = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = event.target.value;
        // if(selectedValue==='12'){
        //     setIsPopupVisible(true);
        // }
        // Use the imported function to get options       
        const options = getBarrel1AOptions(selectedValue);
        const barrel3Options = getBarrel3Options(selectedValue);
        const barrel4Options = getBarrel4Options(selectedValue);

        setSelectedBarrel(selectedValue);

        // setImageName(selectedValue);
        setBarrel1AOptions(options);
        setBarrel3Options(barrel3Options);
        setBarrel4Options(barrel4Options);
        const { id, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    const handleBarrel1AChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = event.target.value;

        // Use the imported function to get options based on the selected value
        const options = getBarrel2Options(selectedValue);
        // const barrel3Options = getBarrel3Options(selectedValue);
        setSelectedBarrel1A(selectedValue); // Update the selected value for Barrel 1A
        // console.log('options:',options)
        setBarrel2Options(options); // Dynamically update the Barrel 2 options based on selection
        // setBarrel3Options(barrel3Options); 
        const { id, value } = event.target;

        // Update the form data with the selected value
        setFormData((prev) => ({
            ...prev,
            [id]: value,
        }));
    };
    const handleBarrel2Change = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = event.target.value;

        // setImageName(selectedValue);
        const selectedOption = barrel2Options.find((option) => option.value === selectedValue);
        // Set the name of the selected option to setImageName
        setImageName(selectedOption?.name || ""); // Default to empty string if no match

        const { id, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value,
        }));
    };
    const handleBarrel3Change = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) => {
        const selectedValue = e.target.value;
        setSelectedBarrel3(selectedValue);
        // console.log('sd:', selectedValue)
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value,
        }));

    };
    const handleChange4 = (
        e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>
    ) => {
        setSelectedBarrel(e.target.value);
        // console.log('event of handlechange4:', e.target.value);

        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value,
        }));
        if (selectedBarrel3 === '00' || selectedBarrel === '77' || selectedBarrel3 === '24' || selectedBarrel3 === '81') {
            setIsPopupVisible(true);
        }
        else {
            setIsPopupVisible(false);
        }

    };

    const handleChange = (
        e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>
    ) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value,

        }));

        // if(selectedBarrel1A==='90'){
        //     setIsPopupVisible(true);
        // }
    };
    // const clearForm = () => {
    //     setFormData({
    //         barrel1: "",
    //         barrel1A: "",
    //         barrel2: "",
    //         barrel3: "",
    //         barrel4: "",
    //         description: "",
    //         partNumbers: [],  // Clear partNumbers array
    //         descriptions: [],

    //     });
    const clearForm = () => {
        setFormData({
            barrel1: "",
            barrel1A: "",
            barrel2: "",
            barrel3: "",
            barrel4: "",
            description: "",
            partNumbers: [],  // Clear partNumbers array
            descriptions: [], // Clear descriptions array 
            angleA: [],           // Initialize as an empty array
            angleB: [],           // Initialize as an empty array
            length: [],           // Initialize as an empty array
            distA: [],            // Initialize as an empty array
            distB: [],            // Initialize as an empty array
            designer: [],         // Initialize as an empty array
            date: [],             // Initialize as an empty array
            applicable: [],       // Initialize as an empty array
        });


        setBarrelData(BarrelData);
        setSelectedBarrelPop(BarrelData);
        setResultMessage(" ");
        setResult({
            message: "PART/ASSY NUMBER",
            className: "info",
        });
        setPopupData(null);
        setIsPopupVisible(false);
    };
    const handleClosePopup = () => {
        setIsPopupSubmitted(true);
        setIsPopupVisible(false);
    };
    ////////

    // Log updated formData when it changes using useEffect
    useEffect(() => {
        // console.log('Updatedd formData:', formData);
    }, [formData]); // This will run every time formData is updated

    //     const handleSubmitPopup = (data: { serialNumber: string; partNumber: string; description: string }[]) => {
    // //         const partNumbers = data.map(item => item.partNumber);
    // //         const descriptions = data.map(item => item.description);
    // // console.log('partNumbers:',partNumbers);
    // // console.log('descriptions:',descriptions);
    // const filteredData = data.filter(item => item.partNumber.trim() !== '' || item.description.trim() !== '');
    // const partNumbers = filteredData.map(item => item.partNumber);
    // const descriptions = filteredData.map(item => item.description);

    // if (partNumbers.length > 0) {
    //     console.log('partNumbers:', partNumbers);
    // }
    // if (descriptions.length > 0) {
    //     console.log('descriptions:', descriptions);
    // }
    //         // Update formData with partNumbers and descriptions
    //         setFormData(prev => ({
    //             ...prev,
    //             partNumbers,
    //             descriptions,
    //         }));
    // console.log('prev:',formData);
    //         // No need to log directly after setFormData, because it's asynchronous.
    //         // The updated formData will be logged in useEffect after the state has changed.

    //         setIsPopupSubmitted(true);
    //         setIsPopupVisible(false);
    //         return { barrelDataPop, handleSubmitPopup };
    //     };

    const handleSubmitPopup = (data: {
        serialNumber: string;
        partNumber: string;
        description: string;
        angleA: string;
        angleB: string;
        length: string;
        distA: string;
        distB: string;
        designer: string;
        date: string;
        applicable: string;
    }[]) => {
        // Filter data to remove any rows with empty partNumber or description
        const filteredData = data.filter(
            (item) =>
                item.partNumber.trim() !== '' ||
                item.description.trim() !== ''
        );

        // Extract the necessary fields from filtered data
        const partNumbers = filteredData.map((item) => item.partNumber);
        const descriptions = filteredData.map((item) => item.description);
        const angleA = filteredData.map((item) => item.angleA);
        const angleB = filteredData.map((item) => item.angleB);
        const length = filteredData.map((item) => item.length);
        const distA = filteredData.map((item) => item.distA);
        const distB = filteredData.map((item) => item.distB);
        const designer = filteredData.map((item) => item.designer);
        const date = filteredData.map((item) => item.date);
        const applicable = filteredData.map((item) => item.applicable);

        // Log the extracted data if they are not empty
        if (partNumbers.length > 0) {
            // console.log('partNumbers:', partNumbers);
        }
        if (descriptions.length > 0) {
            // console.log('descriptions:', descriptions);
        }


        // if (angleAs.length > 0) {
        //     console.log('angleAs:', angleAs);
        //   }

        //   if (angleBs.length > 0) {
        //     console.log('angleBs:', angleBs);
        //   }

        //   if (lengths.length > 0) {
        //     console.log('lengths:', lengths);
        //   }

        //   if (distAs.length > 0) {
        //     console.log('distAs:', distAs);
        //   }

        //   if (distBs.length > 0) {
        //     console.log('distBs:', distBs);
        //   }

        //   if (designers.length > 0) {
        //     console.log('designers:', designers);
        //   }

        //   if (dates.length > 0) {
        //     console.log('dates:', dates);
        //   }

        //   if (applicables.length > 0) {
        //     console.log('applicables:', applicables);
        //   }

        // Update formData with all the relevant fields
        setFormData((prev) => ({
            ...prev,
            partNumbers,
            descriptions,
            angleA,
            angleB,
            length,
            distA,
            distB,
            designer,
            date,
            applicable,
        }));

        // No need to log directly after setFormData, because it's asynchronous.
        // The updated formData will be logged in useEffect after the state has changed.

        setIsPopupSubmitted(true);
        setIsPopupVisible(false);

        return { barrelDataPop, handleSubmitPopup };
    };

    const generateFinalOutput = (): string | null => {
        const { barrel1, barrel1A, barrel2, barrel3, barrel4 } = formData;
        if (!barrel1 || !barrel1A || !barrel2 || !barrel3 || !barrel4) {
            return null;
        }

        if (isPopupVisible) {
            // console.log("Popup is still open. Triggering handleSubmitPopup.");


        }
        const finalOutput = barrel1 + barrel1A + barrel2 + barrel3 + barrel4;
        // if (finalOutput.slice(6, 8) === "00" || finalOutput.slice(6, 8) === "24" || finalOutput.slice(6, 8) === "81" || finalOutput.slice(0, 2) === "77"){
        //         setPopupData("7th and 8th digits are '00'. Please verify your data!");
        //         setIsPopupVisible(true);
        //     } else {
        //         setIsPopupVisible(false);
        //     }
        return finalOutput
    };

    const submitBarrelData = async (e: FormEvent) => {
        e.preventDefault();
        // if (!isPopupSubmitted) {
        //     alert("Please submit the popup data first.");
        //     return;
        // }
        // if (isPopupVisible) {
        //     console.log("Popup is still open. Triggering handleSubmitPopup.");           
        //   return ;
        // }
        const finalOutput = generateFinalOutput();

        // if (!finalOutput) {
        //     alert("Please select all barrel values and serial number.");
        //     return;
        // }

        // console.log('before dataTOSubmit');
        dataToSubmit = {
            ...formData,
            finalOutput,
            // partNumbers: formData.partNumbers, // Include partNumbers
            // descriptions: formData.descriptions, // Include descriptions

        };

        // console.log('Retrieved token:', token);
        // console.log('dataToSubmit:', dataToSubmit);
        try {
            const barrelAPI = `barrels`;
            const response = await Post(barrelAPI, dataToSubmit, config);
            const barrelResponse = response.data;
            if (response.status === 200) {
                setResult({ message: `PART/ASSY Number: ${response.data.finalOutput}`, className: "success" });
                // console.log(`PART/ASSY Number: ${response.data.finalOutput}`);
            } else {
                setResult({ message: response.data.message, className: "error" });
                // console.log(response.data.message);
            }

        } catch (error) {
            console.error("Error submitting data:", error);
            // setResult({ message: "Error: Unable to submit data.", className: "error" });


        }
    };

    // const handleSubmitPopup = (data: { serialNumber: string; partNumber: string; description: string }[]) => {
    //     const partNumbers = data.map(item => item.partNumber); // Extract part numbers
    //     const descriptions = data.map(item => item.description); // Extract descriptions

    //     // Update formData with partNumbers and descriptions
    //     setFormData(prev => ({
    //         ...prev,
    //         partNumbers,
    //         descriptions,
    //     }));

    //     console.log('Updated formData:', formData);
    //     // You can now call submitBarrelData or any other necessary actions
    //     setIsPopupSubmitted(true);
    //     setIsPopupVisible(false); 

    // };
    const fetchAllBarrelData = async () => {
        if (!_id) {
            setResultMessage("User not authenticated.");
            return;
        }

        if (!token) {
            setResultMessage("No token provided. Please log in again.");
            return;
        }

        try {
            const response = await Get(`barrels/all`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // console.log("Full API Response:", response);

            if (response.status === 200 && response.data?.barrels && Array.isArray(response.data.barrels)) {
                const data = response.data.barrels;
                // console.log("Barrel Data:", data);

                setBarrelData(data);
                setBarrelDataPop(data);
                // setResultMessage("Barrel data fetched successfully.");                
            } else {
                setResultMessage("Failed to fetch barrel data.");
            }
        } catch (error: any) {
            console.error("Error fetching all barrel data:", error);
            setResultMessage(error?.response?.data?.message || "Error: Unable to fetch barrel data.");
            // console.log(error?.response?.data?.message || "Error: Unable to fetch barrel data.")
        }
    };
    ///////////


    // console.log('barrelData:', barrelData);

    const fetchSingleBarrelData = async () => {

        // if (!finalOutput) {
        //   setResultMessage("Please enter a Final Output value.");
        //   return;
        // }

        try {
            const response = await Get(`barrels/677e368ac14257a1d1ed94cd-139101011021`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // console.log("API Response:", response);

            if (response.status === 200 && response.data) {
                const data = response.data;
                // console.log("Fetched Barrel Data:", data);
                setBarrelData(data);
            } else {
                setResultMessage("No data found for the provided Final Output.");
            }
        } catch (error: any) {
            console.error("Error fetching all barrel data:", error);
            setResultMessage(error?.response?.data?.message || "Error: Unable to fetch barrel data.");
            // console.log(error?.response?.data?.message || "Error: Unable to fetch barrel data.")
        }
    };




    /////////////
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 20;

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;

    // Check if barrelData is an array before slicing
    const currentRows = Array.isArray(barrelData)
        ? barrelData.slice(indexOfFirstRow, indexOfLastRow)
        : [];

    // const filteredData = Array.isArray(barrelData) ?
    //     barrelData.filter((data) =>
    //         data.finalOutput?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    //     )
    //     : [];

    const filteredData = Array.isArray(barrelData) 
    ? barrelData.filter((data) =>
        data.finalOutput?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        (Array.isArray(data.length) 
            ? data.length.some((len: any) => len?.toString().toLowerCase().includes(searchQuery.toLowerCase())) 
            : (data.length as any)?.toString().toLowerCase().includes(searchQuery.toLowerCase()))
    ) 
    : [];


    // Function to handle the next page
    const handleNextPage = () => {
        if (indexOfLastRow < barrelData.length) {
            setCurrentPage(currentPage + 1);
        }
    };
    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    //////////





    // const filteredData = Array.isArray(barrelData) ? 
    //     barrelData.filter((data) =>
    //         data.finalOutput?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    //     ) 
    //     : [];

    // const filteredData = Array.isArray(barrelData)
    //     ? barrelData.filter((data) =>
    //         Object.values(data).some((value) =>
    //             value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    //         )
    //     )
    //     : [];
    const toggleSearchBar = () => {
        setIsSearchBarVisible(!isSearchBarVisible);
    };

    // Handle search input change
    const handleSearchChange = (e: any) => {
        setSearchQuery(e.target.value);
    };
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '75.8vh' }}>

            <Heading as={'h4'}
                fontSize={'14'}
                height={'44px'} lineHeight={'44px'}
                color={'#fff'}
                bgColor={'color.700'}
                pl={'4'}
                display={'flex'}
                justifyContent={'space-around'}
                flexDirection={['column', 'row', 'row', 'row']}
                flexWrap={'wrap'}


            >
                <h1>PROJECT SERIES PART NUMBER   </h1>
            </Heading>



            {/* <form id="barrelForm" onSubmit={submitBarrelData}> */}
            <form id="barrelForm" >
                <Flex m={"20px 0px"} gap="8" flexWrap={['wrap']} justify="space-around">

                    <FormControl w={["100%", "100%", "30%"]} >
                        <FormLabel fontWeight={"700"} fontSize={"14px"}>
                            Barrel 1(Project Code)
                        </FormLabel>

                        <Select
                            placeholder='Select'
                            bg={"#fff"}
                            border={"1px solid #D9D9D9"}
                            id="barrel1"
                            value={formData.barrel1}
                            // onChange={handleChange}
                            onChange={handleBarrel1Change}
                            required
                        >

                            {barrel1.map((value, key) => (
                                <option
                                    key={key}
                                    value={value.value}
                                >
                                    {value.name}
                                </option>
                            ))}
                        </Select>
                    </FormControl>


                    <FormControl w={["100%", "100%", "30%"]} >
                        <FormLabel fontWeight={"700"} fontSize={"14px"}>
                            Barrel 1A(Project Code)
                        </FormLabel>

                        <Select
                            placeholder='Select'
                            bg={"#fff"}
                            border={"1px solid #D9D9D9"}
                            id="barrel1A"
                            value={formData.barrel1A}
                            onChange={handleBarrel1AChange}
                            required
                        >

                            {barrel1AOptions.map((value, key) => (
                                <option key={key} value={value.value}>
                                    {value.name}
                                </option>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl w={["100%", "100%", "30%"]} >
                        <FormLabel fontWeight={"700"} fontSize={"14px"}>
                            Barrel 2(Design Group)
                        </FormLabel>

                        <Select
                            placeholder='Select'
                            bg={"#fff"}
                            border={"1px solid #D9D9D9"}
                            id="barrel2"
                            value={formData.barrel2}
                            onChange={handleBarrel2Change}
                            required
                        >


                            {barrel2Options.map((value, key) => (
                                <option key={key} value={value.value}>
                                    {value.name}
                                </option>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl w={["100%", "100%", "30%"]} >
                        <FormLabel fontWeight={"700"} fontSize={"14px"}>
                            Barrel3(Sub Group)
                        </FormLabel>

                        <Select
                            placeholder='Select'
                            bg={"#fff"}
                            border={"1px solid #D9D9D9"}
                            id="barrel3"
                            value={formData.barrel3}
                            onChange={handleBarrel3Change}
                            required
                        >

                            {barrel3Options.map((value, key) => (
                                <option key={key} value={value.value}>
                                    {value.name}
                                </option>
                            ))}
                        </Select>
                    </FormControl>


                    <FormControl w={["100%", "100%", "30%"]} >
                        <FormLabel fontWeight={"700"} fontSize={"14px"}>
                            Barrel4(Part Designation And Level)
                        </FormLabel>

                        <Select
                            placeholder='Select'
                            bg={"#fff"}
                            border={"1px solid #D9D9D9"}
                            id="barrel4"
                            value={formData.barrel4}
                            onChange={handleChange4}
                            required
                        >


                            {barrel4Options.map((value, key) => (
                                <option key={key} value={value.value}>
                                    {value.name}
                                </option>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl w={["100%", "100%", "30%"]} >
                        <FormLabel fontWeight={"700"} fontSize={"14px"}>Description</FormLabel>
                        <Input
                            placeholder="Enter a description..."
                            bg="#fff"
                            border="1px solid #D9D9D9"
                            id="description"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </FormControl>



                </Flex>


                <FormControl w={["100%"]}>
                    <Stack direction="row" spacing={4} justify="center">
                        <Button
                            height="48px"
                            w="48%"
                            border={"1px solid #7FBF28"}
                            variant="solid"
                            type="button"
                            onClick={clearForm}
                        >
                            Clear
                        </Button>
                        <Button
                            height="48px"
                            bg="#7FBF28"
                            w="48%"
                            color="#fff"
                            _hover={{ bg: "#7FBF28" }}
                            _focus={{ bg: "#7FBF28" }}
                            variant="solid"
                            type="button"
                            onClick={submitBarrelData}
                        >
                            Submit
                        </Button>
                    </Stack>
                </FormControl>

            </form >


            {isPopupVisible && (
                <Popup
                    onClose={handleClosePopup}
                    onSubmit={handleSubmitPopup}
                    imageName={imageName}  // Pass imageName as a prop to Popup
                    barrelDataPop={barrelDataPop}
                />
            )}


            <div style={{ marginTop: "20px", textAlign: "center" }}>
                <div
                    style={{
                        display: 'inline-block',  // Keeps the box tight around the content
                        padding: '20px',
                        borderRadius: '4px',
                        color: result.className === "success" ? "#155724" : result.className === "error" ? "#721c24" : "#555",
                        backgroundColor:
                            result.className === "success"
                                ? "#d4edda"
                                : result.className === "error"
                                    ? "#f8d7da"
                                    : "#e7e7e7",
                        border: result.className === "success"
                            ? "1px solid #c3e6cb"
                            : result.className === "error"
                                ? "1px solid #f5c6cb"
                                : "1px solid #ddd",
                    }}
                >
                    {/* <p id="result" className={result.className}>
                        {result.message}
                    </p> */}
                    <Text color={"red"} fontSize={"18px"} >
                        {result.message}
                    </Text>

                </div>

            </div>

            <div style={{
                width: '100%',
                margin: '0 auto',
                padding: '20px',
                fontSize: '14px'

            }}>


                {/* <FormControl w={["100%"]}>
                    <Stack direction="row" spacing={4} justify="left">
                        <Button
                            height="48px"
                            bg="#7FBF28"
                            w="48%"
                            color="#fff"
                            _hover={{ bg: "#7FBF28" }}
                            _focus={{ bg: "#7FBF28" }}
                            variant="solid"
                            type="button"
                            onClick={fetchAllBarrelData}
                        >
                            Get Logs
                        </Button>
                    </Stack>
                </FormControl> */}



                {/* Search Input */}
                <div style={{ padding: "20px", maxWidth: "100%", margin: "auto" }}>
                    <FormControl w={["100%"]}>
                        <Stack direction="row" spacing={4} justify="center" marginBottom="15px">



                            {Array.isArray(barrelData) && barrelData.length > 0 && (
                                <div style={{ width: "48%" }}>
                                    {/* Styled Search Bar */}
                                    <input
                                        type="text"
                                        placeholder="🔍 Search Final Output..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        style={{
                                            padding: "0px 15px",
                                            height: "48px",
                                            // marginBottom: "15px",
                                            width: "100%",
                                            // maxWidth: "400px",
                                            border: "1px solid #7FBF28",
                                            borderRadius: "25px",
                                            outline: "none",
                                            fontSize: "16px",
                                            boxShadow: "0px 2px 5px rgba(78, 29, 29, 0.1)",
                                            transition: "all 0.3s ease",
                                        }}
                                        onFocus={(e) => (e.target.style.border = "2px solid #7FBF28")}
                                        onBlur={(e) => (e.target.style.border = "1px solid #7FBF28")}
                                    />
                                </div>
                            )}
                            <Button
                                height="48px"
                                bg="#7FBF28"
                                w="48%"
                                color="#fff"
                                _hover={{ bg: "#7FBF28" }}
                                _focus={{ bg: "#7FBF28" }}
                                variant="solid"
                                type="button"
                                onClick={fetchAllBarrelData}
                            >
                                Get Logs
                            </Button>
                        </Stack>
                    </FormControl>
                    {Array.isArray(barrelData) && barrelData.length > 0 && (
                        <div style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid black" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead style={{ position: "sticky", top: "-2px", background: "#007bff", zIndex: 1 }}>
                                    <tr style={{ fontWeight: 700, fontSize: "14px", color: "#fff" }}>
                                        <th style={{ padding: "12px", textAlign: "left", border: "2px solid black" }}>Serial No.</th>
                                        <th style={{ padding: "12px", textAlign: "left", border: "2px solid black" }}>Barrel 1</th>
                                        <th style={{ padding: "12px", textAlign: "left", border: "2px solid black" }}>Barrel 1A</th>
                                        <th style={{ padding: "12px", textAlign: "left", border: "2px solid black" }}>Barrel 2</th>
                                        <th style={{ padding: "12px", textAlign: "left", border: "2px solid black" }}>Barrel 3</th>
                                        <th style={{ padding: "12px", textAlign: "left", border: "2px solid black" }}>Barrel 4</th>
                                        <th style={{ padding: "12px", textAlign: "left", border: "2px solid black" }}>Description</th>
                                        <th style={{ padding: "12px", textAlign: "left", border: "2px solid black" }}>Final Output</th>
                                        <th style={{ padding: "12px", textAlign: "left", border: "2px solid black" }}>Submitted At</th>
                                        <th style={{ padding: "12px", textAlign: "left", border: "2px solid black" }}>Part Numbers</th>
                                        <th style={{ padding: "12px", textAlign: "left", border: "2px solid black" }}>Descriptions</th>
                                        <th style={{ padding: "12px", textAlign: "left", border: "2px solid black" }}>Length</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((data, index) => {
                                        const originalIndex = barrelData.findIndex((d) => d === data);
                                        const partNumbers = data.partNumbers || [];
                                        const isExpanded = expandedRow === index;

                                        return (
                                            <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#ffffff" }}>
                                                <td style={{ padding: "12px", textAlign: "left", border: "2px solid black" }}>
                                                    {originalIndex + 1}
                                                </td>
                                                <td style={{ padding: "12px", textAlign: "left", border: "2px solid black" }}>{data.barrel1 || "N/A"}</td>
                                                <td style={{ padding: "12px", textAlign: "left", border: "2px solid black" }}>{data.barrel1A || "N/A"}</td>
                                                <td style={{ padding: "12px", textAlign: "left", border: "2px solid black" }}>{data.barrel2 || "N/A"}</td>
                                                <td style={{ padding: "12px", textAlign: "left", border: "2px solid black" }}>{data.barrel3 || "N/A"}</td>
                                                <td style={{ padding: "12px", textAlign: "left", border: "2px solid black" }}>{data.barrel4 || "N/A"}</td>
                                                <td style={{ padding: "12px", textAlign: "left", border: "2px solid black" }}>{data.description || "N/A"}</td>

                                                <td style={{ padding: "12px", textAlign: "left", border: "2px solid black" }}>
                                                    {data.finalOutput?.length > 12 ? data.finalOutput.slice(-12) : data.finalOutput || "N/A"}
                                                </td>
                                                <td style={{ padding: "12px", textAlign: "left", border: "2px solid black" }}>
                                                    {data.submittedAt ? new Date(data.submittedAt).toLocaleString() : "N/A"}
                                                </td>

                                                {/* Part Numbers with Expand Option */}
                                                <td
                                                    style={{ padding: "12px", textAlign: "left", border: "2px solid black", cursor: "pointer" }}
                                                    onClick={() => setExpandedRow(isExpanded ? null : index)}
                                                >
                                                    {isExpanded
                                                        ? partNumbers.filter(Boolean).join(", ")  // Show all when expanded
                                                        : partNumbers.filter(Boolean).slice(0, 2).join(", ") + (partNumbers.filter(Boolean).length > 2 ? "..." : "")
                                                    }
                                                </td>

                                                {/* <td style={{ padding: "12px", textAlign: "left", border: "2px solid black" }}>
                                    {data.descriptions?.length ? data.descriptions.join(", ") : "N/A"}
                                </td> */}
                                                <td
                                                    style={{ padding: "12px", textAlign: "left", border: "2px solid black", cursor: "pointer" }}
                                                    onClick={() => setExpandedRow(isExpanded ? null : index)}
                                                >
                                                    {isExpanded
                                                        ? data.descriptions.filter(Boolean).join(", ")  // Show all when expanded
                                                        : data.descriptions.filter(Boolean).slice(0, 2).join(", ") + (data.descriptions.filter(Boolean).length > 2 ? "..." : "")
                                                    }
                                                </td>
                                                <td
                                                    style={{ padding: "12px", textAlign: "left", border: "2px solid black", cursor: "pointer" }}
                                                    onClick={() => setExpandedRow(isExpanded ? null : index)}
                                                >
                                                    {data.length.filter(Boolean).length > 0
                                                        ? isExpanded
                                                            ? data.length.filter(Boolean).join(", ") // Show all when expanded
                                                            : data.length.filter(Boolean).slice(0, 2).join(", ") + (data.length.filter(Boolean).length > 2 ? "..." : "")
                                                        : "N/A"}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}



                </div>
            </div>


            <div>












            </div>
        </div>

















    );
};

export default BarrelDataForm;