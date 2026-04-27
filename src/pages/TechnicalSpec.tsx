import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sections } from "@/components/technical-spec/TechnicalSpecData";
import TechnicalSpecHeader, {
  TechnicalSpecSidebar,
  TechnicalSpecHero,
  TechnicalSpecFooter,
} from "@/components/technical-spec/TechnicalSpecHeader";
import TechnicalSpecModules from "@/components/technical-spec/TechnicalSpecModules";
import TechnicalSpecDetails from "@/components/technical-spec/TechnicalSpecDetails";

const TechnicalSpec = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("general");

  useEffect(() => {
    const handleScroll = () => {
      const offsets = sections.map((s) => {
        const el = document.getElementById(s.id);
        if (!el) return { id: s.id, top: Infinity };
        return { id: s.id, top: Math.abs(el.getBoundingClientRect().top - 100) };
      });
      const closest = offsets.reduce((a, b) => (a.top < b.top ? a : b));
      setActiveSection(closest.id);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white font-['Nunito']">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { font-size: 11pt; }
          .print-break { page-break-before: always; }
        }
      `}</style>

      <TechnicalSpecHeader onBack={() => navigate("/")} />

      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8 sm:px-6">
        <TechnicalSpecSidebar activeSection={activeSection} onScrollTo={scrollTo} />

        <main className="min-w-0 flex-1">
          <TechnicalSpecHero />
          <TechnicalSpecModules />
          <TechnicalSpecDetails />
          <TechnicalSpecFooter />
        </main>
      </div>
    </div>
  );
};

export default TechnicalSpec;
