
import React, { useMemo } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line
} from 'recharts';
import { EvaluationRecord, ProofRecord, PeerReviewRecord } from '../types';
import { TEAM_MEMBERS } from '../constants';
import { 
  TrendingUp, 
  Target, 
  MessageSquare, 
  ShieldCheck, 
  Zap,
  Briefcase,
  ChevronUp,
  ChevronDown,
  Minus,
  CalendarDays,
  User,
  Activity,
  Award,
  BarChart3,
  Clock,
  Camera,
  HeartHandshake,
  MessageCircle,
  AlertCircle
} from 'lucide-react';

interface IndividualDeepDiveProps {
  staffId: string;
  evaluations: EvaluationRecord[];
  proofs: ProofRecord[];
  peerReviews: PeerReviewRecord[];
  onStaffChange: (id: string) => void;
}

const IndividualDeepDive: React.FC<IndividualDeepDiveProps> = ({ staffId, evaluations, proofs, peerReviews, onStaffChange }) => {
  const staff = TEAM_MEMBERS.find(m => m.id === staffId);
  const memberEvals = evaluations.filter(e => e.staffId === staffId);
  const memberProofs = proofs.filter(p => p.staffId === staffId);
  const memberPeerReviews = peerReviews.filter(r => r.targetStaffId === staffId);

  const radarData = useMemo(() => {
    if (memberEvals.length === 0) return [];
    const count = memberEvals.length;
    const averages = {
      Communication: memberEvals.reduce((a, b) => a + b.communicationScore, 0) / count,
      Speed: memberEvals.reduce((a, b) => a + b.speedScore, 0) / count,
      FollowUp: memberEvals.reduce((a, b) => a + b.followUpScore, 0) / count,
      Clarity: memberEvals.reduce((a, b) => a + b.clarityScore, 0) / count,
      Process: memberEvals.reduce((a, b) => a + b.processCompliance, 0) / count,
      Quality: memberEvals.reduce((a, b) => a + b.onboardingQuality, 0) / count,
    };
    return Object.entries(averages).map(([subject, value]) => ({
      subject, A: Math.round(value), fullMark: 100,
    }));
  }, [memberEvals]);

  const overallIndividualScore = useMemo(() => {
    if (memberEvals.length === 0) return 0;
    const allScores = memberEvals.map(e => (e.communicationScore + e.speedScore + e.followUpScore + e.clarityScore + e.processCompliance + e.onboardingQuality) / 6);
    return Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
  }, [memberEvals]);

  const peerReviewAvg = useMemo(() => {
    if (memberPeerReviews.length === 0) return 0;
    const sum = memberPeerReviews.reduce((acc, curr) => acc + (curr.teamworkScore + curr.helpfulnessScore + curr.communicationScore) / 3, 0);
    return Math.round(sum / memberPeerReviews.length);
  }, [memberPeerReviews]);

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-32">
      {/* Header Profile */}
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-[2.5rem] bg-slate-900 text-white flex items-center justify-center text-3xl font-black shadow-2xl">
            {staff?.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
             <div className="flex items-center gap-3">
               <h2 className="text-4xl font-black text-slate-800">{staff?.name}</h2>
               <span className="px-4 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase tracking-widest">{staff?.role}</span>
             </div>
             <p className="text-slate-400 font-bold text-sm mt-2">Overall KPI Index: <span className="text-slate-800 font-black">{overallIndividualScore}%</span></p>
          </div>
        </div>
        <select className="bg-slate-100 p-4 rounded-2xl font-black outline-none" value={staffId} onChange={(e) => onStaffChange(e.target.value)}>
          {TEAM_MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>

      {/* KPI Performance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <h3 className="font-black text-xl text-slate-800 mb-8 flex items-center gap-2"><Target className="text-blue-500" /> Skill Radar</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                <Radar dataKey="A" stroke="#3b82f6" strokeWidth={3} fill="#3b82f6" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peer Review Summary Card */}
        <div className="bg-indigo-900 p-10 rounded-[3rem] text-white shadow-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-10 opacity-10"><HeartHandshake size={140} /></div>
           <div className="relative z-10 space-y-6 h-full flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2">360° Peer Perception</p>
                <h3 className="text-3xl font-black leading-tight">What the team thinks of {staff?.name}</h3>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-6xl font-black">{peerReviewAvg}%</div>
                <div className="flex-1 space-y-2">
                   <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-400" style={{width: `${peerReviewAvg}%`}}></div>
                   </div>
                   <p className="text-[10px] font-bold text-indigo-300 uppercase">Average based on {memberPeerReviews.length} reviews</p>
                </div>
              </div>
           </div>
        </div>

        {/* Proof Summary Card */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-between">
           <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl"><Camera size={20} /></div>
                <h3 className="text-xl font-black text-slate-800">Proof Vault</h3>
              </div>
              <p className="text-sm text-slate-400 font-medium">Manager's internal log for feedback sessions and 1-on-1s.</p>
           </div>
           <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
              <span className="text-3xl font-black text-slate-800">{memberProofs.length}</span>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Internal Evidence Items</span>
           </div>
        </div>
      </div>

      {/* NEW SECTION: Qualitative Insights (Manager Proofs & Peer Feedback) */}
      <div className="space-y-10">
        <div className="flex items-center gap-4">
           <div className="h-1 flex-1 bg-slate-100"></div>
           <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] whitespace-nowrap">Qualitative Record & History</h3>
           <div className="h-1 flex-1 bg-slate-100"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Manager Proof Timeline */}
          <div className="space-y-6">
            <h4 className="text-xl font-black text-slate-800 flex items-center gap-3 ml-2">
               <Activity className="text-blue-500" /> Evidence Timeline (Internal)
            </h4>
            <div className="space-y-4">
               {memberProofs.length === 0 ? (
                 <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-dashed border-slate-200 text-center text-slate-400 italic">No proofs recorded for this staff member.</div>
               ) : memberProofs.map(p => (
                 <div key={p.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-blue-200 transition-all flex gap-6 group">
                    {p.imageUrl && (
                      <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-50 flex-shrink-0 border border-slate-100">
                        <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      </div>
                    )}
                    <div className="flex-1 space-y-3">
                       <div className="flex justify-between items-start">
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                            p.category === 'Positive' ? 'bg-emerald-50 text-emerald-600' : p.category === 'Improvement' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {p.category}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Clock size={12} /> {p.date}</span>
                       </div>
                       <p className="text-sm font-bold text-slate-800 leading-relaxed truncate group-hover:whitespace-normal transition-all">{p.description}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          {/* Peer Review Log */}
          <div className="space-y-6">
            <h4 className="text-xl font-black text-slate-800 flex items-center gap-3 ml-2">
               <HeartHandshake className="text-indigo-500" /> Peer Feedback (Every 2 Months)
            </h4>
            <div className="space-y-4">
               {memberPeerReviews.length === 0 ? (
                 <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-dashed border-slate-200 text-center text-slate-400 italic">No peer reviews collected yet.</div>
               ) : memberPeerReviews.map(r => (
                 <div key={r.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                       <div className="flex items-center gap-2">
                          <MessageCircle size={14} className="text-indigo-500" />
                          <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Review Cycle: {r.date}</span>
                       </div>
                       <span className="text-[9px] font-bold text-slate-300">Logged: {new Date(r.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                       <MiniScore label="Teamwork" score={r.teamworkScore} />
                       <MiniScore label="Helpful" score={r.helpfulnessScore} />
                       <MiniScore label="Comm" score={r.communicationScore} />
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-2xl italic text-sm text-indigo-900 font-medium">
                       "{r.comment || "No comment provided."}"
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MiniScore: React.FC<{ label: string, score: number }> = ({ label, score }) => (
  <div className="text-center">
     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
     <p className="text-lg font-black text-slate-800">{score}/5</p>
  </div>
);

export default IndividualDeepDive;
