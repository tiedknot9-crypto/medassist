import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, Save, X, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface KBItem {
  id: number;
  question: string;
  keywords: string;
  answer: string;
  department_id: number;
  department_name: string;
}

export const KnowledgeBase: React.FC = () => {
  const [items, setItems] = useState<KBItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<KBItem | null>(null);
  const [newItem, setNewItem] = useState({
    question: '',
    keywords: '',
    answer: '',
    department_id: 1
  });

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/admin/kb');
      const data = await res.json();
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch KB', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await fetch(`/api/admin/kb/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItem)
        });
      } else {
        await fetch('/api/admin/kb', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItem)
        });
      }
      setShowAddModal(false);
      setEditingItem(null);
      setNewItem({ question: '', keywords: '', answer: '', department_id: 1 });
      fetchItems();
    } catch (error) {
      alert('Failed to save knowledge base item');
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await fetch(`/api/admin/kb/${id}`, { method: 'DELETE' });
      fetchItems();
    } catch (error) {
      alert('Failed to delete item');
    }
  };

  const openEditModal = (item: KBItem) => {
    setEditingItem(item);
    setNewItem({
      question: item.question,
      keywords: item.keywords,
      answer: item.answer,
      department_id: item.department_id
    });
    setShowAddModal(true);
  };

  const filteredItems = items.filter(item => 
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.keywords.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search knowledge base..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
          />
        </div>
        <button 
          onClick={() => {
            setEditingItem(null);
            setNewItem({ question: '', keywords: '', answer: '', department_id: 1 });
            setShowAddModal(true);
          }}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
        >
          <Plus size={20} /> Add Training Data
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredItems.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center">
            <BookOpen className="mx-auto text-slate-300 mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-900 mb-1">No items found</h3>
            <p className="text-slate-500 text-sm">Try adjusting your search or add new training data.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                    <BookOpen size={16} />
                  </div>
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded">
                    {item.department_name}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => openEditModal(item)}
                    className="text-slate-400 hover:text-indigo-600 transition-colors"
                    title="Edit item"
                  >
                    <Save size={18} />
                  </button>
                  <button 
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors"
                    title="Delete item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{item.question}</h3>
              <p className="text-slate-600 text-sm mb-4 leading-relaxed">{item.answer}</p>
              <div className="flex flex-wrap gap-2">
                {item.keywords && item.keywords.split(',').map((kw, i) => (
                  <span key={i} className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                    #{kw.trim()}
                  </span>
                ))}
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">
                  {editingItem ? 'Edit AI Training Data' : 'Add AI Training Data'}
                </h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>
              <form onSubmit={handleAddItem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Patient Question</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="e.g. What are OPD charges?"
                    value={newItem.question} 
                    onChange={e => setNewItem({...newItem, question: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Search Keywords (comma separated)</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="e.g. opd, charges, fees, cost"
                    value={newItem.keywords} 
                    onChange={e => setNewItem({...newItem, keywords: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">AI Answer</label>
                  <textarea 
                    required 
                    placeholder="Provide a clear and helpful response..."
                    value={newItem.answer} 
                    onChange={e => setNewItem({...newItem, answer: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm h-32" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                  <select 
                    value={newItem.department_id} 
                    onChange={e => setNewItem({...newItem, department_id: parseInt(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value={1}>Cardiology</option>
                    <option value={2}>Orthopedic</option>
                    <option value={3}>ENT</option>
                    <option value={4}>General Medicine</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100">
                  <Save size={20} /> Save Training Data
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
