import React from 'react';
import { Stethoscope, Microscope, Scan, Heart, ClipboardCheck, Smile, Syringe, Pill, Droplets } from 'lucide-react';

const services = [
  { icon: <Stethoscope size={32} />, label: 'Consultation', color: 'bg-[#008ba3]' },
  { icon: <Microscope size={32} />, label: 'Laboratory', color: 'bg-[#1e293b]' },
  { icon: <Scan size={32} />, label: 'Radiology', color: 'bg-[#008ba3]' },
  { icon: <Heart size={32} />, label: 'Cardiology', color: 'bg-[#1e293b]' },
  { icon: <ClipboardCheck size={32} />, label: 'Health Check Up', color: 'bg-[#008ba3]' },
  { icon: <Smile size={32} />, label: 'Dental Care', color: 'bg-[#1e293b]' },
  { icon: <Syringe size={32} />, label: 'Vaccinations', color: 'bg-[#008ba3]' },
  { icon: <Pill size={32} />, label: 'Pharmacy', color: 'bg-[#1e293b]' },
  { icon: <Droplets size={32} />, label: 'Home Blood Collection', color: 'bg-[#008ba3]' },
];

export const ServicesBar: React.FC = () => {
  return (
    <div className="w-full flex flex-wrap md:flex-nowrap">
      {services.map((service, index) => (
        <div 
          key={index} 
          className={`${service.color} flex-1 min-w-[120px] py-8 px-4 flex flex-col items-center justify-center text-white hover:opacity-90 transition-opacity cursor-pointer border-r border-white/10 last:border-r-0`}
        >
          <div className="mb-3">
            {service.icon}
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-center leading-tight">
            {service.label}
          </span>
        </div>
      ))}
    </div>
  );
};
