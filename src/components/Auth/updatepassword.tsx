import * as React from "react"
import { useState, useEffect } from "react"
import { FC } from 'react';
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import { RootState } from "../../app/store";
import {
    Button,
    Flex,
    Box,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
    useDisclosure,
    FormControl,
    FormLabel,
    Input,
    Text,
    ModalCloseButton,
    HStack,
    Image,
    ModalFooter

} from "@chakra-ui/react";
import { useDispatch } from 'react-redux'
import { setPassword, setUserData,setPasswordChanged } from "../../features/login/loginSlice";
import { Post } from "../../utilities/service";

const NewSignin: FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch()
    const firstTimeLogin: boolean = useSelector((state: RootState) => state.loginCredential.firstTimeLogin);
    const idName: any = useSelector((state: RootState) => state.loginCredential.userData);
    const token: string = useSelector((state: RootState) => state.loginCredential.token);
    const [passwordCahnge, setpasswordCahnge] = useState<boolean>(false);

    const { isOpen: passwordUpdateisOpen, onOpen: passwordUpdateOpen, onClose: passwordUpdateClose } = useDisclosure()
    const { isOpen: logidInisOpen, onOpen: logidInOpen, onClose: logidInClose } = useDisclosure({ defaultIsOpen: true })
    const { isOpen: afterChangePasswordIsopen, onOpen: afterChangePasswordOpen, onClose: afterChangePasswordOnclose } = useDisclosure({ defaultIsOpen: true })

    const queryParameters = new URLSearchParams(window.location.search)
    const password = queryParameters.get("pass")
    const username = queryParameters.get("name")
    let mailPass = { username: username, password: password, };



    const config = {
        headers: {
            Authorization: 'Bearer ' + token
        }
    }
    const searchApiURL = "user/resetPassword";

    const [form, setForm] = useState({ password: '', confirmPassword: '' });
    const [passwordMatcH, setPasswordMatcH] = useState<boolean>(false);


    const updateNewPassword = async (userData: {}) => {
        await Post(searchApiURL, userData, config)
            .then((resp) => {
                if (resp.data.status === 'success') {
                    setpasswordCahnge(true)
                    dispatch(setUserData({}));
                    // console.log('resp.data', resp.data)
                    // navigate(`/Dashboard`);
                }
                if (resp.data.status === 'failure') { }
            })
            .catch((error) => {
                // console.log('error');
            });
    };
    const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [event.target.name]: event.target.value })
        setPasswordMatcH(false);
    }


    useEffect(() => {   
        if (mailPass.username && mailPass.password && Object.keys(idName).length === 0) {
            dispatch(setPassword(mailPass));
            navigate(`/Login`);
        }
    }, [])
    const updatePassword = () => {
        let arrayData = {
            "userId": idName._id,
            "username": idName.username,
            "password": form.password
        };
        if (form.password === form.confirmPassword && form.password !== '' && form.confirmPassword !== '') {
            updateNewPassword(arrayData)
        } else {
            setPasswordMatcH(true);
        }

    }
    const redirectToLogin = () => {
        dispatch(setPasswordChanged(true));
        navigate(`/`);
    }

    
    return (
        <>
            {firstTimeLogin  && !passwordCahnge && (idName.role !=='admin' || idName.status !=='active') ?

                <Modal isOpen={firstTimeLogin} onClose={passwordUpdateClose} size='4xl' isCentered>
                    <ModalOverlay />
                    <ModalContent maxW="500px">
                        <ModalBody>
                            <form >
                                <Flex flexWrap='wrap' p={["15px", "45px"]}>
                                    <Box w={['100%']}>
                                        <Text fontSize='24px' fontWeight='700' textAlign='center' mb="30px">Change Password</Text>
                                        <Text color="#949494;" mt="36px" mb="56px" textAlign="center">note : Password is case sensitive</Text>
                                        {passwordMatcH && <Text color="red" mt="10px" mb="10px" textAlign="left">
                                            New Password and Confirm Password Shoul be same</Text>}


                                        <FormControl>
                                            <FormLabel>New Password</FormLabel>
                                            <Input placeholder='Enter new password' type={'password'} name="password" onChange={changeHandler} />
                                        </FormControl>

                                        <FormControl mt={4}>
                                            <FormLabel>Confirm New Password</FormLabel>
                                            <Input placeholder='Retype password' name="confirmPassword" type={'password'} onChange={changeHandler} />
                                        </FormControl>
                                        <FormControl>
                                            <Button
                                                size='md'
                                                height='48px'
                                                mt="39px"
                                                bg="#7FBF28"
                                                color='#fff'
                                                _hover={{ bg: '#7FBF28' }}
                                                _focus={{ bg: '#7FBF28' }}
                                                width='100%' onClick={updatePassword}>Set Password

                                            </Button>

                                        </FormControl>
                                    </Box>
                                </Flex>
                            </form>
                        </ModalBody>
                    </ModalContent>
                </Modal>

                :!passwordCahnge && idName.status ==='active' ?
                <Modal isOpen={logidInisOpen} onClose={logidInClose} >
                    <ModalOverlay />
                    <ModalContent className='resister-success' maxW={"600px"} borderRadius={'5px'}>
                        <ModalCloseButton color={"#000"} />
                        <ModalBody bg="#fff" >
                            <Flex flexWrap='wrap' pt={'45px'}
                                justifyContent="center"
                                display={'flex'}
                                alignItems={'center'}
                            >

                                <Box>
                                    <Text fontSize={'18px'} fontFamily={'Open Sans'}>User already logedin, please logout and login </Text>
                                </Box>

                            </Flex>

                        </ModalBody>
                        <ModalFooter position={'relative'} h='80px'>
                            <ModalCloseButton
                                top={'20px'}
                                left={'0'}
                                right={'0'}
                                margin={'0 auto'}
                                color={"#fff"}
                                w="185px"
                                bg={'#7FBD2C'}
                                fontSize='16px'
                                onClick={updatePassword}
                            >Close</ModalCloseButton>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
                :
                <Modal isOpen={true} onClose={afterChangePasswordOnclose} >
                    <ModalOverlay />
                    <ModalContent className='resister-success' maxW={"600px"} borderRadius={'5px'}>
                        <ModalCloseButton color={"#000"} />
                        <ModalBody bg="#fff" >
                            <Flex flexWrap='wrap' pt={'45px'}
                                justifyContent="center"
                                display={'flex'}
                                alignItems={'center'}
                            >

                                <Box>
                                    <Text fontSize={'18px'} fontFamily={'Open Sans'}>Your Password changed successfully </Text>
                                </Box>

                            </Flex>

                        </ModalBody>
                        <ModalFooter position={'relative'} h='80px'>
                            <ModalCloseButton
                                top={'20px'}
                                left={'0'}
                                right={'0'}
                                margin={'0 auto'}
                                color={"#fff"}
                                w="185px"
                                bg={'#7FBD2C'}
                                fontSize='16px'
                                onClick={redirectToLogin}
                            >Login</ModalCloseButton>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            }

            
        </>


    )
}

export default NewSignin;