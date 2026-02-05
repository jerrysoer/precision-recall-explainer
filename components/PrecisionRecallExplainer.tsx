'use client';

import React, { useState, useEffect, useRef } from 'react';

const PrecisionRecallExplainer = () => {
  const [threshold, setThreshold] = useState(50);
  const [activeSection, setActiveSection] = useState(0);
  const [visibleSections, setVisibleSections] = useState<Set<number>>(new Set([0]));
  const [copied, setCopied] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const sectionNames = [
    'Intro', 'Email', 'Medical', 'Car', 'Fraud', 'Content', 'Search',
    'Interactive', 'Matrix', 'Formulas', 'F1 Score', 'Quiz', 'Conclusion'
  ];

  useEffect(() => {
    const handleScroll = () => {
      const newVisible = new Set<number>();
      let currentActive = 0;
      sectionRefs.current.forEach((ref, index) => {
        if (ref) {
          const rect = ref.getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) {
            newVisible.add(index);
          }
          if (rect.top < window.innerHeight * 0.5 && rect.bottom > 0) {
            currentActive = index;
          }
        }
      });
      setVisibleSections(newVisible);
      setActiveSection(currentActive);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const setSectionRef = (index: number) => (el: HTMLDivElement | null) => {
    sectionRefs.current[index] = el;
  };

  const scrollToSection = (index: number) => {
    sectionRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const isVisible = (index: number) => visibleSections.has(index);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
    }
  };

  const metrics = {
    recall: Math.round(Math.min(95, 30 + (100 - threshold) * 0.7)),
    precision: Math.round(Math.min(95, 20 + threshold * 0.8)),
  };

  // Calculate confusion matrix values
  const actualPositives = 30;
  const actualNegatives = 70;
  const truePositives = Math.round((metrics.recall / 100) * actualPositives);
  const falseNegatives = actualPositives - truePositives;
  const totalPredictedPositives = metrics.precision > 0 ? Math.round(truePositives / (metrics.precision / 100)) : truePositives;
  const falsePositives = Math.max(0, totalPredictedPositives - truePositives);
  const trueNegatives = actualNegatives - falsePositives;

  const f1Score = metrics.precision + metrics.recall > 0
    ? Math.round((2 * metrics.precision * metrics.recall) / (metrics.precision + metrics.recall))
    : 0;

  // Quiz questions
  const quizQuestions = [
    {
      question: "A hospital's cancer screening test. What matters more?",
      options: [
        { id: 'recall', label: 'High Recall', desc: 'Catch every possible case' },
        { id: 'precision', label: 'High Precision', desc: 'Only flag certain cases' },
      ],
      correct: 'recall',
      explanation: "Missing a cancer case can be fatal. False alarms lead to more tests, but that's better than missing a real cancer."
    },
    {
      question: "A spam filter for your personal email. What matters more?",
      options: [
        { id: 'recall', label: 'High Recall', desc: 'Block all possible spam' },
        { id: 'precision', label: 'High Precision', desc: 'Only block obvious spam' },
      ],
      correct: 'precision',
      explanation: 'Blocking a real email from a friend or employer is worse than letting some spam through. You can delete spam manually.'
    },
    {
      question: "An airport security system detecting weapons. What matters more?",
      options: [
        { id: 'recall', label: 'High Recall', desc: 'Flag anything suspicious' },
        { id: 'precision', label: 'High Precision', desc: 'Only flag clear threats' },
      ],
      correct: 'recall',
      explanation: 'The cost of missing a weapon is catastrophic. Extra security checks are inconvenient but acceptable.'
    },
  ];

  // SVG Illustrations with animations
  const BalanceIllustration = () => (
    <svg viewBox="0 0 200 160" className="w-full max-w-xs mx-auto">
      <defs>
        <linearGradient id="beam-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1a1a1a" />
          <stop offset="50%" stopColor="#2d2d2d" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </linearGradient>
      </defs>
      <path d="M100 150 L100 80" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="100" cy="155" rx="30" ry="5" fill="#1a1a1a" />
      <circle cx="100" cy="75" r="6" fill="#1a1a1a" />
      <g style={{ transform: `rotate(${(threshold - 50) * 0.15}deg)`, transformOrigin: '100px 75px', transition: 'transform 0.5s ease-out' }}>
        <rect x="20" y="72" width="160" height="6" rx="3" fill="url(#beam-gradient)" />
        <line x1="35" y1="78" x2="35" y2="105" stroke="#1a1a1a" strokeWidth="1.5" />
        <line x1="25" y1="78" x2="45" y2="78" stroke="#1a1a1a" strokeWidth="1.5" />
        <path d="M20 105 Q35 115 50 105" stroke="#c26e4a" strokeWidth="2.5" fill="none" />
        <text x="35" y="130" textAnchor="middle" className="text-[10px]" fill="#c26e4a" fontWeight="500">Recall</text>
        <line x1="165" y1="78" x2="165" y2="105" stroke="#1a1a1a" strokeWidth="1.5" />
        <line x1="155" y1="78" x2="175" y2="78" stroke="#1a1a1a" strokeWidth="1.5" />
        <path d="M150 105 Q165 115 180 105" stroke="#2d6a4f" strokeWidth="2.5" fill="none" />
        <text x="165" y="130" textAnchor="middle" className="text-[10px]" fill="#2d6a4f" fontWeight="500">Precision</text>
      </g>
    </svg>
  );

  const EmailIllustration = ({ animate }: { animate: boolean }) => (
    <svg viewBox="0 0 280 200" className="w-full max-w-sm mx-auto">
      <rect x="40" y="30" width="200" height="140" rx="8" fill="none" stroke="#d4c4b0" strokeWidth="2" />
      <text x="140" y="22" textAnchor="middle" className="text-[11px]" fill="#8b7355" fontWeight="500">INBOX</text>
      {[0, 1, 2].map((i) => (
        <g key={`good-${i}`} style={{
          opacity: animate ? 1 : 0,
          transform: animate ? 'translateY(0)' : 'translateY(20px)',
          transition: `all 0.6s ease-out ${i * 0.15}s`
        }}>
          <rect x={55 + i * 8} y={50 + i * 25} width="100" height="32" rx="4" fill="#faf6f1" stroke="#2d6a4f" strokeWidth="1.5" />
          <line x1={65 + i * 8} y1={62 + i * 25} x2={95 + i * 8} y2={62 + i * 25} stroke="#2d6a4f" strokeWidth="2" strokeLinecap="round" />
          <line x1={65 + i * 8} y1={72 + i * 25} x2={140 + i * 8} y2={72 + i * 25} stroke="#d4c4b0" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx={147 + i * 8} cy={66 + i * 25} r="4" fill="#2d6a4f" opacity="0.3" />
        </g>
      ))}
      {[0, 1].map((i) => (
        <g key={`spam-${i}`} style={{
          opacity: animate ? 1 : 0,
          transform: animate ? 'translateX(0)' : 'translateX(20px)',
          transition: `all 0.6s ease-out ${0.5 + i * 0.15}s`
        }}>
          <rect x={155 + i * 12} y={60 + i * 35} width="70" height="32" rx="4" fill="#faf6f1" stroke="#c26e4a" strokeWidth="1.5" strokeDasharray="4 2" />
          <line x1={165 + i * 12} y1={72 + i * 35} x2={185 + i * 12} y2={72 + i * 35} stroke="#c26e4a" strokeWidth="2" strokeLinecap="round" />
          <line x1={165 + i * 12} y1={82 + i * 35} x2={210 + i * 12} y2={82 + i * 35} stroke="#e8d5c4" strokeWidth="1.5" strokeLinecap="round" />
          <text x={210 + i * 12} y={76 + i * 35} className="text-[8px]" fill="#c26e4a">!</text>
        </g>
      ))}
      <path d="M140 175 L120 185 L160 185 Z" fill="none" stroke="#1a1a1a" strokeWidth="1.5" style={{
        opacity: animate ? 1 : 0,
        transition: 'opacity 0.6s ease-out 0.8s'
      }} />
    </svg>
  );

  const MedicalIllustration = ({ animate }: { animate: boolean }) => (
    <svg viewBox="0 0 280 220" className="w-full max-w-sm mx-auto">
      <rect x="60" y="60" width="160" height="100" rx="6" fill="#faf6f1" stroke="#d4c4b0" strokeWidth="2" />
      {[[100, 95, 12], [145, 85, 10], [120, 130, 9]].map(([cx, cy, r], i) => (
        <g key={i} style={{
          opacity: animate ? 1 : 0,
          transform: animate ? 'scale(1)' : 'scale(0)',
          transformOrigin: `${cx}px ${cy}px`,
          transition: `all 0.5s ease-out ${i * 0.2}s`
        }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#2d6a4f" strokeWidth="2" />
          <circle cx={cx} cy={cy} r={r as number / 3} fill="#2d6a4f" opacity="0.3" />
        </g>
      ))}
      <g style={{
        opacity: animate ? 1 : 0,
        transform: animate ? 'scale(1)' : 'scale(0)',
        transformOrigin: '180px 100px',
        transition: 'all 0.5s ease-out 0.6s'
      }}>
        <circle cx="180" cy="100" r="14" fill="none" stroke="#c26e4a" strokeWidth="2.5">
          {animate && <animate attributeName="r" values="14;16;14" dur="2s" repeatCount="indefinite" />}
        </circle>
        <circle cx="180" cy="100" r="8" fill="#c26e4a" opacity="0.15" />
        <text x="180" y="104" textAnchor="middle" className="text-[10px]" fill="#c26e4a" fontWeight="bold">?</text>
      </g>
      <g style={{
        opacity: animate ? 1 : 0,
        transform: animate ? 'scale(1)' : 'scale(0)',
        transformOrigin: '165px 140px',
        transition: 'all 0.5s ease-out 0.8s'
      }}>
        <circle cx="165" cy="140" r="11" fill="none" stroke="#8b7355" strokeWidth="2" strokeDasharray="3 2" />
        <circle cx="165" cy="140" r="4" fill="#8b7355" opacity="0.2" />
      </g>
      <g style={{
        opacity: animate ? 1 : 0,
        transition: 'opacity 0.5s ease-out 1s'
      }}>
        <circle cx="210" cy="50" r="20" fill="none" stroke="#1a1a1a" strokeWidth="2" />
        <line x1="224" y1="64" x2="238" y2="78" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
      </g>
      <text x="140" y="185" textAnchor="middle" className="text-[11px]" fill="#8b7355" style={{
        opacity: animate ? 1 : 0,
        transition: 'opacity 0.5s ease-out 1.2s'
      }}>Sample Analysis</text>
    </svg>
  );

  const CarIllustration = ({ animate }: { animate: boolean }) => (
    <svg viewBox="0 0 300 200" className="w-full max-w-sm mx-auto">
      <rect x="0" y="140" width="300" height="60" fill="#e8e0d5" />
      <line x1="0" y1="170" x2="300" y2="170" stroke="#d4c4b0" strokeWidth="2" strokeDasharray="20 10" />
      <g style={{
        opacity: animate ? 1 : 0,
        transform: animate ? 'translateX(0)' : 'translateX(-50px)',
        transition: 'all 0.8s ease-out'
      }}>
        <path d="M50 130 L70 130 L85 110 L130 110 L140 130 L170 130 L170 145 L50 145 Z" fill="#1a1a1a" />
        <circle cx="75" cy="145" r="10" fill="#1a1a1a" />
        <circle cx="75" cy="145" r="5" fill="#faf6f1" />
        <circle cx="145" cy="145" r="10" fill="#1a1a1a" />
        <circle cx="145" cy="145" r="5" fill="#faf6f1" />
      </g>
      <g style={{
        opacity: animate ? 1 : 0,
        transition: 'opacity 0.5s ease-out 0.5s'
      }}>
        <path d="M160 120 L240 80 L240 140 Z" fill="#2d6a4f" opacity="0.15">
          {animate && <animate attributeName="opacity" values="0.15;0.25;0.15" dur="1.5s" repeatCount="indefinite" />}
        </path>
        <line x1="160" y1="120" x2="240" y2="110" stroke="#2d6a4f" strokeWidth="1" strokeDasharray="4 3" />
      </g>
      <g style={{
        opacity: animate ? 1 : 0,
        transition: 'opacity 0.5s ease-out 0.8s'
      }}>
        <circle cx="230" cy="105" r="8" fill="none" stroke="#1a1a1a" strokeWidth="2" />
        <line x1="230" y1="113" x2="230" y2="135" stroke="#1a1a1a" strokeWidth="2" />
        <line x1="230" y1="120" x2="220" y2="128" stroke="#1a1a1a" strokeWidth="2" />
        <line x1="230" y1="120" x2="240" y2="128" stroke="#1a1a1a" strokeWidth="2" />
        <line x1="230" y1="135" x2="222" y2="150" stroke="#1a1a1a" strokeWidth="2" />
        <line x1="230" y1="135" x2="238" y2="150" stroke="#1a1a1a" strokeWidth="2" />
      </g>
      <rect x="210" y="85" width="45" height="70" rx="4" fill="none" stroke="#2d6a4f" strokeWidth="2" style={{
        opacity: animate ? 1 : 0,
        transition: 'opacity 0.5s ease-out 1s'
      }}>
        {animate && <animate attributeName="stroke-opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" />}
      </rect>
      <text x="232" y="78" textAnchor="middle" className="text-[9px]" fill="#2d6a4f" fontWeight="500" style={{
        opacity: animate ? 1 : 0,
        transition: 'opacity 0.5s ease-out 1s'
      }}>DETECT</text>
      <g style={{
        opacity: animate ? 1 : 0,
        transition: 'opacity 0.5s ease-out 1.2s'
      }}>
        <ellipse cx="270" cy="145" rx="12" ry="15" fill="#8b7355" opacity="0.4" />
        <rect x="258" y="120" width="24" height="25" rx="2" fill="none" stroke="#c26e4a" strokeWidth="1.5" strokeDasharray="3 2" />
      </g>
    </svg>
  );

  const FraudIllustration = ({ animate }: { animate: boolean }) => (
    <svg viewBox="0 0 280 200" className="w-full max-w-sm mx-auto">
      <g style={{
        opacity: animate ? 1 : 0,
        transform: animate ? 'scale(1)' : 'scale(0.9)',
        transformOrigin: '140px 100px',
        transition: 'all 0.6s ease-out'
      }}>
        <rect x="60" y="50" width="160" height="100" rx="10" fill="#1a1a1a" />
        <rect x="60" y="75" width="160" height="25" fill="#2d2d2d" />
        <rect x="75" y="115" width="50" height="8" rx="2" fill="#8b7355" opacity="0.5" />
        <rect x="75" y="128" width="80" height="6" rx="2" fill="#8b7355" opacity="0.3" />
        <rect x="80" y="58" width="25" height="18" rx="3" fill="#d4c4b0" />
        <line x1="85" y1="62" x2="100" y2="62" stroke="#8b7355" strokeWidth="1" />
        <line x1="85" y1="67" x2="100" y2="67" stroke="#8b7355" strokeWidth="1" />
        <line x1="85" y1="72" x2="100" y2="72" stroke="#8b7355" strokeWidth="1" />
      </g>
      <g style={{
        opacity: animate ? 1 : 0,
        transition: 'opacity 0.5s ease-out 0.5s'
      }}>
        <circle cx="180" cy="65" r="12" fill="none" stroke="#2d6a4f" strokeWidth="2">
          {animate && <animate attributeName="r" values="12;14;12" dur="2s" repeatCount="indefinite" />}
        </circle>
        <path d="M176 65 L179 68 L186 61" stroke="#2d6a4f" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g style={{
        opacity: animate ? 1 : 0,
        transition: 'opacity 0.5s ease-out 0.8s'
      }}>
        <circle cx="200" cy="40" r="15" fill="#c26e4a" opacity="0.15">
          {animate && <animate attributeName="r" values="15;18;15" dur="1.5s" repeatCount="indefinite" />}
        </circle>
        <circle cx="200" cy="40" r="10" fill="none" stroke="#c26e4a" strokeWidth="2" />
        <text x="200" y="44" textAnchor="middle" className="text-[12px]" fill="#c26e4a" fontWeight="bold">!</text>
      </g>
      <g style={{
        opacity: animate ? 1 : 0,
        transition: 'opacity 0.5s ease-out 1s'
      }}>
        <path d="M140 160 Q140 175 160 175 L200 175" stroke="#d4c4b0" strokeWidth="1.5" fill="none" />
        <text x="180" y="188" textAnchor="middle" className="text-[9px]" fill="#8b7355">$847.32</text>
      </g>
    </svg>
  );

  const ContentIllustration = ({ animate }: { animate: boolean }) => (
    <svg viewBox="0 0 280 200" className="w-full max-w-sm mx-auto">
      <g style={{
        opacity: animate ? 1 : 0,
        transform: animate ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.6s ease-out'
      }}>
        <rect x="90" y="20" width="100" height="170" rx="12" fill="none" stroke="#1a1a1a" strokeWidth="2.5" />
        <rect x="95" y="35" width="90" height="140" rx="4" fill="#faf6f1" />
        <rect x="120" y="23" width="40" height="8" rx="4" fill="#1a1a1a" />
      </g>
      <g style={{
        opacity: animate ? 1 : 0,
        transform: animate ? 'translateX(0)' : 'translateX(-10px)',
        transition: 'all 0.5s ease-out 0.3s'
      }}>
        <rect x="100" y="42" width="80" height="35" rx="3" fill="#fff" stroke="#d4c4b0" strokeWidth="1" />
        <line x1="108" y1="52" x2="150" y2="52" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
        <line x1="108" y1="62" x2="172" y2="62" stroke="#d4c4b0" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="108" y1="70" x2="160" y2="70" stroke="#d4c4b0" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <g style={{
        opacity: animate ? 1 : 0,
        transform: animate ? 'translateX(0)' : 'translateX(-10px)',
        transition: 'all 0.5s ease-out 0.5s'
      }}>
        <rect x="100" y="82" width="80" height="35" rx="3" fill="#fff" stroke="#c26e4a" strokeWidth="1.5">
          {animate && <animate attributeName="stroke-opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />}
        </rect>
        <line x1="108" y1="92" x2="145" y2="92" stroke="#c26e4a" strokeWidth="2" strokeLinecap="round" />
        <line x1="108" y1="102" x2="172" y2="102" stroke="#e8d5c4" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="155" y="88" width="20" height="12" rx="2" fill="#c26e4a" opacity="0.2" />
        <text x="165" y="97" textAnchor="middle" className="text-[7px]" fill="#c26e4a" fontWeight="bold">FLAG</text>
      </g>
      <g style={{
        opacity: animate ? 1 : 0,
        transform: animate ? 'translateX(0)' : 'translateX(-10px)',
        transition: 'all 0.5s ease-out 0.7s'
      }}>
        <rect x="100" y="122" width="80" height="35" rx="3" fill="#fff" stroke="#2d6a4f" strokeWidth="1" />
        <line x1="108" y1="132" x2="155" y2="132" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
        <line x1="108" y1="142" x2="172" y2="142" stroke="#d4c4b0" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="170" cy="132" r="6" fill="#2d6a4f" opacity="0.2" />
        <path d="M167 132 L169 134 L174 129" stroke="#2d6a4f" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );

  const SearchIllustration = ({ animate }: { animate: boolean }) => (
    <svg viewBox="0 0 280 200" className="w-full max-w-sm mx-auto">
      <g style={{
        opacity: animate ? 1 : 0,
        transform: animate ? 'scaleX(1)' : 'scaleX(0.8)',
        transformOrigin: '140px 48px',
        transition: 'all 0.5s ease-out'
      }}>
        <rect x="40" y="30" width="200" height="36" rx="18" fill="#faf6f1" stroke="#d4c4b0" strokeWidth="2" />
        <circle cx="65" cy="48" r="10" fill="none" stroke="#8b7355" strokeWidth="2" />
        <line x1="72" y1="55" x2="80" y2="63" stroke="#8b7355" strokeWidth="2" strokeLinecap="round" />
        <line x1="85" y1="48" x2="180" y2="48" stroke="#d4c4b0" strokeWidth="2" strokeLinecap="round" />
      </g>
      {[[75, '#2d6a4f', 0.3], [112, '#8b7355', 0.5], [149, '#c26e4a', 0.7]].map(([y, color, delay], i) => (
        <g key={i} style={{
          opacity: animate ? 1 : 0,
          transform: animate ? 'translateY(0)' : 'translateY(15px)',
          transition: `all 0.5s ease-out ${delay}s`
        }}>
          <rect x="40" y={y as number} width="200" height="32" rx="4" fill="#fff" stroke={color as string} strokeWidth={i === 0 ? 1.5 : 1} strokeDasharray={i === 2 ? '4 2' : 'none'} />
          <circle cx="58" cy={(y as number) + 16} r="8" fill={color as string} opacity={0.2 - i * 0.05} />
          <line x1="75" y1={(y as number) + 10} x2={160 - i * 10} y2={(y as number) + 10} stroke={i === 2 ? '#8b7355' : '#1a1a1a'} strokeWidth="2" strokeLinecap="round" />
          <line x1="75" y1={(y as number) + 20} x2={220 - i * 15} y2={(y as number) + 20} stroke={i === 2 ? '#e8d5c4' : '#d4c4b0'} strokeWidth="1.5" strokeLinecap="round" />
          <text x="225" y={(y as number) + 14} className="text-[8px]" fill={color as string} fontWeight={i === 0 ? '500' : '400'}>#{i + 1}</text>
        </g>
      ))}
    </svg>
  );

  // Confusion Matrix Visualization
  const ConfusionMatrix = () => {
    const dotSize = 4;
    const dotsPerRow = 10;

    const renderDots = (count: number, color: string, startX: number, startY: number) => {
      return Array.from({ length: count }).map((_, i) => {
        const row = Math.floor(i / dotsPerRow);
        const col = i % dotsPerRow;
        return (
          <circle
            key={i}
            cx={startX + col * (dotSize + 2)}
            cy={startY + row * (dotSize + 2)}
            r={dotSize / 2}
            fill={color}
            style={{
              transition: 'all 0.5s ease-out',
              transitionDelay: `${i * 10}ms`
            }}
          />
        );
      });
    };

    return (
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-stone-200">
        <h3 className="font-display text-2xl font-medium text-center mb-6">Confusion Matrix</h3>
        <p className="font-body text-base text-stone-500 text-center mb-8">100 samples visualized as dots</p>

        <svg viewBox="0 0 320 200" className="w-full max-w-md mx-auto">
          {/* Labels */}
          <text x="100" y="20" textAnchor="middle" className="text-[11px]" fill="#8b7355" fontWeight="500">Predicted Positive</text>
          <text x="240" y="20" textAnchor="middle" className="text-[11px]" fill="#8b7355" fontWeight="500">Predicted Negative</text>
          <text x="15" y="75" textAnchor="middle" className="text-[10px]" fill="#8b7355" fontWeight="500" transform="rotate(-90, 15, 75)">Actually Positive</text>
          <text x="15" y="150" textAnchor="middle" className="text-[10px]" fill="#8b7355" fontWeight="500" transform="rotate(-90, 15, 150)">Actually Negative</text>

          {/* Boxes */}
          <rect x="40" y="30" width="100" height="70" rx="6" fill="#2d6a4f" opacity="0.1" stroke="#2d6a4f" strokeWidth="1" />
          <rect x="180" y="30" width="100" height="70" rx="6" fill="#c26e4a" opacity="0.1" stroke="#c26e4a" strokeWidth="1" />
          <rect x="40" y="110" width="100" height="70" rx="6" fill="#c26e4a" opacity="0.1" stroke="#c26e4a" strokeWidth="1" />
          <rect x="180" y="110" width="100" height="70" rx="6" fill="#2d6a4f" opacity="0.05" stroke="#8b7355" strokeWidth="1" />

          {/* Box labels */}
          <text x="90" y="45" textAnchor="middle" className="text-[9px]" fill="#2d6a4f" fontWeight="600">TP: {truePositives}</text>
          <text x="230" y="45" textAnchor="middle" className="text-[9px]" fill="#c26e4a" fontWeight="600">FN: {falseNegatives}</text>
          <text x="90" y="125" textAnchor="middle" className="text-[9px]" fill="#c26e4a" fontWeight="600">FP: {falsePositives}</text>
          <text x="230" y="125" textAnchor="middle" className="text-[9px]" fill="#8b7355" fontWeight="600">TN: {trueNegatives}</text>

          {/* Dots */}
          {renderDots(truePositives, '#2d6a4f', 50, 52)}
          {renderDots(falseNegatives, '#c26e4a', 190, 52)}
          {renderDots(falsePositives, '#c26e4a', 50, 132)}
          {renderDots(trueNegatives, '#a8a29e', 190, 132)}
        </svg>
      </div>
    );
  };

  const FormulaCard = ({ title, formula, question, color, terms }: {
    title: string;
    formula: React.ReactNode;
    question: string;
    color: string;
    terms: { symbol: string; meaning: string; color: string }[];
  }) => (
    <div className="bg-white rounded-2xl p-6 md:p-8 border border-stone-200 shadow-sm">
      <div className="text-base font-medium mb-4 tracking-wide" style={{ color }}>{title}</div>
      <div className="font-serif text-3xl md:text-4xl mb-6">{formula}</div>
      <p className="text-stone-600 italic mb-6 text-base md:text-lg leading-relaxed">&ldquo;{question}&rdquo;</p>
      <div className="pt-4 border-t border-stone-100 space-y-2">
        {terms.map((term, i) => (
          <div key={i} className="flex items-center gap-3 text-base">
            <span className="font-mono font-medium" style={{ color: term.color }}>{term.symbol}</span>
            <span className="text-stone-500">{term.meaning}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const QuizQuestion = ({ q, index }: { q: typeof quizQuestions[0]; index: number }) => {
    const answered = quizAnswers[index];
    const isCorrect = answered === q.correct;

    return (
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
        <div className="font-body text-sm text-stone-400 mb-2">Question {index + 1}</div>
        <h4 className="font-display text-xl font-medium mb-6">{q.question}</h4>

        <div className="grid grid-cols-2 gap-4 mb-4">
          {q.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => !showQuizResults && setQuizAnswers({ ...quizAnswers, [index]: opt.id })}
              disabled={showQuizResults}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                answered === opt.id
                  ? showQuizResults
                    ? isCorrect
                      ? 'border-[#2d6a4f] bg-[#2d6a4f]/5'
                      : 'border-[#c26e4a] bg-[#c26e4a]/5'
                    : 'border-stone-900 bg-stone-50'
                  : showQuizResults && opt.id === q.correct
                    ? 'border-[#2d6a4f] bg-[#2d6a4f]/5'
                    : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="font-body font-medium text-stone-900">{opt.label}</div>
              <div className="font-body text-sm text-stone-500">{opt.desc}</div>
            </button>
          ))}
        </div>

        {showQuizResults && answered && (
          <div className={`p-4 rounded-xl ${isCorrect ? 'bg-[#2d6a4f]/10' : 'bg-[#c26e4a]/10'}`}>
            <div className={`font-body font-medium mb-1 ${isCorrect ? 'text-[#2d6a4f]' : 'text-[#c26e4a]'}`}>
              {isCorrect ? '✓ Correct!' : '✗ Not quite'}
            </div>
            <div className="font-body text-sm text-stone-600">{q.explanation}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#faf6f1] text-stone-900">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&family=DM+Sans:wght@400;500;600&display=swap');

        .font-display { font-family: 'Newsreader', Georgia, serif; }
        .font-body { font-family: 'DM Sans', system-ui, sans-serif; }

        .section-hidden { opacity: 0; transform: translateY(40px); }
        .section-visible {
          opacity: 1;
          transform: translateY(0);
          transition: all 0.9s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .story-card {
          background: linear-gradient(180deg, #fff 0%, #fdfcfa 100%);
        }

        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
        }

        input[type="range"]::-webkit-slider-track {
          height: 8px;
          border-radius: 4px;
          background: #e8e0d5;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #1a1a1a;
          margin-top: -10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          transition: transform 0.2s ease;
        }

        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }

        input[type="range"]::-moz-range-track {
          height: 8px;
          border-radius: 4px;
          background: #e8e0d5;
        }

        input[type="range"]::-moz-range-thumb {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #1a1a1a;
          border: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .nav-dot {
          transition: all 0.3s ease;
        }

        .nav-dot:hover {
          transform: scale(1.3);
        }
      `}</style>

      {/* Section Navigation */}
      <nav className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-2">
        {sectionNames.map((name, i) => (
          <button
            key={i}
            onClick={() => scrollToSection(i)}
            className="nav-dot group flex items-center justify-end gap-2"
            title={name}
          >
            <span className={`font-body text-xs transition-opacity ${activeSection === i ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} text-stone-500`}>
              {name}
            </span>
            <div
              className={`rounded-full transition-all ${
                activeSection === i
                  ? 'w-3 h-3 bg-stone-900'
                  : visibleSections.has(i)
                    ? 'w-2 h-2 bg-stone-400'
                    : 'w-2 h-2 bg-stone-300'
              }`}
            />
          </button>
        ))}
      </nav>

      {/* Share Button */}
      <button
        onClick={handleShare}
        className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-stone-200 shadow-sm hover:shadow-md transition-all font-body text-sm text-stone-600 hover:text-stone-900"
      >
        {copied ? (
          <>
            <svg className="w-4 h-4 text-[#2d6a4f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </>
        )}
      </button>

      {/* Hero */}
      <section
        ref={setSectionRef(0)}
        className={`min-h-screen flex flex-col items-center justify-center px-5 py-16 ${isVisible(0) ? 'section-visible' : 'section-hidden'}`}
      >
        <div className="max-w-lg mx-auto text-center">
          <p className="font-body text-sm tracking-[0.3em] text-stone-400 uppercase mb-8">An Interactive Essay</p>
          <h1 className="font-display text-5xl md:text-7xl font-medium leading-tight mb-8 text-stone-900">
            The Art of<br />
            <span className="italic">Precision</span> &amp; <span className="italic">Recall</span>
          </h1>
          <div className="mb-12">
            <BalanceIllustration />
          </div>
          <p className="font-body text-xl text-stone-600 leading-relaxed mb-12">
            Every prediction system makes a fundamental choice:
            cast a wide net, or aim with precision.
          </p>
          <div className="flex flex-col items-center gap-2 text-stone-400">
            <span className="font-body text-base">Scroll to explore</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-bounce">
              <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </section>

      {/* Story 1: Email */}
      <section ref={setSectionRef(1)} className={`py-20 md:py-32 px-5 ${isVisible(1) ? 'section-visible' : 'section-hidden'}`}>
        <div className="max-w-xl mx-auto">
          <div className="mb-4">
            <span className="font-body text-sm tracking-[0.2em] text-stone-400 uppercase">Story 01</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-medium mb-6 leading-tight">The Spam Filter</h2>
          <div className="story-card rounded-2xl p-6 md:p-10 border border-stone-200 shadow-sm mb-8">
            <EmailIllustration animate={isVisible(1)} />
          </div>
          <div className="space-y-6 font-body text-stone-600 leading-relaxed">
            <p>Your email filter faces an impossible choice every second. Hundreds of messages arrive, some important, some junk.</p>
            <p><span className="text-stone-900 font-medium">Too strict?</span> Important emails from your boss end up in spam. You miss the meeting invite. Awkward.</p>
            <p><span className="text-stone-900 font-medium">Too loose?</span> Nigerian princes flood your inbox. You waste time deleting garbage.</p>
          </div>
          <div className="mt-10 p-5 bg-stone-100/50 rounded-xl border-l-4 border-stone-300">
            <p className="font-body text-base text-stone-600">
              <span className="font-medium text-stone-700">The verdict:</span> Most email filters lean toward
              <span className="text-[#c26e4a] font-medium"> high precision</span> — they&apos;d rather let some spam through than block a real email.
            </p>
          </div>
        </div>
      </section>

      {/* Story 2: Medical */}
      <section ref={setSectionRef(2)} className={`py-20 md:py-32 px-5 bg-white ${isVisible(2) ? 'section-visible' : 'section-hidden'}`}>
        <div className="max-w-xl mx-auto">
          <div className="mb-4">
            <span className="font-body text-sm tracking-[0.2em] text-stone-400 uppercase">Story 02</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-medium mb-6 leading-tight">Cancer Screening</h2>
          <div className="story-card rounded-2xl p-6 md:p-10 border border-stone-200 shadow-sm mb-8">
            <MedicalIllustration animate={isVisible(2)} />
          </div>
          <div className="space-y-6 font-body text-stone-600 leading-relaxed">
            <p>A pathologist examines a tissue sample. Some cells look normal. Others are ambiguous. One looks suspicious.</p>
            <p><span className="text-stone-900 font-medium">Flag everything suspicious?</span> Many healthy patients undergo stressful biopsies, sleepless nights waiting for results.</p>
            <p><span className="text-stone-900 font-medium">Only flag the obvious?</span> Early-stage cancers slip through. A treatable disease becomes terminal.</p>
          </div>
          <div className="mt-10 p-5 bg-stone-100/50 rounded-xl border-l-4 border-[#2d6a4f]">
            <p className="font-body text-base text-stone-600">
              <span className="font-medium text-stone-700">The verdict:</span> Medical screening prioritizes
              <span className="text-[#2d6a4f] font-medium"> high recall</span> — better to investigate 100 false alarms than miss one real cancer.
            </p>
          </div>
        </div>
      </section>

      {/* Story 3: Car */}
      <section ref={setSectionRef(3)} className={`py-20 md:py-32 px-5 ${isVisible(3) ? 'section-visible' : 'section-hidden'}`}>
        <div className="max-w-xl mx-auto">
          <div className="mb-4">
            <span className="font-body text-sm tracking-[0.2em] text-stone-400 uppercase">Story 03</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-medium mb-6 leading-tight">The Self-Driving Car</h2>
          <div className="story-card rounded-2xl p-6 md:p-10 border border-stone-200 shadow-sm mb-8">
            <CarIllustration animate={isVisible(3)} />
          </div>
          <div className="space-y-6 font-body text-stone-600 leading-relaxed">
            <p>The car&apos;s sensors scan the road ahead. A shape appears. Is it a pedestrian? A shadow? A plastic bag?</p>
            <p><span className="text-stone-900 font-medium">Brake for everything?</span> The car jerks to a halt at every shadow, every bird, every plastic bag. Passengers get whiplash.</p>
            <p><span className="text-stone-900 font-medium">Only brake for certainties?</span> One real pedestrian gets classified as a false positive. Unthinkable.</p>
          </div>
          <div className="mt-10 p-5 bg-stone-100/50 rounded-xl border-l-4 border-[#2d6a4f]">
            <p className="font-body text-base text-stone-600">
              <span className="font-medium text-stone-700">The verdict:</span> Autonomous vehicles demand
              <span className="text-[#2d6a4f] font-medium"> extremely high recall</span> for pedestrian detection — even if it means some false brakes.
            </p>
          </div>
        </div>
      </section>

      {/* Story 4: Fraud */}
      <section ref={setSectionRef(4)} className={`py-20 md:py-32 px-5 bg-white ${isVisible(4) ? 'section-visible' : 'section-hidden'}`}>
        <div className="max-w-xl mx-auto">
          <div className="mb-4">
            <span className="font-body text-sm tracking-[0.2em] text-stone-400 uppercase">Story 04</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-medium mb-6 leading-tight">Fraud Detection</h2>
          <div className="story-card rounded-2xl p-6 md:p-10 border border-stone-200 shadow-sm mb-8">
            <FraudIllustration animate={isVisible(4)} />
          </div>
          <div className="space-y-6 font-body text-stone-600 leading-relaxed">
            <p>A transaction hits the system. $847 at an electronics store in a city you&apos;ve never visited. Fraud? Or vacation?</p>
            <p><span className="text-stone-900 font-medium">Block suspicious transactions?</span> Your legitimate purchase gets declined. Embarrassing at checkout.</p>
            <p><span className="text-stone-900 font-medium">Let more through?</span> Fraudsters drain accounts. Customers lose trust.</p>
          </div>
          <div className="mt-10 p-5 bg-stone-100/50 rounded-xl border-l-4 border-stone-400">
            <p className="font-body text-base text-stone-600">
              <span className="font-medium text-stone-700">The verdict:</span> Banks try to
              <span className="text-stone-700 font-medium"> balance both</span> — using sophisticated models that weigh transaction patterns.
            </p>
          </div>
        </div>
      </section>

      {/* Story 5: Content */}
      <section ref={setSectionRef(5)} className={`py-20 md:py-32 px-5 ${isVisible(5) ? 'section-visible' : 'section-hidden'}`}>
        <div className="max-w-xl mx-auto">
          <div className="mb-4">
            <span className="font-body text-sm tracking-[0.2em] text-stone-400 uppercase">Story 05</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-medium mb-6 leading-tight">Content Moderation</h2>
          <div className="story-card rounded-2xl p-6 md:p-10 border border-stone-200 shadow-sm mb-8">
            <ContentIllustration animate={isVisible(5)} />
          </div>
          <div className="space-y-6 font-body text-stone-600 leading-relaxed">
            <p>Millions of posts flood the platform every hour. Some are news. Some are hate speech disguised as satire.</p>
            <p><span className="text-stone-900 font-medium">Remove aggressively?</span> Legitimate journalism and political dissent get caught. Outcry over censorship.</p>
            <p><span className="text-stone-900 font-medium">Remove cautiously?</span> Harmful content spreads. Misinformation goes viral.</p>
          </div>
          <div className="mt-10 p-5 bg-stone-100/50 rounded-xl border-l-4 border-[#c26e4a]">
            <p className="font-body text-base text-stone-600">
              <span className="font-medium text-stone-700">The verdict:</span> Platforms often lean toward
              <span className="text-[#c26e4a] font-medium"> higher precision</span> for borderline content, using human reviewers for edge cases.
            </p>
          </div>
        </div>
      </section>

      {/* Story 6: Search */}
      <section ref={setSectionRef(6)} className={`py-20 md:py-32 px-5 bg-white ${isVisible(6) ? 'section-visible' : 'section-hidden'}`}>
        <div className="max-w-xl mx-auto">
          <div className="mb-4">
            <span className="font-body text-sm tracking-[0.2em] text-stone-400 uppercase">Story 06</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-medium mb-6 leading-tight">Search Results</h2>
          <div className="story-card rounded-2xl p-6 md:p-10 border border-stone-200 shadow-sm mb-8">
            <SearchIllustration animate={isVisible(6)} />
          </div>
          <div className="space-y-6 font-body text-stone-600 leading-relaxed">
            <p>You search for &ldquo;best Italian restaurant.&rdquo; The algorithm has seconds to rank thousands of possibilities.</p>
            <p><span className="text-stone-900 font-medium">Show everything related?</span> Page one is cluttered with tangentially relevant results.</p>
            <p><span className="text-stone-900 font-medium">Show only perfect matches?</span> The hidden gem — that tiny family trattoria — never makes the cut.</p>
          </div>
          <div className="mt-10 p-5 bg-stone-100/50 rounded-xl border-l-4 border-[#c26e4a]">
            <p className="font-body text-base text-stone-600">
              <span className="font-medium text-stone-700">The verdict:</span> Search engines optimize for
              <span className="text-[#c26e4a] font-medium"> precision at the top</span> — the first few results must be highly relevant.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Section */}
      <section ref={setSectionRef(7)} className={`py-20 md:py-32 px-5 ${isVisible(7) ? 'section-visible' : 'section-hidden'}`}>
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-body text-sm tracking-[0.2em] text-stone-400 uppercase mb-4">Interactive</p>
            <h2 className="font-display text-4xl md:text-5xl font-medium mb-4">Feel the Tradeoff</h2>
            <p className="font-body text-lg text-stone-500">Drag the slider to shift the balance</p>
          </div>
          <div className="bg-white rounded-2xl p-6 md:p-10 border border-stone-200 shadow-sm mb-8">
            <div className="mb-10">
              <BalanceIllustration />
            </div>
            <div className="mb-8">
              <input
                type="range"
                min="0"
                max="100"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between mt-3 font-body text-sm text-stone-400">
                <span>← High Recall</span>
                <span>High Precision →</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              <div className="text-center p-4 md:p-6 rounded-xl bg-[#2d6a4f]/5 border border-[#2d6a4f]/20">
                <div className="font-display text-4xl md:text-5xl font-medium text-[#2d6a4f] mb-1">{metrics.recall}%</div>
                <div className="font-body text-base text-stone-500 mb-2">Recall</div>
                <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#2d6a4f] transition-all duration-300 rounded-full" style={{ width: `${metrics.recall}%` }} />
                </div>
              </div>
              <div className="text-center p-4 md:p-6 rounded-xl bg-[#c26e4a]/5 border border-[#c26e4a]/20">
                <div className="font-display text-4xl md:text-5xl font-medium text-[#c26e4a] mb-1">{metrics.precision}%</div>
                <div className="font-body text-base text-stone-500 mb-2">Precision</div>
                <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#c26e4a] transition-all duration-300 rounded-full" style={{ width: `${metrics.precision}%` }} />
                </div>
              </div>
            </div>
          </div>
          <div className={`p-5 rounded-xl transition-all duration-500 ${threshold < 50 ? 'bg-[#2d6a4f]/5 border border-[#2d6a4f]/20' : 'bg-[#c26e4a]/5 border border-[#c26e4a]/20'}`}>
            {threshold < 50 ? (
              <div className="font-body text-base text-stone-600">
                <span className="font-medium text-[#2d6a4f]">High Recall Mode</span>
                <p className="mt-2">Casting a wide net. You catch almost everything, but some false alarms slip in.</p>
              </div>
            ) : (
              <div className="font-body text-base text-stone-600">
                <span className="font-medium text-[#c26e4a]">High Precision Mode</span>
                <p className="mt-2">Taking careful aim. What you catch is accurate, but some targets slip away.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Confusion Matrix Section */}
      <section ref={setSectionRef(8)} className={`py-20 md:py-32 px-5 bg-white ${isVisible(8) ? 'section-visible' : 'section-hidden'}`}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-body text-sm tracking-[0.2em] text-stone-400 uppercase mb-4">Visualization</p>
            <h2 className="font-display text-4xl md:text-5xl font-medium mb-4">See the Numbers</h2>
            <p className="font-body text-lg text-stone-500">Watch dots move as you adjust the threshold above</p>
          </div>
          <ConfusionMatrix />
        </div>
      </section>

      {/* Formulas */}
      <section ref={setSectionRef(9)} className={`py-20 md:py-32 px-5 ${isVisible(9) ? 'section-visible' : 'section-hidden'}`}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-body text-sm tracking-[0.2em] text-stone-400 uppercase mb-4">The Mathematics</p>
            <h2 className="font-display text-4xl md:text-5xl font-medium">Simple Formulas,<br />Profound Implications</h2>
          </div>
          <div className="grid gap-6">
            <FormulaCard
              title="RECALL"
              formula={<span><span className="text-[#2d6a4f]">TP</span><span className="text-stone-300"> / (</span><span className="text-[#2d6a4f]">TP</span><span className="text-stone-300"> + </span><span className="text-[#c26e4a]">FN</span><span className="text-stone-300">)</span></span>}
              question="Of all the actual positives, how many did we catch?"
              color="#2d6a4f"
              terms={[
                { symbol: 'TP', meaning: 'True Positives — correctly identified', color: '#2d6a4f' },
                { symbol: 'FN', meaning: 'False Negatives — missed', color: '#c26e4a' },
              ]}
            />
            <FormulaCard
              title="PRECISION"
              formula={<span><span className="text-[#2d6a4f]">TP</span><span className="text-stone-300"> / (</span><span className="text-[#2d6a4f]">TP</span><span className="text-stone-300"> + </span><span className="text-[#c26e4a]">FP</span><span className="text-stone-300">)</span></span>}
              question="Of all our positive predictions, how many were correct?"
              color="#c26e4a"
              terms={[
                { symbol: 'TP', meaning: 'True Positives — correct predictions', color: '#2d6a4f' },
                { symbol: 'FP', meaning: 'False Positives — wrong predictions', color: '#c26e4a' },
              ]}
            />
          </div>
        </div>
      </section>

      {/* F1 Score Section */}
      <section ref={setSectionRef(10)} className={`py-20 md:py-32 px-5 bg-white ${isVisible(10) ? 'section-visible' : 'section-hidden'}`}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-body text-sm tracking-[0.2em] text-stone-400 uppercase mb-4">Bonus Concept</p>
            <h2 className="font-display text-4xl md:text-5xl font-medium mb-4">The F1 Score</h2>
            <p className="font-body text-lg text-stone-500">When you need a single number that balances both</p>
          </div>

          <div className="bg-gradient-to-br from-stone-50 to-white rounded-2xl p-6 md:p-10 border border-stone-200 shadow-sm">
            <div className="text-center mb-8">
              <div className="font-display text-6xl md:text-7xl font-medium text-stone-900 mb-2">{f1Score}%</div>
              <div className="font-body text-lg text-stone-500">Current F1 Score</div>
            </div>

            <div className="font-serif text-2xl md:text-3xl text-center mb-8">
              F1 = 2 × <span className="text-[#c26e4a]">(P × R)</span> / <span className="text-stone-400">(P + R)</span>
            </div>

            <div className="bg-white rounded-xl p-5 border border-stone-200 mb-6">
              <h4 className="font-body font-medium text-stone-900 mb-2">Harmonic Mean</h4>
              <p className="font-body text-stone-600 text-sm leading-relaxed">
                The F1 score is the <em>harmonic mean</em> of precision and recall. Unlike the regular average,
                it penalizes extreme imbalances. If either precision or recall is very low, F1 will be low too.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-[#2d6a4f]/5">
                <div className="font-display text-2xl font-medium text-[#2d6a4f]">{metrics.recall}%</div>
                <div className="font-body text-sm text-stone-500">Recall</div>
              </div>
              <div className="p-4 rounded-xl bg-stone-100">
                <div className="font-display text-2xl font-medium text-stone-700">{f1Score}%</div>
                <div className="font-body text-sm text-stone-500">F1</div>
              </div>
              <div className="p-4 rounded-xl bg-[#c26e4a]/5">
                <div className="font-display text-2xl font-medium text-[#c26e4a]">{metrics.precision}%</div>
                <div className="font-body text-sm text-stone-500">Precision</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quiz Section */}
      <section ref={setSectionRef(11)} className={`py-20 md:py-32 px-5 ${isVisible(11) ? 'section-visible' : 'section-hidden'}`}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-body text-sm tracking-[0.2em] text-stone-400 uppercase mb-4">Test Yourself</p>
            <h2 className="font-display text-4xl md:text-5xl font-medium mb-4">Which Matters More?</h2>
            <p className="font-body text-lg text-stone-500">Apply what you&apos;ve learned to real scenarios</p>
          </div>

          <div className="space-y-6">
            {quizQuestions.map((q, i) => (
              <QuizQuestion key={i} q={q} index={i} />
            ))}
          </div>

          {Object.keys(quizAnswers).length === quizQuestions.length && !showQuizResults && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setShowQuizResults(true)}
                className="px-8 py-3 bg-stone-900 text-white rounded-full font-body font-medium hover:bg-stone-800 transition-colors"
              >
                Check Answers
              </button>
            </div>
          )}

          {showQuizResults && (
            <div className="mt-8 p-6 bg-white rounded-2xl border border-stone-200 text-center">
              <div className="font-display text-3xl font-medium mb-2">
                {quizQuestions.filter((q, i) => quizAnswers[i] === q.correct).length} / {quizQuestions.length}
              </div>
              <p className="font-body text-stone-500">
                {quizQuestions.filter((q, i) => quizAnswers[i] === q.correct).length === quizQuestions.length
                  ? 'Perfect! You understand the tradeoff.'
                  : 'Good effort! Review the explanations above.'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Conclusion */}
      <section ref={setSectionRef(12)} className={`py-24 md:py-40 px-5 bg-white ${isVisible(12) ? 'section-visible' : 'section-hidden'}`}>
        <div className="max-w-lg mx-auto text-center">
          <div className="mb-10">
            <BalanceIllustration />
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-medium mb-8 leading-tight">The Fundamental<br />Tradeoff</h2>
          <div className="font-body text-xl text-stone-600 leading-relaxed space-y-6 mb-12">
            <p>You cannot maximize both.</p>
            <p>Improving recall usually hurts precision. Improving precision usually hurts recall.</p>
            <p className="text-stone-900 font-medium">The art is knowing which matters more.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="p-5 rounded-xl bg-[#2d6a4f]/5 border border-[#2d6a4f]/20">
              <div className="font-body text-base font-medium text-[#2d6a4f] mb-2">Prioritize Recall</div>
              <p className="font-body text-sm text-stone-500 leading-relaxed">When missing something is catastrophic: disease, fraud, safety threats</p>
            </div>
            <div className="p-5 rounded-xl bg-[#c26e4a]/5 border border-[#c26e4a]/20">
              <div className="font-body text-base font-medium text-[#c26e4a] mb-2">Prioritize Precision</div>
              <p className="font-body text-sm text-stone-500 leading-relaxed">When false alarms are costly: user trust, recommendations, content</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-5 border-t border-stone-200">
        <div className="max-w-xl mx-auto text-center space-y-3">
          <p className="font-body text-sm text-stone-400 tracking-wide">An interactive essay on machine learning fundamentals</p>
          <p className="font-body text-sm text-stone-500">By <span className="text-stone-700">jerrysoer</span> & <span className="text-stone-700">Claude</span></p>
        </div>
      </footer>
    </div>
  );
};

export default PrecisionRecallExplainer;
