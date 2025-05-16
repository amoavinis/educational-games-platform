import React from "react";
import { Button } from "react-bootstrap";
import { auth } from "../services/firebase";
import { signOut } from "firebase/auth";

const Home = () => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="text-center mt-5">
      <h1>Welcome to the Educational Games Platform</h1>
      <p>This is the admin dashboard. More features coming soon!</p>
      <Button variant="danger" onClick={handleLogout}>
        Logout
      </Button>
    </div>
  );
};

export default Home;
