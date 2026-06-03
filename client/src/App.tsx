import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Discovery } from "./components/Discovery";
import { Skills } from "./components/Skills";
import { Journey } from "./components/Journey";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import { Projects } from "./components/Projects";
import { useInteractions } from "./hooks/useInteractions";
import { scrollToElement } from "./utils/smoothScroll";
import type { PortfolioData } from "./types";

// Resilient Fallback Data matching the JSON file
const FALLBACK_DATA: PortfolioData = {
  hero: {
    badges: ["NU Fairview", "UI/UX Explorer", "AWS Cloud Clubs PH"],
    typingPhrases: [
      "Hi, I am Raphael.",
      "I design thoughtful interfaces.",
      "I build, learn, and lead."
    ],
    title: {
      line1: "Design.",
      line2: "Code.",
      highlight: "Create."
    },
    description: [
      "BSIT-Mobile and Internet student at National University Fairview. Cybersecurity elective."
    ],
    currentLane: "Frontend + UI/UX",
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/raphael-c-953821361/",
      github: "https://github.com/htmlcsslover",
      email: "mailto:contact@example.com"
    }
  },
  discovery: {
    kicker: "Discovery",
    title: "What started as curiosity became a passion for creating.",
    paragraphs: [
      "I got into tech through the people around me. Seeing my friends grow from students into professionals and even influencers in the tech industry inspired me to explore the field myself. Their journey showed me how technology can open opportunities, build communities, and create impact beyond just coding.",
      "What drives my curiosity is simple: whenever something genuinely interests me, I tend to hyperfixate and dive deep into learning everything about it. That mindset helped me explore different areas in tech and continuously push myself to improve.",
      "Right now, I am focused on exploring UI/UX design and leadership. I enjoy understanding how design and user experience can make digital products more meaningful and accessible.",
      "As an Information Officer for AWS Cloud Clubs Philippines, I also want to grow more as a leader by gaining experience in communication, collaboration, and community building."
    ]
  },
  skills: {
    kicker: "Skills",
    title: "Tools I keep sharpening.",
    categories: [
      {
        name: "Frontend",
        items: ["HTML", "CSS", "Tailwind CSS", "JavaScript", "React.js"]
      },
      {
        name: "Backend",
        items: ["Node.js", "Express.js", "REST APIs", "PHP"]
      },
      {
        name: "Database",
        items: ["Supabase", "MySQL"]
      },
      {
        name: "Design",
        items: ["Figma", "Wireframing", "Prototyping"]
      },
      {
        name: "Security",
        items: ["Cybersecurity Fundamentals", "Ethical Hacking Basics", "Risk Awareness"]
      },
      {
        name: "Tools",
        items: [
          "Git",
          "GitHub",
          "VS Code",
          "Codex",
          "Antigravity",
          "Claude",
          "ChatGPT",
          "Gemini",
          "Cursor",
          "Kiro AI",
          "Windsurf"
        ]
      }
    ]
  },
  journey: {
    education: {
      kicker: "Education",
      items: [
        {
          period: "2024-Present",
          title: "BS Information Technology - Mobile & Internet",
          subtitle: "National University Fairview"
        },
        {
          period: "2022-2024",
          title: "BS Information Technology",
          subtitle: "AMA Computer College"
        }
      ]
    },
    experience: {
      kicker: "Experience",
      items: [
        {
          period: "Present",
          title: "Information Officer | Volunteer",
          subtitle: "AWS Cloud Clubs Philippines"
        },
        {
          period: "2022-2023",
          title: "Customer Service Representative",
          subtitle: "Teleperformance"
        }
      ]
    }
  },
  contact: {
    kicker: "Connect",
    title: "Let's connect.",
    description: "I am always open to new opportunities, collaborations, or just talking about tech. The best way to reach out to me is through LinkedIn!"
  },
  projects: {
    kicker: "Works",
    title: "Featured Projects",
    items: [
      {
        title: "StellarX: OFW Split Remittance System",
        description: "A Stellar-powered remittance platform that allows Overseas Filipino Workers to automatically split and distribute funds to multiple family members through programmable payments and claimable balances.",
        techStack: ["React", "Vite", "TypeScript", "Tailwind CSS", "Stellar SDK", "Freighter Wallet", "Claimable Balances"],
        image: "/images/projects/project-1/placeholder.png",
        screenshots: [
          "/images/projects/project-1/screenshot-1.png",
          "/images/projects/project-1/screenshot-2.png",
          "/images/projects/project-1/screenshot-3.png"
        ],
        link: "#"
      },
      {
        title: "StellarX: BNPL Decentralized Marketplace",
        description: "A decentralized Buy Now, Pay Later (BNPL) marketplace built on the Stellar network. Users can purchase products through community-funded installment plans, build on-chain credit reputation, and complete transparent payments secured by Soroban smart contracts.",
        techStack: ["React", "TypeScript", "Node.js", "Stellar SDK", "Soroban", "Tailwind CSS"],
        image: "/images/projects/project-2/placeholder.png",
        screenshots: [
          "/images/projects/project-2/screenshot-1.png",
          "/images/projects/project-2/screenshot-2.png",
          "/images/projects/project-2/screenshot-3.png",
          "/images/projects/project-2/screenshot-4.png",
          "/images/projects/project-2/screenshot-5.png"
        ],
        link: "#"
      },
      {
        title: "StellarX: BayanFund Decentralized Crowdfunding Platform",
        description: "A decentralized social impact platform that allows communities, nonprofits, and verified beneficiaries to raise funds with complete transparency. BayanFund leverages Stellar payments and Soroban smart contracts to track donations, manage verified funding needs, automate disbursements, and provide an immutable public audit trail for every contribution.",
        techStack: ["React", "Vite", "TypeScript", "Stellar SDK", "Soroban", "Tailwind CSS", "Node.js"],
        image: "/images/projects/project-3/placeholder.png",
        screenshots: [
          "/images/projects/project-3/screenshot-1.png",
          "/images/projects/project-3/screenshot-3.png",
          "/images/projects/project-3/screenshot-4.png",
          "/images/projects/project-3/screenshot-5.png"
        ],
        link: "#"
      }
    ]
  }
};

/**
 * Global Scroll to Hash Handler
 * Listens for location changes and scrolls to hash if present.
 * Works across all routes.
 */
const ScrollToHash: React.FC = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) return;

    const id = hash.replace("#", "");
    const element = document.getElementById(id);

    if (element) {
      const timer = setTimeout(() => {
        scrollToElement(element);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [pathname, hash]);

  return null;
};

const MainContent: React.FC<{ 
  portfolioData: PortfolioData; 
  showArrow: boolean; 
  canvasRef: React.RefObject<HTMLCanvasElement | null>; 
  heroImageRef: React.RefObject<HTMLImageElement | null>;
}> = ({ portfolioData, showArrow, canvasRef, heroImageRef }) => {
  return (
    <>
      <Hero 
        data={portfolioData.hero} 
        canvasRef={canvasRef} 
        heroImageRef={heroImageRef} 
        showArrow={showArrow} 
      />

      <div id="main-content">
        <Discovery data={portfolioData.discovery} />
        <Skills data={portfolioData.skills} />
        <Journey data={portfolioData.journey} />
        <Contact data={portfolioData.contact} socials={portfolioData.hero.socialLinks} />
      </div>
    </>
  );
};

const ProjectsPage: React.FC<{ portfolioData: PortfolioData }> = ({ portfolioData }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-28 pb-20 lg:pt-32 lg:pb-24 min-h-[100svh] lg:min-h-screen">
      <Projects data={portfolioData.projects} />
    </div>
  );
};

const AppContent: React.FC = () => {
  useInteractions();
  const [portfolioData, setPortfolioData] = useState<PortfolioData>(FALLBACK_DATA);
  const [activeSection, setActiveSection] = useState("home");
  const [showArrow, setShowArrow] = useState(true);
  const location = useLocation();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroImageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    fetch("/api/portfolio")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return res.json();
        } else {
          throw new Error("Received non-JSON response");
        }
      })
      .then((data) => {
        setPortfolioData(data);
      })
      .catch((err) => {
        console.warn("Using fallback data due to fetch error:", err);
      });
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    const heroEl = document.getElementById("home");
    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        if (reducedMotion) {
          setShowArrow((current) => (current ? false : current));
        } else {
          setShowArrow((current) => (current === entry.isIntersecting ? current : entry.isIntersecting));
        }
      },
      { threshold: 0.1 }
    );
    if (heroEl) heroObserver.observe(heroEl);

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const observeReveals = () => {
      document.querySelectorAll(".reveal").forEach((el) => {
        revealObserver.observe(el);
      });
    };

    const timer = setTimeout(observeReveals, 200);

    const sections = ["discovery", "journey", "contact"].map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const navObserver = new IntersectionObserver(
      (entries) => {
        const intersecting = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (intersecting.length > 0) {
          setActiveSection(intersecting[0].target.id);
        } else if (window.scrollY < 200) {
          setActiveSection("home");
        }
      },
      { rootMargin: "-38% 0px -50% 0px", threshold: [0.12, 0.28, 0.5] }
    );

    sections.forEach(s => navObserver.observe(s));

    return () => {
      if (heroEl) heroObserver.unobserve(heroEl);
      revealObserver.disconnect();
      navObserver.disconnect();
      clearTimeout(timer);
    };
  }, [portfolioData, location.pathname]);

  return (
    <div className="min-h-[100svh] lg:min-h-screen overflow-x-hidden font-sans text-white antialiased">
      <ScrollToHash />
      <div className="site-bg" aria-hidden="true">
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="bg-orb orb-3"></div>
        <div className="bg-orb orb-4"></div>
      </div>

      <Header activeSection={activeSection} canvasRef={canvasRef} heroImageRef={heroImageRef} />

      <main>
        <Routes>
          <Route path="/" element={
            <MainContent 
              portfolioData={portfolioData}
              showArrow={showArrow}
              canvasRef={canvasRef}
              heroImageRef={heroImageRef}
            />
          } />
          <Route path="/projects" element={<ProjectsPage portfolioData={portfolioData} />} />
        </Routes>
      </main>

      <Footer socials={portfolioData.hero.socialLinks} />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
