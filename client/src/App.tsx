import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import TournamentPage from './pages/TournamentPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import MatchesPage from './pages/MatchesPage';
import DraftPage from './pages/DraftPage';

function App() {
    return (
        <BrowserRouter>
            <header className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
                <div className="w-full px-8 py-4 flex justify-between items-center">
                    <Link to="/" className="text-2xl font-bold tracking-tighter text-blue-400 hover:text-blue-300">
                        ESC CUP
                    </Link>
                    <nav className="flex gap-6 text-sm font-medium">
                        <Link to="/" className="hover:text-blue-300">팀 드래프트</Link>
                        <Link to="/matches" className="hover:text-blue-300">경기 결과</Link>
                        <Link to="/tournament" className="text-yellow-400 hover:text-yellow-300">🏆 대진표</Link>

                        {/* ✨ [수정] 버튼 하나로 통합! */}
                        {/* 이 버튼을 누르면 무조건 /admin으로 갑니다. (거기서 검사함) */}
                        <Link to="/admin" className="hover:text-blue-300 flex items-center gap-1 font-bold">
                            ⚙️ 관리자
                        </Link>
                    </nav>
                </div>
            </header>

            <div className="flex-1">
                <Routes>
                    <Route path="/" element={<DraftPage />} />
                    <Route path="/matches" element={<MatchesPage />} />
                    <Route path="/tournament" element={<TournamentPage />} />

                    {/* 로그인 페이지 */}
                    <Route path="/login" element={<LoginPage />} />

                    {/* 관리자 페이지 (여기가 검문소입니다) */}
                    <Route path="/admin" element={<AdminPage />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}
export default App;