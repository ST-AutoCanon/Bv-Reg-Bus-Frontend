// import React, { useState, useEffect } from "react"
// import { FC } from 'react';
// import {
//     Button,
//     Flex,
//     Box,
//     Image,
//     FormControl,
//     FormLabel,
//     Input,
//     Text,
//     Link,   
// } from "@chakra-ui/react";
// import jwt_decode from "jwt-decode";
// import { useNavigate } from "react-router-dom";
// import logo from '../../assets/images/logo-lg.png';
// import { ArrowBackIcon } from '@chakra-ui/icons';
// import { Post } from "../../utilities/service";
// import { useDispatch,useSelector } from 'react-redux'
// import { setUserData, setToken,setFirstTimeLogin } from "../../features/login/loginSlice";
// import { RootState } from "../../app/store";


// const Login: FC = () => {   
//     const userCrediantial:any = useSelector((state: RootState) => state.loginCredential.forgotPassword);
//     const userData:any = useSelector((state: RootState) => state.loginCredential.userData);
//     const checkResetPassword:boolean = useSelector((state: RootState) => state.loginCredential.checkResetPassword);
//     const [formdata, setFormdata] = React.useState({});
//     const [emailId, setEmailId] = React.useState({});
//     const [changePassowrd, setchangePassowrd] = useState<string>("");

//     const navigate = useNavigate();
//     const dispatch = useDispatch()

//     const [fPassword, setPassword] = useState<boolean>(false);
//     const [error, setError] = useState<string>("");

//     const [form, setForm] = useState({
//         username: '',
//         password: '',
//     });
//     const config = {
//         headers: {
//             Authorization: 'Bearer'
//         }
//     }
//     const loginAPI = "user/signin";
//     const forgotPassword = () => {
//         setPassword(true);
//     }
//     const toLogin = () => {
//         setPassword(false);
//         setError("");
//     }
//     const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
//         setForm({ ...form, [event.target.name]: event.target.value })
//     }
//     const getmailID = (event: React.ChangeEvent<HTMLInputElement>) => {
//         setEmailId({ ...emailId, [event.target.name]: event.target.value })        
//     }
//     const sendMail = async() => {
//         const forgotAPI = "user/forgotPassword";
//         await Post(forgotAPI, emailId, config)
//         .then((resp) => {
//             if (resp.data.status === 'failure') {

//             } else if (resp.data.status === 'success') {
//                 setchangePassowrd(resp.data.message)
//                 dispatch(setFirstTimeLogin(true));   
//             }
//         })
//         .catch((error: string) => {
//             console.log('error');
//         });
//     }   

//     const setLogin = async () => {
//         let formData; 
//         if( form.username !== '' && form.password !== ''){
//             formData = form;          
//         }else{
//             formData = userCrediantial;
//         }
//         await Post(loginAPI, formData, config)
//             .then((resp) => {
//                 if (resp.data.status === 'failure') {
//                     setError(resp.data.body);
//                 } else if (resp.data.status === 'success') {

//                     dispatch(setToken(resp.data.accessToken));
//                     const decoded: any = jwt_decode(resp.data.accessToken);
//                     dispatch(setUserData(decoded.tokenBody));
//                     if (decoded.tokenBody.role === 'admin') {                       
//                         navigate(`/SearchUserOrHomologation`);
//                     } else if (decoded.tokenBody.role === 'user' && decoded.tokenBody.status === 'inactive') {
//                         dispatch(setFirstTimeLogin(true));
//                         if(checkResetPassword){
//                             navigate(`/ResetPassword`);
//                         }else{
//                             navigate(`/NewSignin`);
//                         }
                       
//                     } else if (decoded.tokenBody.role === 'user' && decoded.tokenBody.status === 'active') {
//                         navigate(`/Dashboard`);
//                     }              
//                 }
//             })
//             .catch((error: string) => {
//                 console.log('error');
//             });
//     };
//     const userLogin = () => {
//         form.username !== '' && form.password !== '' ? setLogin() : setError("Please enter Username and Password");
//     }

//     useEffect(() => {
//         if(userCrediantial?.username && userCrediantial?.password ){
//             setLogin()
//          }
//          if (userData.role === 'admin'){
//             navigate(`/SearchUserOrHomologation`);
//          } else if (userData.role === 'user' && userData.status === 'active') {
//             navigate(`/Dashboard`);
//         }           
//     }, [])
//     const redirectToLogin = () => { 
//         setPassword(false);
//         window.location.reload();
//     }
//     useEffect(() => {
//     }, [setError])
//     return (
//         <>
//             {!fPassword && changePassowrd ===''? 
//                 <Flex flexWrap='wrap' pl={['0px', '15px']} p={["15px", "45px"]}>
//                     <Box p={["15px", "45px"]} w={['100%', '100%', '45%']} justifyContent="center" alignItems='center' display='flex'>
//                         <Image src={logo} alt="" title="" mt={["", "35px"]} w={['50%', '50%', '100%']} />
//                     </Box>
//                     <Box width={["0px", "0", "1px"]} borderLeft="1px solid #D9D9D9">

//                     </Box>
//                     <Box pl={['0px', '0px', '95px']} w={['100%', '100%', '50%']}>
//                         <Text fontSize='24px' fontWeight='700' textAlign='center' mb="30px">Welcome</Text>
//                         <FormControl isRequired>
//                             <FormLabel>Username</FormLabel>
//                             <Input
//                                 id="username"
//                                 type="text"
//                                 name="username"
//                                 onChange={changeHandler}
//                                 placeholder='Enter your username' />
//                         </FormControl>

//                         <FormControl mt={4} isRequired>
//                             <FormLabel>Password</FormLabel>
//                             <Input
//                                 id="password"
//                                 type="password"
//                                 name="password"
//                                 onChange={changeHandler}
//                                 placeholder='Enter password' />
//                         </FormControl>
//                         {error !== "" ?
//                             <FormControl>
//                                 <Text p="5px 0px" fontSize={"14px"} color={"red"}> {error}</Text>
//                             </FormControl>
//                             : null}
//                         <FormControl>
//                             <Button
//                                 size='md'
//                                 height='48px'
//                                 mt="39px"
//                                 bg="#7FBF28"
//                                 color='#fff'
//                                 _hover={{ bg: '#7FBF28' }}
//                                 _focus={{ bg: '#7FBF28' }}
//                                 width='100%'
//                                 onClick={userLogin}
//                             >Login</Button>
//                             <Link
//                                 mt="46px"
//                                 color="#949494"
//                                 textAlign="right"
//                                 display='block'
//                                 onClick={forgotPassword}
//                             >Forgot Password ?</Link>
//                         </FormControl>

//                     </Box>
//                 </Flex>
//                 : changePassowrd ==='' ?
//                 <Flex flexWrap='wrap' p={["15px", "45px"]}>
//                     <Box w={['100%']}>

//                         <Text fontSize='24px' fontWeight='700' textAlign='center' mb="30px"> Forgot Password</Text>
//                         <Text color="#949494;" mt="36px" mb="56px" textAlign="center">note : Enter Registered Email ID below, <br />added during Sukalpa Account creation</Text>
//                         <FormControl>
//                             <FormLabel>Email ID</FormLabel>
//                             <Input placeholder='Enter Email ID' name="username" type="email"  onChange={getmailID}/>
//                         </FormControl>

//                         <FormControl>
//                             <Button
//                                 size='md'
//                                 height='48px'
//                                 mt="39px"
//                                 bg="#7FBF28"
//                                 color='#fff'
//                                 _hover={{ bg: '#7FBF28' }}
//                                 _focus={{ bg: '#7FBF28' }}
//                                 width='100%'
//                                 onClick={sendMail}
//                                 >Send Password to E-Mail</Button>
//                         </FormControl>
//                         <FormControl textAlign={"center"}>
//                             <Button leftIcon={<ArrowBackIcon />} mt={"25px"} variant='clear' onClick={toLogin}> Login</Button>
//                         </FormControl>
//                     </Box>
//                 </Flex>
//                 : changePassowrd !=='' &&

//                 <Flex flexWrap='wrap' p={["15px", "45px"]}>
//                 <Box w={['100%']}>       
//                     <Text color="#949494;" mt="10px" mb="10px" textAlign="center">{changePassowrd}</Text>   
//                     <FormControl textAlign={'center'}>
//                         <Button
//                             size='md'
//                             height='48px'
//                             mt="39px"
//                             bg="#7FBF28"
//                             color='#fff'
//                             _hover={{ bg: '#7FBF28' }}
//                             _focus={{ bg: '#7FBF28' }}
//                             width='150px'
//                             onClick={redirectToLogin}
//                             >Login</Button>
//                     </FormControl>
                  
//                 </Box>
//             </Flex>
                
//             }


          

            
//         </>

//     )
// }

// export default Login;

import React, { useState, useEffect } from "react"
import { FC } from 'react';
import {
    Button,
    Flex,
    Box,
    Image,
    FormControl,
    FormLabel,
    Input,
    Text,
    Link,  
    InputGroup, InputRightElement, IconButton 
} from "@chakra-ui/react";
import jwt_decode from "jwt-decode";
import { useNavigate } from "react-router-dom";
import logo from '../../assets/images/sukalpa_logo.png';
import { ArrowBackIcon,ViewIcon, ViewOffIcon} from '@chakra-ui/icons';
import { Post } from "../../utilities/service";
import { useDispatch,useSelector } from 'react-redux'
import { setUserData, setToken,setFirstTimeLogin ,setVehicleType } from "../../features/login/loginSlice";
import { RootState } from "../../app/store";


const Login: FC = () => {   
    const userCrediantial:any = useSelector((state: RootState) => state.loginCredential.forgotPassword);
    const userData:any = useSelector((state: RootState) => state.loginCredential.userData);
    const checkResetPassword:boolean = useSelector((state: RootState) => state.loginCredential.checkResetPassword);
    const [formdata, setFormdata] = React.useState({});
    const [emailId, setEmailId] = React.useState({});
    const [changePassowrd, setchangePassowrd] = useState<string>("");
    const [showPassword, setShowPassword] = useState(false);

    

    const navigate = useNavigate();
    const dispatch = useDispatch()

    const [fPassword, setPassword] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const [form, setForm] = useState({
        username: '',
        password: '',
    });
    const config = {
        headers: {
            Authorization: 'Bearer'
        }
    }
    const loginAPI = "user/signin";
    const forgotPassword = () => {
        setPassword(true);
    }
    const toLogin = () => {
        setPassword(false);
        setError("");
    }
    const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [event.target.name]: event.target.value })
    }
    const getmailID = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmailId({ ...emailId, [event.target.name]: event.target.value })        
    }
    const sendMail = async() => {
        const forgotAPI = "user/forgotPassword";
        await Post(forgotAPI, emailId, config)
        .then((resp) => {
            if (resp.data.status === 'failure') {

            } else if (resp.data.status === 'success') {
                setchangePassowrd(resp.data.message)
                dispatch(setFirstTimeLogin(true));   
            }
        })
        .catch((error: string) => {
            // console.log('error');
        });
    }   

   const setLogin = async () => {
    let formData;

    if (form.username !== '' && form.password !== '') {
        formData = form;
    } else {
        formData = userCrediantial;
    }

    await Post(loginAPI, formData, config)
        .then((resp) => {

            if (resp.data.status === 'failure') {
                setError(resp.data.body);

            } else if (resp.data.status === 'success') {

                console.log("Login API Response:", resp.data);
                console.log("Vehicle Type from API:", resp.data.vehicleType);

                dispatch(setToken(resp.data.accessToken));

                const decoded: any = jwt_decode(resp.data.accessToken);

                dispatch(
                    setUserData({
                        ...decoded.tokenBody,
                        vehicleType: resp.data.vehicleType,
                    })
                );
                dispatch(setVehicleType(resp.data.vehicleType));

                if (decoded.tokenBody.role === 'admin') {

                    navigate(`/SearchUserOrHomologation`);

                } else if (
                    decoded.tokenBody.role === 'user' &&
                    decoded.tokenBody.status === 'inactive'
                ) {

                    dispatch(setFirstTimeLogin(true));

                    if (checkResetPassword) {
                        navigate(`/ResetPassword`);
                    } else {
                        navigate(`/NewSignin`);
                    }

                } else if (
                    decoded.tokenBody.role === 'user' &&
                    decoded.tokenBody.status === 'active'
                ) {

                    if (resp.data.vehicleType === "Bus") {
    console.log("========== BUS LOGIN REDIRECT ==========");
    console.log("Vehicle Type:", resp.data.vehicleType);
    console.log("Current Path Before:", window.location.pathname);

    navigate("/BusHomologation", { replace: true });

    console.log("Navigation called for Bus");
} else {
    console.log("========== NORMAL LOGIN REDIRECT ==========");
    console.log("Vehicle Type:", resp.data.vehicleType);

    navigate("/Dashboard", { replace: true });
}
                }
            }
        })
        .catch((error: string) => {
            console.log('error');
        });
};
    const userLogin = () => {
        form.username !== '' && form.password !== '' ? setLogin() : setError("Please enter Username and Password");
    }

    useEffect(() => {
    if (userCrediantial?.username && userCrediantial?.password) {
        setLogin();
    }

    if (userData.role === 'admin') {
        navigate(`/SearchUserOrHomologation`);
    }
}, []);
    const redirectToLogin = () => { 
        setPassword(false);
        window.location.reload();
    }
    useEffect(() => {
    }, [setError])
    return (
        <>
            {!fPassword && changePassowrd ===''? 
                <Flex flexWrap='wrap' pl={['0px', '15px']} p={["15px", "45px"]}>
                    <Box p={["15px", "45px"]} w={['100%', '100%', '45%']} justifyContent="center" alignItems='center' display='flex'>
                        <Image src={logo} alt="" title="" mt={["", "35px"]} w={['50%', '50%', '100%']} />
                    </Box>
                    <Box width={["0px", "0", "1px"]} borderLeft="1px solid #D9D9D9">

                    </Box>
                    <Box pl={['0px', '0px', '95px']} w={['100%', '100%', '50%']}>
                        <Text fontSize='24px' fontWeight='700' textAlign='center' mb="30px">Welcome</Text>
                        <FormControl isRequired>
                            <FormLabel>Username</FormLabel>
                            <Input
                                id="username"
                                type="text"
                                name="username"
                                onChange={changeHandler}
                                placeholder='Enter your username' />
                        </FormControl>

                        <FormControl mt={4} isRequired>
  <FormLabel>Password</FormLabel>
  <InputGroup>
    <Input
      id="password"
      type={showPassword ? "text" : "password"} // toggle show/hide
      name="password"
      onChange={changeHandler}
      placeholder="Enter password"
    />
    <InputRightElement>
      <IconButton
        aria-label={showPassword ? "Hide password" : "Show password"}
        icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
        onClick={() => setShowPassword(!showPassword)}
        size="sm"
        variant="ghost"
      />
    </InputRightElement>
  </InputGroup>
</FormControl>

                        {error !== "" ?
                            <FormControl>
                                <Text p="5px 0px" fontSize={"14px"} color={"red"}> {error}</Text>
                            </FormControl>
                            : null}
                        <FormControl>
                            <Button
                                size='md'
                                height='48px'
                                mt="39px"
                                bg="#7FBF28"
                                color='#fff'
                                _hover={{ bg: '#7FBF28' }}
                                _focus={{ bg: '#7FBF28' }}
                                width='100%'
                                onClick={userLogin}
                            >Login</Button>
                            <Link
                                mt="46px"
                                color="#949494"
                                textAlign="right"
                                display='block'
                                onClick={forgotPassword}
                            >Forgot Password ?</Link>
                        </FormControl>

                    </Box>
                </Flex>
                : changePassowrd ==='' ?
                <Flex flexWrap='wrap' p={["15px", "45px"]}>
                    <Box w={['100%']}>

                        <Text fontSize='24px' fontWeight='700' textAlign='center' mb="30px"> Forgot Password</Text>
                        <Text color="#949494;" mt="36px" mb="56px" textAlign="center">note : Enter Registered Email ID below, <br />added during Sukalpa Account creation</Text>
                        <FormControl>
                            <FormLabel>Email ID</FormLabel>
                            <Input placeholder='Enter Email ID' name="username" type="email"  onChange={getmailID}/>
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
                                width='100%'
                                onClick={sendMail}
                                >Send Password to E-Mail</Button>
                        </FormControl>
                        <FormControl textAlign={"center"}>
                            <Button leftIcon={<ArrowBackIcon />} mt={"25px"} variant='clear' onClick={toLogin}> Login</Button>
                        </FormControl>
                    </Box>
                </Flex>
                : changePassowrd !=='' &&

                <Flex flexWrap='wrap' p={["15px", "45px"]}>
                <Box w={['100%']}>       
                    <Text color="#949494;" mt="10px" mb="10px" textAlign="center">{changePassowrd}</Text>   
                    <FormControl textAlign={'center'}>
                        <Button
                            size='md'
                            height='48px'
                            mt="39px"
                            bg="#7FBF28"
                            color='#fff'
                            _hover={{ bg: '#7FBF28' }}
                            _focus={{ bg: '#7FBF28' }}
                            width='150px'
                            onClick={redirectToLogin}
                            >Login</Button>
                    </FormControl>
                  
                </Box>
            </Flex>
                
            }


          

            
        </>

    )
}

export default Login;