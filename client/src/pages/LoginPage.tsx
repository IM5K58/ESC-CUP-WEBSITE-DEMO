import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/admin/login', { password });
            const token = res.data.token;

            if (token) {
                localStorage.setItem('token', token);
                // ✨ [수정] 로그인 성공 시 -> '팀/선수 관리' 페이지로 이동
                alert("반갑노 ");
                navigate('/admin');
            }
        } catch (error) {
            alert("비밀번호가 틀렸습니다!");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100">
            <div className="bg-white p-8 rounded shadow-lg w-96 border border-gray-200">
                <h1 className="text-2xl font-bold mb-6 text-center text-blue-900">관리자 로그인</h1>
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <input
                        type="password"
                        className="w-full border p-2 rounded"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded">
                        로그인
                    </button>
                </form>
                <button onClick={() => navigate('/')} className="mt-4 text-sm text-gray-500 hover:underline">
                    ← 메인으로 돌아가기
                </button>
            </div>
        </div>
    );
}