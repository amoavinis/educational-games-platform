import React, { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { getClasses } from "../../services/classes";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const StudentEditor = ({ show, student, onSave, onCancel, loading }) => {
  const [formData, setFormData] = useState({ 
    name: "", 
    classId: "", 
    gender: "", 
    dateOfBirth: "", 
    diagnosis: false 
  });
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const loadClasses = async () => {
      const data = await getClasses();
      setClasses([{ id: null, name: "Επιλογή τάξης" }, ...data]);
    };

    loadClasses();
  }, []);

  useEffect(() => {
    if (student) {
      setFormData({ 
        name: student.name, 
        classId: student.classId, 
        className: student.className,
        gender: student.gender || "",
        dateOfBirth: student.dateOfBirth || "",
        diagnosis: student.diagnosis || false
      });
    } else {
      setFormData({ 
        name: "", 
        classId: "", 
        className: "",
        gender: "",
        dateOfBirth: "",
        diagnosis: false
      });
    }
  }, [student, show]);

  const handleChangeName = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, name: value });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "classId") {
      let className = classes.find((cls) => cls.id === value).name;
      setFormData({ ...formData, classId: value, className: className });
    } else if (type === "radio" && name === "diagnosis") {
      setFormData({ ...formData, diagnosis: value === "true" });
    } else {
      setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    }
  };

  const handleDateChange = (date) => {
    if (date) {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;
      setFormData({ ...formData, dateOfBirth: formattedDate });
    } else {
      setFormData({ ...formData, dateOfBirth: "" });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(student ? { ...student, ...formData } : formData);
  };

  const isFormValid = () => {
    return (
      formData.name.trim() !== "" &&
      formData.classId !== "" &&
      formData.gender !== "" &&
      formData.dateOfBirth !== "" &&
      (formData.diagnosis === true || formData.diagnosis === false)
    );
  };

  return (
    <Modal show={show} onHide={onCancel}>
      <Modal.Header closeButton>
        <Modal.Title>
          {student ? "Επεξεργασία Μαθητή" : "Προσθήκη Νέου Μαθητή"}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {student && (
            <Form.Group className="mb-3">
              <Form.Label>Κωδικός χρήστη</Form.Label>
              <Form.Control
                type="text"
                value={student.id ? student.id.substring(0, 6) : ""}
                readOnly
                disabled
              />
            </Form.Group>
          )}
          <Form.Group className="mb-3">
            <Form.Label>Όνομα</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChangeName}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Τάξη</Form.Label>
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
          <Form.Group className="mb-3">
            <Form.Label>Φύλο</Form.Label>
            <Form.Control
              as="select"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Επιλογή φύλου</option>
              <option value="Αγόρι">Αγόρι</option>
              <option value="Κορίτσι">Κορίτσι</option>
            </Form.Control>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Ημερομηνία γέννησης (DD/MM/YYYY)</Form.Label>
            <DatePicker
              selected={formData.dateOfBirth ? (() => {
                // Convert DD/MM/YYYY to Date object
                const parts = formData.dateOfBirth.split('/');
                if (parts.length === 3) {
                  return new Date(parts[2], parts[1] - 1, parts[0]);
                }
                return null;
              })() : null}
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy"
              placeholderText="DD/MM/YYYY"
              className="form-control"
              showYearDropdown
              showMonthDropdown
              dropdownMode="select"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Διάγνωση</Form.Label>
            <div>
              <Form.Check
                type="radio"
                name="diagnosis"
                id="diagnosis-yes"
                label="Ναι"
                value="true"
                checked={formData.diagnosis === true}
                onChange={handleChange}
              />
              <Form.Check
                type="radio"
                name="diagnosis"
                id="diagnosis-no"
                label="Όχι"
                value="false"
                checked={formData.diagnosis === false}
                onChange={handleChange}
              />
            </div>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Ακύρωση
          </Button>
          <Button variant="primary" type="submit" disabled={loading || !isFormValid()}>
            {loading ? "Αποθήκευση..." : "Αποθήκευση"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default StudentEditor;
