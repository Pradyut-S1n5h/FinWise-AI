import React, { useState } from 'react';
import {
  BookOpen,
  Award,
  CheckCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { EDUCATION_LESSONS, EducationLesson } from '../../data/education';

export const EducationView: React.FC = () => {
  const [selectedLesson, setSelectedLesson] = useState<EducationLesson | null>(EDUCATION_LESSONS[0]);
  const [completedQuizIds, setCompletedQuizIds] = useState<Record<string, boolean>>({});
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState(false);

  const totalLessons = EDUCATION_LESSONS.length;
  const completedCount = Object.keys(completedQuizIds).length;
  const progressPercent = Math.round((completedCount / totalLessons) * 100);

  const handleSelectAnswer = (index: number) => {
    if (showQuizResult) return;
    setSelectedQuizAnswer(index);
    setShowQuizResult(true);

    if (selectedLesson && index === selectedLesson.quiz.correctIndex) {
      setCompletedQuizIds((prev) => ({ ...prev, [selectedLesson.id]: true }));
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (_e) {
        // Safe if canvas unavailable
      }
    }
  };

  const handleNextLesson = () => {
    if (!selectedLesson) return;
    const currentIdx = EDUCATION_LESSONS.findIndex((l) => l.id === selectedLesson.id);
    if (currentIdx < EDUCATION_LESSONS.length - 1) {
      const next = EDUCATION_LESSONS[currentIdx + 1];
      setSelectedLesson(next);
      setSelectedQuizAnswer(null);
      setShowQuizResult(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Progress Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Financial Literacy & Education Centre
            </h1>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Interactive Quizzes
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Practical, age-appropriate personal finance principles designed for students and young earners
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {completedCount} of {totalLessons} Modules Mastered
            </div>
            <div className="text-[10px] text-slate-400">Learning Progress: {progressPercent}%</div>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <Award className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Two-Column View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Lessons Directory */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-2">
            Course Curriculum
          </h2>

          <div className="space-y-1">
            {EDUCATION_LESSONS.map((lesson, idx) => {
              const isSelected = selectedLesson?.id === lesson.id;
              const isDone = Boolean(completedQuizIds[lesson.id]);

              return (
                <button
                  key={lesson.id}
                  onClick={() => {
                    setSelectedLesson(lesson);
                    setSelectedQuizAnswer(null);
                    setShowQuizResult(false);
                  }}
                  className={`w-full text-left rounded-xl p-3 text-xs transition-all flex items-start justify-between ${
                    isSelected
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-950 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-200 font-semibold shadow-xs'
                      : 'hover:bg-slate-50 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="space-y-1 pr-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Module {idx + 1} • {lesson.category}
                    </div>
                    <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                      {lesson.title}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {lesson.readTime}
                    </div>
                  </div>

                  {isDone ? (
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-1" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600 shrink-0 mt-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Lesson Content & Interactive Quiz */}
        {selectedLesson && (
          <div className="lg:col-span-2 space-y-6">
            {/* Lesson Article Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {selectedLesson.category}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {selectedLesson.readTime} read
                </span>
              </div>

              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {selectedLesson.title}
              </h2>

              {/* Key takeaways bullet box */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20 text-xs text-emerald-950 dark:text-emerald-200 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-emerald-600" /> Key Takeaways
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-emerald-900/90 dark:text-emerald-300">
                  {selectedLesson.keyTakeaways.map((k, i) => (
                    <li key={i}>{k}</li>
                  ))}
                </ul>
              </div>

              {/* Body Content */}
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {selectedLesson.content}
              </div>
            </div>

            {/* Interactive Mini-Quiz Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Knowledge Check: {selectedLesson.title}
                </h3>
              </div>

              <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                {selectedLesson.quiz.question}
              </p>

              {/* Options */}
              <div className="space-y-2">
                {selectedLesson.quiz.options.map((opt, optIdx) => {
                  const isChosen = selectedQuizAnswer === optIdx;
                  const isCorrect = optIdx === selectedLesson.quiz.correctIndex;

                  let style =
                    'border-slate-200 hover:border-slate-300 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200';
                  if (showQuizResult) {
                    if (isCorrect) {
                      style = 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 font-bold';
                    } else if (isChosen && !isCorrect) {
                      style = 'border-rose-500 bg-rose-50 text-rose-900 dark:bg-rose-950/60 dark:text-rose-200';
                    }
                  } else if (isChosen) {
                    style = 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectAnswer(optIdx)}
                      className={`w-full text-left rounded-xl border p-3 text-xs transition-all flex items-center justify-between ${style}`}
                    >
                      <span>{opt}</span>
                      {showQuizResult && isCorrect && (
                        <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Next */}
              {showQuizResult && (
                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60 space-y-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {selectedQuizAnswer === selectedLesson.quiz.correctIndex
                        ? '🎉 Spot on!'
                        : '💡 Helpful Context:'}
                    </span>
                    <p className="mt-1 text-slate-600 dark:text-slate-400">
                      {selectedLesson.quiz.explanation}
                    </p>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={handleNextLesson}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                    >
                      Next Lesson <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
