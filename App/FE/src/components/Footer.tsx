export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-slate-500">
            © 2026 <span className="font-semibold text-slate-700">NovaBank</span> — Hệ thống Đánh giá Rủi ro Tín dụng
          </p>
          <p className="text-xs text-slate-400">
            Hệ thống quản trị rủi ro & Thẩm định tín dụng ·
          </p>
        </div>
      </div>
    </footer>
  );
}
