import { useState, useEffect, useCallback } from "react";
import { Card, Form, Button, Table, Modal, Alert, Badge } from "react-bootstrap";

// Import game data
import { game1Words } from "../Data/Game1Data";
import { game3Words } from "../Data/Game3Data";
import { game6Questions } from "../Data/Game6Data";
import { game10Words } from "../Data/Game10Data";

const GameMaterialEditor = ({ gameData }) => {
  const [materials, setMaterials] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  const loadGameData = useCallback(() => {
    let data = [];

    switch (gameData.id) {
      case 1:
        data = [...game1Words];
        break;
      case 3:
        data = [...game3Words];
        break;
      case 6:
        data = [...game6Questions];
        break;
      case 10:
        data = [...game10Words];
        break;
      // Add more cases for other games as needed
      default:
        data = [];
    }

    setMaterials(data);
  }, [gameData.id]);

  // Load initial data based on game
  useEffect(() => {
    loadGameData();
  }, [gameData.id, loadGameData]);

  const getFieldsForGame = () => {
    switch (gameData.id) {
      case 1:
        return [
          { key: "word", label: "Λέξη", type: "text", required: true },
          { key: "stem", label: "Ρίζα", type: "text", required: true },
          { key: "suffix", label: "Κατάληξη", type: "text", required: true },
          { key: "isExample", label: "Παράδειγμα", type: "checkbox" },
        ];
      case 3:
        return [
          { key: "word", label: "Λέξη", type: "text", required: true },
          { key: "root", label: "Ρίζα", type: "text", required: true },
          { key: "suffix", label: "Κατάληξη", type: "text", required: true },
        ];
      case 6:
        return [
          { key: "stem", label: "Ρίζα", type: "text", required: true },
          {
            key: "correctPrefix",
            label: "Σωστό Πρόθεμα",
            type: "text",
            required: true,
          },
          { key: "word", label: "Πλήρης Λέξη", type: "text", required: true },
          {
            key: "options",
            label: "Επιλογές (διαχωρισμένες με κόμμα)",
            type: "text",
            required: true,
          },
          { key: "audio", label: "Αρχείο Ήχου", type: "file" },
          { key: "isExample", label: "Παράδειγμα", type: "checkbox" },
        ];
      case 10:
        return [
          { key: "word", label: "Λέξη", type: "text", required: true },
          { key: "prefix", label: "Πρόθεμα", type: "text", required: true },
          { key: "stem", label: "Ρίζα", type: "text", required: true },
          { key: "suffix", label: "Κατάληξη", type: "text", required: true },
          { key: "isExample", label: "Παράδειγμα", type: "checkbox" },
        ];
      default:
        return [];
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({});
    setShowModal(true);
  };

  const handleEdit = (item, index) => {
    setEditingItem(index);
    setFormData({ ...item });
    setShowModal(true);
  };

  const handleDelete = (index) => {
    if (window.confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το στοιχείο;")) {
      const newMaterials = materials.filter((_, i) => i !== index);
      setMaterials(newMaterials);
    }
  };

  const handleInputChange = (key, value) => {
    if (key === "options" && typeof value === "string") {
      // Convert comma-separated string to array
      setFormData((prev) => ({
        ...prev,
        [key]: value.split(",").map((s) => s.trim()),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleSave = () => {
    const fields = getFieldsForGame();
    const requiredFields = fields.filter((f) => f.required);

    // Validate required fields
    for (const field of requiredFields) {
      if (!formData[field.key] || formData[field.key] === "") {
        alert(`Το πεδίο "${field.label}" είναι υποχρεωτικό.`);
        return;
      }
    }

    const newMaterials = [...materials];
    if (editingItem !== null) {
      newMaterials[editingItem] = { ...formData };
    } else {
      newMaterials.push({ ...formData });
    }

    setMaterials(newMaterials);
    setShowModal(false);
    setFormData({});
    setEditingItem(null);
  };

  const renderTableHeaders = () => {
    const fields = getFieldsForGame();
    return (
      <>
        {fields
          .filter((f) => f.type !== "file")
          .map((field) => (
            <th key={field.key}>{field.label}</th>
          ))}
        <th>Ενέργειες</th>
      </>
    );
  };

  const renderTableRow = (item, index) => {
    const fields = getFieldsForGame();
    return (
      <tr key={index}>
        {fields
          .filter((f) => f.type !== "file")
          .map((field) => (
            <td key={field.key}>
              {field.type === "checkbox" ? (
                item[field.key] ? (
                  <Badge bg="success">Ναι</Badge>
                ) : (
                  <Badge bg="secondary">Όχι</Badge>
                )
              ) : Array.isArray(item[field.key]) ? (
                item[field.key].join(", ")
              ) : (
                item[field.key] || "-"
              )}
            </td>
          ))}
        <td>
          <Button variant="outline-primary" size="sm" onClick={() => handleEdit(item, index)} className="me-2">
            Επεξεργασία
          </Button>
          <Button variant="outline-danger" size="sm" onClick={() => handleDelete(index)}>
            Διαγραφή
          </Button>
        </td>
      </tr>
    );
  };

  const renderFormField = (field) => {
    switch (field.type) {
      case "checkbox":
        return (
          <Form.Check
            type="checkbox"
            label={field.label}
            checked={formData[field.key] || false}
            onChange={(e) => handleInputChange(field.key, e.target.checked)}
          />
        );
      case "file":
        return (
          <div>
            <Form.Label>{field.label}</Form.Label>
            <Form.Control type="file" accept="audio/*" onChange={(e) => handleInputChange(field.key, e.target.files[0])} />
            {gameData.hasAudio && <Form.Text className="text-muted">Επιτρεπόμενοι τύποι: MP3, WAV, OGG</Form.Text>}
          </div>
        );
      case "text":
      default:
        return (
          <div>
            <Form.Label>
              {field.label} {field.required && <span className="text-danger">*</span>}
            </Form.Label>
            <Form.Control
              type="text"
              value={field.key === "options" && Array.isArray(formData[field.key]) ? formData[field.key].join(", ") : formData[field.key] || ""}
              onChange={(e) => handleInputChange(field.key, e.target.value)}
              required={field.required}
              placeholder={field.key === "options" ? "π.χ. επι, κατα, παρα" : `Εισάγετε ${field.label.toLowerCase()}`}
            />
          </div>
        );
    }
  };

  const fields = getFieldsForGame();

  return (
    <div className="mt-4">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            Υλικό για: {gameData.name}
            {gameData.hasAudio && (
              <Badge bg="info" className="ms-2">
                Με Ήχο
              </Badge>
            )}
          </h5>
          <Button variant="success" onClick={handleAdd}>
            <i className="fas fa-plus"></i> Προσθήκη Νέου
          </Button>
        </Card.Header>
        <Card.Body>
          {materials.length === 0 ? (
            <Alert variant="info">Δεν υπάρχει υλικό για αυτό το παιχνίδι. Κάντε κλικ στο "Προσθήκη Νέου" για να αρχίσετε.</Alert>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                  <tr>{renderTableHeaders()}</tr>
                </thead>
                <tbody>{materials.map((item, index) => renderTableRow(item, index))}</tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Edit/Add Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingItem !== null ? "Επεξεργασία Στοιχείου" : "Προσθήκη Νέου Στοιχείου"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {fields.map((field) => (
              <Form.Group className="mb-3" key={field.key}>
                {renderFormField(field)}
              </Form.Group>
            ))}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Ακύρωση
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Αποθήκευση
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default GameMaterialEditor;
