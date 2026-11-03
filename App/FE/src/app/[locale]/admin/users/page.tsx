"use client";

import { useEffect, useRef, useState } from "react";
import { getAccessToken } from "@/lib/auth";
import { LoaderCircle, Plus, X } from "lucide-react";
import { API_BASE_URL } from "@/lib/constants";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [usersLoadError, setUsersLoadError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ full_name: "", email: "", password: "", role: "staff" });
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);

  const fetchUsers = () => {
    const token = getAccessToken();
    if (token) {
      setUsersLoadError(false);
      fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setUsers(data.users || []))
      .catch(err => { console.error("Error fetching users:", err); setUsersLoadError(true); })
      .finally(() => setUsersLoaded(true));
    } else {
      setUsersLoaded(true);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!showModal) {
      if (wasOpenRef.current) openButtonRef.current?.focus();
      wasOpenRef.current = false;
      return;
    }

    wasOpenRef.current = true;
    dialogRef.current?.querySelector<HTMLElement>("input")?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowModal(false);
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showModal]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ full_name: "", email: "", password: "", role: "staff" });
        fetchUsers();
        alert("Tạo tài khoản thành công!");
      } else {
        const error = await res.json();
        alert(`Lỗi: ${error.detail}`);
      }
    } catch (err) {
      alert("Đã xảy ra lỗi hệ thống.");
    }
  };

  const handleUpdateStatus = async (userId: number, newStatus: string) => {
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchUsers();
        alert("Cập nhật trạng thái thành công!");
      } else {
        const error = await res.json();
        alert(`Lỗi: ${error.detail}`);
      }
    } catch (err) {
      alert("Đã xảy ra lỗi hệ thống.");
    }
  };

  return (
    <div className="mx-auto max-w-[1440px] p-4 sm:p-6 lg:p-8">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-800">NovaBank CreditRisk</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Quản lý nhân viên</h1>
          <p className="mt-2 text-sm text-slate-600">Quản lý tài khoản nội bộ và trạng thái truy cập.</p>
        </div>
        <button 
          ref={openButtonRef}
          onClick={() => setShowModal(true)}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 sm:w-auto"
        >
          <Plus aria-hidden="true" className="size-5" />
          Thêm tài khoản
        </button>
      </header>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-600">
              <th scope="col" className="px-4 py-3.5 font-semibold">Họ tên</th>
              <th scope="col" className="px-4 py-3.5 font-semibold">Email</th>
              <th scope="col" className="px-4 py-3.5 font-semibold">Vai trò</th>
              <th scope="col" className="px-4 py-3.5 font-semibold">Trạng thái</th>
              <th scope="col" className="px-4 py-3.5 font-semibold">Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3.5 font-medium text-slate-900">{user.full_name}</td>
                <td className="px-4 py-3.5 text-slate-600">{user.email}</td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex min-h-7 items-center rounded-md px-2.5 py-1 text-xs font-semibold ${user.role === 'admin' ? 'bg-violet-50 text-violet-800' : 'bg-blue-50 text-blue-800'}`}>
                    {user.role.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active' ? 'bg-emerald-50 text-emerald-800' :
                      user.status === 'blocked' ? 'bg-red-50 text-red-800' :
                      'bg-amber-50 text-amber-800'
                    }`}>
                      {user.status.toUpperCase()}
                    </span>
                    {user.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateStatus(user.id, 'active')}
                        className="min-h-10 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800 transition-colors hover:bg-blue-100"
                      >
                        Kích hoạt
                      </button>
                    )}
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-sm text-slate-600">
                  {new Date(user.created_at).toLocaleDateString("vi-VN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && !usersLoaded && (
          <div role="status" className="flex items-center justify-center gap-2 border-t border-slate-200 px-4 py-8 text-sm text-slate-600">
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin text-blue-700" />
            Đang tải danh sách nhân viên...
          </div>
        )}
        {users.length === 0 && usersLoaded && !usersLoadError && (
          <div className="border-t border-slate-200 px-4 py-8 text-center text-sm text-slate-600">Chưa có tài khoản nhân viên.</div>
        )}
        {users.length === 0 && usersLoadError && (
          <div role="alert" className="border-t border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-800">Không thể tải danh sách nhân viên.</div>
        )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowModal(false); }}>
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="create-user-title" className="max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 shadow-xl sm:p-7">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 id="create-user-title" className="text-lg font-semibold text-slate-950 sm:text-xl">Thêm nhân viên mới</h2>
              <button type="button" aria-label="Đóng" onClick={() => setShowModal(false)} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900">
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-5">
              <div>
                <label htmlFor="new-user-name" className="mb-1.5 block text-sm font-semibold text-slate-700">Họ tên</label>
                <input id="new-user-name" required type="text" className="min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base text-slate-900 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 sm:text-sm" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} placeholder="Nhập họ và tên" />
              </div>
              <div>
                <label htmlFor="new-user-email" className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
                <input id="new-user-email" required type="email" className="min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base text-slate-900 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 sm:text-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="email@novabank.com" />
              </div>
              <div>
                <label htmlFor="new-user-password" className="mb-1.5 block text-sm font-semibold text-slate-700">Mật khẩu</label>
                <input id="new-user-password" required minLength={8} type="password" autoComplete="new-password" className="min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base text-slate-900 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 sm:text-sm" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Tối thiểu 8 ký tự" />
              </div>
              <div className="mt-7 flex flex-col-reverse justify-end gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="min-h-11 rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-200">Hủy bỏ</button>
                <button type="submit" className="min-h-11 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800">Tạo tài khoản</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
