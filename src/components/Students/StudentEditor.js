import React, { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { getClasses } from "../../services/classes";

const StudentEditor = ({ show, student, onSave, onCancel, loading }) => {
  const [formData, setFormData] = useState({ name: "", classId: "" });
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const loadClasses = async () => {
      const data = await getClasses();
      setClasses([{ id: null, name: "Select class" }, ...data]);
    };

    loadClasses();
  }, []);

  useEffect(() => {
    if (student) {
      setFormData({ name: student.name, classId: student.classId, className: student.className });
    } else {
      setFormData({ name: "", classId: "", className: "" });
    }
  }, [student, show]);

  const handleChangeName = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, name: value });
  };

  const handleChange = (e) => {
    const value = e.target.value;
    let className = classes.find((cls) => cls.id === value).name;
    setFormData({ ...formData, classId: value, className:  className});
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
              onChange={handleChangeName}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Class</Form.Label>
            <Form.Control
              as="select"
              name="classId"
              value={formData.classId}
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
