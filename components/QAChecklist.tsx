
import React, { useState, useMemo } from 'react';
import { 
  ClipboardCheck, 
  Save, 
  HelpCircle,
  FileText,
  User,
  Calendar,
  ChevronRight,
  TrendingUp,
  Layout,
  MessageSquare,
  FileCheck,
  Mail,
  Send
} from 'lucide-react';
import { TEAM_MEMBERS } from '../constants';
import { QARecord, QASection } from '../types';

interface QAChecklistProps {
  onSave: (record: QARecord) => void;
}

const INITIAL_SECTIONS: Omit<QASection, 'overallScore'>[] = [
  {
    title: "1. Handling Live Projects (Project LIVE & Average Project Completion Time)",
    items: [
      { label: "Ensures smooth execution of Project Building", score: 0 },
      { label: "Follows all steps correctly when setting up a new system", score: 0 },
      { label: "Identifies and resolves potential issues before going live", score: 0 },
      { label: "Updates project status on CRM to keep track of progress", score: 0 },
      { label: "Ensures customers understand how to use their systems effectively ( Satisfaction call )", score: 0 },
    ],
    caseRef: "",
    comment: ""
  },
  {
    title: "2. Response & Resolution Time",
    items: [
      { label: "(First Response Time & Resolution Time) Respond.io / email", score: 0 },
      { label: "Resolves issues efficiently while maintaining accuracy", score: 0 },
      { label: "Uses professional, friendly, and service-oriented communication", score: 0 },
      { label: "Asks for clarification when needed to avoid miscommunication and Follows up to ensure the issue is fully resolved and the customer is satisfied", score: 0 },
      { label: "Ensures customers feel heard and valued (ลูกค้าต้องการให้ช่วยเหลือเพิ่มเติมไหมคะ)", score: 0 },
    ],
    caseRef: "",
    comment: ""
  },
  {
    title: "3. Documentation & Accuracy",
    items: [
      { label: "Task all interactions and updates accurately in the system", score: 0 },
      { label: "Avoids misinformation by cross-checking details before providing answers", score: 0 },
      { label: "Adheres to company policies when handling sensitive information", score: 0 },
    ],
    caseRef: "",
    comment: ""
  }
];

const QAChecklist: React.FC<QAChecklistProps> = ({ onSave }) => {
  const [staffId, setStaffId] = useState(TEAM_MEMBERS[0].id);
  const [sections, setSections] = useState<QASection[]>(INITIAL_SECTIONS as QASection[]);

  const handleScoreChange = (sectionIdx: number, itemIdx: number, score: number) => {
    const newSections = [...sections];
    newSections[sectionIdx].items[itemIdx].score = score;
    setSections(newSections);
  };

  const handleTextChange = (sectionIdx: number, field: 'caseRef' | 'comment', value: string) => {
    const newSections = [...sections];
    newSections[sectionIdx][field] = value;
    setSections(newSections);
  };

  const calculateSectionPct = (section: QASection) => {
    const totalPossible = section.items.length * 5;
    const actualScore = section.items.reduce((sum, item) => sum + item.score, 0);
    return totalPossible > 0 ? Math.round((actualScore / totalPossible) * 100) : 0;
  };

  const overallPercentage = useMemo(() => {
    const allItems = sections.flatMap(s => s.items);
    const totalPossible = allItems.length * 5;
    const actualScore = allItems.reduce((sum, item) => sum + item.score, 0);
    return totalPossible > 0 ? Math.round((actualScore / totalPossible) * 100) : 0;
  }, [sections]);

  const generateEmailReport = () => {
    const staff = TEAM_MEMBERS.find(m => m.id === staffId);
    const dateStr = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' });
    
    // Create a visual ASCII-like progress bar for the email
    const getProgressBar = (pct: number) => {
      const bars = Math.round(pct / 10);
      return '█'.repeat(bars) + '░'.repeat(10 - bars) + ` ${pct}%`;
    };

    let body = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    body += `📊 QA PERFORMANCE AUDIT REPORT\n`;
    body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    body += `👤 Staff: ${staff?.name}\n`;
    body += `📅 Date: ${dateStr}\n`;
    body += `🏆 OVERALL AUDIT SCORE: ${overallPercentage}%\n`;
    body += `📈 Progress: ${getProgressBar(overallPercentage)}\n\n`;
    
    body += `────────────────────────────────────────\n`;
    body += `SECTION DETAILS\n`;
    body += `────────────────────────────────────────\n\n`;

    sections.forEach((section, idx) => {
      const sectionPct = calculateSectionPct(section);
      body += `[${idx + 1}] ${section.title.toUpperCase()}\n`;
      body += `⚡ Section Score: ${sectionPct}%\n`;
      body += `🔗 Case Reference: ${section.caseRef || 'N/A'}\n`;
      body += `💬 Comment: ${section.comment || 'No comment'}\n\n`;
      
      body += `Detailed Items:\n`;
      section.items.forEach(item => {
        const itemPct = (item.score / 5) * 100;
        const icon = item.score >= 4 ? '✅' : item.score >= 3 ? '⚠️' : '❌';
        body += `${icon} ${item.label}\n   Score: ${item.score}/5 (${itemPct}%)\n`;
      });
      body += `\n`;
    });

    body += `────────────────────────────────────────\n`;
    body += `Generated via CS Management Dashboard System\n`;
    body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

    // Auto recipients
    const recipients = "sai@localforyou.com, aom@localforyou.com";
    const subject = `QA Report: ${staff?.name} - ${dateStr} [${overallPercentage}%]`;
    const mailtoLink = `mailto:${recipients}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.location.href = mailtoLink;
  };

  const handleSave = () => {
    const staff = TEAM_MEMBERS.find(m => m.id === staffId);
    const record: QARecord = {
      id: Date.now().toString(),
      staffId,
      staffName: staff?.name || "Unknown",
      date: new Date().toISOString().split('T')[0],
      sections,
      overallPercentage
    };
    onSave(record);
    alert("QA Record Saved Successfully!");
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* QA Header Card */}
      <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none rotate-12"><FileCheck size={200} /></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-blue-600 rounded-[2rem] shadow-lg shadow-blue-500/30"><ClipboardCheck size={40} /></div>
            <div>
              <h2 className="text-4xl font-black tracking-tight">Digital QA Check List</h2>
              <p className="text-slate-400 text-lg mt-1 font-medium italic">Standardized Quality Assurance Monitoring System</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 flex items-center gap-8 min-w-[280px]">
            <div className="text-right">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Audit Score</p>
              <p className="text-6xl font-black tracking-tighter">{overallPercentage}%</p>
            </div>
            <div className="h-16 w-[2px] bg-white/20"></div>
            <div className="flex-1">
               <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-1000" style={{ width: `${overallPercentage}%` }}></div>
               </div>
               <p className="text-[10px] font-black text-slate-500 uppercase mt-3">Overall Completion</p>
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-wrap gap-8 items-center justify-between">
        <div className="flex flex-wrap gap-8 items-center">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-slate-100 rounded-2xl"><User size={20} className="text-slate-500" /></div>
             <div>
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Staff Member Under Audit</label>
               <select 
                 className="bg-transparent font-black text-slate-800 text-lg outline-none cursor-pointer"
                 value={staffId}
                 onChange={(e) => setStaffId(e.target.value)}
               >
                 {TEAM_MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
               </select>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="p-3 bg-slate-100 rounded-2xl"><Calendar size={20} className="text-slate-500" /></div>
             <div>
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Audit Session Date</label>
               <p className="font-black text-slate-800 text-lg">{new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
             </div>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={generateEmailReport}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-emerald-200 transition-all flex items-center gap-3"
          >
            <Mail size={20} /> Email Report
          </button>
          <button 
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-500 text-white font-black px-10 py-4 rounded-2xl shadow-xl shadow-blue-200 transition-all flex items-center gap-3"
          >
            <Save size={20} /> บันทึกผลตรวจ
          </button>
        </div>
      </div>

      {/* Main Sections */}
      <div className="space-y-12">
        {sections.map((section, sIdx) => {
          const sectionPct = calculateSectionPct(section);
          return (
            <div key={sIdx} className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden group hover:border-blue-200 transition-all duration-500">
              {/* Section Header */}
              <div className="bg-[#e8f5e9] p-10 flex flex-col md:flex-row justify-between items-center gap-8 group-hover:bg-[#f1fcf2] transition-colors">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-emerald-600 font-black text-2xl">{sIdx + 1}</div>
                  <h3 className="text-xl font-black text-[#1b5e20] tracking-tight">{section.title}</h3>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-[#4caf50] uppercase tracking-widest leading-none mb-1">Section Success</p>
                    <p className="text-4xl font-black text-[#1b5e20] tracking-tighter leading-none">{sectionPct}%</p>
                  </div>
                  <div className="w-32 h-4 bg-white rounded-full p-0.5 border border-[#c8e6c9]">
                     <div className="h-full bg-[#4caf50] rounded-full transition-all duration-700" style={{ width: `${sectionPct}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Checklist Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                    <tr>
                      <th className="px-10 py-6">Criteria Item Description</th>
                      <th className="px-10 py-6 text-center">Audit Score (1-5)</th>
                      <th className="px-10 py-6 text-center">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {section.items.map((item, iIdx) => (
                      <tr key={iIdx} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-10 py-8 text-slate-700 font-bold text-[15px] max-w-md">{item.label}</td>
                        <td className="px-10 py-8">
                          <div className="flex justify-center items-center gap-3">
                            {[1, 2, 3, 4, 5].map(score => (
                              <button
                                key={score}
                                onClick={() => handleScoreChange(sIdx, iIdx, score)}
                                className={`w-10 h-10 rounded-xl font-black transition-all flex items-center justify-center border-2 ${
                                  item.score === score 
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                                  : 'bg-white border-slate-200 text-slate-300 hover:border-blue-400'
                                }`}
                              >
                                {score}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex flex-col items-center">
                             <span className="text-sm font-black text-slate-800 mb-2">{item.score ? (item.score / 5) * 100 : 0}%</span>
                             <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden p-[1px]">
                                <div className="h-full bg-slate-900 rounded-full transition-all duration-500" style={{ width: `${(item.score / 5) * 100}%` }}></div>
                             </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Inputs Footer */}
              <div className="p-10 bg-slate-50/50 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest">
                    <Layout size={14} /> Case Reference (Name/Link)
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g., Thaiger Bites Project / respond.io link"
                    className="w-full bg-white border border-slate-200 rounded-2xl p-4 font-black text-slate-800 text-sm focus:border-blue-500 outline-none shadow-sm transition-all"
                    value={section.caseRef}
                    onChange={(e) => handleTextChange(sIdx, 'caseRef', e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                    <MessageSquare size={14} /> Auditor's Comment
                  </label>
                  <textarea 
                    rows={1}
                    placeholder="Optional feedback for this section..."
                    className="w-full bg-white border border-slate-200 rounded-2xl p-4 font-bold text-slate-600 text-sm focus:border-emerald-500 outline-none shadow-sm transition-all resize-none"
                    value={section.comment}
                    onChange={(e) => handleTextChange(sIdx, 'comment', e.target.value)}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QAChecklist;
