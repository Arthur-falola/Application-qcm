/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Stethoscope, 
  Brain, 
  Dna, 
  Heart, 
  TestTube, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { Subject, MCQ, QuizState } from './types';
import { generateMCQs, askQuestionAboutMCQ } from './lib/gemini';

const SUBJECTS: { id: Subject; icon: any; color: string }[] = [
  { id: 'Anatomie', icon: Heart, color: 'text-rose-500' },
  { id: 'Biologie Humaine', icon: Dna, color: 'text-indigo-500' },
  { id: 'Physiologie', icon: Brain, color: 'text-amber-500' },
  { id: 'Pathologie', icon: Stethoscope, color: 'text-emerald-500' },
  { id: 'Biochimie', icon: TestTube, color: 'text-violet-500' },
];

export default function App() {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [quizState, setQuizState] = useState<QuizState | null>(null);

  const selectedSubjectIcon = selectedSubject ? SUBJECTS.find(s => s.id === selectedSubject)?.icon : null;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const startQuiz = async (subject: Subject) => {
    setLoading(true);
    setError(null);
    setSelectedSubject(subject);
    try {
      const mcqs = await generateMCQs(subject);
      setQuizState({
        currentQuestionIndex: 0,
        score: 0,
        answers: [],
        isFinished: false,
        questions: mcqs
      });
    } catch (err) {
      setError("Impossible de générer le quiz. Veuillez réessayer.");
      setSelectedSubject(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (optionIndex: number) => {
    if (selectedOption !== null || !quizState) return;
    
    setSelectedOption(optionIndex);
    const isCorrect = optionIndex === quizState.questions[quizState.currentQuestionIndex].correctAnswerIndex;
    
    setTimeout(() => {
      setShowExplanation(true);
    }, 500);
  };

  const [aiQuestion, setAiQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [askingAi, setAskingAi] = useState(false);

  const askAi = async () => {
    if (!aiQuestion.trim() || !quizState) return;
    setAskingAi(true);
    try {
      const response = await askQuestionAboutMCQ(quizState.questions[quizState.currentQuestionIndex], aiQuestion);
      setAiResponse(response);
      setAiQuestion("");
    } catch (err) {
      setError("Désolé, l'IA est occupée.");
    } finally {
      setAskingAi(false);
    }
  };

  const nextQuestion = () => {
    if (!quizState) return;
    
    const isCorrect = selectedOption === quizState.questions[quizState.currentQuestionIndex].correctAnswerIndex;
    const nextIndex = quizState.currentQuestionIndex + 1;
    const isFinished = nextIndex >= quizState.questions.length;
    
    setQuizState({
      ...quizState,
      currentQuestionIndex: nextIndex,
      score: quizState.score + (isCorrect ? 1 : 0),
      isFinished,
    });
    setSelectedOption(null);
    setShowExplanation(false);
    setAiResponse(null);
    setAiQuestion("");
  };

  const resetQuiz = () => {
    setSelectedSubject(null);
    setQuizState(null);
    setError(null);
  };

  return (
    <div className="min-h-screen font-sans">
      {/* Header */}
      <nav className="bg-white border-b border-gray-100 px-8 py-6 sticky top-0 z-50">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex flex-col" onClick={resetQuiz} style={{ cursor: 'pointer' }}>
            <span className="label-caps mb-1">MedQuiz Assistant v1.0</span>
            <h1 className="text-2xl font-serif leading-tight text-slate-dark">
              Culture <span className="italic-serif">Générale</span>
            </h1>
          </div>
          {selectedSubject && selectedSubjectIcon && (
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-gray-100">
               {(() => {
                 const Icon = selectedSubjectIcon;
                 return <Icon className="w-5 h-5 text-brand-blue" />;
               })()}
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-md mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {!selectedSubject ? (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              <div className="space-y-4 text-center">
                <h2 className="text-5xl font-serif text-slate-dark leading-none">
                  00 <br />
                  <span className="text-xl italic-serif block mt-2">Bienvenue Docteur</span>
                </h2>
                <p className="text-slate-grey text-sm font-medium tracking-wide">
                  Sélectionnez votre champ d'expertise pour débuter la session.
                </p>
              </div>

              <div className="space-y-4">
                {SUBJECTS.map((subject, idx) => (
                  <button
                    key={subject.id}
                    onClick={() => startQuiz(subject.id)}
                    className="w-full text-left p-6 rounded-2xl border border-gray-200 hover:border-brand-blue hover:bg-blue-50 bg-white group transition-all duration-300"
                  >
                    <div className="flex items-center gap-6">
                      <span className="text-4xl font-serif font-bold text-slate-100 group-hover:text-brand-blue transition-colors">
                        0{idx + 1}
                      </span>
                      <div className="flex-1 border-l border-gray-100 pl-6 space-y-1">
                        <h3 className="font-serif text-lg text-slate-dark">{subject.id}</h3>
                        <p className="text-[10px] uppercase tracking-widest text-slate-light font-bold">Assistant IA Actif</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-brand-blue" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24 space-y-8"
            >
              <div className="relative">
                <motion.div 
                  className="w-20 h-20 border-[1px] border-slate-200 border-t-brand-blue rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-serif italic text-brand-blue">
                  IA
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-slate-dark font-serif text-lg italic">Analyse des ressources...</p>
                <p className="label-caps opacity-50">Génération de QCM de haut niveau</p>
              </div>
            </motion.div>
          ) : quizState && !quizState.isFinished ? (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              {/* Question Meta */}
              <div className="flex items-baseline gap-4">
                <span className="text-6xl font-serif font-bold text-brand-blue">
                  {quizState.currentQuestionIndex + 1 < 10 ? `0${quizState.currentQuestionIndex + 1}` : quizState.currentQuestionIndex + 1}
                </span>
                <span className="text-sm font-serif italic text-slate-light uppercase tracking-widest">
                  / {selectedSubject}
                </span>
              </div>

              {/* Question Content */}
              <div className="space-y-10">
                <h3 className="text-2xl font-serif text-slate-dark leading-relaxed">
                  {quizState.questions[quizState.currentQuestionIndex].question}
                </h3>

                <div className="space-y-4">
                  {quizState.questions[quizState.currentQuestionIndex].options.map((option, idx) => {
                    const isCorrect = idx === quizState.questions[quizState.currentQuestionIndex].correctAnswerIndex;
                    const isSelected = selectedOption === idx;
                    const letter = String.fromCharCode(65 + idx);
                    
                    let bgClass = "border-gray-200 hover:border-brand-blue hover:bg-blue-50";
                    let letterColor = "text-slate-light";

                    if (selectedOption !== null) {
                      if (isCorrect) {
                        bgClass = "border-brand-blue bg-blue-50 text-brand-blue ring-1 ring-brand-blue";
                        letterColor = "text-brand-blue";
                      } else if (isSelected) {
                        bgClass = "border-rose-300 bg-rose-50 text-rose-900 ring-1 ring-rose-300";
                        letterColor = "text-rose-500";
                      } else {
                        bgClass = "opacity-40 border-gray-100 grayscale";
                        letterColor = "text-slate-200";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={selectedOption !== null}
                        onClick={() => handleAnswer(idx)}
                        className={`w-full p-6 bg-white rounded-xl border text-left flex items-center gap-6 transition-all duration-300 ${bgClass}`}
                      >
                        <span className={`text-xs font-bold font-sans tracking-widest ${letterColor}`}>{letter}</span>
                        <span className="font-serif text-base">{option}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AI & Navigation */}
              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    <div className="p-8 bg-slate-50 border-t border-b border-gray-100 space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="label-caps underline decoration-brand-blue/30 underline-offset-4">Analyse de la réponse</span>
                        <Sparkles className="w-4 h-4 text-brand-blue opacity-30" />
                      </div>
                      
                      <p className="font-serif italic text-slate-grey leading-relaxed">
                        {quizState.questions[quizState.currentQuestionIndex].explanation}
                      </p>

                      <div className="pt-6 border-t border-slate-200 space-y-4">
                        <AnimatePresence>
                          {aiResponse && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="bg-white p-4 rounded-lg text-sm italic text-slate-grey border border-gray-100 shadow-sm"
                            >
                              <strong className="text-brand-blue block mb-2 font-serif non-italic">Annotation de l'expert :</strong>
                              {aiResponse}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={aiQuestion}
                            onChange={(e) => setAiQuestion(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && askAi()}
                            placeholder="Demander une précision..."
                            className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm font-serif focus:outline-none focus:border-brand-blue transition-colors"
                          />
                          <button 
                            onClick={askAi}
                            disabled={askingAi || !aiQuestion.trim()}
                            className="bg-brand-blue text-white w-12 h-12 rounded-lg flex items-center justify-center disabled:opacity-30 transition-all active:scale-90"
                          >
                            {askingAi ? (
                               <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                               >
                                 <RotateCcw className="w-4 h-4" />
                               </motion.div>
                            ) : (
                              <ChevronRight className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={nextQuestion}
                      className="w-full bg-slate-dark text-white py-5 rounded-2xl font-serif text-lg hover:bg-brand-blue transition-colors shadow-xl shadow-slate-200"
                    >
                      {quizState.currentQuestionIndex === quizState.questions.length - 1 ? "Terminer la session" : "Continuer"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Progress Footer */}
              {!showExplanation && (
                <div className="pt-10">
                  <div className="flex justify-between items-end mb-4">
                    <div className="flex flex-col">
                      <span className="label-caps text-slate-light">Progression</span>
                      <span className="text-sm font-serif italic text-slate-dark">
                        {quizState.questions.length - (quizState.currentQuestionIndex + 1)} questions restantes
                      </span>
                    </div>
                    <div className="w-1/3 h-1 bg-slate-100 rounded-full overflow-hidden">
                       <motion.div 
                        className="h-full bg-brand-blue"
                        initial={{ width: 0 }}
                        animate={{ width: `${((quizState.currentQuestionIndex + 1) / quizState.questions.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : quizState?.isFinished ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-12 py-12"
            >
              <div className="space-y-6">
                <div className="inline-block px-4 py-1 bg-blue-50 text-brand-blue rounded-full text-[10px] font-bold tracking-[0.3em] uppercase">
                  Session Terminée
                </div>
                <h2 className="text-7xl font-serif font-bold text-slate-dark tracking-tighter">
                  {Math.round((quizState.score / quizState.questions.length) * 100)}%
                </h2>
                <div className="space-y-1">
                  <p className="text-2xl font-serif italic text-slate-grey">Félicitations,</p>
                  <p className="text-sm font-medium text-slate-light uppercase tracking-widest">Score: {quizState.score} / {quizState.questions.length}</p>
                </div>
              </div>

              <div className="bg-white border border-gray-100 p-10 rounded-[40px] shadow-xl space-y-12">
                <p className="font-serif text-slate-grey leading-relaxed italic">
                   "L'éducation n'est pas l'apprentissage de faits, mais l'entraînement de l'esprit à penser."
                   <span className="block mt-4 non-italic text-[10px] font-bold text-brand-blue tracking-[0.2em] uppercase">— Albert Einstein</span>
                </p>

                <div className="space-y-4">
                  <button
                    onClick={() => startQuiz(selectedSubject!)}
                    className="w-full bg-brand-blue text-white py-5 rounded-2xl font-serif text-lg shadow-xl shadow-blue-100"
                  >
                    Reprendre l'étude
                  </button>
                  <button
                    onClick={resetQuiz}
                    className="w-full bg-white text-slate-dark border border-gray-200 py-5 rounded-2xl font-serif text-lg"
                  >
                    Changer de sujet
                  </button>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>
      
      {/* Footer Info */}
      <footer className="max-w-md mx-auto px-6 py-12 opacity-40 text-center space-y-2">
        <p className="label-caps tracking-[0.3em] font-sans">
          Powered by Gemini AI Engine
        </p>
        <p className="text-[9px] text-slate-grey font-serif italic">
          Edition Spéciale — Études Médicales
        </p>
      </footer>
    </div>
  );
}

