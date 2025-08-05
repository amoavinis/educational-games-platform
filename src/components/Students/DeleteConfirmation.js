import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const DeleteConfirmation = ({ show, student, onConfirm, onCancel }) => {
  return (
    <Modal show={show} onHide={onCancel}>
      <Modal.Header closeButton>
        <Modal.Title>Επιβεβαίωση Διαγραφής</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Είστε σίγουροι ότι θέλετε να διαγράψετε τον/την {student?.name} από την τάξη {student?.className};
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          Ακύρωση
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Διαγραφή
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteConfirmation;