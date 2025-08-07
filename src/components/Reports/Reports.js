import React, { useState, useEffect } from "react";
import { Container, Form, Button, Row, Col, Card, Table } from "react-bootstrap";
import { getSchools } from "../../services/schools";
import { getClasses } from "../../services/classes";
import { getReportsWithDetails } from "../../services/reports";
import { getUserRoleFromClaims } from "../../services/firebase";
import * as XLSX from "xlsx";
import { downloadReportsWithAudio } from "../../services/reportDownload";

// Games list with IDs and names
const games = [
  { id: 1, name: "Υπογράμμιση Λέξεων" },
  { id: 2, name: "Παιχνίδι Ρίζας και Κατάληξης" },
  { id: 3, name: "Άσκηση Ελληνικής Ανάγνωσης" },
  { id: 4, name: "Παιχνίδι Κατάληξης Λέξεων" },
  { id: 5, name: "Παιχνίδι Διαχωρισμού Λέξεων" },
  { id: 6, name: "Παιχνίδι Ταιριάσματος Προθημάτων" },
  { id: 7, name: "Παιχνίδι Ελληνικών Προθημάτων" },
  { id: 8, name: "Παιχνίδι Ελληνικής Μορφολογίας" },
  { id: 9, name: "Παιχνίδι Υπογράμμισης Προθημάτων-Καταλήξεων" },
  { id: 10, name: "Παιχνίδι Ανάγνωσης Συλλαβών" },
  { id: 11, name: "Παιχνίδι Ελληνικών Κλιτικών Καταλήξεων" },
  { id: 12, name: "Παιχνίδι Ελληνικών Ρηματικών Καταλήξεων" },
  { id: 13, name: "Παιχνίδι Ελληνικού Σχηματισμού Λέξεων" },
  { id: 14, name: "Παιχνίδι Ελληνικών Επιθετικών Καταλήξεων" },
  { id: 15, name: "Παιχνίδι Ελληνικών Καταλήξεων Marquee" },
];

const Reports = () => {
  const [schools, setSchools] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedGame, setSelectedGame] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportData, setReportData] = useState([]);

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

  const handleGameChange = (e) => {
    const gameId = e.target.value;
    setSelectedGame(gameId);
  };

  // Index function to filter and fetch report data
  const indexReports = async (schoolId, classId, gameId) => {
    try {
      // Store original school temporarily if needed
      const originalSchool = localStorage.getItem("school");
      localStorage.setItem("school", schoolId);

      // Fetch all reports for the school
      const allReports = await getReportsWithDetails();

      // Filter reports based on criteria
      let filteredReports = allReports;

      // Game filter (required)
      if (gameId) {
        filteredReports = filteredReports.filter(
          (report) =>
            report.gameId === parseInt(gameId) ||
            report.game === parseInt(gameId)
        );
      }

      // Class filter (optional)
      if (classId) {
        filteredReports = filteredReports.filter(
          (report) => report.classId === classId
        );
      }

      // Truncate studentId to first 6 characters and parse results
      const processedReports = filteredReports.map((report) => ({
        ...report,
        studentId: report.studentId
          ? report.studentId.substring(0, 6)
          : report.studentId,
        parsedResults: report.results ? JSON.parse(report.results) : null,
      }));

      // Restore original school
      if (originalSchool) {
        localStorage.setItem("school", originalSchool);
      }

      return processedReports;
    } catch (error) {
      console.error("Error fetching reports:", error);
      throw error;
    }
  };

  // Export to XLSX function
  const exportToXLSX = () => {
    if (reportData.length === 0) return;

    const selectedSchoolName =
      schools.find((s) => s.id === selectedSchool)?.name || "Άγνωστο Σχολείο";
    const selectedGameName =
      games.find((g) => g.id === parseInt(selectedGame))?.name ||
      "Άγνωστο Παιχνίδι";

    const wb = XLSX.utils.book_new();
    const excelData = [];

    excelData.push([`Σχολείο: ${selectedSchoolName}`]);
    excelData.push([`Παιχνίδι: ${selectedGameName} (ID: ${selectedGame})`]);
    excelData.push([]);

    let maxQuestions = 0;
    reportData.forEach((report) => {
      if (report.parsedResults?.questions)
        maxQuestions = Math.max(
          maxQuestions,
          report.parsedResults.questions.length
        );
    });

    const questionGroupHeaders = ["", "", "", "", ""];
    const detailedHeaders = ["Κωδικός Μαθητή", "Ημερομηνία/Ώρα", "Φύλο", "Ημερομηνία Γέννησης", "Διάγνωση"];
    for (let i = 1; i <= maxQuestions; i++) {
      questionGroupHeaders.push(`Ερώτηση ${i}`, "", "", "", "");
      detailedHeaders.push(
        "Ερώτημα",
        "Στόχος",
        "Απάντηση",
        "Σωστό",
        "Δευτερόλεπτα"
      );
    }

    excelData.push(questionGroupHeaders);
    excelData.push(detailedHeaders);

    reportData.forEach((report) => {
      const row = [
        report.studentId,
        report.parsedResults?.datetime || "Δεν υπάρχει",
        report.studentGender || "-",
        report.studentDateOfBirth || "-",
        report.studentDiagnosis === true ? "Ναι" : report.studentDiagnosis === false ? "Όχι" : "-",
      ];
      const questions = report.parsedResults?.questions || [];
      for (let i = 0; i < maxQuestions; i++) {
        const question = questions[i];
        if (question) {
          row.push(
            question.question || "",
            question.target || "",
            question.result || "",
            question.isCorrect !== undefined ? (question.isCorrect ? "Σωστό" : "Λάθος") : "",
            question.seconds !== undefined ? question.seconds : ""
          );
        } else {
          row.push("", "", "", "", "");
        }
      }
      excelData.push(row);
    });

    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // Κάνουμε τις πρώτες σειρές να συγχωνευτούν σε κάθε group
    for (let i = 5; i < 5 + maxQuestions * 5; i += 5) {
      ws["!merges"] = ws["!merges"] || [];
      ws["!merges"].push({ s: { r: 2, c: i }, e: { r: 2, c: i + 4 } });
    }

    XLSX.utils.book_append_sheet(wb, ws, "Αναφορά");

    const currentDate = new Date();
    const dateStr = currentDate.toISOString().split("T")[0];
    const filename = `Αναφορα_${selectedGameName.replace(
      /\s+/g,
      "_"
    )}_${dateStr}.xlsx`;

    XLSX.writeFile(wb, filename);
  };

  // Export to ZIP with audio function
  const exportToZipWithAudio = async () => {
    if (reportData.length === 0) return;

    try {
      await downloadReportsWithAudio(
        reportData,
        schools,
        games,
        selectedSchool,
        selectedGame
      );
    } catch (error) {
      console.error("Error downloading reports with audio:", error);
      alert("Error downloading reports with audio files. Please try again.");
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedSchool || !selectedGame) {
      console.log("School and Game are required");
      return;
    }

    try {
      setReportLoading(true);

      const reports = await indexReports(
        selectedSchool,
        selectedClass,
        selectedGame
      );
      setReportData(reports);

      console.log("Report data length:", reports.length);
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setReportLoading(false);
    }
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
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Σχολείο (*)</Form.Label>
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

                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Παιχνίδι (*)</Form.Label>
                      <Form.Select
                        value={selectedGame}
                        onChange={handleGameChange}
                        disabled={!selectedSchool}
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

                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Τάξη</Form.Label>
                      <Form.Select
                        value={selectedClass}
                        onChange={handleClassChange}
                        disabled={!selectedSchool}
                      >
                        <option value="">Επιλέξτε τάξη (προαιρετικό)</option>
                        {classes.map((classItem) => (
                          <option key={classItem.id} value={classItem.id}>
                            {classItem.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={3}>
                    <Button
                      variant="primary"
                      onClick={handleGenerateReport}
                      disabled={
                        !selectedSchool || !selectedGame || reportLoading
                      }
                    >
                      {reportLoading ? "Φόρτωση..." : "Παραγωγή Αναφοράς"}
                    </Button>
                  </Col>
                </Row>

                <Row></Row>
              </Form>

              {reportLoading && (
                <div className="mt-4">
                  <hr />
                  <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Φόρτωση...</span>
                    </div>
                    <p className="mt-2">Φόρτωση αποτελεσμάτων αναφοράς...</p>
                  </div>
                </div>
              )}

              {!reportLoading && reportData.length > 0 && (
                <div className="mt-4">
                  <hr />
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5>Αποτελέσματα Αναφοράς</h5>
                    <div className="d-flex gap-2">
                      <Button
                        variant="success"
                        onClick={exportToXLSX}
                        className="d-flex align-items-center gap-2"
                      >
                        📊 Εξαγωγή σε Excel
                      </Button>
                      <Button
                        variant="primary"
                        onClick={exportToZipWithAudio}
                        className="d-flex align-items-center gap-2"
                      >
                        🎧 Εξαγωγή με Καταγραφές
                      </Button>
                    </div>
                  </div>
                  <p>
                    Βρέθηκαν {reportData.length} αναφορές για το επιλεγμένο
                    παιχνίδι.
                  </p>
                  
                  <div className="table-responsive">
                    <Table striped bordered hover size="sm" className="reports-table">
                      <thead>
                        <tr style={{ backgroundColor: '#0d6efd', color: 'white' }}>
                          <th style={{ fontWeight: '600', textAlign: 'center', verticalAlign: 'middle', padding: '12px 8px' }}>
                            Κωδικός Μαθητή
                          </th>
                          <th style={{ fontWeight: '600', textAlign: 'center', verticalAlign: 'middle', padding: '12px 8px' }}>
                            Σχολείο
                          </th>
                          <th style={{ fontWeight: '600', textAlign: 'center', verticalAlign: 'middle', padding: '12px 8px' }}>
                            Τάξη
                          </th>
                          <th style={{ fontWeight: '600', textAlign: 'center', verticalAlign: 'middle', padding: '12px 8px' }}>
                            Φύλο
                          </th>
                          <th style={{ fontWeight: '600', textAlign: 'center', verticalAlign: 'middle', padding: '12px 8px' }}>
                            Ημερομηνία Γέννησης
                          </th>
                          <th style={{ fontWeight: '600', textAlign: 'center', verticalAlign: 'middle', padding: '12px 8px' }}>
                            Διάγνωση
                          </th>
                          <th style={{ fontWeight: '600', textAlign: 'center', verticalAlign: 'middle', padding: '12px 8px' }}>
                            Ημερομηνία Αναφοράς
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.length === 0 ? (
                          <tr>
                            <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#6c757d', fontStyle: 'italic' }}>
                              Δεν βρέθηκαν αναφορές για τα επιλεγμένα κριτήρια
                            </td>
                          </tr>
                        ) : (
                          reportData.map((report, index) => (
                            <tr key={report.id || index} style={{ fontSize: '14px' }}>
                              <td style={{ padding: '10px 8px', verticalAlign: 'middle', fontSize: '14px' }}>
                                {report.studentId || "-"}
                              </td>
                              <td style={{ padding: '10px 8px', verticalAlign: 'middle', fontSize: '14px' }}>
                                {report.schoolName || "-"}
                              </td>
                              <td style={{ padding: '10px 8px', verticalAlign: 'middle', fontSize: '14px' }}>
                                {report.className || "-"}
                              </td>
                              <td style={{ padding: '10px 8px', verticalAlign: 'middle', textAlign: 'center', fontSize: '14px' }}>
                                {report.studentGender || "-"}
                              </td>
                              <td style={{ padding: '10px 8px', verticalAlign: 'middle', textAlign: 'center', fontSize: '14px' }}>
                                {report.studentDateOfBirth || "-"}
                              </td>
                              <td style={{ 
                                padding: '10px 8px', 
                                verticalAlign: 'middle', 
                                textAlign: 'center',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: report.studentDiagnosis === true ? '#d63384' : report.studentDiagnosis === false ? '#198754' : '#6c757d'
                              }}>
                                {report.studentDiagnosis === true 
                                  ? "Ναι" 
                                  : report.studentDiagnosis === false 
                                  ? "Όχι" 
                                  : "-"}
                              </td>
                              <td style={{ padding: '10px 8px', verticalAlign: 'middle', fontSize: '14px' }}>
                                {report.parsedResults?.datetime || "-"}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Reports;
