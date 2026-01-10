import React, { useEffect, useState } from 'react';
import axios from 'axios';
// ✅ models.ts 경로 확인
import type { MatchDto, Team } from '../types';
import BracketMatchCard from '../components/BracketMatchCard';

export default function TournamentPage() {
    const [matches, setMatches] = useState<MatchDto[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [teamCount, setTeamCount] = useState(8);

    // ✨ [수정 1] 기본값을 false로 변경 (보안을 위해 일단 닫아둠)
    const [isAdmin, setIsAdmin] = useState(false);

    // ✨ [수정 2] 토큰이 있을 때만 관리자 모드 활성화
    useEffect(() => {
        // 1. 로컬 스토리지에 진짜 뭐가 들어있는지 확인해봅니다.
        const token = localStorage.getItem('token');

        console.log("============ 토큰 확인 ============");
        console.log("읽어온 토큰 값:", token);
        console.log("==================================");

        if (token) {
            setIsAdmin(true);
        } else {
            setIsAdmin(false);
        }
    }, []);

    const fetchData = async () => {
        try {
            const matchRes = await axios.get('/api/matches');

            if (Array.isArray(matchRes.data)) {
                const tournamentMatches = matchRes.data
                    .filter((m: any) => m.round)
                    .sort((a: any, b: any) => a.id - b.id);
                setMatches(tournamentMatches);
            } else {
                setMatches([]);
            }

            const teamRes = await axios.get('/api/teams');
            if (Array.isArray(teamRes.data)) {
                setTeams(teamRes.data);
            }

        } catch (e) {
            console.error("데이터 로딩 실패:", e);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleCreateEmpty = async () => {
        if (!window.confirm(`기존 대진표를 지우고 ${teamCount}강 빈 틀을 새로 만듭니까?`)) return;
        try {
            await axios.post(`/api/tournament/create-empty?teamCount=${teamCount}`);
            fetchData();
        } catch (e) { alert("생성 실패"); }
    };

    const handleUpdate = async (matchId: number, updateData: Partial<MatchDto>) => {
        try {
            await axios.put(`/api/tournament/${matchId}`, updateData);
            fetchData();
        } catch (e) { alert("업데이트 실패"); }
    };

    const round8 = matches.filter(m => m.round === 8);
    const round4 = matches.filter(m => m.round === 4);
    const final = matches.filter(m => m.round === 2);

    return (
        <div className="p-8 min-h-screen bg-gray-50 overflow-x-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">🏆 ESC CUP 토너먼트</h1>

                {/* ✅ isAdmin이 true일 때만 관리자 도구가 보입니다 */}
                {isAdmin && (
                    <div className="flex items-center gap-4 bg-white p-2 rounded shadow">
                        <span className="font-bold text-blue-600">⚙️ 관리자 모드:</span>
                        <select
                            value={teamCount}
                            onChange={(e) => setTeamCount(Number(e.target.value))}
                            className="border p-1 rounded"
                        >
                            <option value={4}>4강</option>
                            <option value={8}>8강</option>
                        </select>
                        <button
                            onClick={handleCreateEmpty}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm font-bold"
                        >
                            빈 대진표 새로 만들기
                        </button>
                    </div>
                )}
            </div>

            <div className="flex gap-16 justify-center min-w-[1000px]">
                {/* 8강 */}
                {round8.length > 0 && (
                    <div className="flex flex-col gap-8 justify-center">
                        {round8.map((m, idx) => (
                            <div key={m.id} className="relative flex items-center">
                                <BracketMatchCard
                                    match={m}
                                    isAdmin={isAdmin} // 여기서 false가 넘어가면 카드 내부 수정 기능이 잠깁니다
                                    teams={teams}
                                    onUpdate={handleUpdate}
                                    isFirstRound={true}
                                />
                                <div className="absolute -right-8 w-8 h-px bg-gray-400"></div>
                                {idx % 2 === 0 && <div className="absolute -right-8 w-px bg-gray-400 h-[calc(100%+2rem)] top-1/2 translate-y-px"></div>}
                            </div>
                        ))}
                    </div>
                )}

                {/* 4강 */}
                <div className="flex flex-col gap-24 justify-center">
                    {round4.map((m, idx) => (
                        <div key={m.id} className="relative flex items-center">
                            <div className="absolute -left-8 w-8 h-px bg-gray-400"></div>
                            <BracketMatchCard
                                match={m}
                                isAdmin={isAdmin}
                                teams={teams}
                                onUpdate={handleUpdate}
                                isFirstRound={round8.length === 0}
                            />
                            <div className="absolute -right-8 w-8 h-px bg-gray-400"></div>
                            {idx % 2 === 0 && <div className="absolute -right-8 w-px bg-gray-400 h-[calc(100%+6rem)] top-1/2 translate-y-px"></div>}
                        </div>
                    ))}
                </div>

                {/* 결승 */}
                <div className="flex flex-col justify-center">
                    {final.map(m => (
                        <div key={m.id} className="relative flex items-center">
                            <div className="absolute -left-8 w-8 h-px bg-gray-400"></div>
                            <div className="scale-110 border-2 border-yellow-400 rounded p-1">
                                <BracketMatchCard
                                    match={m}
                                    isAdmin={isAdmin}
                                    teams={teams}
                                    onUpdate={handleUpdate}
                                    isFirstRound={false}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}