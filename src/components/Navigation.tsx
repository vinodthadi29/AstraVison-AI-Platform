import React from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Search, Cpu, Users, Layers } from 'lucide-react';
interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}
const tabs = [
{
  id: 'home',
  label: 'Home',
  icon: LayoutGrid
},
{
  id: 'search',
  label: 'Visual Search',
  icon: Search
},
{
  id: 'features',
  label: 'Features',
  icon: Layers
},
{
  id: 'technology',
  label: 'Technology',
  icon: Cpu
},
{
  id: 'team',
  label: 'Team',
  icon: Users
}];

export function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4">
      <div className="glass-panel rounded-full px-2 py-2 flex items-center gap-1 shadow-2xl shadow-black/50">
        <div className="px-4 py-2 mr-4 border-r border-white/10">
          <span className="font-display font-bold text-lg tracking-tight text-white">
            ASTRA<span className="text-astra-violet">VISION</span>
          </span>
        </div>

        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-2 rounded-full flex items-center gap-2 transition-colors duration-300 ${isActive ? 'text-white' : 'text-astra-text-secondary hover:text-white'}`}>

              {isActive &&
              <motion.div
                layoutId="nav-pill"
                className="absolute inset-0 bg-white/10 rounded-full"
                transition={{
                  type: 'spring',
                  bounce: 0.2,
                  duration: 0.6
                }} />

              }
              <span className="relative z-10 flex items-center gap-2 text-sm font-medium">
                <Icon
                  size={14}
                  className={isActive ? 'text-astra-violet' : ''} />

                {tab.label}
              </span>
            </button>);

        })}
      </div>
    </nav>);

}