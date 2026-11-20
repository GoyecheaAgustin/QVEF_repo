import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  CalendarCheck,
  Wallet,
  LayoutDashboard,
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  LogOut,
  TrendingUp,
  Phone,
  Trash2,
  Check,
  MessageCircle,
  ShieldCheck,
  AlertCircle,
  UserPlus,
  DollarSign,
  UserCog,
  Lock,
  Unlock
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || '';

// Dos administradores con acceso total a todas las funciones
const ADMINS = [
  {
    name: 'Beto (Profe Beto)',
    email: 'beto@quevivaelfutbol.com',
    role: 'admin'
  },
  {
    name: 'Agustín Goyechea',
    email: 'agustin@quevivaelfutbol.com',
    role: 'admin'
  }
];

// Grupos y categorías de chicos:
// 1. Competencia: año de nacimiento del 2014 al 2019
// 2. Escuelita: chicos de 4 a 12 años
const COMPETITION_YEARS = ['2014', '2015', '2016', '2017', '2018', '2019'];
const ESCUELITA_CATEGORIES = [
  'Escuelita (4-6 años)',
  'Escuelita (7-9 años)',
  'Escuelita (10-12 años)'
];
const ALL_CATEGORIES = [...COMPETITION_YEARS, ...ESCUELITA_CATEGORIES];

const INITIAL_COACHES = [
  {
    id: 'profe-1',
    name: 'Lucas Martínez',
    email: 'lucas.profe@quevivaelfutbol.com',
    phone: '5493757402211',
    categories: ['2014', '2015'],
    enabled: true
  },
  {
    id: 'profe-2',
    name: 'Camila Sosa',
    email: 'camila.profe@quevivaelfutbol.com',
    phone: '5493757406699',
    categories: ['Escuelita (4-6 años)', 'Escuelita (7-9 años)'],
    enabled: false
  }
];

const INITIAL_STUDENTS = [
  { id: 'stu-1', name: 'Mateo González', group: 'Competencia', category: '2016', guardian: 'Carlos González', phone: '5493757401122', feeStatus: 'paid', monthlyFee: 18000, lastPayment: '2026-11-05' },
  { id: 'stu-2', name: 'Thiago Fernández', group: 'Competencia', category: '2014', guardian: 'Laura Méndez', phone: '5493757403344', feeStatus: 'pending', monthlyFee: 18000, lastPayment: '2026-10-08' },
  { id: 'stu-3', name: 'Bautista Rojas', group: 'Escuelita', category: 'Escuelita (7-9 años)', guardian: 'Martín Rojas', phone: '5493757405566', feeStatus: 'paid', monthlyFee: 16000, lastPayment: '2026-11-03' },
  { id: 'stu-4', name: 'Santino Benítez', group: 'Competencia', category: '2018', guardian: 'Silvia Gómez', phone: '5493757407788', feeStatus: 'overdue', monthlyFee: 20000, lastPayment: '2026-09-12' },
  { id: 'stu-5', name: 'Lucas Villalba', group: 'Escuelita', category: 'Escuelita (4-6 años)', guardian: 'Diego Villalba', phone: '5493757409900', feeStatus: 'paid', monthlyFee: 16000, lastPayment: '2026-11-07' }
];

const INITIAL_TRANSACTIONS = [
  { id: 'tx-1', date: '2026-11-05', concept: 'Cuota Noviembre - Mateo González', category: 'Cuotas', type: 'income', amount: 18000 },
  { id: 'tx-2', date: '2026-11-03', concept: 'Cuota Noviembre - Bautista Rojas', category: 'Cuotas', type: 'income', amount: 16000 },
  { id: 'tx-3', date: '2026-11-07', concept: 'Cuota Noviembre - Lucas Villalba', category: 'Cuotas', type: 'income', amount: 16000 },
  { id: 'tx-4', date: '2026-11-08', concept: 'Compra de 4 pelotas N°4 y conos', category: 'Equipamiento', type: 'expense', amount: 24000 },
  { id: 'tx-5', date: '2026-11-10', concept: 'Alquiler horario cancha auxiliar', category: 'Cancha', type: 'expense', amount: 15000 }
];

function SchoolCrest({ className = "w-14 h-14" }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M100 12L172 40V104C172 148 141 178 100 190C59 178 28 148 28 104V40L100 12Z" fill="#0F1E36" stroke="#10B981" strokeWidth="6" />
      <path d="M100 22L162 46V102C162 140 135 167 100 178C65 167 38 140 38 102V46L100 22Z" fill="#FFFFFF" />
      <circle cx="100" cy="64" r="24" fill="#0F1E36" />
      <polygon points="100,48 112,57 107,71 93,71 88,57" fill="#FFFFFF" />
      <rect x="14" y="88" width="172" height="32" rx="6" fill="#0F1E36" stroke="#C5A869" strokeWidth="3" />
      <text x="100" y="109" textAnchor="middle" fill="#C5A869" fontSize="14" fontWeight="bold" fontFamily="sans-serif">QUE VIVA EL FÚTBOL</text>
      <text x="100" y="140" textAnchor="middle" fill="#0F1E36" fontSize="11" fontWeight="bold" fontFamily="sans-serif">PROFE BETO</text>
      <text x="100" y="154" textAnchor="middle" fill="#10B981" fontSize="9" fontWeight="bold" fontFamily="sans-serif">ESCUELA DE FÚTBOL</text>
    </svg>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('qvf_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [email, setEmail] = useState('beto@quevivaelfutbol.com');
  const [password, setPassword] = useState('********');
  const [loginError, setLoginError] = useState('');

  const [coaches, setCoaches] = useState(() => {
    const saved = localStorage.getItem('qvf_coaches');
    return saved ? JSON.parse(saved) : INITIAL_COACHES;
  });

  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('qvf_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('qvf_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [attendanceByDate, setAttendanceByDate] = useState(() => {
    const saved = localStorage.getItem('qvf_attendance');
    return saved ? JSON.parse(saved) : {};
  });

  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState(isAdmin ? 'dashboard' : 'attendance');

  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('Todos');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('Noviembre 2026');

  // Modal nuevo jugador
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    group: 'Competencia',
    category: '2016',
    name: '',
    guardian: '',
    phone: '',
    monthlyFee: 18000
  });

  // Modal nuevo movimiento de caja
  const [showTxModal, setShowTxModal] = useState(false);
  const [newTx, setNewTx] = useState({
    concept: '',
    category: 'Equipamiento',
    type: 'expense',
    amount: ''
  });

  // Modal nuevo profe
  const [showCoachModal, setShowCoachModal] = useState(false);
  const [newCoach, setNewCoach] = useState({
    name: '',
    email: '',
    phone: '',
    categories: ['2016'],
    enabled: false
  });

  const [toast, setToast] = useState('');
  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    localStorage.setItem('qvf_coaches', JSON.stringify(coaches));
  }, [coaches]);

  useEffect(() => {
    localStorage.setItem('qvf_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('qvf_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('qvf_attendance', JSON.stringify(attendanceByDate));
  }, [attendanceByDate]);

  useEffect(() => {
    if (!user || !API_URL) return;
    const fetchAwsData = async () => {
      try {
        const headers = { Authorization: `Bearer ${user.token || ''}` };
        const [stuRes, txRes, coachRes] = await Promise.all([
          fetch(`${API_URL}/students`, { headers }),
          fetch(`${API_URL}/transactions`, { headers }),
          fetch(`${API_URL}/coaches`, { headers })
        ]);
        if (stuRes.ok) {
          const stuData = await stuRes.json();
          if (Array.isArray(stuData) && stuData.length > 0) setStudents(stuData);
        }
        if (txRes.ok) {
          const txData = await txRes.json();
          if (Array.isArray(txData) && txData.length > 0) setTransactions(txData);
        }
        if (coachRes.ok) {
          const coachData = await coachRes.json();
          if (Array.isArray(coachData) && coachData.length > 0) setCoaches(coachData);
        }
      } catch (err) {
        console.warn('Usando almacenamiento local:', err);
      }
    };
    fetchAwsData();
  }, [user]);

  const handleLogin = (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password.trim()) {
      setLoginError('Completá tu correo y contraseña.');
      return;
    }

    // 1. Verificar si es uno de los dos administradores
    const foundAdmin = ADMINS.find((a) => a.email.toLowerCase() === cleanEmail);
    if (foundAdmin) {
      const sessionUser = {
        name: foundAdmin.name,
        email: foundAdmin.email,
        role: 'admin',
        categories: ALL_CATEGORIES,
        token: 'admin-session-token'
      };
      setUser(sessionUser);
      setActiveTab('dashboard');
      localStorage.setItem('qvf_user', JSON.stringify(sessionUser));
      setLoginError('');
      return;
    }

    // 2. Verificar si es un profe registrado y habilitado por un admin
    const foundCoach = coaches.find((c) => c.email.toLowerCase() === cleanEmail);
    if (!foundCoach) {
      setLoginError('Este correo no está registrado en la escuela.');
      return;
    }
    if (!foundCoach.enabled) {
      setLoginError('Tu cuenta de profe todavía no fue habilitada por un administrador.');
      return;
    }

    const sessionCoach = {
      name: foundCoach.name,
      email: foundCoach.email,
      role: 'profe',
      categories: foundCoach.categories || [],
      token: 'profe-session-token'
    };
    setUser(sessionCoach);
    setActiveTab('attendance');
    localStorage.setItem('qvf_user', JSON.stringify(sessionCoach));
    setLoginError('');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('qvf_user');
  };

  // Si es profe, solo ve las categorías asignadas a él
  const allowedCategories = useMemo(() => {
    if (!user) return [];
    if (user.role === 'admin') return ALL_CATEGORIES;
    return user.categories || [];
  }, [user]);

  // Alumnos visibles según rol y filtros
  const visibleStudents = useMemo(() => {
    return students.filter((s) => {
      if (user?.role === 'profe' && !allowedCategories.includes(s.category)) {
        return false;
      }
      const matchesGroup = selectedGroupFilter === 'Todos' || s.group === selectedGroupFilter;
      const matchesCat = selectedCategoryFilter === 'Todas' || s.category === selectedCategoryFilter;
      const matchesSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.guardian.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesGroup && matchesCat && matchesSearch;
    });
  }, [students, user, allowedCategories, selectedGroupFilter, selectedCategoryFilter, searchTerm]);

  const handleGroupChangeInModal = (newGroup) => {
    setNewStudent({
      ...newStudent,
      group: newGroup,
      category: newGroup === 'Competencia' ? '2016' : 'Escuelita (7-9 años)',
      monthlyFee: newGroup === 'Competencia' ? 18000 : 16000
    });
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudent.name.trim()) return;
    const created = {
      id: `stu-${Date.now()}`,
      group: newStudent.group,
      category: newStudent.category,
      name: newStudent.name.trim(),
      guardian: newStudent.guardian.trim() || 'Sin especificar',
      phone: newStudent.phone.trim(),
      feeStatus: 'pending',
      monthlyFee: Number(newStudent.monthlyFee) || 18000,
      lastPayment: '-'
    };
    setStudents((prev) => [created, ...prev]);
    setNewStudent({
      group: 'Competencia',
      category: '2016',
      name: '',
      guardian: '',
      phone: '',
      monthlyFee: 18000
    });
    setShowStudentModal(false);
    notify(`Jugador ${created.name} registrado en ${created.category}`);

    if (API_URL) {
      await fetch(`${API_URL}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token || ''}` },
        body: JSON.stringify(created)
      }).catch(() => {});
    }
  };

  const handleDeleteStudent = async (id) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    notify('Jugador eliminado');
    if (API_URL) {
      await fetch(`${API_URL}/students?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user?.token || ''}` }
      }).catch(() => {});
    }
  };

  const toggleNewCoachCategory = (cat) => {
    setNewCoach((prev) => {
      const exists = prev.categories.includes(cat);
      return {
        ...prev,
        categories: exists ? prev.categories.filter((c) => c !== cat) : [...prev.categories, cat]
      };
    });
  };

  const handleAddCoach = async (e) => {
    e.preventDefault();
    if (!newCoach.name.trim() || !newCoach.email.trim()) return;
    const createdCoach = {
      id: `profe-${Date.now()}`,
      name: newCoach.name.trim(),
      email: newCoach.email.trim().toLowerCase(),
      phone: newCoach.phone.trim(),
      categories: newCoach.categories.length > 0 ? newCoach.categories : ['2016'],
      enabled: Boolean(newCoach.enabled)
    };
    setCoaches((prev) => [createdCoach, ...prev]);
    setNewCoach({ name: '', email: '', phone: '', categories: ['2016'], enabled: false });
    setShowCoachModal(false);
    notify(`Profe ${createdCoach.name} agregado`);

    if (API_URL) {
      await fetch(`${API_URL}/coaches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token || ''}` },
        body: JSON.stringify(createdCoach)
      }).catch(() => {});
    }
  };

  const handleToggleCoachAccess = async (coach) => {
    const updated = { ...coach, enabled: !coach.enabled };
    setCoaches((prev) => prev.map((c) => (c.id === coach.id ? updated : c)));
    notify(
      updated.enabled
        ? `Acceso habilitado para ${coach.name}`
        : `Acceso suspendido para ${coach.name}`
    );

    if (API_URL) {
      await fetch(`${API_URL}/coaches`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token || ''}` },
        body: JSON.stringify(updated)
      }).catch(() => {});
    }
  };

  const handleDeleteCoach = async (id) => {
    setCoaches((prev) => prev.filter((c) => c.id !== id));
    notify('Profe eliminado');
    if (API_URL) {
      await fetch(`${API_URL}/coaches?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user?.token || ''}` }
      }).catch(() => {});
    }
  };

  const handleMarkPaid = async (student) => {
    const today = new Date().toISOString().split('T')[0];
    const updatedStudent = { ...student, feeStatus: 'paid', lastPayment: today };
    setStudents((prev) => prev.map((s) => (s.id === student.id ? updatedStudent : s)));

    const newIncome = {
      id: `tx-${Date.now()}`,
      date: today,
      concept: `Cuota ${selectedMonth} - ${student.name} (${student.category})`,
      category: 'Cuotas',
      type: 'income',
      amount: Number(student.monthlyFee)
    };
    setTransactions((prev) => [newIncome, ...prev]);
    notify(`Pago registrado para ${student.name}`);

    if (API_URL) {
      await Promise.all([
        fetch(`${API_URL}/students`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token || ''}` },
          body: JSON.stringify(updatedStudent)
        }),
        fetch(`${API_URL}/transactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token || ''}` },
          body: JSON.stringify(newIncome)
        })
      ]).catch(() => {});
    }
  };

  const handleAttendanceChange = async (studentId, status) => {
    const currentDay = attendanceByDate[selectedDate] || {};
    const updatedDay = { ...currentDay, [studentId]: status };
    setAttendanceByDate((prev) => ({ ...prev, [selectedDate]: updatedDay }));

    if (API_URL) {
      await fetch(`${API_URL}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token || ''}` },
        body: JSON.stringify({ date: selectedDate, records: updatedDay })
      }).catch(() => {});
    }
  };

  const handleMarkAllPresent = async () => {
    const updatedDay = { ...(attendanceByDate[selectedDate] || {}) };
    visibleStudents.forEach((s) => {
      updatedDay[s.id] = 'present';
    });
    setAttendanceByDate((prev) => ({ ...prev, [selectedDate]: updatedDay }));
    notify('Todos los jugadores visibles marcados como presentes');

    if (API_URL) {
      await fetch(`${API_URL}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token || ''}` },
        body: JSON.stringify({ date: selectedDate, records: updatedDay })
      }).catch(() => {});
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!newTx.concept.trim() || !newTx.amount) return;
    const tx = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      concept: newTx.concept.trim(),
      category: newTx.category,
      type: newTx.type,
      amount: Number(newTx.amount)
    };
    setTransactions((prev) => [tx, ...prev]);
    setNewTx({ concept: '', category: 'Equipamiento', type: 'expense', amount: '' });
    setShowTxModal(false);
    notify('Movimiento registrado en caja');

    if (API_URL) {
      await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token || ''}` },
        body: JSON.stringify(tx)
      }).catch(() => {});
    }
  };

  const metrics = useMemo(() => {
    const totalIncome = transactions.filter((t) => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
    const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
    const balance = totalIncome - totalExpense;
    const paidCount = students.filter((s) => s.feeStatus === 'paid').length;
    const pendingCount = students.filter((s) => s.feeStatus !== 'paid').length;
    const competenciaCount = students.filter((s) => s.group === 'Competencia').length;
    const escuelitaCount = students.filter((s) => s.group === 'Escuelita').length;
    return { totalIncome, totalExpense, balance, paidCount, pendingCount, competenciaCount, escuelitaCount };
  }, [students, transactions]);

  const chartData = [
    { name: 'Septiembre', Ingresos: 82000, Egresos: 31000 },
    { name: 'Octubre', Ingresos: 94000, Egresos: 28000 },
    { name: 'Noviembre', Ingresos: metrics.totalIncome, Egresos: metrics.totalExpense }
  ];

  const sendWhatsAppReminder = (student) => {
    const cleanPhone = (student.phone || '').replace(/\D/g, '');
    const msg = encodeURIComponent(
      `Hola ${student.guardian}! Te escribimos de la Escuela de Fútbol "Que Viva el Fútbol" (Profe Beto) para recordarte la cuota de ${selectedMonth} de ${student.name} (${student.category} - $${student.monthlyFee.toLocaleString('es-AR')}). ¡Muchas gracias!`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0F1E36] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border-t-4 border-[#10B981]">
          <div className="flex flex-col items-center text-center mb-6">
            <SchoolCrest className="w-24 h-24 mb-3" />
            <h1 className="text-2xl font-bold text-[#0F1E36]">Que Viva el Fútbol</h1>
            <p className="text-sm text-slate-500 font-medium">Escuela de Fútbol • Profe Beto</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#10B981] focus:outline-none"
                placeholder="tu-correo@ejemplo.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#10B981] focus:outline-none"
                placeholder="••••••••"
              />
            </div>
            {loginError && <p className="text-red-600 text-sm font-medium">{loginError}</p>}
            <button
              type="submit"
              className="w-full bg-[#10B981] hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition shadow-md"
            >
              Ingresar al Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  const navItems = isAdmin
    ? [
        { id: 'dashboard', label: 'Panel General', icon: LayoutDashboard },
        { id: 'students', label: 'Jugadores', icon: Users },
        { id: 'attendance', label: 'Asistencias', icon: CalendarCheck },
        { id: 'fees', label: 'Cuotas Mensuales', icon: CreditCard },
        { id: 'balance', label: 'Balance y Caja', icon: Wallet },
        { id: 'coaches', label: 'Profes', icon: UserCog }
      ]
    : [{ id: 'attendance', label: 'Asistencias', icon: CalendarCheck }];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0F1E36] text-white px-5 py-3 rounded-xl shadow-xl border-l-4 border-[#10B981] flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      <aside className="bg-[#0F1E36] text-white w-full md:w-64 flex-shrink-0 flex flex-col justify-between p-5">
        <div>
          <div className="flex items-center gap-3 pb-6 border-b border-slate-700">
            <SchoolCrest className="w-12 h-12 flex-shrink-0" />
            <div>
              <h2 className="font-bold text-base leading-tight text-[#C5A869]">Que Viva el Fútbol</h2>
              <p className="text-xs text-slate-300">Profe Beto</p>
            </div>
          </div>

          <nav className="mt-6 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                    active ? 'bg-[#10B981] text-white shadow' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-700 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-slate-400">
                {isAdmin ? 'Administrador' : `Profe • ${allowedCategories.join(', ')}`}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-5 md:p-8 max-w-7xl mx-auto w-full">
        {isAdmin && activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[#0F1E36]">¡Hola, {user.name}!</h1>
                <p className="text-slate-500 text-sm">Resumen de Competencia (2014–2019) y Escuelita (4–12 años)</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('attendance')}
                  className="bg-[#0F1E36] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 flex items-center gap-2"
                >
                  <CalendarCheck className="w-4 h-4 text-[#10B981]" />
                  Tomar Asistencia
                </button>
                <button
                  onClick={() => setShowStudentModal(true)}
                  className="bg-[#10B981] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-600 flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Nuevo Jugador
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between text-slate-500 text-sm mb-2">
                  <span>Jugadores Activos</span>
                  <Users className="w-5 h-5 text-[#0F1E36]" />
                </div>
                <p className="text-3xl font-bold text-[#0F1E36]">{students.length}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Competencia: {metrics.competenciaCount} • Escuelita: {metrics.escuelitaCount}
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between text-slate-500 text-sm mb-2">
                  <span>Cuotas al Día</span>
                  <ShieldCheck className="w-5 h-5 text-[#10B981]" />
                </div>
                <p className="text-3xl font-bold text-[#10B981]">{metrics.paidCount}</p>
                <p className="text-xs text-slate-500 mt-1">{metrics.pendingCount} pendientes de cobro</p>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between text-slate-500 text-sm mb-2">
                  <span>Ingresos del Mes</span>
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-3xl font-bold text-[#0F1E36]">${metrics.totalIncome.toLocaleString('es-AR')}</p>
                <p className="text-xs text-emerald-600 font-medium mt-1">Recaudación acumulada</p>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between text-slate-500 text-sm mb-2">
                  <span>Balance Neto</span>
                  <Wallet className="w-5 h-5 text-[#C5A869]" />
                </div>
                <p className={`text-3xl font-bold ${metrics.balance >= 0 ? 'text-[#0F1E36]' : 'text-red-600'}`}>
                  ${metrics.balance.toLocaleString('es-AR')}
                </p>
                <p className="text-xs text-slate-500 mt-1">Gastos: ${metrics.totalExpense.toLocaleString('es-AR')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2">
                <h3 className="font-bold text-[#0F1E36] mb-4">Evolución de Ingresos y Gastos</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(v) => `$${Number(v).toLocaleString('es-AR')}`} />
                      <Bar dataKey="Ingresos" fill="#10B981" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="Egresos" fill="#0F1E36" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-[#0F1E36] mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  Cuotas por Cobrar
                </h3>
                <div className="space-y-3">
                  {students.filter((s) => s.feeStatus !== 'paid').length === 0 ? (
                    <p className="text-sm text-emerald-600 font-medium">¡Todos los jugadores están al día!</p>
                  ) : (
                    students
                      .filter((s) => s.feeStatus !== 'paid')
                      .map((s) => (
                        <div key={s.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-sm text-[#0F1E36]">{s.name}</p>
                            <p className="text-xs text-slate-500">
                              {s.group} • {s.category} • ${s.monthlyFee.toLocaleString('es-AR')}
                            </p>
                          </div>
                          <button
                            onClick={() => handleMarkPaid(s)}
                            className="px-3 py-1.5 bg-[#10B981] text-white text-xs font-bold rounded-lg hover:bg-emerald-600"
                          >
                            Cobrar
                          </button>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {isAdmin && activeTab === 'students' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[#0F1E36]">Plantel de Jugadores</h1>
                <p className="text-sm text-slate-500">Competencia (2014–2019) y Escuelita (4 a 12 años)</p>
              </div>
              <button
                onClick={() => setShowStudentModal(true)}
                className="bg-[#10B981] hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 self-start"
              >
                <Plus className="w-4 h-4" />
                Agregar Jugador
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Buscar por jugador o padre/tutor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                />
              </div>
              <select
                value={selectedGroupFilter}
                onChange={(e) => {
                  setSelectedGroupFilter(e.target.value);
                  setSelectedCategoryFilter('Todas');
                }}
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700"
              >
                <option value="Todos">Todos los grupos</option>
                <option value="Competencia">Competencia (2014–2019)</option>
                <option value="Escuelita">Escuelita (4–12 años)</option>
              </select>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700"
              >
                <option value="Todas">Todas las categorías</option>
                {ALL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                    <th className="py-3.5 px-4">Jugador</th>
                    <th className="py-3.5 px-4">Grupo / Categoría</th>
                    <th className="py-3.5 px-4">Tutor / Contacto</th>
                    <th className="py-3.5 px-4">Cuota</th>
                    <th className="py-3.5 px-4">Estado</th>
                    <th className="py-3.5 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {visibleStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-semibold text-[#0F1E36]">{s.name}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#0F1E36] text-[#C5A869]">
                          {s.group} • {s.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-700">{s.guardian}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {s.phone || 'Sin teléfono'}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 font-semibold">${s.monthlyFee.toLocaleString('es-AR')}</td>
                      <td className="py-3.5 px-4">
                        {s.feeStatus === 'paid' ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                            Al día
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {s.phone && (
                          <button
                            onClick={() => sendWhatsAppReminder(s)}
                            title="Enviar WhatsApp"
                            className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 inline-flex"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteStudent(s.id)}
                          title="Eliminar"
                          className="p-2 rounded-lg text-red-500 hover:bg-red-50 inline-flex"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[#0F1E36]">Control de Asistencias</h1>
                <p className="text-sm text-slate-500">
                  {isAdmin
                    ? 'Marcá asistencias de todas las categorías'
                    : `Categorías a tu cargo: ${allowedCategories.join(', ')}`}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-[#0F1E36]"
                >
                  <option value="Todas">
                    {isAdmin ? 'Todas las categorías' : 'Todas mis categorías'}
                  </option>
                  {allowedCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-[#0F1E36]"
                />
                <button
                  onClick={handleMarkAllPresent}
                  className="bg-[#10B981] hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Marcar todos presentes
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visibleStudents.map((s) => {
                const status = attendanceByDate[selectedDate]?.[s.id] || 'unmarked';
                return (
                  <div
                    key={s.id}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-bold text-[#0F1E36]">{s.name}</p>
                      <p className="text-xs text-slate-500">
                        {s.group} • {s.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleAttendanceChange(s.id, 'present')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                          status === 'present'
                            ? 'bg-[#10B981] text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-emerald-50'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Presente
                      </button>
                      <button
                        onClick={() => handleAttendanceChange(s.id, 'late')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                          status === 'late'
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-amber-50'
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                        Tarde
                      </button>
                      <button
                        onClick={() => handleAttendanceChange(s.id, 'absent')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                          status === 'absent'
                            ? 'bg-red-500 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-red-50'
                        }`}
                      >
                        <XCircle className="w-4 h-4" />
                        Ausente
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isAdmin && activeTab === 'fees' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[#0F1E36]">Control de Cuotas</h1>
                <p className="text-sm text-slate-500">Registrá pagos y enviá recordatorios por WhatsApp</p>
              </div>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-[#0F1E36]"
              >
                <option>Octubre 2026</option>
                <option>Noviembre 2026</option>
                <option>Diciembre 2026</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((s) => (
                <div key={s.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-[#0F1E36]">{s.name}</h3>
                        <p className="text-xs text-slate-500">
                          {s.group} • {s.category} • {s.guardian}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          s.feeStatus === 'paid'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {s.feeStatus === 'paid' ? 'Pagada' : 'Pendiente'}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-[#0F1E36] my-3">
                      ${s.monthlyFee.toLocaleString('es-AR')}
                    </p>
                    <p className="text-xs text-slate-400">Último pago: {s.lastPayment}</p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                    {s.feeStatus !== 'paid' ? (
                      <>
                        <button
                          onClick={() => handleMarkPaid(s)}
                          className="flex-1 bg-[#10B981] hover:bg-emerald-600 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                        >
                          <DollarSign className="w-4 h-4" />
                          Registrar Pago
                        </button>
                        {s.phone && (
                          <button
                            onClick={() => sendWhatsAppReminder(s)}
                            className="px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold flex items-center gap-1"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Avisar
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="w-full text-center py-2 bg-slate-50 rounded-xl text-xs font-semibold text-emerald-700">
                        ✓ Cuota acreditada en caja
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isAdmin && activeTab === 'balance' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[#0F1E36]">Balance y Caja</h1>
                <p className="text-sm text-slate-500">Ingresos por cuotas y egresos de materiales o cancha</p>
              </div>
              <button
                onClick={() => setShowTxModal(true)}
                className="bg-[#0F1E36] hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 self-start"
              >
                <Plus className="w-4 h-4 text-[#10B981]" />
                Registrar Movimiento
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase">Total Ingresos</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  +${metrics.totalIncome.toLocaleString('es-AR')}
                </p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase">Total Egresos</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  -${metrics.totalExpense.toLocaleString('es-AR')}
                </p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase">Saldo Disponible</p>
                <p className="text-2xl font-bold text-[#0F1E36] mt-1">
                  ${metrics.balance.toLocaleString('es-AR')}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                    <th className="py-3.5 px-4">Fecha</th>
                    <th className="py-3.5 px-4">Concepto</th>
                    <th className="py-3.5 px-4">Categoría</th>
                    <th className="py-3.5 px-4 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 text-slate-500">{tx.date}</td>
                      <td className="py-3.5 px-4 font-semibold text-[#0F1E36]">{tx.concept}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          {tx.category}
                        </span>
                      </td>
                      <td
                        className={`py-3.5 px-4 text-right font-bold ${
                          tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}${Number(tx.amount).toLocaleString('es-AR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {isAdmin && activeTab === 'coaches' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[#0F1E36]">Profes y Permisos</h1>
                <p className="text-sm text-slate-500">
                  Asigná categorías y habilitá el acceso para que cada profe tome asistencia
                </p>
              </div>
              <button
                onClick={() => setShowCoachModal(true)}
                className="bg-[#10B981] hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 self-start"
              >
                <Plus className="w-4 h-4" />
                Agregar Profe
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-sm text-slate-600">
              <strong className="text-[#0F1E36]">Administradores con acceso total:</strong>{' '}
              {ADMINS.map((a) => `${a.name} (${a.email})`).join(' • ')}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coaches.map((coach) => (
                <div
                  key={coach.id}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-[#0F1E36] text-base">{coach.name}</h3>
                        <p className="text-xs text-slate-500">{coach.email}</p>
                        {coach.phone && <p className="text-xs text-slate-400 mt-0.5">{coach.phone}</p>}
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          coach.enabled
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {coach.enabled ? 'Habilitado' : 'Pendiente de habilitar'}
                      </span>
                    </div>

                    <div className="mt-3">
                      <p className="text-xs font-semibold text-slate-500 mb-1.5">Categorías asignadas:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {coach.categories.map((cat) => (
                          <span
                            key={cat}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-[#0F1E36]"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleToggleCoachAccess(coach)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                        coach.enabled
                          ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                          : 'bg-[#10B981] text-white hover:bg-emerald-600'
                      }`}
                    >
                      {coach.enabled ? (
                        <>
                          <Lock className="w-4 h-4" />
                          Quitar Acceso
                        </>
                      ) : (
                        <>
                          <Unlock className="w-4 h-4" />
                          Habilitar Acceso
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteCoach(coach.id)}
                      title="Eliminar profe"
                      className="p-2 rounded-xl text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {showStudentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-[#0F1E36] mb-4">Registrar Nuevo Jugador</h2>
            <form onSubmit={handleAddStudent} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Grupo</label>
                <select
                  value={newStudent.group}
                  onChange={(e) => handleGroupChangeInModal(e.target.value)}
                  className="w-full px-3.5 py-2 border rounded-xl text-sm font-semibold"
                >
                  <option value="Competencia">Competencia (2014 al 2019)</option>
                  <option value="Escuelita">Escuelita (4 a 12 años)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {newStudent.group === 'Competencia' ? 'Año de nacimiento' : 'Categoría Escuelita'}
                </label>
                <select
                  value={newStudent.category}
                  onChange={(e) => setNewStudent({ ...newStudent, category: e.target.value })}
                  className="w-full px-3.5 py-2 border rounded-xl text-sm"
                >
                  {(newStudent.group === 'Competencia' ? COMPETITION_YEARS : ESCUELITA_CATEGORIES).map(
                    (cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    )
                  )}
                </select>
              </div>

              <input
                type="text"
                required
                placeholder="Nombre y apellido del jugador"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                className="w-full px-3.5 py-2 border rounded-xl text-sm"
              />
              <input
                type="text"
                placeholder="Nombre del padre / tutor"
                value={newStudent.guardian}
                onChange={(e) => setNewStudent({ ...newStudent, guardian: e.target.value })}
                className="w-full px-3.5 py-2 border rounded-xl text-sm"
              />
              <input
                type="text"
                placeholder="WhatsApp (ej: 5493757401122)"
                value={newStudent.phone}
                onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                className="w-full px-3.5 py-2 border rounded-xl text-sm"
              />
              <input
                type="number"
                placeholder="Valor de cuota mensual ($)"
                value={newStudent.monthlyFee}
                onChange={(e) => setNewStudent({ ...newStudent, monthlyFee: e.target.value })}
                className="w-full px-3.5 py-2 border rounded-xl text-sm"
              />
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowStudentModal(false)}
                  className="px-4 py-2 text-sm text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#10B981] text-white rounded-xl text-sm font-bold"
                >
                  Guardar Jugador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCoachModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-[#0F1E36] mb-4">Agregar Nuevo Profe</h2>
            <form onSubmit={handleAddCoach} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Nombre y apellido del profe"
                value={newCoach.name}
                onChange={(e) => setNewCoach({ ...newCoach, name: e.target.value })}
                className="w-full px-3.5 py-2 border rounded-xl text-sm"
              />
              <input
                type="email"
                required
                placeholder="Correo electrónico del profe"
                value={newCoach.email}
                onChange={(e) => setNewCoach({ ...newCoach, email: e.target.value })}
                className="w-full px-3.5 py-2 border rounded-xl text-sm"
              />
              <input
                type="text"
                placeholder="Teléfono / WhatsApp"
                value={newCoach.phone}
                onChange={(e) => setNewCoach({ ...newCoach, phone: e.target.value })}
                className="w-full px-3.5 py-2 border rounded-xl text-sm"
              />

              <div>
                <p className="text-xs font-semibold text-slate-600 mb-1.5">
                  Categorías a cargo (podés elegir una o más):
                </p>
                <div className="max-h-40 overflow-y-auto border rounded-xl p-2.5 space-y-1.5">
                  {ALL_CATEGORIES.map((cat) => (
                    <label key={cat} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newCoach.categories.includes(cat)}
                        onChange={() => toggleNewCoachCategory(cat)}
                        className="rounded text-[#10B981]"
                      />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newCoach.enabled}
                  onChange={(e) => setNewCoach({ ...newCoach, enabled: e.target.checked })}
                />
                <span>Habilitar acceso de inmediato (si queda desmarcado, lo habilitás luego)</span>
              </label>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCoachModal(false)}
                  className="px-4 py-2 text-sm text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#10B981] text-white rounded-xl text-sm font-bold"
                >
                  Guardar Profe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTxModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-[#0F1E36] mb-4">Nuevo Movimiento de Caja</h2>
            <form onSubmit={handleAddTransaction} className="space-y-3">
              <select
                value={newTx.type}
                onChange={(e) => setNewTx({ ...newTx, type: e.target.value })}
                className="w-full px-3.5 py-2 border rounded-xl text-sm font-semibold"
              >
                <option value="expense">Egreso / Gasto (-)</option>
                <option value="income">Ingreso Extra (+)</option>
              </select>
              <input
                type="text"
                required
                placeholder="Concepto (ej: Compra de pecheras)"
                value={newTx.concept}
                onChange={(e) => setNewTx({ ...newTx, concept: e.target.value })}
                className="w-full px-3.5 py-2 border rounded-xl text-sm"
              />
              <input
                type="text"
                placeholder="Categoría (ej: Equipamiento, Cancha, Torneo)"
                value={newTx.category}
                onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
                className="w-full px-3.5 py-2 border rounded-xl text-sm"
              />
              <input
                type="number"
                required
                placeholder="Monto ($)"
                value={newTx.amount}
                onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                className="w-full px-3.5 py-2 border rounded-xl text-sm"
              />
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowTxModal(false)}
                  className="px-4 py-2 text-sm text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0F1E36] text-white rounded-xl text-sm font-bold"
                >
                  Guardar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
