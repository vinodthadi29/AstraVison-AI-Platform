import React from 'react';
import { motion } from 'framer-motion';
import { AtmosphericBackground } from './AtmosphericBackground';
import { AIEntities } from './AIEntities';
import { GlobeHero } from './ui/GlobeHero';

interface LandingPageProps {
  onOpenAuth: () => void;
}

export default function LandingPage({ onOpenAuth }: LandingPageProps) {
  return (
    <div className="relative w-full min-h-screen bg-astra-bg">
      <AtmosphericBackground />
      <AIEntities />
      <GlobeHero onEnterSystem={onOpenAuth} />
    </div>
  );
}
