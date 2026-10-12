// import { FC } from 'react';
// import {
//     Button,
//     Flex,
//     FormControl,
//     FormLabel,
//     Input,
//     Select,
//     Stack,
//     Popover,
//     PopoverTrigger,
//     PopoverContent,
//     PopoverBody,
//     PopoverArrow,
//     FormHelperText,
//     Text,
// } from "@chakra-ui/react";
// import { useState } from "react";
// import { InfoIcon } from '@chakra-ui/icons'
// import { useForm } from "react-hook-form";
// import { useNavigate } from "react-router-dom";
// import { useSelector, useDispatch } from 'react-redux';
// import { setHomologationDatas, setRequestId, setCategory } from '../../features/homologation/homologationSlice';
// import { RootState } from "../../app/store";
// import { Post } from "../../utilities/service";
// import {
//     typeOfVehicle,
//     fuelType,
//     TypeofCertification,
//     VehicleMaxspeed,
//     NominalPowerofMotor,
//     PeakPowerofMotor,
//     Category,
//     PrefferedTestingAgency,
//     Length,
//     Width,
//     Height,
//     CmvrExemption,
//     L1Category,
//     L2Category,
//     ERickshaw,
//     L5ML5N
// } from "../../constant/homologation";
// /* Form Validation */
// interface ChildProps {
//     onClose: () => any;
// }

// const Newhomologation: FC<ChildProps> = ({ onClose }) => {

//     const token: string = useSelector((state: RootState) => state.loginCredential.token);
//     const [checkVehicleType, setcheckVehicleType] = useState<string>("");
//     const [speedValue, setspeedValue] = useState<string>("");
//     const [nominalPower, setnominalPower] = useState<string>("");
//     const [peekPower, setpeekPower] = useState<string>("");
//     const [width, setwidth] = useState<string>("");
//     const [length, setlength] = useState<string>("");
//     const [height, setheight] = useState<string>("");

//     const { handleSubmit, register, formState: { errors, isSubmitting }, } = useForm()

//     const config = {
//         headers: {
//             Authorization: 'Bearer ' + token
//         }
//     }
//     const searchApiURL = "homologationRequest/";
//     const navigate = useNavigate();
//     const dispatch = useDispatch()

//     const storeHomologationData = async (homologationData: any) => {
//         await Post(searchApiURL, homologationData, config)
//             .then((resp) => {
//                 if (resp.data.status === 'success') {
//                     let requestType = { 'fuel_type': homologationData.fuel_type, 'vehicle_type': homologationData.vehicle_type }
//                     dispatch(setHomologationDatas(requestType));
//                     dispatch(setCategory(homologationData.vehicle_category));
//                     dispatch(setRequestId(resp.data.body.homologationRequest._id));
//                     navigate("/Homologation")
//                 }
//                 if (resp.data.status === 'failure') {
//                     // console.log(resp.data.body.split('key: '));                    
//                 }
//             })
//             .catch((error) => {
//                 console.log('error');
//             });
//     };

//     const changeHandler = (event: any) => {
//         if (event.target.value === '2-Wheeler' || event.target.value === '3-Wheeler') {
//             setcheckVehicleType(event.target.value);
//         }
//         if (event.target.name === 'vehicle_max_speed') {
//             setspeedValue(event.target.value)
//         }
//         if (event.target.name === 'motor_nominal_power') {
//             setnominalPower(event.target.value)
//         }
//         if (event.target.name === 'motor_peak_power') {
//             setpeekPower(event.target.value)
//         }


//         if (event.target.name === 'vehicle_length') {
//             setlength(event.target.value)
//         }
//         if (event.target.name === 'vehicle_height') {
//             setheight(event.target.value)
//         }
//         if (event.target.name === 'vehicle_width') {
//             setwidth(event.target.value)
//         }


//     }

//     const onSubmit = (data: any) => {
//         storeHomologationData(data);
//     };

//     return (
//         <>
//             <form onSubmit={handleSubmit(onSubmit)}>
//                 <Flex m={"20px 0px"} gap="8" flexWrap={['wrap']} justify="space-around">

//                     <FormControl w={["100%", "100%", "30%"]} >
//                         <FormLabel fontWeight={"700"} fontSize={"14px"}>Type of Vehicle <Text as={'span'} className='requiredField'>*</Text></FormLabel>
//                         <Select placeholder='Select Type of Vehicle' bg={"#fff"} border={"1px solid #D9D9D9"}

//                             {...register('vehicle_type', {
//                                 onChange: (e) => { changeHandler(e) },
//                                 required: 'Please select type of vehicle',
//                             })
//                             }

//                         >
//                             {
//                                 typeOfVehicle.map((value, key) => <option key={key} disabled={value.disabled} value={value.value}>{value.name}</option>)
//                             }

//                         </Select>
//                         <FormHelperText color="red">
//                             <>
//                                 {errors.vehicle_type && errors.vehicle_type.message}
//                             </>
//                         </FormHelperText>
//                     </FormControl>
//                     <FormControl w={["100%", "100%", "30%"]} >
//                         <FormLabel fontWeight={"700"} fontSize={"14px"}>Fuel Type <Text as={'span'} className='requiredField'>*</Text></FormLabel>
//                         <Select placeholder='Select Fuel Type' bg={"#fff"} border={"1px solid #D9D9D9"}

//                             {...register('fuel_type', {
//                                 onChange: (e) => { changeHandler(e) },
//                                 required: 'Please select fuel type',
//                             })
//                             }
//                         >
//                             {
//                                 fuelType.map((value, key) => <option key={key} disabled={value.disabled} value={value.value}>{value.name}</option>)
//                             }
//                         </Select>
//                         <FormHelperText color="red">
//                             <>
//                                 {errors.fuel_type && errors.fuel_type.message}
//                             </>
//                         </FormHelperText>
//                     </FormControl>
//                     <FormControl w={["100%", "100%", "30%"]} >
//                         <FormLabel fontWeight={"700"} fontSize={"14px"}>Type of Certification <Text as={'span'} className='requiredField'>*</Text></FormLabel>
//                         <Select placeholder='Select Type of Certification' bg={"#fff"} border={"1px solid #D9D9D9"}

//                             {...register('certification_type', {
//                                 onChange: (e) => { changeHandler(e) },
//                                 required: 'Please select type of certification',
//                             })
//                             }
//                         >
//                             {
//                                 TypeofCertification.map((value, key) => <option key={key} disabled={value.disabled} value={value.value}>{value.name}</option>)
//                             }
//                         </Select>
//                         <Popover>
//                             <PopoverTrigger>
//                                 <Button
//                                     bg="transparent"
//                                     _hover={{ bg: 'transparent' }}
//                                     _focus={{ bg: 'transparent' }}
//                                     position={"absolute"}
//                                     right={"-45px"}
//                                     top={"30px"}>
//                                     <InfoIcon boxSize={6} color={"#C4C4C4"} />
//                                 </Button>
//                             </PopoverTrigger>
//                             <PopoverContent>
//                                 <PopoverArrow />

//                                 <PopoverBody>Type approval or certificate of conformity is granted to a product that meets a minimum set of regulatory,
//                                     technical and safety requirements. Generally, type approval is required before a product is allowed to be sold in
//                                     a particular country, so the requirements for a given product will vary around the world. Processes and certifications known as
//                                     type approval in English are often called homologation

//                                     <Text color="blue"> <a href="https://www.araiindia.com/services/certification-and-standardisation/type-approval" target="_blank">ARAI</a></Text>
//                                 </PopoverBody>
//                             </PopoverContent>
//                         </Popover>

//                         <FormHelperText color="red">
//                             <>
//                                 {errors.certification_type && errors.certification_type.message}
//                             </>
//                         </FormHelperText>
//                     </FormControl>
//                     <FormControl w={["100%", "100%", "30%"]} >
//                         <FormLabel fontWeight={"700"} fontSize={"14px"}>Vehicle Max Speed <Text as={'span'} className='requiredField'>*</Text></FormLabel>
//                         <Select placeholder='Select Vehicle Max Speed' bg={"#fff"} border={"1px solid #D9D9D9"}

//                             {...register('vehicle_max_speed', {
//                                 onChange: (e) => { changeHandler(e) },
//                                 required: 'Please Select vehicle max speed',
//                             })
//                             }
//                         >
//                             {

//                                 VehicleMaxspeed.map((value, key) => {
//                                     return (
//                                         checkVehicleType === value.typeOfVehicle &&
//                                         <option key={key} disabled={value.disabled} value={value.value}>{value.name}</option>
//                                     )
//                                 })
//                             }
//                         </Select>
//                         <FormHelperText color="red">
//                             <>
//                                 {errors.vehicle_max_speed && errors.vehicle_max_speed.message}
//                             </>
//                         </FormHelperText>
//                     </FormControl>
//                     <FormControl w={["100%", "100%", "30%"]} >
//                         <FormLabel fontWeight={"700"} fontSize={"14px"}>Nominal  Power of Motor <Text as={'span'} className='requiredField'>*</Text></FormLabel>
//                         <Select placeholder='Select Nominal  Power of Motor' bg={"#fff"} border={"1px solid #D9D9D9"}

//                             {...register('motor_nominal_power', {
//                                 onChange: (e) => { changeHandler(e) },
//                                 required: 'Please Select nominal  power of motor',
//                             })
//                             }
//                         >
//                             {
//                                 NominalPowerofMotor.map((value, key) => {
//                                     return (
//                                         checkVehicleType === value.typeOfVehicle &&
//                                         <option key={key} disabled={value.disabled} value={value.value}>{value.name}</option>
//                                     )
//                                 })
//                             }
//                         </Select>
//                         <FormHelperText color="red">
//                             <>
//                                 {errors.motor_nominal_power && errors.motor_nominal_power.message}
//                             </>
//                         </FormHelperText>
//                     </FormControl>
//                     <FormControl w={["100%", "100%", "30%"]} >
//                         <FormLabel fontWeight={"700"} fontSize={"14px"}>Peak power of motor <Text as={'span'} className='requiredField'>*</Text></FormLabel>

//                         <Select placeholder='Select Peek power of motor' bg={"#fff"} border={"1px solid #D9D9D9"}

//                             {...register('motor_peak_power', {
//                                 onChange: (e) => { changeHandler(e) },
//                                 required: 'Please Select peek power of motor',
//                             })
//                             }
//                         >
//                             {
//                                 PeakPowerofMotor.map((value, key) => {
//                                     return (
//                                         checkVehicleType === value.typeOfVehicle &&
//                                         <option key={key} disabled={value.disabled} value={value.value}>{value.name}</option>
//                                     )
//                                 })
//                             }
//                         </Select>


//                         <Popover>
//                             <PopoverTrigger>
//                                 <Button
//                                     bg="transparent"
//                                     _hover={{ bg: 'transparent' }}
//                                     _focus={{ bg: 'transparent' }}
//                                     position={"absolute"}
//                                     right={"-45px"}
//                                     top={"30px"}>
//                                     <InfoIcon boxSize={6} color={"#C4C4C4"} />
//                                 </Button>
//                             </PopoverTrigger>
//                             <PopoverContent>
//                                 <PopoverArrow />

//                                 <PopoverBody>Peak power refers to the maximum amount of power the motor can consume for a short
//                                     period of time. It is also not the most useful measure for comparing electric scooters because
//                                     how it is measured also doesn't seem to be universal. Additionally, peak power is often 2 to 5X
//                                     greater than continuous power.</PopoverBody>
//                             </PopoverContent>
//                         </Popover>
//                         <FormHelperText color="red">
//                             <>
//                                 {errors.motor_peak_power && errors.motor_peak_power.message}
//                             </>
//                         </FormHelperText>
//                     </FormControl>
//                     <FormControl w={["100%", "100%", "30%"]} >
//                         <FormLabel fontWeight={"700"} fontSize={"14px"}>Length <Text as={'span'} className='requiredField'>*</Text></FormLabel>

//                         <Select placeholder='Select Length' bg={"#fff"} border={"1px solid #D9D9D9"}

//                             {...register('vehicle_length', {
//                                 onChange: (e) => { changeHandler(e) },
//                                 required: 'Please select length',
//                             })
//                             }
//                         >
//                             {
//                                 Length.map((value, key) => {
//                                     return (
//                                         checkVehicleType === value.typeOfVehicle &&
//                                         <option key={key} disabled={value.disabled} value={value.value}>{value.name}</option>
//                                     )
//                                 })
//                             }
//                         </Select>
//                         <Popover>
//                             <PopoverTrigger>
//                                 <Button
//                                     bg="transparent"
//                                     _hover={{ bg: 'transparent' }}
//                                     _focus={{ bg: 'transparent' }}
//                                     position={"absolute"}
//                                     right={"-45px"}
//                                     top={"30px"}>
//                                     <InfoIcon boxSize={6} color={"#C4C4C4"} />
//                                 </Button>
//                             </PopoverTrigger>
//                             <PopoverContent>
//                                 <PopoverArrow />

//                                 <PopoverBody>Please Enter Length Here</PopoverBody>
//                             </PopoverContent>
//                         </Popover>
//                         <FormHelperText color="red">
//                             <>
//                                 {errors.vehicle_length && errors.vehicle_length.message}
//                             </>
//                         </FormHelperText>
//                     </FormControl>
//                     <FormControl w={["100%", "100%", "30%"]} >
//                         <FormLabel fontWeight={"700"} fontSize={"14px"}>Height <Text as={'span'} className='requiredField'>*</Text></FormLabel>


//                         <Select placeholder='Select Height' bg={"#fff"} border={"1px solid #D9D9D9"}

//                             {...register('vehicle_height', {
//                                 onChange: (e) => { changeHandler(e) },
//                                 required: 'Please select height',
//                             })
//                             }
//                         >
//                             {
//                                 Height.map((value, key) => {
//                                     return (
//                                         checkVehicleType === value.typeOfVehicle &&
//                                         <option key={key} disabled={value.disabled} value={value.value}>{value.name}</option>
//                                     )
//                                 })
//                             }
//                         </Select>
//                         <FormHelperText color="red">
//                             <>
//                                 {errors.vehicle_height && errors.vehicle_height.message}
//                             </>
//                         </FormHelperText>
//                     </FormControl>
//                     <FormControl w={["100%", "100%", "30%"]} >
//                         <FormLabel fontWeight={"700"} fontSize={"14px"}>Width <Text as={'span'} className='requiredField'>*</Text></FormLabel>

//                         <Select placeholder='Select Width' bg={"#fff"} border={"1px solid #D9D9D9"}

//                             {...register('vehicle_width', {
//                                 onChange: (e) => { changeHandler(e) },
//                                 required: 'Please select width',
//                             })
//                             }

//                         >
//                             {
//                                 Width.map((value, key) => {
//                                     return (
//                                         checkVehicleType === value.typeOfVehicle &&
//                                         <option key={key} disabled={value.disabled} value={value.value}>{value.name}</option>
//                                     )
//                                 })
//                             }
//                         </Select>
//                         <FormHelperText color="red">
//                             <>
//                                 {errors.vehicle_width && errors.vehicle_width.message}
//                             </>
//                         </FormHelperText>
//                     </FormControl>
//                     <FormControl w={["100%", "100%", "30%"]} >
//                         <FormLabel fontWeight={"700"} fontSize={"14px"}>Unloaded Weight (w/o Battery) <Text as={'span'} className='requiredField'>*</Text></FormLabel>
//                         <Input placeholder='Battery weight'
//                             bg={"#fff"} border={"1px solid #D9D9D9"}
//                             {...register('vehicle_unloded_weight', {
//                                 required: 'This feild is required',
//                             })
//                             }
//                         />
//                         <FormHelperText color="red">
//                             <>
//                                 {errors.vehicle_unloded_weight && errors.vehicle_unloded_weight.message}
//                             </>
//                         </FormHelperText>
//                     </FormControl>
//                     <FormControl w={["100%", "100%", "30%"]} >
//                         <FormLabel fontWeight={"700"} fontSize={"14px"}>Category <Text as={'span'} className='requiredField'>*</Text></FormLabel>
//                         <Select placeholder='Select Category' bg={"#fff"} border={"1px solid #D9D9D9"}
//                             {...register('vehicle_category', {
//                                 onChange: (e) => { changeHandler(e) },
//                                 required: 'Please select category',
//                             })
//                             }

//                         >
//                        // Update the options based on specific category conditions for CMVR exemption, L2, L5 categories
//                             {
//                                 Category && Category.map((value, key) => (
//                                     <option key={key} disabled={value.disabled} value={value.value}>
//                                         {value.name}
//                                     </option>
//                                 ))
//                             }
//                         </Select>
//                         <FormHelperText color="red">
//                             <>
//                                 {errors.vehicle_category && errors.vehicle_category.message}
//                             </>
//                         </FormHelperText>
//                     </FormControl>

//                     <FormControl w={["100%", "100%", "30%"]} >
//                         <FormLabel fontWeight={"700"} fontSize={"14px"}>Prefered Testing Agency <Text as={'span'} className='requiredField'>*</Text></FormLabel>

//                         <Select placeholder='Prefered Testing Agency' bg={"#fff"} border={"1px solid #D9D9D9"}

//                             {...register('prefered_testing_agency', {
//                                 onChange: (e) => { changeHandler(e) },
//                                 required: 'Please prefered testing Agency',
//                             })
//                             }
//                         >
//                             {
//                                 PrefferedTestingAgency.map((value, key) => <option key={key} disabled={value.disabled} value={value.value}>{value.name}</option>)
//                             }
//                         </Select>
//                         <FormHelperText color="red">
//                             <>
//                                 {errors.prefered_testing_agency && errors.prefered_testing_agency.message}
//                             </>
//                         </FormHelperText>

//                     </FormControl>
//                     <FormControl w={["100%"]} >
//                         <Stack direction='row' spacing={4} justify="right">

//                             <Button
//                                 variant='outline'
//                                 border={"1px solid #7FBF28"}
//                                 w={"100px"}
//                                 height='48px'
//                                 type='reset'
//                                 onClick={onClose}
//                             >
//                                 Cancel
//                             </Button>
//                             <Button
//                                 height='48px'
//                                 bg="#7FBF28"
//                                 w={"100px"}
//                                 color='#fff'
//                                 _hover={{ bg: '#7FBF28' }}
//                                 _focus={{ bg: '#7FBF28' }} variant='solid'
//                                 type="submit"
//                             >
//                                 Next
//                             </Button>
//                         </Stack>
//                     </FormControl>

//                 </Flex>
//             </form>

//         </>
//     )
// }

// export default Newhomologation;

import { FC } from 'react';
import {
    Button,
    Flex,
    FormControl,
    FormLabel,
    Input,
    Select,
    Stack,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverBody,
    PopoverArrow,
    FormHelperText,
    Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { InfoIcon } from '@chakra-ui/icons'
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { setHomologationDatas, setRequestId, setCategory } from '../../features/homologation/homologationSlice';
import { RootState } from "../../app/store";
import { Post } from "../../utilities/service";
import ApproveSuccess from "../Auth/approveSuccess";

import {
    typeOfVehicle,
    fuelType,
    TypeofCertification,
    VehicleMaxspeed,
    NominalPowerofMotor,
    PeakPowerofMotor,
    Category,
    PrefferedTestingAgency,
    Length,
    Width,
    Height,
    CmvrExemption,
    L1Category,
    L2Category,
    ERickshaw,
    L5ML5N
} from "../../constant/homologation";
/* Form Validation */
interface ChildProps {
  onClose: () => void;
  onSuccess: (requestId: string) => Promise<void>;
}

const Newhomologation: FC<ChildProps> = ({ onClose ,onSuccess}) => {

    const [showSuccess, setShowSuccess] = useState(false);
    const [createdRequestId, setCreatedRequestId] = useState("");
    const [createdVehicleType, setCreatedVehicleType] = useState("");

    const token: string = useSelector((state: RootState) => state.loginCredential.token);
    const vehicleType1 = useSelector((state: RootState) => state.loginCredential.vehicleType);
    const [checkVehicleType, setcheckVehicleType] = useState<string>("");
    const [speedValue, setspeedValue] = useState<string>("");
    const [nominalPower, setnominalPower] = useState<string>("");
    const [peekPower, setpeekPower] = useState<string>("");
    const [width, setwidth] = useState<string>("");
    const [length, setlength] = useState<string>("");
    const [height, setheight] = useState<string>("");

    const { handleSubmit, register, formState: { errors, isSubmitting }, } = useForm()

    const config = {
        headers: {
            Authorization: 'Bearer ' + token
        }
    }
    const searchApiURL = "homologationRequest/";
    const navigate = useNavigate();
    const dispatch = useDispatch()

    const storeHomologationData = async (homologationData: any) => {
    await Post(searchApiURL, homologationData, config)
        .then(async (resp) => {
            if (resp.data.status === "success") {

    const newRequestId =
        resp.data.body.homologationRequest._id;

    const requestType = {
        fuel_type: homologationData.fuel_type,
        vehicle_type: homologationData.vehicle_type
    };

    dispatch(setHomologationDatas(requestType));
    dispatch(setCategory(homologationData.vehicle_category));
    dispatch(setRequestId(newRequestId));

    // Store the newly created request ID
    setCreatedRequestId(newRequestId);
    setCreatedVehicleType(homologationData.vehicle_type);

    // Show success popup
    setShowSuccess(true);

    // For Bus, refresh the Bus request list after success
    if (homologationData.vehicle_type === "Bus") {
        
    }
}

            if (resp.data.status === 'failure') {
                // handle failure
            }
        })
        .catch((error) => {
            console.error("Error storing homologation data:", error);
        });
};

    const changeHandler = (event: any) => {
        // if (event.target.value === '2-Wheeler' || event.target.value === '3-Wheeler') {
        //     setcheckVehicleType(event.target.value);
        // }
        if (event.target.name === "vehicle_type") {
    setcheckVehicleType(event.target.value);
}
        if (event.target.name === 'vehicle_max_speed') {
            setspeedValue(event.target.value)
        }
        if (event.target.name === 'motor_nominal_power') {
            setnominalPower(event.target.value)
        }
        if (event.target.name === 'motor_peak_power') {
            setpeekPower(event.target.value)
        }


        if (event.target.name === 'vehicle_length') {
            setlength(event.target.value)
        }
        if (event.target.name === 'vehicle_height') {
            setheight(event.target.value)
        }
        if (event.target.name === 'vehicle_width') {
            setwidth(event.target.value)
        }


    }

    const onSubmit = (data: any) => {
        storeHomologationData(data);
    };
    console.log("vehicleType1 =", vehicleType1);

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Flex m={"20px 0px"} gap="8" flexWrap={['wrap']} justify="space-around">

                    <FormControl w={["100%", "100%", "30%"]} >
                        <FormLabel fontWeight={"700"} fontSize={"14px"}>Type of Vehicle <Text as={'span'} className='requiredField'>*</Text></FormLabel>
                        <Select placeholder='Select Type of Vehicle' bg={"#fff"} border={"1px solid #D9D9D9"}

                            {...register('vehicle_type', {
                                onChange: (e) => { changeHandler(e) },
                                required: 'Please select type of vehicle',
                            })
                            }

                        >
                            {/* {
                                typeOfVehicle.map((value, key) => <option key={key} disabled={value.disabled} value={value.value}>{value.name}</option>)
                            } */}
                            {
                                typeOfVehicle.map((item) =>
                                    <option
                                        key={item.value}
                                        value={item.value}
                                        disabled={item.value !== vehicleType1}  // disable all except selected vehicle type
                                    >
                                        {item.name}
                                    </option>
                                )
                            }

                        </Select>
                        <FormHelperText color="red">
                            <>
                                {errors.vehicle_type && errors.vehicle_type.message}
                            </>
                        </FormHelperText>
                    </FormControl>
                    <FormControl w={["100%", "100%", "30%"]} >
                        <FormLabel fontWeight={"700"} fontSize={"14px"}>Fuel Type <Text as={'span'} className='requiredField'>*</Text></FormLabel>
                        <Select placeholder='Select Fuel Type' bg={"#fff"} border={"1px solid #D9D9D9"}

                            {...register('fuel_type', {
                                onChange: (e) => { changeHandler(e) },
                                required: 'Please select fuel type',
                            })
                            }
                        >
                            {
                                fuelType.map((value, key) => <option key={key} disabled={value.disabled} value={value.value}>{value.name}</option>)
                            }
                        </Select>
                        <FormHelperText color="red">
                            <>
                                {errors.fuel_type && errors.fuel_type.message}
                            </>
                        </FormHelperText>
                    </FormControl>
                    <FormControl w={["100%", "100%", "30%"]} >
                        <FormLabel fontWeight={"700"} fontSize={"14px"}>Type of Certification <Text as={'span'} className='requiredField'>*</Text></FormLabel>
                        <Select placeholder='Select Type of Certification' bg={"#fff"} border={"1px solid #D9D9D9"}

                            {...register('certification_type', {
                                onChange: (e) => { changeHandler(e) },
                                required: 'Please select type of certification',
                            })
                            }
                        >
                            {
                                TypeofCertification.map((value, key) => <option key={key} disabled={value.disabled} value={value.value}>{value.name}</option>)
                            }
                        </Select>
                        <Popover>
                            <PopoverTrigger>
                                <Button
                                    bg="transparent"
                                    _hover={{ bg: 'transparent' }}
                                    _focus={{ bg: 'transparent' }}
                                    position={"absolute"}
                                    right={"-45px"}
                                    top={"30px"}>
                                    <InfoIcon boxSize={6} color={"#C4C4C4"} />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent>
                                <PopoverArrow />

                                <PopoverBody>Type approval or certificate of conformity is granted to a product that meets a minimum set of regulatory,
                                    technical and safety requirements. Generally, type approval is required before a product is allowed to be sold in
                                    a particular country, so the requirements for a given product will vary around the world. Processes and certifications known as
                                    type approval in English are often called homologation

                                    <Text color="blue"> <a href="https://www.araiindia.com/services/certification-and-standardisation/type-approval" target="_blank">ARAI</a></Text>
                                </PopoverBody>
                            </PopoverContent>
                        </Popover>

                        <FormHelperText color="red">
                            <>
                                {errors.certification_type && errors.certification_type.message}
                            </>
                        </FormHelperText>
                    </FormControl>
                    <FormControl w={["100%", "100%", "30%"]} >
                        <FormLabel fontWeight={"700"} fontSize={"14px"}>Vehicle Max Speed <Text as={'span'} className='requiredField'>*</Text></FormLabel>
                        <Select placeholder='Select Vehicle Max Speed' bg={"#fff"} border={"1px solid #D9D9D9"}

                            {...register('vehicle_max_speed', {
                                onChange: (e) => { changeHandler(e) },
                                required: 'Please Select vehicle max speed',
                            })
                            }
                        >
                            {

                                VehicleMaxspeed.map((value, key) => {
                                    return (
                                        checkVehicleType === value.typeOfVehicle &&
                                        <option key={key} disabled={value.disabled} value={value.value}>{value.name}</option>
                                    )
                                })
                            }
                        </Select>
                        <FormHelperText color="red">
                            <>
                                {errors.vehicle_max_speed && errors.vehicle_max_speed.message}
                            </>
                        </FormHelperText>
                    </FormControl>
                    <FormControl w={["100%", "100%", "30%"]} >
                        <FormLabel fontWeight={"700"} fontSize={"14px"}>Nominal  Power of Motor <Text as={'span'} className='requiredField'>*</Text></FormLabel>
                        <Select placeholder='Select Nominal  Power of Motor' bg={"#fff"} border={"1px solid #D9D9D9"}

                            {...register('motor_nominal_power', {
                                onChange: (e) => { changeHandler(e) },
                                required: 'Please Select nominal  power of motor',
                            })
                            }
                        >
                            {
                                NominalPowerofMotor.map((value, key) => {
                                    return (
                                        checkVehicleType === value.typeOfVehicle &&
                                        <option key={key} disabled={value.disabled} value={value.value}>{value.name}</option>
                                    )
                                })
                            }
                        </Select>
                        <FormHelperText color="red">
                            <>
                                {errors.motor_nominal_power && errors.motor_nominal_power.message}
                            </>
                        </FormHelperText>
                    </FormControl>
                    <FormControl w={["100%", "100%", "30%"]} >
                        <FormLabel fontWeight={"700"} fontSize={"14px"}>Peak power of motor <Text as={'span'} className='requiredField'>*</Text></FormLabel>

                        <Select placeholder='Select Peek power of motor' bg={"#fff"} border={"1px solid #D9D9D9"}

                            {...register('motor_peak_power', {
                                onChange: (e) => { changeHandler(e) },
                                required: 'Please Select peek power of motor',
                            })
                            }
                        >
                            {
                                PeakPowerofMotor.map((value, key) => {
                                    return (
                                        checkVehicleType === value.typeOfVehicle &&
                                        <option key={key} disabled={value.disabled} value={value.value}>{value.name}</option>
                                    )
                                })
                            }
                        </Select>


                        <Popover>
                            <PopoverTrigger>
                                <Button
                                    bg="transparent"
                                    _hover={{ bg: 'transparent' }}
                                    _focus={{ bg: 'transparent' }}
                                    position={"absolute"}
                                    right={"-45px"}
                                    top={"30px"}>
                                    <InfoIcon boxSize={6} color={"#C4C4C4"} />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent>
                                <PopoverArrow />

                                <PopoverBody>Peak power refers to the maximum amount of power the motor can consume for a short
                                    period of time. It is also not the most useful measure for comparing electric scooters because
                                    how it is measured also doesn't seem to be universal. Additionally, peak power is often 2 to 5X
                                    greater than continuous power.</PopoverBody>
                            </PopoverContent>
                        </Popover>
                        <FormHelperText color="red">
                            <>
                                {errors.motor_peak_power && errors.motor_peak_power.message}
                            </>
                        </FormHelperText>
                    </FormControl>
                    <FormControl w={["100%", "100%", "30%"]} >
                        <FormLabel fontWeight={"700"} fontSize={"14px"}>Length <Text as={'span'} className='requiredField'>*</Text></FormLabel>

                        <Select placeholder='Select Length' bg={"#fff"} border={"1px solid #D9D9D9"}

                            {...register('vehicle_length', {
                                onChange: (e) => { changeHandler(e) },
                                required: 'Please select length',
                            })
                            }
                        >
                            {
                                Length.map((value, key) => {
                                    return (
                                        checkVehicleType === value.typeOfVehicle &&
                                        <option key={key} disabled={value.disabled} value={value.value}>{value.name}</option>
                                    )
                                })
                            }
                        </Select>
                        <Popover>
                            <PopoverTrigger>
                                <Button
                                    bg="transparent"
                                    _hover={{ bg: 'transparent' }}
                                    _focus={{ bg: 'transparent' }}
                                    position={"absolute"}
                                    right={"-45px"}
                                    top={"30px"}>
                                    <InfoIcon boxSize={6} color={"#C4C4C4"} />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent>
                                <PopoverArrow />

                                <PopoverBody>Please Enter Length Here</PopoverBody>
                            </PopoverContent>
                        </Popover>
                        <FormHelperText color="red">
                            <>
                                {errors.vehicle_length && errors.vehicle_length.message}
                            </>
                        </FormHelperText>
                    </FormControl>
                    <FormControl w={["100%", "100%", "30%"]} >
                        <FormLabel fontWeight={"700"} fontSize={"14px"}>Height <Text as={'span'} className='requiredField'>*</Text></FormLabel>


                        <Select placeholder='Select Height' bg={"#fff"} border={"1px solid #D9D9D9"}

                            {...register('vehicle_height', {
                                onChange: (e) => { changeHandler(e) },
                                required: 'Please select height',
                            })
                            }
                        >
                            {
                                Height.map((value, key) => {
                                    return (
                                        checkVehicleType === value.typeOfVehicle &&
                                        <option key={key} disabled={value.disabled} value={value.value}>{value.name}</option>
                                    )
                                })
                            }
                        </Select>
                        <FormHelperText color="red">
                            <>
                                {errors.vehicle_height && errors.vehicle_height.message}
                            </>
                        </FormHelperText>
                    </FormControl>
                    <FormControl w={["100%", "100%", "30%"]} >
                        <FormLabel fontWeight={"700"} fontSize={"14px"}>Width <Text as={'span'} className='requiredField'>*</Text></FormLabel>

                        <Select placeholder='Select Width' bg={"#fff"} border={"1px solid #D9D9D9"}

                            {...register('vehicle_width', {
                                onChange: (e) => { changeHandler(e) },
                                required: 'Please select width',
                            })
                            }

                        >
                            {
                                Width.map((value, key) => {
                                    return (
                                        checkVehicleType === value.typeOfVehicle &&
                                        <option key={key} disabled={value.disabled} value={value.value}>{value.name}</option>
                                    )
                                })
                            }
                        </Select>
                        <FormHelperText color="red">
                            <>
                                {errors.vehicle_width && errors.vehicle_width.message}
                            </>
                        </FormHelperText>
                    </FormControl>
                    <FormControl w={["100%", "100%", "30%"]} >
                        <FormLabel fontWeight={"700"} fontSize={"14px"}>Unloaded Weight (w/o Battery) <Text as={'span'} className='requiredField'>*</Text></FormLabel>
                        <Input placeholder='Battery weight'
                            bg={"#fff"} border={"1px solid #D9D9D9"}
                            {...register('vehicle_unloded_weight', {
                                required: 'This feild is required',
                            })
                            }
                        />
                        <FormHelperText color="red">
                            <>
                                {errors.vehicle_unloded_weight && errors.vehicle_unloded_weight.message}
                            </>
                        </FormHelperText>
                    </FormControl>
                    <FormControl w={["100%", "100%", "30%"]} >
                        <FormLabel fontWeight={"700"} fontSize={"14px"}>Category <Text as={'span'} className='requiredField'>*</Text></FormLabel>
                        <Select placeholder='Select Category' bg={"#fff"} border={"1px solid #D9D9D9"}
                            {...register('vehicle_category', {
                                onChange: (e) => { changeHandler(e) },
                                required: 'Please select category',
                            })
                            }

                        >
                       // Update the options based on specific category conditions for CMVR exemption, L2, L5 categories
                            {
                                Category && Category.map((value, key) => (
                                    <option key={key} disabled={value.disabled} value={value.value}>
                                        {value.name}
                                    </option>
                                ))
                            }
                        </Select>
                        <FormHelperText color="red">
                            <>
                                {errors.vehicle_category && errors.vehicle_category.message}
                            </>
                        </FormHelperText>
                    </FormControl>

                    <FormControl w={["100%", "100%", "30%"]} >
                        <FormLabel fontWeight={"700"} fontSize={"14px"}>Prefered Testing Agency <Text as={'span'} className='requiredField'>*</Text></FormLabel>

                        <Select placeholder='Prefered Testing Agency' bg={"#fff"} border={"1px solid #D9D9D9"}

                            {...register('prefered_testing_agency', {
                                onChange: (e) => { changeHandler(e) },
                                required: 'Please prefered testing Agency',
                            })
                            }
                        >
                            {
                                PrefferedTestingAgency.map((value, key) => <option key={key} disabled={value.disabled} value={value.value}>{value.name}</option>)
                            }
                        </Select>
                        <FormHelperText color="red">
                            <>
                                {errors.prefered_testing_agency && errors.prefered_testing_agency.message}
                            </>
                        </FormHelperText>

                    </FormControl>
                    <FormControl w={["100%"]} >
                        <Stack direction='row' spacing={4} justify="right">

                            <Button
                                variant='outline'
                                border={"1px solid #7FBF28"}
                                w={"100px"}
                                height='48px'
                                type='reset'
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button
    height="48px"
    bg="#7FBF28"
    w="100px"
    color="#fff"
    _hover={{ bg: "#7FBF28" }}
    _focus={{ bg: "#7FBF28" }}
    variant="solid"
    type="submit"
    isLoading={isSubmitting}
    isDisabled={isSubmitting}
>
    {isSubmitting ? "Saving..." : "Next"}
</Button>
                        </Stack>
                    </FormControl>

                </Flex>
            </form>
            <ApproveSuccess
    approved={showSuccess}
    successMsg="Homologation request created successfully."
    onClose={async () => {
        setShowSuccess(false);

        if (createdVehicleType === "Bus") {
            await onSuccess(createdRequestId);
        } else {
            navigate("/Homologation");
        }
    }}
/>

        </>
    )
}

export default Newhomologation;