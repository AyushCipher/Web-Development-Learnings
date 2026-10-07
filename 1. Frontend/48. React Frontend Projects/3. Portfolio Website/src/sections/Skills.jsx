import { FaReact, FaJsSquare, FaNodeJs, FaAws } from 'react-icons/fa';
import {
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss,
  SiPython,
  SiDocker,
  SiMongodb,
  SiExpress,
  SiFlask,
  SiRedis,
  SiRabbitmq,
  SiApachekafka,
  SiMysql,
  SiFastapi,
  SiPostgresql,
  SiLangchain,
  SiPytorch,
  SiTensorflow,
  SiScikitlearn,
  SiOpencv,
  SiHuggingface,
  SiOpenai,
  SiNumpy,
  SiPandas,
  SiOllama,
  SiGit,
  SiKubernetes
} from 'react-icons/si';
import { TbBrain, TbRobot, TbVectorTriangle, TbDatabase, TbSparkles } from 'react-icons/tb';
import { motion, useMotionValue } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export default function Skills() {
  // Row 1: AI / Machine Learning, LLMs & Agentic Systems
  const aiMlSkills = [
    { icon: <SiPython />, name: "Python" },
    { icon: <SiPytorch />, name: "PyTorch" },
    { icon: <SiTensorflow />, name: "TensorFlow" },
    { icon: <TbBrain />, name: "AI Agents" },
    { icon: <SiLangchain />, name: "LangChain" },
    { icon: <TbRobot />, name: "LangGraph" },
    { icon: <TbVectorTriangle />, name: "RAG Pipelines" },
    { icon: <SiOpenai />, name: "LLM Fine-Tuning" },
    { icon: <TbSparkles />, name: "Prompt Eng & Eval" },
    { icon: <SiHuggingface />, name: "Hugging Face" },
    { icon: <TbDatabase />, name: "Vector DB (Qdrant)" },
    { icon: <SiOllama />, name: "Ollama" },
    { icon: <SiScikitlearn />, name: "Scikit-Learn" },
    { icon: <SiNumpy />, name: "NumPy" },
    { icon: <SiPandas />, name: "Pandas" },
    { icon: <SiOpencv />, name: "OpenCV" },
  ];

  // Row 2: Full-Stack Systems, Distributed Architecture & Cloud
  const fullstackSkills = [
    { icon: <SiFastapi />, name: "FastAPI" },
    { icon: <FaReact />, name: "React.js" },
    { icon: <SiNextdotjs />, name: "Next.js" },
    { icon: <SiTypescript />, name: "TypeScript" },
    { icon: <FaJsSquare />, name: "JavaScript" },
    { icon: <FaNodeJs />, name: "Node.js" },
    { icon: <SiExpress />, name: "Express.js" },
    { icon: <SiPostgresql />, name: "PostgreSQL" },
    { icon: <SiMongodb />, name: "MongoDB" },
    { icon: <SiRedis />, name: "Redis" },
    { icon: <SiApachekafka />, name: "Kafka" },
    { icon: <SiRabbitmq />, name: "RabbitMQ" },
    { icon: <SiDocker />, name: "Docker" },
    { icon: <SiKubernetes />, name: "Kubernetes" },
    { icon: <FaAws />, name: "AWS" },
    { icon: <SiTailwindcss />, name: "Tailwind CSS" },
    { icon: <SiGit />, name: "Git & GitHub" },
  ];

  const repeatedAiMl = [...aiMlSkills, ...aiMlSkills];
  const repeatedFullstack = [...fullstackSkills, ...fullstackSkills];

  const [dir, setDir] = useState(-1);
  const [active, setActive] = useState(false);
  const sectionRef = useRef(null);
  const track1Ref = useRef(null);
  const track2Ref = useRef(null);
  const touchY = useRef(null);
  const x1 = useMotionValue(0);
  const x2 = useMotionValue(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        setActive(entry.isIntersecting && entry.intersectionRatio > 0.05);
      },
      { threshold: [0.05] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;

    const onWheel = (e) => setDir(e.deltaY > 0 ? -1 : 1);
    const onTouchStart = (e) => (touchY.current = e.touches[0].clientY);
    const onTouchMove = (e) => {
      if (touchY.current == null) return;
      const delta = e.touches[0].clientY - touchY.current;
      setDir(delta > 0 ? 1 : -1);
      touchY.current = e.touches[0].clientY;
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [active]);

  useEffect(() => {
    let id;
    let last = performance.now();
    const SPEED = 65;

    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;

      // Track 1 moves
      let next1 = x1.get() + SPEED * dir * dt;
      const loop1 = track1Ref.current?.scrollWidth / 2 || 0;
      if (loop1) {
        if (next1 <= -loop1) next1 += loop1;
        if (next1 >= 0) next1 -= loop1;
      }
      x1.set(next1);

      // Track 2 moves in opposing direction for rich parallax
      let next2 = x2.get() - SPEED * dir * dt;
      const loop2 = track2Ref.current?.scrollWidth / 2 || 0;
      if (loop2) {
        if (next2 <= -loop2) next2 += loop2;
        if (next2 >= 0) next2 -= loop2;
      }
      x2.set(next2);

      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [dir, x1, x2]);

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="w-full py-16 flex flex-col items-center justify-center relative bg-black text-white overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-[350px] h-[350px] rounded-full bg-gradient-to-r from-[#302b63] via-[#00bf8f] to-[#1cd8d2] opacity-20 blur-[140px] animate-pulse" />
        <div className="absolute bottom-1/4 right-0 w-[350px] h-[350px] rounded-full bg-gradient-to-r from-[#302b63] via-[#00bf8f] to-[#1cd8d2] opacity-20 blur-[140px] animate-pulse delay-500" />
      </div>

      <motion.h2
        className="text-4xl mt-2 sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1cd8d2] via-[#00bf8f] to-[#302b63] z-10 leading-tight pb-1"
        initial={{ opacity: 0, y: -25 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        My Skills
      </motion.h2>

      <motion.p
        className="mt-2 mb-10 text-white/90 text-sm sm:text-base max-w-xl text-center px-4 z-10"
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        Autonomous AI Agents · LLMs & ML Workflows · Distributed Full-Stack Architecture
      </motion.p>

      {/* Row 1: AI / Machine Learning & Agentic Systems */}
      <div className="w-full mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#1cd8d2]/10 border border-[#1cd8d2]/30 text-[#1cd8d2] tracking-wider uppercase">
            AI / ML, LLMs & Agentic Systems
          </span>
        </div>
        <div className="relative w-full overflow-hidden py-2">
          <motion.div
            ref={track1Ref}
            className="flex gap-8 sm:gap-10 text-5xl sm:text-6xl text-[#1cd8d2]"
            style={{ x: x1, whiteSpace: "nowrap", willChange: "transform" }}
          >
            {repeatedAiMl.map((s, i) => (
              <div
                key={`aiml-${i}`}
                className="flex flex-col items-center gap-2 min-w-[110px] sm:min-w-[130px] group cursor-default"
                aria-label={s.name}
                title={s.name}
              >
                <span className="group-hover:scale-125 transition-transform duration-300 drop-shadow-[0_0_12px_rgba(28,216,210,0.4)]">
                  {s.icon}
                </span>
                <p className="text-xs sm:text-sm text-gray-300 font-medium whitespace-nowrap">
                  {s.name}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Row 2: Full-Stack Systems, Distributed Architecture & Cloud */}
      <div className="w-full">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#00bf8f]/10 border border-[#00bf8f]/30 text-[#00bf8f] tracking-wider uppercase">
            Full-Stack Systems & Distributed Cloud
          </span>
        </div>
        <div className="relative w-full overflow-hidden py-2">
          <motion.div
            ref={track2Ref}
            className="flex gap-8 sm:gap-10 text-5xl sm:text-6xl text-[#00bf8f]"
            style={{ x: x2, whiteSpace: "nowrap", willChange: "transform" }}
          >
            {repeatedFullstack.map((s, i) => (
              <div
                key={`fullstack-${i}`}
                className="flex flex-col items-center gap-2 min-w-[110px] sm:min-w-[130px] group cursor-default"
                aria-label={s.name}
                title={s.name}
              >
                <span className="group-hover:scale-125 transition-transform duration-300 drop-shadow-[0_0_12px_rgba(0,191,143,0.4)]">
                  {s.icon}
                </span>
                <p className="text-xs sm:text-sm text-gray-300 font-medium whitespace-nowrap">
                  {s.name}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}