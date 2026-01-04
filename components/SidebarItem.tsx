
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SidebarItemProps {
  id: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  collapsed?: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ label, icon: Icon, active, collapsed, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 translate-x-1' 
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
      } ${collapsed ? 'justify-center' : ''}`}
    >
      <Icon size={22} />
      {!collapsed && <span className="font-semibold text-sm">{label}</span>}
    </button>
  );
};

export default SidebarItem;
