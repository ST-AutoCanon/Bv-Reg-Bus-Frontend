import { FC } from 'react';
import { 
    Container,
    HStack,
    Button,
    Text,
    Flex,
    Box,
    Link
  } from '@chakra-ui/react';
  import Facebook from '../../assets/images/facebook.svg';
  import Twitter from '../../assets/images/twitternew.svg';
  import Linkedin from '../../assets/images/LinkedIn.svg';

const Footer : FC = () =>{
 return(
   <Container maxWidth='100%'  bg='#05637D' p={'20px'}>
    <Flex 
    justifyContent="center"
    flexWrap={['nowrap', 'nowrap', 'wrap', 'wrap']}
    flexDirection={['column', 'column', 'row', 'row']}
    alignItems='center'
    >
       <Box w={['100%','100%','50%','50%']} pl={'10px'}>
         <HStack>
           <Button
             h='48px'
             w='48px'
             bg='#05637D'
             border='1px'
             px='8px'
             borderRadius='25px'
             _hover={{ bg: '#05637D' }}
             borderColor='#fff'><img src={Facebook} alt="" />
             </Button>
           <Button
             h='48px'
             w='48px'
             bg='#05637D'
             border='1px'
             px='8px'
             borderRadius='25px'
             _hover={{ bg: '#05637D' }}
             borderColor='#fff'><img src={Twitter} alt="" /></Button>
           <Button
             h='48px'
             w='48px'
             bg='#05637D'
             border='1px'
             px='8px'
             borderRadius='25px'
             _hover={{ bg: '#05637D' }}
             borderColor='#fff'>
              <Link href='https://www.linkedin.com/company/sukalpa-tech/' isExternal>
                <img src={Linkedin} alt="" />
              </Link>
              </Button>
         </HStack>
       </Box>
       <Box textAlign='right' w={['100%','100%','50%','50%']}>
         <Text fontSize='13px' color='#fff' fontWeight='700' pr={'20px'}>
           Copyright © 2023 Sukalpatech. All Rights Reserved.
         </Text>
       </Box>
   
     </Flex>
   </Container>
 )
}
export default Footer;