import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Hero from '../sections/Hero';
import About from '../sections/About';
import Services from '../sections/Services';
import Contact from '../sections/Contact';

export default function PublicSite() {
  const navigate = useNavigate();
  const irParaLogin = () => navigate('/login');

  return (
    <div className="min-h-screen bg-slate-50 text-navy-900">
      <Header onLogin={irParaLogin} onHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
      <main>
        <Hero onLogin={irParaLogin} />
        <About />
        <Services />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
