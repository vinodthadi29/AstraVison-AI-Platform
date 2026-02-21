import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
interface TeamMember {
  id: number;
  name: string;
  role: string;
  quote: string;
  color: string;
}
export function TeamCard({
  handleShuffle,
  member,
  position




}: {handleShuffle: () => void;member: TeamMember;position: string;}) {
  const dragRef = useRef(0);
  const isFront = position === 'front';
  return (
    <motion.div
      style={{
        zIndex: position === 'front' ? '2' : position === 'middle' ? '1' : '0'
      }}
      animate={{
        rotate:
        position === 'front' ?
        '-6deg' :
        position === 'middle' ?
        '0deg' :
        '6deg',
        x: position === 'front' ? '0%' : position === 'middle' ? '33%' : '66%',
        scale: position === 'front' ? 1 : position === 'middle' ? 0.95 : 0.9
      }}
      drag={true}
      dragElastic={0.35}
      dragListener={isFront}
      dragConstraints={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
      onDragStart={(e) => {
        // @ts-ignore
        dragRef.current = e.clientX;
      }}
      onDragEnd={(e) => {
        // @ts-ignore
        if (dragRef.current - e.clientX > 150) {
          handleShuffle();
        }
        dragRef.current = 0;
      }}
      transition={{
        duration: 0.35
      }}
      className={`absolute left-0 top-0 grid h-[450px] w-[350px] select-none place-content-center space-y-6 rounded-2xl border border-white/10 bg-black/40 p-6 shadow-2xl backdrop-blur-xl ${isFront ? 'cursor-grab active:cursor-grabbing hover:border-astra-violet/50' : ''}`}>

      <div
        className={`mx-auto h-32 w-32 rounded-full border-2 border-white/10 ${member.color} opacity-80`} />

      <span className="text-center text-lg italic text-astra-text-secondary leading-relaxed">
        "{member.quote}"
      </span>
      <div className="text-center">
        <span className="block text-lg font-bold text-white">
          {member.name}
        </span>
        <span className="block text-sm font-mono text-astra-violet">
          {member.role}
        </span>
      </div>
    </motion.div>);

}
export function TeamShuffle({ members }: {members: TeamMember[];}) {
  const [positions, setPositions] = useState([
  'front',
  'middle',
  'back',
  'hidden',
  'hidden']
  );
  const handleShuffle = () => {
    const newPositions = [...positions];
    newPositions.unshift(newPositions.pop()!);
    setPositions(newPositions);
  };
  return (
    <div className="grid place-content-center w-full py-20">
      <div className="relative -ml-[100px] h-[450px] w-[350px] md:-ml-[175px]">
        {members.map((member, index) =>
        <TeamCard
          key={member.id}
          member={member}
          handleShuffle={handleShuffle}
          position={positions[index]} />

        )}
      </div>
      <p className="text-center mt-8 text-astra-text-muted font-mono text-xs uppercase tracking-widest">
        Drag card left to shuffle
      </p>
    </div>);

}