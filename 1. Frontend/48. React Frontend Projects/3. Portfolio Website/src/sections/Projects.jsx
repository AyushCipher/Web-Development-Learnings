// src/sections/Projects.jsx

import React from "react"; 
import { motion, useScroll, AnimatePresence } from "framer-motion"; 
// motion: for animating elements
// useScroll: to track scroll position
// AnimatePresence: to animate components when mounting/unmounting

// Importing project images (desktop & mobile versions)
import img1 from "../assets/img1.JPG";
import img2 from "../assets/img2.JPG";
import img3 from "../assets/img3.JPG";
import img4 from "../assets/img4.JPG";
import photo1 from "../assets/photo1.JPG";
import photo2 from "../assets/photo2.PNG";
import photo3 from "../assets/photo3.png";
import photo4 from "../assets/photo4.png";

const MH3 = motion.h3; 
// Shortcut for <motion.h3> for easier typing

// 🔹 Custom Hook: Detects if screen size matches "mobile"
const useIsMobile = (query = "(max-width: 639px)") => {
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== "undefined" && window.matchMedia(query).matches
    // Checks if the screen width is <= 639px (mobile breakpoint)
  );

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query); // Media query list
    const handler = (e) => setIsMobile(e.matches); // Update state when query changes
    mql.addEventListener?.("change", handler) || mql.addListener(handler); 
    // Add correct event listener (modern OR fallback)

    setIsMobile(mql.matches); // Initialize with current screen size
    return () =>
      mql.removeEventListener?.("change", handler) || mql.removeListener(handler); 
    // Cleanup event listener
  }, [query]);

  return isMobile; 
};

export default function Projects() {
  const isMobile = useIsMobile(); 
  // Detect if the user is on a mobile screen

  // 🔹 List of project objects (dynamic images based on screen size)
  const projects = React.useMemo(
    () => [
      {
        title: "AI Exam Procturing LMS",
        link: "https://new-ai-lms-frontend.onrender.com/",
        bgColor: "#1a1a1a",
        image: isMobile ? photo1 : img1, // Mobile vs desktop image
      },
      {
        title: "Smart Product Recommendation",
        link: "https://onecart-recommendation-frontend.onrender.com/",
        bgColor: "#3884d3",
        image: isMobile ? photo2 : img2,
      },
      {
        title: "Vingo Food Delivery",
        link: "https://vingo-8134.onrender.com/",
        bgColor: "#ff4d2d",
        image: isMobile ? photo3 : img3,
      },
      {
        title: "Smart Attendance System",
        link: "#",
        bgColor: "#2D9DFF",
        image: isMobile ? photo4 : img4,
      }
    ],
    [isMobile] 
    // Memoize to prevent recalculating unless screen size changes
  );

  const sceneRef = React.useRef(null); 
  // Reference to the whole projects section (used for scroll tracking)

  const { scrollYProgress } = useScroll({
    target: sceneRef, 
    offset: ["start start", "end end"], 
    // Scroll progress is 0 when section top hits viewport top and 1 at the end
  });

  const thresholds = projects.map((_, i) => (i + 1) / projects.length); 
  // Array of thresholds to switch between projects as user scrolls
  const [activeIndex, setActiveIndex] = React.useState(0); 
  // Keeps track of which project is currently active

  // 🔹 Update activeIndex as user scrolls
  React.useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (v) => {
      const idx = thresholds.findIndex((t) => v <= t); 
      // Find the first threshold that is greater than or equal to scroll progress
      setActiveIndex(idx === -1 ? thresholds.length - 1 : idx); 
      // If not found, show the last project
    });
    return () => unsubscribe(); 
    // Cleanup scroll listener
  }, [scrollYProgress, thresholds]);

  const activeProject = projects[activeIndex]; 
  // Currently displayed project

  return (
    <section
      id="projects"
      ref={sceneRef} 
      className="relative text-white"
      style={{
        height: `${100 * projects.length}vh`, 
        // Section height = 100vh per project (makes scroll-based transitions work) 
        backgroundColor: activeProject.bgColor, 
        // Background changes color based on active project
        transition: "background-color 400ms ease",
      }}
    >
      {/* Sticky container keeps content fixed while scrolling */}
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center">
        
        {/* Section Title */}
        <h2 className={`font-semibold z-10 text-center ${isMobile ? "text-2xl mt-1" : "text-3xl md:text-4xl mt-14 mb-25"}`}>
          My Work 
        </h2>

        {/* Main Project Display Area */}
        <div className={`relative w-full flex-1 flex items-center justify-center px-4 ${isMobile ? "my-4" : "md:my-8"}`}>
          {projects.map((project, idx) => (
            <div
              key={project.title}
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
                activeIndex === idx ? "opacity-100 z-20" : "opacity-0 z-0 sm:z-10"
              }`}
              style={{ width: "85%", maxWidth: "1200px" }}
            >
              {/* Animate project title when switching */}
              <AnimatePresence mode="wait">
                {activeIndex === idx && (
                  <MH3
                    key={project.title}
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 30 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`block text-center sm:absolute text-[clamp(1.75rem,5vw,4.5rem)] font-bangers italic font-semibold text-white/95 ${
                      isMobile ? "mb-4" : "sm:-top-20 md:-top-24 lg:-top-28"
                    } ${isMobile ? "left-0" : "sm:left-[20%] lg:left-[-5%]"}`}
                    style={{ zIndex: 5, textAlign: isMobile ? "center" : "left" }}
                  >
                    {project.title}
                  </MH3>
                )}
              </AnimatePresence>

              {/* Project Image Wrapper */}
              <div
                className={`relative w-full overflow-hidden shadow-lg sm:shadow-xl md:shadow-2xl rounded-lg sm:rounded-xl ${
                  isMobile ? "h-[65vh] mb-21" : "sm:h-[60vh] md:h-[5vh] lg:h-[70vh] mb-8 sm:mb-10 md:mb-12"
                }`}
                style={{ zIndex: 10, transition: "box-shadow 250ms ease", backgroundColor: activeProject.bgColor }}
              >
                {/* Project Image */}
                <img
                  src={project.image}
                  alt={project.title}
                  className={`w-full h-full drop-shadow-xl md:drop-shadow-2xl object-cover `}
                  style={{
                    position: "relative",
                    zIndex: 10,
                    filter: "drop-shadow(0 16px 40px rgba(0,0,0,0.65))",
                    transition: "filter 200ms ease",
                  }}
                  loading="lazy"
                />
                {/* Subtle gradient overlay for better readability */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    zIndex: 11,
                    background: "linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0) 40%)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* View Project Button */}
        <div className={`absolute z-20 left-1/2 -translate-x-1/2 ${isMobile ? "bottom-20" : "sm:bottom-20 md:bottom-24 lg:bottom-20"}`}>
          <a
            href={activeProject?.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold rounded-lg bg-white text-black hover:bg-gray-200 transition-all"
            aria-label={`View ${activeProject?.title}`}
          >
            View Project
          </a>
        </div>
      </div>
    </section>
  );
}
