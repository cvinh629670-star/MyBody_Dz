import React, { useState, useEffect } from 'react';
import { Dumbbell, Utensils, BookOpen, Quote, Calendar, Plus, HelpCircle, X, Sparkles, Trash2, Target, ArrowLeft, Search, CheckCircle2, Wrench, Scale, LineChart as ChartIcon, TrendingUp, Zap } from 'lucide-react';
// Import các component biểu đồ từ Recharts
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// --- 1. KHO QUOTE TRUYỀN ĐỘNG LỰC ---
const DISCIPLINE_QUOTES = [
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "What hurts today makes you stronger tomorrow.", author: "Jay Cutler" },
  { text: "Suffering is temporary. Regret lasts forever.", author: "Arnold Schwarzenegger" },
  { text: "Success isn't always about greatness. It's about consistency.", author: "Dwayne Johnson" }
];

// --- 2. CƠ SỞ DỮ LIỆU DINH DƯỠNG GỐC ---
const DEFAULT_FOOD_DATABASE = {
  "uc ga": { calo: 165, protein: 31, fat: 3.6, carb: 0 },
  "ức gà": { calo: 165, protein: 31, fat: 3.6, carb: 0 },
  "trung": { calo: 155, protein: 13, fat: 11, carb: 1.1 },
  "trứng": { calo: 155, protein: 13, fat: 11, carb: 1.1 },
  "com": { calo: 130, protein: 2.7, fat: 0.3, carb: 28 },
  "cơm": { calo: 130, protein: 2.7, fat: 0.3, carb: 28 },
  "bo": { calo: 250, protein: 26, fat: 15, carb: 0 },
  "bò": { calo: 250, protein: 26, fat: 15, carb: 0 },
  "whey": { calo: 120, protein: 25, fat: 1, carb: 2 },
};

// --- 3. THƯ VIỆN BÀI TẬP GỐC BAN ĐẦU ---
const INITIAL_EXERCISE_LIBRARY = [
  { id: 'bp', name: 'Benchpress', category: 'Compound' },
  { id: 'sq', name: 'Squat', category: 'Compound' },
  { id: 'dl', name: 'Deadlift', category: 'Compound' },
  { id: 'op', name: 'Overhead Press', category: 'Compound' },
  { id: 'pu', name: 'Push-up', category: 'Ngực' },
  { id: 'bc', name: 'Bicep Curl', category: 'Tay' },
  { id: 'pl', name: 'Plank', category: 'Bụng' },
];

const DAYS_OF_WEEK = [
  { id: 'Mon', label: 'Mon' }, { id: 'Tue', label: 'Tue' }, { id: 'Wed', label: 'Wed' },
  { id: 'Thu', label: 'Thu' }, { id: 'Fri', label: 'Fri' }, { id: 'Sat', label: 'Sat' }, { id: 'Sun', label: 'Sun' }
];

const EXERCISE_CATEGORIES = ['Compound', 'Ngực', 'Lưng', 'Chân', 'Vai', 'Tay', 'Bụng'];

// --- DỮ LIỆU BIỂU ĐỒ CÂN NẶNG THEO TỪNG THÁNG TRONG NĂM ---
const MONTHLY_WEIGHT_DATA = [
  { month: 'Tháng 1', weight: 53.0 },
  { month: 'Tháng 2', weight: 54.5 },
  { month: 'Tháng 3', weight: 56.2 },
  { month: 'Tháng 4', weight: 58.0 },
  { month: 'Tháng 5', weight: 59.8 }
];

const WORKOUT_VOLUME_DATA = [
  { day: 'Mon', volume: 2400 }, { day: 'Tue', volume: 1800 },
  { day: 'Wed', volume: 3200 }, { day: 'Thu', volume: 1500 },
  { day: 'Fri', volume: 2800 }, { day: 'Sat', volume: 0 }, { day: 'Sun', volume: 0 }
];

const PROGRESSIVE_OVERLOAD_DATA = [
  { week: 'Tuần 1', weight: 50 }, { week: 'Tuần 2', weight: 52.5 },
  { week: 'Tuần 3', weight: 55 }, { week: 'Tuần 4', weight: 57.5 },
  { week: 'Tuần 5', weight: 60 }
];

export default function App() {
  const getSystemDayId = () => {
    const dayIndex = new Date().getDay();
    const mapping = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return mapping[dayIndex];
  };
  const todayId = getSystemDayId();

  // ---- STATE QUẢN LÝ ĐIỀU HƯỚNG GIAO DIỆN ----
  const [currentView, setCurrentView] = useState('home'); 
  const [selectedDay, setSelectedDay] = useState(todayId); 
  const [currentQuote, setCurrentQuote] = useState({ text: "Train, eat", author: "Dz" });
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [isCustomExerciseModalOpen, setIsCustomExerciseModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ---- STATE THEO DÕI HÌNH THỂ (ĐỒNG BỘ MULTI-USER) ----
  const [initialWeight, setInitialWeight] = useState(() => localStorage.getItem('mybody_initial_weight') || '53.0'); 
  const [currentWeight, setCurrentWeight] = useState(() => localStorage.getItem('mybody_user_weight') || '59.8');
  const [userHeight, setUserHeight] = useState(() => localStorage.getItem('mybody_user_height') || '170'); 

  // Form tạo dữ liệu
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseCategory, setNewExerciseCategory] = useState('Compound');
  const [newMeal, setNewMeal] = useState({ name: '', calo: '', protein: '', fat: '', carb: '' });

  // ---- STATE DỮ LIỆU LOCALSTORAGE ----
  const [customFoodDb, setCustomFoodDb] = useState(() => {
    const saved = localStorage.getItem('mybody_food_db');
    return saved ? JSON.parse(saved) : DEFAULT_FOOD_DATABASE;
  });

  const [meals, setMeals] = useState(() => {
    const saved = localStorage.getItem('mybody_meals_today_v6');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Ức gà nướng', calo: 165, protein: 31, fat: 3.6, carb: 0 },
      { id: 2, name: 'Cơm trắng', calo: 130, protein: 2.7, fat: 0.3, carb: 28 },
    ];
  });

  const [exerciseLibrary, setExerciseLibrary] = useState(() => {
    const saved = localStorage.getItem('mybody_exercise_library_v6');
    return saved ? JSON.parse(saved) : INITIAL_EXERCISE_LIBRARY;
  });

  const [weeklyRoutineConfig, setWeeklyRoutineConfig] = useState(() => {
    const saved = localStorage.getItem('mybody_weekly_routine_config_v6');
    return saved ? JSON.parse(saved) : { 
      Mon: ['bp', 'pu'], Tue: ['sq'], Wed: ['bp', 'pu', 'bc'], Thu: ['dl'], Fri: ['op', 'pl'], Sat: [], Sun: [] 
    };
  });

  const [routinesData, setRoutinesData] = useState(() => {
    const saved = localStorage.getItem('mybody_routines_data_v6');
    return saved ? JSON.parse(saved) : {
      'bp': { weight: '60', sets: ['12', '10', '8'] },
      'pu': { weight: 'B.W', sets: ['20', '20', '15'] },
      'bc': { weight: '12', sets: ['12', '12', '10'] }
    };
  });

  // ---- ĐỒNG BỘ DỮ LIỆU ----
  useEffect(() => { localStorage.setItem('mybody_food_db', JSON.stringify(customFoodDb)); }, [customFoodDb]);
  useEffect(() => { localStorage.setItem('mybody_meals_today_v6', JSON.stringify(meals)); }, [meals]);
  useEffect(() => { localStorage.setItem('mybody_exercise_library_v6', JSON.stringify(exerciseLibrary)); }, [exerciseLibrary]);
  useEffect(() => { localStorage.setItem('mybody_weekly_routine_config_v6', JSON.stringify(weeklyRoutineConfig)); }, [weeklyRoutineConfig]);
  useEffect(() => { localStorage.setItem('mybody_routines_data_v6', JSON.stringify(routinesData)); }, [routinesData]);
  useEffect(() => { localStorage.setItem('mybody_user_weight', currentWeight); }, [currentWeight]);
  useEffect(() => { localStorage.setItem('mybody_user_height', userHeight); }, [userHeight]);
  useEffect(() => { localStorage.setItem('mybody_initial_weight', initialWeight); }, [initialWeight]);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * DISCIPLINE_QUOTES.length);
    setCurrentQuote(DISCIPLINE_QUOTES[randomIndex]);
  }, []);

  // ---- LOGIC TỰ ĐỘNG TÍNH BMI & PHÂN LOẠI MÀU SẮC PHẢN HỒI ----
  const heightInMeters = Number(userHeight) / 100;
  const bmiScore = (heightInMeters > 0) ? Number((Number(currentWeight) / (heightInMeters * heightInMeters)).toFixed(1)) : 0;

  const getBMIDetails = (bmi) => {
    if (bmi === 0) return { label: 'Chưa rõ', colorBg: 'text-zinc-400', labelColor: 'text-zinc-500' };
    if (bmi < 18.5) {
      return { label: 'Quá gầy', colorBg: 'text-red-500', labelColor: 'text-red-500/90' };
    } else if (bmi >= 18.5 && bmi <= 22.9) {
      return { label: 'Tốt', colorBg: 'text-green-500', labelColor: 'text-green-500/90' };
    } else if (bmi >= 23 && bmi <= 24.9) {
      return { label: 'Thừa cân', colorBg: 'text-blue-500', labelColor: 'text-amber-500' }; // Số màu xanh dương, chữ nhỏ màu vàng hổ phách
    } else {
      return { label: 'Béo phì', colorBg: 'text-red-500', labelColor: 'text-red-500/90' };
    }
  };
  const bmiInfo = getBMIDetails(bmiScore);

  // ---- HÀM TÍNH TDEE DYNAMIC THEO NGÀY ----
  const getEstimatedTDEEForDay = (dayId) => {
    const weightNum = Number(currentWeight) || 60;
    const heightNum = Number(userHeight) || 170;
    const baseBMR = (10 * weightNum) + (6.25 * heightNum) - (5 * 20) + 5; 
    const exerciseCount = (weeklyRoutineConfig[dayId] || []).length;
    const activityMultiplier = exerciseCount === 0 ? 1.2 : 1.55; 
    return Math.round(baseBMR * activityMultiplier);
  };

  const todayTDEE = getEstimatedTDEEForDay(todayId);
  const selectedDayTDEE = getEstimatedTDEEForDay(selectedDay);

  // ---- HANDLERS DINH DƯỠNG ----
  const handleFoodNameChange = (e) => {
    const name = e.target.value;
    setNewMeal(prev => ({ ...prev, name }));
    const lowerName = name.toLowerCase().trim();
    if (!lowerName) return;
    if (customFoodDb[lowerName]) {
      const stats = customFoodDb[lowerName];
      setNewMeal(prev => ({ ...prev, calo: stats.calo, protein: stats.protein, fat: stats.fat, carb: stats.carb }));
    }
  };

  const handleAddMeal = (e) => {
    e.preventDefault();
    if (!newMeal.name) return;
    const mealNameClean = newMeal.name.trim();
    const keyName = mealNameClean.toLowerCase();
    const caloVal = Number(newMeal.calo) || 0;
    const proVal = Number(newMeal.protein) || 0;
    const fatVal = Number(newMeal.fat) || 0;
    const carbVal = Number(newMeal.carb) || 0;

    setMeals(prev => [...prev, { id: Date.now(), name: mealNameClean, calo: caloVal, protein: proVal, fat: fatVal, carb: carbVal }]);
    if (!customFoodDb[keyName]) {
      setCustomFoodDb(prev => ({ ...prev, [keyName]: { calo: caloVal, protein: proVal, fat: fatVal, carb: carbVal } }));
    }
    setNewMeal({ name: '', calo: '', protein: '', fat: '', carb: '' });
    setIsMealModalOpen(false);
  };

  const totalMacros = meals.reduce((acc, curr) => {
    return { calo: acc.calo + curr.calo, protein: acc.protein + curr.protein, fat: acc.fat + curr.fat, carb: acc.carb + curr.carb };
  }, { calo: 0, protein: 0, fat: 0, carb: 0 });

  // ---- HANDLERS BÀI TẬP ----
  const toggleExerciseForDay = (exerciseId) => {
    setWeeklyRoutineConfig(prev => {
      const currentDayList = prev[selectedDay] || [];
      const isExist = currentDayList.includes(exerciseId);
      return { ...prev, [selectedDay]: isExist ? currentDayList.filter(id => id !== exerciseId) : [...currentDayList, exerciseId] };
    });
  };

  const handleCreateCustomExercise = (e) => {
    e.preventDefault();
    if (!newExerciseName.trim()) return;
    const customId = 'custom_' + Date.now();
    setExerciseLibrary(prev => [...prev, { id: customId, name: newExerciseName.trim(), category: newExerciseCategory }]);
    setWeeklyRoutineConfig(prev => ({ ...prev, [selectedDay]: [...(prev[selectedDay] || []), customId] }));
    setNewExerciseName('');
    setIsCustomExerciseModalOpen(false);
  };

  const handleDeleteExerciseFromLibrary = (exerciseId, e) => {
    e.stopPropagation();
    setExerciseLibrary(prev => prev.filter(ex => ex.id !== exerciseId));
    setWeeklyRoutineConfig(prev => {
      const updatedConfig = {};
      Object.keys(prev).forEach(day => { updatedConfig[day] = prev[day].filter(id => id !== exerciseId); });
      return updatedConfig;
    });
  };

  const handleRoutineDataChange = (exerciseId, field, value, setIndex = null) => {
    setRoutinesData(prev => {
      const existing = prev[exerciseId] || { weight: '', sets: ['', '', ''] };
      if (setIndex !== null) {
        const newSets = [...existing.sets];
        newSets[setIndex] = value;
        return { ...prev, [exerciseId]: { ...existing, sets: newSets } };
      }
      return { ...prev, [exerciseId]: { ...existing, [field]: value } };
    });
  };

  const getRoutinesForDay = (dayId) => {
    const exerciseIds = weeklyRoutineConfig[dayId] || [];
    return exerciseIds.map(id => {
      const exInfo = exerciseLibrary.find(e => e.id === id) || { name: 'Bài tập' };
      const savedData = routinesData[id] || { weight: '', sets: ['', '', ''] };
      return { id, name: exInfo.name, ...savedData };
    });
  };

  // ==========================================
  // GIAO DIỆN 1: TRANG CHỦ (HOME)
  // ==========================================
  if (currentView === 'home') {
    const todayRoutines = getRoutinesForDay(todayId);

    return (
      <div className="h-screen bg-background text-zinc-100 flex flex-col p-4 max-w-md mx-auto relative overflow-hidden select-none animate-in fade-in duration-300">
        <div className="absolute top-[-10%] left-[-20%] w-72 h-72 bg-deepRed/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[-20%] w-72 h-72 bg-cyberBlue/15 rounded-full blur-[120px] pointer-events-none" />

        <header className="flex justify-between items-start mb-4 flex-shrink-0">
          <div>
            <h1 className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">MyBody_Dz</h1>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-1 font-semibold">
              <Calendar size={13} className="text-cyberBlue" />
              <span>Hôm nay: Thứ {todayId === 'Sun' ? 'Chủ Nhật' : todayId}</span>
            </div>
          </div>
          <div className="bg-cardBg/90 border border-zinc-800/80 rounded-xl p-3 max-w-[180px] shadow-lg backdrop-blur-sm">
            <p className="text-[11px] italic font-medium text-zinc-300 leading-tight">"{currentQuote.text}"</p>
            <span className="text-[9px] text-cyberBlue font-bold block mt-1 text-right">- {currentQuote.author} -</span>
          </div>
        </header>

        <main className="grid grid-cols-2 gap-3 flex-1 min-h-0 items-stretch mb-4">
          {/* CỘT MEALS */}
          <section className="gradient-border rounded-2xl p-3 flex flex-col bg-cardBg/90 shadow-2xl min-h-0">
            <div className="flex items-center justify-between mb-3 border-b border-zinc-800/80 pb-2 flex-shrink-0">
              <div className="flex items-center gap-1.5"><Utensils size={15} className="text-deepRed" /><h2 className="text-xs font-black uppercase tracking-widest text-zinc-300">Meals</h2></div>
              <button onClick={() => setIsMealModalOpen(true)} className="p-1 bg-deepRed/20 hover:bg-deepRed/40 border border-deepRed/30 rounded-lg text-deepRed cursor-pointer"><Plus size={14} strokeWidth={3} /></button>
            </div>
            <div className="flex-1 overflow-y-auto pr-0.5 space-y-2 min-h-0 mb-2 custom-scrollbar">
              {meals.map(meal => (
                <div key={meal.id} className="bg-zinc-950 p-2 rounded-xl border border-zinc-800 relative">
                  <button onClick={() => setMeals(prev => prev.filter(x => x.id !== meal.id))} className="absolute top-1.5 right-1.5 text-zinc-600 hover:text-red-400 cursor-pointer"><X size={11} /></button>
                  <span className="text-xs font-bold text-zinc-200 truncate pr-4 block">{meal.name}</span>
                  <span className="text-[10px] text-deepRed font-black font-mono">{meal.calo} kcal</span>
                  <div className="grid grid-cols-3 gap-0.5 text-[8px] text-zinc-500 font-mono mt-0.5 pt-0.5 border-t border-zinc-900">
                    <span>P:{meal.protein}g</span><span>F:{meal.fat}g</span><span>C:{meal.carb}g</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex-shrink-0 pt-2 border-t border-zinc-800/80 flex flex-col gap-1.5 bg-zinc-950/40 p-2 rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider flex items-center gap-1"><Target size={11} className="text-deepRed" /> Total</span>
                <span className="text-xs font-black text-deepRed font-mono">{totalMacros.calo} kcal</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-center text-[9px] font-mono border-t border-zinc-900/60 pt-1.5">
                <div className="bg-zinc-900/60 py-0.5 rounded border border-zinc-800/50"><div className="text-zinc-400 font-bold">P: {totalMacros.protein}g</div></div>
                <div className="bg-zinc-900/60 py-0.5 rounded border border-zinc-800/50"><div className="text-zinc-300 font-bold">F: {totalMacros.fat}g</div></div>
                <div className="bg-zinc-900/60 py-0.5 rounded border border-zinc-800/50"><div className="text-zinc-300 font-bold">C: {totalMacros.carb}g</div></div>
              </div>
            </div>
          </section>

          {/* CỘT ROUTINE */}
          <section className="gradient-border rounded-2xl p-3 flex flex-col bg-cardBg/90 shadow-2xl min-h-0">
            <div className="flex items-center justify-between mb-3 border-b border-zinc-800/80 pb-2 flex-shrink-0">
              <div className="flex items-center gap-1.5"><Dumbbell size={15} className="text-cyberBlue" /><h2 className="text-xs font-black uppercase tracking-widest text-zinc-300">Routine</h2></div>
              <button onClick={() => { setCurrentView('routine-view'); setSelectedDay(todayId); }} className="p-1 bg-cyberBlue/20 hover:bg-cyberBlue/40 border border-cyberBlue/30 rounded-lg text-cyberBlue cursor-pointer"><HelpCircle size={14} /></button>
            </div>
            <div className="flex-1 overflow-y-auto pr-0.5 space-y-2 min-h-0 custom-scrollbar">
              {todayRoutines.map(item => (
                <div key={item.id} className="bg-zinc-950 p-2 rounded-xl border border-zinc-800 flex flex-col gap-1.5">
                  <span className="text-xs font-black text-zinc-300 truncate">{item.name}</span>
                  <div className="grid grid-cols-4 gap-1 items-center">
                    <input type="text" value={item.weight} placeholder="KG" onChange={(e) => handleRoutineDataChange(item.id, 'weight', e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-center text-cyberBlue py-0.5 rounded focus:outline-none placeholder-zinc-600" />
                    {item.sets.map((rep, sIdx) => (
                      <input key={sIdx} type="text" value={rep} placeholder={`S${sIdx + 1}`} onChange={(e) => handleRoutineDataChange(item.id, null, e.target.value, sIdx)} className="w-full bg-zinc-900 border border-zinc-800 text-[10px] text-center text-zinc-300 py-0.5 rounded focus:outline-none placeholder-zinc-600" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>

        <footer className="flex-shrink-0 mb-1">
          <button onClick={() => setCurrentView('analytics')} className="w-full py-3.5 px-6 rounded-2xl font-black text-sm uppercase tracking-widest text-white shadow-2xl flex items-center justify-center gap-2 relative overflow-hidden active:scale-[0.98] transition-transform cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-r from-deepRed via-purple-950 to-cyberBlue" />
            <span className="relative flex items-center gap-2"><BookOpen size={16} />Sổ theo dõi</span>
          </button>
        </footer>
      </div>
    );
  }

  // ==========================================
  // GIAO DIỆN ROUTINE VIEW & EDIT LIBRARY (CHẤN CHỈNH ỔN ĐỊNH)
  // ==========================================
  if (currentView === 'routine-view' || currentView === 'edit-library') {
    if (currentView === 'routine-view') {
      const targetDayRoutines = getRoutinesForDay(selectedDay);
      return (
        <div className="h-screen bg-background text-zinc-100 p-4 max-w-md mx-auto flex flex-col justify-between relative overflow-hidden select-none">
          <div>
            <header className="flex items-center justify-between mb-5 mt-2 flex-shrink-0"><div className="flex items-center gap-4"><button onClick={() => setCurrentView('home')} className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400"><ArrowLeft size={18} /></button><h2 className="text-base font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyberBlue to-zinc-400">Lịch Tập Các Thứ</h2></div><button onClick={() => setCurrentView('edit-library')} className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-400"><Wrench size={18} /></button></header>
            <section className="gradient-border rounded-2xl p-4 bg-cardBg/90 shadow-2xl h-[480px] overflow-y-auto custom-scrollbar">
              <div className="space-y-3">
                {targetDayRoutines.map(item => (
                  <div key={item.id} className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 flex flex-col gap-2.5">
                    <span className="text-xs font-black text-zinc-200">{item.name}</span>
                    <div className="grid grid-cols-4 gap-2 text-center font-mono">
                      <div className="bg-zinc-900 rounded-lg py-2 border border-zinc-800"><div className="text-[7px] text-zinc-600 font-bold">Mức Tạ</div><div className="text-xs font-black text-cyberBlue mt-0.5">{item.weight ? `${item.weight} kg` : '-'}</div></div>
                      {item.sets.map((rep, idx) => <div key={idx} className="bg-zinc-900/40 rounded-lg py-2"><div className="text-[7px] text-zinc-600">SET {idx+1}</div><div className="text-xs font-black text-zinc-400 mt-0.5">{rep || '-'}</div></div>)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
          <footer className="pt-2 border-t border-zinc-900 flex-shrink-0"><div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-1 flex justify-between">{DAYS_OF_WEEK.map(day => (<button key={day.id} onClick={() => setSelectedDay(day.id)} className={`flex-1 py-2 text-center rounded-lg text-[10px] font-black ${selectedDay === day.id ? 'bg-gradient-to-br from-deepRed to-red-800 text-white font-black scale-105' : 'text-zinc-500'}`}>{day.label}</button>))}</div></footer>
        </div>
      );
    }

    if (currentView === 'edit-library') {
      return (
        <div className="h-screen bg-background text-zinc-100 p-5 max-w-md mx-auto flex flex-col justify-between relative overflow-hidden select-none animate-in slide-in-from-right duration-300">
          <div className="flex flex-col flex-1 min-h-0">
            <header className="flex items-center justify-between mb-5 mt-2 flex-shrink-0"><div className="flex items-center gap-4"><button onClick={() => setCurrentView('routine-view')} className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400"><ArrowLeft size={18} /></button><h2 className="text-base font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-zinc-400">Quản Lý & Sửa Bài</h2></div><button onClick={() => setIsCustomExerciseModalOpen(true)} className="p-2 bg-gradient-to-br from-cyberBlue to-blue-700 text-white rounded-xl"><Plus size={18} /></button></header>
            <div className="relative mb-4 flex-shrink-0"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" size={14} /><input type="text" placeholder="Tìm bài tập trong kho..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-xs" /></div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-0.5 min-h-0 custom-scrollbar mb-2">
              {EXERCISE_CATEGORIES.map(cat => {
                const filtered = exerciseLibrary.filter(ex => ex.category === cat && ex.name.toLowerCase().includes(searchQuery.toLowerCase()));
                if (filtered.length === 0) return null;
                return (
                  <div key={cat} className="space-y-1.5">
                    <h3 className="text-[9px] font-black text-cyberBlue uppercase tracking-widest pl-1">{cat}</h3>
                    <div className="grid gap-2">
                      {filtered.map(ex => {
                        const isDayActive = (weeklyRoutineConfig[selectedDay] || []).includes(ex.id);
                        return (
                          <div key={ex.id} onClick={() => toggleExerciseForDay(ex.id)} className={`w-full flex items-center justify-between p-3 rounded-xl border text-left cursor-pointer transition-all ${isDayActive ? 'bg-cyberBlue/10 border-cyberBlue/40 shadow-md' : 'bg-zinc-900/40 border-zinc-800/60 hover:border-zinc-700'}`}>
                            <span className="text-xs font-bold">{ex.name}</span>
                            <div className="flex items-center gap-3"><button onClick={(e) => handleDeleteExerciseFromLibrary(ex.id, e)} className="p-1.5 bg-zinc-950 border border-zinc-800 text-zinc-600 hover:text-red-400 rounded-lg"><Trash2 size={13} /></button><div className={isDayActive ? 'text-cyberBlue' : 'text-zinc-800'}><CheckCircle2 size={18} fill={isDayActive ? 'currentColor' : 'none'} strokeWidth={1.5} /></div></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }
  }

  // ==========================================
  // GIAO DIỆN 4: TRANG SỔ THEO DÕI (ANALYTICS VIEW) - DYNAMIC BMI COLOR & MONTHLY CHART
  // ==========================================
  return (
    <div className="h-screen bg-background text-zinc-100 p-4 max-w-md mx-auto flex flex-col justify-between relative overflow-hidden select-none animate-in slide-in-from-bottom duration-300">
      <div className="absolute top-[-10%] left-[-20%] w-72 h-72 bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="flex flex-col flex-1 min-h-0">
        <header className="flex items-center gap-4 mb-4 mt-2 flex-shrink-0">
          <button onClick={() => setCurrentView('home')} className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-all cursor-pointer"><ArrowLeft size={18} /></button>
          <div>
            <h2 className="text-base font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-zinc-400">Sổ Theo Dõi</h2>
            <span className="text-[9px] text-zinc-500 font-bold uppercase block mt-0.5">Phân tích chỉ số cơ thể & tập luyện</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pr-0.5 space-y-4 min-h-0 custom-scrollbar mb-2">
          
          {/* MỤC 1: CHỈ SỐ CƠ THỂ PHÂN CHIA 4 Ô ĐỒNG BỘ */}
          <div className="gradient-border rounded-2xl p-3.5 bg-cardBg/90 flex flex-col gap-3 shadow-xl">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 border-b border-zinc-800/80 pb-2">
              <Scale size={14} className="text-deepRed" /> Chỉ số hình thể & Cân nặng
            </span>

            <div className="grid grid-cols-2 gap-2 text-center">
              {/* Ô 1: CÂN NẶNG BAN ĐẦU - ĐÃ MỞ KHÓA CHO PHÉP ĐIỀU CHỈNH ĐỂ DÙNG NHIỀU NGƯỜI */}
              <div className="bg-zinc-950 p-2 rounded-xl border border-zinc-900 flex flex-col items-center justify-center">
                <span className="text-[8px] font-black text-zinc-500 uppercase">Cân Ban Đầu</span>
                <div className="flex items-center gap-0.5 mt-1">
                  <input type="text" value={initialWeight} onChange={(e) => setInitialWeight(e.target.value)} className="w-12 bg-zinc-900 border border-zinc-800 rounded text-center text-sm font-mono font-black text-zinc-400 py-0.5 focus:border-zinc-700" />
                  <span className="text-[8px] text-zinc-600 font-mono">KG</span>
                </div>
              </div>

              {/* Ô 2: CÂN NẶNG HIỆN TẠI */}
              <div className="bg-zinc-950 p-2 rounded-xl border border-deepRed/20 flex flex-col items-center justify-center">
                <span className="text-[8px] font-black text-deepRed uppercase">Cân Hiện Tại</span>
                <div className="flex items-center gap-0.5 mt-1">
                  <input type="text" value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)} className="w-12 bg-zinc-900 border border-zinc-800 rounded text-center text-sm font-mono font-black text-white py-0.5 focus:border-deepRed" />
                  <span className="text-[8px] text-zinc-500 font-mono">KG</span>
                </div>
              </div>

              {/* Ô 3: CHIỀU CAO */}
              <div className="bg-zinc-950 p-2 rounded-xl border border-purple-500/20 flex flex-col items-center justify-center">
                <span className="text-[8px] font-black text-purple-400 uppercase">Chiều Cao</span>
                <div className="flex items-center gap-0.5 mt-1">
                  <input type="text" value={userHeight} onChange={(e) => setUserHeight(e.target.value)} className="w-12 bg-zinc-900 border border-zinc-800 rounded text-center text-sm font-mono font-black text-white py-0.5 focus:border-purple-500" />
                  <span className="text-[8px] text-zinc-500 font-mono">CM</span>
                </div>
              </div>

              {/* Ô 4: CHỈ SỐ BMI DYNAMIC TỰ THAY ĐỔI MÀU SẮC THEO ĐIỀU KIỆN CHUẨN */}
              <div className="bg-zinc-950 p-2 rounded-xl border border-zinc-900 flex flex-col items-center justify-center relative">
                <span className="text-[8px] font-black text-zinc-400 uppercase">Chỉ Số BMI</span>
                <span className={`text-sm font-mono font-black mt-1 ${bmiInfo.colorBg}`}>{bmiScore}</span>
                <span className={`text-[7px] font-bold uppercase mt-0.5 block ${bmiInfo.labelColor}`}>{bmiInfo.label}</span>
              </div>
            </div>

            {/* BIỂU ĐỒ THEO DÕI CÂN NẶNG TỪNG THÁNG TRONG NĂM */}
            <div className="w-full h-20 mt-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MONTHLY_WEIGHT_DATA}>
                  <XAxis dataKey="month" tick={{fontSize: 7, fill: '#52525b'}} stroke="#27272a" />
                  <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', fontSize: 10 }} />
                  <Line type="monotone" dataKey="weight" stroke="#7f1d1d" strokeWidth={2.5} dot={{ fill: '#7f1d1d', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* MỤC 2: KHỐI HIỂN THỊ TDEE BIẾN THIÊN THEO LỊCH TẬP */}
          <div className="gradient-border rounded-2xl p-3.5 bg-gradient-to-br from-cardBg via-zinc-950 to-zinc-900 border border-amber-500/20 shadow-xl flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5 border-b border-zinc-800/80 pb-2">
              <Zap size={14} className="text-amber-400 animate-pulse" /> Dự kiến Calo cần nạp (TDEE Dynamic)
            </span>
            <div className="grid grid-cols-2 gap-3 mt-1 text-center">
              <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-900">
                <div className="text-[8px] font-bold text-zinc-500 uppercase">Hôm nay thực tế</div>
                <div className="text-lg font-mono font-black text-amber-400 mt-1">{todayTDEE} <span className="text-[9px] text-zinc-500 font-normal">kcal</span></div>
              </div>
              <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-900">
                <div className="text-[8px] font-bold text-zinc-500 uppercase">Thứ đang xem lịch</div>
                <div className="text-lg font-mono font-black text-zinc-300 mt-1">{selectedDayTDEE} <span className="text-[9px] text-zinc-500 font-normal">kcal</span></div>
              </div>
            </div>
          </div>

          {/* MỤC 3: BIỂU ĐỒ TẬP LUYỆN VOLUME */}
          <div className="gradient-border rounded-2xl p-3.5 bg-cardBg/90 flex flex-col gap-2 shadow-xl">
            <span className="text-[10px] font-black uppercase text-zinc-400 flex items-center gap-1.5 border-b border-zinc-800 pb-2"><ChartIcon size={14} className="text-cyberBlue" /> Biểu đồ tập luyện (Volume/Ngày)</span>
            <div className="w-full h-28 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={WORKOUT_VOLUME_DATA}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0066ff" stopOpacity={0.3}/><stop offset="95%" stopColor="#0066ff" stopOpacity={0}/></linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{fontSize: 8, fill: '#52525b'}} stroke="#27272a" />
                  <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', fontSize: 10 }} />
                  <Area type="monotone" dataKey="volume" stroke="#0066ff" strokeWidth={2} fillOpacity={1} fill="url(#colorVolume)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* MỤC 4: PROGRESSIVE OVERLOAD */}
          <div className="gradient-border rounded-2xl p-3.5 bg-cardBg/90 flex flex-col gap-2 shadow-xl">
            <span className="text-[10px] font-black uppercase text-zinc-400 flex items-center gap-1.5 border-b border-zinc-800 pb-2"><TrendingUp size={14} className="text-purple-500" /> Progressive Overload (Benchpress tạ tăng tiến)</span>
            <div className="w-full h-28 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={PROGRESSIVE_OVERLOAD_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                  <XAxis dataKey="week" tick={{fontSize: 8, fill: '#52525b'}} stroke="#27272a" />
                  <YAxis domain={[40, 70]} tick={{fontSize: 8, fill: '#52525b'}} stroke="#27272a" />
                  <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', fontSize: 10 }} />
                  <Line type="linear" dataKey="weight" stroke="#a855f7" strokeWidth={3} dot={{ fill: '#a855f7', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
}