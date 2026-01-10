// client/src/pages/AdminPage.tsx

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import type { Player, Team } from '../types';

const ADMIN_API = '/api/admin';

// ✨ 티어 목록 상수 (재사용을 위해 정의)
const TIER_OPTIONS = [
    "Challenger", "GrandMaster", "Master",
    "Diamond", "Emerald", "Platinum",
    "Gold", "Silver", "Bronze", "Iron"
];

// ✨ TeamItem 컴포넌트 (변경 없음)
function TeamItem({ team, onChangeName, onDelete }: {
    team: Team,
    onChangeName: (id: number, newName: string) => void,
    onDelete: (id: number) => void
}) {
    return (
        <div className="border p-3 rounded bg-gray-50 flex flex-col gap-2 shadow-sm">
            <div className="text-xs text-gray-500">ID: {team.id}</div>

            <input
                className="border p-1 rounded font-bold text-center w-full focus:border-blue-500 outline-none"
                value={team.name}
                onChange={(e) => onChangeName(team.id, e.target.value)}
                placeholder="팀 이름"
            />

            <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-400">인원: {team.players.length}명</span>
                <button
                    onClick={() => onDelete(team.id)}
                    className="text-red-500 hover:text-red-700 text-xs underline"
                    tabIndex={-1}
                >
                    팀 삭제
                </button>
            </div>
        </div>
    );
}

// === 메인 관리자 페이지 ===
export default function AdminPage() {
    const navigate = useNavigate();

    // 로딩 상태 (안전장치)
    const [isLoading, setIsLoading] = useState(true);

    const [players, setPlayers] = useState<Player[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);

    // ✨ [수정] formData에 highestTier 추가
    const [formData, setFormData] = useState({
        name: '',
        tier: 'Gold',        // 현재 티어
        highestTier: 'Gold', // 최고 티어 (추가됨)
        position: 'TOP',
        opggUrl: ''
    });

    // 페이지 로드 시 토큰 검사
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        } else {
            setIsLoading(false);
            fetchTeams();
            fetchData();
        }
    }, [navigate]);

    const fetchTeams = async () => {
        try {
            const res = await axios.get('/api/teams');
            // 배열 확인 안전장치 유지
            setTeams(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            console.error(e);
            setTeams([]);
        }
    };

    const fetchData = async () => {
        try {
            const pRes = await axios.get<Player[]>(`${ADMIN_API}/players`);
            const tRes = await axios.get<Team[]>(`${ADMIN_API}/teams`);

            // 배열 확인 안전장치 유지
            setPlayers(Array.isArray(pRes.data) ? pRes.data : []);
            setTeams(Array.isArray(tRes.data) ? tRes.data : []);
        } catch (e) {
            console.error("데이터 로드 실패");
            setPlayers([]);
            setTeams([]);
        }
    };

    // --- 선수 핸들러 ---
    const handleAddPlayer = async () => {
        if (!formData.name.trim()) return alert("이름을 입력하세요!");
        if (!formData.name.includes('#')) {
            return alert("Riot ID 형식으로 입력해주세요! (예: Faker #KR1)");
        }
        try {
            // formData 안에 highestTier가 이미 들어있으므로 그대로 전송
            await axios.post(`${ADMIN_API}/players`, formData);
            // 초기화
            setFormData({ ...formData, name: '' });
            fetchData();
        } catch (e) { alert("추가 실패"); }
    };

    const handleDeletePlayer = async (id: number) => {
        if (!confirm("정말 삭제하시겠습니까?")) return;
        await axios.delete(`${ADMIN_API}/players/${id}`);
        fetchData();
    };

    const handleDeleteAllPlayers = async () => {
        if (!confirm("⚠️ 모든 선수가 삭제됩니다!")) return;
        await axios.delete(`${ADMIN_API}/players/all`);
        fetchData();
    };

    // --- 팀 핸들러 (변경 없음) ---
    const handleAddTeam = async () => {
        await axios.post(`${ADMIN_API}/teams`, {});
        fetchData();
    };

    const handleDeleteTeam = async (id: number) => {
        if (!confirm("팀을 삭제하시겠습니까? 소속 선수는 대기 명단으로 이동됩니다.")) return;
        await axios.delete(`${ADMIN_API}/teams/${id}`);
        fetchData();
    };

    const handleLocalNameChange = (id: number, newName: string) => {
        setTeams(prevTeams => prevTeams.map(team =>
            team.id === id ? { ...team, name: newName } : team
        ));
    };

    const handleSaveAllTeams = async () => {
        if (!confirm("변경된 팀 이름을 모두 저장하시겠습니까?")) return;
        try {
            const promises = teams.map(team =>
                axios.put(`${ADMIN_API}/teams/${team.id}`, { name: team.name })
            );
            await Promise.all(promises);
            alert("✅ 모든 팀 이름이 저장되었습니다!");
            fetchData();
        } catch (e) {
            console.error(e);
            alert("❌ 저장 중 일부 오류가 발생했습니다.");
        }
    };

    const handleDeleteAllTeams = async () => {
        if (!confirm("⚠️ 경고: 모든 팀을 삭제하시겠습니까?")) return;
        if (!confirm("소속된 선수들은 모두 '대기 명단'으로 이동합니다. 진행할까요?")) return;
        try {
            await axios.delete(`${ADMIN_API}/teams/all`);
            alert("🗑️ 모든 팀이 삭제되었습니다.");
            fetchData();
        } catch (e) {
            console.error(e);
            alert("팀 삭제 실패 (서버 에러)");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        alert("로그아웃 되었습니다.");
        window.location.replace('/');
    };

    if (isLoading) {
        return null;
    }

    return (
        <div className="p-8 max-w-5xl mx-auto pb-20">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">⚙️ 관리자 페이지</h1>

                <button
                    onClick={handleLogout}
                    className="bg-gray-800 text-white text-sm px-3 py-1.5 rounded hover:bg-black transition-colors"
                >
                    로그아웃
                </button>
            </div>

            {/* 1. 통계 */}
            <div className="bg-white p-4 rounded shadow mb-8 flex justify-between items-center">
                <div>
                    <span className="text-gray-600 font-bold">총 선수: </span>
                    <span className="text-blue-600 font-bold mr-4">{players.length}명</span>
                    <span className="text-gray-600 font-bold">총 팀: </span>
                    <span className="text-blue-600 font-bold">{teams.length}개</span>
                </div>
                <button
                    onClick={handleDeleteAllPlayers}
                    className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700 shadow text-sm"
                >
                    선수 전체 초기화
                </button>
            </div>

            {/* 2. 팀 관리 섹션 */}
            <div className="bg-white p-6 rounded shadow mb-8 border-t-4 border-indigo-500">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-indigo-900"> 팀 관리</h2>

                    <div className="flex gap-2">
                        <button onClick={handleAddTeam} className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 text-sm font-bold">
                            + 팀 추가
                        </button>

                        <button
                            onClick={handleSaveAllTeams}
                            className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700 text-sm font-bold shadow transition-transform transform hover:scale-105"
                        >
                            팀 변경사항 전체 저장
                        </button>

                        <button
                            onClick={handleDeleteAllTeams}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm font-bold shadow ml-2"
                        >
                            팀 전체 초기화
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* 안전장치 유지 */}
                    {Array.isArray(teams) && teams.map(team => (
                        <TeamItem
                            key={team.id}
                            team={team}
                            onChangeName={handleLocalNameChange}
                            onDelete={handleDeleteTeam}
                        />
                    ))}
                </div>
            </div>

            {/* 3. 선수 등록 폼 */}
            {/* ✨ [수정] 티어 입력을 2개로 분리 (현재 / 최고) */}
            <div className="bg-gray-50 p-4 rounded border mb-4">
                <h2 className="font-bold mb-2">➕ 선수 등록</h2>
                <div className="flex gap-2 flex-wrap items-end">

                    {/* 이름 입력 */}
                    <div className="flex-1 min-w-[200px]">
                        <label className="text-xs text-gray-500 ml-1 mb-1 block">소환사명</label>
                        <input
                            className="border p-2 rounded w-full"
                            placeholder="예: Faker #KR1"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    {/* 현재 티어 */}
                    <div>
                        <label className="text-xs text-gray-500 ml-1 mb-1 block">현재 티어</label>
                        <select
                            className="border p-2 rounded w-32"
                            value={formData.tier}
                            onChange={e => setFormData({...formData, tier: e.target.value})}
                        >
                            {TIER_OPTIONS.map(t => <option key={t}>{t}</option>)}
                        </select>
                    </div>

                    {/* 최고 티어 */}
                    <div>
                        <label className="text-xs text-blue-600 font-bold ml-1 mb-1 block">최고 티어</label>
                        <select
                            className="border p-2 rounded w-32 border-blue-200 bg-blue-50"
                            value={formData.highestTier}
                            onChange={e => setFormData({...formData, highestTier: e.target.value})}
                        >
                            {TIER_OPTIONS.map(t => <option key={t}>{t}</option>)}
                        </select>
                    </div>

                    {/* 포지션 */}
                    <div>
                        <label className="text-xs text-gray-500 ml-1 mb-1 block">포지션</label>
                        <select
                            className="border p-2 rounded w-24"
                            value={formData.position}
                            onChange={e => setFormData({...formData, position: e.target.value})}
                        >
                            <option>TOP</option>
                            <option>JUG</option>
                            <option>MID</option>
                            <option>ADC</option>
                            <option>SUP</option>
                        </select>
                    </div>

                    <button
                        onClick={handleAddPlayer}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-bold h-[42px]"
                    >
                        추가
                    </button>
                </div>
                <p className="text-xs text-gray-400 mt-2 ml-1">
                    * 닉네임과 태그(#)를 정확히 입력하면 전적 링크가 자동 생성됩니다.
                </p>
            </div>

            {/* 4. 선수 목록 테이블 */}
            <div className="overflow-x-auto">
                <table className="w-full bg-white border shadow-sm text-sm">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="p-3 text-left">ID</th>
                        <th className="p-3 text-left">이름 (#태그)</th>
                        {/* ✨ 헤더 수정 */}
                        <th className="p-3 text-left">티어 (현재 / 최고)</th>
                        <th className="p-3 text-left">포지션</th>
                        <th className="p-3 text-left">소속팀</th>
                        <th className="p-3 text-center">전적</th>
                        <th className="p-3 text-center">관리</th>
                    </tr>
                    </thead>
                    <tbody>
                    {/* 안전장치 유지 */}
                    {Array.isArray(players) && players.map(player => {
                        const [pName, pTag] = player.name.split('#');
                        const linkUrl = pTag
                            ? `https://www.op.gg/summoners/kr/${pName.trim().replace(/\s+/g, '%20')}-${pTag.trim()}`
                            : 'https://www.op.gg';

                        return (
                            <tr key={player.id} className="border-t hover:bg-gray-50">
                                <td className="p-3">{player.id}</td>
                                <td className="p-3 font-bold">{player.name}</td>

                                {/* ✨ 티어 2개 표시 */}
                                <td className="p-3">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-800">{player.tier}</span>
                                        {/* 최고 티어가 있으면 표시, 없으면 현재 티어와 같다고 가정 */}
                                        <span className="text-xs text-blue-500 font-medium">
                                            Max: {player.highestTier || player.tier}
                                        </span>
                                    </div>
                                </td>

                                <td className="p-3">{player.position}</td>
                                <td className="p-3 text-gray-500">
                                    {player.teamId ? `Team ${player.teamId}` : '-'}
                                </td>

                                <td className="p-3 text-center">
                                    <a
                                        href={linkUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="bg-gray-100 text-blue-600 px-2 py-1 rounded text-xs hover:bg-blue-100 font-bold"
                                    >
                                        OP.GG
                                    </a>
                                </td>

                                <td className="p-3 text-center">
                                    <button
                                        onClick={() => handleDeletePlayer(player.id)}
                                        className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                                    >
                                        삭제
                                    </button>
                                </td>
                            </tr>
                        )})}
                    </tbody>
                </table>
            </div>
        </div>
    );
}