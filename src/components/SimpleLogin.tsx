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
    <div className="min-h-screen bg-[#1C2229] flex items-center justify-center p-6" dir="rtl">
      <div className="bg-[#2A323A] border border-[#3A434C] p-8 rounded-2xl shadow-xl w-full max-w-sm space-y-4">
        <h2 className="text-xl font-bold text-[#F1F5F9] text-center">
          تسجيل الدخول - {portal === 'hq' ? 'غرفة العمليات المركزية (HQ)' : 'بوابة الاستقبال'}
        </h2>
        {localError && <p className="text-[#D64545] text-xs text-center">{localError}</p>}
        <input
          type="text"
          placeholder="اسم المستخدم"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 glass-input rounded-xl text-xs placeholder:text-[#7C8791]"
        />
        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 glass-input rounded-xl text-xs placeholder:text-[#7C8791]"
        />
        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-[#315EF5] text-white rounded-xl text-xs font-bold hover:bg-[#315EF5]/90 transition-all shadow"
        >
          دخول
        </button>
      </div>
    </div>
  );
};
