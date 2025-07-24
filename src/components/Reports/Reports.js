import React, { useState, useEffect } from "react";
import { Container, Form, Button, Row, Col, Card } from "react-bootstrap";
import { getSchools } from "../../services/schools";
import { getClasses } from "../../services/classes";
import { getUserRoleFromClaims } from "../../services/firebase";

const Reports = () => {
  const [schools, setSchools] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeData = async () => {
      try {
        let role = await getUserRoleFromClaims();
        if (!role) {
          role = parseInt(localStorage.getItem("role"));
        }
        setUserRole(role);

        if (role === 1) {
          // Admin - load all schools
          const schoolsData = await getSchools();
          setSchools(schoolsData);
        } else if (role === 2) {
          // School user - get current school from localStorage
          const currentSchoolId = localStorage.getItem("school");

          if (currentSchoolId) {
            const schoolsData = [
              {
                id: currentSchoolId,
                name: localStorage.getItem("userDisplayName"),
              },
            ];
            const currentSchool = schoolsData[0];

            if (currentSchool) {
              setSchools([currentSchool]);
              setSelectedSchool(currentSchoolId);
              // Load classes for current school
              const classesData = await getClasses();
              setClasses(classesData);
            }
          }
        }
      } catch (error) {
        console.error("Σφάλμα κατά την αρχικοποίηση δεδομένων:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const handleSchoolChange = async (e) => {
    const schoolId = e.target.value;
    setSelectedSchool(schoolId);
    setSelectedClass("");
    setClasses([]);

    if (schoolId) {
      try {
        // Store school in localStorage temporarily for API calls
        const originalSchool = localStorage.getItem("school");
        localStorage.setItem("school", schoolId);

        const classesData = await getClasses();
        setClasses(classesData);

        // Restore original school
        if (originalSchool) {
          localStorage.setItem("school", originalSchool);
        }
      } catch (error) {
        console.error("Σφάλμα κατά τη φόρτωση τάξεων:", error);
      }
    }
  };

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClass(classId);
  };

  const handleGenerateReport = () => {
    const reportData = {
      schoolId: selectedSchool,
      classId: selectedClass || null,
    };

    console.log("Δεδομένα αναφοράς:", reportData);
    // TODO: Η κλήση API θα υλοποιηθεί εδώ
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div>Φόρτωση...</div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h3>Αναφορές</h3>
            </Card.Header>
            <Card.Body>
              <Form>
                <Row className="mb-3 align-items-end">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Σχολείο</Form.Label>
                      <Form.Select
                        value={selectedSchool}
                        onChange={handleSchoolChange}
                        disabled={userRole === 2}
                      >
                        <option value="">Επιλέξτε σχολείο</option>
                        {schools.map((school) => (
                          <option key={school.id} value={school.id}>
                            {school.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Τάξη</Form.Label>
                      <Form.Select
                        value={selectedClass}
                        onChange={handleClassChange}
                        disabled={!selectedSchool}
                      >
                        <option value="">Επιλέξτε τάξη</option>
                        {classes.map((classItem) => (
                          <option key={classItem.id} value={classItem.id}>
                            {classItem.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Button
                      variant="primary"
                      onClick={handleGenerateReport}
                      disabled={!selectedSchool}
                    >
                      Παραγωγή Αναφοράς
                    </Button>
                  </Col>
                </Row>

                <Row></Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Reports;
