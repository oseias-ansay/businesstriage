import Header from '../components/Header';
import Footer from '../components/Footer';
import Hero from '../sections/Hero';
import About from '../sections/About';
import Services from '../sections/Services';
import Contact from '../sections/Contact';

interface PublicSiteProps {
  onLogin: () => void;
}

export default function PublicSite({ onLogin }: PublicSiteProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-navy-900">
      <Header onLogin={onLogin} onHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
      <main>
        <Hero onLogin={onLogin} />
        <About />
        <Services />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
