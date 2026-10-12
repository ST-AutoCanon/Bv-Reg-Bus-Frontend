import { FC } from 'react';
import * as React from "react"
import {
    Input,
    HStack,
    Container,
    FormControl,
    FormLabel,
    Select,
    Button,
    TableContainer,
    Table,
    TableCaption,
    Thead,
    Tr,
    Th,
    Tbody,
    Td,
    Tfoot,
    Heading,
    Box,
    FormHelperText,
    Text

} from "@chakra-ui/react";
import { useSelector } from 'react-redux';
import { RootState } from "../../app/store";
/* Form Validation */
import { useForm } from "react-hook-form";

import { Post, Get } from "../../utilities/service";
import { useState } from "react";
import { format } from 'date-fns'
import ApproveSuccess from '../Auth/approveSuccess';

interface User {
    registrationNumber: string,
    emailId: string,
    status: string,
    registrationDate: string,
    _id: string,
    businessName: string
}


const SearchUser: FC = () => {
    const [userData, setUserData] = useState({});
    const token: string = useSelector((state: RootState) => state.loginCredential.token);
    const [searchUser, setsearchUser] = useState<User[]>([]);
    const [approved, setApproved] = useState<boolean>(false);
    const [searchedData, setSearchedData] = useState<boolean>(false);
    const { handleSubmit, register, formState: { errors, isSubmitting }, } = useForm()
    const config = {
        headers: {
            Authorization: 'Bearer ' + token
        }
    }
    const searchApiURL = "userRegistration/searchUserRegistrations";

    const searchUserData = async (userData: {}) => {
        await Post(searchApiURL, userData, config)
            .then((resp) => {
                if (resp.data.status === 'success') {
                    setsearchUser(resp.data.body);
                    setSearchedData(true)
                }
                if (resp.data.status === 'failure') {
                    // console.log(resp.data.body.split('key: '));                    
                }
            })
            .catch((error) => {
                // console.log('error');
            });
    };

    const changeHandler = (event: any) => {
        setUserData({ ...userData, [event.target.name]: event.target.value })
    }

    const onSubmit = (searchData: any) => {
        searchUserData(searchData);
    };

    const userApprove = async (e: React.MouseEvent<HTMLButtonElement>, _id?: string) => {
        const approveApiUrl = "userRegistration/processUserRegistration/" + _id + "/approved";
        await Get(approveApiUrl, config)
            .then(resp => {
                setApproved(true);
            })
            .catch((error) => {
                // console.log(error)
            })
    }

    const successMsg = "Approved successfully."
    return (
        <>
            <Container maxWidth='100%' bg={'color.800'}
                pl={["20px", "40px", "40px", "100px", "100px"]}
                pr={["20px", "40px", "40px", "100px", "100px"]}
                pt={["40px", "40px", "40px", "40px"]}
                pb={["40px", "40px", "40px", "40px"]}
                mb={'50px'}
            >
                <Heading fontSize={'24px'} textAlign={'center'} mb={'30px'}>Search Registered Users</Heading>
                <form onSubmit={handleSubmit(onSubmit)} >
                    <HStack pb={['0', '8', '8', '8']}
                        display={'flex'}
                        justifyContent={'space-around'}
                        flexDirection={['column', 'column', 'row', 'row']}
                    >
                        <FormControl>
                            <FormLabel fontSize={'14px'} mb={'0px'} pt={['20px', '20px', '0', '0']}>Start Date <Text as={'span'} className='requiredField'>*</Text></FormLabel>
                            <Input type={'date'} max={new Date().toISOString().split('T')[0]} placeholder='Start Date'
                                className='form-input'
                                {...register('startDate', {
                                    required: 'This feild is required',
                                })
                                }
                            />
                            <FormHelperText color="red">
                                <>
                                    {errors.startDate && errors.startDate.message}
                                </>
                            </FormHelperText>
                        </FormControl>

                        <FormControl>
                            <FormLabel fontSize={'14px'} mb={'0px'} pt={['20px', '20px', '0', '0']}>End Date <Text as={'span'} className='requiredField'>*</Text></FormLabel>
                            <Input type={'date'} min={new Date().toISOString().split('T')[0]} placeholder='End Date'

                                {...register('endDate', {
                                    required: 'This feild is required',
                                })
                                }
                            />
                            <FormHelperText color="red">
                                <>
                                    {errors.endDate && errors.endDate.message}
                                </>
                            </FormHelperText>


                        </FormControl>

                        <FormControl>
                            <FormLabel fontSize={'14px'} mb={'0px'} pt={['20px', '20px', '0', '0']}>Status <Text as={'span'} className='requiredField'>*</Text></FormLabel>
                            <Select placeholder='Select' className='form-input'

                                {...register('status', {
                                    required: 'Please select the status',
                                })
                                }
                            >
                                <option value='approved'>Approved </option>
                                <option value='rejected'>Rejected </option>
                                <option value='incomplete'>Incomplete</option>
                            </Select>
                            <FormHelperText color="red">
                                <>
                                    {errors.status && errors.status.message}
                                </>
                            </FormHelperText>
                        </FormControl>

                        <FormControl>
                            <Button size='sm' h={'40px'} mt={'12px'} bg={'color.300'} color={'color.500'} type="submit"
                                w={['100%', '100%', 'auto', 'auto']}
                            >
                                Search Registered User
                            </Button>
                        </FormControl>

                    </HStack>
                    <HStack
                    ></HStack>
                </form>
                {

                    searchUser.length === 0 && searchedData &&
                    <Box textAlign={'center'} fontSize={'24px'} color={'red'} >
                        No data found for this search creteria
                    </Box>
                }
            </Container>


            {searchUser && (searchUser as any)?.length ?
                <Container maxWidth='100%' bg={'color.800'}
                    pl={["20px", "40px", "40px", "100px", "100px"]}
                    pr={["20px", "40px", "40px", "100px", "100px"]}
                    pt={["40px", "40px", "40px", "40px"]}
                    pb={["40px", "40px", "40px", "40px"]}
                    mb={'50px'}
                >


                    <TableContainer bg={'color.500'}>
                        <Table variant='simple'>
                            <Thead h={'60px'} bg={'color.1300'}>
                                <Tr>
                                    <Th textTransform={'capitalize'} fontSize={'14px'} textAlign={'center'}>User number</Th>
                                    <Th textTransform={'capitalize'} fontSize={'14px'} textAlign={'center'}>Company name</Th>
                                    <Th textTransform={'capitalize'} fontSize={'14px'} textAlign={'center'}>Ebmail ID</Th>
                                    <Th textTransform={'capitalize'} fontSize={'14px'} textAlign={'center'}>Date of Regisgtration</Th>
                                    <Th textTransform={'capitalize'} fontSize={'14px'} textAlign={'center'}>Status</Th>
                                    <Th textTransform={'capitalize'} fontSize={'14px'} textAlign={'center'}>Action</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {searchUser.map((value, key) => {
                                    return (
                                        <Tr _hover={{ bg: 'color.1400' }} key={key}>
                                            <Td fontSize={'14px'} textAlign={'center'}>{value.registrationNumber}</Td>
                                            <Td fontSize={'14px'} textAlign={'center'}>{value.businessName}</Td>
                                            <Td fontSize={'14px'} textAlign={'center'}>{value.emailId}</Td>
                                            <Td fontSize={'14px'} textAlign={'center'}>{format(new Date(value.registrationDate), 'dd MMMM, yyyy')}</Td>
                                            <Td fontSize={'14px'} textAlign={'center'}>{value.status}</Td>
                                            <Td fontSize={'14px'} textAlign={'center'}>
                                                {value.status === 'approved' ?
                                                    <Button
                                                        bg={'#C0C0C0'}
                                                        color={'color.500'}
                                                        fontSize={'14px'}
                                                        opacity={'.5'}
                                                        _hover={{ bg: '#C0C0C0' }}
                                                    >Active</Button>
                                                    : <Button
                                                        bg={'color.200'}
                                                        color={'color.500'}
                                                        fontSize={'14px'}
                                                        onClick={(e) => userApprove(e, value._id)}
                                                    >Active</Button>
                                                }
                                            </Td>
                                        </Tr>
                                    )

                                })

                                }

                            </Tbody>

                        </Table>


                    </TableContainer>

                </Container>
                : null}
            {approved ?
                <ApproveSuccess
  successMsg={successMsg}
  approved={approved}
  onClose={() => setApproved(false)}
/>
                : null}
        </>
    )
}
export default SearchUser;
