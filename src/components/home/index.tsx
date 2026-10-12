import { FC } from 'react';
import Slider from "react-slick"
import { Link } from 'react-router-dom';
import Banner from '../../assets/images/autocar.png';
import autoBanner from '../../assets/images/auto-banner.png';
import autoluggage from '../../assets/images/autoluggage.png';
import autopassenger from '../../assets/images/autopassenger.png';
import bikeBanner from '../../assets/images/bike-banner.png';
import car from '../../assets/images/car1.jpeg';
import auto from '../../assets/images/auot1.jpeg';
import truck from '../../assets/images/truck.jpeg';


import bike from '../../assets/images/bike1.jpeg'
import banner_aboutabout_baner from '../../assets/images/banner_aboutabout_baner.png';

import { useEffect, useState } from "react";
import '../../assets/css/home.css';
import {
    Container,
    Flex,
    Box,
    Image,
    Heading,
    Text,
    Button,
    ButtonGroup,
    Divider,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
    UnorderedList,
    ListItem
} from "@chakra-ui/react";
import Login from "../Auth/login";
import Register from '../Auth/registorbusiness';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from "../../app/store";
import { setPassword } from "../../features/login/loginSlice";
const Home: FC = () => {
    const [model, setModal] = useState<boolean>(false);
    const [mname, setName] = useState<string>("");
    const userData: any = useSelector((state: RootState) => state.loginCredential.userData);
    const dispatch = useDispatch();
    const { username, status } = userData;
    const banner = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        autoplay: true,
        autoplaySpeed: 2000,
        rtl: true

    };

    const threeSlideBanner = {
        dots: false,
        infinite: false,
        speed: 300,
        slidesToShow: 4,
        slidesToScroll: 4,
        arrows: true,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                    infinite: true,
                    dots: true
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                    arrows: false,
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    dots: true,
                    arrows: false,

                }
            }

        ]
    };
    const { isOpen, onOpen, onClose } = useDisclosure();
    const getLogin = () => {
        onOpen();
        setModal(true);
        setName("loginModal");
        dispatch(setPassword({}));
    }
    const regModal = () => {
        onOpen();
        setModal(true);
        setName("regModal");
    }
    useEffect(() => {
        if (model === true && mname === "loginModal") {
            getLogin();
        }
        else if (model === true && mname === "loginModal") {
            regModal();
        }
    }, [model])
    return (
        <>
            <Container maxW={'98%'}
                pl={["20px", "40px", "40px", "70px", "70px"]}
                pr={["20px", "40px", "40px", "70px", "70px"]}
                pt={["20px", "40px", "40px", "40px"]}
                pb={["70px", "40px", "40px", "80px"]}
                className="home-page" >
                <Box
                    display={'flex'}
                    justifyContent={'space-around'}
                    flexDirection={['column', 'column', 'row', 'row']}
                    className='home-banner'
                >
                    <Box width={["100%", "100%", '100%', '50%']}>

                        <Slider {...banner} className="banner-slider" >
                            <Box>
                                <Box width={["100%", "100%", '100%']}>
                                    <Image src={Banner} alt='car' />
                                </Box>
                            </Box>
                            <Box >
                                <Box width={["100%", "100%", '100%']}>
                                    <Image src={autoBanner} alt='car' />
                                </Box>
                            </Box>
                            <Box>
                                <Box width={["100%", "100%", '100%']}>
                                    <Image src={autoluggage} alt='car' />
                                </Box>
                            </Box>
                            <Box>
                                <Box width={["100%", "100%", '100%']}>
                                    <Image src={autopassenger} alt='car' />
                                </Box>
                            </Box>
                            <Box>
                                <Box width={["100%", "100%", '100%']}>
                                    <Image src={bikeBanner} alt='car' />
                                </Box>
                            </Box>

                        </Slider>

                    </Box>
                    <Box width={["100%", "100%", '100%', '50%']} >
                        <Box className="banner-text" pt={["25px", "0px"]}>
                            <Heading as='h2' color={'color.100'} fontSize={["18px", "24px", "28px", "32px", "42px"]}>
                                Welcome
                                <Text as="span" ml={2} color={'color.200'}>
                                    !
                                </Text>
                            </Heading>


                            <Text fontSize='18' pt={10} color={'color.400'} maxW={'1142'}>
                                To Explore Bv-Reg, team of passionate automotive professionals here to
                                make the application process of product certification as per the government
                                rules and regulations much simpler and easy to handle by any team member
                                from organisation with our software platform
                            </Text>
                            <Text>
                                Bv-Reg Member,
                                please continue with  <Text as="span" color={'color.200'}>Getin (Login)&nbsp;</Text>
                                using your register email and password. </Text> <Text>
                                New to Bv-Reg, please continue with <Text as="span" color={'color.200'}>GetStarted to sign-up new user</Text>.
                            </Text>
                            {username === undefined && status !== 'inactive' || userData.role === 'admin' ?
                                <ButtonGroup gap='4' pt={'40px'}>
                                    <Button bg='color.200' color="color.500" _hover={{ bg: 'color.200', borderColor: 'color.300' }} onClick={getLogin}>Get in (Login)</Button>
                                    <Button bg='color.200' color='color.500' _hover={{ bg: 'color.200', borderColor: 'color.300' }} onClick={regModal}>Get started</Button>
                                </ButtonGroup>
                                : null}

                        </Box>
                    </Box>
                </Box>
            </Container>



            <Container
                maxWidth={"100%"}
                pl={["20px", "40px", "40px", "70px"]}
                pr={["20px", "40px", "40px", "70px"]}
                bg="#F6F6F6">
                <Box
                    pt={['20px', '40px', '40px', '40px']}
                    pb={['20px', '40px', '40px', '40px']}
                    className="middle-content">

                    <Flex
                        direction={
                            {
                                sm: 'column',
                                md: 'row',
                                lg: 'row',
                                xl: 'row'
                            }
                        }
                        alignItems='stretch'
                        justifyContent={'space-around'}
                        flexWrap={['wrap', 'wrap', 'nowrap']}
                        gap='70px'
                    >
                        <Box pb={["5px", "34px"]}
                            pt={["15px", "34px"]}
                        >
                            <Image src={banner_aboutabout_baner} alt='car' />
                        </Box>

                        <Box pb={["5px", "34px"]}
                            pt={["15px", "34px"]}
                        >

                            <Heading as='h4' color={'color.100'}>
                                About Bv-Reg
                            </Heading>
                            <Text fontSize='18' mt={6} color={'color.400'} maxW={'1142'} pr={["5px", "25px", "25px", "25px"]}>
                                Is built by a team of passionate automotive professionals with extensive CMVR Certification Process experience. We have worked on ICE vehicles as well as Electric Vehicle homologation starting from two-wheelers to commercial vehicles. We have exposure and experience in the end-to-end process of CMVR certification with all the testing agencies in India.

                            </Text>
                            <Text fontSize='18' mt={6} color={'color.400'} maxW={'1142'} pr={["5px", "25px", "25px", "25px"]}>
                                We aim to make the application process of product certification as per the government rules and regulations much simpler and easier to handle by anyone with our software platform.

                            </Text>

                        </Box>

                    </Flex>

                    <Divider pt={'10px'}></Divider>

                    <Flex
                        direction={
                            {
                                sm: 'column',
                                md: 'row',
                                lg: 'row',
                                xl: 'row'
                            }
                        }
                        alignItems='baseline'
                        justifyContent={'space-around'}
                        flexWrap={['wrap', 'wrap', 'nowrap']}
                        pt={'10px'}
                        gap={'40px'}
                    >
                        <Box pb={["5px", "34px"]}
                            pt={["15px", "34px"]}
                            w={['100%', '100%', '30%', '30%']}
                        >

                            <Heading as='h4' color={'color.100'}>
                                What is Homologation?
                            </Heading>
                            <Text fontSize='18' mt={6} color={'color.400'} maxW={'1142'} pr={["5px", "25px", "25px", "25px"]}>
                                Homologation is the process of getting Government Approval by means of a Certificate which allows the Product to enter targeted Market. Process starts with the initial assessment followed by the list of tests according to standards and directives until the compilation of validated technical reports that finally results in the approval.
                            </Text>
                            <Button mt={6} bg='color.200' color='color.500'
                                _hover={{ bg: 'color.200', borderColor: 'color.300' }}
                            > <Link to='/About#what-is-homo'>Learn more</Link></Button>
                        </Box>

                        <Box pb={["5px", "34px"]}
                            pt={["15px", "34px"]}
                            w={['100%', '100%', '30%', '30%']}
                        >

                            <Heading as='h4' color={'color.100'}>
                                Pre-Homologation Process
                            </Heading>
                            <Text fontSize='18' mt={6} color={'color.400'} maxW={'210'} pr={["5px", "25px", "25px", "25px"]}>
                                Pre Homologation is nothing but the performance of all or critical tests as per the applicable regulations similar to actual tests that are being performed by the testing agency during the approval process.
                            </Text>
                            <Button mt={6} bg='color.200' color='color.500' _hover={{ bg: 'color.200', borderColor: 'color.300' }}>

                                <Link to='/About#Pre-Homologation'>Learn more</Link>
                            </Button>
                        </Box>

                        <Box pb={["5px", "34px"]}
                            pt={["15px", "34px"]}
                            w={['100%', '100%', '30%', '30%']}
                        >

                            <Heading as='h4' color={'color.100'}>
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
                            <Button mt={6} bg='color.200' color='color.500' _hover={{ bg: 'color.200', borderColor: 'color.300' }}>
                                <Link to='/About#type-approval'>Learn more</Link>
                            </Button>
                        </Box>
                    </Flex>


                    <Divider pt={'10px'}></Divider>
                    <Flex
                        direction={
                            {
                                sm: 'column',
                                md: 'row',
                                lg: 'row',
                                xl: 'row'
                            }
                        }
                        alignItems='baseline'
                        justifyContent={'space-around'}
                        flexWrap={['wrap', 'wrap', 'nowrap']}
                        pt={'10px'}
                        gap={'40px'}
                    >
                        <Box pb={["5px", "34px"]}
                            pt={["15px", "34px"]}
                            w={['100%', '100%', '30%', '30%']}
                        >

                            <Heading as='h4' color={'color.100'}>
                                Bus Body Builder Accreditation
                            </Heading>
                            <Text mt={6} color={'color.400'} maxW={'1142'} pr={["5px", "25px", "25px", "25px"]}>
                                Accreditation is a mandatory requirement for Bus Body Builders as per CMV Order, 2007. All the Bus Body Builders shall be accredited by the National Accreditation Board & Zonal Accreditation Boards as notified under the said order. The accredited Bus Body builders shall meet the type approval...
                            </Text>
                            <Button mt={6} bg='color.200' color='color.500' _hover={{ bg: 'color.200', borderColor: 'color.300' }}>
                                <Link to='/About#bus-body'>Learn more</Link>
                            </Button>
                        </Box>

                        <Box pb={["5px", "34px"]}
                            pt={["15px", "34px"]}
                            w={['100%', '100%', '30%', '30%']}
                        >

                            <Heading as='h4' color={'color.100'}>
                                PM E‑DRIVE (Scheme)
                            </Heading>
                            <Text mt={6} color={'color.400'} maxW={'1142'} pr={["5px", "25px", "25px", "25px"]}>
                                
                                The Government of India has launched the “PM Electric Drive Revolution in Innovative Vehicle Enhancement (PM E-DRIVE)” scheme with an outlay of ₹10,900 crore over the period from 1 October 2024 to 31 March 2026 (with certain segments extended to March 2028).


                                Key features include:

                                1) Demand-side incentives for electric 2-wheelers, 3-wheelers, ambulances, trucks, and buses.

                                2) A dedicated allocation of ₹2,000 crore for public EV charging infrastructure installation (approx 72,000 charging stations) under the scheme.
                                Press Information Bureau

                                3) Emphasis on localisation of EV manufacturing and testing agency upgradation within India’s EV ecosystem.                           </Text>
                            <Button mt={6} bg='color.200' color='color.500' _hover={{ bg: 'color.200', borderColor: 'color.300' }}>
                                <Link to='/About#fame-body'>Learn more</Link>
                            </Button>
                        </Box>

                        <Box pb={["5px", "34px"]}
                            pt={["15px", "34px"]}
                            w={['100%', '100%', '30%', '30%']}
                        >

                            <Heading as='h4' color={'color.100'}>
                                WMI Registration
                            </Heading>
                            <Text mt={6} color={'color.400'} maxW={'1142'} pr={["5px", "25px", "25px", "25px"]}>
                                Globally, the Vehicle Identification Number (VIN) system is used to uniquely identify a vehicle. The VIN comprises 17 characters that uniquely identify the vehicle as provided in ISO 3779 & ISO 4030. The first 3 characters of VIN that uniquely identify the manufacturer of the vehicle is called (WMI)
                            </Text>
                            <Button mt={6} bg='color.200' color='color.500' _hover={{ bg: 'color.200', borderColor: 'color.300' }}>

                                <Link to='/About#wmi'>Learn more</Link>
                            </Button>

                        </Box>
                    </Flex>

                </Box>
            </Container>
            <Container maxWidth={"98%"}
                pl={["20px", "40px", "40px", "70px"]}
                pr={["20px", "40px", "40px", "70px"]}>
                <Box p={'48px 0px'} className="sliders">
                    <Heading as='h4' fontSize={'36px'} color={'#000'} textAlign="left" mb={'40px'}>
                        Vehicle Type
                    </Heading>
                    <Slider {...threeSlideBanner}>
                        <Box width={["100%", "100%",]}>
                            <Image src={bike} alt='car' />
                        </Box>

                        <Box width={["100%", "100%",]}>
                            <Image src={auto} alt='car' />
                        </Box>
                        <Box width={["100%", "100%",]}>
                            <Image src={car} alt='car' />
                        </Box>
                        <Box width={["100%", "100%",]}>
                            <Image src={truck} alt='car' />
                        </Box>

                        <Box width={["100%", "100%",]}>
                            <Image src={car} alt='car' />
                        </Box>
                        <Box width={["100%", "100%",]}>
                            <Image src={auto} alt='car' />
                        </Box>
                        <Box width={["100%", "100%",]}>
                            <Image src={bike} alt='car' />
                        </Box>
                    </Slider>
                </Box>
            </Container>


            {mname == "loginModal" ?
                <Modal isOpen={isOpen} onClose={onClose} size='4xl' isCentered >
                    <ModalOverlay />
                    <ModalContent >
                        <ModalBody>
                            <Login />
                        </ModalBody>
                    </ModalContent>
                </Modal>
                :
                null}
            {mname == "regModal" ?
                <Modal isOpen={isOpen} onClose={onClose}  >
                    <ModalOverlay /><Register /></Modal>
                : null}
        </>
    )
}
export default Home;