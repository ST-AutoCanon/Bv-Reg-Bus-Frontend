// import { FC, useEffect, useState }  from 'react';
// import * as React from "react"
// import {
//     Container,
//     Flex,
//     Box,
//     Spacer,
//     Image,
//     Button,
//     Stack,
//     Text,
//     Avatar,
//     Show,
//     Menu,
//     MenuButton,
//     MenuList,
//     MenuItem,
//   } from "@chakra-ui/react";
//   import { ChevronDownIcon } from '@chakra-ui/icons'
//   import { useNavigate } from 'react-router-dom';
//   import { Link} from 'react-router-dom';
//   import logo from '../../assets/images/logo.png';
//   import userIcon from '../../assets/images/userIcon.png';  
//   import { useSelector, useDispatch } from 'react-redux';
//   import { RootState } from "../../app/store";
//   import {logout,setUserData} from '../../features/login/loginSlice';
//   import {Title} from '../../utilities/meta';
//   import jwtDecode from 'jwt-decode'; 
// const Header: FC = () =>{
//   const navigate = useNavigate();
//   const token: any = useSelector((state: RootState) => state.loginCredential.token);
//   const userData:any = useSelector((state: RootState) => state.loginCredential.userData);
//   const {username, role} = userData;
//   const dispatch = useDispatch();
//   Title({
//     title: 'Bv-Reg'
//   });
//   const userLogout = () => {
//     dispatch(logout())
//     dispatch(setUserData({}))  
//     navigate('/')  

//   }
//   useEffect(() => {
//     if (token) {
//       try {
//         // const decoded: any = token;
//         const decoded: any = jwtDecode(token);
//         const currentTime = Math.floor(Date.now() / 1000);
//         if (decoded.exp < currentTime) {
//           console.log("Token expired. Logging out.");
//           userLogout();
//         }
//       } catch (error) {
//         console.error("Error decoding token:", error);
//         userLogout();
//       }
//     }
//   }, [token]);
//  return(
//     <Container maxWidth='100%' bg='#fff' boxShadow='md' p={2}>
//         <Flex flexWrap='wrap' alignItems='center'>
//             <Box alignItems='center'
//             display={'flex'} 
//             justifyContent={'space-between'}
//             alignContent={'center'}

//              width={[
//                 '30%', // 0-30em
//                 '20%', // 30em-48em
//                 '15%', // 48em-62em
//                 '15%', // 62em+
//               ]} pl={5}>
//                 <Link to='/'><Image src={logo} alt="brand"/></Link>

//                 </Box>
//                 {username !== undefined && userData.status !== 'inactive'  || userData.role === 'admin' ? 
//             <Show breakpoint='(max-width: 767px)'>
//               <Box
//                 width={[
//                   '70%', // 0-30em
//                   '80%', // 30em-48em
//                   '15%', // 48em-62emg
//                   '15%', // 62em+
//                 ]}>
//                 <Flex direction='row' justifyContent='right'>
//                   <Box pt={5} pr={5} textAlign='center'>
//                     <Text fontSize={14} lineHeight={0} pt={5}>Welcome</Text>
//                     <Text fontSize={14} lineHeight={0} as='b'>{username}</Text>
//                   </Box>
//                   <Box pt={4} pr={5} textAlign='left'>
//                     <Avatar name='Dan Abrahmov' w={[70]} h={[70]} src={userIcon} />
//                     <Menu closeOnSelect={false}>
//                         <MenuButton
//                           as={Button}
//                           rightIcon={<ChevronDownIcon color={"#000"} />}
//                           size='md'
//                           w={"25px"}
//                           height='48px'
//                           mt={"12px"}
//                           bg="#fff"
//                           _hover={{ bg: '#fff' }}
//                           _focus={{ bg: '#fff' }}
//                           _active={{ bg: '#fff' }}

//                         >
//                         </MenuButton>
//                         <MenuList mt={"25px"}>
//                           <MenuItem _hover={{ bg: '#fff' }} onClick={userLogout}>Logout</MenuItem>
//                         </MenuList>
//                       </Menu>
//                   </Box>
//                 </Flex>
//               </Box>
//             </Show> : null }
//             <Box 
//             width={[
//                 '100%', // 0-30emhh
//                 '100%', // 30em-48em
//                 '70%', // 48em-62em
//                 '55%', // 62em+
//               ]} justifyContent='center' alignItems='center'>

//          <Show breakpoint='(min-width: 1024px)'>
//            <Stack direction='row' spacing={4} alignItems='center' height={20}  fontSize={16}>
//              {
//              (role === 'user' && role !== undefined || role === 'admin') &&

//               <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}><Link to='/'>Home</Link></Button>

//              }

// {
//              (role === 'user' && role !== undefined || role === 'admin') &&

//               <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}><Link to='/About'>About</Link></Button>

//              }


//              {role === 'user' && role !== undefined ? <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}><Link to='/Dashboard'>Homologation</Link></Button> :
//                ""
//              }
//              {role === 'user' && role !== undefined ? <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}><Link to='/WMI'>WMI</Link></Button> :
//                ""
//              }
//              {role === 'admin' && role !== undefined ? <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}><Link to='/SearchUserOrHomologation'>Dashboard</Link></Button> : ""}
//              {role !== undefined ?
//                <>
//                  {/* <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}>WMI</Button> */}
//                  <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}>Udyam reg</Button>
//                  <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}>Inbox</Button>
//                </>
//                : ""}
//            </Stack>
//          </Show>
//               <Show breakpoint='(max-width: 1023px)'>
//                   <Box width='100%' overflow='scroll'>
//              <Stack direction='row' width='800px' spacing={4} alignItems='center' height={20} pt={4} fontSize={16}>
//                <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}><Link to='/'>Home</Link></Button>
//                {role === 'user' && role !== undefined ? <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}><Link to='/Dashboard'>HomoLogation</Link></Button> :
//                  ""}
//                   {role === 'user' && role !== undefined ? <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}><Link to='/WMI'>WMI</Link></Button> :
//                  ""}
//                {role === 'admin' && role !== undefined ? <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}><Link to='/SearchUserOrHomologation'>Dashboard</Link></Button>
//                  : ""}
//                {role !== undefined ?
//                  <>
//                    {/* <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}>WMI</Button> */}
//                    <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}>Udyam reg</Button>
//                    <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}>Inbox</Button>
//                  </>
//                  : ""}
//              </Stack>
//                   </Box>

//               </Show>


//               </Box>

//             <Spacer/>
//             {username !== undefined && userData.status !== 'inactive' || userData.role === 'admin' ? 
//             <Show breakpoint='(min-width: 768px)'>
//             <Box 
//             width={[
//                 '100%', // 0-30em
//                 '100%', // 30em-48em
//                 '15%', // 48em-62emg
//                 '25%', // 62em+
//               ]}>
//                  <Flex direction='row' justifyContent='right'>
//                      <Box pt={5} pr={5} textAlign='left'>
//                          <Text fontSize={14} lineHeight={0} pt={5}>Welcome</Text>
//                          <Text fontSize={14} lineHeight={'36px'} as='b'>{username}</Text>
//                      </Box>
//                      <Box pt={4} pr={5} textAlign='left'>
//                          <Avatar name='Dan Abrahmov' w={[18, 24, 70]} h={[18, 24, 70]} src={userIcon}/>
//                       <Menu>
//                         <MenuButton
//                           as={Button}
//                           rightIcon={<ChevronDownIcon color={"#000"} />}
//                           size='md'
//                           w={"auto"}
//                           height='auto'
//                           mt={"12px"}
//                           bg="#fff"
//                           _hover={{ bg: '#fff' }}
//                           _focus={{ bg: '#fff' }}
//                           _active={{ bg: '#fff' }}
//                         >
//                         </MenuButton>
//                         <MenuList>
//                           <MenuItem _hover={{ bg: '#fff' }} onClick={userLogout} textAlign={'center'}>Logout</MenuItem>
//                         </MenuList>
//                       </Menu>
//                      </Box>
//                  </Flex>
//               </Box>
//               </Show>
//               : null }
//         </Flex>
//     </Container>
//  )
// }
// export default Header;



































// import { FC, useEffect, useState }  from 'react';
// import * as React from "react"
// import {
//     Container,
//     Flex,
//     Box,
//     Spacer,
//     Image,
//     Button,
//     Stack,
//     Text,
//     Avatar,
//     Show,
//     Menu,
//     MenuButton,
//     MenuList,
//     MenuItem,
//   } from "@chakra-ui/react";
//   import { ChevronDownIcon } from '@chakra-ui/icons'
//   import { useNavigate } from 'react-router-dom';
//   import { Link} from 'react-router-dom';
//   import logo from '../../assets/images/logo.png';
//   import userIcon from '../../assets/images/userIcon.png';  
//   import { useSelector, useDispatch } from 'react-redux';
//   import { RootState } from "../../app/store";
//   import {logout,setUserData} from '../../features/login/loginSlice';
//   import {Title} from '../../utilities/meta';
//   import jwtDecode from 'jwt-decode'; 
// const Header: FC = () =>{
//   const navigate = useNavigate();
//    const token: any = useSelector((state: RootState) => state.loginCredential.token);
//   const userData:any = useSelector((state: RootState) => state.loginCredential.userData);
//   const {username, role} = userData;
//   console.log('userData-username:',userData);
//   const dispatch = useDispatch();
//   Title({
//     title: 'Auto Canon'
//   });
//   const userLogout = () => {
//     dispatch(logout())
//     dispatch(setUserData({}))  
//     navigate('/')  

//   }
//   useEffect(() => {
//     if (token) {
//       try {
//         // const decoded: any = token;
//         const decoded: any = jwtDecode(token);
//         const currentTime = Math.floor(Date.now() / 1000);
//         if (decoded.exp < currentTime) {
//           console.log("Token expired. Logging out.");
//           userLogout();
//         }
//       } catch (error) {
//         console.error("Error decoding token:", error);
//         userLogout();
//       }
//     }
//   }, [token]);
//  return(
//     <Container maxWidth='100%' bg='#fff' boxShadow='md' p={2}>
//         <Flex flexWrap='wrap' alignItems='center'>
//             <Box alignItems='center'
//             display={'flex'} 
//             justifyContent={'space-between'}
//             alignContent={'center'}

//              width={[
//                 '30%', // 0-30em
//                 '20%', // 30em-48em
//                 '15%', // 48em-62em
//                 '15%', // 62em+
//               ]} pl={5}>
//                 <Link to='/'><Image src={logo} alt="brand"/></Link>

//                 </Box>
//                 {username !== undefined && userData.status !== 'inactive'  || userData.role === 'admin' ? 

//             <Show breakpoint='(max-width: 767px)'>
//               <Box
//                 width={[
//                   '70%', // 0-30em
//                   '80%', // 30em-48em
//                   '15%', // 48em-62emg
//                   '15%', // 62em+
//                 ]}>
//                 <Flex direction='row' justifyContent='right'>
//                   <Box pt={5} pr={5} textAlign='center'>
//                     <Text fontSize={14} lineHeight={0} pt={5}>Welcome</Text>
//                     <Text fontSize={14} lineHeight={0} as='b'>{username}</Text>
//                   </Box>
//                   <Box pt={4} pr={5} textAlign='left'>
//                     <Avatar name='Dan Abrahmov' w={[70]} h={[70]} src={userIcon} />
//                     <Menu closeOnSelect={false}>
//                         <MenuButton
//                           as={Button}
//                           rightIcon={<ChevronDownIcon color={"#000"} />}
//                           size='md'
//                           w={"25px"}
//                           height='48px'
//                           mt={"12px"}
//                           bg="#fff"
//                           _hover={{ bg: '#fff' }}
//                           _focus={{ bg: '#fff' }}
//                           _active={{ bg: '#fff' }}

//                         >
//                         </MenuButton>
//                         <MenuList mt={"25px"}>
//                           <MenuItem _hover={{ bg: '#fff' }} onClick={userLogout}>Logout</MenuItem>
//                         </MenuList>
//                       </Menu>
//                   </Box>
//                 </Flex>
//               </Box>
//             </Show> : null }
//             <Box 
//             width={[
//                 '100%', // 0-30emhh
//                 '100%', // 30em-48em
//                 '70%', // 48em-62em
//                 '55%', // 62em+
//               ]} justifyContent='center' alignItems='center'>

//          <Show breakpoint='(min-width: 1024px)'>
//            <Stack direction='row' spacing={4} alignItems='center' height={20}  fontSize={16}>
//              {
//              (role === 'user' && role !== undefined || role === 'admin') &&

//               <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}><Link to='/'>Home</Link></Button>

//              }

// {
//              (role === 'user' && role !== undefined || role === 'admin') &&

//               <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}><Link to='/About'>About</Link></Button>

//              }


//              {role === 'user' && role !== undefined ? <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}><Link to='/Dashboard'>Homologation</Link></Button> :
//                ""
//              }
//                {role === 'user' && role !== undefined ? <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}><Link to='/WMI'>WMI</Link></Button> :
//                ""
//              }
//              {role === 'admin' && role !== undefined ? <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}><Link to='/SearchUserOrHomologation'>Dashboard</Link></Button> : ""}
//              {role !== undefined ?
//                <>
//                  {/* <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}>WMI</Button> */}
//                  <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}>Udyam reg</Button>
//                  <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}>Inbox</Button>
//                </>
//                : ""}
//            </Stack>
//          </Show>
//               <Show breakpoint='(max-width: 1023px)'>
//                   <Box width='100%' overflow='scroll'>
//              <Stack direction='row' width='800px' spacing={4} alignItems='center' height={20} pt={4} fontSize={16}>
//                <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}><Link to='/'>Home</Link></Button>
//                {role === 'user' && role !== undefined ? <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}><Link to='/Dashboard'>HomoLogation</Link></Button> :
//                  ""}
//                   {role === 'user' && role !== undefined ? <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}><Link to='/WMI'>WMI</Link></Button> :
//                  ""}
//                {role === 'admin' && role !== undefined ? <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}><Link to='/SearchUserOrHomologation'>Dashboard</Link></Button>
//                  : ""}
//                {role !== undefined ?
//                  <>
//                    {/* <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}>WMI</Button> */}
//                    <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}>Udyam reg</Button>
//                    <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}>Inbox</Button>
//                  </>
//                  : ""}
//              </Stack>
//                   </Box>

//               </Show>


//               </Box>

//             <Spacer/>
//             {username !== undefined && userData.status !== 'inactive' || userData.role === 'admin' ? 
//             <Show breakpoint='(min-width: 768px)'>
//             <Box 
//             width={[
//                 '100%', // 0-30em
//                 '100%', // 30em-48em
//                 '15%', // 48em-62emg
//                 '25%', // 62em+
//               ]}>
//                  <Flex direction='row' justifyContent='right'>
//                      <Box pt={5} pr={5} textAlign='left'>
//                          <Text fontSize={14} lineHeight={0} pt={5}>Welcome</Text>
//                          <Text fontSize={14} lineHeight={'36px'} as='b'>{username}</Text>
//                      </Box>
//                      <Box pt={4} pr={5} textAlign='left'>
//                          <Avatar name='Dan Abrahmov' w={[18, 24, 70]} h={[18, 24, 70]} src={userIcon}/>
//                       <Menu>
//                         <MenuButton
//                           as={Button}
//                           rightIcon={<ChevronDownIcon color={"#000"} />}
//                           size='md'
//                           w={"auto"}
//                           height='auto'
//                           mt={"12px"}
//                           bg="#fff"
//                           _hover={{ bg: '#fff' }}
//                           _focus={{ bg: '#fff' }}
//                           _active={{ bg: '#fff' }}
//                         >
//                         </MenuButton>
//                         <MenuList>
//                           <MenuItem _hover={{ bg: '#fff' }} onClick={userLogout} textAlign={'center'}>Logout</MenuItem>
//                         </MenuList>
//                       </Menu>
//                      </Box>
//                  </Flex>
//               </Box>
//               </Show>
//               : null }
//         </Flex>
//     </Container>
//  )
// }
// export default Header;

import { FC, useEffect, useState, useRef } from 'react';
import * as React from "react"
import {
  Container,
  Flex,
  Box,
  Spacer,
  Image,
  Button,
  Stack,
  Text,
  Avatar,
  Show,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,

} from "@chakra-ui/react";


import { ChevronDownIcon } from '@chakra-ui/icons'
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/logo.png';
import userIcon from '../../assets/images/userIcon.png';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from "../../app/store";
import { logout, setUserData } from "../../features/login/loginSlice";
import { Title } from "../../utilities/meta";
import jwtDecode from 'jwt-decode';


const Header: FC = () => {
  const navigate = useNavigate();
  const token: any = useSelector((state: RootState) => state.loginCredential.token);
  const userData: any = useSelector((state: RootState) => state.loginCredential.userData);
  const { username, role,vehicleType } = userData;
  console.log("========== HEADER DEBUG ==========");
console.log("userData:", userData);
console.log("vehicleType:", vehicleType);
console.log("role:", role);
console.log("==================================");
  const dispatch = useDispatch();
  // const [timer, setTimer] = useState<any>(null);
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLogout, setIsLogout] = useState(false);

  const cancelRef = useRef<HTMLButtonElement>(null); // Ref for the least destructive action button

  const autoLogoutTimerRef = useRef<NodeJS.Timeout | null>(null);  // Store auto-logout timer
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null); // Store logout timer
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null); // Store inactivity timer
  const [logoutReason, setLogoutReason] = useState<string | null>(null);

  const showLogoutAlertt = (reason: string) => {
    setLogoutReason(reason);
    setIsOpen(true);
  };
  // Set the title
  // Title({ title: "Auto Canon" });
  Title({ title: "Bv-reg" });

  // User logout function
  const userLogout = () => {
    dispatch(logout());
    dispatch(setUserData({}));
    navigate("/");
  };



  const showLogoutAlert = () => {
    // console.log("Showing logout alert");
    setIsOpen(true);
  };

  // Function to handle closing the alert dialog
  const onClose = () => {
    setIsOpen(false);
    if (!isLogout && autoLogoutTimerRef.current) {
      clearTimeout(autoLogoutTimerRef.current);
      autoLogoutTimerRef.current = null;
      userLogout();
    }
  };

  // Function to stay logged in
  const onStayLoggedIn = () => {
    if (autoLogoutTimerRef.current) {
      clearTimeout(autoLogoutTimerRef.current);
      autoLogoutTimerRef.current = null;
    }
    resetTimer(); // Reset inactivity timer
    setIsOpen(false); // Close the dialog
  };

  // Function to handle logout
  const onLogout = () => {
    if (autoLogoutTimerRef.current) {
      clearTimeout(autoLogoutTimerRef.current);
      autoLogoutTimerRef.current = null;
    }
    // logoutTimerRef.current = setTimeout(() => {
    // console.log("User confirmed logout. Logging out.");
    userLogout();
    // }, 10 * 1000);
    setIsOpen(false);
  };
  // Function to reset the inactivity timer
  const resetTimer = () => {
    if (
      username !== undefined &&
      (userData?.status !== "inactive" || userData?.role === "admin")
    ) {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      inactivityTimerRef.current = setTimeout(() => {
        // console.log("User inactive for 5 Minutes. Showing logout alert.");
        showLogoutAlert();
      }, 5 * 60 * 1000);
    }
  };
  // useEffect(() => {
  //   if (token) {
  //     try {
  //       const { exp } = jwtDecode<any>(token);
  //       if (exp < Date.now() / 1000) {
  //         console.log("Token expired. Logging out.");
  //         userLogout();
  //       }
  //     } catch {
  //       console.error("Invalid token. Logging out.");
  //       userLogout();
  //     }
  //   }
  // }, [token]);

  // useEffect(() => {
  //   if (!token) return;

  //   try {
  //     const { exp } = jwtDecode<any>(token); // expiry time in seconds
  //     const currentTime = Date.now() / 1000; // current time in seconds
  //     const timeLeft = exp - currentTime; // seconds remaining

  //     if (timeLeft <= 0) {
  //       // Token already expired
  //       userLogout(); // auto logout silently
  //       return;
  //     }

  //     // Only show warning if at least 60 seconds are left
  //     if (timeLeft > 60) {
  //       const msUntilWarning = (timeLeft - 60) * 1000; // time until 1-minute warning
  //       const msUntilLogout = timeLeft * 1000; // full token timeout

  //       const warningTimeout = setTimeout(() => {
  //         showLogoutAlertt("Your session will expire in 1 minute. Please save your work.");
  //         // Trigger stay login after 15 seconds
  //       stayLoginTimeout = setTimeout(() => {
        
  //       }, 15000);
  //       }, msUntilWarning);

  //       const logoutTimeout = setTimeout(() => {
  //         userLogout();
  //       }, msUntilLogout);

  //       return () => {
  //         clearTimeout(warningTimeout);
  //         clearTimeout(logoutTimeout);
  //       };
  //     } else {
  //       // Token has 1 minute or less left — show alert immediately
  //       showLogoutAlertt("Your session will expire in 1 minute. Please save your work.");

  //       const logoutTimeout = setTimeout(() => {
  //         userLogout();
  //       }, timeLeft * 1000);

  //       return () => clearTimeout(logoutTimeout);
  //     }
  //   } catch (err) {
  //     console.error("Error decoding token", err);
  //   }
  // }, [token]);

  useEffect(() => {
    if (!token) return;
  
    try {
      const { exp } = jwtDecode<any>(token); // expiry time in seconds
      const currentTime = Date.now() / 1000; // current time in seconds
      const timeLeft = exp - currentTime; // seconds remaining
  
      if (timeLeft <= 0) {
        userLogout();
        return;
      }
  
      let warningTimeout: ReturnType<typeof setTimeout>;
      let stayLoginTimeout: ReturnType<typeof setTimeout>;
      let logoutTimeout: ReturnType<typeof setTimeout>;
  
      const warningThreshold = 5 * 60; // 5 minutes in seconds
  
      if (timeLeft > warningThreshold) {
        const msUntilWarning = (timeLeft - warningThreshold) * 1000;
        const msUntilLogout = timeLeft * 1000;
  
        warningTimeout = setTimeout(() => {
          showLogoutAlertt("Your session will expire in 5 minutes. Please save your work.");
  
          stayLoginTimeout = setTimeout(() => {
            onStayLoggedIn();
          }, 15000); // trigger stay login after 15 seconds
        }, msUntilWarning);
  
        logoutTimeout = setTimeout(() => {
          userLogout();
        }, msUntilLogout);
      } else {
        // Token has <= 5 minutes left — show warning immediately
        showLogoutAlertt("Your session will expire in 5 minutes. Please save your work.");
  
        
        stayLoginTimeout = setTimeout(() => {
          onStayLoggedIn();
        }, 15000);
  
        logoutTimeout = setTimeout(() => {
          userLogout();
        }, timeLeft * 1000);
      }
  
      return () => {
        clearTimeout(warningTimeout);
        clearTimeout(stayLoginTimeout);
        clearTimeout(logoutTimeout);
      };
    } catch (err) {
      // Silently fail if token decoding fails
      console.error("Token decoding failed:", err);
    }
  }, [token]);
  
  
  


  // Automatically handle auto-logout and dialog closing
  useEffect(() => {
    if (!isOpen) return;
    autoLogoutTimerRef.current = setTimeout(() => {
      // console.log("User did not respond in time. Logging out.");
      userLogout();
    }, 20 * 1000);

    const autoCloseTimer = setTimeout(() => {
      if (isOpen) {
        // console.log("User did not respond to the alert. Closing dialog.");
        onClose();
      }
    }, 20 * 1000);

    return () => {
      if (autoLogoutTimerRef.current) {
        clearTimeout(autoLogoutTimerRef.current);
        autoLogoutTimerRef.current = null;
      }
      if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
      }
    };
  }, [isOpen]);

  useEffect(() => {
    const handleUserActivity = () => resetTimer();

    if (
      username !== undefined &&
      (userData?.status !== "inactive" || userData?.role === "admin")
    ) {
      window.addEventListener("mousemove", handleUserActivity);
      window.addEventListener("keypress", handleUserActivity);
    }

    return () => {
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keypress", handleUserActivity);
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
    };
  }, [username, userData]);



  return (
    <Container maxWidth='100%' bg='#fff' boxShadow='md' p={2}>
      <Flex flexWrap='wrap' alignItems='center'>
        <Box alignItems='center'
          display={'flex'}
          justifyContent={'space-between'}
          alignContent={'center'}

          width={[
            '30%', // 0-30em
            '20%', // 30em-48em
            '15%', // 48em-62em
            '15%', // 62em+
          ]} pl={5}>
          <Link to='/'><Image src={logo} alt="brand" /></Link>

        </Box>
        {username !== undefined && userData.status !== 'inactive' || userData.role === 'admin' ?

          <Show breakpoint='(max-width: 767px)'>
            <Box
              width={[
                '70%', // 0-30em
                '80%', // 30em-48em
                '15%', // 48em-62emg
                '15%', // 62em+
              ]}>
              <Flex direction='row' justifyContent='right'>
                <Box pt={5} pr={5} textAlign='center'>
                  <Text fontSize={14} lineHeight={0} pt={5}>Welcome</Text>
                  <Text fontSize={14} lineHeight={0} as='b'>{username}</Text>
                </Box>
                <Box pt={4} pr={5} textAlign='left'>
                  <Avatar name='Dan Abrahmov' w={[70]} h={[70]} src={userIcon} />
                  <Menu closeOnSelect={false}>
                    <MenuButton
                      as={Button}
                      rightIcon={<ChevronDownIcon color={"#000"} />}
                      size='md'
                      w={"25px"}
                      height='48px'
                      mt={"12px"}
                      bg="#fff"
                      _hover={{ bg: '#fff' }}
                      _focus={{ bg: '#fff' }}
                      _active={{ bg: '#fff' }}

                    >
                    </MenuButton>
                    <MenuList mt={"25px"}>
                      <MenuItem _hover={{ bg: '#fff' }} onClick={userLogout}>Logout</MenuItem>
                    </MenuList>
                  </Menu>
                </Box>
              </Flex>
            </Box>
          </Show> : null}
        <Box
          width={[
            '100%', // 0-30emhh
            '100%', // 30em-48em
            '70%', // 48em-62em
            '55%', // 62em+
          ]} justifyContent='center' alignItems='center'>

          <Show breakpoint='(min-width: 1024px)'>
            <Stack direction='row' spacing={4} alignItems='center' height={20} fontSize={16}>
              {
                (role === 'user' && role !== undefined || role === 'admin') &&

                <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}><Link to='/'>Home</Link></Button>

              }

              {
                (role === 'user' && role !== undefined || role === 'admin') &&

                <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}><Link to='/About'>About</Link></Button>

              }


              {role === 'user' && role !== undefined ?
  <Button
    variant='link'
    pl={5}
    pr={5}
    pt={2}
    pb={2}
    color='#000'
    _hover={{ bg: '#7FBD2C' }}
  >
    <Link to={vehicleType === "Bus" ? "/BusHomologation" : "/Dashboard"}>
      Homologation
    </Link>
  </Button>
  : ""
}
              {role === 'user' && role !== undefined ? <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}><Link to='/WMI'>WMI</Link></Button> :
                ""
              }
              {role === 'admin' && role !== undefined ? <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}><Link to='/SearchUserOrHomologation'>Dashboard</Link></Button> : ""}
              {role !== undefined ?
                <>
                  {/* <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}>WMI</Button> */}
                  <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}>Udyam reg</Button>
                  <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}>Inbox</Button>
                </>
                : ""}
            </Stack>
          </Show>
          <Show breakpoint='(max-width: 1023px)'>
            <Box width='100%' overflow='scroll'>
              <Stack direction='row' width='800px' spacing={4} alignItems='center' height={20} pt={4} fontSize={16}>
                <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}><Link to='/'>Home</Link></Button>
                <Link to={vehicleType === "Bus" ? "/BusHomologation" : "/Dashboard"}>
  HomoLogation
</Link>
                {role === 'user' && role !== undefined ? <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}><Link to='/WMI'>WMI</Link></Button> :
                  ""}
                {role === 'admin' && role !== undefined ? <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}><Link to='/SearchUserOrHomologation'>Dashboard</Link></Button>
                  : ""}
                {role !== undefined ?
                  <>
                    {/* <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}>WMI</Button> */}
                    <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}>Udyam reg</Button>
                    <Button variant='link' pl={5} pr={5} pt={2} pb={2} color='#000' _hover={{ bg: '#7FBD2C' }}>Inbox</Button>
                  </>
                  : ""}
              </Stack>
            </Box>

          </Show>


        </Box>

        <Spacer />
        {username !== undefined && userData.status !== 'inactive' || userData.role === 'admin' ?
          <Show breakpoint='(min-width: 768px)'>
            <Box
              width={[
                '100%', // 0-30em
                '100%', // 30em-48em
                '15%', // 48em-62emg
                '25%', // 62em+
              ]}>
              <Flex direction='row' justifyContent='right'>
                <Box pt={5} pr={5} textAlign='left'>
                  <Text fontSize={14} lineHeight={0} pt={5}>Welcome</Text>
                  <Text fontSize={14} lineHeight={'36px'} as='b'>{username}</Text>
                </Box>
                <Box pt={4} pr={5} textAlign='left'>
                  <Avatar name='Dan Abrahmov' w={[18, 24, 70]} h={[18, 24, 70]} src={userIcon} />
                  <Menu>
                    <MenuButton
                      as={Button}
                      rightIcon={<ChevronDownIcon color={"#000"} />}
                      size='md'
                      w={"auto"}
                      height='auto'
                      mt={"12px"}
                      bg="#fff"
                      _hover={{ bg: '#fff' }}
                      _focus={{ bg: '#fff' }}
                      _active={{ bg: '#fff' }}
                    >
                    </MenuButton>
                    <MenuList>
                      <MenuItem _hover={{ bg: '#fff' }} onClick={userLogout} textAlign={'center'}>Logout</MenuItem>
                    </MenuList>
                  </Menu>
                </Box>
              </Flex>
            </Box>
          </Show>
          : null}
      </Flex>
      {isOpen && username !== undefined && (userData.status !== 'inactive' || userData.role === 'admin') && (
        <AlertDialog isOpen={isOpen} onClose={onClose} leastDestructiveRef={cancelRef}>
          <AlertDialogOverlay>
            <AlertDialogContent>
              {/* <AlertDialogBody>Your session is about to log out. Do you want to stay logged in?</AlertDialogBody> */}
              <AlertDialogBody>
                {logoutReason === "Your session will expire in 5 minutes. Please save your work."
                  ? logoutReason
                  : "Your session is about to log out. Do you want to stay logged in?"
                }
              </AlertDialogBody>
              {/* {logoutReason !== "Your session will expire in 5 minutes. Please save your work." && ( */}
         
              <AlertDialogFooter>
                <Stack direction="row" spacing={4} justify="center" w="100%">
                  <Button
                    height="35px"
                    w="48%"
                    border="1px solid #7FBF28"
                    variant="solid"
                    type="button"
                    onClick={onLogout}

                  >
                    Log Out
                  </Button>
                  <Button
                    height="35px"
                    bg="#7FBF28"
                    w="48%"
                    color="#fff"
                    _hover={{ bg: "#7FBF28" }}
                    _focus={{ bg: "#7FBF28" }}
                    variant="solid"
                    type="button"
                    onClick={onStayLoggedIn}
                  >
                    Stay Logged In
                  </Button>
                </Stack>
              </AlertDialogFooter>
                {/* )} */}
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>

      )}


    </Container>
  )
}
export default Header;
