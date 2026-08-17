import React, { useState } from 'react';

interface SimpleLoginProps {
  portal: 'hq' | 'reception';
  onLogin: (username: string, password: string) => void;
  error: string;
}

export const SimpleLogin: React.FC<SimpleLoginProps> = ({ portal, onLogin, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(error);

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, portal })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('user_role', data.role);
        onLogin(username, password);
      } else {
        const data = await res.json();
        setLocalError(data.error || 'خطأ في تسجيل الدخول');
      }
    } catch (e) {
      setLocalError('تعذر الاتصال بالخادم');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6" dir="rtl">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900 text-center">
          تسجيل الدخول - {portal === 'hq' ? 'غرفة العمليات المركزية (HQ)' : 'بوابة الاستقبال'}
        </h2>
        {localError && <p className="text-red-500 text-xs text-center">{localError}</p>}
        <input
          type="text"
          placeholder="اسم المستخدم"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
        />
        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
        />
        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700"
        >
          دخول
        </button>
      </div>
    </div>
  );
};
