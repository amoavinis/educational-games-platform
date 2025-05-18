import React, { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";

const availableClasses = [
  "Science 202",
  "Math 101",
  "History 303",
  "Geography 101",
];

const StudentEditor = ({ show, student, onSave, onCancel, loading }) => {
  const [formData, setFormData] = useState({ name: "", class: "" });

  useEffect(() => {
    if (student) {
      setFormData({ name: student.name, class: student.class });
    } else {
      setFormData({ name: "", class: availableClasses[1] || "" }); // Default to first non-"All" class
    }
  }, [student]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(student ? { ...student, ...formData } : formData);
  };

  return (
    <Modal show={show} onHide={onCancel}>
      <Modal.Header closeButton>
        <Modal.Title>
          {student ? "Edit Student" : "Add New Student"}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Class</Form.Label>
            <Form.Control
              as="select"
              name="class"
              value={formData.class}
              onChange={handleChange}
              required
            >
              {availableClasses
                .filter((cls) => cls !== "All")
                .map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
            </Form.Control>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default StudentEditor;
