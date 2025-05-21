import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Container } from "react-bootstrap";
import PrivateRoute from "./components/Auth/PrivateRoute";
import Login from "./components/Auth/Login";
import Home from "./components/Home";
import Header from "./components/Header";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/App.css";
import Students from "./components/Students/Students";
import Classes from "./components/Classes/Classes";
import Users from "./components/Users/Users";
import { getUserRoleFromClaims } from "./services/firebase";
import { useEffect, useState } from "react";

// Wrapper component to handle header display logic
const AppWrapper = () => {
  const location = useLocation();
  const showHeader = !["/login"].includes(location.pathname);
  const [role, setRole] = useState(null);

  useEffect(() => {
    getUserRoleFromClaims().then((r) => {
      setRole(r);
    });
  }, []);

  return (
    <>
      {showHeader && <Header />}
      <Container>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          {role === 1 && (
            <Route
              path="/users"
              element={
                <PrivateRoute>
                  <Users />
                </PrivateRoute>
              }
            />
          )}
          <Route
            path="/students"
            element={
              <PrivateRoute>
                <Students />
              </PrivateRoute>
            }
          />
          <Route
            path="/classes"
            element={
              <PrivateRoute>
                <Classes />
              </PrivateRoute>
            }
          />
        </Routes>
      </Container>
    </>
  );
};

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
