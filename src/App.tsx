import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect } from "react";
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
import { useAuth } from "./lib/auth";

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

function HomeOrLogin() {
  const { engaged } = useAuth();
  if (!engaged) return <Navigate to="/login" replace />;
  return <Home />;
}

export default function App() {
  const location = useLocation();
  const { engaged } = useAuth();
  const isAuthPage = ["/login", "/register", "/dashboard"].includes(location.pathname);

  useEffect(() => {
    if (isAuthPage || engaged) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isAuthPage, engaged]);

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
            <Route path="/" element={<HomeOrLogin />} />
            <Route path="*" element={<HomeOrLogin />} />
          </Routes>
        </main>
      )}
    </>
  );
}
