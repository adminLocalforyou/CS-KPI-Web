
import React, { useState, useMemo } from 'react';
import { 
  ClipboardCheck, 
  Save, 
  PhoneIncoming, 
  PhoneOutgoing, 
  MessageCircle, 
  ClipboardList, 
  AlertCircle, 
  Info, 
  Link as LinkIcon,
  Target,
  ShieldCheck,
  Zap,
  Sparkles,
  Search,
  CheckCircle2,
  // Added UserCheck and BarChart3 to fix "Cannot find name" errors
  UserCheck,
  BarChart3
} from 'lucide-react';
import { TEAM_MEMBERS } from '../constants';
import { EvaluationRecord } from '../types';

// Define the props interface for the EvaluationForm component
interface EvaluationFormProps {
  onAdd: (record: EvaluationRecord) => void;
}

// Behavioral Anchored Rating Scales (BARS) mapped by Context
const CONTEXT_RUBRICS = {
  Project: [
    {
      id: 'scoreA', // maps to communicationScore
      title: "Onboarding Communication & Clarity",
      options: [
        { score: 100, label: "Excellent", desc: "ลูกค้าเข้าใจระบบชัดเจนมาก สื่อสารโปร่งใส สุภาพ และ Proactive" },
        { score: 80, label: "Standard", desc: "สื่อสารครบถ้วนตามขั้นตอน Onboarding ไม่มีข้อมูลผิดพลาด" },
        { score: 60, label: "Fair", desc: "สื่อสารรู้เรื่องแต่ขาดความมั่นใจ หรือต้องให้ลูกค้าถามซ้ำในบางจุด" },
        { score: 40, label: "Needs Help", desc: "สื่อสารไม่ครบถ้วน ข้ามขั้นตอนสำคัญในการอธิบายระบบ" },
        { score: 20, label: "Critical", desc: "ข้อมูลผิดพลาดร้ายแรง จนลูกค้าสับสนหรือระบบใช้งานไม่ได้" }
      ]
    },
    {
      id: 'scoreB', // maps to speedScore
      title: "Setup Speed & SLA Compliance",
      options: [
        { score: 100, label: "Fast-Track", desc: "ขึ้นระบบเสร็จก่อน SLA กำหนด (เช่น เสร็จใน 5 วัน จากเป้า 10 วัน)" },
        { score: 80, label: "On Target", desc: "ทำตาม Timeline ที่วางไว้เป๊ะ ไม่มีการดีเลย์" },
        { score: 60, label: "Minor Delay", desc: "ล่าช้าเล็กน้อย 1-2 วัน แต่มีการแจ้ง Progress ให้ทราบล่วงหน้า" },
        { score: 40, label: "Lagging", desc: "ดีเลย์เกินกำหนดโดยไม่มีเหตุผลอันควร หรือไม่แจ้งความคืบหน้า" },
        { score: 20, label: "Stalled", desc: "งานค้างนานจนลูกค้าตาม หรือลืมอัปเดตงานนานเกิน 1 สัปดาห์" }
      ]
    },
    {
      id: 'scoreC', // maps to processCompliance
      title: "SOP & Onboarding Quality",
      options: [
        { score: 100, label: "Flawless", desc: "Checklist ครบ 100% บันทึก CRM ละเอียด และทดสอบระบบก่อน Live" },
        { score: 80, label: "Solid", desc: "ทำตาม SOP ครบถ้วน ขั้นตอนถูกต้อง บันทึกข้อมูลชัดเจน" },
        { score: 60, label: "Basic", desc: "ข้ามขั้นตอนย่อยบางอย่าง แต่ระบบหลักยังทำงานได้ถูกต้อง" },
        { score: 40, label: "Incomplete", desc: "ลืมบันทึกข้อมูลสำคัญใน CRM หรือข้ามขั้นตอนการทดสอบบางส่วน" },
        { score: 20, label: "Risk prone", desc: "ไม่ทำตามขั้นตอน SOP จนเกิดปัญหาหน้างานหลังจาก Live" }
      ]
    }
  ],
  Maintenance: [
    {
      id: 'scoreA',
      title: "Response Tone & Professionalism",
      options: [
        { score: 100, label: "Empathic", desc: "ใช้น้ำเสียงเห็นใจลูกค้า จัดการอารมณ์ลูกค้าได้ดีเยี่ยม สุภาพมาก" },
        { score: 80, label: "Professional", desc: "ตอบตามมาตรฐานบริษัท สุภาพ และแสดงความเป็นมืออาชีพ" },
        { score: 60, label: "Neutral", desc: "สื่อสารสั้น กระชับ แต่อาจดูแข็ง (Robotic) ไปนิดหน่อย" },
        { score: 40, label: "Brief", desc: "ตอบคำถามสั้นเกินไปจนดูเหมือนไม่เต็มใจให้บริการ" },
        { score: 20, label: "Inappropriate", desc: "ใช้น้ำเสียงประชดประชัน หรือโต้เถียงกับลูกค้าในเคสปัญหา" }
      ]
    },
    {
      id: 'scoreB',
      title: "Resolution & Fix Speed",
      options: [
        { score: 100, label: "Instant Fix", desc: "แก้ปัญหา/อัปเดตเมนูเสร็จทันที หรือภายในไม่กี่นาที" },
        { score: 80, label: "Swift", desc: "แก้ไขได้ภายในระยะเวลาที่กำหนด (SLA ของงาน Support)" },
        { score: 60, label: "Acceptable", desc: "ใช้เวลานานกว่าปกติเล็กน้อยแต่จบงานได้เรียบร้อย" },
        { score: 40, label: "Slow", desc: "งานค้างนานเกิน 1 วันสำหรับเคสง่ายๆ หรือลูกค้าต้องตามซ้ำ" },
        { score: 20, label: "Abandoned", desc: "ดองเคสทิ้งไว้ข้ามวันโดยไม่มีการอัปเดตจนลูกค้าตำหนิ" }
      ]
    },
    {
      id: 'scoreC',
      title: "Accuracy & Data Integrity",
      options: [
        { score: 100, label: "Precision", desc: "ข้อมูลถูกต้อง 100% เช็คซ้ำหลายรอบ บันทึกประวัติละเอียด" },
        { score: 80, label: "Accurate", desc: "แก้ไขข้อมูลได้ถูกต้องตามคำสั่ง ไม่มีความผิดพลาดชัดเจน" },
        { score: 60, label: "Minor Error", desc: "มีจุดผิดเล็กน้อยที่ไม่กระทบระบบหลัก (เช่น สะกดคำผิด)" },
        { score: 40, label: "Careless", desc: "ใส่ข้อมูลผิดบ่อยครั้งจนต้องให้ Manager มาแก้ตามหลัง" },
        { score: 20, label: "Damaging", desc: "แก้ข้อมูลผิดจนระบบลูกค้าเสียหาย หรือปิดการขายไม่ได้" }
      ]
    }
  ],
  SideTask: [
    {
      id: 'scoreA',
      title: "Internal Coordination",
      options: [
        { score: 100, label: "Leader", desc: "ประสานงานดีเยี่ยม รายงานผลชัดเจน ช่วยคนอื่นได้ด้วย" },
        { score: 80, label: "Cooperative", desc: "ทำงานร่วมกับทีมได้ดี สื่อสารเข้าใจง่าย ไม่เกิดการติดขัด" },
        { score: 60, label: "Functional", desc: "ทำงานของตัวเองได้ แต่ไม่ค่อยแชร์ข้อมูลให้ทีมทราบ" },
        { score: 40, label: "Passive", desc: "ต้องให้ตามถามถึงจะอัปเดต สื่อสารภายในไม่ชัดเจน" },
        { score: 20, label: "Isolated", desc: "ไม่สื่อสารกับใครเลย จนงานอื่นได้รับผลกระทบ" }
      ]
    },
    {
      id: 'scoreB',
      title: "Initiative & Proactivity",
      options: [
        { score: 100, label: "Proactive", desc: "เสนอทางเลือกใหม่ๆ หรือทำเกินกว่าที่สั่งเพื่อคุณภาพที่ดีขึ้น" },
        { score: 80, label: "Active", desc: "ทำตามหน้าที่ที่ได้รับมอบหมายอย่างกระตือรือร้น" },
        { score: 60, label: "Reactive", desc: "ทำตามสั่งเท่านั้น ไม่มีความคิดริเริ่มเพิ่มเติม" },
        { score: 40, label: "Reluctant", desc: "ทำแบบขอไปที หรือต้องคอยกระตุ้นบ่อยๆ" },
        { score: 20, label: "Avoidant", desc: "พยายามเลี่ยงงานเสริม หรือทำออกมาแบบไม่มีคุณภาพเลย" }
      ]
    },
    {
      id: 'scoreC',
      title: "Execution Quality",
      options: [
        { score: 100, label: "Gold Standard", desc: "งานเสริมทำออกมาได้คุณภาพเท่ากับงานหลัก สวยงาม ถูกต้อง" },
        { score: 80, label: "Good Quality", desc: "ผลงานดี เป็นที่น่าพอใจ ใช้งานได้จริง" },
        { score: 60, label: "Average", desc: "คุณภาพพอใช้ มีจุดต้องปรับปรุงบ้าง" },
        { score: 40, label: "Sub-par", desc: "ผลลัพธ์ไม่ตรงตามโจทย์ หรือทำลวกๆ" },
        { score: 20, label: "Failing", desc: "งานล้มเหลว หรือต้องเอาไปทำใหม่ทั้งหมด" }
      ]
    }
  ]
};

const EvaluationForm: React.FC<EvaluationFormProps> = ({ onAdd }) => {
  const [formData, setFormData] = useState({
    staffId: TEAM_MEMBERS[0].id,
    type: 'Project' as 'Project' | 'Maintenance' | 'SideTask',
    scoreA: 80, // Dynamic meaning based on context
    scoreB: 80, // Dynamic meaning based on context
    scoreC: 80, // Dynamic meaning based on context
    sideTaskPoints: 0,
    incomingCalls: 0,
    outgoingCalls: 0,
    totalChats: 0,
    totalTasks: 0,
    note: '',
    caseRef: '',
    daysToLive: 0,
  });

  const activeRubrics = CONTEXT_RUBRICS[formData.type];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const staff = TEAM_MEMBERS.find(m => m.id === formData.staffId);
    
    // Low score validation
    const hasLowScore = [formData.scoreA, formData.scoreB, formData.scoreC].some(s => s < 70);
    if (hasLowScore && !formData.note && !formData.caseRef) {
      alert("⚠️ เนื่องจากคุณให้คะแนนบางข้อต่ำกว่าเกณฑ์ปกติ (ต่ำกว่า 70%) กรุณาระบุ 'เหตุผล' หรือ 'เลขเคส' เพื่อใช้ยืนยันความโปร่งใสกับพนักงานด้วยครับ");
      return;
    }

    const record: EvaluationRecord = {
      id: Math.random().toString(36).substr(2, 9),
      staffId: formData.staffId,
      staffName: staff?.name || 'Unknown',
      date: new Date().toISOString().split('T')[0],
      type: formData.type,
      // Map dynamic scores to evaluation fields
      communicationScore: formData.scoreA,
      speedScore: formData.scoreB,
      processCompliance: formData.scoreC,
      // Default other values
      followUpScore: 80,
      clarityScore: formData.scoreA, 
      onboardingQuality: formData.scoreC,
      daysToLive: formData.daysToLive,
      stepsCompleted: formData.scoreC >= 80 ? 10 : 7,
      incomingCalls: formData.incomingCalls,
      outgoingCalls: formData.outgoingCalls,
      totalChats: formData.totalChats,
      totalTasks: formData.totalTasks,
      issuesResolved: formData.type === 'Maintenance' ? 1 : 0,
      customerFeedback: 85,
      sideTaskPoints: formData.type === 'SideTask' ? formData.sideTaskPoints : 0,
      note: `${formData.caseRef ? `[REF: ${formData.caseRef}] ` : ''}${formData.note}`
    };

    onAdd(record);
  };

  return (
    <div className="bg-white p-10 rounded-[4rem] shadow-sm border border-slate-100 max-w-5xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-4">
      {/* Form Header */}
      <div className="flex items-center justify-between mb-12 pb-8 border-b border-slate-50">
        <div className="flex items-center gap-6">
          <div className="p-5 bg-slate-900 text-white rounded-[2rem] shadow-2xl shadow-slate-200">
            <ClipboardCheck size={32} />
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Digital Performance Log</h3>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Select work context for specific behavioral rubric</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3 bg-indigo-50 px-6 py-4 rounded-[1.5rem] border border-indigo-100">
          <ShieldCheck size={20} className="text-indigo-600" />
          <p className="text-xs font-bold text-indigo-700">ระบบช่วยคุณประเมินจากพฤติกรรมจริง</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-16">
        {/* Step 1: Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
              <UserCheck size={14} /> Who are you evaluating?
            </label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] p-6 font-black text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-sm"
              value={formData.staffId}
              onChange={(e) => setFormData(prev => ({ ...prev, staffId: e.target.value }))}
            >
              {TEAM_MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
              <Target size={14} /> Evaluation Context (Rubric Type)
            </label>
            <div className="flex bg-slate-50 p-2 rounded-[2rem] border border-slate-200">
              {(['Project', 'Maintenance', 'SideTask'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type }))}
                  className={`flex-1 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all ${
                    formData.type === type 
                    ? 'bg-white text-indigo-600 shadow-lg' 
                    : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {type === 'Project' ? <Sparkles size={14} className="inline mr-2" /> : type === 'Maintenance' ? <Zap size={14} className="inline mr-2" /> : <Target size={14} className="inline mr-2" />}
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 2: Workload Metrics */}
        <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transition-transform group-hover:scale-110"><ClipboardList size={180} /></div>
          <div className="relative z-10 space-y-10">
            <div className="flex items-center gap-4 border-b border-white/10 pb-6">
              <div className="p-3 bg-indigo-600 rounded-2xl"><BarChart3 size={24} /></div>
              <h4 className="font-black text-xl tracking-tight uppercase">Manual Workload Count (Raw)</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <WorkloadInput label="Calls In" value={formData.incomingCalls} icon={PhoneIncoming} onChange={(v) => setFormData({...formData, incomingCalls: v})} />
              <WorkloadInput label="Calls Out" value={formData.outgoingCalls} icon={PhoneOutgoing} onChange={(v) => setFormData({...formData, outgoingCalls: v})} />
              <WorkloadInput label="Chats" value={formData.totalChats} icon={MessageCircle} onChange={(v) => setFormData({...formData, totalChats: v})} />
              <WorkloadInput label="Tasks" value={formData.totalTasks} icon={ClipboardList} onChange={(v) => setFormData({...formData, totalTasks: v})} />
            </div>
          </div>
        </div>

        {/* Step 3: Behavioral Scoring (Dynamic) */}
        <div className="space-y-20 animate-in fade-in duration-500">
          {activeRubrics.map((rubric) => (
            <RubricSection 
              key={rubric.id}
              title={rubric.title} 
              value={(formData as any)[rubric.id]} 
              options={rubric.options} 
              onSelect={(v) => setFormData({...formData, [rubric.id]: v})} 
            />
          ))}
        </div>

        {/* Step 4: Documentation */}
        <div className="bg-slate-50 p-12 rounded-[3.5rem] border border-slate-100 space-y-10">
           <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <AlertCircle size={16} className="text-amber-500" /> Evidence & Manager Feedback
              </h4>
              {([formData.scoreA, formData.scoreB, formData.scoreC].some(s => s < 70)) && (
                <span className="text-[9px] font-black bg-rose-100 text-rose-600 px-3 py-1.5 rounded-full uppercase tracking-widest animate-pulse">Evidence Required for low scores</span>
              )}
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="md:col-span-1 space-y-4">
                 <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2"><LinkIcon size={12}/> Link / Case Reference</label>
                 <input 
                  type="text" 
                  placeholder="e.g. #9912 / Link to Respond.io" 
                  className="w-full bg-white border border-slate-200 rounded-2xl p-6 font-bold text-slate-800 focus:border-indigo-500 outline-none shadow-sm"
                  value={formData.caseRef}
                  onChange={(e) => setFormData({...formData, caseRef: e.target.value})}
                 />
                 <p className="text-[9px] text-slate-400 italic px-2">ระบุลิงก์แชทหรือเลขเคส เพื่อความแฟร์ต่อพนักงาน</p>
              </div>
              <div className="md:col-span-2 space-y-4">
                 <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2"><MessageCircle size={12}/> Manager Feedback (Thai/Eng)</label>
                 <textarea 
                  rows={3} 
                  placeholder="พิมพ์ข้อความที่คุณอยากบอกพนักงาน หรือบันทึกเหตุผลที่คุณให้คะแนนนี้..." 
                  className="w-full bg-white border border-slate-200 rounded-[2rem] p-6 font-medium text-slate-700 focus:border-indigo-500 outline-none shadow-sm resize-none"
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                 />
              </div>
           </div>
        </div>

        <button 
          type="submit" 
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-10 rounded-[3rem] shadow-2xl shadow-indigo-200 transition-all flex items-center justify-center gap-6 text-2xl group active:scale-95"
        >
          <Save size={32} className="group-hover:scale-110 transition-transform" /> 
          Confirm & Save Performance Log
        </button>
      </form>
    </div>
  );
};

// UI Parts
const WorkloadInput: React.FC<{ label: string, value: number, icon: any, onChange: (v: number) => void }> = ({ label, value, icon: Icon, onChange }) => (
  <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] space-y-4 hover:bg-white/10 transition-colors">
    <div className="flex items-center gap-3 text-indigo-400 opacity-80">
      <Icon size={18} />
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <input 
      type="number" 
      className="bg-transparent text-4xl font-black text-white w-full outline-none placeholder:text-white/20"
      value={value || ''}
      onChange={(e) => onChange(parseInt(e.target.value) || 0)}
      placeholder="0"
    />
  </div>
);

const RubricSection: React.FC<{ title: string, value: number, options: any[], onSelect: (v: number) => void }> = ({ title, value, options, onSelect }) => {
  const selectedOption = options.find(o => o.score === value) || options[1];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-4">
        <h4 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h4>
        <div className={`px-6 py-2 rounded-2xl text-2xl font-black ${value >= 80 ? 'text-emerald-500 bg-emerald-50' : value >= 60 ? 'text-indigo-500 bg-indigo-50' : 'text-rose-500 bg-rose-50'}`}>
          {value}%
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        {options.map((opt) => (
          <button
            key={opt.score}
            type="button"
            onClick={() => onSelect(opt.score)}
            className={`flex flex-col items-center p-8 rounded-[2.5rem] border-2 transition-all text-center relative ${
              value === opt.score 
              ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl shadow-indigo-100 scale-[1.05] z-10' 
              : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200'
            }`}
          >
            <span className={`text-[10px] font-black uppercase tracking-widest mb-2 ${value === opt.score ? 'text-white/60' : 'text-slate-300'}`}>
              Level {opt.score / 20}
            </span>
            <span className="text-xl font-black leading-none mb-4">{opt.label}</span>
            <span className={`text-[10px] leading-relaxed font-bold ${value === opt.score ? 'text-indigo-100' : 'text-slate-400'}`}>
              {opt.desc}
            </span>
            {value === opt.score && (
               <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-indigo-600 rotate-45"></div>
            )}
          </button>
        ))}
      </div>

      <div className="bg-slate-50 p-6 rounded-[1.5rem] flex items-start gap-4 border border-slate-100 animate-in slide-in-from-left-4 duration-500 shadow-sm">
         <Info size={18} className="text-indigo-500 mt-1" />
         <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
           "คุณเลือกคะแนนนี้เพราะพนักงานทำเข้าข่ายพฤติกรรม: <span className="font-bold text-slate-900">{selectedOption.desc}</span>"
         </p>
      </div>
    </div>
  );
};

export default EvaluationForm;
