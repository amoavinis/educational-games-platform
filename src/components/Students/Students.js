import React, { useState, useEffect } from "react";
import { Table, Button, Form, Row, Col, Pagination } from "react-bootstrap";
import {
  addStudent,
  updateStudent,
  deleteStudent,
  getStudentsWithClasses,
} from "../../services/students";
import { auth } from "../../services/firebase";
import StudentEditor from "./StudentEditor";
import DeleteConfirmation from "./DeleteConfirmation";
import "../../styles/Students.css";
import { getClasses } from "../../services/classes";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });
  const [filters, setFilters] = useState({ name: "", class: "" });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 5,
  });
  const [availableClasses, setAvailableClasses] = useState([]);

  // Load students from Firestore
  useEffect(() => {
    const loadStudents = async () => {
      try {
        const data = await getStudentsWithClasses();
        setStudents(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load students");
        setLoading(false);
        console.error(err);
      }
    };

    const loadClasses = async () => {
      const classes = await getClasses();
      setAvailableClasses([{ id: null, class: "All" }, ...classes]);
    };

    if (auth.currentUser) {
      loadStudents();
      loadClasses();
    }
  }, []);

  const handleAddStudent = () => {
    setCurrentStudent(null);
    setShowEditor(true);
  };

  const handleEditStudent = (student) => {
    setCurrentStudent(student);
    setShowEditor(true);
  };

  const handleDeleteStudent = (student) => {
    setCurrentStudent(student);
    setShowDeleteModal(true);
  };

  const handleSaveStudent = async (student) => {
    try {
      if (student.id) {
        // Update existing student
        await updateStudent(student.id, {
          name: student.name,
          classId: student.classId,
        });
        setStudents(students.map((s) => (s.id === student.id ? student : s)));
      } else {
        // Add new student
        const newStudent = {
          name: student.name,
          classId: student.classId,
        };
        const id = await addStudent(newStudent);
        setStudents([...students, { ...newStudent, id }]);
      }
      setShowEditor(false);
    } catch (err) {
      setError("Failed to save student");
      console.error(err);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteStudent(currentStudent.id);
      setStudents(students.filter((s) => s.id !== currentStudent.id));
      setShowDeleteModal(false);
    } catch (err) {
      setError("Failed to delete student");
      console.error(err);
    }
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = () => {
    const sortableItems = [...students];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  };

  const getFilteredData = () => {
    const sortedData = getSortedData();
    return sortedData.filter((student) => {
      return (
        student.name.toLowerCase().includes(filters.name.toLowerCase()) &&
        (student.class.toLowerCase().includes(filters.class.toLowerCase()) ||
          filters.class === "All")
      );
    });
  };

  const filteredStudents = getFilteredData();
  const totalPages = Math.ceil(
    filteredStudents.length / pagination.itemsPerPage
  );
  const currentItems = filteredStudents.slice(
    (pagination.currentPage - 1) * pagination.itemsPerPage,
    pagination.currentPage * pagination.itemsPerPage
  );

  if (loading) {
    return <div>Loading students...</div>;
  }
  if (error) {
    return <div className="text-danger">{error}</div>;
  }

  return (
    <div className="students-container">
      <h2>Students Management</h2>

      <div className="students-controls">
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Filter by Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Search by name"
                value={filters.name}
                onChange={(e) =>
                  setFilters({ ...filters, name: e.target.value })
                }
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Filter by Class</Form.Label>
              <Form.Control
                as="select"
                value={filters.class}
                onChange={(e) =>
                  setFilters({ ...filters, class: e.target.value })
                }
              >
                {availableClasses.map((cls) => (
                  <option key={cls.id} value={cls.name}>
                    {cls.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
          <Col md={4} className="d-flex align-items-end">
            <Button variant="primary" onClick={handleAddStudent}>
              Add New Student
            </Button>
          </Col>
        </Row>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th onClick={() => requestSort("name")}>
              Name{" "}
              {sortConfig.key === "name" &&
                (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => requestSort("class")}>
              Class{" "}
              {sortConfig.key === "class" &&
                (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((student) => (
              <tr key={student.id}>
                <td>{student.name}</td>
                <td>{student.className}</td>
                <td>
                  <Button
                    variant="info"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEditStudent(student)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteStudent(student)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center">
                No students found
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {totalPages > 1 && (
        <Pagination className="justify-content-center">
          <Pagination.Prev
            disabled={pagination.currentPage === 1}
            onClick={() =>
              setPagination({
                ...pagination,
                currentPage: pagination.currentPage - 1,
              })
            }
          />
          {Array.from({ length: totalPages }, (_, i) => (
            <Pagination.Item
              key={i + 1}
              active={i + 1 === pagination.currentPage}
              onClick={() =>
                setPagination({ ...pagination, currentPage: i + 1 })
              }
            >
              {i + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            disabled={pagination.currentPage === totalPages}
            onClick={() =>
              setPagination({
                ...pagination,
                currentPage: pagination.currentPage + 1,
              })
            }
          />
        </Pagination>
      )}

      <StudentEditor
        show={showEditor}
        student={currentStudent}
        onSave={handleSaveStudent}
        onCancel={() => setShowEditor(false)}
      />

      <DeleteConfirmation
        show={showDeleteModal}
        student={currentStudent}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default Students;
