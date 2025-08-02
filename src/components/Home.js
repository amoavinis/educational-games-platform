import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Form,
  Row,
  Col,
  Card,
  Modal,
  Button,
} from "react-bootstrap";
import { getUsers } from "../services/users";
import { getStudents } from "../services/students";
import "../styles/Home.css";
import { games as allGames } from "./games";

const Home = () => {
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const role = parseInt(localStorage.getItem("role"));
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const games = allGames;

  useEffect(() => {
    if (role === 1 && schools.length === 0) {
      // Only load schools for admins
      const loadSchools = async () => {
        try {
          setLoading(true);
          let schoolsData = await getUsers();
          schoolsData = schoolsData.map((s) => ({ id: s.uid, name: s.name }));
          setSchools(schoolsData);
          setSelectedSchool(localStorage.getItem("school"));
          setLoading(false);
        } catch (err) {
          console.error("Failed to load schools:", err);
        }
      };
      loadSchools();
    }

    if ((schools.length > 0 || role === 2) && students.length === 0) {
      const loadStudents = async () => {
        try {
          let studentsData = await getStudents();
          setStudents(studentsData);
        } catch (error) {
          console.error("Failed to load students:", error);
        }
      };
      loadStudents();
    }
  }, [role, schools, students]);

  const handleSchoolChange = (e) => {
    const schoolId = e.target.value;
    setSelectedSchool(schoolId);
    localStorage.setItem("school", schoolId);
  };

  const handleCardClick = (game) => {
    setSelectedGame(game);
    setShowModal(true);
  };

  const handlePlay = () => {
    let name = students.find((s) => s.id === selectedStudentId)?.name || "";
    navigate(
      `/games/game${selectedGame.id}?studentId=${selectedStudentId}&studentName=${name}`
    );
  };

  return (
    <Container>
      <h1>Παιχνίδια</h1>

      {role === 1 && (
        <Form.Group className="mb-3">
          <Row>
            <Col md={2}>
              <Form.Label className="d-flex flex-row align-items-center h-100 m-0">
                Επιλογή σχολείου
              </Form.Label>
            </Col>
            <Col md={4}>
              <Form.Select
                value={selectedSchool}
                onChange={handleSchoolChange}
                disabled={schools.length === 0}
              >
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
                {schools.length === 0 && !loading && (
                  <option value="">No schools available</option>
                )}
                {schools.length === 0 && loading && (
                  <option value="">Loading schools...</option>
                )}
              </Form.Select>
            </Col>
          </Row>
        </Form.Group>
      )}

      <Row xs={5} sm={5} md={5} lg={5} xl={5} className="g-4">
        {games.map((game) => (
          <Col key={game.id}>
            <Card
              onClick={() => handleCardClick(game)}
              className="game-card h-100"
              style={{ backgroundColor: game.color }}
            >
              <Card.Body className="d-flex align-items-center justify-content-center">
                <Card.Title className="text-center">{game.name}</Card.Title>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Game Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedGame?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="lead">{selectedGame?.description}</p>

          <Form.Group className="mb-3">
            <Form.Label>Επιλογή μαθητή</Form.Label>
            <Form.Select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              <option value="">Επιλογή μαθητή</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Κλείσιμο
          </Button>
          <Button
            variant="primary"
            onClick={handlePlay}
            disabled={!selectedStudentId}
          >
            Παίξε
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Home;
