import { FC } from 'react';
import React, { useEffect } from "react"

import '../../assets/css/home.css';
import {
    Container,
    Flex,
    Box,
    Image,
    Heading,
    Text,
    UnorderedList,
    ListItem
} from "@chakra-ui/react";

import wmiRegistration from '../../assets/images/wmiRegistration.png';
import fameSubsidy from '../../assets/images/fameSubsidy.png';
import BusBodyBuilderAccreditation from '../../assets/images/BusBodyBuilderAccreditation.png';
import { useLocation } from 'react-router-dom';

const About: FC = () => {
    const location = useLocation();

    useEffect(() => {
        const hash = location.hash;
        if (hash) {
            const targetElement = document.querySelector(hash);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }
        } else {
            // Scroll to the top of the page if no hash is present
            window.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        }
    }, [location])


    return (
        <>
            <Container
                maxWidth={"100%"}
                pl={["20px", "40px", "40px", "70px"]}
                pr={["20px", "40px", "40px", "70px"]}
                bg="#F6F6F6">
                <Box>

                    <Box pb={["10px"]}
                        pt={["10px"]}
                    >

                        <Heading as='h4' color={'color.100'} fontSize={'14px'}>
                            About Us
                        </Heading>

                    </Box>

                </Box>
            </Container>

            <Container
                maxWidth={"100%"}
                pl={["20px", "40px", "40px", "70px"]}
                pr={["20px", "40px", "40px", "70px"]}
                mb={'60px'}
                bg="#fff">
                <Box className="middle-content">

                    <Box pb={["10px"]}
                        pt={["10px"]}
                    >

                        <Heading as='h4' color={'color.100'} mt={'30px'} mb={'20px'}>
                            About Bv-Reg
                        </Heading>
                        <Text as={'div'} fontSize='13px' mt={'10px'} color={'color.400'} maxW={'1142'} pr={["5px", "25px", "25px", "25px"]}>
                            Is built by a team of passionate automotive professionals with extensive CMVR Certification Process experience. We have worked on ICE vehicles as well as Electric Vehicle homologation starting from two-wheelers to commercial vehicles. We have exposure and experience in the end-to-end process of CMVR certification with all the testing agencies in India.
                        </Text>
                        <Text as={'div'} fontSize='13px' mt={'10px'} color={'color.400'} maxW={'1142'} pr={["5px", "25px", "25px", "25px"]}>
                            We aim to make the application process of product certification as per the government rules and regulations much simpler and easier to handle by anyone with our software platform.
                        </Text>
                        <Text as={'div'} fontSize='13px' mt={'10px'} color={'color.400'} maxW={'1142'} pr={["5px", "25px", "25px", "25px"]}>
                            With the growing scenario of the electric vehicle industry in India, there are large requirements for Homologation engineers for every EV-related start-up and company. Since the rise of EV segment, the industry has started realising the importance of the Homologation Engineer role for the new product certification & FAME subsidy certification. Earlier with ICE vehicles and very few manufacturing players in the automotive sector, homologation engineers & managers were very less. Awareness about the homologation process is very less even today in the society and market. But now, every company needs a homologation engineer. Unfortunately, there are very handful of homologation engineers in the industry. Thus we come into the picture to take up the role of homologation engineer and help companies in the CMVR certification process.
                        </Text>

                    </Box>


                    <Box pb={["10px"]}
                        pt={["10px"]}
                    >

                        <Heading as='h4' color={'color.100'} mt={'10px'} mb={'20px'}>
                            Product
                        </Heading>
                        <Text as={'div'} fontSize='13px' mt={'10px'} color={'color.400'} maxW={'1142'} pr={["5px", "25px", "25px", "25px"]}>
                            First kind of software platform for the CMVR Certification process in India. It will reduce preparation and documentation time without any dependency. We aim to bring awareness of the product with a visual representation of the data to be filled without having any ambiguity to end users.
                        </Text>
                        <Text as={'div'} fontSize='13px' mt={'10px'} color={'color.400'} maxW={'1142'} pr={["5px", "25px", "25px", "25px"]}>
                            Most importantly with this intelligent software application, we eliminate the possibility of error being made and submit an incomplete application form. All the applications will be saved in the end user's account and can retrieve the previous data if required. Bv-Reg gives total control over the documentation and application process to the organizations.
                        </Text>
                        <Text as={'div'} fontSize='13px' mt={'10px'} color={'color.400'} maxW={'1142'} pr={["5px", "25px", "25px", "25px"]}>
                            Explore Bv-Reg!
                        </Text>

                    </Box>


                    <Box pb={["10px"]}
                        pt={["10px"]}
                    >

                        <Heading as='h4' color={'color.100'} mt={'10px'} mb={'20px'}>
                            CMVR Update
                        </Heading>
                        <Text as={'div'} fontSize='13px' mt={'10px'} color={'color.400'} maxW={'1142'} pr={["5px", "25px", "25px", "25px"]}>
                            We bring the CMVR updates from MoRTH (ministry of Road Transport & Highways of India) as and when any notification, rules & regulations are released.
                        </Text>


                    </Box>

                    <Box pb={["10px"]}
                        pt={["10px"]}
                        id="what-is-homo">

                        <Heading as='h4' color={'color.100'} mt={'10px'} mb={'20px'}>
                            What is Homologation?
                        </Heading>
                        <Text as={'div'} fontSize='13px' mt={'10px'} color={'color.400'} maxW={'1142'} pr={["5px", "25px", "25px", "25px"]}>
                            Homologation is the process of getting Government Approval by means of a Certificate which allows the Product to enter targeted Market. Process starts with the initial assessment followed by the list of tests according to standards and directives until the compilation of validated technical reports that finally results in the approval.
                        </Text>


                    </Box>

                    <Box pb={["10px"]}
                        pt={["10px"]}
                        id="Pre-Homologation"
                    >

                        <Heading as='h4' color={'color.100'} mt={'10px'} mb={'20px'}>
                            Pre-Homologation Process
                        </Heading>
                        <Text as={'div'} fontSize='13px' mt={'10px'} color={'color.400'} maxW={'1142'} pr={["5px", "25px", "25px", "25px"]}>
                            Pre Homologation is nothing but the performance of all or critical tests as per the applicable regulations similar to actual tests that are being performed by the testing agency during the approval process.
                        </Text>


                    </Box>

                    <Box pb={["10px"]}
                        pt={["10px"]}
                        id="type-approval"
                    >

                        <Heading as='h4' color={'color.100'} mt={'10px'} mb={'20px'}>
                            Type Approval Process
                        </Heading>
                        <Text fontSize='18' mt={6} color={'color.400'} maxW={'1142'} pr={["5px", "25px", "25px", "25px"]}>
                            Expert Advice:
                        </Text>
                        <UnorderedList mb={'47px'}>
                            <ListItem>Documentation Process</ListItem>
                            <ListItem>Product Data Table Preparation</ListItem>
                            <ListItem>Certification Initiation</ListItem>
                            <ListItem>Execution of Approval Process</ListItem>
                            <ListItem>Certification Grant</ListItem>
                        </UnorderedList>


                    </Box>



                    <Flex
                        direction={
                            {
                                sm: 'column',
                                md: 'row',
                                lg: 'row',
                                xl: 'row'
                            }
                        }
                        alignItems='center'
                        justifyContent={'space-around'}
                        flexWrap={['wrap', 'wrap', 'nowrap']}
                        gap={'40px'}
                    >
                        <Box
                            id="bus-body"
                        >
                            <Heading as='h4' color={'color.100'} mt={'30px'} mb={'20px'}>
                                Bus Body Builder Accreditation
                            </Heading>
                            <Text as={'div'} fontSize='13px' mt={'10px'} color={'color.400'} maxW={'1142'} pr={["5px", "25px", "25px", "25px"]}>
                                Accreditation is a mandatory requirement for Bus Body Builders as per CMV Order, 2007. All the Bus Body Builders shall be accredited by the National Accreditation Board & Zonal Accreditation Boards as notified under the said order. The accredited Bus Body builders shall meet the type approval requirements specified in the relevant provisions of the Bus Body Code for the relevant type of vehicle in accordance with AIS:052:2001 as amended from time to time till the corresponding BIS specifications are notified under the BIS Act, 1986(63 of 1986).
                            </Text>
                        </Box>

                        <Box pb={["10px"]}
                            pt={["10px"]}
                        >
                            <Image src={BusBodyBuilderAccreditation} alt='car' />
                        </Box>

                    </Flex>

                    <Flex
                        direction={
                            {
                                sm: 'column',
                                md: 'row',
                                lg: 'row',
                                xl: 'row'
                            }
                        }
                        alignItems='center'
                        justifyContent={'space-around'}
                        flexWrap={['wrap', 'wrap', 'nowrap']}
                        gap={'40px'}
                    >
                        <Box id="fame-body">
                            <Heading as='h4' color={'color.100'} mt={'30px'} mb={'20px'}>
                                PM E‑DRIVE (Scheme)
                            </Heading>
                            <Text as={'div'} fontSize='13px' mt={'10px'} color={'color.400'} maxW={'1142'} pr={["5px", "25px", "25px", "25px"]}>
                                
                                The Government of India has launched the “PM Electric Drive Revolution in Innovative Vehicle Enhancement (PM E-DRIVE)” scheme with an outlay of ₹10,900 crore over the period from 1 October 2024 to 31 March 2026 (with certain segments extended to March 2028).


                                Key features include:

                                1) Demand-side incentives for electric 2-wheelers, 3-wheelers, ambulances, trucks, and buses.

                                2) A dedicated allocation of ₹2,000 crore for public EV charging infrastructure installation (approx 72,000 charging stations) under the scheme.
                                Press Information Bureau

                                3) Emphasis on localisation of EV manufacturing and testing agency upgradation within India’s EV ecosystem.                 </Text>
                        </Box>

                        <Box pb={["10px"]}
                            pt={["10px"]}
                        >
                            <Image src={fameSubsidy} alt='car' />
                        </Box>

                    </Flex>

                    <Flex
                        direction={
                            {
                                sm: 'column',
                                md: 'row',
                                lg: 'row',
                                xl: 'row'
                            }
                        }
                        alignItems='center'
                        justifyContent={'space-around'}
                        flexWrap={['wrap', 'wrap', 'nowrap']}
                        gap={'40px'}
                    >
                        <Box id="wmi">
                            <Heading as='h4' color={'color.100'} mt={'30px'} mb={'20px'}>
                                WMI Registration
                            </Heading>
                            <Text as={'div'} fontSize='13px' mt={'10px'} color={'color.400'} maxW={'1142'} pr={["5px", "25px", "25px", "25px"]}>
                                Globally, the Vehicle Identification Number (VIN) system is used to uniquely identify a vehicle. The VIN comprises 17 characters that uniquely identify the vehicle as provided in ISO 3779 & ISO 4030. The first 3 characters of VIN that uniquely identify the manufacturer of the vehicle is called the World Manufacturer Identifier (WMI).
                            </Text>
                            <Text as={'div'} fontSize='13px' mt={'10px'} color={'color.400'} maxW={'1142'} pr={["5px", "25px", "25px", "25px"]}>
                                BIS being the National Standards Body of India & a member of the ISO, acts as the WMI coordinator in India & issues the WMI code to vehicle manufacturers in India after these are assigned by the Society of Automotive Engineers Inc., USA, the international agency responsible for the maintenance of the WMI codes.
                            </Text>
                        </Box>

                        <Box pb={["10px"]}
                            pt={["10px"]}
                        >
                            <Image src={wmiRegistration} alt='car' />
                        </Box>

                    </Flex>


                </Box>
            </Container>


        </>
    )
}
export default About;