import React, { useState, useEffect } from "react";
import { Table, Button, Container } from "react-bootstrap";
import ClassEditor from "./ClassEditor";
import {
  getClasses,
  updateClass,
  addClass,
  deleteClass,
} from "../../services/classes";

const ClassList = () => {
  const [classes, setClasses] = useState([]);
  const [showEditor, setShowEditor] = useState(false);
  const [currentClass, setCurrentClass] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const classesData = await getClasses();
        setClasses(classesData);
      } catch (err) {
        console.error("Failed to load classes", err);
      } finally {
        setLoading(false);
      }
    };
    loadClasses();
  }, []);

  const handleDelete = async (classId) => {
    if (window.confirm("Are you sure you want to delete this class?")) {
      try {
        await deleteClass(classId);
        setClasses(classes.filter((c) => c.id !== classId));
      } catch (err) {
        console.error("Failed to delete class", err);
      }
    }
  };

  if (loading) return <div>Loading classes...</div>;

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Classes</h2>
        <Button
          variant="primary"
          onClick={() => {
            setCurrentClass(null);
            setShowEditor(true);
          }}
        >
          Add New Class
        </Button>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {classes.map((cls) => (
            <tr key={cls.id}>
              <td>{cls.name}</td>
              <td>
                <Button
                  variant="info"
                  size="sm"
                  className="me-2"
                  onClick={() => {
                    setCurrentClass(cls);
                    setShowEditor(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(cls.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
          {classes.length === 0 && (
            <tr>
              <td colSpan={2} className="text-center">
                No classes found
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <ClassEditor
        show={showEditor}
        classData={currentClass}
        onSave={async (classData) => {
          if (currentClass) {
            await updateClass(currentClass.id, classData);
            setClasses(
              classes.map((c) =>
                c.id === currentClass.id ? { ...c, ...classData } : c
              )
            );
          } else {
            const id = await addClass(classData);
            setClasses([...classes, { id, ...classData }]);
          }
          setShowEditor(false);
        }}
        onCancel={() => setShowEditor(false)}
      />
    </Container>
  );
};

export default ClassList;
