import React, { useState, useEffect } from 'react';
import { Users, Stethoscope, Activity, Calendar, FileText, Plus, Save, X, Loader2, LayoutDashboard, Shield, MessageSquare, BookOpen, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';
import { ChatDashboard } from './admin/ChatDashboard';
import { KnowledgeBase } from './admin/KnowledgeBase';
import { ChatAnalytics } from './admin/ChatAnalytics';

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  department: string;
  availability: string;
}

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
}

interface Appointment {
  id: number;
  patient_name: string;
  doctor_name: string;
  date: string;
  time: string;
  status: string;
  token_no: string;
}

interface Report {
  id: string;
  patient_name: string;
  test_name: string;
  status: string;
}

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'doctors' | 'services' | 'appointments' | 'reports' | 'chats' | 'kb' | 'analytics'>('dashboard');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [newDoctor, setNewDoctor] = useState({ name: '', specialization: '', department_id: 1, availability: '' });

  const [showAddService, setShowAddService] = useState(false);
  const [newService, setNewService] = useState({ name: '', description: '', price: 0 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [docsRes, servRes, apptRes, reptRes] = await Promise.all([
        fetch('/api/doctors'),
        fetch('/api/services'),
        fetch('/api/admin/appointments'),
        fetch('/api/admin/reports')
      ]);
      setDoctors(await docsRes.json());
      setServices(await servRes.json());
      setAppointments(await apptRes.json());
      setReports(await reptRes.json());
    } catch (error) {
      console.error('Failed to fetch admin data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDoctor)
      });
      setShowAddDoctor(false);
      fetchData();
    } catch (error) {
      alert('Failed to add doctor');
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService)
      });
      setShowAddService(false);
      fetchData();
    } catch (error) {
      alert('Failed to add service');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden min-h-[600px] flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-slate-900 text-white p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Shield size={24} />
          </div>
          <span className="text-xl font-bold">Admin Hub</span>
        </div>
        <nav className="space-y-2">
          {[
            { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
            { id: 'doctors', icon: <Stethoscope size={20} />, label: 'Doctors' },
            { id: 'services', icon: <Activity size={20} />, label: 'Services' },
            { id: 'appointments', icon: <Calendar size={20} />, label: 'Appointments' },
            { id: 'reports', icon: <FileText size={20} />, label: 'Reports' },
            { id: 'chats', icon: <MessageSquare size={20} />, label: 'Chat Dashboard' },
            { id: 'kb', icon: <BookOpen size={20} />, label: 'Knowledge Base' },
            { id: 'analytics', icon: <BarChart3 size={20} />, label: 'Chat Analytics' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 bg-slate-50 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 capitalize">{activeTab} Management</h2>
          {activeTab === 'doctors' && (
            <button 
              onClick={() => setShowAddDoctor(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-all"
            >
              <Plus size={20} /> Add Doctor
            </button>
          )}
          {activeTab === 'services' && (
            <button 
              onClick={() => setShowAddService(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-all"
            >
              <Plus size={20} /> Add Service
            </button>
          )}
        </div>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Doctors', value: doctors.length, icon: <Stethoscope className="text-indigo-600" />, bg: 'bg-indigo-50' },
              { label: 'Active Services', value: services.length, icon: <Activity className="text-emerald-600" />, bg: 'bg-emerald-50' },
              { label: 'Appointments', value: appointments.length, icon: <Calendar className="text-amber-600" />, bg: 'bg-amber-50' },
              { label: 'Lab Reports', value: reports.length, icon: <FileText className="text-rose-600" />, bg: 'bg-rose-50' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center mb-4`}>
                  {stat.icon}
                </div>
                <div className="text-slate-500 text-sm font-medium">{stat.label}</div>
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'doctors' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">Name</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">Specialization</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">Department</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">Availability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {doctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{doc.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{doc.specialization}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{doc.department}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{doc.availability}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service) => (
              <div key={service.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg text-slate-900">{service.name}</h3>
                  <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-sm font-bold">
                    ₹{service.price}
                  </span>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">Patient</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">Doctor</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">Date/Time</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">Token</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{appt.patient_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{appt.doctor_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{appt.date} at {appt.time}</td>
                    <td className="px-6 py-4 text-sm font-bold text-indigo-600">{appt.token_no}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">Patient</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">Test Name</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{report.patient_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{report.test_name}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        report.status === 'Ready' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'chats' && <ChatDashboard />}
        {activeTab === 'kb' && <KnowledgeBase />}
        {activeTab === 'analytics' && <ChatAnalytics />}
      </div>

      {/* Modals */}
      {showAddDoctor && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Add New Doctor</h3>
              <button onClick={() => setShowAddDoctor(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddDoctor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input required type="text" value={newDoctor.name} onChange={e => setNewDoctor({...newDoctor, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Specialization</label>
                <input required type="text" value={newDoctor.specialization} onChange={e => setNewDoctor({...newDoctor, specialization: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Department ID (1-4)</label>
                <input required type="number" min="1" max="4" value={newDoctor.department_id} onChange={e => setNewDoctor({...newDoctor, department_id: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Availability</label>
                <input required type="text" placeholder="e.g. 10 AM - 2 PM" value={newDoctor.availability} onChange={e => setNewDoctor({...newDoctor, availability: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                <Save size={20} /> Save Doctor
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {showAddService && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Add New Service</h3>
              <button onClick={() => setShowAddService(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddService} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Service Name</label>
                <input required type="text" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea required value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500 h-24" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
                <input required type="number" value={newService.price} onChange={e => setNewService({...newService, price: parseFloat(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                <Save size={20} /> Save Service
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
