import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";

export interface ConfirmQuitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConfirmQuitModal({ isOpen, onClose }: ConfirmQuitModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Confirm Quit</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          Are you sure you want to go back? Your current progress into this batch will not be saved.
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Link to="/">
            <Button colorScheme="red" mr={3}>
              Close
            </Button>
          </Link>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
