import React, { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";

const ClassEditor = ({ show, classData, onSave, onCancel }) => {
  const [name, setName] = useState("");

  useEffect(() => {
    if (classData) {
      setName(classData.name);
    } else {
      setName("");
    }
  }, [classData, show]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name });
  };

  return (
    <Modal show={show} onHide={onCancel}>
      <Modal.Header closeButton>
        <Modal.Title>{classData ? "Edit Class" : "Add New Class"}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Class Name</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter class name"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ClassEditor;
