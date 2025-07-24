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
import GameScreen from "./components/Games/GameScreen";
import Reports from "./components/Reports/Reports";

// Wrapper component to handle header display logic
const AppWrapper = () => {
  const location = useLocation();
  const showHeader = !["/login"].includes(location.pathname);

  return (
    <>
      {showHeader && <Header />}
      <Container style={{height: "calc(100vh - 56px - 1.5rem)"}}>
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
          <Route
            path="/users"
            element={
              <PrivateRoute>
                <Users />
              </PrivateRoute>
            }
          />
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
          <Route
            path="/games/:gameId"
            element={
              <PrivateRoute>
                <GameScreen />
              </PrivateRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <Reports />
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
