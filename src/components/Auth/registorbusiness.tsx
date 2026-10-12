import * as React from "react"
import { useState, useEffect } from "react"
import { FC } from 'react';
import {
    Button,
    Flex,
    FormControl,
    FormLabel,
    Input,
    Text,
    Select,
    Textarea,
    Checkbox,
    Stack,
    ModalHeader,
    ModalContent,
    ModalBody,
    ModalCloseButton,
    FormHelperText
} from "@chakra-ui/react";
import { Post } from "../../utilities/service";
import RegisterSuccess from "./registerSucess";
import { State } from "../../constant/state";

/* Form Validation */
import { useForm } from "react-hook-form";


const Register: FC = () => {

    const apiURL = "userRegistration/newUserRegistration";
    const [regSuccess, setRegSuccess] = React.useState<boolean>(false);
    const [emailIdAlreadyExist, setEmailIdAlreadyExist] = React.useState<boolean>(false);

    const { handleSubmit, register, formState: { errors, isSubmitting }, } = useForm()


    const config = {
        headers: {
            Authorization: 'Bearer ' //the token is a variable which holds the token
        }
    }

    const userLogin = async (mergeData: {}) => {
        await Post(apiURL, mergeData, config)
            .then((resp) => {
                if (resp.data.status === 'success') {
                    setRegSuccess(true);
                    setEmailIdAlreadyExist(false)
                }
                if (resp.data.status === 'failure') {
                    // console.log(resp.data.body.split('key: '));   
                    setEmailIdAlreadyExist(true)
                    let resetButton = document.getElementById('emailId');
                    resetButton?.focus()
                }
            })
            .catch((error) => {
                // console.log('error');
            });
    };

    const onSubmit = (values: any) => {

        let profileAddress = {
            'address1': values?.address1,
            'address2': values?.address2,
            'country': values?.country,
            'state': values?.state,
            'city': values?.city,
            'zipCode': values?.zipCode,
            'contact': values?.contact,
            'alternateContact': values?.alternateContact

        }
        let formdata = {
            'firstName': values?.firstName,
            'lastName': values?.lastName,
            'emailId': values?.emailId,
            'registrationDate': values?.registrationDate,
            'registrationNumber': values?.registrationNumber,
            'typeOfBusiness': values?.typeOfBusiness,
            'businessName': values?.businessName,
            'businessDescription': values?.businessDescription,
            'vehicleType': values?.vehicleType

        }
        let profileData = { profileAddress };
        let mergeData = { ...formdata, ...profileData };
        userLogin(mergeData);
    };


    const successMsg = 'You have been successfully registered Please check your email for login details';

    return (
        <>
            {regSuccess ? <RegisterSuccess successMsg={successMsg} /> :
                <>
                    <ModalContent maxW={'90%'}>
                        <ModalHeader bg={"#05637D"} fontWeight={"700"} fontSize={"18px"} textAlign="center" color={"#fff"}>Register your business</ModalHeader>
                        <ModalCloseButton color={"#fff"} />
                        <ModalBody bg="#F1F1F1" >
                            <Text p={"50px 0px"} fontWeight={"700"}>Business Owner</Text>
                            <form onSubmit={handleSubmit(onSubmit)} >
                                <Flex gap="8" flexWrap={['wrap', 'wrap', 'nowrap']} >

                                    <FormControl >
                                        <FormLabel fontWeight={"700"} fontSize={"14px"}>First name <Text as={'span'} className='requiredField'>*</Text></FormLabel>
                                        <Input placeholder='Enter First name' bg={"#fff"} border={"1px solid #D9D9D9"}
                                            {...register('firstName', {
                                                required: 'This feild is required',
                                                maxLength: { value: 25, message: 'Max characters should be 25' },
                                                pattern: {
                                                    value: /^[a-zA-Z]+$/,
                                                    message: 'This feild allows only characters',
                                                },
                                            })
                                            }

                                        />

                                        <FormHelperText color="red">
                                            <>
                                                {errors.firstName && errors.firstName.message}
                                            </>
                                        </FormHelperText>

                                    </FormControl>
                                    <FormControl >
                                        <FormLabel fontWeight={"700"} fontSize={"14px"}>Last name <Text as={'span'} className='requiredField'>*</Text></FormLabel>
                                        <Input placeholder='Enter Last name' bg={"#fff"} border={"1px solid #D9D9D9"}
                                            {...register('lastName', {
                                                required: 'This feild is required',
                                                maxLength: { value: 25, message: 'Max characters should be 25' },
                                                pattern: {
                                                    value: /^[a-zA-Z]+$/,
                                                    message: 'This feild allows only characters',
                                                },
                                            })
                                            }

                                        />

                                        <FormHelperText color="red">
                                            <>
                                                {errors.lastName && errors.lastName.message}
                                            </>
                                        </FormHelperText>
                                    </FormControl>
                                    <FormControl >
                                        <FormLabel fontWeight={"700"} fontSize={"14px"}>E-mail ID <Text as={'span'} className='requiredField'>*</Text></FormLabel>
                                        <Input id={'emailId'} placeholder='eg john.smith@gmail.com' bg={"#fff"} border={"1px solid #D9D9D9"}

                                            {...register('emailId', {
                                                required: 'This feild is required',
                                                pattern: {
                                                    value: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                                                    message: 'Please enter a valid email',
                                                },
                                            })
                                            }
                                        />
                                        <FormHelperText color="red">
                                            <>
                                                {errors.emailId && errors.emailId.message}
                                                {emailIdAlreadyExist && 'The email id is already exist'}
                                            </>
                                        </FormHelperText>

                                    </FormControl>
                                </Flex>
                                <Flex gap="8" mt={"30px"} flexWrap={['wrap', 'wrap', 'nowrap']}>
                                    <FormControl >
                                        <FormLabel fontWeight={"700"} fontSize={"14px"}>Type of Business <Text as={'span'} className='requiredField'>*</Text></FormLabel>
                                        <Select  bg={"#fff"} border={"1px solid #D9D9D9"}
                                            {...register('typeOfBusiness')
                                            }

                                        >   
                                            <option value="Company">Company</option>

                                            <option value="Corporation">Corporation</option>
                                            <option value="Cooperative">Cooperative</option><option value="Franchise">Franchise</option>

                                            <option value="Individual consulting firm">Individual consulting firm</option>
                                            <option value="Joint venture">Joint venture</option>
                                            <option value="Kommanditgesellschaft">Kommanditgesellschaft</option>
                                            <option value="Large business">Large business</option>
                                            <option value="LLP">LLP</option>
                                            <option value="Limited Liability Company">Limited Liability Company</option><option value="Limited Company">Limited Company</option><option value="Manufactures">Manufactures</option>
                                            <option value="Nonprofit">Nonprofit</option>
                                            <option value="Other business structures">Other business structures</option><option value="Partnership">Partnership</option><option value="Public – benefit corporation">Public – benefit corporation</option>
                                            <option value="Sole proprietorship">Sole proprietorship</option><option value="S corporation">S corporation</option><option value="Small Industry">Small Industry</option>
                                        </Select>
                                        <FormHelperText color="red">
                                            <>
                                                {errors.typeOfBusiness && errors.typeOfBusiness.message}
                                            </>
                                        </FormHelperText>
                                    </FormControl>
                                    <FormControl >
                                        <FormLabel fontWeight={"700"} fontSize={"14px"}>Business Name <Text as={'span'} className='requiredField'>*</Text> </FormLabel>
                                        <Input placeholder='Business name' bg={"#fff"} border={"1px solid #D9D9D9"}
                                            {...register('businessName', {
                                                required: 'This feild is required',
                                            })
                                            }
                                        />
                                        <FormHelperText color="red">
                                            <>
                                                {errors.businessName && errors.businessName.message}
                                            </>
                                        </FormHelperText>
                                    </FormControl>
                                    <FormControl >
                                        <FormLabel fontWeight={"700"} fontSize={"14px"}>Registration Date <Text as={'span'} className='requiredField'>*</Text></FormLabel>
                                        <Input
                                            type="date" bg={"#fff"} border={"1px solid #D9D9D9"}
                                            max={new Date().toISOString().split('T')[0]}

                                            {...register('registrationDate', {
                                                required: 'This feild is required',
                                            })
                                            }
                                        />
                                        <FormHelperText color="red">
                                            <>
                                                {errors.registrationDate && errors.registrationDate.message}
                                            </>
                                        </FormHelperText>
                                    </FormControl>
                                </Flex>
                                <Flex gap="8" mt={"30px"} flexWrap={['wrap', 'wrap', 'nowrap']}>
                                    <FormControl >
                                        <FormLabel fontWeight={"700"} fontSize={"14px"}>Registration Number <Text as={'span'} className='requiredField'>*</Text></FormLabel>
                                        <Input placeholder='Enter Registration Number' bg={"#fff"} border={"1px solid #D9D9D9"}

                                            {...register('registrationNumber', {
                                                required: 'This feild is required',
                                            })
                                            }
                                        />
                                        <FormHelperText color="red">
                                            <>
                                                {errors.registrationNumber && errors.registrationNumber.message}
                                            </>
                                        </FormHelperText>
                                    </FormControl>
                                    <FormControl >
                                        <FormLabel fontWeight={"700"} fontSize={"14px"}>Address 1 <Text as={'span'} className='requiredField'>*</Text></FormLabel>
                                        <Input placeholder='#28, 5th Cross' bg={"#fff"} border={"1px solid #D9D9D9"}

                                            {...register('address1', {
                                                required: 'This feild is required',
                                            })
                                            }
                                        />
                                        <FormHelperText color="red">
                                            <>
                                                {errors.address1 && errors.address1.message}
                                            </>
                                        </FormHelperText>
                                    </FormControl>
                                    <FormControl >
                                        <FormLabel fontWeight={"700"} fontSize={"14px"}>Address 2</FormLabel>
                                        <Input name='address2' placeholder='Indiranagar' bg={"#fff"} border={"1px solid #D9D9D9"} />
                                    </FormControl>
                                </Flex>
                                <Flex gap="8" mt={"30px"} flexWrap={['wrap', 'wrap', 'nowrap']}>
                                    <FormControl >
                                        <FormLabel fontWeight={"700"} fontSize={"14px"}>Country <Text as={'span'} className='requiredField'>*</Text></FormLabel>
                                        <Select placeholder='Select Country' bg={"#fff"} border={"1px solid #D9D9D9"}
                                            {...register('country', {
                                                required: 'Please select country',
                                            })
                                            }
                                        >
                                            <option value='india'>India</option>
                                        </Select>
                                        <FormHelperText color="red">
                                            <>
                                                {errors.country && errors.country.message}
                                            </>
                                        </FormHelperText>
                                    </FormControl>
                                    <FormControl >
                                        <FormLabel fontWeight={"700"} fontSize={"14px"}>State <Text as={'span'} className='requiredField'>*</Text> </FormLabel>
                                        <Select placeholder='Select State' bg={"#fff"} border={"1px solid #D9D9D9"}
                                            {...register('state', {
                                                required: 'Please select state',
                                            })
                                            }
                                        >
                                            {
                                                State.map((value) => <option value={value.value}>{value.value}</option>)
                                            }
                                        </Select>
                                        <FormHelperText color="red">
                                            <>
                                                {errors.state && errors.state.message}
                                            </>
                                        </FormHelperText>
                                    </FormControl>
                                    <FormControl >
                                        <FormLabel fontWeight={"700"} fontSize={"14px"}>City <Text as={'span'} className='requiredField'>*</Text></FormLabel>
                                        <Input placeholder='Bangalore' bg={"#fff"} border={"1px solid #D9D9D9"}
                                            {...register('city', {
                                                required: 'This feild is required',
                                            })
                                            }

                                        />
                                        <FormHelperText color="red">
                                            <>
                                                {errors.city && errors.city.message}
                                            </>
                                        </FormHelperText>
                                    </FormControl>
                                </Flex>
                                <Flex gap="8" mt={"30px"} flexWrap={['wrap', 'wrap', 'nowrap']}>
                                    <FormControl >
                                        <FormLabel fontWeight={"700"} fontSize={"14px"}>ZipCode <Text as={'span'} className='requiredField'>*</Text></FormLabel>
                                        <Input placeholder='Pincode' bg={"#fff"} border={"1px solid #D9D9D9"}
                                            {...register('zipCode', {
                                                required: 'This feild is required',
                                                pattern: {
                                                    value: /^\d{5,10}(?:[-\s]\d{4})?$/,
                                                    message: 'Please enter a valid zipcode',
                                                },
                                            })
                                            }

                                        />
                                        <FormHelperText color="red">
                                            <>
                                                {errors.zipCode && errors.zipCode.message}
                                            </>
                                        </FormHelperText>
                                    </FormControl>
                                    <FormControl  >
                                        <FormLabel fontWeight={"700"} fontSize={"14px"}>Contact Number <Text as={'span'} className='requiredField'>*</Text></FormLabel>
                                        <Input placeholder='+91 98456 98889' bg={"#fff"} border={"1px solid #D9D9D9"}

                                            {...register('contact', {
                                                required: 'This feild is required',
                                                maxLength: { value: 10, message: 'Please enter a valid number' },
                                                minLength: { value: 10, message: 'Please enter a valid number' },
                                                pattern: {
                                                    value: /^\d{5,10}(?:[-\s]\d{4})?$/,
                                                    message: 'Please enter a valid number',
                                                },
                                            })
                                            }
                                        />
                                        <FormHelperText color="red">
                                            <>
                                                {errors.contact && errors.contact.message}
                                            </>
                                        </FormHelperText>
                                    </FormControl>
                                    <FormControl  >
                                        <FormLabel fontWeight={"700"} fontSize={"14px"}>Alternate Contact Number <Text as={'span'} className='requiredField'>*</Text></FormLabel>
                                        <Input placeholder='+91 98456 98889' bg={"#fff"} border={"1px solid #D9D9D9"}
                                            {...register('alternateContact', {
                                                required: 'This feild is required',
                                                maxLength: { value: 10, message: 'Please enter a valid number' },
                                                minLength: { value: 10, message: 'Please enter a valid number' },
                                                pattern: {
                                                    value: /^\d{5,10}(?:[-\s]\d{4})?$/,
                                                    message: 'Please enter a valid number',
                                                },
                                            })
                                            }

                                        />
                                        <FormHelperText color="red">
                                            <>
                                                {errors.alternateContact && errors.alternateContact.message}
                                            </>
                                        </FormHelperText>
                                    </FormControl>
                                </Flex>
                                {/* <Flex gap="8" mt={"30px"}>
                                    <Textarea name='businessDescription' placeholder='Here is a sample placeholder' bg={"#fff"} border={"1px solid #D9D9D9"} />
                                </Flex> */}
                                {/* <Flex gap="8" mt={"30px"}> */}
                                <Flex gap="8" mt="30px" flexWrap={['wrap', 'wrap', 'nowrap']}>
                                    <FormControl flex="1">
                                        <FormLabel fontWeight="700" fontSize="14px">
                                        vehicle Type <Text as="span" className="requiredField">*</Text>
                                        </FormLabel>
                                        <Select
                                            placeholder="Select vehicle Type"
                                            bg="#fff"
                                            border="1px solid #D9D9D9"
                                            {...register('vehicleType', {
                                                required: 'Please select vehicleType',
                                            })}
                                        >
                                            <option value="2-Wheeler">2-Wheeler</option>
                                            <option value="3-Wheeler">3-Wheeler</option>
                                            <option value="Bus">BUS</option>
                                            
                                        </Select>                                      
                                        <FormHelperText color="red">
                                            <>
                                                {errors.vehicleType && errors.vehicleType.message}
                                            </>
                                        </FormHelperText>
                                    </FormControl>

                                    <FormControl flex="2">
                                        <FormLabel fontWeight="700" fontSize="14px">
                                            Business Description
                                        </FormLabel>
                                        <Textarea
                                            name="businessDescription"
                                            placeholder="Here is a sample placeholder"
                                            bg="#fff"
                                            border="1px solid #D9D9D9"
                                        />
                                    </FormControl>
                                </Flex>
                                <Flex gap="8" m={"40px 0px"} flexWrap={['wrap', 'wrap', 'nowrap']}>
                                    <FormControl >
                                        <Checkbox
                                            {...register('terms', {
                                                required: 'Please accept terms and condition',

                                            })
                                            }
                                        >I agree terms and condition <Text as={'span'} className='requiredField'>*</Text></Checkbox>
                                        <FormHelperText color="red">
                                            <>
                                                {errors.terms && errors.terms.message}
                                            </>
                                        </FormHelperText>
                                    </FormControl>
                                    <Stack direction='row' spacing={4} align='center'>
                                        <Button
                                            variant='outline'
                                            border={"1px solid #7FBF28"}
                                            w={"100px"}
                                            height='48px'
                                            type="reset"
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit"
                                            height='48px'
                                            bg="#7FBF28"
                                            w={"100px"}
                                            color='#fff'
                                            _hover={{ bg: '#7FBF28' }}
                                            _focus={{ bg: '#7FBF28' }} variant='solid'>
                                            Register
                                        </Button>
                                    </Stack>

                                </Flex>
                            </form>
                        </ModalBody>
                    </ModalContent>
                </>
            }
        </>
    )
}

export default Register;