
import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  User, 
  PlusCircle, 
  TrendingUp, 
  Clock, 
  MessageSquare, 
  CheckCircle2, 
  ChevronRight, 
  Menu,
  X,
  Target,
  ClipboardList,
  Store,
  Sparkles,
  Zap,
  Calculator,
  Save,
  FileText,
  BarChart3,
  Activity,
  Info,
  ShieldCheck,
  FileSearch,
  GraduationCap,
  Award,
  ChevronDown,
  Percent,
  ArrowLeft,
  FileCheck,
  CalendarDays,
  ListFilter,
  Trophy,
  LayoutGrid,
  Camera,
  HeartHandshake,
  ExternalLink,
  Search
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell
} from 'recharts';
import { TEAM_MEMBERS, INITIAL_EVALUATIONS } from './constants';
import { EvaluationRecord, QARecord, TestSubmission, ProofRecord, PeerReviewRecord } from './types';

// Components
import StatCard from './components/StatCard';
import EvaluationForm from './components/EvaluationForm';
import SidebarItem from './components/SidebarItem';
import IndividualDeepDive from './components/IndividualDeepDive';
import QAChecklist from './components/QAChecklist';
import AssessmentCenter from './components/AssessmentCenter';
import TeamAnalysis from './components/TeamAnalysis';
import StaffHub from './components/StaffHub';
import ProofVault from './components/ProofVault';
import PeerReviewCollector from './components/PeerReviewCollector';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'evaluate' | 'team' | 'individual' | 'records' | 'qa' | 'assessment' | 'staffHub' | 'proof' | 'peerReview'>('dashboard');
  const [recordsSubTab, setRecordsSubTab] = useState<'evaluations' | 'qa' | 'tests'>('evaluations');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedStaffId, setSelectedStaffId] = useState<string>(TEAM_MEMBERS[0]?.id || '1');
  
  // Persistence States
  const [evaluations, setEvaluations] = useState<EvaluationRecord[]>(() => {
    const saved = localStorage.getItem('cs_evaluations_v3');
    return saved ? JSON.parse(saved) : INITIAL_EVALUATIONS;
  });

  const [qaRecords, setQaRecords] = useState<QARecord[]>(() => {
    const saved = localStorage.getItem('cs_qa_records_v1');
    return saved ? JSON.parse(saved) : [];
  });

  const [testSubmissions, setTestSubmissions] = useState<TestSubmission[]>(() => {
    const saved = localStorage.getItem('cs_test_submissions_v1');
    return saved ? JSON.parse(saved) : [];
  });

  const [proofRecords, setProofRecords] = useState<ProofRecord[]>(() => {
    const saved = localStorage.getItem('cs_proof_records_v1');
    return saved ? JSON.parse(saved) : [];
  });

  const [peerReviewRecords, setPeerReviewRecords] = useState<PeerReviewRecord[]>(() => {
    const saved = localStorage.getItem('cs_peer_review_records_v1');
    return saved ? JSON.parse(saved) : [];
  });

  const [projectSLA, setProjectSLA] = useState(() => {
    const saved = localStorage.getItem('cs_project_sla_v1');
    return saved ? JSON.parse(saved) : { 
      restaurant: { total: 0, met: 0, target: '10D' }, 
      massage: { total: 0, met: 0, target: '15D' }, 
      ai: { total: 0, met: 0, target: '3D' } 
    };
  });

  const [otherKPIs, setOtherKPIs] = useState(() => {
    const saved = localStorage.getItem('cs_other_kpis_v1');
    return saved ? JSON.parse(saved) : { 
      responseSpeed: { total: 100, met: 85 }, 
      csat: { total: 100, met: 90 } 
    };
  });

  // Effects for Persistence
  useEffect(() => localStorage.setItem('cs_evaluations_v3', JSON.stringify(evaluations)), [evaluations]);
  useEffect(() => localStorage.setItem('cs_qa_records_v1', JSON.stringify(qaRecords)), [qaRecords]);
  useEffect(() => localStorage.setItem('cs_test_submissions_v1', JSON.stringify(testSubmissions)), [testSubmissions]);
  useEffect(() => localStorage.setItem('cs_proof_records_v1', JSON.stringify(proofRecords)), [proofRecords]);
  useEffect(() => localStorage.setItem('cs_peer_review_records_v1', JSON.stringify(peerReviewRecords)), [peerReviewRecords]);
  useEffect(() => localStorage.setItem('cs_project_sla_v1', JSON.stringify(projectSLA)), [projectSLA]);
  useEffect(() => localStorage.setItem('cs_other_kpis_v1', JSON.stringify(otherKPIs)), [otherKPIs]);

  const teamPerformanceData = useMemo(() => {
    return TEAM_MEMBERS.map(member => {
      const scores: number[] = [];
      const memberEvals = evaluations.filter(e => e.staffId === member.id);
      if (memberEvals.length > 0) {
        const evalAvg = memberEvals.reduce((acc, curr) => 
          acc + ((Number(curr.communicationScore) || 0) + (Number(curr.speedScore) || 0) + (Number(curr.processCompliance) || 0)) / 3, 0
        ) / memberEvals.length;
        scores.push(evalAvg);
      }
      const memberQA = qaRecords.filter(r => r.staffId === member.id);
      if (memberQA.length > 0) {
        const qaAvg = memberQA.reduce((acc, curr) => acc + curr.overallPercentage, 0) / memberQA.length;
        scores.push(qaAvg);
      }
      const memberTests = testSubmissions.filter(t => t.staffName === member.name);
      if (memberTests.length > 0) {
        const testAvg = memberTests.reduce((acc, curr) => acc + ((curr.autoScore + curr.manualScore) / curr.totalPossiblePoints * 100), 0) / memberTests.length;
        scores.push(testAvg);
      }
      const finalScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      return { id: member.id, name: member.name, score: finalScore };
    }).sort((a, b) => b.score - a.score);
  }, [evaluations, qaRecords, testSubmissions]);

  const qaStats = useMemo(() => {
    if (qaRecords.length === 0) return { avg: 0, count: 0 };
    const avg = Math.round(qaRecords.reduce((acc, curr) => acc + curr.overallPercentage, 0) / qaRecords.length);
    return { avg, count: qaRecords.length };
  }, [qaRecords]);

  const globalStats = useMemo(() => {
    const pctR = projectSLA.restaurant.total > 0 ? (projectSLA.restaurant.met / projectSLA.restaurant.total) * 100 : 0;
    const pctM = projectSLA.massage.total > 0 ? (projectSLA.massage.met / projectSLA.massage.total) * 100 : 0;
    const pctA = projectSLA.ai.total > 0 ? (projectSLA.ai.met / projectSLA.ai.total) * 100 : 0;
    const overallSLA = Math.round((pctR + pctM + pctA) / 3);
    const speedPct = otherKPIs.responseSpeed.total > 0 ? (otherKPIs.responseSpeed.met / otherKPIs.responseSpeed.total) * 100 : 0;
    const csatPct = otherKPIs.csat.total > 0 ? (otherKPIs.csat.met / otherKPIs.csat.total) * 100 : 0;
    const individualBaseAvg = teamPerformanceData.length > 0 
      ? teamPerformanceData.reduce((a, b) => a + b.score, 0) / teamPerformanceData.length
      : 0;
    const teamAvgPerf = Math.round((individualBaseAvg + speedPct + csatPct + qaStats.avg) / 4);
    return { 
      overallSLA, teamAvgPerf, totalProjects: projectSLA.restaurant.total + projectSLA.massage.total + projectSLA.ai.total,
      sideTaskPoints: evaluations.reduce((acc, curr) => acc + (Number(curr.sideTaskPoints) || 0), 0),
      pctR: Math.round(pctR), pctM: Math.round(pctM), pctA: Math.round(pctA)
    };
  }, [projectSLA, teamPerformanceData, otherKPIs, qaStats, evaluations]);

  const updateOtherKPI = (category: 'responseSpeed' | 'csat', field: 'met' | 'total', value: string) => {
    setOtherKPIs(prev => ({...prev, [category]: {...prev[category], [field]: parseInt(value) || 0}}));
  };

  const updateProjectSLA = (category: 'restaurant' | 'massage' | 'ai', field: 'met' | 'total', value: string) => {
    setProjectSLA(prev => ({...prev, [category]: {...prev[category], [field]: parseInt(value) || 0}}));
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-slate-900 transition-all duration-300 ease-in-out flex flex-col z-50`}>
        <div className="p-6 flex items-center gap-4">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20"><Target className="text-white" size={24} /></div>
          {isSidebarOpen && <h1 className="text-white font-black text-lg">CS Dashboard</h1>}
        </div>
        <nav className="flex-1 mt-6 px-3 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-2 mb-2">Main</div>
          <SidebarItem id="dashboard" label="Overview" icon={LayoutDashboard} active={activeTab === 'dashboard'} collapsed={!isSidebarOpen} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem id="evaluate" label="Add Evaluation" icon={PlusCircle} active={activeTab === 'evaluate'} collapsed={!isSidebarOpen} onClick={() => setActiveTab('evaluate')} />
          <SidebarItem id="qa" label="QA Check List" icon={FileSearch} active={activeTab === 'qa'} collapsed={!isSidebarOpen} onClick={() => setActiveTab('qa')} />
          
          <div className="mt-6 text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-2 mb-2 border-t border-slate-800 pt-6">Internal Logs</div>
          <SidebarItem id="proof" label="Proof Vault" icon={Camera} active={activeTab === 'proof'} collapsed={!isSidebarOpen} onClick={() => setActiveTab('proof')} />
          <SidebarItem id="peerReview" label="Peer Review Collector" icon={HeartHandshake} active={activeTab === 'peerReview'} collapsed={!isSidebarOpen} onClick={() => setActiveTab('peerReview')} />
          
          <div className="mt-6 text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-2 mb-2 border-t border-slate-800 pt-6">Analysis & Records</div>
          <SidebarItem id="assessment" label="Assessment" icon={GraduationCap} active={activeTab === 'assessment'} collapsed={!isSidebarOpen} onClick={() => setActiveTab('assessment')} />
          <SidebarItem id="records" label="Master Records" icon={FileText} active={activeTab === 'records'} collapsed={!isSidebarOpen} onClick={() => setActiveTab('records')} />
          <SidebarItem id="team" label="Team Analysis" icon={Users} active={activeTab === 'team'} collapsed={!isSidebarOpen} onClick={() => setActiveTab('team')} />
          <SidebarItem id="individual" label="Staff Deep Dive" icon={User} active={activeTab === 'individual'} collapsed={!isSidebarOpen} onClick={() => setActiveTab('individual')} />
          
          <div className="mt-6 text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-2 mb-2 border-t border-slate-800 pt-6">Staff Views</div>
          <SidebarItem id="staffHub" label="Team Hub" icon={Trophy} active={activeTab === 'staffHub'} collapsed={!isSidebarOpen} onClick={() => setActiveTab('staffHub')} />
        </nav>
        <div className="p-4 mt-auto">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="w-full flex items-center justify-center p-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 transition-colors">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 capitalize tracking-tight">
            {activeTab === 'proof' ? 'Proof Vault (Internal Record)' : 
             activeTab === 'peerReview' ? 'Peer Review Form Control' : 
             activeTab === 'staffHub' ? 'Team Hub' : activeTab}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-slate-400 uppercase">CS Manager Admin</span>
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xs font-black">MGR</div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <div className="space-y-12 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Overall Performance" value={`${globalStats.teamAvgPerf}%`} sub="Team Weighted Score" icon={Activity} color="blue" />
                <StatCard label="Overall SLA Met" value={`${globalStats.overallSLA}%`} sub="Target Achievement" icon={ShieldCheck} color="emerald" />
                <StatCard label="Total Projects" value={globalStats.totalProjects} sub="Combined Categories" icon={CheckCircle2} color="purple" />
                <StatCard label="Side Task Points" value={globalStats.sideTaskPoints} sub="Accumulated Rewards" icon={Award} color="orange" />
              </div>

              {/* SECTION: Project SLA Performance */}
              <div className="space-y-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-5">
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-blue-600"><Calculator size={24} /></div>
                    <div>
                      <h3 className="text-3xl font-black text-slate-900 leading-none">Project SLA Performance</h3>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Calculate Metrics by Category</p>
                    </div>
                  </div>
                  <div className="bg-[#0f172a] rounded-[2rem] px-10 py-6 flex items-center gap-8 shadow-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-white font-black text-xs shadow-lg">R</div>
                      <span className="text-white font-black text-xl">{globalStats.pctR}%</span>
                    </div>
                    <span className="text-slate-600 font-bold">+</span>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center text-white font-black text-xs shadow-lg">M</div>
                      <span className="text-white font-black text-xl">{globalStats.pctM}%</span>
                    </div>
                    <span className="text-slate-600 font-bold">+</span>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-purple-500 rounded-full flex items-center justify-center text-white font-black text-xs shadow-lg">AI</div>
                      <span className="text-white font-black text-xl">{globalStats.pctA}%</span>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                       <div className="flex flex-col items-center">
                          <span className="text-slate-500 font-black text-lg leading-none">/</span>
                          <span className="text-slate-500 font-black text-lg leading-none">3</span>
                          <span className="text-slate-500 font-black text-lg leading-none">=</span>
                       </div>
                       <div className="w-[2px] h-10 bg-slate-800 mx-4"></div>
                       <div className="flex items-center gap-3">
                          <span className="text-blue-400 font-black text-xl">%</span>
                          <span className="text-blue-400 font-black text-3xl">{globalStats.overallSLA}%</span>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <ProjectSLACard label="Restaurant" icon={Store} color="blue" target="10D" stats={projectSLA.restaurant} onChange={(f, v) => updateProjectSLA('restaurant', f, v)} />
                  <ProjectSLACard label="Massage" icon={Sparkles} color="emerald" target="15D" stats={projectSLA.massage} onChange={(f, v) => updateProjectSLA('massage', f, v)} />
                  <ProjectSLACard label="AI Receptionist" icon={Zap} color="purple" target="3D" stats={projectSLA.ai} onChange={(f, v) => updateProjectSLA('ai', f, v)} />
                </div>
              </div>

              {/* Team Performance Graph */}
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm animate-in slide-in-from-bottom-6 duration-700">
                <div className="flex items-center gap-6 mb-12">
                   <div className="w-16 h-16 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-indigo-100">
                      <TrendingUp size={32} />
                   </div>
                   <div>
                      <h3 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">Overall Team Performance Board (%)</h3>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 opacity-60">WEIGHTED PERFORMANCE: QA + TEST + EVALUATIONS</p>
                   </div>
                </div>
                <div className="h-[500px] w-full mt-8">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={teamPerformanceData} layout="vertical" margin={{ left: 60, right: 40, top: 0, bottom: 0 }} barSize={32}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" domain={[0, 100]} hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#1e293b', fontSize: 16, fontWeight: 800 }} width={100} />
                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="score" radius={[0, 12, 12, 0]}>
                           {teamPerformanceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.score > 80 ? '#10b981' : '#3b82f6'} />
                           ))}
                        </Bar>
                      </BarChart>
                   </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* New Proof Tab */}
          {activeTab === 'proof' && (
            <ProofVault 
              proofs={proofRecords} 
              onAdd={(p) => setProofRecords([p, ...proofRecords])} 
              onDelete={(id) => setProofRecords(proofRecords.filter(p => p.id !== id))}
            />
          )}

          {/* New Peer Review Tab */}
          {activeTab === 'peerReview' && (
            <PeerReviewCollector 
              onReceiveReview={(r) => setPeerReviewRecords([r, ...peerReviewRecords])} 
            />
          )}

          {/* Existing Tabs */}
          {activeTab === 'records' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="flex bg-white p-2 rounded-[2.5rem] border border-slate-100 shadow-sm w-fit mx-auto gap-1">
                 {[
                   {id: 'evaluations', label: 'Evaluation Records', icon: ClipboardList},
                   {id: 'qa', label: 'QA Records', icon: ShieldCheck},
                   {id: 'tests', label: 'Test Submissions', icon: GraduationCap}
                 ].map((tab) => (
                   <button
                    key={tab.id}
                    onClick={() => setRecordsSubTab(tab.id as any)}
                    className={`flex items-center gap-2 px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                      recordsSubTab === tab.id ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'
                    }`}
                   >
                     <tab.icon size={16} /> {tab.label}
                   </button>
                 ))}
               </div>
               <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[550px]">
                  {recordsSubTab === 'evaluations' && (
                    <div className="overflow-x-auto p-10">
                      <table className="w-full text-left">
                        <thead className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                          <tr><th className="py-6">Date</th><th>Staff</th><th>Category</th><th className="text-center">Avg Score</th><th className="text-right">View</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {evaluations.slice().reverse().map(e => {
                            const avg = Math.round(((Number(e.communicationScore) || 0) + (Number(e.speedScore) || 0) + (Number(e.processCompliance) || 0)) / 3);
                            return (
                              <tr key={e.id} className="hover:bg-slate-50 transition-all cursor-pointer">
                                <td className="py-6 text-slate-400">{e.date}</td>
                                <td className="font-black text-slate-800">{e.staffName}</td>
                                <td><span className="text-[10px] font-black bg-slate-100 px-3 py-1 rounded-lg uppercase">{e.type}</span></td>
                                <td className="text-center"><span className="px-4 py-2 rounded-xl font-black bg-blue-50 text-blue-600">{avg}%</span></td>
                                <td className="text-right"><ChevronRight className="ml-auto text-slate-300" /></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {/* ... other subtabs ... */}
               </div>
            </div>
          )}

          {activeTab === 'evaluate' && <EvaluationForm onAdd={(e) => { setEvaluations([...evaluations, e]); setActiveTab('records'); }} />}
          {activeTab === 'qa' && <QAChecklist onSave={(qa) => { setQaRecords([...qaRecords, qa]); setActiveTab('records'); }} />}
          {activeTab === 'assessment' && <AssessmentCenter onSave={() => {}} />}
          {activeTab === 'individual' && (
            <IndividualDeepDive 
              staffId={selectedStaffId} 
              evaluations={evaluations} 
              proofs={proofRecords}
              peerReviews={peerReviewRecords}
              onStaffChange={setSelectedStaffId} 
            />
          )}
          {activeTab === 'team' && <TeamAnalysis teamPerformance={teamPerformanceData} evaluations={evaluations} qaRecords={qaRecords} />}
          {activeTab === 'staffHub' && <StaffHub teamPerformance={teamPerformanceData} evaluations={evaluations} qaRecords={qaRecords} testSubmissions={testSubmissions} />}
        </div>
      </main>
    </div>
  );
};

// UI Components
const ProjectSLACard: React.FC<{ label: string, icon: any, color: string, target: string, stats: any, onChange: (f: 'total' | 'met', v: string) => void }> = ({ label, icon: Icon, color, target, stats, onChange }) => {
  const pct = stats.total > 0 ? Math.round((stats.met / stats.total) * 100) : 0;
  const theme: any = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
  }[color] || { bg: 'bg-slate-50', text: 'text-slate-600' };

  return (
    <div className={`${theme.bg} p-10 rounded-[3rem] border border-slate-100 space-y-10 flex flex-col items-center group hover:shadow-xl transition-all`}>
      <div className="relative">
        <div className="w-20 h-20 bg-white rounded-[2rem] shadow-sm flex items-center justify-center border border-slate-50">
          <Icon size={32} className={theme.text} />
        </div>
        <div className="absolute -top-3 -right-6 px-3 py-1.5 rounded-xl border border-white shadow-sm font-black text-[9px] uppercase bg-white text-slate-500">Target: {target}</div>
      </div>
      <div className="text-center">
        <p className="text-6xl font-black text-slate-900 leading-none">{pct}%</p>
        <h4 className="font-black text-slate-800 text-xl mt-4">{label}</h4>
      </div>
      <div className="grid grid-cols-2 gap-6 w-full mt-2">
        <div className="space-y-2 text-center">
          <label className="text-[10px] font-black text-slate-400 uppercase">Total</label>
          <input type="number" value={stats.total || ''} onChange={(e) => onChange('total', e.target.value)} className="w-full bg-white border border-slate-100 rounded-2xl p-4 font-black text-slate-800 text-center outline-none" placeholder="0" />
        </div>
        <div className="space-y-2 text-center">
          <label className="text-[10px] font-black text-slate-400 uppercase">Met SLA</label>
          <input type="number" value={stats.met || ''} onChange={(e) => onChange('met', e.target.value)} className="w-full bg-white border border-slate-100 rounded-2xl p-4 font-black text-slate-800 text-center outline-none" placeholder="0" />
        </div>
      </div>
    </div>
  );
};

export default App;
