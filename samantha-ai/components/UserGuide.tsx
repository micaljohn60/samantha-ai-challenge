"use client";

import { useState } from "react";
import {
  X,
  Upload,
  Layers,
  Users,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  Github,
  ExternalLink,
} from "lucide-react";

interface Props {
  onClose: () => void;
}

const slides = [
  {
    icon: Sparkles,
    gradient: "from-blue-600 to-cyan-400",
    bg: "bg-gradient-to-br from-blue-600 to-cyan-400",
    title: "Welcome to Sammy.AI",
    description:
      "Your intelligent document management system for clinics. Eliminate manual data entry and let AI handle the heavy lifting.",
    points: [
      "AI-powered document field extraction",
      "Secure cloud storage with AWS S3",
      "Fast, searchable patient records",
    ],
  },
  {
    icon: Upload,
    gradient: "from-blue-500 to-indigo-500",
    bg: "bg-gradient-to-br from-blue-500 to-indigo-500",
    title: "Single Upload",
    description:
      "Upload one PDF at a time and let Google Gemini AI read and extract all the key information for you.",
    points: [
      "Select any clinic PDF : use the sample files on the dashboard to try it",
      "AI extracts patient name, date, GP, category and more",
      "Review the pre-filled form, edit if needed, then save",
    ],
  },
  {
    icon: Layers,
    gradient: "from-violet-500 to-purple-500",
    bg: "bg-gradient-to-br from-violet-500 to-purple-500",
    title: "Batch Upload",
    description:
      "Have a stack of documents to process? Upload them all at once and extraction runs in the background while you review.",
    points: [
      "Download all 3 sample files and select them together",
      "All files are uploaded and extracted simultaneously",
      "Work through the review queue at your own pace, no waiting",
    ],
  },
  {
    icon: Users,
    gradient: "from-emerald-500 to-teal-500",
    bg: "bg-gradient-to-br from-emerald-500 to-teal-500",
    title: "Patient Records",
    description:
      "Every document you save is linked to a patient. Browse, search, and access records from the Patients page.",
    points: [
      "Search patients by name instantly",
      "Click any patient to see their full document history",
      "Open documents directly in a new tab",
    ],
  },
  {
    icon: Github,
    gradient: "from-gray-700 to-slate-600",
    bg: "bg-gradient-to-br from-gray-800 to-slate-700",
    title: "Under the Hood",
    description:
      "Built with a modern full-stack architecture. Explore the source code and see how everything fits together.",
    points: [
      "Next.js 15 · React 19 · TypeScript · Tailwind CSS 4",
      "Google Gemini 2.5 Flash for AI extraction · AWS S3 for storage",
      "PostgreSQL · Upstash Redis · NextAuth · Deployed on EC2(future)",
    ],
    github: "https://github.com/micaljohn60/samantha-ai",
  },
];

export default function UserGuide({ onClose }: Props) {
  const [step, setStep] = useState(0);

  const slide = slides[step];
  const Icon = slide.icon;
  const isLast = step === slides.length - 1;
  const isFirst = step === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">

        {/* Visual header */}
        <div className={`${slide.bg} relative px-8 pt-10 pb-8 flex flex-col items-center text-center`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition"
          >
            <X size={15} />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
            <Icon size={30} className="text-white" />
          </div>

          <h2 className="text-xl font-bold text-white">{slide.title}</h2>
          <p className="text-white/80 text-sm mt-2 leading-relaxed">{slide.description}</p>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          <ul className="space-y-3">
            {slide.points.map((point, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className={`shrink-0 w-5 h-5 rounded-full bg-gradient-to-br ${slide.gradient} flex items-center justify-center mt-0.5`}>
                  <Check size={11} className="text-white" strokeWidth={3} />
                </span>
                <span className="text-sm text-gray-600 leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>

          {"github" in slide && (
            <a
              href={(slide as any).github}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition"
            >
              <Github size={16} />
              View on GitHub
              <ExternalLink size={12} className="text-gray-400" />
            </a>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 pb-6 flex items-center justify-between">
          {/* Progress dots */}
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`h-2 rounded-full transition-all ${
                  i === step
                    ? `w-6 bg-gradient-to-r ${slide.gradient}`
                    : "w-2 bg-gray-200 hover:bg-gray-300"
                }`}
              />
            ))}
          </div>

          {/* Nav buttons */}
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <ChevronLeft size={15} />
                Back
              </button>
            )}

            {isLast ? (
              <button
                onClick={onClose}
                className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${slide.gradient} hover:opacity-90 shadow-sm transition`}
              >
                Get Started
              </button>
            ) : (
              <button
                onClick={() => setStep((s) => s + 1)}
                className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${slide.gradient} hover:opacity-90 shadow-sm transition`}
              >
                Next
                <ChevronRight size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
