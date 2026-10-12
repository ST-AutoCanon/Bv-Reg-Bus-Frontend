import { FC } from 'react';
import { useState, useRef } from "react";
import {
    Box,
    HStack,
    ModalBody,
    ModalCloseButton,
    Image,
    ModalContent,
    Text,
    Button,
    ModalFooter,
    Modal,
    ModalOverlay,
    useDisclosure,
    ModalHeader,
    Flex,
    FormControl,
    FormLabel,
    Input,
    VStack,
    Divider,
    Select,
    Stack,
    FormHelperText


} from "@chakra-ui/react";
/* Form Validation */
import { useForm } from "react-hook-form";
interface Props {
    componentName: string,
    added: boolean,
    closePopup: (x: boolean) => void,
    onSubmits: (x: any) => void,
}
const AddSupplier: FC<Props> = (Props) => {
    let { componentName, added, closePopup, onSubmits } = Props;
    const [supplierData, setSupplierData] = useState({});
    const { isOpen, onClose } = useDisclosure({ defaultIsOpen: added });
    const [testReportNumber, setReportNumber] = useState<boolean>(true);
    const [applicationNum, setApplicationNum] = useState<boolean>(true);
    const { handleSubmit, register, formState: { errors, isSubmitting }, } = useForm()


    const changeHandler = (event: any) => {
        setSupplierData({ ...supplierData, [event.target.name]: event.target.value })
        let checkformData: any = { ...supplierData, [event.target.name]: event.target.value }
        if (checkformData?.testReportNumber && checkformData?.licenceNumber && checkformData?.licenceValidityDate) {
            setReportNumber(false);
        } else if (checkformData?.applicationReferenceNumber && checkformData?.submissionDate) {
            setApplicationNum(false)
        }

    }
    const onSubmit = (data: any) => {
        onSubmits(data)
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} size='3xl' closeOnOverlayClick={false} >
                <ModalOverlay onClick={() => closePopup(false)} />
                <ModalContent>
                    <ModalHeader bg={"#05637D"} fontWeight={"700"} fontSize={"18px"} textAlign="center" color={"#fff"}>{componentName}</ModalHeader>
                    <ModalCloseButton color={"#fff"} onClick={() => closePopup(false)} />
                    <ModalBody bg="#F1F1F1" p={["5px", "45px"]}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Box m={"20px 0px"} >
                                <VStack
                                    w={["100%", "100%", "100%"]}
                                    pl={["13px", "13px", "85px", "85px"]}
                                    pr={["13px", "13px", "85px", "85px"]}
                                    mb={['20px', '20px', '36px', '36px']}
                                >
                                    <FormControl >
                                        <FormLabel fontWeight={"700"} fontFamily={'Open Sans'} fontSize={"14px"}>
                                            Name of the supplier
                                            <Text as={'span'} className='requiredField'>*</Text>
                                        </FormLabel>
                                        <Input placeholder='Enter name of the supplier'
                                            bg={"#fff"} border={"1px solid #D9D9D9"}

                                            {...register('nameOfSupplier', {
                                                onChange: (e) => { changeHandler(e) },
                                                required: 'This field is required',
                                            })
                                            }
                                        />
                                        <FormHelperText color="red">
                                            <>
                                                {errors.nameOfSupplier && errors.nameOfSupplier.message}
                                            </>
                                        </FormHelperText>
                                    </FormControl>
                                </VStack>

                                <Divider
                                    orientation='horizontal'
                                    mt={['8px']}
                                    mb={['8px']}
                                    border={'1px solid #C0C0C0;'}
                                />
                            </Box>

                            <Flex gap="12"
                                flexWrap={['wrap']}
                                justify="space-around"
                                flexDirection={['column', 'column', 'row', 'row']}
                            >
                                <HStack
                                    w={['100%', '100%', '100%', '100%']}
                                    pl={["13px", "13px", "0", "0"]}
                                >
                                    <FormControl
                                        mb={['20px !important', '20px !important', '0', '0']}
                                    >
                                        <FormLabel fontWeight={"700"} fontFamily={'Open Sans'} fontSize={"14px"}>
                                            Test Report No
                                            {applicationNum && <Text as={'span'} className='requiredField'>*</Text>}

                                        </FormLabel>
                                        {/* Update: Changed the pattern to allow only alphanumeric characters, spaces, ' / ', and ' - ' with the corresponding message for validation. */}
                                        {applicationNum ?
                                            <>
                                                <Input
                                                    placeholder='Test Report Number'
                                                    bg={"#fff"} border={"1px solid #D9D9D9"}
                                                    {...register('testReportNumber', {
                                                        onChange: (e) => { changeHandler(e) },
                                                        required: 'Please Enter test Report Number ',
                                                        pattern: {
                                                            value: /^[a-zA-Z0-9 /-]+$/,
                                                            message: "Only alphanumeric characters, spaces, ' / ', and ' - ' are allowed."
                                                        },
                                                        maxLength: {
                                                            value: 40,
                                                            message: "Max 40 characters can be entered"
                                                        }
                                                    })
                                                    }
                                                />

                                                <FormHelperText color="red">
                                                    <>
                                                        {errors.testReportNumber && errors.testReportNumber.message}
                                                    </>
                                                </FormHelperText>
                                            </>

                                            :
                                            <Input
                                                placeholder='Select  License Type'
                                                bg={"#fff"} border={"1px solid #D9D9D9"}
                                                onChange={changeHandler}

                                            />

                                        }

                                    </FormControl>

                                    <FormControl
                                        mb={['20px !important', '20px !important', '0', '0']}
                                    >
                                        <FormLabel fontWeight={"700"} fontFamily={'Open Sans'} fontSize={"14px"}>
                                            TAC / BIS No
                                            {applicationNum && <Text as={'span'} className='requiredField'>*</Text>}
                                        </FormLabel>
                                        {applicationNum ?
                                            <>
                                                <Input placeholder='Enter Licence Number'
                                                    bg={"#fff"} border={"1px solid #D9D9D9"}
                                                    {...register('licenceNumber', {
                                                        onChange: (e) => { changeHandler(e) },
                                                        required: 'This field is required',
                                                        value: componentName.includes('Lubrication') || componentName.includes('Vehicle Performance') ? 'NA' : null,
                                                        pattern: {
                                                            value: /^[a-zA-Z0-9 /-]+$/,
                                                            message: "Only alphanumeric characters, spaces, ' / ', and ' - ' are allowed."
                                                        },
                                                        maxLength: {
                                                            value: 20,
                                                            message: "Max 20 characters can be entered"
                                                        }
                                                    })
                                                    }
                                                    isReadOnly={componentName.includes('Lubrication') || componentName.includes('Vehicle Performance') ? true : false}

                                                />
                                                <FormHelperText color="red">
                                                    <>
                                                        {errors.licenceNumber && errors.licenceNumber.message}
                                                    </>
                                                </FormHelperText>
                                            </>

                                            : <Input placeholder='Enter Licence Number'
                                                bg={"#fff"} border={"1px solid #D9D9D9"}
                                                name="licenceNumber"
                                                onChange={changeHandler}

                                            />

                                        }

                                    </FormControl>

                                    <FormControl
                                        mb={['20px !important', '20px !important', '0', '0']}

                                    >
                                        <FormLabel fontWeight={"700"} fontFamily={'Open Sans'} fontSize={"14px"}>
                                            Licence Validity Date
                                            {applicationNum && <Text as={'span'} className='requiredField'>*</Text>}
                                        </FormLabel>
                                        {applicationNum ?
                                            <>
                                                {/* <Input placeholder='dd / mm / yyyy'
                                                    bg={"#fff"} border={"1px solid #D9D9D9"}
                                                    type={'date'}
                                                    {...register('licenceValidityDate', {
                                                        onChange: (e) => { changeHandler(e) },
                                                        required: 'This field is required',
                                                        value: componentName.includes('Lubrication') || componentName.includes('Vehicle Performance') ? 'NA' : null,
                                               
                                                    })
                                                    }
                                                    isReadOnly={componentName.includes('Lubrication') || componentName.includes('Vehicle Performance') ? true : false}


                                                /> */}
                                                <Input
                                                    placeholder="dd / mm / yyyy"
                                                    bg="#fff"
                                                    border="1px solid #D9D9D9"
                                                    type="date"
                                                    isReadOnly={componentName.includes('Lubrication') || componentName.includes('Vehicle Performance')}
                                                    defaultValue={componentName.includes('Lubrication') || componentName.includes('Vehicle Performance') ? 'NA' : ''}
                                                    {...register('licenceValidityDate', {
                                                        required: componentName.includes('Lubrication') || componentName.includes('Vehicle Performance')
                                                            ? false
                                                            : 'This field is required',
                                                        onChange: (e) => changeHandler(e),
                                                    })}
                                                />

                                                <FormHelperText color="red">
                                                    <>
                                                        {errors.licenceValidityDate && errors.licenceValidityDate.message}
                                                    </>
                                                </FormHelperText>
                                            </>
                                            : <Input placeholder='dd / mm / yyyy'
                                                bg={"#fff"} border={"1px solid #D9D9D9"}
                                                type={'date'}
                                                name="licenceValidityDate"
                                                onChange={changeHandler}
                                            />
                                        }
                                    </FormControl>

                                </HStack >
                                <Box mt={'-30px'}>
                                    <Text
                                        as={'span'}
                                        w={'40px'}
                                        h={'40px'}
                                        lineHeight={'40px'}
                                        borderRadius={'50%'}
                                        fontFamily={'Open Sans'}
                                        fontSize={'14px'}
                                        padding={'15px'}
                                        bg={'#D9D9D9'}
                                        textAlign={'center'}

                                    >OR</Text>

                                </Box>

                                <HStack
                                    w={['100%', '100%', '100%', '100%']}
                                    pl={["13px", "13px", "15px", "15px"]}
                                    pr={["13px", "13px", "15px", "15px"]}
                                    display={'flex'}
                                    justifyContent={'space-around'}
                                    mb={['10px', '10px', '0', '0']}
                                >
                                    <FormControl
                                        mb={['20px !important', '20px !important', '0', '0']}
                                    >
                                        <FormLabel fontWeight={"700"} fontFamily={'Open Sans'} fontSize={"14px"}>
                                            Application Reference Number
                                            {testReportNumber && <Text as={'span'} className='requiredField'>*</Text>}
                                        </FormLabel>
                                        {testReportNumber ?
                                            <>
                                                <Input placeholder='000 000 000'
                                                    bg={"#fff"} border={"1px solid #D9D9D9"}
                                                    {...register('applicationReferenceNumber', {
                                                        onChange: (e) => { changeHandler(e) },
                                                        pattern: {
                                                            value: /^[a-zA-Z0-9 /-]+$/,
                                                            message: "Only alphanumeric characters, spaces, ' / ', and ' - ' are allowed."
                                                        },
                                                        maxLength: {
                                                            value: 20,
                                                            message: "Max 20 characters can be entered"
                                                        }


                                                    })
                                                    }
                                                />
                                                <FormHelperText color="red">
                                                    <>
                                                        {errors.applicationReferenceNumber && errors.applicationReferenceNumber.message}
                                                    </>
                                                </FormHelperText>
                                            </>

                                            : <Input placeholder='000 000 000'
                                                bg={"#fff"} border={"1px solid #D9D9D9"}
                                                name='applicationReferenceNumber'
                                                onChange={changeHandler}
                                            />

                                        }

                                    </FormControl>

                                    <FormControl
                                        mb={['20px !important', '20px !important', '0', '0']}
                                    >
                                        <FormLabel fontWeight={"700"} fontFamily={'Open Sans'} fontSize={"14px"}>
                                            Submission Date
                                            {testReportNumber && <Text as={'span'} className='requiredField'>*</Text>}
                                        </FormLabel>
                                        {testReportNumber ?
                                            <>
                                                <Input placeholder='dd / mm / yyyy'
                                                    bg={"#fff"} border={"1px solid #D9D9D9"}
                                                    type={'date'}
                                                    {...register('submissionDate', {
                                                        onChange: (e) => { changeHandler(e) },

                                                    })
                                                    }
                                                />
                                                <FormHelperText color="red">
                                                    <>
                                                        {errors.submissionDate && errors.submissionDate.message}
                                                    </>
                                                </FormHelperText>
                                            </>
                                            : <Input placeholder='dd / mm / yyyy'
                                                bg={"#fff"} border={"1px solid #D9D9D9"}
                                                type={'date'}
                                                name='submissionDate'
                                                onChange={changeHandler}
                                            />
                                        }

                                    </FormControl>

                                </HStack>
                                <Divider
                                    orientation='horizontal'

                                    border={'1px solid #C0C0C0;'}
                                />
                                <HStack
                                    w={["100%", "100%", "100%"]}
                                    pl={["13px", "13px", "15px", "15px"]}
                                    pr={["13px", "13px", "15px", "15px"]}
                                    display={'flex'}
                                    justifyContent={'space-around'}
                                    flexDirection={['column', 'column', 'row', 'row']}
                                    mb={['20px', '20px', '0', '0']}
                                >
                                    <FormControl
                                        mb={['10px', '10px', '0', '0']}
                                    >
                                        <FormLabel fontWeight={"700"} fontFamily={'Open Sans'} fontSize={"14px"}>
                                            CoP Certification Number
                                        </FormLabel>
                                        <Input placeholder='000 000 000'
                                            bg={"#fff"} border={"1px solid #D9D9D9"}
                                            {...register('copCertificationNumber', {
                                                onChange: (e) => { changeHandler(e) },

                                                value: componentName.includes('Lubrication') || componentName.includes('Vehicle Performance') ? 'NA' : null,
                                                pattern: {
                                                    value: /^[a-zA-Z0-9 /-]+$/,
                                                    message: "Only alphanumeric characters, spaces, ' / ', and ' - ' are allowed."
                                                },
                                                maxLength: {
                                                    value: 45,
                                                    message: "Max 45 characters can be entered"
                                                }
                                            })
                                            }
                                            isReadOnly={componentName.includes('Lubrication') || componentName.includes('Vehicle Performance') ? true : false}

                                        />
                                        <FormHelperText color="red">
                                            <>
                                                {errors.copCertificationNumber && errors.copCertificationNumber.message}
                                            </>
                                        </FormHelperText>
                                    </FormControl>

                                    <FormControl

                                    >
                                        <FormLabel fontWeight={"700"} fontFamily={'Open Sans'} fontSize={"14px"}>
                                            CoP Certification Validity Date
                                        </FormLabel>
                                        <Input placeholder='dd / mm / yyyy'
                                            type={'date'}
                                            bg={"#fff"} border={"1px solid #D9D9D9"}
                                            {...register('copCertificationValidityDate', {
                                                onChange: (e) => { changeHandler(e) },

                                            })
                                            }
                                        />
                                        <FormHelperText color="red">
                                            <>
                                                {errors.copCertificationValidityDate && errors.copCertificationValidityDate.message}
                                            </>
                                        </FormHelperText>
                                    </FormControl>
                                </HStack>
                                <FormControl w={["100%"]} mt={['0px', '0px', '30px', '30px']} mb={['40px', '40px', '30px', '30px']}>
                                    <Stack direction='row' spacing={[2, 2, 8, 8]} justify="center">

                                        <Button
                                            variant='outline'
                                            border={"1px solid #7FBF28"}
                                            w={"180px"}
                                            h={'42px'}
                                            type='reset'
                                            onClick={() => closePopup(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            bg="#7FBF28"
                                            w={"180px"}
                                            h={'42px'}
                                            color='#fff'
                                            _hover={{ bg: '#7FBF28' }}
                                            _focus={{ bg: '#7FBF28' }} variant='solid'
                                            type="submit"
                                        >
                                            Add
                                        </Button>
                                    </Stack>
                                </FormControl>

                            </Flex>

                        </form>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    )
}
export default AddSupplier;