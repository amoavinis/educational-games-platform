import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Alert,
} from "react-bootstrap";
import { getUserRoleFromClaims } from "../../services/firebase";
import GameMaterialEditor from "./GameMaterialEditor";

// Games list with their data structures
const games = [
  { id: 1, name: "Υπογράμμιση Λέξεων", hasAudio: false, dataType: "words" },
  { id: 2, name: "Παιχνίδι Ρίζας και Κατάληξης", hasAudio: false, dataType: "words" },
  { id: 3, name: "Άσκηση Ελληνικής Ανάγνωσης", hasAudio: true, dataType: "words" },
  { id: 4, name: "Παιχνίδι Κατάληξης Λέξεων", hasAudio: false, dataType: "words" },
  { id: 5, name: "Παιχνίδι Διαχωρισμού Λέξεων", hasAudio: false, dataType: "words" },
  { id: 6, name: "Παιχνίδι Ταιριάσματος Προθημάτων", hasAudio: true, dataType: "questions" },
  { id: 7, name: "Παιχνίδι Ελληνικών Προθημάτων", hasAudio: false, dataType: "words" },
  { id: 8, name: "Παιχνίδι Ελληνικής Μορφολογίας", hasAudio: false, dataType: "words" },
  { id: 9, name: "Παιχνίδι Υπογράμμισης Προθημάτων-Καταλήξεων", hasAudio: false, dataType: "words" },
  { id: 10, name: "Παιχνίδι Ανάγνωσης Συλλαβών", hasAudio: true, dataType: "words" },
  { id: 11, name: "Παιχνίδι Ελληνικών Κλιτικών Καταλήξεων", hasAudio: false, dataType: "words" },
  { id: 12, name: "Παιχνίδι Ελληνικών Ρηματικών Καταλήξεων", hasAudio: false, dataType: "words" },
  { id: 13, name: "Παιχνίδι Ελληνικού Σχηματισμού Λέξεων", hasAudio: false, dataType: "words" },
  { id: 14, name: "Παιχνίδι Ελληνικών Επιθετικών Καταλήξεων", hasAudio: false, dataType: "words" },
  { id: 15, name: "Παιχνίδι Ελληνικών Καταλήξεων Marquee", hasAudio: false, dataType: "words" },
];

const MaterialManagement = () => {
  const [userRole, setUserRole] = useState(null);
  const [selectedGame, setSelectedGame] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeData = async () => {
      try {
        let role = await getUserRoleFromClaims();
        if (!role) {
          role = parseInt(localStorage.getItem("role"));
        }
        setUserRole(role);
      } catch (error) {
        console.error("Error getting user role:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const handleGameChange = (e) => {
    setSelectedGame(e.target.value);
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div>Φόρτωση...</div>
      </Container>
    );
  }

  if (userRole !== 1) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          Δεν έχετε δικαίωμα πρόσβασης σε αυτή τη σελίδα.
        </Alert>
      </Container>
    );
  }

  const selectedGameData = games.find(g => g.id === parseInt(selectedGame));

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h3>Επεξεργασία Υλικού Παιχνιδιών</h3>
            </Card.Header>
            <Card.Body>
              <Form>
                <Row className="mb-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Επιλέξτε Παιχνίδι</Form.Label>
                      <Form.Select
                        value={selectedGame}
                        onChange={handleGameChange}
                      >
                        <option value="">Επιλέξτε παιχνίδι</option>
                        {games.map((game) => (
                          <option key={game.id} value={game.id}>
                            {game.id} - {game.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </Form>

              {selectedGameData && (
                <GameMaterialEditor gameData={selectedGameData} />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MaterialManagement;