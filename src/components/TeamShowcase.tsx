import React from 'react';
import { motion } from 'framer-motion';
const team = [
{
  name: 'Aswinitha Patta(Team Lead)',
  role: 'Backend',
  color: 'bg-blue-500'
},
{
  name: 'Adilsha Khan Pathan',
  role: 'Model Training',
  color: 'bg-purple-500'
},
{
  name: "Vinod Thadi",
  role: 'Product Architect',
  color: 'bg-indigo-500'
},
{
  name: 'Ajay Jada',
  role: 'Frontend',
  color: 'bg-cyan-500'
},
{
  name: 'Venkatesh Sunkara',
  role: 'API Integration',
  color: 'bg-violet-500'
}];

export function TeamShowcase() {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="max-w-7xl w-full">
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            The Minds
          </h2>
          <p className="text-astra-text-secondary">
            Architects of the next generation.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {team.map((member, index) =>
          <motion.div
            key={index}
            initial={{
              opacity: 0,
              scale: 0.9
            }}
            whileInView={{
              opacity: 1,
              scale: 1
            }}
            viewport={{
              once: true
            }}
            transition={{
              delay: index * 0.1
            }}
            whileHover={{
              y: -10,
              scale: 1.02
            }}
            className="group relative w-64 h-80">

              {/* Card Container */}
              <div className="absolute inset-0 bg-white/5 rounded-xl border border-white/10 overflow-hidden transition-all duration-500 group-hover:border-astra-violet/50 group-hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]">
                {/* Image Placeholder */}
                <div
                className={`h-48 w-full ${member.color} opacity-20 group-hover:opacity-30 transition-opacity duration-500`} />


                {/* Content */}
                <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
                  <h3 className="text-lg font-bold text-white mb-1">
                    {member.name}
                  </h3>
                  <p className="text-sm text-astra-text-secondary font-mono">
                    {member.role}
                  </p>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-astra-violet/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

}
