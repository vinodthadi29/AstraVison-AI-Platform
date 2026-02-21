import React from 'react';
import { Brain, Globe, Shield, Zap, Database, Lock } from 'lucide-react';
import { RadialOrbitalTimeline } from './ui/RadialOrbitalTimeline';
const timelineData = [
{
  id: 1,
  title: 'Neural Processing',
  date: 'Core v4.0',
  content:
  'Advanced pattern recognition powered by proprietary transformer models with multi-modal fusion capabilities.',
  category: 'AI',
  icon: Brain,
  relatedIds: [2, 4],
  status: 'completed' as const,
  energy: 95
},
{
  id: 2,
  title: 'Global Edge Network',
  date: 'Infrastructure',
  content:
  'Distributed inference nodes ensuring <50ms latency worldwide across 200+ edge locations.',
  category: 'Network',
  icon: Globe,
  relatedIds: [1, 3],
  status: 'completed' as const,
  energy: 88
},
{
  id: 3,
  title: 'Enterprise Security',
  date: 'Security Layer',
  content:
  'Military-grade AES-256 encryption for all data in transit and at rest with zero-trust architecture.',
  category: 'Security',
  icon: Shield,
  relatedIds: [2, 6],
  status: 'completed' as const,
  energy: 100
},
{
  id: 4,
  title: 'Real-time Synthesis',
  date: 'Processing',
  content:
  'Generate and modify visual assets instantly with zero lag using GPU-accelerated pipelines.',
  category: 'Performance',
  icon: Zap,
  relatedIds: [1, 5],
  status: 'in-progress' as const,
  energy: 72
},
{
  id: 5,
  title: 'Semantic Indexing',
  date: 'Data Layer',
  content:
  'Automatically categorize and tag millions of assets using deep semantic understanding.',
  category: 'Data',
  icon: Database,
  relatedIds: [4, 6],
  status: 'in-progress' as const,
  energy: 60
},
{
  id: 6,
  title: 'Privacy Core',
  date: 'Compliance',
  content:
  'Local-first processing options for sensitive datasets with full GDPR and SOC2 compliance.',
  category: 'Privacy',
  icon: Lock,
  relatedIds: [3, 5],
  status: 'pending' as const,
  energy: 35
}];

export function FeaturesSection() {
  return (
    <section className="relative min-h-screen">
      <div className="absolute top-8 left-8 z-20">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
          System Capabilities
        </h2>
        <p className="text-astra-text-secondary text-sm">
          Click nodes to explore • Connected systems pulse
        </p>
      </div>
      <RadialOrbitalTimeline timelineData={timelineData} />
    </section>);

}