import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// ─── Workspace inference from uploaded doc / connection ───────────────────────
export function inferWorkspace(files, connectionString) {
  const name = (files?.[0]?.name || connectionString || '').toLowerCase();

  if (/hospital|patient|doctor|medical|clinic|health/.test(name)) {
    return {
      domain: 'Hospital Management',
      collections: [
        { name: 'patients',     docs: '48,291',  size: '2.1 GB', icon: '🏥', color: '#00f5ff' },
        { name: 'doctors',      docs: '1,842',   size: '24 MB',  icon: '👨‍⚕️', color: '#4d9eff' },
        { name: 'appointments', docs: '284,711', size: '1.8 GB', icon: '📅', color: '#a855f7' },
        { name: 'medicines',    docs: '12,400',  size: '312 MB', icon: '💊', color: '#22c55e' },
        { name: 'billing',      docs: '892,341', size: '4.2 GB', icon: '💰', color: '#f59e0b' },
      ],
      charts: ['Patients by Department','Monthly Appointments','Revenue Trend','Top Doctors'],
      suggestions: [
        'Find patients above 60 years of age',
        'Average treatment cost by department',
        'Most prescribed medicines this month',
        'Doctors with highest patient count',
        'Monthly admission trend for 2025',
      ],
      fields: { patients: ['_id','name','age','dept','doctor','status','admittedAt'], doctors: ['_id','name','specialization','patients','rating'], appointments: ['_id','patientId','doctorId','date','status'], medicines: ['_id','name','dosage','price','stock'] },
    };
  }

  if (/ecommerce|shop|store|product|order|customer|retail|commerce/.test(name)) {
    return {
      domain: 'E-Commerce',
      collections: [
        { name: 'orders',    docs: '892,341', size: '6.8 GB', icon: '📦', color: '#00f5ff' },
        { name: 'products',  docs: '48,291',  size: '890 MB', icon: '🛍️', color: '#4d9eff' },
        { name: 'customers', docs: '284,711', size: '2.1 GB', icon: '👥', color: '#a855f7' },
        { name: 'payments',  docs: '892,341', size: '3.2 GB', icon: '💳', color: '#22c55e' },
        { name: 'reviews',   docs: '128,472', size: '512 MB', icon: '⭐', color: '#f59e0b' },
      ],
      charts: ['Revenue by Month','Orders by Category','Customer Segments','Top Products'],
      suggestions: [
        'Top 10 selling products this month',
        'Revenue breakdown by category',
        'Customers with orders above ₹10,000',
        'Products with stock below 10 units',
        'Average order value by region',
      ],
      fields: { orders: ['_id','customerId','total','status','region','createdAt'], products: ['_id','name','price','stock','category'], customers: ['_id','name','email','city','totalSpend'], payments: ['_id','orderId','amount','method','status'] },
    };
  }

  if (/college|university|student|faculty|course|department|academic/.test(name)) {
    return {
      domain: 'College Management',
      collections: [
        { name: 'students',    docs: '12,400', size: '180 MB', icon: '🎓', color: '#00f5ff' },
        { name: 'faculty',     docs: '842',    size: '12 MB',  icon: '👨‍🏫', color: '#4d9eff' },
        { name: 'courses',     docs: '1,240',  size: '48 MB',  icon: '📚', color: '#a855f7' },
        { name: 'departments', docs: '24',     size: '4 MB',   icon: '🏛️', color: '#22c55e' },
        { name: 'attendance',  docs: '892,341',size: '2.8 GB', icon: '✅', color: '#f59e0b' },
      ],
      charts: ['Students per Department','CGPA Distribution','Attendance Trend','Placement Stats'],
      suggestions: [
        'Students with CGPA above 9.0',
        'Department-wise student strength',
        'Faculty with highest course ratings',
        'Attendance below 75% this semester',
        'Placement statistics by branch',
      ],
      fields: { students: ['_id','name','dept','cgpa','year','email','status'], faculty: ['_id','name','dept','courses','experience'], courses: ['_id','name','credits','faculty','dept'], attendance: ['_id','studentId','date','status','subject'] },
    };
  }

  // Default — generic (employees)
  return {
    domain: 'Employee Management',
    collections: [
      { name: 'employees',   docs: '10,000',  size: '890 MB', icon: '👤', color: '#00f5ff' },
      { name: 'departments', docs: '50',      size: '4 MB',   icon: '🏢', color: '#4d9eff' },
      { name: 'projects',    docs: '200',     size: '48 MB',  icon: '📋', color: '#a855f7' },
      { name: 'salaries',    docs: '120,000', size: '1.2 GB', icon: '💰', color: '#22c55e' },
    ],
    charts: ['Employees by Department','Salary Distribution','Project Assignments','Hiring Trend'],
    suggestions: [
      'Show employees with salary above 50000',
      'Count employees in Engineering department',
      'Average salary by department',
      'Top 10 highest paid employees',
      'Employees hired this year',
    ],
    fields: { employees: ['_id','name','email','dept','salary','location','status','createdAt'], departments: ['_id','name','managerId','budget','headcount'], projects: ['_id','title','assignees','status','deadline'], salaries: ['_id','employeeId','amount','period'] },
  };
}

// ── Auth Provider ─────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [workspace, setWorkspace] = useState(null);  // global dynamic context

  useEffect(() => {
    const stored = sessionStorage.getItem('mqai_user');
    if (stored) setUser(JSON.parse(stored));
    const ws = sessionStorage.getItem('mqai_workspace');
    if (ws) setWorkspace(JSON.parse(ws));
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const userData = {
      id: 'usr_' + Math.random().toString(36).slice(2, 9),
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      email, plan: 'Pro', avatar: email[0].toUpperCase(),
      apiKey: 'mqai_' + Math.random().toString(36).slice(2, 18),
      createdAt: new Date().toISOString(),
      queriesUsed: 1247, queriesLimit: 10000,
      connected: 'cluster0.mongodb.net', setupDone: false,
    };
    setUser(userData);
    sessionStorage.setItem('mqai_user', JSON.stringify(userData));
    return userData;
  };

  const signup = (name, email, password) => {
    const userData = {
      id: 'usr_' + Math.random().toString(36).slice(2, 9),
      name, email, plan: 'Starter', avatar: name[0].toUpperCase(),
      apiKey: 'mqai_' + Math.random().toString(36).slice(2, 18),
      createdAt: new Date().toISOString(),
      queriesUsed: 0, queriesLimit: 500,
      connected: null, setupDone: false,
    };
    setUser(userData);
    sessionStorage.setItem('mqai_user', JSON.stringify(userData));
    return userData;
  };

  const saveSetupData = ({ files, connectionString }) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev, setupDone: true,
        connected: connectionString || prev.connected || null,
        uploadedFiles: files.map(f => ({ name: f.name, size: f.size, type: f.type })),
      };
      sessionStorage.setItem('mqai_user', JSON.stringify(updated));
      return updated;
    });
    // Infer and store workspace
    const ws = inferWorkspace(files, connectionString);
    setWorkspace(ws);
    sessionStorage.setItem('mqai_workspace', JSON.stringify(ws));
  };

  const logout = () => {
    setUser(null);
    setWorkspace(null);
    sessionStorage.removeItem('mqai_user');
    sessionStorage.removeItem('mqai_workspace');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, saveSetupData, workspace }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// ─── Mock Data ────────────────────────────────────────────────────────────────
export const MOCK_STATS = [
  { id: 'queries',     label: 'Total Queries', value: 48291,   prev: 41230,   icon: 'Zap',          color: '#00f5ff', suffix: '' },
  { id: 'collections', label: 'Collections',   value: 24,      prev: 20,      icon: 'Layers',       color: '#4d9eff', suffix: '' },
  { id: 'documents',   label: 'Documents',     value: 2847391, prev: 2600000, icon: 'FileText',     color: '#a855f7', suffix: '' },
  { id: 'response',    label: 'Avg Response',  value: 42,      prev: 58,      icon: 'Timer',        color: '#22c55e', suffix: 'ms' },
  { id: 'success',     label: 'Success Rate',  value: 99.2,    prev: 98.1,    icon: 'CheckCircle2', color: '#f59e0b', suffix: '%' },
  { id: 'accuracy',    label: 'AI Accuracy',   value: 97.8,    prev: 95.2,    icon: 'Brain',        color: '#ec4899', suffix: '%' },
];

export const MOCK_QUERIES = [
  { id: 1, nl: 'Find all users created this month',       query: "db.users.find({ createdAt: { $gte: ISODate('2025-05-01') } })", status: 'success', time: 38,  docs: 142, ts: '2 min ago'  },
  { id: 2, nl: 'Show products with low stock',            query: "db.products.find({ stock: { $lt: 10 } })",                       status: 'success', time: 21,  docs: 18,  ts: '5 min ago'  },
  { id: 3, nl: 'Aggregate revenue by region',             query: "db.orders.aggregate([{ $group: { _id: '$region', total: { $sum: '$amount' } } }])", status: 'success', time: 67, docs: 8, ts: '12 min ago' },
  { id: 4, nl: 'Get top 10 customers by spend',           query: "db.orders.aggregate([{ $group: { _id: '$userId', spend: { $sum: '$total' } } }, { $sort: { spend: -1 } }, { $limit: 10 }])", status: 'warning', time: 124, docs: 10, ts: '18 min ago' },
  { id: 5, nl: 'Find failed login attempts today',        query: "db.logs.find({ type: 'login_failed', createdAt: { $gte: ISODate('2025-05-29') } })", status: 'success', time: 45, docs: 34, ts: '25 min ago' },
  { id: 6, nl: 'Count documents per collection',          query: "db.getCollectionNames().map(c => ({ col: c, count: db[c].countDocuments() }))", status: 'error', time: 0, docs: 0, ts: '31 min ago' },
  { id: 7, nl: 'Find orders above \u20b91000',           query: "db.orders.find({ total: { $gt: 1000 } }).sort({ total: -1 })", status: 'success', time: 29, docs: 891, ts: '42 min ago' },
];

export const MOCK_DOCUMENTS = [
  { _id: '507f1f77bcf86cd799439011', name: 'Arjun Mehta',      dept: 'Engineering', salary: 95000,  status: 'active',   joined: '2023-03-15' },
  { _id: '507f1f77bcf86cd799439012', name: 'Sarah Chen',       dept: 'Engineering', salary: 88000,  status: 'active',   joined: '2022-11-20' },
  { _id: '507f1f77bcf86cd799439013', name: 'Marcus Williams',  dept: 'Engineering', salary: 72000,  status: 'active',   joined: '2024-01-08' },
  { _id: '507f1f77bcf86cd799439014', name: 'Priya Nair',       dept: 'Engineering', salary: 115000, status: 'active',   joined: '2021-06-30' },
  { _id: '507f1f77bcf86cd799439015', name: 'Daniel Park',      dept: 'Engineering', salary: 67000,  status: 'inactive', joined: '2023-09-12' },
  { _id: '507f1f77bcf86cd799439016', name: 'Leila Hassan',     dept: 'Engineering', salary: 103000, status: 'active',   joined: '2022-04-05' },
  { _id: '507f1f77bcf86cd799439017', name: "James O'Brien",    dept: 'Engineering', salary: 79000,  status: 'active',   joined: '2023-07-22' },
];

export const MOCK_LOGS = [
  { id: 1,  level: 'info',    msg: 'Connected to cluster0.mongodb.net',                                         ts: '09:41:02' },
  { id: 2,  level: 'success', msg: 'Query executed: db.employees.find({dept:"Engineering"}) → 7 docs in 42ms', ts: '09:41:05' },
  { id: 3,  level: 'info',    msg: 'AI model: claude-sonnet-4-6 · Confidence: 97.8%',                          ts: '09:41:05' },
  { id: 4,  level: 'success', msg: 'Index hint applied: dept_1_salary_1',                                       ts: '09:41:05' },
  { id: 5,  level: 'warning', msg: 'Query scan: 1842 documents examined (consider adding index)',                ts: '09:38:21' },
  { id: 6,  level: 'success', msg: 'Aggregation pipeline executed: $group → $sort → $limit in 124ms',          ts: '09:35:44' },
  { id: 7,  level: 'error',   msg: 'Query failed: Collection "transactions" not found in database',             ts: '09:31:10' },
  { id: 8,  level: 'info',    msg: 'JWT token refreshed · expires in 3600s',                                    ts: '09:30:00' },
  { id: 9,  level: 'success', msg: 'Export completed: 142 documents → employees.json',                         ts: '09:28:33' },
  { id: 10, level: 'info',    msg: 'AI query generator initialized · model loaded',                             ts: '09:20:00' },
];

export const generateLineData = () =>
  Array.from({ length: 14 }, (_, i) => ({
    day: `May ${i + 16}`,
    execTime: Math.floor(Math.random() * 60 + 20),
    queries:  Math.floor(Math.random() * 400 + 200),
    accuracy: Math.floor(Math.random() * 5 + 94),
  }));

export const DONUT_DATA = [
  { name: 'find()',       value: 38, color: '#00f5ff' },
  { name: 'aggregate()', value: 29, color: '#4d9eff' },
  { name: 'updateMany()',value: 16, color: '#a855f7' },
  { name: 'insertOne()', value: 11, color: '#22c55e' },
  { name: 'deleteOne()', value: 6,  color: '#f59e0b' },
];

export const COLLECTION_DATA = [
  { name: 'users',     docs: 284711,  size: '2.1 GB', queries: 18420 },
  { name: 'orders',    docs: 892341,  size: '6.8 GB', queries: 12350 },
  { name: 'products',  docs: 48291,   size: '890 MB', queries: 8921  },
  { name: 'employees', docs: 1842,    size: '24 MB',  queries: 3241  },
  { name: 'logs',      docs: 1284721, size: '4.2 GB', queries: 2104  },
  { name: 'sessions',  docs: 92411,   size: '312 MB', queries: 1890  },
];
