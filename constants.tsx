
import { StaffMember, EvaluationRecord } from './types';

export const TEAM_MEMBERS: StaffMember[] = [
  { id: '1', name: 'Pookie', role: 'Support Specialist' },
  { id: '2', name: 'Gam', role: 'Support Specialist' },
  { id: '3', name: 'Pume', role: 'Project Coordinator' },
  { id: '4', name: 'Namva', role: 'Support Specialist' },
  { id: '5', name: 'Aim', role: 'Project Specialist' },
  { id: '6', name: 'Noey', role: 'Senior Support' },
  { id: '7', name: 'TBA 1', role: 'Support Staff' },
  { id: '8', name: 'TBA 2', role: 'Support Staff' },
];

export const INITIAL_EVALUATIONS: EvaluationRecord[] = [
  {
    id: 'e1',
    staffId: '1',
    staffName: 'Pookie',
    date: '2024-12-01',
    type: 'Project',
    projectSubCategory: 'Restaurant',
    communicationScore: 85,
    speedScore: 90,
    followUpScore: 80,
    clarityScore: 88,
    processCompliance: 100,
    onboardingQuality: 92,
    daysToLive: 8, // Met (Target 10)
    stepsCompleted: 10,
    // Fix: Added missing workload metrics
    incomingCalls: 5,
    outgoingCalls: 12,
    totalChats: 45,
    totalTasks: 8,
    issuesResolved: 0,
    customerFeedback: 95,
    sideTaskPoints: 10,
    note: 'Excellent restaurant setup.'
  },
  {
    id: 'e2',
    staffId: '2',
    staffName: 'Gam',
    date: '2024-12-02',
    type: 'Maintenance',
    communicationScore: 75,
    speedScore: 85,
    followUpScore: 70,
    clarityScore: 80,
    processCompliance: 80,
    onboardingQuality: 75,
    daysToLive: 0,
    stepsCompleted: 0,
    // Fix: Added missing workload metrics
    incomingCalls: 25,
    outgoingCalls: 10,
    totalChats: 80,
    totalTasks: 20,
    issuesResolved: 15,
    customerFeedback: 85,
    sideTaskPoints: 5,
    note: 'Handled many menu updates.'
  },
  {
    id: 'e3',
    staffId: '3',
    staffName: 'Pume',
    date: '2024-12-03',
    type: 'Project',
    projectSubCategory: 'Massage',
    communicationScore: 92,
    speedScore: 78,
    followUpScore: 95,
    clarityScore: 90,
    processCompliance: 90,
    onboardingQuality: 88,
    daysToLive: 14, // Met (Target 15)
    stepsCompleted: 9,
    // Fix: Added missing workload metrics
    incomingCalls: 8,
    outgoingCalls: 15,
    totalChats: 30,
    totalTasks: 12,
    issuesResolved: 0,
    customerFeedback: 100,
    sideTaskPoints: 20,
    note: 'Very thorough with massage system details.'
  },
  {
    id: 'e4',
    staffId: '5',
    staffName: 'Aim',
    date: '2024-12-04',
    type: 'Project',
    projectSubCategory: 'AI Receptionist',
    communicationScore: 90,
    speedScore: 95,
    followUpScore: 85,
    clarityScore: 95,
    processCompliance: 100,
    onboardingQuality: 95,
    daysToLive: 2, // Met (Target 3)
    stepsCompleted: 10,
    // Fix: Added missing workload metrics
    incomingCalls: 12,
    outgoingCalls: 8,
    totalChats: 25,
    totalTasks: 15,
    issuesResolved: 0,
    customerFeedback: 98,
    sideTaskPoints: 0,
    note: 'Fast AI deployment.'
  }
];
