import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { expenseService } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Plus, LogOut, Trash2, Filter, DollarSign, Wallet, Calendar, PieChart as PieChartIcon } from 'lucide-react';

const CATEGORIES = ['Food', 'Travel', 'Bills', 'Shopping', 'Others'];
const CATEGORY_COLORS = {
  'Food': '#ec4899', // pink
  'Travel': '#3b82f6', // blue
  'Bills': '#ef4444', // red
  'Shopping': '#8b5cf6', // purple
  'Others': '#64748b'  // slate
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // Filter state
  const [filter, setFilter] = useState('All');
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', amount: '', category: 'Food' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      navigate('/');
    } else {
      setUser(userData ? JSON.parse(userData) : null);
      fetchExpenses();
    }
  }, [navigate, filter]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await expenseService.getAll(filter);
      setExpenses(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await expenseService.create({
        ...formData,
        amount: Number(formData.amount)
      });
      setFormData({ title: '', amount: '', category: 'Food' });
      setShowForm(false);
      fetchExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await expenseService.delete(id);
      setExpenses(expenses.filter(exp => exp._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate totals
  const totalAmount = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  
  // Chart data
  const chartData = useMemo(() => {
    const data = CATEGORIES.map(cat => ({
      name: cat,
      amount: expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0)
    }));
    return data.filter(d => d.amount > 0);
  }, [expenses]);

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* Header */}
      <header className="bg-surface shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 w-10 h-10 rounded-xl flex items-center justify-center text-primary">
              <Wallet size={24} />
            </div>
            <h1 className="text-xl font-bold text-text hidden sm:block">ExpenseTracker</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium text-textLight">
              Hello, <span className="text-text font-semibold">{user?.name}</span>
            </span>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-textLight hover:text-red-500 transition-colors text-sm font-medium"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-primary to-indigo-600 text-white border-0 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <DollarSign size={80} />
            </div>
            <div className="relative z-10">
              <p className="text-indigo-100 font-medium mb-1">Total Expenses</p>
              <h2 className="text-4xl font-bold">${totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h2>
            </div>
          </div>
          
          <div className="card col-span-1 md:col-span-2 flex flex-col justify-center">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-text flex items-center gap-2">
                <PieChartIcon size={18} className="text-primary" />
                Expenses by Category
              </h3>
            </div>
            <div className="h-24">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" hide />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                      formatter={(value) => [`$${value}`, 'Amount']}
                    />
                    <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={12}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-textLight text-sm">
                  No data to display
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Expenses List */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold text-text">Recent Transactions</h2>
              
              <div className="flex gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textLight">
                    <Filter size={16} />
                  </div>
                  <select 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="input-field pl-9 py-2 appearance-none w-full sm:w-40 bg-white"
                  >
                    <option value="All">All Categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                
                <button 
                  onClick={() => setShowForm(!showForm)}
                  className="btn-primary py-2 px-4 flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Plus size={18} />
                  <span className="hidden sm:inline">{showForm ? 'Cancel' : 'Add Expense'}</span>
                </button>
              </div>
            </div>

            {/* Add Form Inline */}
            {showForm && (
              <div className="card mb-6 animate-in slide-in-from-top-4 fade-in duration-300 bg-indigo-50/50 border-indigo-100">
                <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Title</label>
                    <input 
                      type="text" 
                      required 
                      className="input-field py-2" 
                      placeholder="e.g. Groceries"
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Amount</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textLight">
                        $
                      </div>
                      <input 
                        type="number" 
                        required 
                        min="0"
                        step="0.01"
                        className="input-field pl-7 py-2" 
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={e => setFormData({...formData, amount: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Category</label>
                    <select 
                      className="input-field py-2 appearance-none"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <button type="submit" className="btn-primary py-2">
                    Save
                  </button>
                </form>
              </div>
            )}

            {/* List */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : expenses.length === 0 ? (
              <div className="card text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <Wallet size={32} />
                </div>
                <h3 className="text-lg font-medium text-text mb-1">No expenses found</h3>
                <p className="text-textLight">
                  {filter !== 'All' ? `You have no expenses in the ${filter} category.` : 'Start adding your expenses to see them here.'}
                </p>
                {!showForm && filter === 'All' && (
                  <button onClick={() => setShowForm(true)} className="text-primary font-medium mt-4 hover:underline">
                    Add your first expense
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {expenses.map((expense) => (
                  <div key={expense._id} className="card p-4 hover:shadow-md transition-shadow group flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                        style={{ backgroundColor: CATEGORY_COLORS[expense.category] }}
                      >
                        {expense.category.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-text">{expense.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-textLight mt-1">
                          <span className="px-2 py-0.5 bg-gray-100 rounded-full font-medium">
                            {expense.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(expense.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-lg text-text">
                        ${expense.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </span>
                      <button 
                        onClick={() => handleDelete(expense._id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete expense"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
