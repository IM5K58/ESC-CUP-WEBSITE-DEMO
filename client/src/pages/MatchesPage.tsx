import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import type { Match, Team } from '../types';
import { fetchMatches, deleteMatch, fetchTeams, updateMatchTeams } from '../api/draftApi'; // ✨ updateMatchTeams 추가
import MatchDetailModal from '../components/MatchDetailModal';

export default function MatchesPage() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [teams, setTeams] = useState<Team[]>([]); // ✨ 팀 목록 State
    const [isAdmin, setIsAdmin] = useState(false);

    // 라이엇 데이터 로드용 State
    const [riotLoadData, setRiotLoadData] = useState({
        gameId: '',
        stage: ''
    });

    // 모달용 State
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

    const loadData = async () => {
        try {
            const mData = await fetchMatches();
            const tData = await fetchTeams();
            setMatches(mData);
            setTeams(tData);

            // ✨ [로직 수정] 'isAdmin' 문자열 대신 'token' 존재 여부로 관리자 판별
            const token = localStorage.getItem('token');
            setIsAdmin(!!token);
        } catch (error) {
            console.error("데이터 로딩 실패", error);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // --- [핸들러] 매치 삭제 ---
    const handleDelete = async (id: number) => {
        if(!confirm("정말 이 기록을 삭제하시겠습니까?")) return;
        await deleteMatch(id);
        loadData();
    }

    // --- [핸들러] 팀 변경 (관리자용) ---
    const handleTeamChange = async (match: Match, side: 'BLUE' | 'RED', newTeamIdStr: string) => {
        const newTeamId = Number(newTeamIdStr);

        try {
            // 기존 값 유지하면서 변경된 쪽만 업데이트
            const nextBlueId = side === 'BLUE' ? newTeamId : (match.blueTeamId || null);
            const nextRedId = side === 'RED' ? newTeamId : (match.redTeamId || null);

            await updateMatchTeams(match.id, nextBlueId, nextRedId);
            loadData(); // 화면 갱신
        } catch (e) {
            console.error("팀 업데이트 실패", e);
            alert("팀 변경 중 오류가 발생했습니다.");
        }
    };

    // --- [핸들러] 라이엇 API 로드 ---
    const handleLoadRiot = async () => {
        if (!riotLoadData.gameId) return alert("경기 ID를 입력해주세요!");

        try {
            alert("데이터를 불러오는 중입니다...");

            await axios.post('/api/matches/load', {
                gameId: riotLoadData.gameId.trim(),
                stage: riotLoadData.stage
            });

            alert("✅ 경기 정보를 성공적으로 불러왔습니다!");
            setRiotLoadData({ ...riotLoadData, gameId: '' });
            loadData();
        } catch (e: any) {
            console.error(e);
            const errMsg = e.response?.data?.message || "불러오기 실패! (ID 확인 필요)";
            alert(`❌ 오류 발생: ${errMsg}`);
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen font-sans p-8">
            {/* 헤더 */}
            <header className="flex justify-between items-center mb-8 max-w-5xl mx-auto">
                <h1 className="text-3xl font-extrabold text-blue-900">🏆 ESC CUP MATCHES</h1>
                <div className="flex gap-4 items-center">
                    {isAdmin && <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold border border-red-200">Admin Mode</span>}
                </div>
            </header>

            <div className="max-w-5xl mx-auto flex flex-col gap-6">

                {/* 관리자 패널 */}
                {isAdmin && (
                    <div className="bg-indigo-50 p-6 rounded-xl shadow-sm border border-indigo-100">
                        <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2 text-lg">
                            ⚡ Riot API 경기 불러오기
                            <span className="text-[10px] bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full">Beta</span>
                        </h3>
                        <div className="flex gap-3 items-center flex-wrap">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-bold text-indigo-400 ml-1">GAME ID</span>
                                <input
                                    className="border border-indigo-200 p-3 rounded-lg w-72 focus:outline-none focus:border-indigo-500 shadow-sm"
                                    placeholder="예: 7123456789"
                                    value={riotLoadData.gameId}
                                    onChange={e => setRiotLoadData({...riotLoadData, gameId: e.target.value})}
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-bold text-indigo-400 ml-1">STAGE</span>
                                <input
                                    className="border border-indigo-200 p-3 rounded-lg w-32 text-center focus:outline-none focus:border-indigo-500 shadow-sm"
                                    placeholder="예: 8강"
                                    value={riotLoadData.stage}
                                    onChange={e => setRiotLoadData({...riotLoadData, stage: e.target.value})}
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-bold text-transparent ml-1">ACTION</span>
                                <button
                                    onClick={handleLoadRiot}
                                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 shadow-md transition-all active:scale-95 flex items-center gap-2"
                                >
                                    <span>📥 불러오기</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 대진표 리스트 */}
                <div className="grid gap-4">
                    {matches.map(match => {
                        const isBlueWin = match.score === '1:0';
                        const isRedWin = match.score === '0:1';

                        return (
                            <div key={match.id} className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col md:flex-row border-l-8 border-blue-500 relative transition-all hover:shadow-lg">

                                {isAdmin && (
                                    <button onClick={() => handleDelete(match.id)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500 font-bold p-1 z-20" title="기록 삭제">✖</button>
                                )}

                                {/* 왼쪽: 단계 */}
                                <div className="bg-gray-50 p-4 flex flex-col items-center justify-center md:w-32 border-b md:border-b-0 md:border-r shrink-0">
                                    <span className="font-bold text-gray-600">{match.stage}</span>
                                    <span className="text-[10px] text-gray-400 mt-1">{match.id}번 경기</span>
                                </div>

                                {/* 오른쪽: 매치 정보 */}
                                <div className="flex-1 p-6 flex items-center justify-between relative">

                                    {/* === 블루팀 영역 === */}
                                    <div className={`flex-1 text-center p-4 rounded-lg transition-colors ${isBlueWin ? 'bg-blue-50 ring-1 ring-blue-200' : ''}`}>
                                        {isAdmin ? (
                                            // ✨ 관리자: 팀 선택 드롭다운 (Select)
                                            <select
                                                className="font-bold text-xl text-center bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none w-full appearance-none cursor-pointer hover:bg-black/5 rounded px-2 py-1"
                                                value={match.blueTeamId || ""}
                                                onChange={(e) => handleTeamChange(match, 'BLUE', e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <option value="">(Blue Team)</option>
                                                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                            </select>
                                        ) : (
                                            // 일반 유저: 텍스트 표시
                                            <div className={`font-bold text-xl ${isBlueWin ? 'text-blue-600' : 'text-gray-800'}`}>
                                                {match.blueTeamName || "Blue Team"}
                                            </div>
                                        )}
                                        {isBlueWin && <span className="text-xs text-blue-500 font-bold block mt-1">WINNER 👑</span>}
                                    </div>

                                    {/* 중앙 VS & 버튼 */}
                                    <div className="px-6 flex flex-col items-center justify-center min-w-[120px]">
                                        <span className="text-gray-200 font-black text-3xl italic mb-3 select-none">VS</span>
                                        <button
                                            onClick={() => setSelectedMatch(match)}
                                            className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold px-4 py-2 rounded-full transition-colors flex items-center gap-1 shadow-sm border border-gray-200"
                                        >
                                            🔍 상세 기록
                                        </button>
                                    </div>

                                    {/* === 레드팀 영역 === */}
                                    <div className={`flex-1 text-center p-4 rounded-lg transition-colors ${isRedWin ? 'bg-red-50 ring-1 ring-red-200' : ''}`}>
                                        {isAdmin ? (
                                            // ✨ 관리자: 팀 선택 드롭다운 (Select)
                                            <select
                                                className="font-bold text-xl text-center bg-transparent border-b border-gray-300 focus:border-red-500 focus:outline-none w-full appearance-none cursor-pointer hover:bg-black/5 rounded px-2 py-1"
                                                value={match.redTeamId || ""}
                                                onChange={(e) => handleTeamChange(match, 'RED', e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <option value="">(Red Team)</option>
                                                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                            </select>
                                        ) : (
                                            // 일반 유저: 텍스트 표시
                                            <div className={`font-bold text-xl ${isRedWin ? 'text-red-600' : 'text-gray-800'}`}>
                                                {match.redTeamName || "Red Team"}
                                            </div>
                                        )}
                                        {isRedWin && <span className="text-xs text-red-500 font-bold block mt-1">WINNER 👑</span>}
                                    </div>

                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 모달 */}
            {selectedMatch && (
                <MatchDetailModal
                    match={selectedMatch}
                    onClose={() => setSelectedMatch(null)}
                />
            )}
        </div>
    );
}