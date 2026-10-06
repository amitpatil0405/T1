import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut, Activity } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-[#151921] border-b border-[#2A303C] px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 bg-blue-600/10 border border-blue-500/30 rounded-lg flex items-center justify-center">
          <Shield className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-100 tracking-tight leading-none">DeltaFox</h1>
          <span className="text-[10px] text-gray-400 tracking-wider font-mono uppercase">Trading Analysis Terminal</span>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 bg-[#0B0E14] border border-[#2A303C] px-3 py-1.5 rounded-lg text-xs">
          <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span className="text-gray-400">System:</span>
          <span className="text-emerald-400 font-medium">LIVE</span>
        </div>

        <div className="flex items-center space-x-3 border-l border-[#2A303C] pl-6">
          <div className="text-right">
            <div className="text-xs font-semibold text-gray-200">{user?.user_id}</div>
            <div className="text-[10px] text-blue-400 uppercase tracking-wider">Administrator</div>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="p-2 bg-[#0B0E14] hover:bg-red-500/10 border border-[#2A303C] hover:border-red-500/30 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
