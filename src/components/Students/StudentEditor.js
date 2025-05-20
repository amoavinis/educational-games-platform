import React, { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { getClasses } from "../../services/classes";

const StudentEditor = ({ show, student, onSave, onCancel, loading }) => {
  const [formData, setFormData] = useState({ name: "", class: "" });
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const loadClasses = async () => {
      const data = await getClasses();
      setClasses([{ id: null, class: "Select class" }, ...data]);
    };

    loadClasses();
  }, []);

  useEffect(() => {
    if (student) {
      setFormData({ name: student.name, classId: student.classId });
    } else {
      setFormData({ name: "", class: classes[0].class });
    }
  }, [student, show, classes]);

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
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
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
