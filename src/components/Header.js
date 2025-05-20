// src/components/Header.js
import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { auth } from "../services/firebase";
import { signOut } from "firebase/auth";
import "../styles/Header.css";

const Header = () => {
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
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
      <Container>
        <Navbar.Brand as={Link} to="/">
          Educational Platform
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link
              as={Link}
              to="/"
              className={isActive("/") ? "active fw-bold" : ""}
            >
              Home
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/users"
              className={isActive("/users") ? "active fw-bold" : ""}
            >
              Users
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/students"
              className={isActive("/students") ? "active fw-bold" : ""}
            >
              Students
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/classes"
              className={isActive("/classes") ? "active fw-bold" : ""}
            >
              Classes
            </Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link
              as={Link}
              to="/profile"
              className={isActive("/profile") ? "active fw-bold" : ""}
            >
              Profile
            </Nav.Link>
            <Nav.Link onClick={handleLogout} className="logout-link">
              Log Out
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
