import { FC } from "react";
import {
  Box,
  HStack,
  ModalBody,
  ModalCloseButton,
  Image,
  ModalContent,
  Text,
  Button,
  ModalFooter,
  Modal,
  ModalOverlay,
} from "@chakra-ui/react";

import success from "../../assets/images/success.png";

interface Props {
  successMsg: string;
  approved: boolean;
  onClose: () => void;
}

const ApproveSuccess: FC<Props> = ({
  successMsg,
  approved,
  onClose,
}) => {
  return (
    <Modal isOpen={approved} onClose={onClose} isCentered>
      <ModalOverlay />

      <ModalContent
  maxW="400px"
  transform="translateY(-60px)"
>
       <ModalCloseButton
  color="#000"
  top="10px"
  right="10px"
  zIndex={10}
/>

        <ModalBody bg="#fff" pt="45px" pr="50px">
          <HStack>
            <Box
              p={["15px", "20px"]}
              justifyContent="center"
              alignItems="center"
              display="flex"
            >
              <Image src={success} alt="" title="" w="30px" />
            </Box>

            <Box>
              <Text
                fontSize="18px"
                fontFamily="Open Sans"
              >
                {successMsg}
              </Text>
            </Box>
          </HStack>
        </ModalBody>

        <ModalFooter position="relative" h="80px">
          <Button
            position="absolute"
            top="20px"
            left="27%"
            color="#fff"
            w="185px"
            bg="#7FBD2C"
            fontSize="16px"
            onClick={onClose}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ApproveSuccess;