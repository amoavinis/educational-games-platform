import React, { useState, useEffect } from "react";
import { Container, Form, Row, Col } from "react-bootstrap";
import { getSchools } from "../services/schools";

const Home = () => {
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const role = localStorage.getItem("role");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role === "1" && schools.length === 0) {
      // Only load schools for admins
      const loadSchools = async () => {
        try {
          setLoading(true);
          const schoolsData = await getSchools();
          setSchools(schoolsData);
          setSelectedSchool(localStorage.getItem("school"));
          setLoading(false);
        } catch (err) {
          console.error("Failed to load schools", err);
        }
      };
      loadSchools();
    }
  }, [role, schools]);

  const handleSchoolChange = (e) => {
    const schoolId = e.target.value;
    setSelectedSchool(schoolId);
    localStorage.setItem("school", schoolId);
  };

  return (
    <Container>
      <h1>Welcome to the Educational Platform</h1>

      {localStorage.getItem("role") === "1" && (
        <Form.Group className="mb-3">
          <Row>
            <Col md={2}>
              <Form.Label className="d-flex flex-row align-items-center h-100 m-0">
                Select School
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

      {/* Rest of your home page content */}
    </Container>
  );
};

export default Home;
