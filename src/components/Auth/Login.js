import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, getUserRoleFromClaims } from "../../services/firebase";
import { Form, Button, Container, Card, Alert } from "react-bootstrap";
import { getUsers, setDisplayName } from "../../services/users";
import { getSchoolById } from "../../services/schools";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const role = (await getUserRoleFromClaims()) || 2;
      localStorage.setItem("role", String(role));

      let displayName = "";
      if (role === 1) {
        displayName = email;

        const schools = await getUsers();

        if (schools.length > 0) {
          localStorage.setItem("school", schools[0].uid);
        }
      } else if (role === 2) {
        localStorage.setItem("school", userCredential.user.uid);
        
        const schoolDoc = await getSchoolById(userCredential.user.uid);
        
        displayName = schoolDoc.data().name;
      }
      setDisplayName(displayName);

      navigate("/");
    } catch (err) {
      setError("Failed to log in. Please check your credentials.");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <div className="w-100" style={{ maxWidth: "400px" }}>
        <Card>
          <Card.Body>
            <h2 className="text-center mb-4">Σύνδεση</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group id="email" className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group id="password" className="mb-3">
                <Form.Label>Κωδικός πρόσβασης</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>
              <Button disabled={loading} className="w-100" type="submit">
                {loading ? "Συνδέεστε..." : "Σύνδεση"}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default Login;
