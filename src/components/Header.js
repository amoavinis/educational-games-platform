import React, { useState, useEffect } from "react";
import { Navbar, Nav } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { auth, getUserRoleFromClaims } from "../services/firebase";
import { signOut } from "firebase/auth";
import "../styles/Header.css";
import { getDisplayName } from "../services/users";

const Header = () => {
  const location = useLocation();
  const [role, setRole] = useState(null);
  const [name, setName] = useState("");

  useEffect(() => {
    getUserRoleFromClaims().then((r) => {
      if (!r) {
        r = parseInt(localStorage.getItem("role"))
      }
      setRole(r);
    });
    setName(getDisplayName());
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Clear the welcome audio flag so it plays again on next login
      sessionStorage.removeItem("welcomeAudioPlayed");
    } catch (err) {
      console.error(err);
    }
  };

  // Updated isActive function with exact path matching for home
  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Navbar expand="lg" className="header-navbar mb-4">
      <div className="header">
        <Navbar.Brand as={Link} to="/" style={{marginRight: 30}}>
          Morpho-Game
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto" style={{gap: 18}}>
            <Nav.Link
              as={Link}
              to="/"
              className={isActive("/") ? "active fw-bold" : ""}
            >
              Παιχνίδια
            </Nav.Link>
            {role === 1 && (
              <Nav.Link
                as={Link}
                to="/users"
                className={isActive("/users") ? "active fw-bold" : ""}
              >
                Χρήστες
              </Nav.Link>
            )}
            {role === 1 && (
              <Nav.Link
                as={Link}
                to="/material-management"
                className={isActive("/material-management") ? "active fw-bold" : ""}
                style={{textAlign: "center"}}
              >
                Επεξεργασία Υλικού
              </Nav.Link>
            )}
            <Nav.Link
              as={Link}
              to="/students"
              className={isActive("/students") ? "active fw-bold" : ""}
            >
              Μαθητές
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/classes"
              className={isActive("/classes") ? "active fw-bold" : ""}
            >
              Τάξεις
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/reports"
              className={isActive("/reports") ? "active fw-bold" : ""}
            >
              Αναφορές
            </Nav.Link>
          </Nav>
          <Nav>
            <Nav.Item
              className="bold d-flex flex-row align-items-center"
              style={{ marginRight: 20 }}
            >
              { name }
            </Nav.Item>
            <Nav.Link onClick={handleLogout} className="logout-link">
              Αποσύνδεση
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </div>
    </Navbar>
  );
};

export default Header;
