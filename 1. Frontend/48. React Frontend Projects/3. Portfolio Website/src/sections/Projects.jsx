// src/sections/Projects.jsx

import React from "react";
import { motion, useScroll, AnimatePresence } from "framer-motion";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";

// Importing screenshots for all 6 projects (Desktop, Tablet, Mobile)
import hirehavenDesktop from "../assets/projects/hirehaven/desktop.png";
import hirehavenTablet from "../assets/projects/hirehaven/tablet.png";
import hirehavenMobile from "../assets/projects/hirehaven/mobile.png";

import cortexDesktop from "../assets/projects/cortex/desktop.png";
import cortexTablet from "../assets/projects/cortex/tablet.png";
import cortexMobile from "../assets/projects/cortex/mobile.png";

import prReviewerDesktop from "../assets/projects/pr-reviewer/desktop.png";
import prReviewerTablet from "../assets/projects/pr-reviewer/tablet.png";
import prReviewerMobile from "../assets/projects/pr-reviewer/mobile.png";

import onecartDesktop from "../assets/projects/onecart/desktop.png";
import onecartTablet from "../assets/projects/onecart/tablet.png";
import onecartMobile from "../assets/projects/onecart/mobile.png";

import patchpilotDesktop from "../assets/projects/patchpilot/desktop.png";
import patchpilotTablet from "../assets/projects/patchpilot/tablet.png";
import patchpilotMobile from "../assets/projects/patchpilot/mobile.png";

import tradingDesktop from "../assets/projects/trading/desktop.png";
import tradingTablet from "../assets/projects/trading/tablet.png";
import tradingMobile from "../assets/projects/trading/mobile.png";

const MH3 = motion.h3;

// Hook to automatically detect current window device mode
const useDeviceType = () => {
  const [deviceType, setDeviceType] = React.useState("desktop");

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const updateDevice = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setDeviceType("mobile");
      } else if (width < 1024) {
        setDeviceType("tablet");
      } else {
        setDeviceType("desktop");
      }
    };

    updateDevice();
    window.addEventListener("resize", updateDevice);
    return () => window.removeEventListener("resize", updateDevice);
  }, []);

  return deviceType;
};

export default function Projects() {
  const detectedDevice = useDeviceType();
  const isMobileScreen = detectedDevice === "mobile";

  // List of 6 Showcase Projects
  const projects = React.useMemo(
    () => [
      {
        title: "HireHeaven",
        tagline: "AI-Powered Microservices Job Portal & Career Platform",
        description:
          "Production-grade job ecosystem built on microservices with Kafka event streaming, Redis rate limiting/caching, AI resume ATS matching, and Razorpay billing.",
        techStack: ["Next.js", "Node.js", "Kafka", "Redis", "Docker", "Razorpay", "Zod"],
        github: "https://github.com/AyushCipher/HireHeaven-Job-Portal",
        link: "https://ai-microservices-job-portal-fronten.vercel.app",
        bgColor: "#141726",
        screenshots: {
          desktop: hirehavenDesktop,
          tablet: hirehavenTablet,
          mobile: hirehavenMobile,
        },
      },
      {
        title: "CORTEX AI",
        tagline: "Multi-Agent GenAI Workspace & Hybrid RAG Engine",
        description:
          "Gateway-driven multi-service AI workspace with hybrid vector (Qdrant) + BM25 search, Reciprocal Rank Fusion reranking, SSE token streaming, and credit billing.",
        techStack: ["React 19", "Node.js", "LangChain", "Qdrant", "Redis", "Docker", "SSE"],
        github: "https://github.com/AyushCipher/CORTEX-AI",
        link: "https://github.com/AyushCipher/CORTEX-AI",
        bgColor: "#0d1b2a",
        screenshots: {
          desktop: cortexDesktop,
          tablet: cortexTablet,
          mobile: cortexMobile,
        },
      },
      {
        title: "PR Risk Reviewer",
        tagline: "Autonomous Pull Request Risk Auditor & Code Review Copilot",
        description:
          "Enterprise copilot flagging risky PRs before merge using deterministic AST rules, codebase RAG context, and Gemini Function Calling streaming via real-time SSE.",
        techStack: ["FastAPI", "Python 3.11", "Gemini AI", "Celery", "PostgreSQL", "Redis", "Docker"],
        github: "https://github.com/AyushCipher/PR-Risk-Reviewer",
        link: "https://github.com/AyushCipher/PR-Risk-Reviewer",
        bgColor: "#13211e",
        screenshots: {
          desktop: prReviewerDesktop,
          tablet: prReviewerTablet,
          mobile: prReviewerMobile,
        },
      },
      {
        title: "OneCart",
        tagline: "E-Commerce Platform with Smart Multi-Signal Recommendation Engine",
        description:
          "Full-stack store featuring content-based, collaborative, popularity, and category-driven recommendations with real-time user telemetry and admin console.",
        techStack: ["React 19", "Node.js", "Express", "MongoDB Atlas", "Vite", "Tailwind CSS"],
        github: "https://github.com/AyushCipher/OneCart-Recommendation-Engine",
        link: "https://onecart-recommendation-frontend.onrender.com/",
        bgColor: "#1e1b4b",
        screenshots: {
          desktop: onecartDesktop,
          tablet: onecartTablet,
          mobile: onecartMobile,
        },
      },
      {
        title: "PatchPilot",
        tagline: "Autonomous Code-Review and Self-Healing Bug Fixing Agent",
        description:
          "Single-agent ReAct loop that autonomously investigates failing pytest suites, generates diagnostic hypotheses, applies fixes, and validates patches against an eval harness.",
        techStack: ["FastAPI", "Python", "WebSockets", "React", "Pytest", "Groq LLM", "Docker"],
        github: "https://github.com/AyushCipher/Patch-Pilot",
        link: "https://github.com/AyushCipher/Patch-Pilot",
        bgColor: "#26131d",
        screenshots: {
          desktop: patchpilotDesktop,
          tablet: patchpilotTablet,
          mobile: patchpilotMobile,
        },
      },
      {
        title: "Trading App",
        tagline: "Real-Time Stock Trading Simulation & Live Market Chart Companion",
        description:
          "Fintech trading simulation combining mobile trading flows, email OTP auth, biometric security, and a dedicated Lightweight Charts dashboard with live Socket.IO feeds.",
        techStack: ["React Native", "React", "Socket.IO", "Lightweight Charts", "Node.js", "MongoDB"],
        github: "https://github.com/AyushCipher/Trading-App",
        link: "https://github.com/AyushCipher/Trading-App",
        bgColor: "#17202a",
        screenshots: {
          desktop: tradingDesktop,
          tablet: tradingTablet,
          mobile: tradingMobile,
        },
      },
    ],
    []
  );

  const sceneRef = React.useRef(null);

  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start start", "end end"],
  });

  const thresholds = projects.map((_, i) => (i + 1) / projects.length);
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (v) => {
      const idx = thresholds.findIndex((t) => v <= t);
      setActiveIndex(idx === -1 ? thresholds.length - 1 : idx);
    });
    return () => unsubscribe();
  }, [scrollYProgress, thresholds]);

  const activeProject = projects[activeIndex];

  return (
    <section
      id="projects"
      ref={sceneRef}
      className="relative text-white"
      style={{
        height: `${100 * projects.length}vh`,
        backgroundColor: activeProject.bgColor,
        transition: "background-color 500ms ease",
      }}
    >
      {/* Sticky viewport container */}
      <div className="sticky top-0 h-screen flex flex-col items-center justify-between py-6 sm:py-8 md:py-10 px-4 sm:px-6 md:px-8 overflow-hidden">
        
        {/* Main Display Area */}
        <div className="relative w-full flex-1 flex items-center justify-center my-auto max-w-7xl">
          {projects.map((project, idx) => {
            const activeScreenshot = project.screenshots[detectedDevice] || project.screenshots.desktop;

            // Frame dimensions: responsive across screen sizes
            let containerAspect = "w-full max-w-6xl h-[64vh] sm:h-[68vh] md:h-[72vh]";
            if (detectedDevice === "mobile") {
              containerAspect = "w-full max-w-sm h-[64vh] sm:h-[68vh]";
            } else if (detectedDevice === "tablet") {
              containerAspect = "w-full max-w-3xl h-[64vh] sm:h-[68vh]";
            }

            return (
              <div
                key={project.title}
                className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ${
                  activeIndex === idx ? "opacity-100 z-20 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                {/* Project Header Info */}
                <div className="text-center mb-3 sm:mb-4 px-4 max-w-3xl">
                  <AnimatePresence mode="wait">
                    {activeIndex === idx && (
                      <MH3
                        key={project.title}
                        initial={{ opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 16 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-1.5"
                      >
                        {project.title}
                      </MH3>
                    )}
                  </AnimatePresence>
                  <p className="text-xs sm:text-sm text-white/80 line-clamp-1 max-w-xl mx-auto">
                    {project.tagline}
                  </p>

                  {/* Tech stack badges */}
                  <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-2.5">
                    {project.techStack.slice(0, isMobileScreen ? 4 : 7).map((tech) => (
                      <span
                        key={tech}
                        className="px-2.5 py-0.5 text-[11px] sm:text-xs rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-white/90"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Screenshot Frame Container — Clean edge-to-edge rendering without letterboxing */}
                <div
                  className={`relative ${containerAspect} flex items-center justify-center rounded-xl sm:rounded-2xl border border-white/10 shadow-2xl transition-all duration-300 overflow-hidden bg-black/40`}
                  style={{
                    boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.8)",
                  }}
                >
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={`${project.title}-${detectedDevice}`}
                      src={activeScreenshot}
                      alt={`${project.title} preview`}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="w-full h-full object-cover object-top"
                      loading="lazy"
                    />
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons: GitHub Repo + Live Demo */}
        <div className="z-30 flex items-center gap-3 sm:gap-4 flex-shrink-0 pt-3 pb-2">
          {activeProject?.github && (
            <a
              href={activeProject.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all duration-200 hover:scale-105"
              aria-label={`View ${activeProject?.title} GitHub repository`}
            >
              <FaGithub className="text-sm sm:text-base" />
              <span>GitHub</span>
            </a>
          )}
          {activeProject?.link && (
            <a
              href={activeProject.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-lg bg-white text-black hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              aria-label={`View ${activeProject?.title} live project`}
            >
              <span>Live Demo</span>
              <FaExternalLinkAlt className="text-xs" />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
