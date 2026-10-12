import * as React from "react"
import {FC} from 'react';
import { 
    Modal,
    useDisclosure,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Box,
    Button,
    Text
 } from "@chakra-ui/react";

 const Prompt :  FC = () =>{
    const { isOpen, onOpen, onClose } = useDisclosure()
    return (
       <>
        <Button onClick={onOpen}>Open Modal</Button>
            <Modal isOpen={isOpen} onClose={onClose} size='3xl' isCentered>
                <ModalOverlay />
                <ModalContent>
            
                    <ModalCloseButton />
                    <ModalBody>
                        <Box textAlign="center">
                            <Text p={['10px', '50px 100px 10px']} fontWeight="700"fontSize="18px">
                            You do not have any Homologation request 
                            <br/>
                            Click below to create one.
                            </Text>
                            <Button 
                             size='md'
                             height='48px'
                             m={["0px", "35px" ]}
                             bg="#7FBF28"
                             color='#fff'
                             _hover={{ bg: '#7FBF28' }}
                             _focus={{ bg: '#7FBF28' }}
                             maxWidth='100%'>Homologation Request</Button>
                        </Box>
                    </ModalBody>

                    
                </ModalContent>
            </Modal>
       </>
    )
 }

 export default Prompt;