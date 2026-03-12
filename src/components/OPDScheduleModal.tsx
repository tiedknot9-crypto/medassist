import React from 'react';
import { X, Bone, Activity, Zap, Brain, Heart, User, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OPDScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const scheduleData = [
  {
    specialty: 'Joint Pain and Rheumatic Disorders',
    icon: <Bone size={24} className="text-indigo-600" />,
    consultants: [
      { name: 'Dr. Sundeep Upadhyay', degree: 'D.M. (Rheumatology)' },
      { name: 'Dr. Durgesh Srivastava', degree: 'D.M. (Rheumatology)' }
    ],
    dates: '12, 13 & 26, 27 Mar'
  },
  {
    specialty: 'Endocrinology',
    icon: <Activity size={24} className="text-indigo-600" />,
    consultants: [
      { name: 'Dr. Shubhadeep Paul', degree: 'D.M. (Endocrinology)' }
    ],
    dates: '7, 8 Feb & 21, 22 Mar'
  },
  {
    specialty: 'Kidney Diseases & Transplant',
    icon: <Zap size={24} className="text-indigo-600" />,
    consultants: [
      { name: 'Dr. Shahzad Alam', degree: 'D.M. (Nephrologist)' },
      { name: 'Dr. Gopambuj Singh Rathod', degree: 'D.M. (Nephrology & Kidney Transplant)' }
    ],
    dates: '7, 21 Mar & 25-Mar'
  },
  {
    specialty: 'Vascular Surgeon',
    icon: <Activity size={24} className="text-indigo-600" />,
    consultants: [
      { name: 'Dr. Ashutosh Pandey', degree: 'M.Ch. (Vascular Surgery)' }
    ],
    dates: '14 & 28 Mar'
  },
  {
    specialty: 'Psychiatrists',
    icon: <Brain size={24} className="text-indigo-600" />,
    consultants: [
      { name: 'Dr. Nitnem Singh Sodhi', degree: 'Psychology (Fellowship in Clinical Psychiatry)' }
    ],
    dates: '15-Mar'
  },
  {
    specialty: 'Cardiology',
    icon: <Heart size={24} className="text-indigo-600" />,
    consultants: [
      { name: 'Dr. Gautam Swaroop', degree: 'D.M. (Cardiology)' }
    ],
    dates: '28-Mar'
  }
];

export const OPDScheduleModal: React.FC<OPDScheduleModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">OPD Schedule of Super-Specialist Doctors</h2>
                <p className="text-slate-500 text-sm">From Delhi and Lucknow • March 2026</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white z-10 shadow-sm">
                  <tr className="border-b border-slate-200">
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider">Specialty</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider">Consultant</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider">Visiting Date</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider text-center">Book Appointment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scheduleData.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-6 align-top">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                            {item.icon}
                          </div>
                          <span className="font-bold text-slate-900 text-sm leading-tight max-w-[150px]">
                            {item.specialty}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6 align-top">
                        <div className="space-y-4">
                          {item.consultants.map((doc, i) => (
                            <div key={i}>
                              <div className="font-bold text-slate-900 text-sm">{doc.name}</div>
                              <div className="text-xs text-slate-500 font-medium">{doc.degree}</div>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-6 align-top">
                        <span className="text-sm font-bold text-slate-700">{item.dates}</span>
                      </td>
                      <td className="px-6 py-6 align-top text-center">
                        <button className="bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-600 px-4 py-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center mx-auto min-w-[140px]">
                          <span>Book Appointment</span>
                          <span className="text-[10px] opacity-70 font-medium">At Betiahata Branch</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-center gap-8 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-indigo-600" />
                <span>Betiahata Branch, Lucknow</span>
              </div>
              <div className="flex items-center gap-2">
                <User size={14} className="text-indigo-600" />
                <span>24/7 Support Available</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
