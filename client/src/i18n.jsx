import { createContext, useContext, useState, useEffect } from "react";

const translations = {
  en: {
    // Navigation
    dashboard: "Dashboard",
    worlds: "Worlds",
    games: "Games",
    leaderboard: "Leaderboard",
    family: "Family",
    admin: "Admin",
    logout: "Logout",
    
    // Dashboard
    welcome: "Hi",
    learningJourney: "Here's how your learning journey is going.",
    playGame: "Play a game",
    exploreWorlds: "Explore Worlds",
    
    // Stats
    totalPoints: "Total Points",
    gamesPlayed: "Games Played",
    learningTime: "Learning Time",
    achievements: "Achievements",
    
    // Adaptive Learning
    adaptiveLearning: "Adaptive Learning",
    personalizedRecommendations: "Personalized recommendations for you",
    analyzingPatterns: "Analyzing your learning patterns...",
    performanceInsight: "Performance Insight",
    recommendedGames: "Recommended Games",
    learningTips: "Learning Tips",
    
    // Missions
    dailyWeeklyMissions: "Daily & Weekly Missions",
    completeMissions: "Complete missions to earn rewards!",
    dailyMissions: "Daily Missions",
    weeklyChallenges: "Weekly Challenges",
    
    // Rewards Shop
    rewardsShop: "Rewards Shop",
    spendCurrency: "Spend your currency on awesome rewards!",
    loadingRewardsShop: "Loading rewards shop...",
    purchase: "Purchase",
    owned: "Owned",
    notEnough: "Not enough",
    locked: "Locked",
    
    // Story Mode
    storyMode: "Story Mode",
    epicAdventure: "Embark on an epic learning adventure!",
    loadingStoryChapters: "Loading story chapters...",
    
    // Character Selection
    characterSelection: "Character Selection",
    chooseCompanion: "Choose your learning companion!",
    loadingCharacters: "Loading characters...",
    selectCharacter: "Select Character",
    currentlySelected: "Currently Selected",
    unlock: "Unlock",
    
    // Leaderboards
    leaderboards: "Leaderboards",
    competeWorldwide: "Compete with learners worldwide!",
    loadingLeaderboards: "Loading leaderboards...",
    weekly: "Weekly",
    monthly: "Monthly",
    allTime: "All Time",
    math: "Math",
    english: "English",
    science: "Science",
    space: "Space",
  },
  ar: {
    // Navigation
    dashboard: "لوحة التحكم",
    worlds: "العوالم",
    games: "الألعاب",
    leaderboard: "المتصدرون",
    family: "العائلة",
    admin: "المسؤول",
    logout: "تسجيل الخروج",
    
    // Dashboard
    welcome: "مرحباً",
    learningJourney: "إليك كيف تسير رحلتك التعليمية.",
    playGame: "العب لعبة",
    exploreWorlds: "استكشف العوالم",
    
    // Stats
    totalPoints: "إجمالي النقاط",
    gamesPlayed: "الألعاب الملعوبة",
    learningTime: "وقت التعلم",
    achievements: "الإنجازات",
    
    // Adaptive Learning
    adaptiveLearning: "التعلم التكيفي",
    personalizedRecommendations: "توصيات مخصصة لك",
    analyzingPatterns: "تحليل أنماط التعلم الخاصة بك...",
    performanceInsight: "رؤية الأداء",
    recommendedGames: "الألعاب الموصى بها",
    learningTips: "نصائح التعلم",
    
    // Missions
    dailyWeeklyMissions: "المهام اليومية والأسبوعية",
    completeMissions: "أكمل المهام لكسب المكافآت!",
    dailyMissions: "المهام اليومية",
    weeklyChallenges: "التحديات الأسبوعية",
    
    // Rewards Shop
    rewardsShop: "متجر المكافآت",
    spendCurrency: "أنفق عملاتك على مكافآت رائعة!",
    loadingRewardsShop: "جاري تحميل متجر المكافآت...",
    purchase: "شراء",
    owned: "ممتلك",
    notEnough: "غير كافي",
    locked: "مقفل",
    
    // Story Mode
    storyMode: "وضع القصة",
    epicAdventure: "انطلق في مغامرة تعليمية ملحمية!",
    loadingStoryChapters: "جاري تحميل فصول القصة...",
    
    // Character Selection
    characterSelection: "اختيار الشخصية",
    chooseCompanion: "اختر رفيقك التعليمي!",
    loadingCharacters: "جاري تحميل الشخصيات...",
    selectCharacter: "اختر الشخصية",
    currentlySelected: "محدد حالياً",
    unlock: "إلغاء القفل",
    
    // Leaderboards
    leaderboards: "المتصدرون",
    competeWorldwide: "نافس المتعلمين حول العالم!",
    loadingLeaderboards: "جاري تحميل المتصدرين...",
    weekly: "أسبوعي",
    monthly: "شهري",
    allTime: "كل الأوقات",
    math: "الرياضيات",
    english: "الإنجليزية",
    science: "العلوم",
    space: "الفضاء",
  },
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const saved = localStorage.getItem("kl_language");
    if (saved === "ar") {
      setLanguage("ar");
      document.documentElement.dir = "rtl";
      document.documentElement.lang = "ar";
    }
  }, []);

  const t = (key) => translations[language]?.[key] || key;

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("kl_language", lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
