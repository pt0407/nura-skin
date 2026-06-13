import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Pillars from "./components/Pillars";
import HowItWorks from "./components/HowItWorks";
import Scanner from "./components/Scanner";
import Privacy from "./components/Privacy";
import Footer from "./components/Footer";

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Pillars />
        <HowItWorks />
        <Scanner />
        <Privacy />
        <Footer />
      </main>
    </>
  );
}
