import React, { useState, useEffect } from 'react';
import { ChatWidget } from './components/ChatWidget';
import { AdminPanel } from './components/AdminPanel';
import { ServicesBar } from './components/ServicesBar';
import { OPDScheduleModal } from './components/OPDScheduleModal';
import { BookingForm } from './components/BookingForm';
import { Activity, Heart, Shield, Clock, MapPin, Phone, Mail, ChevronRight, Star, Users, Stethoscope, Search, ArrowRight, Lock, User, X, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [doctors, setDoctors] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [backendError, setBackendError] = useState(false);
  const [showOPDSchedule, setShowOPDSchedule] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState({ name: '', specialty: '' });
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fallbackDoctors = [
      { id: 1, name: "Dr. Sameer Sharma", specialization: "Senior Cardiologist", department: "Cardiology", availability: "Mon-Fri, 10:00 AM - 4:00 PM" },
      { id: 2, name: "Dr. Ananya Iyer", specialization: "Orthopedic Surgeon", department: "Orthopedic", availability: "Tue-Sat, 11:00 AM - 5:00 PM" },
      { id: 3, name: "Dr. Rahul Verma", specialization: "ENT Specialist", department: "ENT", availability: "Mon-Thu, 9:00 AM - 1:00 PM" }
    ];

    const fallbackServices = [
      { id: 1, name: "General Consultation", description: "Standard checkup with a general physician.", price: 500 },
      { id: 2, name: "Cardiology Screening", description: "Comprehensive heart health assessment including ECG.", price: 2500 },
      { id: 3, name: "X-Ray (Chest)", description: "High-resolution digital X-ray imaging.", price: 800 }
    ];

    fetch('/api/doctors')
      .then(res => res.json())
      .then(data => setDoctors(Array.isArray(data) ? data : fallbackDoctors))
      .catch(err => {
        console.error("Failed to fetch doctors:", err);
        setDoctors(fallbackDoctors);
        setBackendError(true);
      });
      
    fetch('/api/services')
      .then(res => res.json())
      .then(data => setServices(Array.isArray(data) ? data : fallbackServices))
      .catch(err => {
        console.error("Failed to fetch services:", err);
        setServices(fallbackServices);
        setBackendError(true);
      });
      
    fetch('/api/hospital/departments')
      .then(res => res.json())
      .then(data => setDepartments(Array.isArray(data) ? data : ['Cardiology', 'Orthopedic', 'ENT', 'General Medicine']))
      .catch(err => {
        console.error("Failed to fetch departments:", err);
        setDepartments(['Cardiology', 'Orthopedic', 'ENT', 'General Medicine']);
        setBackendError(true);
      });
  }, []);

  const filteredDoctors = doctors.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBookClick = (name: string, specialty: string) => {
    setSelectedDoctor({ name, specialty });
    setShowBookingForm(true);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginId === 'admin' && loginPassword === '12345') {
      setIsAdmin(true);
      setShowLogin(false);
      setLoginError('');
      setLoginId('');
      setLoginPassword('');
    } else {
      setLoginError('Invalid credentials');
    }
  };

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-slate-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                <Activity size={24} />
              </div>
              <span className="text-xl font-bold tracking-tight text-indigo-900">MedAssist Admin</span>
            </div>
            <button 
              onClick={() => setIsAdmin(false)}
              className="bg-white border border-slate-200 text-slate-700 px-6 py-2 rounded-xl font-semibold hover:bg-slate-50 transition-all"
            >
              Back to Website
            </button>
          </div>
          <AdminPanel />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {backendError && (
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 text-center">
          <p className="text-xs font-medium text-amber-700 flex items-center justify-center gap-2">
            <Shield size={14} />
            Backend connection unavailable. Running in Demo Mode with local data.
          </p>
        </div>
      )}
      {/* Navigation */}
      <nav className="border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
              <Activity size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-indigo-900">MedAssist</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <button onClick={() => scrollToSection('doctors')} className="hover:text-indigo-600 transition-colors">Find a Doctor</button>
            <button onClick={() => scrollToSection('departments')} className="hover:text-indigo-600 transition-colors">Departments</button>
            <button onClick={() => scrollToSection('services')} className="hover:text-indigo-600 transition-colors">Services</button>
            <button onClick={() => setShowLogin(true)} className="hover:text-indigo-600 transition-colors">Admin Panel</button>
          </div>
          <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
            Patient Portal
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-6">
                <Star size={14} className="fill-current" />
                Trusted Healthcare Excellence
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 leading-[1.1] mb-8">
                Your Health, Our <span className="text-indigo-600">Priority</span>.
              </h1>
              <p className="text-lg text-slate-600 mb-10 max-w-lg leading-relaxed">
                Experience world-class medical care with state-of-the-art technology and compassionate experts. We're here for you 24/7.
              </p>
              <div className="flex flex-wrap gap-4">
                <button onClick={() => scrollToSection('doctors')} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-2">
                  Book Appointment <ChevronRight size={20} />
                </button>
                <button onClick={() => scrollToSection('services')} className="bg-white border-2 border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-bold hover:border-indigo-600 hover:text-indigo-600 transition-all">
                  Our Services
                </button>
                <button 
                  onClick={() => setShowOPDSchedule(true)}
                  className="bg-emerald-50 border-2 border-emerald-200 text-emerald-700 px-8 py-4 rounded-2xl font-bold hover:border-emerald-600 hover:bg-emerald-100 transition-all flex items-center gap-2"
                >
                  <Calendar size={20} /> View OPD Schedule
                </button>
              </div>
              <div className="mt-12 flex items-center gap-8">
                <div>
                  <div className="text-3xl font-bold text-slate-900">{doctors.length}+</div>
                  <div className="text-sm text-slate-500">Expert Doctors</div>
                </div>
                <div className="w-px h-10 bg-slate-200"></div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">24/7</div>
                  <div className="text-sm text-slate-500">Emergency Care</div>
                </div>
                <div className="w-px h-10 bg-slate-200"></div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">15k+</div>
                  <div className="text-sm text-slate-500">Happy Patients</div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1000" 
                  alt="Modern Hospital"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl border border-slate-100 max-w-xs">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                    <Shield size={24} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">100% Secure</div>
                    <div className="text-xs text-slate-500">Patient Data Privacy</div>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  We use advanced encryption to ensure your medical records are always safe and accessible only to you.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Services Bar */}
      <section className="relative z-10 -mt-12 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] overflow-hidden shadow-2xl border border-white/20">
            <ServicesBar onServiceClick={(service) => handleBookClick('General Consultant', service)} />
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section id="departments" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Departments</h2>
            <p className="text-slate-600 text-lg">Specialized care across multiple disciplines to ensure comprehensive health management.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {departments.map((dept) => (
              <motion.div
                key={dept}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-center group"
              >
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  {dept === 'Cardiology' ? <Heart size={32} /> : 
                   dept === 'Orthopedic' ? <Users size={32} /> : 
                   dept === 'ENT' ? <Activity size={32} /> : <Stethoscope size={32} />}
                </div>
                <h3 className="font-bold text-slate-900">{dept}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Find a Doctor Section */}
      <section id="doctors" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Find Your Specialist</h2>
              <p className="text-slate-600 text-lg">Search through our directory of world-class medical professionals.</p>
            </div>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Search by name or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {filteredDoctors.map((doc) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all"
              >
                <div className="h-48 bg-slate-100 relative overflow-hidden">
                  <img 
                    src={`https://picsum.photos/seed/${doc.name}/400/300`} 
                    alt={doc.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-indigo-600">
                    {doc.department}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{doc.name}</h3>
                  <p className="text-indigo-600 text-sm font-medium mb-4">{doc.specialization}</p>
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-6">
                    <Clock size={14} />
                    <span>{doc.availability}</span>
                  </div>
                  <button 
                    onClick={() => handleBookClick(doc.name, doc.specialization)}
                    className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 group"
                  >
                    Book Appointment <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-bold mb-4">Medical Services</h2>
            <p className="text-slate-400 text-lg">Transparent pricing for premium healthcare services.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {services.map((service) => (
              <div key={service.id} className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700 hover:border-indigo-500 transition-all">
                <div className="text-indigo-400 font-bold text-2xl mb-2">₹{service.price}</div>
                <h3 className="text-xl font-bold mb-4">{service.name}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">{service.description}</p>
                <button className="text-indigo-400 text-sm font-bold flex items-center gap-2 hover:text-indigo-300 transition-colors">
                  Learn More <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                  <Activity size={24} />
                </div>
                <span className="text-xl font-bold tracking-tight">MedAssist</span>
              </div>
              <p className="text-slate-400 max-w-sm leading-relaxed mb-8">
                Leading the way in medical excellence. Providing compassionate care and innovative treatments to our community.
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 transition-colors cursor-pointer">
                  <Phone size={18} />
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 transition-colors cursor-pointer">
                  <Mail size={18} />
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 transition-colors cursor-pointer">
                  <MapPin size={18} />
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-6">Quick Links</h4>
              <ul className="space-y-4 text-slate-400 text-sm">
                <li><button onClick={() => scrollToSection('doctors')} className="hover:text-white transition-colors">Find a Doctor</button></li>
                <li><button onClick={() => scrollToSection('doctors')} className="hover:text-white transition-colors">Book Appointment</button></li>
                <li><button onClick={() => scrollToSection('services')} className="hover:text-white transition-colors">Health Packages</button></li>
                <li><button onClick={() => setIsAdmin(true)} className="hover:text-white transition-colors">Admin Portal</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Contact Us</h4>
              <ul className="space-y-4 text-slate-400 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="text-indigo-500 shrink-0" />
                  <span>123 Medical Drive, Aliganj, Lucknow, UP 226024</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-indigo-500 shrink-0" />
                  <span>+91 522 1234 567</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-indigo-500 shrink-0" />
                  <span>contact@medassist.com</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-20 pt-8 border-t border-slate-800 text-center space-y-4">
            <p className="text-slate-500 text-xs">
              © 2026 MedAssist Super Speciality Hospital. All rights reserved.
            </p>
            <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-indigo-400">
                Application is made by <span className="text-white">Digital Communique</span>
              </p>
            </div>
          </div>
        </div>
      </footer>

      <ChatWidget />

      {/* Floating Appointment Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-40 max-w-sm w-full"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-indigo-100 p-5 flex items-start gap-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600" />
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                <Calendar size={24} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-slate-900 text-sm">Book Your Appointment</h4>
                  <button 
                    onClick={() => setShowNotification(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                  Our super-specialist doctors from Delhi and Lucknow are visiting soon. Secure your slot now!
                </p>
                <button 
                  onClick={() => {
                    setShowOPDSchedule(true);
                    setShowNotification(false);
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
                >
                  View Schedule <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <OPDScheduleModal 
        isOpen={showOPDSchedule} 
        onClose={() => setShowOPDSchedule(false)} 
        onBook={(name, specialty) => {
          setShowOPDSchedule(false);
          handleBookClick(name, specialty);
        }}
      />

      <BookingForm 
        isOpen={showBookingForm}
        onClose={() => setShowBookingForm(false)}
        doctorName={selectedDoctor.name}
        specialty={selectedDoctor.specialty}
      />

      {/* Admin Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogin(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                      <Lock size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Admin Access</h2>
                  </div>
                  <button 
                    onClick={() => setShowLogin(false)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X size={20} className="text-slate-400" />
                  </button>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Admin ID</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                        placeholder="Enter admin ID"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {loginError && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm font-medium text-center"
                    >
                      {loginError}
                    </motion.p>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                  >
                    Login to Dashboard
                  </button>
                </form>
              </div>
              <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Authorized access only. All activities are monitored.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
