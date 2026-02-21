import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Search, Cpu, Users, Layers } from 'lucide-react';
// Components
import { AtmosphericBackground } from './components/AtmosphericBackground';
import { AIEntities } from './components/AIEntities';
import { AuthPortal } from './components/AuthPortal';
import { VisualSearch } from './components/VisualSearch';
import { FeaturesSection } from './components/FeaturesSection';
import { TechnologySection } from './components/TechnologySection';
// New UI Components
import { GlobeHero } from './components/ui/GlobeHero';
import { AnimeNavBar } from './components/ui/AnimeNavBar';
import { ContainerScroll } from './components/ui/ContainerScroll';
import { TeamShuffle } from './components/ui/TeamShuffle';
const navItems = [
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

const teamMembers = [
{
  id: 1,
  name: 'Aswinitha Patta',
  role: 'Team Lead & Backend',
  quote: 'Building robust systems that power intelligent solutions.',
  color: 'bg-blue-500'
},
{
  id: 2,
  name: 'Adilsha Khan Pathan',
  role: 'Model Training',
  quote: 'Training neural networks to see and understand the world.',
  color: 'bg-purple-500'
},
{
  id: 3,
  name: 'Vinod Thadi',
  role: 'Product Architect',
  quote: 'Designing scalable architectures for tomorrow.',
  color: 'bg-indigo-500'
},
{
  id: 4,
  name: 'Ajay Jada',
  role: 'Frontend',
  quote: 'Crafting seamless user experiences with modern interfaces.',
  color: 'bg-cyan-500'
},
{
  id: 5,
  name: 'Venkatesh Sunkara',
  role: 'API Integration',
  quote: 'Connecting systems and enabling smooth data flow.',
  color: 'bg-violet-500'
}];

export function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const renderSection = () => {
    switch (activeTab) {
      case 'home':
        return <GlobeHero onEnterSystem={() => setIsAuthOpen(true)} />;
      case 'search':
        return <VisualSearch />;
      case 'features':
        return <FeaturesSection />;
      case 'technology':
        return (
          <ContainerScroll
            titleComponent={
            <>
                <h1 className="text-4xl font-semibold text-white mb-8">
                  System <br />
                  <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none text-astra-violet">
                    Architecture
                  </span>
                </h1>
              </>
            }>

            <TechnologySection />
          </ContainerScroll>);

      case 'team':
        return (
          <div className="min-h-screen flex flex-col items-center justify-center">
            <div className="text-center mb-10">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                The Minds
              </h2>
              <p className="text-astra-text-secondary">
                Architects of the next generation.
              </p>
            </div>
            <TeamShuffle members={teamMembers} />
          </div>);

      default:
        return <GlobeHero onEnterSystem={() => setIsAuthOpen(true)} />;
    }
  };
  return (
    <div className="min-h-screen w-full bg-astra-bg text-astra-text-primary selection:bg-astra-violet/30 overflow-x-hidden">
      {/* Environmental Layers */}
      <AtmosphericBackground />
      <AIEntities />

      {/* UI Layer */}
      <div className="relative z-10">
        <AnimeNavBar
          items={navItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab} />


        <main className="relative pt-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{
                opacity: 0,
                y: 20,
                filter: 'blur(10px)'
              }}
              animate={{
                opacity: 1,
                y: 0,
                filter: 'blur(0px)'
              }}
              exit={{
                opacity: 0,
                y: -20,
                filter: 'blur(10px)'
              }}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1]
              }}>

              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Overlays */}
      <AuthPortal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>);

}
