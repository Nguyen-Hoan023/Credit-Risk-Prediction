"use client";

import { useEffect, useState } from "react";
import { getAccessToken } from "@/lib/auth";
import { Plus } from "lucide-react";
import { API_BASE_URL } from "@/lib/constants";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ full_name: "", email: "", password: "", role: "staff" });

  const fetchUsers = () => {
    const token = getAccessToken();
    if (token) {
      fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setUsers(data.users || []))
      .catch(err => console.error("Error fetching users:", err));
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
    <div className="p-8 relative h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Quản lý nhân viên</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Thêm tài khoản
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
              <th className="p-4 font-medium">Họ tên</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Vai trò</th>
              <th className="p-4 font-medium">Trạng thái</th>
              <th className="p-4 font-medium">Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900">{user.full_name}</td>
                <td className="p-4 text-gray-600">{user.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {user.role.toUpperCase()}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active' ? 'bg-green-100 text-green-700' :
                      user.status === 'blocked' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {user.status.toUpperCase()}
                    </span>
                    {user.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateStatus(user.id, 'active')}
                        className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-md border border-blue-200 transition-colors font-medium"
                      >
                        Kích hoạt
                      </button>
                    )}
                  </div>
                </td>
                <td className="p-4 text-gray-500 text-sm">
                  {new Date(user.created_at).toLocaleDateString("vi-VN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Thêm nhân viên mới</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Họ tên</label>
                <input required type="text" className="w-full border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl p-3 outline-none transition-all" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} placeholder="Nhập họ và tên" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                <input required type="email" className="w-full border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl p-3 outline-none transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="email@novabank.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mật khẩu</label>
                <input required minLength={8} type="text" className="w-full border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl p-3 outline-none transition-all" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Tối thiểu 8 ký tự" />
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Hủy bỏ</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl shadow-sm hover:bg-blue-700 transition-colors">Tạo tài khoản</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
