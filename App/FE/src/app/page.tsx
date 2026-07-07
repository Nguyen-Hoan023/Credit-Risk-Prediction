import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-16 py-8 md:py-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#131a2c] py-16 md:py-20 lg:py-24 border-b border-slate-800/40 w-full -mt-8 md:-mt-12">
        {/* Glow Effects */}
        {/* Left blue glow */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-blue-500/25 opacity-75 blur-[110px] pointer-events-none" />
        {/* Right purple glow */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-purple-500/25 opacity-75 blur-[110px] pointer-events-none" />

        <div className="mx-auto max-w-7xl w-full px-6 sm:px-8 relative min-h-[420px] flex flex-col justify-center">
          {/* Decorative Wave/Bar Chart on the left */}
          <div className="absolute -left-4 bottom-0 top-0 hidden lg:flex items-end gap-1.5 opacity-25 pointer-events-none w-1/4 pb-4 select-none">
            {[12, 24, 36, 18, 48, 60, 30, 42, 54, 72, 90, 64, 48, 36, 24, 48, 72, 84, 96, 60, 48, 36, 28, 16, 8].map((h, i) => (
              <div
                key={i}
                className="w-1 bg-gradient-to-t from-blue-500 to-transparent rounded-full"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>

          {/* Center Column: Text & Buttons */}
          <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto lg:max-w-2xl xl:max-w-3xl">
            <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl leading-tight">
              Hệ Thống Dự Đoán <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent whitespace-nowrap">
                Rủi Ro Tín Dụng Cá Nhân
              </span>
            </h1>
            <p className="mt-6 text-base md:text-lg leading-relaxed text-slate-300">
              Công cụ hỗ trợ Chuyên viên Thẩm định và hỗ trợ quyết định cho vay cá nhân. Tự động phân tích hồ sơ khách hàng, chấm điểm tín dụng chuẩn hóa và hỗ trợ để cho ra quyết định phê duyệt nhanh chóng và chính xác hơn.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 w-full sm:w-auto">
              <Link
                href="/apply"
                className="rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-indigo-500 hover:shadow-indigo-500/20 hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 w-full sm:w-auto text-center"
              >
                Thẩm Định Hồ Sơ
              </Link>
              <Link
                href="/history"
                className="text-base font-semibold leading-6 text-slate-300 hover:text-white transition-colors py-3"
              >
                Tra Cứu Lịch Sử
              </Link>
            </div>
          </div>

          {/* Right Column: Glassmorphic Tablet */}
          <div className="relative lg:absolute lg:right-0 lg:top-1/2 lg:-translate-y-1/2 flex items-center justify-center lg:justify-end mt-12 lg:mt-0 transform lg:translate-x-28 xl:translate-x-24 z-20">
            {/* Tablet Mockup with 3D Effect */}
            <div className="relative w-full max-w-[340px] sm:max-w-[400px] lg:max-w-[320px] xl:max-w-[380px] aspect-[4/3] rounded-3xl bg-white/5 border border-white/10 p-4 shadow-[0_25px_60px_rgba(0,0,0,0.5)] backdrop-blur-md hover:scale-[1.04] transition-all duration-500 select-none group">
              {/* Outer glass glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-purple-500/10 to-blue-500/10 opacity-50 group-hover:opacity-80 transition-opacity duration-500" />

              {/* Tablet screen bezel */}
              <div className="relative h-full w-full rounded-2xl bg-[#161e31] border border-slate-800/80 p-4 flex flex-col justify-between overflow-hidden">
                {/* Screen reflection overlay */}
                <div className="absolute top-0 right-0 w-[150%] h-[150%] bg-gradient-to-b from-white/5 via-transparent to-transparent -rotate-45 pointer-events-none transform -translate-y-1/2 translate-x-1/4" />

                {/* Tablet header */}
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">NovaScore Dashboard</span>
                  <div className="w-6 h-1 bg-slate-800 rounded-full" />
                </div>

                {/* Dashboard content */}
                <div className="grid grid-cols-12 gap-3 my-auto py-2">
                  {/* Left part: Gauge */}
                  <div className="col-span-5 flex flex-col items-center justify-center bg-slate-900/50 rounded-xl p-2.5 border border-slate-800/50">
                    <span className="text-[9px] text-slate-400 font-semibold mb-1">Credit Score</span>
                    {/* SVG Gauge */}
                    <div className="relative w-16 h-10 mt-1">
                      <svg viewBox="0 0 100 50" className="w-full h-full">
                        {/* Gauge track */}
                        <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#1e293b" strokeWidth="12" strokeLinecap="round" />
                        {/* Gauge fill */}
                        <path d="M 10 50 A 40 40 0 0 1 70 20" fill="none" stroke="url(#gauge-gradient)" strokeWidth="12" strokeLinecap="round" />
                        <defs>
                          <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ef4444" />
                            <stop offset="50%" stopColor="#eab308" />
                            <stop offset="100%" stopColor="#10b981" />
                          </linearGradient>
                        </defs>
                      </svg>
                      {/* Needle */}
                      <div className="absolute bottom-0 left-1/2 w-1 h-7 bg-slate-200 origin-bottom -translate-x-1/2 rotate-[35deg] rounded-full" />
                      <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-slate-100 rounded-full -translate-x-1/2 translate-y-1/2 border border-slate-900" />
                    </div>
                    <span className="text-sm font-extrabold text-emerald-400 mt-2">725</span>
                    <span className="text-[8px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider scale-90">Good</span>
                  </div>

                  {/* Right part: Risk Curve */}
                  <div className="col-span-7 flex flex-col justify-between bg-slate-900/50 rounded-xl p-2.5 border border-slate-800/50 relative overflow-hidden">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-slate-400 font-semibold">Risk Analysis</span>
                      <span className="text-[8px] text-emerald-400 font-semibold bg-emerald-400/10 px-1.5 py-0.5 rounded">
                        Passed
                      </span>
                    </div>

                    {/* SVG Risk Curve */}
                    <div className="w-full h-16 mt-1 relative">
                      <svg viewBox="0 0 100 50" className="w-full h-full" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="low-risk-glow" x1="0" y1="1" x2="0" y2="0">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                          </linearGradient>
                          <linearGradient id="high-risk-glow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.1" />
                            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {/* High Risk Region (above curve) */}
                        <path d="M 0 0 L 100 0 L 100 15 Q 70 20, 50 32 T 0 45 Z" fill="url(#high-risk-glow)" />
                        {/* Low Risk Region (below curve) */}
                        <path d="M 0 45 Q 30 45, 50 32 T 100 15 L 100 50 L 0 50 Z" fill="url(#low-risk-glow)" />

                        {/* Curved boundary line */}
                        <path d="M 0 45 Q 30 45, 50 32 T 100 15" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />

                        {/* Labels inside SVG */}
                        <text x="62" y="12" fill="#ef4444" fontSize="6.5" fontWeight="extrabold" letterSpacing="0.5" opacity="0.8">HIGH RISK</text>
                        <text x="10" y="44" fill="#10b981" fontSize="6.5" fontWeight="extrabold" letterSpacing="0.5" opacity="0.8">LOW RISK</text>

                        {/* Plotted Point (Current Customer) */}
                        <circle cx="65" cy="38" r="3" fill="#10b981" className="animate-ping" style={{ transformOrigin: '65px 38px' }} />
                        <circle cx="65" cy="38" r="2" fill="#10b981" stroke="#ffffff" strokeWidth="0.5" />
                      </svg>
                    </div>

                    {/* Miniature stats footer */}
                    <div className="flex justify-between items-center text-[7px] text-slate-500 mt-1 border-t border-slate-800/40 pt-1">
                      <span>Threshold: FICO 650</span>
                      <span>Current: 725</span>
                    </div>
                  </div>
                </div>

                {/* Tablet bottom home bar or dots */}
                <div className="flex items-center justify-center pt-2 border-t border-slate-800/40">
                  <div className="w-16 h-1 bg-slate-800 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 w-full -mt-10 relative z-30">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* Card 1 */}
          <div className="rounded-2xl border border-slate-200/60 bg-white/85 backdrop-blur-lg p-6 text-center shadow-[0_12px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.07)] transition-all duration-300 hover:-translate-y-1 group">
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-500"></dt>
            <dd className="order-first text-3xl font-extrabold tracking-tight text-slate-900 mb-2 flex items-center justify-center gap-1.5">
              <span className="text-blue-500 group-hover:scale-110 transition-transform">📋</span> Hỗ trợ đánh giá hồ sơ
            </dd>
          </div>
          {/* Card 2 */}
          <div className="rounded-2xl border border-slate-200/60 bg-white/85 backdrop-blur-lg p-6 text-center shadow-[0_12px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.07)] transition-all duration-300 hover:-translate-y-1 group">
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-500"></dt>
            <dd className="order-first text-3xl font-extrabold tracking-tight text-indigo-600 mb-2 flex items-center justify-center gap-1.5">
              <span className="text-indigo-500 group-hover:scale-110 transition-transform">📊</span> Chấm điểm tín dụng khách hàng
            </dd>
          </div>
          {/* Card 3 */}
          <div className="rounded-2xl border border-slate-200/60 bg-white/85 backdrop-blur-lg p-6 text-center shadow-[0_12px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.07)] transition-all duration-300 hover:-translate-y-1 group">
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-500"></dt>
            <dd className="order-first text-3xl font-extrabold tracking-tight text-emerald-600 mb-2 flex items-center justify-center gap-1.5">
              <span className="text-emerald-500 group-hover:scale-110 transition-transform">🎯</span> Đưa ra quyết định chính xác
            </dd>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-2 py-2">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl mt-4">
            Tính Năng Hỗ Trợ Chấm Điểm Và Phê Duyệt
          </h2>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            Hỗ trợ đánh giá hồ sơ tối ưu hóa quy trình phê duyệt khoản vay cá nhân,
            rút ngắn thời gian xử lý và giảm thiểu tỷ lệ nợ xấu.
          </p>
        </div>
      </section>
    </div>
  );
}
