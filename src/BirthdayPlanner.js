import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import emailjs from '@emailjs/browser';
import confetti from 'canvas-confetti';

// --- Animated Rose Component (Home Page Centerpiece) ---
const BloomingRose = ({ delay }) => {
  const stemVariants = {
    initial: { pathLength: 0, opacity: 0 },
    animate: { 
      pathLength: 1, 
      opacity: 1, 
      transition: { delay: delay, duration: 1.2, ease: "easeOut" } 
    }
  };

  const bloomVariants = {
    initial: { scale: 0, opacity: 0, rotate: -20 },
    animate: { 
      scale: 1, 
      opacity: 1, 
      rotate: 0,
      transition: { delay: delay + 0.8, duration: 1.5, ease: "backOut" } 
    }
  };

  return (
    <svg width="120" height="160" viewBox="0 0 100 150">
      <motion.path
        d="M50,150 Q50,100 50,50"
        stroke="#2d3436"
        strokeWidth="4"
        fill="none"
        variants={stemVariants}
        initial="initial" animate="animate"
      />
      <motion.path d="M50,110 Q30,100 40,80 Q55,95 50,110 Z" fill="#26ae60" variants={bloomVariants} initial="initial" animate="animate" />
      <motion.path d="M50,90 Q70,80 60,60 Q45,75 50,90 Z" fill="#26ae60" variants={bloomVariants} initial="initial" animate="animate" />
      <motion.circle cx="50" cy="40" r="25" fill="#e74c3c" variants={bloomVariants} initial="initial" animate="animate" />
      <motion.circle cx="50" cy="40" r="15" fill="#c0392b" variants={bloomVariants} initial="initial" animate="animate" />
      <motion.circle cx="50" cy="40" r="8" fill="#e74c3c" variants={bloomVariants} initial="initial" animate="animate" />
    </svg>
  );
};

// --- Main Application ---
const BirthdayPlanner = () => {
  const [step, setStep] = useState(0); 
  const [selections, setSelections] = useState({ activity: '', food: '' });
  const [direction, setDirection] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // CONFETTI FINALE: Fires when the final success screen (Step 3) loads
  useEffect(() => {
    if (step === 3) {
      const end = Date.now() + 3000; // 3 seconds of confetti
      const colors = ['#c0392b', '#e74c3c', '#2ecc71', '#f1c40f'];

      (function frame() {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: colors, scalar: 0.7 });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: colors, scalar: 0.7 });
        if (Date.now() < end) requestAnimationFrame(frame);
      }());
    }
  }, [step]);

  const handleChoice = (category, value) => {
    if (isProcessing) return; 
    setIsProcessing(true);

    const updatedSelections = { ...selections, [category]: value };
    setSelections(updatedSelections);

    // Wait slightly so user sees the green button fade before sliding
    setTimeout(() => {
      setDirection(1);
      if (category === 'food') { 
        sendFinalEmail(updatedSelections);
        setStep(3);
      } else {
        setStep(step + 1);
      }
      setIsProcessing(false);
    }, 600);
  };

  const sendFinalEmail = (finalData) => {
    // Process environment variables
    const SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
    const TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
    const PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

    emailjs.send(SERVICE_ID, TEMPLATE_ID, finalData, PUBLIC_KEY)
      .then(() => console.log("Sent!"))
      .catch((err) => console.error("Error:", err));
  };

  // Carousel Animation Variants
  const carouselVariants = {
    enter: (d) => ({ x: d > 0 ? 500 : -500, opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.5, ease: "easeInOut" } },
    exit: (d) => ({ x: d < 0 ? 500 : -500, opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } })
  };

  // Button Animation Variants (Fade to Green & Shadow)
  const buttonVariants = {
    hover: { 
      scale: 1.03, 
      boxShadow: "0px 8px 20px rgba(0,0,0,0.12)",
      borderColor: "#2ecc71" 
    },
    tap: { scale: 0.97 },
    selected: { 
      backgroundColor: "#2ecc71", 
      color: "#ffffff", 
      borderColor: "#27ae60",
      transition: { duration: 0.3 }
    }
  };

  return (
    <div style={containerStyle}>
      <AnimatePresence mode="wait" custom={direction}>
        
        {/* STEP 0: HOME */}
        {step === 0 && (
          <motion.div key="0" custom={direction} variants={carouselVariants} initial="enter" animate="center" exit="exit" style={cardStyle}>
            <div style={flowerBox}><BloomingRose delay={0.2} /></div>
            <h1 style={{color: '#c0392b', marginBottom: '10px'}}>Happy Birthday!</h1>
            <p style={{color: '#636e72', marginBottom: '30px'}}>Let's plan your special day...</p>
            <motion.button 
              whileHover={{ scale: 1.1, boxShadow: "0px 10px 20px rgba(192, 57, 43, 0.3)" }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setStep(1)} 
              style={mainBtn}
            >
              Let's Go!
            </motion.button>
          </motion.div>
        )}

        {/* STEP 1: ACTIVITY */}
        {step === 1 && (
          <motion.div key="1" custom={direction} variants={carouselVariants} initial="enter" animate="center" exit="exit" style={cardStyle}>
            <h2 style={{color: '#6c5ce7', marginBottom: '20px'}}>Pick an Activity</h2>
            <div style={optGroup}>
              {[
                { label: 'Stay In & Movie 🍿', val: 'Stay In' },
                { label: 'Ceramic Class 🏺', val: 'Ceramic' }
              ].map((item) => (
                <motion.button
                  key={item.val}
                  variants={buttonVariants}
                  whileHover="hover" whileTap="tap"
                  animate={selections.activity === item.val ? "selected" : ""}
                  onClick={() => handleChoice('activity', item.val)}
                  style={optBtn}
                >
                  {item.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 2: FOOD */}
        {step === 2 && (
          <motion.div key="2" custom={direction} variants={carouselVariants} initial="enter" animate="center" exit="exit" style={cardStyle}>
            <h2 style={{color: '#e67e22', marginBottom: '20px'}}>What are we eating?</h2>
            <div style={optGroup}>
              {[
                { label: 'Terry Makes Dinner 🧑‍🍳', val: 'Terry Dinner' },
                { label: 'Dinner Date Out 🍽️', val: 'Date Out' }
              ].map((item) => (
                <motion.button
                  key={item.val}
                  variants={buttonVariants}
                  whileHover="hover" whileTap="tap"
                  animate={selections.food === item.val ? "selected" : ""}
                  onClick={() => handleChoice('food', item.val)}
                  style={optBtn}
                >
                  {item.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 3 && (
          <motion.div key="3" custom={direction} variants={carouselVariants} initial="enter" animate="center" exit="exit" style={cardStyle}>
            <h1 style={{color: '#27ae60', fontSize: '2rem'}}>Request Sent! 💌</h1>
            <p style={{fontSize: '1.2rem', marginTop: '10px'}}>{"See you there love <3"}</p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

// --- CSS-in-JS Styles ---
const containerStyle = { 
  display:'flex', justifyContent:'center', alignItems:'center', 
  height:'100vh', background:'#f8f9fa', fontFamily:'"Helvetica Neue", Helvetica, Arial, sans-serif' 
};

const cardStyle = { 
  textAlign:'center', padding:'50px 40px', background:'white', 
  borderRadius:'30px', boxShadow:'0 15px 35px rgba(0,0,0,0.05)', width:'350px' 
};

const flowerBox = { height:'170px', display:'flex', justifyContent:'center', marginBottom:'15px' };

const mainBtn = { 
  padding:'15px 40px', background:'#c0392b', color:'white', border:'none', 
  borderRadius:'50px', cursor:'pointer', fontWeight:'bold', fontSize:'1.1rem' 
};

const optGroup = { display:'flex', flexDirection:'column', gap:'15px' };

const optBtn = { 
  padding:'20px', border:'2px solid #f1f2f6', borderRadius:'15px', 
  background:'white', cursor:'pointer', fontSize:'1.05rem', fontWeight:'500',
  color: '#2d3436', outline: 'none'
};

export default BirthdayPlanner;