import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";

const UserEditor = ({ show, user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        name: user.name,
        password: "",
      });
    } else {
      setFormData({
        email: "",
        name: "",
        password: "",
      });
    }
  }, [user, show]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate password for new users
    if (!user && !formData.password) {
      setError("Password is required for new users");
      setLoading(false);
      return;
    }

    onSave({
      email: formData.email,
      name: formData.name,
      password: formData.password,
    }).then(() => setLoading(false));
  };

  return (
    <Modal show={show} onHide={onCancel}>
      <Modal.Header closeButton>
        <Modal.Title>
          {user ? "Επεξεργααία χρήστη" : "Δημιουργία χρήστη"}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              readOnly={user}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Όνομα</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              Κωδικός πρόσβασης (Αφήστε το κενό για να παραμείνει ο υπάρχων
              κωδικός)
            </Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={!user}
              placeholder={
                user ? "Αφήστε το κενό για να παραμείνει ο υπάρχων κωδικός" : ""
              }
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Ακύρωση
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Αποθηκεύεται..." : "Αποθήκευση"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UserEditor;
