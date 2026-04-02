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
      <motion.path d="M50,150 Q50,100 50,60" stroke="#2d3436" strokeWidth="4" fill="none"
        variants={stemVariants} initial="initial" animate="animate" />
      <motion.path d="M50,110 Q30,100 40,85 Q55,95 50,110 Z" fill="#27ae60"
        variants={petalVariants} initial="initial" animate="animate" />
      <motion.path d="M50,95 Q70,85 60,70 Q45,80 50,95 Z" fill="#27ae60"
        variants={petalVariants} initial="initial" animate="animate" />
      <motion.ellipse cx="50" cy="45" rx="22" ry="18" fill="#e74c3c"
        variants={petalVariants} initial="initial" animate="animate" />
      <motion.ellipse cx="50" cy="45" rx="14" ry="12" fill="#c0392b"
        variants={petalVariants} initial="initial" animate="animate" />
      <motion.circle cx="50" cy="45" r="6" fill="#e74c3c"
        variants={petalVariants} initial="initial" animate="animate" />
    </svg>
  );
};

// --- Main App ---
const BirthdayPlanner = () => {
  const [step, setStep] = useState(0);

  const [selections, setSelections] = useState({
    activity: [],
    food: [],
    dessert: [],
    date: '',
    time: ''
  });

  const [direction, setDirection] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // 🎉 Confetti on final step (now step 5)
  useEffect(() => {
    if (step === 5) {
      const end = Date.now() + 3000;
      (function frame() {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 } });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 } });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    }
  }, [step]);

  const toggleChoice = (category, value) => {
    setSelections(prev => {
      const current = prev[category];
      return {
        ...prev,
        [category]: current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value]
      };
    });
  };

  const handleSubmitStep = (category) => {
    if (isProcessing) return;
    if (selections[category].length === 0) return;

    setIsProcessing(true);

    setTimeout(() => {
      setDirection(1);
      setStep(step + 1);
      setIsProcessing(false);
    }, 600);
  };

  // ✅ NEW: Date/Time submit
  const handleDateTimeSubmit = () => {
    if (!selections.date || !selections.time) return;

    setIsProcessing(true);

    setTimeout(() => {
      sendFinalEmail(selections);
      setStep(5);
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

  const renderOptions = (category, options) => (
    <div style={optGroup}>
      {options.map(item => {
        const selected = selections[category].includes(item.val);

        return (
          <button
            key={item.val}
            onClick={() => toggleChoice(category, item.val)}
            style={{
              ...optBtn,
              background: selected ? '#ffe6e6' : 'white',
              border: selected ? '2px solid #c0392b' : '2px solid #f1f2f6'
            }}
          >
            {item.label}
          </button>
        );
      })}

      <button
        onClick={() => handleSubmitStep(category)}
        disabled={selections[category].length === 0}
        style={{
          ...mainBtn,
          marginTop: '20px',
          opacity: selections[category].length === 0 ? 0.5 : 1
        }}
      >
        Submit
      </button>
    </div>
  );

  return (
    <div style={containerStyle}>
      <AnimatePresence mode="wait" custom={direction}>

        {/* STEP 0 */}
        {step === 0 && (
          <motion.div key="0" variants={carouselVariants} initial="enter" animate="center" exit="exit" style={cardStyle}>
            <BloomingRose delay={0.2} />
            <h1>Happy Birthday!</h1>
            <p>plan a special day for you ❤️</p>
            <button onClick={() => setStep(1)} style={mainBtn}>Let's Continue!</button>
          </motion.div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <motion.div key="1" variants={carouselVariants} initial="enter" animate="center" exit="exit" style={cardStyle}>
            <h2>Pick Activities ❤️</h2>
            {renderOptions('activity', [
              { label: 'Movie Night 🍿', val: 'Movie' },
              { label: 'Ceramics Class 🏺', val: 'Ceramic' }
            ])}
          </motion.div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <motion.div key="2" variants={carouselVariants} initial="enter" animate="center" exit="exit" style={cardStyle}>
            <h2>Dinner?</h2>
            {renderOptions('food', [
              { label: 'Terry Cooks 🧑‍🍳', val: 'Home' },
              { label: 'Dinner Date Night 🍽️', val: 'Out' }
            ])}
          </motion.div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <motion.div key="3" variants={carouselVariants} initial="enter" animate="center" exit="exit" style={cardStyle}>
            <h2>Dessert?</h2>
            {renderOptions('dessert', [
              { label: 'Ice Cream 🍦', val: 'Ice Cream' },
              { label: 'Chip CITYYYYY 🍪', val: 'Cookies' }
            ])}
          </motion.div>
        )}

        {/* ✅ STEP 4: DATE & TIME */}
        {step === 4 && (
          <motion.div key="4" variants={carouselVariants} initial="enter" animate="center" exit="exit" style={cardStyle}>
            <h2>Pick a Date & Time 📅</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="date"
                value={selections.date}
                onChange={(e) => setSelections(prev => ({ ...prev, date: e.target.value }))}
                style={inputStyle}
              />

              <input
                type="time"
                value={selections.time}
                onChange={(e) => setSelections(prev => ({ ...prev, time: e.target.value }))}
                style={inputStyle}
              />

              <button
                onClick={handleDateTimeSubmit}
                disabled={!selections.date || !selections.time}
                style={{
                  ...mainBtn,
                  marginTop: '10px',
                  opacity: (!selections.date || !selections.time) ? 0.5 : 1
                }}
              >
                Submit
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 5: SUCCESS */}
        {step === 5 && (
          <motion.div key="5" variants={carouselVariants} initial="enter" animate="center" exit="exit" style={cardStyle}>
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
  minHeight: '100vh',
  padding: '20px',
  background: '#f8f9fa',
  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
};

const cardStyle = {
  textAlign: 'center',
  padding: '40px 30px',
  background: 'white',
  borderRadius: '24px',
  boxShadow: '0 15px 35px rgba(0,0,0,0.05)',
  width: '90%',
  maxWidth: '380px',
};

const mainBtn = {
  padding: '12px 30px',
  background: '#c0392b',
  color: 'white',
  border: 'none',
  borderRadius: '30px'
};

const optGroup = {
  display: 'flex',
  flexDirection: 'column',
  gap: '14px'
};

const optBtn = {
  padding: '16px',
  border: '2px solid #f1f2f6',
  borderRadius: '14px',
  background: 'white',
  cursor: 'pointer',
  fontSize: '1rem',
  fontWeight: '500',
  width: '100%'
};

const inputStyle = {
  padding: '12px',
  borderRadius: '10px',
  border: '1px solid #ccc',
  fontSize: '1rem'
};

export default BirthdayPlanner;