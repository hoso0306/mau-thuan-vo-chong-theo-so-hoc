import React, { useState, useEffect } from "react";
import {
  Heart,
  Sparkles,
  Calendar,
  User,
  AlertCircle,
  RefreshCw,
  Flame,
  Scale,
  BookOpen,
  Compass,
  Smile,
  CheckCircle,
  Printer,
  ChevronRight,
  HelpCircle,
  MessageSquareHeart,
  UserCheck,
  Zap,
  Lock,
  HeartCrack
} from "lucide-react";
import { MarkdownViewer } from "./components/MarkdownViewer";
import {
  calcPythonNumerology,
  getLifePathTraits,
  getBasicCompatibilityScore
} from "./utils/numerology";

// Type definitions for cleaner code
interface ProfileData {
  fullName: string;
  birthDate: string;
  lifePath: number;
  destiny: number;
  soulUrge: number;
  personality: number;
  dayOfBirth: number;
  attitude: number;
  balance: number;
  personalYear: number;
  personalMonths: string[];
  innerFeels: number[];
  peaks: number[];
  challenges: number[];
  title: string;
  keywords: string[];
  description: string;
}

interface AnalysisResult {
  success: boolean;
  husbandProfile: ProfileData;
  wifeProfile: ProfileData;
  compatibilityScore: number;
  aiReport: string;
}

interface ReferenceStatus {
  initialized: boolean;
  byteSize?: number;
  wordCount?: number;
  fileName?: string;
}

interface ExampleCase {
  tag: string;
  description: string;
  husbandName: string;
  husbandDob: string;
  wifeName: string;
  wifeDob: string;
}

// Current year for dynamic display
const CURRENT_YEAR = new Date().getFullYear();

// Predefined illustrative spousal conflict cases to let users instantly experiment

const SAMPLE_COUPLES: ExampleCase[] = [
  {
    tag: "Tự Do vs Thực Tế",
    description: "Chồng số 5 phóng khoáng, thích bay nhảy - Vợ số 4 quy củ, kỷ luật nguyên tắc.",
    husbandName: "Nguyễn Hoàng Nam",
    husbandDob: "1991-05-18", // Life Path 7 or 5 depending on reduction, let's verify
    wifeName: "Phạm Minh Thư",
    wifeDob: "1994-08-22"
  },
  {
    tag: "Cái Tôi Lãnh Đạo",
    description: "Cả hai đều giữ số 1 và số 8 chủ đạo. Mâu thuẫn ai làm chủ cuộc chơi và tài chính.",
    husbandName: "Trần Thế Phong",
    husbandDob: "1988-10-10",
    wifeName: "Lê Quỳnh Chi",
    wifeDob: "1990-11-23"
  },
  {
    tag: "Khép Kín vs Nhạy Cảm",
    description: "Chồng số 7 thích cô độc cô lập - Vợ số 2 cần bầu bạn, chăm sóc từng li từng tí.",
    husbandName: "Vũ Hải Đăng",
    husbandDob: "1989-03-25",
    wifeName: "Đỗ Khánh Vy",
    wifeDob: "1993-12-14"
  },
  {
    tag: "Cống Hiến vs Bay Bổng",
    description: "Chồng số 6 ôm đồm gia đình - Vợ số 3 thích bay nhảy và nói năng bộc trực thương đau.",
    husbandName: "Phan Đình Dũng",
    husbandDob: "1987-09-06",
    wifeName: "Nguyễn Thảo Nguyên",
    wifeDob: "1992-06-12"
  }
];

export default function App() {
  // Husband State
  const [hName, setHName] = useState("");
  const [hDob, setHDob] = useState("");

  // Wife State
  const [wName, setWName] = useState("");
  const [wDob, setWDob] = useState("");

  // Live client-side calculated profiles
  const [hProfile, setHProfile] = useState<ProfileData | null>(null);
  const [wProfile, setWProfile] = useState<ProfileData | null>(null);
  const [currentScore, setCurrentScore] = useState<number>(0);

  // Analysis Result State
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<"ai" | "profile" | "advice">("ai");

  // Reference document status
  const [refStatus, setRefStatus] = useState<ReferenceStatus>({ initialized: false });

  useEffect(() => {
    fetch("/api/reference-status")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.initialized) {
          setRefStatus(data);
        }
      })
      .catch((err) => console.error("Error fetching reference status:", err));
  }, []);

  // Loading quotes cycle
  const loadingMessages = [
    "Đang phân tích thông tin ngày sinh và tính toán tần số sóng rung...",
    "Đang thiết lập bản đồ Số học Mặt Trời: Đường Đời, Sứ Mệnh, Nội Tâm của hai bạn...",
    "Gemini AI đang thấu cảm mâu thuẫn ẩn sâu và lập luận mối tương quan năng lượng...",
    "Đang đúc kết quy tắc hòa hợp giao tiếp và giải pháp tháo gỡ khắc khẩu cụ thể...",
    "Báo cáo trị liệu hôn nhân gia đình sắp hoàn tất..."
  ];

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [loading]);

  // Handle live instant calculations as user types/picks
  useEffect(() => {
    if (hName.trim() && hDob) {
      try {
        const res = calcPythonNumerology(hName, hDob);
        const traits = getLifePathTraits(res["Đường đời"]);
        setHProfile({
          fullName: hName,
          birthDate: hDob,
          lifePath: res["Đường đời"],
          destiny: res["Sứ mệnh"],
          soulUrge: res["Nội tâm"],
          personality: res["Tương tác"],
          dayOfBirth: res["Ngày sinh"],
          attitude: res["Thái độ"],
          balance: res["Cân bằng"],
          personalYear: res["Năm cá nhân"],
          personalMonths: res["Tháng cá nhân"],
          innerFeels: res["Nội cảm"],
          peaks: res["Đỉnh chặng"],
          challenges: res["Thách thức"],
          title: traits.title,
          keywords: traits.keywords,
          description: traits.description
        });
      } catch (err) {
        setHProfile(null);
      }
    } else {
      setHProfile(null);
    }
  }, [hName, hDob]);

  useEffect(() => {
    if (wName.trim() && wDob) {
      try {
        const res = calcPythonNumerology(wName, wDob);
        const traits = getLifePathTraits(res["Đường đời"]);
        setWProfile({
          fullName: wName,
          birthDate: wDob,
          lifePath: res["Đường đời"],
          destiny: res["Sứ mệnh"],
          soulUrge: res["Nội tâm"],
          personality: res["Tương tác"],
          dayOfBirth: res["Ngày sinh"],
          attitude: res["Thái độ"],
          balance: res["Cân bằng"],
          personalYear: res["Năm cá nhân"],
          personalMonths: res["Tháng cá nhân"],
          innerFeels: res["Nội cảm"],
          peaks: res["Đỉnh chặng"],
          challenges: res["Thách thức"],
          title: traits.title,
          keywords: traits.keywords,
          description: traits.description
        });
      } catch (err) {
        setWProfile(null);
      }
    } else {
      setWProfile(null);
    }
  }, [wName, wDob]);

  useEffect(() => {
    if (hProfile && wProfile) {
      const score = getBasicCompatibilityScore(hProfile.lifePath, wProfile.lifePath);
      setCurrentScore(score);
    } else {
      setCurrentScore(0);
    }
  }, [hProfile, wProfile]);

  // Apply example couple
  const handleApplyExample = (couple: ExampleCase) => {
    setHName(couple.husbandName);
    setHDob(couple.husbandDob);
    setWName(couple.wifeName);
    setWDob(couple.wifeDob);
    setError(null);
    setResult(null);
  };

  // Submit to Server for Gemini AI Analysis
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hName.trim() || !hDob || !wName.trim() || !wDob) {
      setError("Vui lòng điền đầy đủ họ và tên, ngày sinh của cả vợ và chồng.");
      return;
    }

    setLoading(true);
    setLoadingStep(0);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          husband: { fullName: hName, birthDate: hDob },
          wife: { fullName: wName, birthDate: wDob }
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Gặp sự cố khi phân tích. Vui lòng thử lại.");
      }

      setResult(data);
      setActiveTab("ai");
    } catch (err: any) {
      setError(err.message || "Không thể kết nối với máy chủ AI. Hãy kiểm tra xem mã API đã được thêm chưa.");
    } finally {
      setLoading(false);
    }
  };

  // Reset Form
  const handleReset = () => {
    setHName("");
    setHDob("");
    setWName("");
    setWDob("");
    setHProfile(null);
    setWProfile(null);
    setCurrentScore(0);
    setResult(null);
    setError(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 border-emerald-200 bg-emerald-50";
    if (score >= 60) return "text-amber-600 border-amber-200 bg-amber-50";
    return "text-rose-600 border-rose-200 bg-rose-50";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: "Hòa Hợp Cao", desc: "Tương thích tự nhiên, thấu hiểu sâu sắc." };
    if (score >= 60) return { label: "Hòa Hợp Trung Bình", desc: "Có khác biệt nhưng dễ dàng dung hòa nếu giao tiếp tốt." };
    return { label: "Nhiều Thách Thức", desc: "Dễ khắc khẩu, xung đột quan điểm sống mạnh mẽ." };
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      {/* Aesthetic Header */}
      <header className="relative overflow-hidden bg-gradient-to-r from-pink-500 via-rose-500 to-violet-600 text-white shadow-md">
        <div className="absolute inset-0 bg-grid-white/[0.08] pointer-events-none" />
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-400/20 rounded-full blur-xl" />
        
        <div className="max-w-6xl mx-auto px-4 py-8 relative">
          <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
            <span className="bg-white/20 p-2 rounded-xl backdrop-blur-md animate-pulse">
              <MessageSquareHeart className="w-8 h-8 text-pink-100" />
            </span>
            <div className="text-sm font-semibold tracking-wider uppercase text-pink-100 font-mono">
              Thuyết Tần Số Rung Động & Trị Liệu Tâm Lý Hôn Nhân
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white text-center md:text-left font-display drop-shadow">
            Mâu Thuẫn Vợ Chồng Theo Số Học
          </h1>
          <p className="mt-2 text-rose-100 max-w-2xl text-center md:text-left text-sm md:text-base">
            Khám phá nguồn gốc xung đột, giải khóa định mệnh hôn nhân qua các cặp số chủ đạo và nhận giải pháp hóa giải khắc khẩu thông thái từ AI - Áp dụng khoa học tâm thức*Tâm lý học hôn nhân*Số học
          </p>
          {refStatus.initialized && (
            <div className="mt-4 flex flex-wrap items-center gap-2 justify-center md:justify-start">
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/25 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-400/35 text-xs text-emerald-50 font-medium shadow-sm">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                Đã tích hợp tri thức:: COACH Dương Linh
              </span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        
        {/* Step 1: Selection & Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Input form & Quick couples */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Quick Demo Selector */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-slate-800 font-display">Tình huống kinh điển (Dùng thử ngay)</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Nhấp chọn một mâu thuẫn điển hình bên dưới để tự động điền nhanh dữ liệu mô phỏng:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SAMPLE_COUPLES.map((couple, i) => (
                  <button
                    key={i}
                    onClick={() => handleApplyExample(couple)}
                    className="text-left p-3 rounded-xl border border-slate-200/80 hover:border-pink-300 hover:bg-pink-50/20 transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <span className="inline-block text-[11px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full mb-1">
                        {couple.tag}
                      </span>
                      <h4 className="text-xs font-semibold text-slate-800 group-hover:text-pink-700 transition-colors">
                        {couple.husbandName} & {couple.wifeName}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {couple.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form Card */}
            <form onSubmit={handleAnalyze} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                  <span className="font-bold text-slate-800 font-display">Nhập thông tin vợ chồng</span>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Làm mới
                </button>
              </div>

              <div className="p-6 space-y-6">
                
                {/* 2 Grid inputs: Husband & Wife */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Husband Form */}
                  <div className="space-y-4 p-4 rounded-xl bg-pink-50/20 border border-pink-100/50">
                    <div className="flex items-center gap-2 pb-2 border-b border-pink-100/40">
                      <div className="w-2 h-2 rounded-full bg-pink-500" />
                      <h3 className="font-bold text-sm text-pink-900 font-display">Chồng (Người nam)</h3>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Họ và Tên đầy đủ
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={hName}
                          onChange={(e) => setHName(e.target.value)}
                          placeholder="VÍ DỤ: NGUYEN HOANG NAM"
                          className="w-full text-sm pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-shadow bg-white uppercase font-semibold"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Nên ghi đầy đủ họ tên khai sinh, không dấu hoặc có dấu đều được.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Ngày / Tháng / Năm sinh (Dương lịch)
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                          type="date"
                          required
                          value={hDob}
                          onChange={(e) => setHDob(e.target.value)}
                          className="w-full text-sm pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-shadow bg-white"
                        />
                      </div>
                    </div>

                    {/* Husband Quick calculations indicator */}
                    {hProfile && (
                      <div className="mt-3 pt-3 border-t border-dashed border-pink-200/50 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Số Đường Đời:</span>
                          <span className="font-bold text-pink-700">Số {hProfile.lifePath}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">Hình tượng ẩn dụ:</span>
                          <span className="font-medium text-slate-800 text-right truncate max-w-[130px]">{hProfile.title}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Wife Form */}
                  <div className="space-y-4 p-4 rounded-xl bg-violet-50/20 border border-violet-100/50">
                    <div className="flex items-center gap-2 pb-2 border-b border-violet-100/40">
                      <div className="w-2 h-2 rounded-full bg-violet-500" />
                      <h3 className="font-bold text-sm text-violet-900 font-display">Vợ (Người nữ)</h3>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Họ và Tên đầy đủ
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={wName}
                          onChange={(e) => setWName(e.target.value)}
                          placeholder="VÍ DỤ: PHAM THI MY HANH"
                          className="w-full text-sm pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-shadow bg-white uppercase font-semibold"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Họ tên đúng trên giấy tờ giúp phân tích nội tâm chính xác nhất.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Ngày / Tháng / Năm sinh (Dương lịch)
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                          type="date"
                          required
                          value={wDob}
                          onChange={(e) => setWDob(e.target.value)}
                          className="w-full text-sm pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-shadow bg-white"
                        />
                      </div>
                    </div>

                    {/* Wife Quick calculations indicator */}
                    {wProfile && (
                      <div className="mt-3 pt-3 border-t border-dashed border-violet-200/50 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Số Đường Đời:</span>
                          <span className="font-bold text-violet-700">Số {wProfile.lifePath}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">Hình tượng ẩn dụ:</span>
                          <span className="font-medium text-slate-800 text-right truncate max-w-[130px]">{wProfile.title}</span>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {error && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || !hName || !hDob || !wName || !wDob}
                    className="w-full bg-gradient-to-r from-pink-550 via-pink-600 to-violet-600 text-white font-bold py-3.5 px-6 rounded-xl hover:shadow-lg hover:shadow-pink-500/10 focus:outline-none active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer font-display text-base flex items-center justify-center gap-2 shadow-sm"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Đang phân tích chiêm nghiệm...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 animate-pulse" />
                        <span>Bắt Đầu Phân Tích Số Học Mặt Trời & Mâu Thuẫn</span>
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-center text-slate-400 mt-2 flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3" /> Bảo mật và mã hóa đầu cuối. Tôn trọng riêng tư tuyệt đối.
                  </p>
                </div>

              </div>
            </form>

            {/* General Numerology Info widget */}
            <div className="bg-gradient-to-br from-violet-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-violet-800/20">
              <h4 className="font-bold flex items-center gap-2 mb-3 text-pink-200 font-display">
                <BookOpen className="w-5 h-5" /> Cơ chế tính toán Số học Mặt Trời
              </h4>
              <p className="text-sm text-indigo-100/90 leading-relaxed mb-4">
                Theo hệ thống Số học Mặt Trời, mọi tên gọi đều phát ra một dải sóng rung lực từ các nguyên âm và phụ âm của họ tên và ngày sinh riêng biệt. Khi hai người chung sống dưới một mái nhà:
              </p>
              <div className="space-y-3.5 text-xs text-indigo-150">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-violet-800 text-violet-200 font-bold flex items-center justify-center shrink-0">1</span>
                  <p>
                    <strong className="text-white">Chỉ số Nội Tâm</strong>: Là những khát khao sâu thẳm bên trong tâm hồn bạn. Đó cũng là những gì đang làm bạn cảm thấy hạnh phúc, là mục đích ẩn sau mọi hành động. Hãy nhớ rằng không có gì đến từ bên ngoài, tất cả đều đến từ bên trong.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-violet-800 text-violet-200 font-bold flex items-center justify-center shrink-0">2</span>
                  <p>
                    <strong className="text-white">Con số Đường Đời (Life Path)</strong>: Gốc rễ bản tính tối thượng. Khi các con số Đường đời đối nghịch (ví dụ số 4 thích kế hoạch, số 5 thích tự do đột phá), khắc khẩu thường nhật là điều khó tránh khỏi.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-violet-800 text-violet-200 font-bold flex items-center justify-center shrink-0">3</span>
                  <p>
                    <strong className="text-white">Giao thoa Tương Tác</strong>: Cách hai vợ chồng biểu lộ cái tôi và giao tiếp ra bên ngoài. Sự tương đồng giúp thấu cảm dễ dàng, sự lệch tông kéo mâu thuẫn dai dẳng dâng cao.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Real-time quick preview OR Results */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Loading Cover state */}
            {loading && (
              <div className="bg-white rounded-2xl p-8 border border-slate-150 shadow-sm text-center flex flex-col items-center justify-center py-20 min-h-[460px]">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full border-4 border-pink-100 border-t-pink-500 animate-spin" />
                  <Heart className="w-8 h-8 text-pink-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 fill-pink-500 animate-bounce" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 font-display animate-pulse">
                  Đang soi tỏ mâu thuẫn...
                </h3>
                <div className="bg-pink-50 border border-pink-100 rounded-xl p-4 mt-6 max-w-sm">
                  <p className="text-xs text-pink-800 italic leading-relaxed">
                    "{loadingMessages[loadingStep]}"
                  </p>
                </div>
                <div className="mt-8 flex gap-1 justify-center">
                  {loadingMessages.map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        i === loadingStep ? "bg-pink-500 w-5" : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Static Real-time Live calculation (Pre-AI analysis) */}
            {!loading && !result && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-h-[460px] flex flex-col justify-between">
                <div>
                  <div className="pb-4 border-b border-slate-100 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-slate-800 font-display">Tần số hòa hợp tức thì</h3>
                  </div>

                  {hProfile && wProfile ? (
                    <div className="space-y-6 py-6 text-center">
                      {/* Interactive visual gauge using simple CSS/SVG */}
                      <div className="relative w-40 h-40 mx-auto">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          {/* Background Gray Ring */}
                          <circle
                            cx="50"
                            cy="50"
                            r="42"
                            stroke="#f1f5f9"
                            strokeWidth="8"
                            fill="transparent"
                          />
                          {/* Animated Matching ring */}
                          <circle
                            cx="50"
                            cy="50"
                            r="42"
                            stroke="url(#roseGradient)"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={`${2 * Math.PI * 42}`}
                            strokeDashoffset={`${2 * Math.PI * 42 * (1 - currentScore / 100)}`}
                            strokeLinecap="round"
                            className="transition-all duration-700 ease-out"
                          />
                          {/* Gradients */}
                          <defs>
                            <linearGradient id="roseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#ec4899" />
                              <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-600 font-display">
                            {currentScore}%
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono tracking-wider">HÒA HỢP SỐ</span>
                        </div>
                      </div>

                      {/* Display summary levels */}
                      <div className="p-4 rounded-xl border border-pink-100/60 bg-pink-50/10 inline-block text-center max-w-sm mx-auto">
                        <h4 className="font-extrabold text-sm text-pink-700">
                          {getScoreBadge(currentScore).label}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {getScoreBadge(currentScore).desc}
                        </p>
                      </div>

                      {/* Side-by-side comparative profile preview */}
                      <div className="grid grid-cols-2 gap-4 text-left pt-4">
                        {/* Husband Side */}
                        <div className="bg-pink-50/20 p-3 rounded-lg border border-pink-100/50">
                          <div className="text-[10px] text-pink-600 font-semibold uppercase">{hName.split(" ").pop()} (Chồng)</div>
                          <div className="text-xs font-bold text-slate-800 mt-1 truncate">Số {hProfile.lifePath} - {hProfile.title}</div>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {hProfile.keywords.slice(0, 2).map((kw: string, idx: number) => (
                              <span key={idx} className="bg-white px-1.5 py-0.5 rounded text-[10px] text-slate-600 border border-slate-100">
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Wife Side */}
                        <div className="bg-violet-50/20 p-3 rounded-lg border border-violet-100/50">
                          <div className="text-[10px] text-violet-600 font-semibold uppercase">{wName.split(" ").pop()} (Vợ)</div>
                          <div className="text-xs font-bold text-slate-800 mt-1 truncate">Số {wProfile.lifePath} - {wProfile.title}</div>
                          <div className="flex flex-wrap gap-1 mt-1.5 flex-row">
                            {wProfile.keywords.slice(0, 2).map((kw: string, idx: number) => (
                              <span key={idx} className="bg-white px-1.5 py-0.5 rounded text-[10px] text-slate-600 border border-slate-100">
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 text-left">
                        <p className="text-[11px] text-amber-800 leading-relaxed flex gap-1.5">
                          <Flame className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          <span>Để nhận biết chính xác ngòi nổ mâu thuẫn ẩn khuất & giải pháp giao tiếp giải đặc trị khắc khẩu, bạn hãy nhấn nút <strong>"Bắt Đầu Phân Tích"</strong> phía dưới để gửi dữ liệu cho tư vấn viên AI.</span>
                        </p>
                      </div>

                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center py-16 space-y-4">
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200">
                        <HeartCrack className="w-8 h-8 text-slate-400" />
                      </div>
                      <div className="max-w-xs">
                        <h4 className="font-semibold text-slate-700 text-sm">Chưa có đủ thông tin</h4>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          Vui lòng nhập họ tên chính xác và ngày tháng năm sinh của cả vợ và chồng để xem bảng phân tích hòa hợp mâu thuẫn ban đầu.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Helpful tip footer */}
                <div className="text-[11px] text-slate-400 text-center border-t border-slate-100 pt-3">
                  💡 Số học Mặt Trời không chỉ tính toán tương hợp thông thường mà là lăng kính chữa lành mâu thuẫn thấu đáo.
                </div>
              </div>
            )}

            {/* AI Result Card */}
            {!loading && result && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="pb-4 border-b border-indigo-50 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Bảng hòa kết quả</span>
                    <h3 className="font-bold text-slate-800 text-lg font-display mt-1">Giao Thoa Bản Đồ Số</h3>
                  </div>
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="text-xs flex items-center gap-1 text-slate-500 hover:text-pink-600 transition-colors bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" /> Lưu / In
                  </button>
                </div>

                {/* Compatibility gauge with nice colors */}
                <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-pink-50 to-violet-50 border border-pink-100/50 text-center space-y-3">
                  <div className="text-xs text-slate-500 uppercase tracking-widest font-mono">Điểm tương hợp tổng thể</div>
                  <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-600 font-display">
                    {result.compatibilityScore}%
                  </div>
                  <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white text-indigo-700 border border-indigo-100">
                    {getScoreBadge(result.compatibilityScore).label}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed italic max-w-xs mx-auto">
                    "{getScoreBadge(result.compatibilityScore).desc}"
                  </p>
                </div>

                {/* Side by side profile breakdown */}
                <div className="mt-6 space-y-4">
                  <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5 font-display">
                    <UserCheck className="w-4 h-4 text-pink-600" /> Hồ sơ hai đối tượng
                  </h4>
                  
                  {/* Chồng summary */}
                  <div className="bg-pink-50/10 rounded-xl p-4 border border-pink-100/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-block font-bold text-xs text-pink-600 uppercase">Đối tác Chồng</span>
                      <span className="text-xs bg-pink-100 text-pink-800 font-bold px-2 py-0.5 rounded-full">LP {result.husbandProfile.lifePath}</span>
                    </div>
                    <div className="text-sm font-bold text-slate-900">{result.husbandProfile.fullName}</div>
                    <div className="text-xs text-slate-500 italic mt-0.5">"{result.husbandProfile.title}"</div>
                    <div className="text-xs text-slate-600 leading-relaxed bg-white border border-slate-100 p-2.5 rounded-lg">
                      {result.husbandProfile.description}
                    </div>
                    {/* Tiny subnumbers grid */}
                    <div className="grid grid-cols-4 gap-1.5 pt-1.5 text-center">
                      <div className="bg-white p-1.5 rounded border border-slate-100">
                        <div className="text-[9px] text-slate-400 leading-none">Sứ Mệnh</div>
                        <div className="text-xs font-bold text-slate-800 mt-1">{result.husbandProfile.destiny}</div>
                      </div>
                      <div className="bg-white p-1.5 rounded border border-slate-100">
                        <div className="text-[9px] text-slate-400 leading-none">Nội Tâm</div>
                        <div className="text-xs font-bold text-indigo-700 mt-1">{result.husbandProfile.soulUrge}</div>
                      </div>
                      <div className="bg-white p-1.5 rounded border border-slate-100">
                        <div className="text-[9px] text-slate-400 leading-none">Tương Tác</div>
                        <div className="text-xs font-bold text-slate-800 mt-1">{result.husbandProfile.personality}</div>
                      </div>
                      <div className="bg-white p-1.5 rounded border border-slate-100">
                        <div className="text-[9px] text-slate-400 leading-none">Ngày Sinh</div>
                        <div className="text-xs font-bold text-slate-800 mt-1">{result.husbandProfile.dayOfBirth}</div>
                      </div>
                    </div>
                  </div>

                  {/* Vợ summary */}
                  <div className="bg-violet-50/10 rounded-xl p-4 border border-violet-100/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-block font-bold text-xs text-violet-600 uppercase">Đối tác Vợ</span>
                      <span className="text-xs bg-violet-100 text-violet-800 font-bold px-2 py-0.5 rounded-full">LP {result.wifeProfile.lifePath}</span>
                    </div>
                    <div className="text-sm font-bold text-slate-900">{result.wifeProfile.fullName}</div>
                    <div className="text-xs text-slate-500 italic mt-0.5">"{result.wifeProfile.title}"</div>
                    <div className="text-xs text-slate-600 leading-relaxed bg-white border border-slate-100 p-2.5 rounded-lg">
                      {result.wifeProfile.description}
                    </div>
                    {/* Tiny subnumbers grid */}
                    <div className="grid grid-cols-4 gap-1.5 pt-1.5 text-center">
                      <div className="bg-white p-1.5 rounded border border-slate-100">
                        <div className="text-[9px] text-slate-400 leading-none">Sứ Mệnh</div>
                        <div className="text-xs font-bold text-slate-800 mt-1">{result.wifeProfile.destiny}</div>
                      </div>
                      <div className="bg-white p-1.5 rounded border border-slate-100">
                        <div className="text-[9px] text-slate-400 leading-none">Nội Tâm</div>
                        <div className="text-xs font-bold text-pink-700 mt-1">{result.wifeProfile.soulUrge}</div>
                      </div>
                      <div className="bg-white p-1.5 rounded border border-slate-100">
                        <div className="text-[9px] text-slate-400 leading-none">Tương Tác</div>
                        <div className="text-xs font-bold text-slate-800 mt-1">{result.wifeProfile.personality}</div>
                      </div>
                      <div className="bg-white p-1.5 rounded border border-slate-100">
                        <div className="text-[9px] text-slate-400 leading-none">Ngày Sinh</div>
                        <div className="text-xs font-bold text-slate-800 mt-1">{result.wifeProfile.dayOfBirth}</div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}

          </div>

        </div>

        {/* SECTION 2: AI Detailed Therapy Report */}
        {result && (
          <div className="mt-12 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            
            {/* Tab navigation headers */}
            <div className="flex flex-col sm:flex-row border-b border-slate-100 bg-slate-50/50 p-4 gap-2">
              <button
                onClick={() => setActiveTab("ai")}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer font-display ${
                  activeTab === "ai"
                    ? "bg-white text-pink-750 shadow-sm border border-slate-200/50"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`}
              >
                <Sparkles className="w-4 h-4 text-pink-500 animate-pulse" />
                <span>Trị Liệu & Hóa Giải Mâu Thuẫn AI</span>
              </button>
              
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer font-display ${
                  activeTab === "profile"
                    ? "bg-white text-indigo-750 shadow-sm border border-slate-200/50"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`}
              >
                <Compass className="w-4 h-4 text-violet-500" />
                <span>Chi Tiết Bản Đồ Số</span>
              </button>

              <button
                onClick={() => setActiveTab("advice")}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer font-display ${
                  activeTab === "advice"
                    ? "bg-white text-amber-750 shadow-sm border border-slate-200/50"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`}
              >
                <Smile className="w-4 h-4 text-amber-500" />
                <span>Nguyên Tắc Hôn Nhân Bất Biến</span>
              </button>
            </div>

            {/* TAB CONTENT: AI Deep counseling analysis with Markdown */}
            {activeTab === "ai" && (
              <div className="p-6 md:p-8 space-y-6">
                
                {/* Exclusive Conflict Matrix Matrix Breakdown Card */}
                <div className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 rounded-2xl p-5 border border-pink-100 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-pink-500 animate-pulse shrink-0" />
                    <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider font-display flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-pink-600" /> Tính Năng Độc Quyền: Ma Trận Đọc Vị Mâu Thuẫn Gia Đình
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Hệ thống Số học Mặt Trời đối chiếu các dòng năng lượng giao xung chính xác của hai bạn để mở khóa 3 kịch bản va chạm "nóng" nhất được phân tích trực diện bên dưới:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] pt-1">
                    <div className="bg-white/85 backdrop-blur p-3 rounded-xl border border-pink-100/40 shadow-sm">
                      <span className="font-bold text-pink-700 flex items-center gap-1 mb-1">❤️ 1. Nhu Cầu Cảm Xúc</span>
                      <span className="text-slate-500 block leading-tight">
                        Đặc tả những hụt hẫng khi không được yêu thương đúng cách.
                      </span>
                      <div className="mt-2 text-[10px] font-mono text-pink-600 bg-pink-50 py-0.5 px-2 rounded inline-block">
                        Bản đồ Nội tâm: Chồng {result.husbandProfile.soulUrge} ∞ Vợ {result.wifeProfile.soulUrge}
                      </div>
                    </div>
                    <div className="bg-white/85 backdrop-blur p-3 rounded-xl border border-purple-100/40 shadow-sm">
                      <span className="font-bold text-purple-700 flex items-center gap-1 mb-1">⚡ 2. Giao Tiếp & Phản Ứng</span>
                      <span className="text-slate-500 block leading-tight">
                        Mổ xẻ tổn thương bằng lời nói hay sự im lặng ngột ngạt khi bát đũa xô xát.
                      </span>
                      <div className="mt-2 text-[10px] font-mono text-purple-600 bg-purple-50 py-0.5 px-2 rounded inline-block">
                        Bản đồ Tương tác: Chồng {result.husbandProfile.personality} ∞ Vợ {result.wifeProfile.personality}
                      </div>
                    </div>
                    <div className="bg-white/85 backdrop-blur p-3 rounded-xl border border-indigo-100/40 shadow-sm">
                      <span className="font-bold text-indigo-700 flex items-center gap-1 mb-1">💵 3. Quan Điểm & Tài Chính</span>
                      <span className="text-slate-500 block leading-tight">
                        Xung khắc lo sợ rủi ro, phân vai tài chính và định vị tương lai chung sống.
                      </span>
                      <div className="mt-2 text-[10px] font-mono text-indigo-600 bg-indigo-50 py-0.5 px-2 rounded inline-block">
                        Bản đồ Đường đời: Chồng {result.husbandProfile.lifePath} ∞ Vợ {result.wifeProfile.lifePath}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Intro warning banner for emotional support */}
                <div className="flex items-start gap-3 p-4 bg-rose-50/50 rounded-2xl border border-rose-100 text-rose-800 text-xs md:text-sm">
                  <Flame className="w-5 h-5 mt-0.5 shrink-0 text-rose-500" />
                  <div>
                    <h5 className="font-bold mb-1">Mật mã tháo gỡ mâu thuẫn chuyên sâu</h5>
                    <p className="leading-relaxed text-rose-700">
                      Hãy nhớ rằng, Số học Mặt Trời chỉ là hồi chuông rung nhằm soi tỏ khác biệt. Sự thấu hiểu, tự nguyện nhường nhịn và đồng điệu tâm hồn của hai bạn mới chính là ngọn hải đăng duy nhất duy trì ngọn lửa hạnh phúc muôn đời.
                    </p>
                  </div>
                </div>

                <div className="prose prose-pink max-w-none text-slate-800 leading-relaxed">
                  <MarkdownViewer content={result.aiReport} />
                </div>
              </div>
            )}

            {/* TAB CONTENT: Detailed profiles explanation */}
            {activeTab === "profile" && (
              <div className="p-6 md:p-8 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Husband Detailed Numbers info */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-850 font-display pb-2 border-b border-pink-100 flex items-center gap-2">
                       <span className="w-3.5 h-3.5 rounded-full bg-pink-500 flex items-center justify-center text-[10px] text-white">♂</span>
                      Hệ thống Số học Mặt Trời Chồng: <span className="text-pink-600">{result.husbandProfile.fullName}</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl bg-pink-50/30 border border-pink-100/40 text-xs">
                        <div className="font-extrabold text-pink-900 text-sm flex justify-between">
                          <span>Đường Đời</span>
                          <span className="text-pink-600 font-mono">Số {result.husbandProfile.lifePath}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Con số chủ đạo vạch rõ bài học nghiệp khí lớn nhất.</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <div className="font-semibold text-slate-800 text-sm flex justify-between">
                          <span>Sứ Mệnh</span>
                          <span className="text-slate-600 font-mono">Số {result.husbandProfile.destiny}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Sức mạnh tự nhiên định hình cách thực hiện vai diễn cuộc đời.</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-indigo-50/20 border border-indigo-100/30 text-xs">
                        <div className="font-semibold text-indigo-900 text-sm flex justify-between">
                          <span>Nội Tâm</span>
                          <span className="text-indigo-600 font-mono">Số {result.husbandProfile.soulUrge}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Nhu cầu cảm xúc thầm kín, khát khao cốt tủy dưới mái nhà.</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <div className="font-semibold text-slate-800 text-sm flex justify-between">
                          <span>Tương Tác</span>
                          <span className="text-slate-600 font-mono">Số {result.husbandProfile.personality}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Chiếc mặt nạ xã giao bề ngoài người khác nhìn vào.</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <div className="font-semibold text-slate-800 text-sm flex justify-between">
                          <span>Thái Độ</span>
                          <span className="text-slate-600 font-mono">Số {result.husbandProfile.attitude}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Phản ứng bản năng tức thì khi xảy ra sự cố đột xuất.</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <div className="font-semibold text-slate-800 text-sm flex justify-between">
                          <span>Ngày Sinh</span>
                          <span className="text-slate-600 font-mono">Số {result.husbandProfile.dayOfBirth}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Món quà tư chất bẩm sinh hỗ trợ thực hiện mục tiêu.</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <div className="font-semibold text-slate-800 text-sm flex justify-between">
                          <span>Cân Bằng</span>
                          <span className="text-slate-600 font-mono">Số {result.husbandProfile.balance}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Điểm tựa tâm lý tự vệ giữ bình tĩnh khi giông bão.</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-amber-50/40 border border-amber-150/40 text-xs">
                        <div className="font-semibold text-amber-900 text-sm flex justify-between">
                          <span>Năm Cá Nhân ({CURRENT_YEAR})</span>
                          <span className="text-amber-700 font-bold font-mono">Số {result.husbandProfile.personalYear}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Vận niên năm hiện đại rung động cho bài học tâm thức.</p>
                      </div>
                    </div>

                    {/* Advanced parameters lists */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3.5 text-xs">
                      <div>
                        <span className="font-bold text-slate-800 block mb-1">Chỉ số Nội Cảm:</span>
                        {result.husbandProfile.innerFeels && result.husbandProfile.innerFeels.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {result.husbandProfile.innerFeels.map((n: number) => (
                              <span key={n} className="px-2.5 py-1 bg-pink-100 text-pink-850 font-bold font-mono rounded text-xs select-none">
                                Số {n}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Không có chỉ số Nội Cảm rõ nét (cần lặp số từ 3 lần trở lên)</span>
                        )}
                        <span className="text-[10px] text-slate-400 block mt-1">Các con số xuất hiện nhiều lần nhất trong biểu đồ họ tên biểu đạt năng khiếu tiềm tàng.</span>
                      </div>

                      <hr className="border-slate-250" />

                      <div>
                        <span className="font-bold text-slate-800 block mb-1.5">Bản đồ Kim tự tháp - 4 Đỉnh chặng đường đời:</span>
                        <div className="grid grid-cols-4 gap-2 text-center">
                          {result.husbandProfile.peaks.map((pval: number, idx: number) => (
                            <div key={idx} className="bg-white p-2 rounded-lg border border-slate-200">
                              <span className="text-[9px] text-slate-400 block uppercase font-mono">Chặng {idx + 1}</span>
                              <span className="text-base font-extrabold text-indigo-700 font-mono block mt-1">{pval}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <hr className="border-slate-250" />

                      <div>
                        <span className="font-bold text-slate-850 block mb-1.5 text-rose-800">Mô hình 4 Giai đoạn thử thách:</span>
                        <div className="grid grid-cols-4 gap-2 text-center">
                          {result.husbandProfile.challenges.map((cval: number, idx: number) => (
                            <div key={idx} className="bg-white p-2 rounded-lg border border-amber-200 bg-amber-50/10">
                              <span className="text-[9px] text-amber-700 block uppercase font-mono">Thử thách {idx + 1}</span>
                              <span className="text-base font-extrabold text-rose-650 font-mono block mt-1">{cval}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <hr className="border-slate-250" />

                      <div>
                        <span className="font-bold text-slate-800 block mb-1.5">Tần số vận trình 6 Tháng Cá Nhân tiếp theo:</span>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          {result.husbandProfile.personalMonths.map((mstr: string, idx: number) => {
                            const parts = mstr.split(": ");
                            const mLabel = parts[0] || "";
                            const mVal = parts[1] || "0";
                            return (
                              <div key={idx} className="bg-white p-2 rounded-lg border border-slate-100 flex flex-col justify-center">
                                <span className="text-[9px] text-slate-400 font-mono">{mLabel}</span>
                                <span className="text-xs font-bold text-indigo-800 mt-1">Số {mVal}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Wife Detailed Numbers info */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-850 font-display pb-2 border-b border-violet-100 flex items-center gap-2">
                       <span className="w-3.5 h-3.5 rounded-full bg-violet-500 flex items-center justify-center text-[10px] text-white">♀</span>
                      Hệ thống Số học Mặt Trời Vợ: <span className="text-violet-600">{result.wifeProfile.fullName}</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl bg-violet-50/30 border border-violet-100/40 text-xs">
                        <div className="font-extrabold text-violet-900 text-sm flex justify-between">
                          <span>Đường Đời</span>
                          <span className="text-violet-600 font-mono">Số {result.wifeProfile.lifePath}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Con số chủ đạo vạch rõ bài học nghiệp khí lớn nhất.</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <div className="font-semibold text-slate-800 text-sm flex justify-between">
                          <span>Sứ Mệnh</span>
                          <span className="text-slate-600 font-mono">Số {result.wifeProfile.destiny}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Sức mạnh tự nhiên định hình cách thực hiện vai diễn cuộc đời.</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-pink-50/20 border border-pink-100/30 text-xs">
                        <div className="font-semibold text-pink-900 text-sm flex justify-between">
                          <span>Nội Tâm</span>
                          <span className="text-pink-600 font-mono">Số {result.wifeProfile.soulUrge}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Nhu cầu cảm xúc thầm kín, khát khao cốt tủy dưới mái nhà.</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <div className="font-semibold text-slate-800 text-sm flex justify-between">
                          <span>Tương Tác</span>
                          <span className="text-slate-600 font-mono">Số {result.wifeProfile.personality}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Chiếc mặt nạ xã giao bề ngoài người khác nhìn vào.</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <div className="font-semibold text-slate-800 text-sm flex justify-between">
                          <span>Thái Độ</span>
                          <span className="text-slate-600 font-mono">Số {result.wifeProfile.attitude}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Phản ứng bản năng tức thì khi xảy ra sự cố đột xuất.</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <div className="font-semibold text-slate-800 text-sm flex justify-between">
                          <span>Ngày Sinh</span>
                          <span className="text-slate-600 font-mono">Số {result.wifeProfile.dayOfBirth}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Món quà tư chất bẩm sinh hỗ trợ thực hiện mục tiêu.</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <div className="font-semibold text-slate-800 text-sm flex justify-between">
                          <span>Cân Bằng</span>
                          <span className="text-slate-600 font-mono">Số {result.wifeProfile.balance}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Điểm tựa tâm lý tự vệ giữ bình tĩnh khi giông bão.</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-amber-50/40 border border-amber-150/40 text-xs">
                        <div className="font-semibold text-amber-900 text-sm flex justify-between">
                          <span>Năm Cá Nhân ({CURRENT_YEAR})</span>
                          <span className="text-amber-700 font-bold font-mono">Số {result.wifeProfile.personalYear}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Vận niên năm hiện đại rung động cho bài học tâm thức.</p>
                      </div>
                    </div>

                    {/* Advanced parameters lists */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3.5 text-xs">
                      <div>
                        <span className="font-bold text-slate-800 block mb-1">Chỉ số Nội Cảm:</span>
                        {result.wifeProfile.innerFeels && result.wifeProfile.innerFeels.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {result.wifeProfile.innerFeels.map((n: number) => (
                              <span key={n} className="px-2.5 py-1 bg-violet-100 text-violet-850 font-bold font-mono rounded text-xs select-none">
                                Số {n}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Không có chỉ số Nội Cảm rõ nét (cần lặp số từ 3 lần trở lên)</span>
                        )}
                        <span className="text-[10px] text-slate-400 block mt-1">Các con số xuất hiện many lần nhất trong biểu đồ họ tên biểu đạt năng khiếu tiềm tàng.</span>
                      </div>

                      <hr className="border-slate-250" />

                      <div>
                        <span className="font-bold text-slate-800 block mb-1.5">Bản đồ Kim tự tháp - 4 Đỉnh chặng đường đời:</span>
                        <div className="grid grid-cols-4 gap-2 text-center">
                          {result.wifeProfile.peaks.map((pval: number, idx: number) => (
                            <div key={idx} className="bg-white p-2 rounded-lg border border-slate-200">
                              <span className="text-[9px] text-slate-400 block uppercase font-mono">Chặng {idx + 1}</span>
                              <span className="text-base font-extrabold text-violet-750 font-mono block mt-1">{pval}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <hr className="border-slate-250" />

                      <div>
                        <span className="font-bold text-slate-855 block mb-1.5 text-rose-800">Mô hình 4 Giai đoạn thử thách:</span>
                        <div className="grid grid-cols-4 gap-2 text-center">
                          {result.wifeProfile.challenges.map((cval: number, idx: number) => (
                            <div key={idx} className="bg-white p-2 rounded-lg border border-amber-200 bg-amber-50/10">
                              <span className="text-[9px] text-amber-700 block uppercase font-mono">Thử thách {idx + 1}</span>
                              <span className="text-base font-extrabold text-rose-650 font-mono block mt-1">{cval}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <hr className="border-slate-250" />

                      <div>
                        <span className="font-bold text-slate-800 block mb-1.5">Tần số vận trình 6 Tháng Cá Nhân tiếp theo:</span>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          {result.wifeProfile.personalMonths.map((mstr: string, idx: number) => {
                            const parts = mstr.split(": ");
                            const mLabel = parts[0] || "";
                            const mVal = parts[1] || "0";
                            return (
                              <div key={idx} className="bg-white p-2 rounded-lg border border-slate-100 flex flex-col justify-center">
                                <span className="text-[9px] text-slate-400 font-mono">{mLabel}</span>
                                <span className="text-xs font-bold text-violet-850 mt-1">Số {mVal}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: General Marriage advice */}
            {activeTab === "advice" && (
              <div className="p-6 md:p-8 space-y-6">
                <h3 className="text-2xl font-bold text-slate-850 font-display flex items-center gap-2">
                  <Scale className="w-6 h-6 text-amber-500" /> Quy Tắc 5 Quả Cân Chữa Lành Mọi Khắc Khẩu
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Ngành tâm lý học trị liệu hôn nhân hiện đại đúc kết ra những công thức hành vi cốt lõi để duy trì gia đình êm ấm, tương đồng với dải sóng năng lượng Số học Mặt Trời:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/50 flex items-start gap-3">
                    <div className="text-xl font-bold text-amber-600 bg-white shadow-sm w-8 h-8 rounded-full flex items-center justify-center shrink-0">1</div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm mb-1">Quy tắc 5 giây im lặng khi nóng giận</h4>
                      <p className="text-slate-650 text-xs leading-relaxed">
                        Mọi con số đại diên cái tôi cao như số 1, 8, 9 hoặc nhạy cảm như số 3 rất dễ buông lời tổn thương lúc giận dữ. Hãy ngậm miệng đúng 5 giây trước khi phát âm.
                      </p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-pink-50/50 border border-pink-200/50 flex items-start gap-3">
                    <div className="text-xl font-bold text-pink-600 bg-white shadow-sm w-8 h-8 rounded-full flex items-center justify-center shrink-0">2</div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm mb-1">Quy tắc Hạ Tông Giọng khi tranh luận</h4>
                      <p className="text-slate-650 text-xs leading-relaxed">
                        Nhiều xung đột nảy sinh không phải vì sai nội dung tranh luận, mà vì âm lượng quá lớn tạo phản xạ tự vệ tâm lý của đối phương. Chỉ cần hạ giọng 30% khi cảm xúc dâng trào.
                      </p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200/50 flex items-start gap-3">
                    <div className="text-xl font-bold text-indigo-600 bg-white shadow-sm w-8 h-8 rounded-full flex items-center justify-center shrink-0">3</div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm mb-1">Tôn trọng không gian cách biệt của Số 7</h4>
                      <p className="text-slate-650 text-xs leading-relaxed">
                        Không gian sạc năng lượng là cực kỳ thiết yếu với người số 7 và số 4. Thay vì dồn dập chất vấn, hãy cho họ khoảng lặng 2-3 tiếng để bình tâm trở lại.
                      </p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/50 flex items-start gap-3">
                    <div className="text-xl font-bold text-emerald-600 bg-white shadow-sm w-8 h-8 rounded-full flex items-center justify-center shrink-0">4</div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm mb-1">Ngôn ngữ yêu thương cụ thể của Số 2 và 6</h4>
                      <p className="text-slate-650 text-xs leading-relaxed">
                        Họ là người coi trọng cử chỉ ân cần thực tế, thấu hiểu qua hành động rửa bát hay một cái ôm im lặng từ sau lưng hơn là trăm lời đường mật suông.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* Aesthetic Footer */}
      <footer className="mt-20 border-t border-slate-200 pt-8 text-center max-w-4xl mx-auto px-4">
        <div className="flex justify-center items-center gap-1 text-slate-400 text-xs">
          <span>Phát triển bởi Coach Dương Linh & Trí tuệ Nhân tạo</span>
          <span>© 2025 - {CURRENT_YEAR}. Phiên bản kỷ niệm {CURRENT_YEAR}.</span>
        </div>
      </footer>
    </div>
  );
}
