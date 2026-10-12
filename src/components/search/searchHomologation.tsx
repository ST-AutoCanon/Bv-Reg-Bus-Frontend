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
    Heading
} from "@chakra-ui/react";
import { useSelector } from 'react-redux';
import { RootState } from "../../app/store";
import { Post, Get } from "../../utilities/service";
import { useState } from "react";
import {
    typeOfVehicle,
    PrefferedTestingAgency
} from "../../constant/homologation";


interface User {
    registrationNumber: string,
    emailId: string,
    status: string,
    registrationDate: string,
    _id: string,
    businessName: string
}


const SearchHomologation: FC = () => {
    const [homologationData, setHomologationData] = useState({});
    const token: string = useSelector((state: RootState) => state.loginCredential.token);
    const [searchHomologation, setSearchHomologation] = useState<User[]>([]);
    const config = {
        headers: {
            Authorization: 'Bearer ' + token
        }
    }
    const searchApiURL = "homologationRequest/searchHomologationRequests/";

    const searchHomologationData = async (homologationData: {}) => {
        await Post(searchApiURL, homologationData, config)
            .then((resp) => {
                if (resp.data.status === 'success') {
                    setSearchHomologation(resp.data.body);
                }
                if (resp.data.status === 'failure') { }
            })
            .catch((error) => {
                // console.log('error');
            });
    };

    const changeHandler = (event: any) => {
        setHomologationData({ ...homologationData, [event.target.name]: event.target.value })
    }

    const handleSubmit = (e: any) => {
        e.preventDefault()
        searchHomologationData(homologationData);
    };

    return (
        <>
            <Container maxWidth='100%' bg={'color.800'}
                pl={["20px", "40px", "40px", "100px", "100px"]}
                pr={["20px", "40px", "40px", "100px", "100px"]}
                pt={["40px", "40px", "40px", "40px"]}
                pb={["40px", "40px", "40px", "40px"]}
                mb={'50px'}
            >
                <Heading fontSize={'24px'} textAlign={'center'} mb={'30px'}>Search Homologation Request</Heading>
                <form onSubmit={handleSubmit} >
                    <HStack
                        display={'flex'}
                        justifyContent={'space-around'}
                        flexDirection={['column', 'column', 'row', 'row']}
                    >
                        <FormControl>
                            <FormLabel fontSize={'14px'} mb={'0px'} pt={['20px', '20px', '0', '0']}>Company name starts with</FormLabel>
                            <Input type={'text'} placeholder='Company Name' name="company-name" className='form-input' onChange={changeHandler} />
                        </FormControl>

                        <FormControl>
                            <FormLabel fontSize={'14px'} mb={'0px'} pt={['20px', '20px', '0', '0']}>Request registration date</FormLabel>
                            <Input type={'date'} placeholder='Request registration date' name="registrationDate" className='form-input' onChange={changeHandler} />
                        </FormControl>

                        <FormControl>
                            <FormLabel fontSize={'14px'} mb={'0px'} pt={['20px', '20px', '0', '0']}>Vehicle type</FormLabel>
                            <Select placeholder='Select Type of Vehicle' bg={"#fff"} border={"1px solid #D9D9D9"}
                                name="vehicleType"
                                onChange={changeHandler}
                            >
                                {
                                    typeOfVehicle.map((value, key) => <option disabled={value.disabled} value={value.value}>{value.name}</option>)
                                }

                            </Select>
                        </FormControl>

                        <FormControl>
                            <FormLabel fontSize={'14px'} mb={'0px'} pt={['20px', '20px', '0', '0']}>Preffered vehicle testing agency</FormLabel>

                            <Select placeholder='Prefered Testing Agency' bg={"#fff"} border={"1px solid #D9D9D9"}
                                name="testingAgency"
                                onChange={changeHandler}
                            >
                                {
                                    PrefferedTestingAgency.map((value, key) => <option disabled={value.disabled} value={value.value}>{value.name}</option>)
                                }
                            </Select>
                        </FormControl>

                    </HStack>

                    <HStack>
                        <FormControl textAlign={'right'}>
                            <FormLabel fontSize={'14px'} mb={'0px'} pt={['20px', '20px', '0', '0']}>&nbsp;</FormLabel>
                            <Button w={['100%', '100%', '185px', '185px']} size='sm' h={'40px'} bg={'color.300'} color={'color.500'} type="submit">
                                Search
                            </Button>
                        </FormControl>
                    </HStack>
                </form>
            </Container>


            {searchHomologation && (searchHomologation as any)?.length ?
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
                                    <Th textTransform={'capitalize'} fontSize={'14px'} textAlign={'center'}>Request number</Th>
                                    <Th textTransform={'capitalize'} fontSize={'14px'} textAlign={'center'}>Company name</Th>
                                    <Th textTransform={'capitalize'} fontSize={'14px'} textAlign={'center'}>Vehicle Type</Th>
                                    <Th textTransform={'capitalize'} fontSize={'14px'} textAlign={'center'}>Overall  Status in %</Th>
                                    <Th textTransform={'capitalize'} fontSize={'14px'} textAlign={'center'}>Action</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {searchHomologation.map((value: any, key) => {
                                    return (
                                        <Tr _hover={{ bg: 'color.1400' }} key={key}>
                                            <Td fontSize={'14px'} textAlign={'center'}>{value.request_number}</Td>
                                            <Td fontSize={'14px'} textAlign={'center'}>{value.request_number}</Td>
                                            <Td fontSize={'14px'} textAlign={'center'}>{value.vehicle_type.value}</Td>
                                            <Td fontSize={'14px'} textAlign={'center'}>{value.fuel_type.value}</Td>
                                            <Td fontSize={'14px'} textAlign={'center'}>
                                                <Button
                                                    bg={'color.200'}
                                                    color={'color.500'}
                                                    fontSize={'14px'}

                                                >Updation</Button>
                                                

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

        </>
    )
}
export default SearchHomologation;
