import React, { useState, useEffect } from "react";
import { Table, Button, Alert } from "react-bootstrap";
import { getUsers, createUser, updateUser, deleteUser } from "../../services/users";
import UserEditor from "./UserEditor";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersData = await getUsers();
        setUsers(usersData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const handleSave = async (userData) => {
    try {
      if (currentUser) {
        await updateUser(currentUser.uid, userData);
        setUsers(
          users.map((u) =>
            u.uid === currentUser.uid ? { ...u, ...userData } : u
          )
        );
      } else {
        const result = await createUser(userData);
        setUsers([...users, { uid: result.uid, ...userData }]);
      }
      setShowEditor(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      if (id) {
        await deleteUser(id);
        setUsers(users.filter((u) => u.uid !== id));
      }
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) return <div>Φόρτωση χρηστών...</div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <Button
        onClick={() => {
          setCurrentUser(null);
          setShowEditor(true);
        }}
      >
        Προσθήκη χρήστη
      </Button>

      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>Email</th>
            <th>Όνομα</th>
            <th>Ρόλος</th>
            <th>Ενέργειες</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.uid}>
              <td>{user.email}</td>
              <td>{user.name}</td>
              <td>{user.role === 1 ? "Διαχειριστής" : "Χρήστης"}</td>
              <td>
                <Button
                  variant="info"
                  size="sm"
                  className="me-2"
                  onClick={() => {
                    setCurrentUser(user);
                    setShowEditor(true);
                  }}
                >
                  Επεξεργασία
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(user.id)}
                >
                  Διαγραφή
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <UserEditor
        show={showEditor}
        user={currentUser}
        onSave={handleSave}
        onCancel={() => setShowEditor(false)}
      />
    </div>
  );
};

export default Users;
