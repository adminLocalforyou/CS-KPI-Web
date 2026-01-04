
import React, { useState } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Trash2, 
  Zap, 
  Save, 
  FileText, 
  BrainCircuit, 
  PlusCircle, 
  Trash,
  X,
  Edit2,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  Loader2,
  Target,
  Type as TypeIcon,
  ListChecks,
  PenTool
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { AssessmentRecord, TestQuestion, QuestionType } from '../types';

interface AssessmentCenterProps {
  onSave: (record: AssessmentRecord) => void;
}

const AssessmentCenter: React.FC<AssessmentCenterProps> = ({ onSave }) => {
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const addQuestion = (type: QuestionType = 'choice') => {
    const newQuestion: TestQuestion = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      question: '',
      correctAnswer: type === 'choice' ? '' : undefined,
      distractors: type === 'choice' ? ['', '', ''] : undefined,
      maxPoints: 1
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: string, field: keyof TestQuestion, value: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const updateDistractor = (qId: string, dIdx: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        const newD = [...(q.distractors || [])];
        newD[dIdx] = value;
        return { ...q, distractors: newD };
      }
      return q;
    }));
  };

  const generateDistractorsWithAI = async (qId: string) => {
    const q = questions.find(item => item.id === qId);
    if (!q || !q.question || !q.correctAnswer) {
      alert("กรุณาใส่ 'คำถาม' และ 'คำตอบที่ถูก' ก่อนกดให้ AI ช่วยคิดช้อยส์หลอก!");
      return;
    }

    setIsGenerating(qId);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Given the question: "${q.question}" and the correct answer: "${q.correctAnswer}", generate 3 plausible but incorrect multiple-choice options (distractors) that look like common mistakes or alternatives. Provide the answer in simple JSON array format containing exactly 3 strings.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });

      const distractors = JSON.parse(response.text.trim());
      if (Array.isArray(distractors)) {
        updateQuestion(qId, 'distractors', distractors.slice(0, 3));
      }
    } catch (error) {
      console.error("AI Generation failed:", error);
      alert("AI Generation failed. Please try again.");
    } finally {
      setIsGenerating(null);
    }
  };

  const handleSaveAssessment = () => {
    if (!title || !topic || questions.length === 0) {
      alert("กรุณาใส่ข้อมูลให้ครบ (ชื่อชุดข้อสอบ, หัวข้อ และอย่างน้อย 1 ข้อคำถาม)");
      return;
    }

    const record: AssessmentRecord = {
      id: Date.now().toString(),
      title,
      topic,
      date: new Date().toISOString().split('T')[0],
      questions
    };

    onSave(record);
    setTitle('');
    setTopic('');
    setQuestions([]);
    alert("บันทึกชุดข้อสอบสำเร็จ!");
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-black rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none rotate-12"><GraduationCap size={240} /></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-indigo-600 rounded-[2rem] shadow-lg shadow-indigo-500/30"><BrainCircuit size={40} /></div>
            <div>
              <h2 className="text-4xl font-black tracking-tight uppercase">Assessment Creator</h2>
              <p className="text-indigo-300 text-lg mt-1 font-medium italic">Hybrid Test Builder (Choice + Written)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Basic Setup Info */}
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-8 items-end">
        <div className="flex-1 space-y-4">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest block ml-1">Assessment Title</label>
          <input 
            type="text" 
            placeholder="e.g. Monthly QA Audit - Feb 2024"
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 font-black text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="flex-1 space-y-4">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest block ml-1">Test Topic / Category</label>
          <input 
            type="text" 
            placeholder="e.g. Product Knowledge"
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 font-black text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-sm"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
        <button 
          onClick={handleSaveAssessment}
          className="bg-slate-900 hover:bg-black text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-slate-200 transition-all flex items-center gap-3 h-[58px]"
        >
          <Save size={20} /> Save Full Assessment
        </button>
      </div>

      {/* Questions List */}
      <div className="space-y-8">
        {questions.map((q, qIdx) => (
          <div key={q.id} className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-6 duration-500 hover:border-indigo-200 transition-all">
            <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-100">
                  {qIdx + 1}
                </div>
                <div>
                   <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${q.type === 'choice' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                     {q.type === 'choice' ? 'Multiple Choice' : 'Short Answer (Written)'}
                   </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200">
                   <label className="text-[10px] font-black text-slate-400 uppercase">Points:</label>
                   <input 
                    type="number" 
                    className="w-10 font-black text-slate-800 outline-none"
                    value={q.maxPoints}
                    onChange={(e) => updateQuestion(q.id, 'maxPoints', parseInt(e.target.value) || 1)}
                   />
                 </div>
                 <button 
                  onClick={() => removeQuestion(q.id)}
                  className="p-3 text-rose-400 hover:bg-rose-50 rounded-xl transition-all"
                >
                  <Trash size={20} />
                </button>
              </div>
            </div>

            <div className="p-10 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">The Question</label>
                <textarea 
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] p-6 font-bold text-slate-700 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                  placeholder="Enter the main question text here..."
                  value={q.question}
                  onChange={(e) => updateQuestion(q.id, 'question', e.target.value)}
                />
              </div>

              {q.type === 'choice' ? (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Correct Answer</label>
                      <input 
                        type="text"
                        className="w-full bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 font-black text-emerald-800 focus:bg-white focus:border-emerald-500 outline-none transition-all"
                        placeholder="Enter the right answer..."
                        value={q.correctAnswer}
                        onChange={(e) => updateQuestion(q.id, 'correctAnswer', e.target.value)}
                      />
                    </div>
                    <div className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100 flex items-center justify-between gap-6 group">
                      <div className="flex-1">
                        <h5 className="font-black text-indigo-900 text-sm">Need Help Thinking?</h5>
                        <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider mt-1">AI can generate distractors based on your answer.</p>
                      </div>
                      <button 
                        onClick={() => generateDistractorsWithAI(q.id)}
                        disabled={isGenerating === q.id}
                        className="p-4 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-500 transition-all flex items-center gap-3 font-black text-sm"
                      >
                        {isGenerating === q.id ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} className="fill-current" />} AI
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(q.distractors || []).map((d, dIdx) => (
                      <input 
                        key={dIdx}
                        type="text"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-600 focus:bg-white focus:border-rose-400 outline-none transition-all"
                        placeholder={`Distractor Option ${dIdx + 1}`}
                        value={d}
                        onChange={(e) => updateDistractor(q.id, dIdx, e.target.value)}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 bg-amber-50 rounded-[2rem] border border-amber-100 animate-in fade-in">
                  <p className="text-amber-800 font-bold text-sm flex items-center gap-2">
                    <PenTool size={18} /> Written Answer Mode: ระบบจะแสดงช่องว่างให้พนักงานพิมพ์ตอบ และคุณต้องเข้ามาตรวจให้คะแนนเองภายหลัง
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Add Question Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button 
            onClick={() => addQuestion('choice')}
            className="bg-white border-4 border-dashed border-slate-200 rounded-[3rem] p-10 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-400 transition-all group"
          >
            <ListChecks size={32} className="mb-2" />
            <span className="font-black uppercase tracking-widest">+ Add Multiple Choice</span>
          </button>
          <button 
            onClick={() => addQuestion('written')}
            className="bg-white border-4 border-dashed border-slate-200 rounded-[3rem] p-10 flex flex-col items-center justify-center text-slate-400 hover:border-amber-400 hover:text-amber-400 transition-all group"
          >
            <PenTool size={32} className="mb-2" />
            <span className="font-black uppercase tracking-widest">+ Add Written Question</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentCenter;
