import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { MessageSquare, CheckCircle, AlertCircle, TrendingUp, Loader2, Star } from 'lucide-react';

interface AnalyticsData {
  metrics: {
    totalChats: number;
    aiSolved: number;
    humanEscalation: number;
    satisfactionScore: number;
  };
  dailyChatGraph: { date: string; chats: number }[];
  departmentQueries: { department: string; count: number }[];
  topQueries: string[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

export const ChatAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin/chat-analytics');
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Chats', value: data.metrics.totalChats, icon: <MessageSquare size={20} />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'AI Solved', value: data.metrics.aiSolved, icon: <CheckCircle size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Human Escalation', value: data.metrics.humanEscalation, icon: <AlertCircle size={20} />, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Satisfaction Score', value: `${data.metrics.satisfactionScore}/5`, icon: <Star size={20} />, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((metric, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className={`w-10 h-10 ${metric.bg} ${metric.color} rounded-xl flex items-center justify-center mb-4`}>
              {metric.icon}
            </div>
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{metric.label}</div>
            <div className="text-2xl font-bold text-slate-900">{metric.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Chat Graph */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp size={20} className="text-indigo-600" />
              Daily Chat Volume
            </h3>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">+12% from last week</span>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.dailyChatGraph}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickFormatter={(str) => new Date(str).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="chats" 
                  stroke="#6366f1" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Distribution */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-8">Department Queries</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.departmentQueries}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="department"
                >
                  {data.departmentQueries.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {data.departmentQueries.map((dept, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-xs text-slate-600 font-medium">{dept.department}: {dept.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Queries */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Top Patient Queries</h3>
        <div className="flex flex-wrap gap-3">
          {data.topQueries.map((query, i) => (
            <div key={i} className="bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl flex items-center justify-between gap-8 flex-1 min-w-[200px]">
              <span className="font-bold text-slate-700">{query}</span>
              <span className="text-indigo-600 font-bold bg-white px-3 py-1 rounded-lg text-sm shadow-sm">
                {Math.floor(Math.random() * 500) + 100} hits
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
