
import React, { useMemo, useState, useEffect } from 'react';
import { 
  Trophy, 
  TrendingUp, 
  Activity, 
  Zap, 
  Sparkles,
  Briefcase,
  Info,
  UserCheck
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { EvaluationRecord, QARecord, TestSubmission } from '../types';
import { TEAM_MEMBERS } from '../constants';

interface StaffHubProps {
  teamPerformance: { id: string, name: string, score: number }[];
  evaluations: EvaluationRecord[];
  qaRecords: QARecord[];
  testSubmissions: TestSubmission[];
}

const BUDDY_PAIRS: Record<string, string | null> = {
  'Pookie': 'Gam',
  'Gam': 'Pookie',
  'Namva': 'TBA 1',
  'TBA 1': 'Namva',
  'Aim': 'Noey',
  'Noey': 'Aim',
  'Pume': null
};

const PUME_COMP_GROUP = ['Pookie', 'Gam', 'Namva', 'TBA 1'];

const StaffHub: React.FC<StaffHubProps> = ({ teamPerformance, evaluations, qaRecords, testSubmissions }) => {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<Record<string, string>>({});
  const [workloadReasoning, setWorkloadReasoning] = useState<Record<string, string>>({});

  // 1. Calculate Weighted Individual Workload
  const workloadData = useMemo(() => {
    return TEAM_MEMBERS.map(m => {
      const staffEvals = evaluations.filter(e => e.staffId === m.id);
      
      const totalIncoming = staffEvals.reduce((a, b) => a + (b.incomingCalls || 0), 0);
      const totalOutgoing = staffEvals.reduce((a, b) => a + (b.outgoingCalls || 0), 0);
      const totalChats = staffEvals.reduce((a, b) => a + (b.totalChats || 0), 0);
      const totalTasks = staffEvals.reduce((a, b) => a + (b.totalTasks || 0), 0);
      
      // WEIGHTED SCORE CALCULATION:
      // 1 Call = 5 Units
      // 1 Chat = 2 Units
      // 1 Task = 3 Units
      const weightedScore = (totalIncoming + totalOutgoing) * 5 + (totalChats * 2) + (totalTasks * 3);
      
      return {
        id: m.id,
        name: m.name,
        totalIncoming,
        totalOutgoing,
        totalChats,
        totalTasks,
        weightedScore,
        calls: totalIncoming + totalOutgoing
      };
    });
  }, [evaluations]);

  // Fix: Calculate avgWeightedWorkload to resolve "Cannot find name 'avgWeightedWorkload'" error.
  const avgWeightedWorkload = useMemo(() => {
    if (workloadData.length === 0) return 0;
    return workloadData.reduce((acc, curr) => acc + curr.weightedScore, 0) / workloadData.length;
  }, [workloadData]);

  // AI-Driven Development & Workload Logic
  const fetchInsights = async () => {
    if (teamPerformance.length === 0) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Fetch Performance Recommendations
      const perfPrompt = `
        Based on these performance scores (out of 100), give ONE short 5-word Thai recommendation for each staff member on what to focus on next.
        Data: ${JSON.stringify(teamPerformance)}
        Format as JSON object: { "StaffName": "Recommendation" }
      `;
      const perfResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: perfPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            additionalProperties: { type: Type.STRING }
          }
        }
      });
      setInsights(JSON.parse(perfResponse.text || '{}'));

      // Fetch Workload Reasoning (The "Why" behind the balance)
      const workloadPrompt = `
        You are a CS Manager analyzing workload balance based on specific Buddy Pairs and logic:
        1. Pookie buddy with Gam
        2. Namva buddy with TBA 1
        3. Aim buddy with Noey
        4. Pume has NO buddy but is EXPECTED to have 50% more workload than the average of (Pookie, Gam, Namva, TBA 1).

        Data: ${JSON.stringify(workloadData)}
        
        Analyze each pair/person:
        - For Buddies: Compare them. If one has more calls but another has more chats, say it is "Balanced" and explain why in THAI.
        - For Pume: Compare him against the average of Pookie, Gam, Namva, TBA 1. See if he is reaching his +50% target.
        
        Format as JSON object: { "StaffName": "Brief Thai Explanation (max 15 words)" }
      `;
      const workloadResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: workloadPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            additionalProperties: { type: Type.STRING }
          }
        }
      });
      setWorkloadReasoning(JSON.parse(workloadResponse.text || '{}'));

    } catch (e) {
      console.error("AI Insight Error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [workloadData, teamPerformance]);

  const renderWorkloadItem = (data: typeof workloadData[0]) => {
    const buddyName = BUDDY_PAIRS[data.name];
    let status = 'Balanced';
    let comparisonLabel = buddyName ? `vs Buddy: ${buddyName}` : "Special Target (+50%)";

    if (buddyName) {
      const buddyData = workloadData.find(d => d.name === buddyName);
      if (buddyData) {
        const diff = data.weightedScore - buddyData.weightedScore;
        const threshold = Math.max(data.weightedScore, buddyData.weightedScore) * 0.15;
        status = diff > threshold ? 'Higher' : diff < -threshold ? 'Lower' : 'Balanced';
      }
    } else if (data.name === 'Pume') {
      const compGroup = workloadData.filter(d => PUME_COMP_GROUP.includes(d.name));
      const groupAvg = compGroup.length > 0 ? compGroup.reduce((a, b) => a + b.weightedScore, 0) / compGroup.length : 0;
      const targetScore = groupAvg * 1.5;
      const diff = data.weightedScore - targetScore;
      status = diff >= -10 ? 'On Target' : 'Under Target';
    }

    return (
      <div key={data.id} className="p-6 bg-white/5 rounded-[2rem] border border-white/5 group hover:bg-white/10 transition-colors space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-black text-white text-base">{data.name}</p>
            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mt-1">{comparisonLabel}</p>
          </div>
          <div className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
            status === 'Higher' || status === 'Under Target' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 
            status === 'Lower' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 
            'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
          }`}>
            {status}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 py-2 border-y border-white/10">
          <div className="text-center">
            <p className="text-sm font-black text-white">{data.calls}</p>
            <p className="text-[8px] font-bold text-slate-500 uppercase">Calls</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-black text-white">{data.totalChats}</p>
            <p className="text-[8px] font-bold text-slate-500 uppercase">Chats</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-black text-white">{data.totalTasks}</p>
            <p className="text-[8px] font-bold text-slate-500 uppercase">Tasks</p>
          </div>
        </div>

        <div className="flex items-start gap-2 bg-black/20 p-3 rounded-xl min-h-[50px]">
          <Info size={12} className="text-blue-400 mt-1 flex-shrink-0" />
          <p className="text-[10px] font-medium text-blue-100/70 leading-relaxed italic">
            {workloadReasoning[data.name] || 'กำลังประมวลผลความสมดุล...'}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none rotate-12"><Trophy size={200} /></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-white/20 rounded-[2rem] shadow-lg backdrop-blur-md border border-white/20"><Sparkles size={40} /></div>
            <div>
              <h2 className="text-4xl font-black tracking-tight">Team Hub (Staff View)</h2>
              <p className="text-blue-100 text-lg mt-1 font-medium italic opacity-80">Transparent performance & workload tracker for all staff</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 text-center min-w-[140px]">
             <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Team Average</p>
             <p className="text-4xl font-black">
              {Math.round(teamPerformance.reduce((a, b) => a + b.score, 0) / teamPerformance.length || 0)}%
             </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Leaderboard Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Trophy size={24} /></div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Public Rankings</h3>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div> High</span>
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Average</span>
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 bg-rose-500 rounded-full"></div> Low</span>
              </div>
            </div>

            <div className="space-y-4">
              {teamPerformance.map((member, index) => {
                const status = member.score >= 85 ? 'High' : member.score >= 70 ? 'Avg' : 'Low';
                const colorClass = status === 'High' ? 'text-emerald-500 bg-emerald-50' : status === 'Avg' ? 'text-blue-500 bg-blue-50' : 'text-rose-500 bg-rose-50';
                const barClass = status === 'High' ? 'bg-emerald-500 shadow-emerald-200' : status === 'Avg' ? 'bg-blue-500 shadow-blue-200' : 'bg-rose-500 shadow-rose-200';
                
                return (
                  <div key={member.id} className="group p-6 bg-slate-50/50 rounded-[2.5rem] border border-transparent hover:bg-white hover:border-slate-100 hover:shadow-xl transition-all duration-500">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-slate-400 shadow-sm border border-slate-100">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-lg">{member.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                            {insights[member.name] || 'กำลังวิเคราะห์แผนพัฒนา...'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${colorClass}`}>
                          {status}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-slate-800 leading-none">{member.score}%</p>
                        </div>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-slate-200/50 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 shadow-lg ${barClass}`} 
                        style={{ width: `${member.score}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Analytics - Buddy Workload Comparison */}
        <div className="space-y-8">
          
          <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-xl space-y-8 relative overflow-hidden border border-slate-800">
            <div className="absolute -bottom-6 -right-6 opacity-5 pointer-events-none"><Briefcase size={120} /></div>
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg"><UserCheck size={24} /></div>
                <h3 className="text-xl font-black tracking-tight">Buddy Balance</h3>
              </div>
              <Info size={16} className="text-slate-500" />
            </div>
            
            <div className="space-y-6 relative z-10 max-h-[700px] overflow-y-auto pr-2 scrollbar-hide">
              {workloadData.map(data => renderWorkloadItem(data))}
            </div>
            
            <div className="p-6 bg-blue-600/20 rounded-[2.5rem] border border-blue-500/20 text-center">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Standard Workload Metric</p>
              <p className="text-xs text-slate-500 font-bold mb-3">(Call x5) + (Chat x2) + (Task x3)</p>
              <p className="text-3xl font-black">Avg: {Math.round(avgWeightedWorkload)} <span className="text-sm font-bold opacity-40">Units</span></p>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
             <div className="flex items-center gap-3">
               <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl"><Zap size={24} /></div>
               <h3 className="text-xl font-black text-slate-800 tracking-tight">Weekly Shoutout</h3>
             </div>
             <div className="bg-amber-50/50 p-8 rounded-[2rem] border border-amber-100 italic font-bold text-slate-700 leading-relaxed text-sm">
                "Pume กำลังทำผลงานได้อย่างโดดเด่นในฐานะ Solo Specialist! แม้ปริมาณงานจะสูงกว่าค่าเฉลี่ยถึง 50% แต่ยังรักษาคุณภาพได้ดีเยี่ยม และทีม Buddy ทุกคนช่วยกันกระจายงานสายกับแชทได้อย่างสมดุลมากครับ!"
             </div>
             <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                <span>Intelligence via Gemini</span>
                <span className="flex items-center gap-1">Live <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div></span>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StaffHub;
