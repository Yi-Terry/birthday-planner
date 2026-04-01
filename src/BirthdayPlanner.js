import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import emailjs from '@emailjs/browser';
import confetti from 'canvas-confetti';

// --- Animated Rose ---
const BloomingRose = ({ delay }) => {
  const stemVariants = {
    initial: { pathLength: 0, opacity: 0 },
    animate: { 
      pathLength: 1, 
      opacity: 1, 
      transition: { delay, duration: 1.2, ease: "easeOut" } 
    }
  };

  const petalVariants = {
    initial: { scale: 0, opacity: 0, rotate: -15 },
    animate: { 
      scale: 1, 
      opacity: 1, 
      rotate: 0,
      transition: { delay: delay + 0.6, duration: 1.2, ease: "backOut" } 
    }
  };

  return (
    <svg width="120" height="160" viewBox="0 0 100 150">
      
      {/* Stem */}
      <motion.path
        d="M50,150 Q50,100 50,60"
        stroke="#2d3436"
        strokeWidth="4"
        fill="none"
        variants={stemVariants}
        initial="initial"
        animate="animate"
      />

      {/* Leaves */}
      <motion.path
        d="M50,110 Q30,100 40,85 Q55,95 50,110 Z"
        fill="#27ae60"
        variants={petalVariants}
        initial="initial"
        animate="animate"
      />
      <motion.path
        d="M50,95 Q70,85 60,70 Q45,80 50,95 Z"
        fill="#27ae60"
        variants={petalVariants}
        initial="initial"
        animate="animate"
      />

      {/* Outer petals */}
      <motion.ellipse
        cx="50" cy="45" rx="22" ry="18"
        fill="#e74c3c"
        variants={petalVariants}
        initial="initial"
        animate="animate"
      />

      {/* Inner petals */}
      <motion.ellipse
        cx="50" cy="45" rx="14" ry="12"
        fill="#c0392b"
        variants={petalVariants}
        initial="initial"
        animate="animate"
      />

      {/* Center */}
      <motion.circle
        cx="50" cy="45" r="6"
        fill="#e74c3c"
        variants={petalVariants}
        initial="initial"
        animate="animate"
      />
    </svg>
  );
};

// --- Main App ---
const BirthdayPlanner = () => {
  const [step, setStep] = useState(0); 
  const [selections, setSelections] = useState({
    activity: '',
    food: '',
    dessert: '' // ✅ NEW
  });

  const [direction, setDirection] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // 🎉 Confetti now on FINAL step (4)
  useEffect(() => {
    if (step === 4) {
      const end = Date.now() + 3000;

      (function frame() {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 } });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 } });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    }
  }, [step]);

  const handleChoice = (category, value) => {
    if (isProcessing) return;
    setIsProcessing(true);

    const updatedSelections = { ...selections, [category]: value };
    setSelections(updatedSelections);

    setTimeout(() => {
      setDirection(1);

      if (category === 'dessert') {
        // ✅ FINAL step now happens AFTER dessert
        sendFinalEmail(updatedSelections);
        setStep(4);
      } else {
        setStep(step + 1);
      }

      setIsProcessing(false);
    }, 600);
  };

  const sendFinalEmail = (data) => {
    const SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
    const TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
    const PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

    emailjs.send(SERVICE_ID, TEMPLATE_ID, data, PUBLIC_KEY)
      .then(() => console.log("Sent!"))
      .catch((err) => console.error(err));
  };

  const carouselVariants = {
    enter: (d) => ({ x: d > 0 ? 400 : -400, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: d < 0 ? 400 : -400, opacity: 0 })
  };

  return (
    <div style={containerStyle}>
      <AnimatePresence mode="wait" custom={direction}>

        {/* STEP 0 */}
        {step === 0 && (
          <motion.div key="0" variants={carouselVariants} initial="enter" animate="center" exit="exit" style={cardStyle}>
            <BloomingRose delay={0.2} />
            <h1>Happy Birthday!</h1>
            <p>plan a special day for you</p>
            <button onClick={() => setStep(1)} style={mainBtn}>Let's Continue!</button>
          </motion.div>
        )}

        {/* STEP 1: Activity */}
        {step === 1 && (
          <motion.div key="1" variants={carouselVariants} initial="enter" animate="center" exit="exit" style={cardStyle}>
            <h2>Pick an Activity</h2>
            <div style={optGroup}>
              {[
                { label: 'Movie Night 🍿', val: 'Movie' },
                { label: 'Ceramics Class 🏺', val: 'Ceramic' }
              ].map(item => (
                <button key={item.val}
                  onClick={() => handleChoice('activity', item.val)}
                  style={optBtn}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 2: Food */}
        {step === 2 && (
          <motion.div key="2" variants={carouselVariants} initial="enter" animate="center" exit="exit" style={cardStyle}>
            <h2>Dinner?</h2>
            <div style={optGroup}>
              {[
                { label: 'Terry Cooks 🧑‍🍳', val: 'Home' },
                { label: 'Dinner Date Night 🍽️', val: 'Out' }
              ].map(item => (
                <button key={item.val}
                  onClick={() => handleChoice('food', item.val)}
                  style={optBtn}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ✅ STEP 3: DESSERT (NEW) */}
        {step === 3 && (
          <motion.div key="3" variants={carouselVariants} initial="enter" animate="center" exit="exit" style={cardStyle}>
            <h2>Dessert?</h2>
            <div style={optGroup}>
              {[
                { label: 'Ice Cream 🍦', val: 'Ice Cream' },
                { label: 'Chip CITYYYYY 🍪', val: 'Cake' },
              ].map(item => (
                <button key={item.val}
                  onClick={() => handleChoice('dessert', item.val)}
                  style={optBtn}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 4: SUCCESS */}
        {step === 4 && (
          <motion.div key="4" variants={carouselVariants} initial="enter" animate="center" exit="exit" style={cardStyle}>
            <h1>All Set! 💌</h1>
            <p>See you soon Love❤️</p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

// --- Styles ---
const containerStyle = { 
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',            // ⬅️ safer than height
  padding: '20px',               // ⬅️ prevents edge clipping on mobile
  background: '#f8f9fa',
  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
};
const cardStyle = { 
  textAlign: 'center',
  padding: '40px 30px',          // ⬅️ less vertical stretch
  background: 'white',
  borderRadius: '24px',
  boxShadow: '0 15px 35px rgba(0,0,0,0.05)',
  width: '90%',                  // ⬅️ responsive
  maxWidth: '380px',             // ⬅️ prevents it from getting too big
};

const mainBtn = {
  padding:'12px 30px', background:'#c0392b',
  color:'white', border:'none', borderRadius:'30px'
};

const optGroup = { 
  display: 'flex',
  flexDirection: 'column',
  gap: '14px'                    // ⬅️ tighter than before
};

const optBtn = { 
  padding: '16px',               // ⬅️ slightly tighter
  border: '2px solid #f1f2f6',
  borderRadius: '14px',
  background: 'white',
  cursor: 'pointer',
  fontSize: '1rem',
  fontWeight: '500',
  width: '100%'                  // ⬅️ important for mobile
};

export default BirthdayPlanner;