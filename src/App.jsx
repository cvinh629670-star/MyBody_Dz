import React, { useState, useEffect } from 'react';
import { Dumbbell, Utensils, BookOpen, Calendar, Plus, HelpCircle, X, Scale, LineChart as ChartIcon, TrendingUp, Zap, ChevronLeft, ChevronRight, Edit3, ArrowLeft } from 'lucide-react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

// --- KHO QUOTE TRUYỀN ĐỘNG LỰC ---
const DISCIPLINE_QUOTES = [
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "What hurts today makes you stronger tomorrow.", author: "Jay Cutler" },
  { text: "Suffering is temporary. Regret lasts forever.", author: "Arnold Schwarzenegger" },
  { text: "Success isn't always about greatness. It's about consistency.", author: "Dwayne Johnson" }
];

// --- THƯ VIỆN BÀI TẬP GỐC ---
const INITIAL_EXERCISE_LIBRARY = [
  { id: 'bp', name: 'Benchpress', category: 'Ngực' },
  { id: 'pu', name: 'Push-up', category: 'Ngực' },
  { id: 'sq', name: 'Squat', category: 'Chân' },
  { id: 'dl', name: 'Deadlift', category: 'Lưng' },
  { id: 'op', name: 'Overhead Press', category: 'Vai' },
  { id: 'bc', name: 'Bicep Curl', category: 'Tay Trước' },
  { id: 'te', name: 'Tricep Extension', category: 'Tay Sau' },
  { id: 'pl', name: 'Plank', category: 'Bụng' },
  { id: 'wcr', name: 'Wrist Curl', category: 'Cẳng Tay' },
];

const DAYS_OF_WEEK = [
  { id: 'Mon', label: 'Thứ Hai' }, 
  { id: 'Tue', label: 'Thứ Ba' }, 
  { id: 'Wed', label: 'Thứ Tư' },
  { id: 'Thu', label: 'Thứ Năm' }, 
  { id: 'Fri', label: 'Thứ Sáu' }, 
  { id: 'Sat', label: 'Thứ Bảy' }, 
  { id: 'Sun', label: 'Chủ Nhật' }
];

// HÀM CHUYỂN ĐỔI ID NGÀY HỆ THỐNG SANG TEXT TIẾNG VIỆT CHUẨN
const getVietnameseDayLabel = (dayId) => {
  const found = DAYS_OF_WEEK.find(d => d.id === dayId);
  return found ? found.label : dayId;
};

// --- ĐÃ THÊM: HÀM ĐỔI MÀU NỀN TAG THEO TỪNG NHÓM CƠ ĐẶC TRƯNG ---
const getMuscleTagClass = (category) => {
  switch (category) {
    case 'Ngực':
      return 'bg-red-600 text-white';
    case 'Lưng':
      return 'bg-emerald-600 text-white';
    case 'Vai':
      return 'bg-blue-600 text-white';
    case 'Tay Trước':
      return 'bg-purple-600 text-white';
    case 'Tay Sau':
      return 'bg-pink-500 text-white';
    case 'Chân':
      return 'bg-orange-500 text-white';
    case 'Bụng':
      return 'bg-cyan-600 text-white';
    case 'Cẳng Tay':
      return 'bg-amber-600 text-white';
    default:
      return 'bg-zinc-700 text-zinc-200';
  }
};

const generateEmptyTwelveMonths = (year) => {
  const shortYear = year.toString().slice(-2);
  return [
    { id: 0, month: 'Tháng 1', label: `Th1/${shortYear}`, weight: null },
    { id: 1, month: 'Tháng 2', label: `Th2/${shortYear}`, weight: null },
    { id: 2, month: 'Tháng 3', label: `Th3/${shortYear}`, weight: null },
    { id: 3, month: 'Tháng 4', label: `Th4/${shortYear}`, weight: null },
    { id: 4, month: 'Tháng 5', label: `Th5/${shortYear}`, weight: null },
    { id: 5, month: 'Tháng 6', label: `Th6/${shortYear}`, weight: null },
    { id: 6, month: 'Tháng 7', label: `Th7/${shortYear}`, weight: null },
    { id: 7, month: 'Tháng 8', label: `Th8/${shortYear}`, weight: null },
    { id: 8, month: 'Tháng 9', label: `Th9/${shortYear}`, weight: null },
    { id: 9, month: 'Tháng 10', label: `Th10/${shortYear}`, weight: null },
    { id: 10, month: 'Tháng 11', label: `Th11/${shortYear}`, weight: null },
    { id: 11, month: 'Tháng 12', label: `Th12/${shortYear}`, weight: null }
  ];
};

export default function App() {
  const todayId = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];

  // ---- ĐIỀU HƯỚNG GIAO DIỆN ----
  const [currentView, setCurrentView] = useState('home'); 
  const [selectedDay, setSelectedDay] = useState(todayId); 
  const [currentQuote, setCurrentQuote] = useState({ text: "Train hard, eat clean.", author: "Dz" });
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);

  // ---- STATE QUẢN LÝ BIỂU ĐỒ ----
  const [selectedChartYear, setSelectedChartYear] = useState("2026");
  const [selectedOverloadYear, setSelectedOverloadYear] = useState("2026");
  const [selectedOverloadExercise, setSelectedOverloadExercise] = useState("bp");

  const [isEditWeightModalOpen, setIsEditWeightModalOpen] = useState(false);
  const [isEditOverloadModalOpen, setIsEditOverloadModalOpen] = useState(false);

  // ---- STATE HÌNH THỂ ----
  const [initialWeight, setInitialWeight] = useState(() => localStorage.getItem('mybody_initial_weight') || '0'); 
  const [currentWeight, setCurrentWeight] = useState(() => localStorage.getItem('mybody_user_weight') || '0');
  const [userHeight, setUserHeight] = useState(() => localStorage.getItem('mybody_user_height') || '0'); 

  const [weightHistoryData, setWeightHistoryData] = useState(() => {
    try {
      const saved = localStorage.getItem('mybody_multi_year_weight_data');
      return saved ? JSON.parse(saved) : {
        "2025": generateEmptyTwelveMonths(2025),
        "2026": generateEmptyTwelveMonths(2026)
      };
    } catch {
      return { "2025": generateEmptyTwelveMonths(2025), "2026": generateEmptyTwelveMonths(2026) };
    }
  });

  const [overloadHistoryData, setOverloadHistoryData] = useState(() => {
    try {
      const saved = localStorage.getItem('mybody_overload_history_data_v3');
      return saved ? JSON.parse(saved) : {
        "bp": { "2026": generateEmptyTwelveMonths(2026) },
        "sq": { "2026": generateEmptyTwelveMonths(2026) },
        "dl": { "2026": generateEmptyTwelveMonths(2026) },
        "op": { "2026": generateEmptyTwelveMonths(2026) }
      };
    } catch {
      return {};
    }
  });

  const [tempWeightList, setTempWeightList] = useState([]);
  const [tempOverloadList, setTempOverloadList] = useState([]);

  // ---- STATE MEALS & ROUTINES ----
  const [customFoodDb, setCustomFoodDb] = useState(() => {
    try {
      const saved = localStorage.getItem('mybody_food_db');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [meals, setMeals] = useState(() => {
    try {
      const saved = localStorage.getItem('mybody_meals_today_v6');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [exerciseLibrary, setExerciseLibrary] = useState(() => {
    try {
      const saved = localStorage.getItem('mybody_exercise_library');
      return saved ? JSON.parse(saved) : INITIAL_EXERCISE_LIBRARY;
    } catch {
      return INITIAL_EXERCISE_LIBRARY;
    }
  });
  
  const [weeklyRoutineConfig, setWeeklyRoutineConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('mybody_weekly_config_v2');
      return saved ? JSON.parse(saved) : { 
        Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: []                 
      };
    } catch {
      return { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [] };
    }
  });

  const [routinesData, setRoutinesData] = useState(() => {
    try {
      const saved = localStorage.getItem('mybody_routines_data_v7');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [newMeal, setNewMeal] = useState({ name: '', calo: '', protein: '', fat: '', carb: '' });
  const [newExercise, setNewExercise] = useState({ name: '', category: 'Ngực' });

  // ---- ĐỒNG BỘ DỮ LIỆU ----
  useEffect(() => { localStorage.setItem('mybody_food_db', JSON.stringify(customFoodDb)); }, [customFoodDb]);
  useEffect(() => { localStorage.setItem('mybody_meals_today_v6', JSON.stringify(meals)); }, [meals]);
  useEffect(() => { localStorage.setItem('mybody_user_weight', currentWeight); }, [currentWeight]);
  useEffect(() => { localStorage.setItem('mybody_user_height', userHeight); }, [userHeight]);
  useEffect(() => { localStorage.setItem('mybody_initial_weight', initialWeight); }, [initialWeight]);
  useEffect(() => { localStorage.setItem('mybody_multi_year_weight_data', JSON.stringify(weightHistoryData)); }, [weightHistoryData]);
  useEffect(() => { localStorage.setItem('mybody_overload_history_data_v3', JSON.stringify(overloadHistoryData)); }, [overloadHistoryData]);
  useEffect(() => { localStorage.setItem('mybody_routines_data_v7', JSON.stringify(routinesData)); }, [routinesData]);
  useEffect(() => { localStorage.setItem('mybody_exercise_library', JSON.stringify(exerciseLibrary)); }, [exerciseLibrary]);
  useEffect(() => { localStorage.setItem('mybody_weekly_config_v2', JSON.stringify(weeklyRoutineConfig)); }, [weeklyRoutineConfig]);

  useEffect(() => {
    setCurrentQuote(DISCIPLINE_QUOTES[Math.floor(Math.random() * DISCIPLINE_QUOTES.length)]);
  }, []);

  const handleRoutineDataChange = (exerciseId, field, value, setIndex = null) => {
    setRoutinesData(prev => {
      const current = prev[exerciseId] || { weight: '0', sets: ['0', '0', '0'] };
      if (setIndex !== null) {
        const updatedSets = [...(current.sets || ['0', '0', '0'])];
        updatedSets[setIndex] = value;
        return { ...prev, [exerciseId]: { ...current, sets: updatedSets } };
      } else {
        return { ...prev, [exerciseId]: { ...current, [field]: value } };
      }
    });
  };

  // ---- LOGIC TÍNH TOÁN BMI ----
  const bmiScore = (Number(userHeight) > 0) ? Number((Number(currentWeight) / ((Number(userHeight)/100) * (Number(userHeight)/100))).toFixed(1)) : 0;
  const bmiInfo = ((bmi) => {
    if (bmi === 0) return { label: 'Chưa rõ', colorBg: 'text-zinc-400', labelColor: 'text-zinc-500' };
    if (bmi < 18.5) return { label: 'Quá gầy', colorBg: 'text-red-500', labelColor: 'text-red-500/90' };
    if (bmi >= 18.5 && bmi <= 22.9) return { label: 'Tốt', colorBg: 'text-green-500', labelColor: 'text-green-500/90' };
    if (bmi >= 23 && bmi <= 24.9) return { label: 'Thừa cân', colorBg: 'text-blue-400', labelColor: 'text-amber-500' }; 
    return { label: 'Béo phì', colorBg: 'text-red-500', labelColor: 'text-red-500/90' };
  })(bmiScore);

  const todayTDEE = Math.round(((10 * (Number(currentWeight)||60)) + (6.25 * (Number(userHeight)||170)) - (5 * 20) + 5) * ((weeklyRoutineConfig[todayId] || []).length === 0 ? 1.2 : 1.55));
  const targetProtein = (Number(currentWeight) * 2.2).toFixed(0);

  // ---- FOODS ----
  const totalMacros = meals.reduce((acc, curr) => ({
    calo: acc.calo + (curr.calo||0), protein: acc.protein + (curr.protein||0), fat: acc.fat + (curr.fat||0), carb: acc.carb + (curr.carb||0)
  }), { calo: 0, protein: 0, fat: 0, carb: 0 });

  const handleFoodNameChange = (e) => {
    const name = e.target.value;
    setNewMeal(prev => ({ ...prev, name }));
    const lower = name.toLowerCase().trim();
    if (customFoodDb[lower]) {
      const s = customFoodDb[lower];
      setNewMeal(prev => ({ ...prev, calo: s.calo, protein: s.protein, fat: s.fat, carb: s.carb }));
    }
  };

  const handleAddMeal = (e) => {
    e.preventDefault();
    if (!newMeal.name.trim()) return;
    const n = newMeal.name.trim();
    const mealObj = { id: Date.now(), name: n, calo: Number(newMeal.calo)||0, protein: Number(newMeal.protein)||0, fat: Number(newMeal.fat)||0, carb: Number(newMeal.carb)||0 };
    setMeals(prev => [...prev, mealObj]);
    if (!customFoodDb[n.toLowerCase()]) {
      setCustomFoodDb(prev => ({ ...prev, [n.toLowerCase()]: { calo: mealObj.calo, protein: mealObj.protein, fat: mealObj.fat, carb: mealObj.carb } }));
    }
    setNewMeal({ name: '', calo: '', protein: '', fat: '', carb: '' });
    setIsMealModalOpen(false);
  };

  const getRoutinesForDay = (dayId) => {
    return (weeklyRoutineConfig[dayId] || []).map(id => {
      const foundEx = exerciseLibrary.find(e => e.id === id) || { name: 'Bài tập', category: 'Chưa rõ' };
      return {
        id,
        name: foundEx.name,
        category: foundEx.category,
        ...(routinesData[id] || { weight: '', sets: ['', '', ''] })
      };
    });
  };

  const handleCreateExercise = (e) => {
    e.preventDefault();
    if (!newExercise.name.trim()) return;
    const uniqueId = 'ex_' + Date.now();
    const newExObj = { id: uniqueId, name: newExercise.name.trim(), category: newExercise.category };
    
    setExerciseLibrary(prev => [...prev, newExObj]);
    setWeeklyRoutineConfig(prev => ({ ...prev, [selectedDay]: [...(prev[selectedDay] || []), uniqueId] }));
    setRoutinesData(prev => ({ ...prev, [uniqueId]: { weight: '0', sets: ['10', '10', '10'] } }));
    
    setNewExercise({ name: '', category: 'Ngực' });
    setIsAddExerciseModalOpen(false);
  };

  const calculateMuscleVolumeData = () => {
    const muscleGroups = { 'Ngực': 0, 'Vai': 0, 'Tay Sau': 0, 'Lưng': 0, 'Tay Trước': 0, 'Chân': 0, 'Bụng': 0, 'Cẳng Tay': 0 };
    try {
      Object.keys(weeklyRoutineConfig).forEach(day => {
        const exerciseIds = weeklyRoutineConfig[day] || [];
        exerciseIds.forEach(id => {
          const exercise = exerciseLibrary.find(e => e.id === id);
          if (exercise && muscleGroups[exercise.category] !== undefined) {
            const stats = routinesData[id] || { weight: '0', sets: ['0', '0', '0'] };
            
            const safeSets = Array.isArray(stats.sets) ? stats.sets : [];
            const totalReps = safeSets.reduce((sum, rep) => {
              const repNum = parseInt(rep, 10);
              return sum + (isNaN(repNum) ? 0 : repNum);
            }, 0);
            
            muscleGroups[exercise.category] += totalReps;
          }
        });
      });
    } catch (err) {
      console.error("Lỗi tính tổng số Reps tuần: ", err);
    }
    return Object.keys(muscleGroups).map(key => ({ muscle: key, volume: muscleGroups[key] }));
  };

  const muscleVolumeDataset = calculateMuscleVolumeData();

  const openWeightEditModal = () => {
    setTempWeightList([...(weightHistoryData[selectedChartYear] || generateEmptyTwelveMonths(Number(selectedChartYear)))]);
    setIsEditWeightModalOpen(true);
  };
  const saveWeightHistory = () => {
    setWeightHistoryData(prev => ({ ...prev, [selectedChartYear]: tempWeightList }));
    setIsEditWeightModalOpen(false);
  };

  const currentOverloadDataset = () => {
    const exData = overloadHistoryData[selectedOverloadExercise] || {};
    return exData[selectedOverloadYear] || generateEmptyTwelveMonths(Number(selectedOverloadYear));
  };
  const openOverloadEditModal = () => {
    setTempOverloadList([...currentOverloadDataset()]);
    setIsEditOverloadModalOpen(true);
  };
  const saveOverloadHistory = () => {
    setOverloadHistoryData(prev => ({
      ...prev, [selectedOverloadExercise]: { ...(prev[selectedOverloadExercise] || {}), [selectedOverloadYear]: tempOverloadList }
    }));
    setIsEditOverloadModalOpen(false);
  };

  // ==========================================
  // VIEW TRANG CHỦ
  // ==========================================
  if (currentView === 'home') {
    return (
      <div className="h-screen bg-background text-zinc-100 flex flex-col p-4 max-w-md mx-auto relative overflow-hidden select-none">
        <div className="absolute top-[-10%] left-[-20%] w-72 h-72 bg-deepRed/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[-20%] w-72 h-72 bg-cyberBlue/15 rounded-full blur-[120px] pointer-events-none" />

        <header className="flex justify-between items-start mb-4 flex-shrink-0">
          <div>
            <h1 className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">MyBody_Dz</h1>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-1 font-semibold">
              <Calendar size={13} className="text-cyberBlue" />
              <span>Hôm nay: {getVietnameseDayLabel(todayId)}</span>
            </div>
          </div>
          <div className="bg-cardBg/90 border border-zinc-800/80 rounded-xl p-3 max-w-[180px] shadow-lg">
            <p className="text-[11px] italic font-medium text-zinc-300 leading-tight">"{currentQuote.text}"</p>
            <span className="text-[9px] text-cyberBlue font-bold block mt-1 text-right">- {currentQuote.author} -</span>
          </div>
        </header>

        <main className="grid grid-cols-2 gap-3 flex-1 min-h-0 items-stretch mb-4">
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
                    <span>P:{(meal.protein||0)}g</span><span>F:{(meal.fat||0)}g</span><span>C:{(meal.carb||0)}g</span>
                  </div>
                </div>
              ))}
              {meals.length === 0 && (
                <p className="text-[10px] text-zinc-600 text-center pt-8 italic">Chưa có món ăn nào...</p>
              )}
            </div>
            <div className="flex-shrink-0 pt-2 border-t border-zinc-800/80 flex flex-col gap-1.5 bg-zinc-950/40 p-2 rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider flex items-center gap-1">Total</span>
                <span className="text-xs font-black text-deepRed font-mono">{totalMacros.calo} kcal</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-center text-[9px] font-mono border-t border-zinc-900/60 pt-1.5">
                <div className="bg-zinc-900/60 py-0.5 rounded border border-zinc-800/50"><div className="text-zinc-400 font-bold">P: {totalMacros.protein}g</div></div>
                <div className="bg-zinc-900/60 py-0.5 rounded border border-zinc-800/50"><div className="text-zinc-300 font-bold">F: {totalMacros.fat}g</div></div>
                <div className="bg-zinc-900/60 py-0.5 rounded border border-zinc-800/50"><div className="text-zinc-300 font-bold">C: {totalMacros.carb}g</div></div>
              </div>
            </div>
          </section>

          <section className="gradient-border rounded-2xl p-3 flex flex-col bg-cardBg/90 shadow-2xl min-h-0">
            <div className="flex items-center justify-between mb-3 border-b border-zinc-800/80 pb-2 flex-shrink-0">
              <div className="flex items-center gap-1.5"><Dumbbell size={15} className="text-cyberBlue" /><h2 className="text-xs font-black uppercase tracking-widest text-zinc-300">Routine</h2></div>
              <button onClick={() => setCurrentView('routine-view')} className="p-1 bg-cyberBlue/20 hover:bg-cyberBlue/40 border border-cyberBlue/30 rounded-lg text-cyberBlue cursor-pointer"><HelpCircle size={14} /></button>
            </div>
            <div className="flex-1 overflow-y-auto pr-0.5 space-y-2 min-h-0 custom-scrollbar">
              {getRoutinesForDay(todayId).map(item => (
                <div key={item.id} className="bg-zinc-950 p-2 rounded-xl border border-zinc-800 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-xs font-black text-zinc-300 truncate">{item.name}</span>
                    {/* CẬP NHẬT: TAG ĐỔI MÀU THEO NHÓM CƠ Ở TRANG CHỦ */}
                    <span className={`text-[7.5px] font-black uppercase px-1.5 py-0.5 rounded-md flex-shrink-0 tracking-wider shadow-sm ${getMuscleTagClass(item.category)}`}>
                      {item.category}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[7px] text-zinc-500 font-black uppercase">Tạ</span>
                      <input type="text" value={item.weight} placeholder="KG" onChange={(e) => handleRoutineDataChange(item.id, 'weight', e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-center text-cyberBlue py-0.5 rounded focus:outline-none" />
                    </div>
                    {(item.sets || []).map((rep, sIdx) => (
                      <div key={sIdx} className="flex flex-col items-center gap-0.5">
                        <span className="text-[7px] text-zinc-500 font-bold uppercase">S{sIdx + 1}</span>
                        <input type="text" value={rep} placeholder={`S${sIdx + 1}`} onChange={(e) => handleRoutineDataChange(item.id, null, e.target.value, sIdx)} className="w-full bg-zinc-900 border border-zinc-800 text-[10px] text-center text-zinc-300 py-0.5 rounded focus:outline-none" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {getRoutinesForDay(todayId).length === 0 && (
                <p className="text-[10px] text-zinc-600 text-center pt-8 italic">Hôm nay trống lịch tập...</p>
              )}
            </div>
          </section>
        </main>

        <footer className="flex-shrink-0 mb-1">
          <button onClick={() => setCurrentView('analytics')} className="w-full py-3.5 px-6 rounded-2xl font-black text-sm uppercase tracking-widest text-white shadow-2xl flex items-center justify-center gap-2 relative overflow-hidden active:scale-[0.98] transition-transform cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-r from-deepRed via-purple-950 to-cyberBlue" />
            <span className="relative flex items-center gap-2"><BookOpen size={16} />Sổ theo dõi</span>
          </button>
        </footer>

        {isMealModalOpen && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <form onSubmit={handleAddMeal} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center"><h3 className="text-xs font-black uppercase text-deepRed">Thêm món ăn nhanh</h3><button type="button" onClick={() => setIsMealModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={16} /></button></div>
              <input type="text" placeholder="Tên món..." value={newMeal.name} onChange={handleFoodNameChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-deepRed" required />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Calories</label>
                  <input type="number" value={newMeal.calo} onChange={e=>setNewMeal(p=>({...p,calo:e.target.value}))} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-center font-mono focus:outline-none focus:border-deepRed" required />
                </div>
                <div>
                  <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Protein (g)</label>
                  <input type="number" value={newMeal.protein} onChange={e=>setNewMeal(p=>({...p,protein:e.target.value}))} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-center font-mono focus:outline-none focus:border-deepRed" required />
                </div>
                <div>
                  <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Fat (g)</label>
                  <input type="number" value={newMeal.fat} onChange={e=>setNewMeal(p=>({...p,fat:e.target.value}))} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-center font-mono focus:outline-none focus:border-deepRed" />
                </div>
                <div>
                  <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Carb (g)</label>
                  <input type="number" value={newMeal.carb} onChange={e=>setNewMeal(p=>({...p,carb:e.target.value}))} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-center font-mono focus:outline-none focus:border-deepRed" />
                </div>
              </div>
              <button type="submit" className="w-full bg-deepRed text-white py-2.5 rounded-xl font-black text-xs uppercase tracking-wider mt-2">Xác nhận nạp</button>
            </form>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW LỊCH TẬP CÁC THỨ
  // ==========================================
  if (currentView === 'routine-view') {
    return (
      <div className="h-screen bg-background text-zinc-100 p-4 max-w-md mx-auto flex flex-col justify-between relative overflow-hidden select-none">
        <div className="flex flex-col flex-1 min-h-0">
          <header className="flex items-center justify-between mb-5 mt-2 flex-shrink-0">
            <div className="flex items-center gap-4">
              <button onClick={() => setCurrentView('home')} className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400"><ArrowLeft size={18} /></button>
              <h2 className="text-base font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyberBlue to-zinc-400">
                Lịch {getVietnameseDayLabel(selectedDay)}
              </h2>
            </div>
            <button onClick={() => setIsAddExerciseModalOpen(true)} className="p-2 bg-cyberBlue/20 hover:bg-cyberBlue/40 border border-cyberBlue/30 rounded-xl text-cyberBlue cursor-pointer flex items-center justify-center">
              <Plus size={16} strokeWidth={3} />
            </button>
          </header>

          <section className="gradient-border rounded-2xl p-4 bg-cardBg/90 shadow-2xl flex-1 overflow-y-auto custom-scrollbar mb-3 min-h-0">
            <div className="space-y-3">
              {getRoutinesForDay(selectedDay).map(item => (
                <div key={item.id} className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 flex flex-col gap-2.5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 max-w-[70%]">
                      <span className="text-xs font-black text-zinc-200 truncate">{item.name}</span>
                      <button onClick={() => setWeeklyRoutineConfig(p => ({ ...p, [selectedDay]: p[selectedDay].filter(id => id !== item.id) }))} className="text-zinc-600 hover:text-red-400 p-0.5 flex-shrink-0 transition-colors"><X size={13} /></button>
                    </div>
                    {/* CẬP NHẬT: TAG ĐỔI MÀU RIÊNG BIỆT THEO NHÓM CƠ Ở DANH SÁCH CHI TIẾT */}
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider shadow-md ${getMuscleTagClass(item.category)}`}>
                      {item.category}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center font-mono">
                    <div className="bg-zinc-900 rounded-lg py-2 border border-zinc-800"><div className="text-[7px] text-zinc-600 font-bold">Mức Tạ</div><div className="text-xs font-black text-cyberBlue mt-0.5">{item.weight ? `${item.weight} kg` : '-'}</div></div>
                    {(item.sets || []).map((rep, idx) => <div key={idx} className="bg-zinc-900/40 rounded-lg py-2"><div className="text-[7px] text-zinc-600">SET {idx+1}</div><div className="text-xs font-black text-zinc-400 mt-0.5">{rep || '-'}</div></div>)}
                  </div>
                </div>
              ))}
              {getRoutinesForDay(selectedDay).length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 py-20">
                  <Dumbbell size={32} className="text-zinc-700 mb-2 stroke-[1.5]" />
                  <p className="text-xs font-bold">Hôm nay trống bài tập!</p>
                  <p className="text-[10px] text-zinc-600 mt-0.5">Nhấn nút (+) ở góc phải để thiết lập lịch tập.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <footer className="pt-2 border-t border-zinc-900 flex-shrink-0">
          <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-1 flex justify-between gap-0.5">
            {DAYS_OF_WEEK.map(day => (
              <button 
                key={day.id} 
                onClick={() => setSelectedDay(day.id)} 
                className={`flex-1 py-2 text-center rounded-lg text-[9px] font-black tracking-tighter ${selectedDay === day.id ? 'bg-gradient-to-br from-deepRed to-red-800 text-white scale-105' : 'text-zinc-500'}`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </footer>

        {/* MODAL THÊM BÀI TẬP VÀO LỊCH */}
        {isAddExerciseModalOpen && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <form onSubmit={handleCreateExercise} className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                <h3 className="text-xs font-black uppercase text-cyberBlue">Thêm bài tập vào {getVietnameseDayLabel(selectedDay)}</h3>
                <button type="button" onClick={() => setIsAddExerciseModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={16} /></button>
              </div>
              <div>
                <label className="text-[9px] text-zinc-500 font-bold uppercase block mb-1">Tên bài tập</label>
                <input type="text" placeholder="Ví dụ: Incline Dumbbell Benchpress..." value={newExercise.name} onChange={e => setNewExercise(p => ({ ...p, name: e.target.value }))} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyberBlue" required />
              </div>
              <div>
                <label className="text-[9px] text-zinc-500 font-bold uppercase block mb-1">Nhóm cơ chính</label>
                <select value={newExercise.category} onChange={e => setNewExercise(p => ({ ...p, category: e.target.value }))} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-300 focus:outline-none">
                  <option value="Ngực">Ngực</option><option value="Vai">Vai</option><option value="Tay Sau">Tay Sau</option>
                  <option value="Lưng">Lưng</option><option value="Tay Trước">Tay Trước</option><option value="Chân">Chân</option>
                  <option value="Bụng">Bụng</option><option value="Cẳng Tay">Cẳng Tay</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-cyberBlue text-white py-2.5 rounded-xl font-black text-xs uppercase tracking-wider mt-2">Xác nhận thêm bài</button>
            </form>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW SỔ THEO DÕI (ANALYTICS)
  // ==========================================
  return (
    <div className="h-screen bg-background text-zinc-100 p-4 max-w-md mx-auto flex flex-col justify-between relative overflow-hidden select-none">
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
          
          <div className="gradient-border rounded-2xl p-3.5 bg-gradient-to-br from-cardBg via-zinc-950 to-zinc-900 border border-amber-500/20 shadow-xl flex flex-col gap-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5 border-b border-zinc-800/80 pb-2"><Zap size={14} className="text-amber-400" /> Cân bằng Dinh dưỡng Hiện Tại</span>
            <div className="space-y-2.5">
              <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-900 grid grid-cols-2 gap-4">
                <div className="text-center border-r border-zinc-900"><div className="text-[8px] font-black text-zinc-500 uppercase tracking-wider">Mục tiêu (TDEE)</div><div className="text-base font-mono font-black text-amber-400 mt-0.5">{todayTDEE} <span className="text-[8px] text-zinc-500 font-normal">kcal</span></div></div>
                <div className="text-center"><div className="text-[8px] font-black text-zinc-500 uppercase tracking-wider">Đã Nạp Hôm Nay</div><div className="text-base font-mono font-black text-orange-400 mt-0.5">{totalMacros.calo} <span className="text-[8px] text-zinc-500 font-normal">kcal</span></div></div>
              </div>
              <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-900 grid grid-cols-2 gap-4">
                <div className="text-center border-r border-zinc-900"><div className="text-[8px] font-black text-zinc-500 uppercase tracking-wider">Mục tiêu Protein</div><div className="text-base font-mono font-black text-emerald-400 mt-0.5">{targetProtein} <span className="text-[8px] text-zinc-500 font-normal">g</span></div></div>
                <div className="text-center"><div className="text-[8px] font-black text-zinc-500 uppercase tracking-wider">Đã Nạp Hôm Nay</div><div className="text-base font-mono font-black text-teal-400 mt-0.5">{totalMacros.protein} <span className="text-[8px] text-zinc-500 font-normal">g</span></div></div>
              </div>
            </div>
          </div>

          <div className="gradient-border rounded-2xl p-3.5 bg-cardBg/90 flex flex-col gap-3 shadow-xl">
            <div className="flex justify-between items-center border-b border-zinc-800/80 pb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5"><Scale size={14} className="text-deepRed" /> Lịch sử & Chỉ số hình thể</span>
              <button onClick={openWeightEditModal} className="p-1 px-2 bg-zinc-950 text-zinc-400 hover:text-deepRed border border-zinc-800 rounded-lg text-[9px] font-black uppercase flex items-center gap-1 cursor-pointer"><Edit3 size={10} /> Sửa số liệu</button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-zinc-950 p-2 rounded-xl border border-zinc-900 flex flex-col items-center justify-center"><span className="text-[8px] font-black text-zinc-500 uppercase">Cân Ban Đầu</span><div className="flex items-center gap-0.5 mt-1"><input type="text" value={initialWeight} onChange={(e) => setInitialWeight(e.target.value)} className="w-12 bg-zinc-900 border border-zinc-800 rounded text-center text-sm font-mono font-black text-zinc-400 py-0.5 focus:outline-none" /><span className="text-[8px] text-zinc-600 font-mono">KG</span></div></div>
              <div className="bg-zinc-950 p-2 rounded-xl border border-deepRed/20 flex flex-col items-center justify-center"><span className="text-[8px] font-black text-deepRed uppercase">Cân Hiện Tại</span><div className="flex items-center gap-0.5 mt-1"><input type="text" value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)} className="w-12 bg-zinc-900 border border-zinc-800 rounded text-center text-sm font-mono font-black text-white py-0.5 focus:outline-none" /><span className="text-[8px] text-zinc-500 font-mono">KG</span></div></div>
              <div className="bg-zinc-950 p-2 rounded-xl border border-purple-500/20 flex flex-col items-center justify-center"><span className="text-[8px] font-black text-purple-400 uppercase">Chiều Cao</span><div className="flex items-center gap-0.5 mt-1"><input type="text" value={userHeight} onChange={(e) => setUserHeight(e.target.value)} className="w-12 bg-zinc-900 border border-zinc-800 rounded text-center text-sm font-mono font-black text-white py-0.5 focus:outline-none" /><span className="text-[8px] text-zinc-500 font-mono">CM</span></div></div>
              <div className="bg-zinc-950 p-2 rounded-xl border border-zinc-900 flex flex-col items-center justify-center"><span className="text-[8px] font-black text-zinc-400 uppercase">Chỉ Số BMI</span><span className={`text-sm font-mono font-black mt-1 ${bmiInfo.colorBg}`}>{bmiScore}</span><span className={`text-[7px] font-bold uppercase mt-0.5 block ${bmiInfo.labelColor}`}>{bmiInfo.label}</span></div>
            </div>
            <div className="w-full h-28 mt-1 overflow-x-auto overflow-y-hidden custom-scrollbar">
              <div className="min-w-[440px] h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weightHistoryData[selectedChartYear] || generateEmptyTwelveMonths(Number(selectedChartYear))} margin={{ top: 10, right: 10, left: -35, bottom: 5 }}>
                    <defs><linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient></defs>
                    <XAxis dataKey="label" tick={{fontSize: 8, fill: '#a1a1aa', fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                    <YAxis domain={['dataMin - 3', 'dataMax + 3']} hide={true} />
                    <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', fontSize: 9 }} />
                    <Area type="monotone" dataKey="weight" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorWeight)" connectNulls={true} dot={{ fill: '#ef4444', r: 2.5 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="flex items-center justify-center gap-8 bg-zinc-950 py-1.5 rounded-xl border border-zinc-900/60">
              <button onClick={() => setSelectedChartYear((Number(selectedChartYear)-1).toString())} className="p-1 px-2 rounded-lg border border-zinc-800 text-zinc-400 cursor-pointer"><ChevronLeft size={14} strokeWidth={3} /></button>
              <span className="text-xs font-black font-mono tracking-widest text-zinc-200">Năm {selectedChartYear}</span>
              <button onClick={() => { const n = (Number(selectedChartYear)+1).toString(); if(!weightHistoryData[n]) { weightHistoryData[n] = generateEmptyTwelveMonths(Number(n)); } setSelectedChartYear(n); }} className="p-1 px-2 rounded-lg border border-zinc-800 text-zinc-400 cursor-pointer"><ChevronRight size={14} strokeWidth={3} /></button>
            </div>
          </div>

          <div className="gradient-border rounded-2xl p-3.5 bg-cardBg/90 flex flex-col gap-3 shadow-xl">
            <div className="flex flex-col gap-2 border-b border-zinc-800 pb-2">
              <div className="flex justify-between items-center"><span className="text-[10px] font-black uppercase text-purple-400 flex items-center gap-1.5"><TrendingUp size={14} /> Thống kê Progressive Overload</span><button onClick={openOverloadEditModal} className="p-1 px-2 bg-zinc-950 text-zinc-400 hover:text-purple-400 border border-zinc-800 rounded-lg text-[9px] font-black uppercase flex items-center gap-1 cursor-pointer"><Edit3 size={10} /> Sửa số liệu tập</button></div>
              <select value={selectedOverloadExercise} onChange={(e) => setSelectedOverloadExercise(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-xs font-bold text-zinc-200 focus:outline-none">
                <option value="bp">🏋️ Ngực: Benchpress (Barbell)</option><option value="sq">🦵 Chân: Squat (Back Squat)</option><option value="dl">💪 Lưng: Deadlift (Conventional)</option><option value="op">✈️ Vai: Overhead Press (Military)</option>
              </select>
            </div>
            <div className="w-full h-28 overflow-x-auto overflow-y-hidden custom-scrollbar">
              <div className="min-w-[440px] h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={currentOverloadDataset()} margin={{ top: 10, right: 10, left: -35, bottom: 5 }}>
                    <defs><linearGradient id="colorOverload" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/><stop offset="95%" stopColor="#a855f7" stopOpacity={0}/></linearGradient></defs>
                    <XAxis dataKey="label" tick={{fontSize: 8, fill: '#a1a1aa', fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                    <YAxis domain={['dataMin - 10', 'dataMax + 10']} hide={true} />
                    <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', fontSize: 9 }} />
                    <Area type="monotone" dataKey="weight" stroke="#a855f7" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOverload)" connectNulls={true} dot={{ fill: '#a855f7', r: 2.5 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="flex items-center justify-center gap-8 bg-zinc-950 py-1.5 rounded-xl border border-zinc-900/60">
              <button onClick={() => setSelectedOverloadYear((Number(selectedOverloadYear)-1).toString())} className="p-1 px-2 rounded-lg border border-zinc-800 text-zinc-400 cursor-pointer"><ChevronLeft size={14} strokeWidth={3} /></button>
              <span className="text-xs font-black font-mono tracking-widest text-zinc-200">Năm {selectedOverloadYear}</span>
              <button onClick={() => setSelectedOverloadYear((Number(selectedOverloadYear)+1).toString())} className="p-1 px-2 rounded-lg border border-zinc-800 text-zinc-400 cursor-pointer"><ChevronRight size={14} strokeWidth={3} /></button>
            </div>
          </div>

          <div className="gradient-border rounded-2xl p-3.5 bg-cardBg/90 flex flex-col gap-2 shadow-xl">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <span className="text-[10px] font-black uppercase text-cyberBlue flex items-center gap-1.5">
                <ChartIcon size={14} className="text-cyberBlue" /> Biểu đồ hiệu suất tuần
              </span>
              <span className="text-[8px] font-bold text-zinc-500 lowercase tracking-wide bg-zinc-950 px-2 py-0.5 border border-zinc-900 rounded-md">
                (reps = tổng số reps trong tuần)
              </span>
            </div>
            
            <div className="w-full h-28 mt-2 overflow-x-auto overflow-y-hidden custom-scrollbar">
              <div className="min-w-[480px] h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={muscleVolumeDataset} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <XAxis dataKey="muscle" tick={{fontSize: 7.5, fill: '#a1a1aa', fontWeight: 'black'}} axisLine={false} tickLine={false} />
                    <YAxis hide={true} />
                    <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', fontSize: 10 }} />
                    <Bar dataKey="volume" name="Tổng Số Reps" fill="#0066ff" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* MODAL EDIT CÂN NẶNG */}
      {isEditWeightModalOpen && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3 h-[480px]">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2"><h3 className="text-xs font-black uppercase text-deepRed">Sửa cân nặng {selectedChartYear}</h3><button onClick={() => setIsEditWeightModalOpen(false)} className="text-zinc-500"><X size={16} /></button></div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {tempWeightList.map(item => (
                <div key={item.id} className="flex items-center justify-between bg-zinc-950 p-2 rounded-xl border border-zinc-900">
                  <span className="text-xs font-bold text-zinc-400">{item.month}</span>
                  <div className="flex items-center gap-1.5"><input type="number" step="0.1" value={item.weight || ''} placeholder="Trống" onChange={(e) => setTempWeightList(prev => prev.map(x => x.id === item.id ? { ...x, weight: e.target.value === '' ? '' : Number(e.target.value) } : x))} className="w-20 bg-zinc-900 border border-zinc-800 rounded-lg text-center font-mono text-xs py-1 text-white focus:outline-none" /><span className="text-[10px] text-zinc-600 font-mono">KG</span></div>
                </div>
              ))}
            </div>
            <button onClick={saveWeightHistory} className="w-full bg-deepRed text-white py-2.5 rounded-xl font-black text-xs uppercase">Lưu chỉ số</button>
          </div>
        </div>
      )}

      {/* MODAL EDIT OVERLOAD */}
      {isEditOverloadModalOpen && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3 h-[480px]">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2"><h3 className="text-xs font-black uppercase text-purple-400">Sửa mức tạ {selectedOverloadYear}</h3><button onClick={() => setIsEditOverloadModalOpen(false)} className="text-zinc-500"><X size={16} /></button></div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {tempOverloadList.map(item => (
                <div key={item.id} className="flex items-center justify-between bg-zinc-950 p-2 rounded-xl border border-zinc-900">
                  <span className="text-xs font-bold text-zinc-400">{item.month}</span>
                  <div className="flex items-center gap-1.5"><input type="number" step="0.5" value={item.weight || ''} placeholder="Trống" onChange={(e) => setTempOverloadList(prev => prev.map(x => x.id === item.id ? { ...x, weight: e.target.value === '' ? '' : Number(e.target.value) } : x))} className="w-20 bg-zinc-900 border border-zinc-800 rounded-lg text-center font-mono text-xs py-1 text-white focus:outline-none" /><span className="text-[10px] text-zinc-600 font-mono">KG</span></div>
                </div>
              ))}
            </div>
            <button onClick={saveOverloadHistory} className="w-full bg-purple-600 text-white py-2.5 rounded-xl font-black text-xs uppercase">Lưu số liệu</button>
          </div>
        </div>
      )}
    </div>
  );
}