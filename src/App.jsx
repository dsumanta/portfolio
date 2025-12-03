import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Float, Sparkles, MeshDistortMaterial, Environment, PerspectiveCamera } from '@react-three/drei';
import { motion, useScroll, useTransform, useSpring, useVelocity, AnimatePresence } from 'framer-motion';
import { Send, Github, Linkedin, Code, Mail, Phone, Download, ExternalLink, ChevronDown, Zap, Star, X } from 'lucide-react';
import * as THREE from 'three';
import { getKey } from './contstants';
import { code, source } from 'framer-motion/client';

// ==================== INTERACTIVE PARTICLES WITH CURSOR ATTRACTION ====================
function InteractiveParticles() {
  const pointsRef = useRef();
  const { mouse, viewport } = useThree();
  const particleCount = 5000;
  const mousePos = useRef(new THREE.Vector3());
  
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const velocity = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    const radius = Math.random() * 50;
    const spinAngle = radius * 5;
    const branchAngle = (i % 3) * ((2 * Math.PI) / 3);
    
    positions[i * 3] = Math.cos(branchAngle + spinAngle) * radius + (Math.random() - 0.5) * 3;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = Math.sin(branchAngle + spinAngle) * radius + (Math.random() - 0.5) * 3;
    
    velocity[i * 3] = (Math.random() - 0.5) * 0.02;
    velocity[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
    velocity[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    
    const mixedColor = new THREE.Color();
    mixedColor.lerpColors(
      new THREE.Color('#8b5cf6'),
      new THREE.Color('#06b6d4'),
      radius / 50
    );
    
    colors[i * 3] = mixedColor.r;
    colors[i * 3 + 1] = mixedColor.g;
    colors[i * 3 + 2] = mixedColor.b;
    
    sizes[i] = Math.random() * 0.5;
  }
  
  useFrame((state) => {
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array;
      
      mousePos.current.set(
        (mouse.x * viewport.width) / 2,
        (mouse.y * viewport.height) / 2,
        0
      );
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        const dx = mousePos.current.x - positions[i3];
        const dy = mousePos.current.y - positions[i3 + 1];
        const dz = mousePos.current.z - positions[i3 + 2];
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        if (distance < 5) {
          const force = (5 - distance) * 0.01;
          velocity[i3] += (dx / distance) * force;
          velocity[i3 + 1] += (dy / distance) * force;
          velocity[i3 + 2] += (dz / distance) * force;
        }
        
        positions[i3] += velocity[i3];
        positions[i3 + 1] += velocity[i3 + 1];
        positions[i3 + 2] += velocity[i3 + 2];
        
        velocity[i3] *= 0.98;
        velocity[i3 + 1] *= 0.98;
        velocity[i3 + 2] *= 0.98;
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={particleCount} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={particleCount} array={sizes} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial 
        size={0.15} 
        vertexColors 
        transparent 
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ==================== MORPHING 3D SHAPES ====================
function MorphingShape({ position, color, scrollProgress }) {
  const meshRef = useRef();
  const { mouse } = useThree();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.5 + mouse.y * 0.5;
      meshRef.current.rotation.y += 0.01 + mouse.x * 0.01;
      meshRef.current.scale.setScalar(1 + Math.sin(scrollProgress * Math.PI * 2) * 0.3);
    }
  });
  
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} position={position}>
        <icosahedronGeometry args={[1.2, 1]} />
        <MeshDistortMaterial 
          color={color}
          attach="material"
          distort={0.6}
          speed={2}
          roughness={0.2}
          metalness={0.8}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </mesh>
    </Float>
  );
}

// ==================== GLOWING RINGS WITH SCROLL SYNC ====================
function GlowingRings({ scrollProgress }) {
  return (
    <>
      {[...Array(3)].map((_, i) => (
        <Float key={i} speed={1 + i} rotationIntensity={0.5}>
          <mesh 
            position={[0, 0, -8 - i * 2]} 
            rotation={[Math.PI / 2, 0, 0]}
            scale={1 + scrollProgress * 0.5}
          >
            <torusGeometry args={[3 + i * 1.5, 0.1, 16, 100]} />
            <meshStandardMaterial
              color={['#8b5cf6', '#ec4899', '#06b6d4'][i]}
              emissive={['#8b5cf6', '#ec4899', '#06b6d4'][i]}
              emissiveIntensity={0.5 + scrollProgress * 0.3}
              transparent
              opacity={0.4 - i * 0.1}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

// ==================== ENHANCED 3D SCENE ====================
function Scene({ scrollProgress }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 15]} />
      <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 2} />
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#8b5cf6" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06b6d4" />
      <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={1} color="#ec4899" />
      
      <Suspense fallback={null}>
        <InteractiveParticles />
        <Sparkles count={100} scale={[20, 20, 20]} size={3} speed={0.3} color="#ffffff" />
        <GlowingRings scrollProgress={scrollProgress} />
        <MorphingShape position={[-4, 2, -5]} color="#8b5cf6" scrollProgress={scrollProgress} />
        <MorphingShape position={[4, -2, -6]} color="#ec4899" scrollProgress={scrollProgress} />
        <MorphingShape position={[0, 1, -7]} color="#06b6d4" scrollProgress={scrollProgress} />
        <Environment preset="night" />
      </Suspense>
    </>
  );
}

// ==================== MAGNETIC BUTTON ====================
function MagneticButton({ children, href, className, onClick }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef();
  
  const handleMouseMove = (e) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setPosition({ x: x * 0.3, y: y * 0.3 });
  };
  
  const handleMouseLeave = () => setPosition({ x: 0, y: 0 });
  
  const Component = href ? motion.a : motion.button;
  
  return (
    <Component
      ref={buttonRef}
      href={href}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={className}
    >
      {children}
    </Component>
  );
}

// ==================== ANIMATED COUNTER ====================
function AnimatedCounter({ end, duration = 2 }) {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );
    
    if (countRef.current) observer.observe(countRef.current);
    return () => observer.disconnect();
  }, []);
  
  useEffect(() => {
    if (!isVisible) return;
    
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / (duration * 1000);
      
      if (progress < 1) {
        setCount(Math.floor(end * progress));
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);
  
  return <span ref={countRef}>{count}</span>;
}

// ==================== IMPROVED TYPEWRITER EFFECT ====================
function TypewriterText({ text, delay = 0, speed = 80 }) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (currentIndex < text.length) {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }
    }, delay + currentIndex * speed);

    return () => clearTimeout(timeout);
  }, [currentIndex, text, delay, speed]);

  return (
    <span>
      {displayText}
      {currentIndex < text.length && (
        <motion.span
          animate={{ opacity: showCursor ? 1 : 0 }}
          transition={{ duration: 0.1 }}
          className="text-pink-400"
        >
          |
        </motion.span>
      )}
    </span>
  );
}

// ==================== 3D FLIP CARD ====================
function FlipCard({ project, index }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect if device is mobile/touch device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle touch start - flips immediately on any touch (mobile only)
  const handleTouchStart = (e) => {
    if (isMobile) {
      e.preventDefault(); // Prevent onClick from firing after touch
      setIsFlipped(!isFlipped);
    }
  };

  // Handle click (desktop only)
  const handleClick = () => {
    if (!isMobile) {
      setIsFlipped(!isFlipped);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ delay: index * 0.15, type: 'spring', stiffness: 100 }}
        className="relative h-[400px]"
        style={{ perspective: '1000px' }}
      >
        <motion.div
          className="relative w-full h-full cursor-pointer"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
          style={{ transformStyle: 'preserve-3d' }}
          // Desktop: hover to flip
          onHoverStart={() => !isMobile && setIsFlipped(true)}
          onHoverEnd={() => !isMobile && setIsFlipped(false)}
          // Mobile: touch to flip (prevents double firing)
          onTouchStart={handleTouchStart}
          // Desktop fallback: click
          onClick={handleClick}
          whileHover={!isMobile ? { scale: 1.05 } : {}}
          whileTap={isMobile ? { scale: 0.98 } : {}}
        >
          {/* FRONT FACE */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-purple-500/30 shadow-xl overflow-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-20`} />
            
            <div className="relative z-10 h-full flex flex-col">
              <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">{project.icon}</div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 text-purple-200">
                {project.title}
              </h3>
              <p className="text-xs sm:text-sm text-purple-400 mb-3 sm:mb-4 font-semibold">{project.period}</p>
              <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6 leading-relaxed flex-grow">
                {project.description.substring(0, 100)}...
              </p>
              
              <div className="flex flex-wrap gap-2">
                {project.tech.slice(0, 3).map((tech) => (
                  <span 
                    key={tech}
                    className="bg-purple-500/30 px-2 sm:px-3 py-1 rounded-full text-xs text-purple-200 border border-purple-400/30 font-medium"
                  >
                    {tech}
                  </span>
                ))}
                <span className="text-purple-300 text-xs flex items-center">+{project.tech.length - 3} more</span>
              </div>
              
              {/* Show tap instruction only on mobile */}
              {isMobile && (
                <div className="mt-4 text-center">
                  <span className="text-xs text-purple-400/70 animate-pulse">
                    👆 Touch to flip
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* BACK FACE */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-cyan-900/50 to-purple-900/50 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-cyan-500/30 shadow-xl overflow-hidden"
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-cyan-200">
                  Tech Stack
                </h3>
                <div className="flex flex-wrap gap-2 mb-4 sm:mb-6 max-h-[200px] overflow-y-auto">
                  {project.tech.map((tech) => (
                    <motion.span
                      key={tech}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: Math.random() * 0.3 }}
                      className="bg-cyan-500/30 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm text-cyan-100 border border-cyan-400/30 font-medium"
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsModalOpen(true);
                    setIsFlipped(false);
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                  }}
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                    setIsModalOpen(true);
                    setIsFlipped(false);
                  }}
                  className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 hover:from-cyan-700 hover:to-purple-700 transition-all"
                >
                  View Full Details <ExternalLink size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
                
                {/* Show flip back button only on mobile */}
                {isMobile && (
                  <div className="text-center">
                    <span className="text-xs text-cyan-400/70 animate-pulse">
                      👆 Touch again to flip back
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* PROJECT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4 sm:p-6"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-12 border-2 border-purple-500/50 max-w-3xl w-full max-h-[90vh] overflow-y-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-purple-500/20 hover:bg-purple-500/40 rounded-full transition-colors"
              >
                <X size={24} />
              </button>

              <div className="text-5xl sm:text-6xl mb-4 sm:mb-6">{project.icon}</div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                {project.title}
              </h2>
              <p className="text-purple-400 font-semibold mb-4 sm:mb-6">{project.period}</p>
              <p className="text-lg sm:text-xl text-gray-200 leading-relaxed mb-6 sm:mb-8">{project.description}</p>
              
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-purple-300">Technologies Used</h3>
              <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
                {project.tech.map((tech) => (
                  <span 
                    key={tech}
                    className="bg-purple-500/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm text-purple-100 border border-purple-400/30 font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <a
                  href={project.sourceCode}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  <Github size={18} className="sm:w-[20px] sm:h-[20px]" /> View Code
                </a>
                <a
                  href={project.livedemo}
                  className="flex-1 border-2 border-purple-400 hover:bg-purple-400/20 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all"
                >
                  <ExternalLink size={18} className="sm:w-[20px] sm:h-[20px]" /> Live Demo
                </a>
              </div>
            </motion.div>
            
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}



// ==================== MAIN PORTFOLIO ====================
export default function Portfolio() {
  const [activeSection, setActiveSection] = useState('hero');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -100]);

  const scrollVelocity = useVelocity(scrollYProgress);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400
  });
  const skewY = useTransform(smoothVelocity, [-0.5, 0.5], ['5deg', '-5deg']);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'about', 'stats', 'skills', 'experience', 'projects', 'contact'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setFormStatus('sending');
  
  const formDataToSend = {
    access_key: getKey('web3formAccessKey'), 
    name: formData.name,
    email: formData.email,
    message: formData.message,
    subject: `New Portfolio Message from ${formData.name}`,
    from_name: formData.name,
    replyto: formData.email,
  };
  
  try {
    const response = await fetch(getKey('web3formAPIURL'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formDataToSend)
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Email sent successfully!');
      setFormStatus('success');
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setFormStatus(''), 3000);
    } else {
      console.error('Failed to send:', data);
      setFormStatus('error');
      setTimeout(() => setFormStatus(''), 3000);
    }
  } catch (error) {
    console.error('Error:', error);
    setFormStatus('error');
    setTimeout(() => setFormStatus(''), 3000);
  }
};


  const skills = {
    languages: ['JavaScript', 'TypeScript', 'Bash', 'SQL'],
    frontend: ['React.js', 'Redux Toolkit', 'Tailwind CSS', 'Shadcn', 'Material UI', 'Framer Motion'],
    backend: ['Node.js', 'Express.js', 'NestJS', 'GraphQL', 'Prisma ORM', 'REST APIs'],
    database: ['PostgreSQL', 'MongoDB', 'MySQL', 'Redis'],
    devops: ['Jenkins', 'Docker', 'Kubernetes', 'Terraform', 'AWS', 'ArgoCD']
  };

  const projects = [
    {
      title: 'CICD Automation Pipeline',
      period: 'Nov 2025',
      description: 'Enterprise-grade automation infrastructure on AWS with VPC, EC2, EKS cluster orchestration. Implemented GitOps workflows with ArgoCD and Jenkins CI/CD pipelines reducing deployment time by 70%.',
      tech: ['AWS', 'Terraform', 'Jenkins', 'ArgoCD', 'Docker', 'Kubernetes', 'GitHub Actions'],
      icon: '🚀',
      gradient: 'from-purple-500 to-pink-500',
      sourceCode: 'https://github.com/dsumanta/CICDAutomation',
      livedemo:'https://www.figma.com/design/VRx44fZwg18HtpwX1ARkdv/AWS-Diagrams--Community-?node-id=36350-170&m=dev&t=CVVxmv0UMJjhBAsf-1'
    },
    {
      title: 'Nuraflow PM',
      period: 'Aug 2024 - Feb 2025',
      description: 'AI-powered project management platform with GraphQL microservices architecture. RBAC implementation elevated security by 15% and reduced manual workflows by 60%.',
      tech: ['NestJS', 'GraphQL', 'Prisma', 'PostgreSQL', 'React', 'Docker', 'Redis'],
      icon: '⚡',
      gradient: 'from-blue-500 to-cyan-500',
      sourceCode: 'https://github.com/dsumanta/AI-Project-Management',
      livedemo: 'https://nuraflow.in'
    },
    {
      title: 'Dcart E-commerce Platform',
      period: 'Mar 2024 - June 2024',
      description: 'High-performance e-commerce solution serving 1.2k MAU with 200 SKUs. Stripe webhook integration achieved 99.5% payment capture rate and reduced cart abandonment by 17%.',
      tech: ['React', 'Node.js', 'MongoDB', 'Stripe', 'JWT', 'Docker', 'AWS S3'],
      icon: '🛍️',
      gradient: 'from-green-500 to-emerald-500',
      sourceCode: 'https://github.com/dsumanta/Ecommerce-Website',
      livedemo: 'https://shop.nuraflow.in'
    }
  ];

  const experience = [
    {
      company: 'Kfin Technologies Limited',
      role: 'Software Engineer',
      period: 'June 2024 - Present',
      location: 'Hyderabad, India',
      highlights: [
        'Developed an ARN Link Generation application that reducing manual creation time by 40%',
        'Developed an interactive Statement of Account which provides a visual summary of transactions and capital gains, exort the report in PDF format',
        'Develop new features and optimize performance of existing Distributor portal of AMC including KFinKar web applications'
      ],
      icon: '💼'
    },
    {
      company: 'Kfin Technologies Limited',
      role: 'Software Engineer Intern',
      period: 'Nov 2023 - June 2024',
      location: 'Remote, India',
      highlights: [
        'Revamped investor portal dashboard/login page reduce login errors by 35% and increased successful login sessions',
        'Resolved the issuees of investor portal increase the performance by 25% and improved user experince by 30%',
      ],
      icon: '🎯'
    }
  ];

  const stats = [
    { label: 'Years Experience', value: 2, suffix: '+' },
    { label: 'Projects Delivered', value: 6, suffix: '+' },
    { label: 'Technologies Worked on', value: 12, suffix: '+' },
    { label: 'Performance Improved', value: 40, suffix: '%' }
  ];

  return (
    <div className="bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white min-h-screen overflow-x-hidden">
      {/* Animated Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 origin-left z-50"
        style={{ scaleX }}
      />

      {/* Enhanced Navigation */}
        <motion.nav 
  initial={{ y: -100 }}
  animate={{ y: 0 }}
  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
  className="fixed top-0 w-full bg-slate-950/40 backdrop-blur-xl z-40 border-b border-purple-500/20"
>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
    {/* Logo */}
    <motion.h1 
      className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent shrink-0"
      whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
      transition={{ duration: 0.5 }}
    >
      &lt;SD /&gt;
    </motion.h1>

    {/* Desktop Menu */}
    <div className="hidden lg:flex gap-8 items-center">
      {['About', 'Skills', 'Experience', 'Projects', 'Contact'].map((item) => (
        <motion.a
          key={item}
          href={`#${item.toLowerCase()}`}
          className={`relative transition-colors font-medium ${
            activeSection === item.toLowerCase() 
              ? 'text-purple-400' 
              : 'text-gray-300 hover:text-white'
          }`}
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          {item}
          {activeSection === item.toLowerCase() && (
            <motion.div
              layoutId="activeSection"
              className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
        </motion.a>
      ))}
      <MagneticButton
        href="/resume.pdf"
        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-full font-semibold text-sm shadow-lg shadow-purple-500/50"
      >
        <Download size={16} /> Resume
      </MagneticButton>
    </div>

    {/* Mobile Hamburger Button */}
    <motion.button
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      className="lg:hidden p-2 text-purple-400 hover:text-purple-300 transition-colors"
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence mode="wait">
        {isMobileMenuOpen ? (
          <motion.div
            key="close"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <X size={28} />
          </motion.div>
        ) : (
          <motion.div
            key="menu"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  </div>

  {/* Mobile Menu Dropdown */}
  <AnimatePresence>
    {isMobileMenuOpen && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="lg:hidden overflow-hidden bg-slate-950/95 backdrop-blur-xl border-t border-purple-500/20"
      >
        <div className="px-6 py-4 space-y-4">
          {['About', 'Skills', 'Experience', 'Projects', 'Contact'].map((item, idx) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase()}`}
              onClick={() => setIsMobileMenuOpen(false)}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`block text-lg font-medium transition-colors py-2 ${
                activeSection === item.toLowerCase() 
                  ? 'text-purple-400' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {item}
              {activeSection === item.toLowerCase() && (
                <motion.div
                  layoutId="activeSectionMobile"
                  className="h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 mt-1"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </motion.a>
          ))}
          
          {/* Resume Button in Mobile Menu */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="pt-4 border-t border-purple-500/20"
          >
            <a
              href="/resume.pdf"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-full font-semibold text-sm shadow-lg shadow-purple-500/50 w-full"
            >
              <Download size={16} /> Download Resume
            </a>
          </motion.div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
</motion.nav>



      {/* HERO SECTION WITH PROFILE IMAGE */}
      <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden pt-24">
        <div className="absolute inset-0 z-0">
          <Canvas>
            <Scene scrollProgress={smoothProgress.get()} />
          </Canvas>
        </div>
        
        <motion.div 
          className="absolute inset-0 bg-gradient-radial from-transparent via-purple-950/50 to-slate-950 z-5"
          style={{ opacity: heroOpacity, scale: heroScale }}
        />
        
        <motion.div 
          className="relative z-10 text-center px-6 max-w-6xl"
          style={{ 
            opacity: heroOpacity, 
            y: heroY,
            skewY: skewY
          }}
        >
          {/* Profile Image with Glow Effect */}
          <motion.div
            initial={{ opacity: 0, scale: 0, rotateY: 180 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, type: 'spring', stiffness: 100 }}
            className="mb-8 flex justify-center"
          >
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {/* Glowing Border Animation */}
              <motion.div
                className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-full blur-xl"
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                }}
              />
              
              {/* Profile Image */}
              <motion.div
                className="relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-purple-500/50"
                whileHover={{ 
                  borderColor: 'rgba(236, 72, 153, 0.8)',
                  boxShadow: '0 0 40px rgba(168, 85, 247, 0.6)'
                }}
              >
                <img
                  src="/sumanta.jpg"
                  alt="Sumanta Das"
                  className="w-full h-full object-cover"
                />
                {/* Overlay gradient on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-transparent to-transparent opacity-0"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
              
              {/* Floating Badge */}
              <motion.div
                className="absolute -bottom-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-3 border-4 border-slate-950 shadow-lg"
                animate={{ 
                  y: [0, -5, 0],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <Star className="w-6 h-6 text-white" fill="white" />
              </motion.div>
            </motion.div>
          </motion.div>
          
          {/* Name with Improved Typewriter */}
          <motion.h1 
            className="text-6xl md:text-8xl lg:text-9xl font-black mb-6 leading-tight"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              <TypewriterText text="Sumanta Das" delay={80} speed={30} />
            </span>
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
            className="space-y-4"
          >
            <motion.p 
              className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.8 }}
            >
              Full-Stack Developer
            </motion.p>
            
            <motion.p 
              className="text-lg md:text-xl text-gray-300 flex items-center justify-center gap-3 flex-wrap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3.2 }}
            >
              {['Node.js', 'PostgreSQL', 'React', 'DevOps'].map((tech, idx) => (
                <motion.span
                  key={tech}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 3.2 + idx * 0.1, type: 'spring', stiffness: 200 }}
                  whileHover={{ scale: 1.15, y: -5 }}
                  className={`px-4 py-2 rounded-full bg-${['purple', 'blue', 'cyan', 'pink'][idx]}-500/20 border border-${['purple', 'blue', 'cyan', 'pink'][idx]}-500/50 font-medium`}
                >
                  {tech}
                </motion.span>
              ))}
            </motion.p>
          </motion.div>
          
          {/* CTA Buttons */}
          <motion.div 
            className="flex gap-6 justify-center flex-wrap mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.8 }}
          >
            <MagneticButton
              href="#contact"
              className="group relative bg-gradient-to-r from-purple-600 to-pink-600 px-10 py-4 rounded-full font-bold text-lg shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/80 transition-shadow overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Let's Connect <Zap className="group-hover:rotate-12 transition-transform" size={20} />
              </span>
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600"
                initial={{ x: '-100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </MagneticButton>
            
            <MagneticButton
              href="https://github.com/dsumanta"
              className="border-2 border-purple-400 hover:bg-purple-400/20 px-10 py-4 rounded-full font-bold text-lg backdrop-blur-sm transition-all flex items-center gap-2"
            >
              <Github size={20} /> View Work
            </MagneticButton>
          </motion.div>
        </motion.div>
        
        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <ChevronDown className="text-purple-400 w-8 h-8" />
        </motion.div>
      </section>

      {/* STATS WITH STAGGER ANIMATION */}
      <motion.section 
        id="stats"
        className="py-20 px-6 max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.5, rotateY: -90 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{ 
                delay: idx * 0.1, 
                type: 'spring', 
                stiffness: 200,
                damping: 20
              }}
              whileHover={{ 
                scale: 1.1, 
                rotateY: 10,
                rotateX: 5,
                transition: { duration: 0.3 }
              }}
              className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/30 text-center shadow-xl hover:shadow-purple-500/50 transition-shadow"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <motion.div 
                className="text-5xl font-black bg-gradient-to-br from-purple-300 to-pink-300 bg-clip-text text-transparent mb-2"
                style={{ transform: 'translateZ(20px)' }}
              >
                <AnimatedCounter end={stat.value} />{stat.suffix}
              </motion.div>
              <p className="text-gray-300 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ABOUT SECTION */}
      <motion.section 
        id="about"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.8 }}
        className="py-20 px-6 max-w-6xl mx-auto"
      >
        <motion.div 
          className="relative bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-cyan-900/30 backdrop-blur-2xl rounded-[3rem] p-12 border-2 border-purple-500/30 shadow-2xl overflow-hidden"
          initial={{ y: 100, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
          whileHover={{ scale: 1.02, rotateX: 2 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full filter blur-[100px] animate-pulse" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/20 rounded-full filter blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          
          <div className="relative z-10">
            <motion.h2 
              className="text-5xl font-black mb-8 bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent"
              initial={{ x: -100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ type: 'spring', stiffness: 100 }}
            >
              About Me
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-200 leading-relaxed mb-8"
              initial={{ x: -100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
            >
              I'm a <span className="text-purple-400 font-bold">Full-Stack Developer</span> with <span className="text-pink-400 font-bold">2+ years</span> of real-world experience building REST and GraphQL APIs with Node.js, PostgreSQL, and React. Recently, I’ve also been working more on <span className="text-cyan-400 font-bold">cloud infrastructure and DevOps automation</span>—setting up CI/CD pipelines using Jenkins, Docker, and Kubernetes to make deployments smoother across development and production environments.
            </motion.p>
            
            <motion.div 
              className="flex flex-wrap gap-6"
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 100 }}
            >
              <motion.a 
                href="mailto:sumanta.nuraflow.in" 
                className="group flex items-center gap-3 text-purple-300 hover:text-purple-400 transition-colors"
                whileHover={{ x: 10 }}
              >
                <div className="p-3 bg-purple-500/20 rounded-full group-hover:bg-purple-500/30 transition-colors">
                  <Mail size={24} />
                </div>
                <span className="font-medium">sumanta.nuraflow.in</span>
              </motion.a>
              <motion.a 
                href="tel:+917437987423" 
                className="group flex items-center gap-3 text-cyan-300 hover:text-cyan-400 transition-colors"
                whileHover={{ x: 10 }}
              >
                <div className="p-3 bg-cyan-500/20 rounded-full group-hover:bg-cyan-500/30 transition-colors">
                  <Phone size={24} />
                </div>
                <span className="font-medium">+91 7437987423</span>
              </motion.a>
            </motion.div>
          </div>
        </motion.div>
      </motion.section>

      {/* SKILLS SECTION */}
      <motion.section 
        id="skills"
        className="py-20 px-6 max-w-7xl mx-auto"
      >
        <motion.h2 
          className="text-5xl font-black mb-16 text-center bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ type: 'spring', stiffness: 100 }}
        >
          Technical Arsenal
        </motion.h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.entries(skills).map(([category, items], idx) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 100, rotateX: -30 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ 
                delay: idx * 0.15, 
                type: 'spring',
                stiffness: 100,
                damping: 15
              }}
              whileHover={{ 
                y: -15, 
                rotateY: 5,
                scale: 1.05,
                transition: { duration: 0.3 }
              }}
              className="group relative bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/30 hover:border-purple-400/60 transition-all shadow-lg hover:shadow-2xl hover:shadow-purple-500/30"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/10 rounded-3xl transition-all"
                initial={false}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              
              <h3 className="text-2xl font-bold mb-6 text-purple-300 capitalize flex items-center gap-2 relative z-10">
                <motion.span 
                  className="text-3xl"
                  whileHover={{ scale: 1.3, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  {['💻', '🎨', '⚙️', '🗄️', '☁️'][idx]}
                </motion.span>
                {category}
              </h3>
              <div className="flex flex-wrap gap-3 relative z-10">
                {items.map((skill, skillIdx) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ delay: idx * 0.15 + skillIdx * 0.05, type: 'spring' }}
                    whileHover={{ scale: 1.15, rotateZ: 5 }}
                    className="bg-purple-500/30 hover:bg-purple-500/50 px-4 py-2 rounded-full text-sm text-purple-100 font-medium border border-purple-400/30 cursor-default transition-all"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* EXPERIENCE SECTION */}
      <motion.section 
        id="experience"
        className="py-20 px-6 max-w-6xl mx-auto"
      >
        <motion.h2 
          className="text-5xl font-black mb-16 text-center bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ type: 'spring', stiffness: 100 }}
        >
          Professional Journey
        </motion.h2>
        
        <div className="relative">
          <motion.div 
            className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-pink-500 to-cyan-500"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{ transformOrigin: 'top' }}
          />
          
          <div className="space-y-12">
            {experience.map((exp, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ 
                  delay: idx * 0.2, 
                  type: 'spring',
                  stiffness: 100,
                  damping: 20
                }}
                className="relative pl-20"
              >
                <motion.div 
                  className="absolute left-4 top-8 w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full border-4 border-slate-950 flex items-center justify-center text-2xl z-10"
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ delay: idx * 0.2 + 0.3, type: 'spring', stiffness: 200 }}
                  whileHover={{ scale: 1.3, rotate: 360 }}
                >
                  {exp.icon}
                </motion.div>
                
                <motion.div 
                  className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/30 hover:border-purple-400/60 transition-all shadow-xl hover:shadow-2xl hover:shadow-purple-500/30"
                  whileHover={{ scale: 1.02, x: 15 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
                    <div>
                      <h3 className="text-3xl font-bold text-purple-300 mb-2">{exp.role}</h3>
                      <p className="text-2xl text-gray-200 font-semibold">{exp.company}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-purple-400 font-bold text-lg">{exp.period}</p>
                      <p className="text-sm text-gray-400">{exp.location}</p>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {exp.highlights.map((highlight, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false, amount: 0.3 }}
                        transition={{ delay: idx * 0.2 + 0.5 + (i * 0.1), type: 'spring' }}
                        whileHover={{ x: 10, color: '#a78bfa' }}
                        className="text-gray-200 flex items-start text-lg transition-colors"
                      >
                        <span className="text-purple-400 mr-3 text-2xl">▹</span>
                        {highlight}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* PROJECTS SECTION */}
      <motion.section 
        id="projects"
        className="py-20 px-6 max-w-7xl mx-auto"
      >
        <motion.h2 
          className="text-5xl font-black mb-16 text-center bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ type: 'spring', stiffness: 100 }}
        >
          Featured Projects
        </motion.h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, idx) => (
            <FlipCard key={idx} project={project} index={idx} />
          ))}
        </div>
      </motion.section>

      {/* CONTACT SECTION */}
      <motion.section 
        id="contact"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.8 }}
        className="py-20 px-6 max-w-5xl mx-auto"
      >
        <motion.h2 
          className="text-5xl font-black mb-16 text-center bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ type: 'spring', stiffness: 100 }}
        >
          Let's Build Something Amazing
        </motion.h2>
        
        <motion.div 
          className="relative bg-gradient-to-br from-purple-900/40 via-pink-900/30 to-cyan-900/40 backdrop-blur-2xl rounded-[3rem] p-12 border-2 border-purple-500/30 shadow-2xl overflow-hidden"
          initial={{ scale: 0.9, opacity: 0, y: 100 }}
          whileInView={{ scale: 1, opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ type: 'spring', stiffness: 80, damping: 20 }}
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full filter blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/20 rounded-full filter blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
          
          <div className="relative z-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              {['name', 'email'].map((field, idx) => (
                <motion.div 
                  key={field}
                  initial={{ x: -50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ delay: idx * 0.1, type: 'spring' }}
                >
                  <label className="block text-purple-300 mb-3 font-semibold text-lg capitalize">{field}</label>
                  <motion.input
                    type={field === 'email' ? 'email' : 'text'}
                    value={formData[field]}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    className="w-full bg-white/10 border-2 border-purple-500/40 focus:border-purple-400 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none transition-all backdrop-blur-sm"
                    placeholder={field === 'email' ? 'your.email@example.com' : 'Your name'}
                    required
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  />
                </motion.div>
              ))}
              
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ delay: 0.2, type: 'spring' }}
              >
                <label className="block text-purple-300 mb-3 font-semibold text-lg">Message</label>
                <motion.textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={6}
                  className="w-full bg-white/10 border-2 border-purple-500/40 focus:border-purple-400 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none transition-all backdrop-blur-sm resize-none"
                  placeholder="Tell me about your project..."
                  required
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                />
              </motion.div>
              
              <MagneticButton
                type="submit"
                disabled={formStatus === 'sending'}
                className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 px-8 py-5 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-purple-500/50 hover:shadow-purple-500/80"
              >
                {formStatus === 'sending' ? (
                  <>
                    <motion.div 
                      className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message <Send size={20} />
                  </>
                )}
              </MagneticButton>
              
              <AnimatePresence>
                {formStatus === 'success' && (
                  <motion.p
                    initial={{ opacity: 0, y: -20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.8 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="text-green-400 text-center font-semibold text-lg"
                  >
                    ✓ Message sent successfully! I'll get back to you soon.
                  </motion.p>
                )}
              </AnimatePresence>
            </form>

            <div className="mt-12 pt-12 border-t border-purple-500/30">
              <p className="text-center text-gray-300 mb-8 text-lg">Connect with me</p>
              <div className="flex justify-center gap-6">
                {[
                  { Icon: Github, href: 'https://github.com/dsumanta', color: 'purple' },
                  { Icon: Linkedin, href: 'https://linkedin.com/in/sumanta-das-b96707249', color: 'blue' },
                  { Icon: Code, href: 'https://leetcode.com/u/dsumanta', color: 'yellow' }
                ].map(({ Icon, href, color }, idx) => (
                  <motion.a
                    key={idx}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ delay: idx * 0.1, type: 'spring', stiffness: 300 }}
                    whileHover={{ scale: 1.3, rotate: 360 }}
                    whileTap={{ scale: 0.9 }}
                    className={`p-4 bg-${color}-500/20 hover:bg-${color}-500/30 rounded-full transition-all border-2 border-${color}-500/40 hover:border-${color}-400`}
                  >
                    <Icon size={28} className={`text-${color}-300`} />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* FOOTER */}
      <footer className="py-12 text-center text-gray-400 border-t border-purple-500/20 backdrop-blur-xl">
        <motion.p 
          className="text-lg"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          © 2025 Sumanta Das. Crafted with React, Three.js & Framer Motion
        </motion.p>
        <motion.p 
          className="text-sm mt-2 text-purple-400"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >

          Designed for impact. Built for performance. ⚡
        </motion.p>
      </footer>
    </div>
  );
}
