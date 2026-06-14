import { Routes, Route, useLocation } from "react-router-dom";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Pillars from "./components/Pillars";
import HowItWorks from "./components/HowItWorks";
import Scanner from "./components/Scanner";
import Privacy from "./components/Privacy";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function Home() {
  return (
    <>
      <Hero />
      <Pillars />
      <HowItWorks />
      <Scanner />
      <Privacy />
      <Footer />
    </>
  );
}

export default function App() {
  const location = useLocation();
  const isAuthPage = ["/login", "/register", "/dashboard"].includes(location.pathname);

  return (
    <>
      <Nav />
      {isAuthPage ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      ) : (
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
      )}
    </>
  );
}
