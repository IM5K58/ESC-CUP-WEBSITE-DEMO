import React from 'react';
// ✅ models.ts 경로 확인
import type { MatchDto, Team } from '../types';

interface Props {
    match: MatchDto;
    isAdmin: boolean; // 관리자 여부를 받음
    teams?: Team[];
    onUpdate?: (id: number, data: any) => void;
    isFirstRound: boolean;
}

export default function BracketMatchCard({ match, isAdmin, teams, onUpdate, isFirstRound }: Props) {
    const isBlueWin = match.winnerTeamId === match.blueTeamId;
    const isRedWin = match.winnerTeamId === match.redTeamId;

    const handleTeamChange = (side: 'blue' | 'red', teamId: string) => {
        if (!onUpdate) return;
        if (side === 'blue') onUpdate(match.id, { blueTeamId: Number(teamId) });
        else onUpdate(match.id, { redTeamId: Number(teamId) });
    };

    const handleWin = (teamId: number | null) => {
        if (!onUpdate || !teamId) return;
        if (window.confirm("이 팀을 승리 처리하고 다음 라운드로 올리겠습니까?")) {
            onUpdate(match.id, { winnerTeamId: teamId, score: "Win" });
        }
    };

    return (
        <div className="w-56 bg-white border border-gray-300 rounded shadow-lg text-sm overflow-hidden relative z-10">
            <div className="bg-gray-100 text-xs text-center py-1 font-bold text-gray-600 border-b">
                {match.stage} {match.status === 'FINISHED' && <span className="text-green-600">(종료)</span>}
            </div>

            {/* --- [BLUE TEAM] --- */}
            <div className={`p-2 flex justify-between items-center ${isBlueWin ? 'bg-blue-100' : ''}`}>

                {/* ✨ 관리자이면서 && 첫 라운드일 때만 드롭다운 표시 */}
                {isAdmin && isFirstRound ? (
                    <select
                        className="w-full text-xs border rounded p-1"
                        value={match.blueTeamId || ""}
                        onChange={(e) => handleTeamChange('blue', e.target.value)}
                    >
                        <option value="">팀 선택</option>
                        {teams?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                ) : (
                    // 일반 유저거나 이미 진행된 라운드면 그냥 텍스트 표시
                    <span className={`font-bold truncate ${isBlueWin ? 'text-blue-700' : 'text-gray-800'}`}>
                {match.blueTeamName || "TBD"}
            </span>
                )}

                {/* ✨ 관리자일 때만 [승] 버튼 표시 */}
                {isAdmin && match.blueTeamId && !match.winnerTeamId && (
                    <button onClick={() => handleWin(match.blueTeamId)} className="ml-2 text-xs bg-blue-500 text-white px-1 rounded hover:bg-blue-600">승</button>
                )}
            </div>

            <div className="h-px bg-gray-200 mx-2"></div>

            {/* --- [RED TEAM] --- */}
            <div className={`p-2 flex justify-between items-center ${isRedWin ? 'bg-red-100' : ''}`}>

                {/* ✨ 관리자이면서 && 첫 라운드일 때만 드롭다운 표시 */}
                {isAdmin && isFirstRound ? (
                    <select
                        className="w-full text-xs border rounded p-1"
                        value={match.redTeamId || ""}
                        onChange={(e) => handleTeamChange('red', e.target.value)}
                    >
                        <option value="">팀 선택</option>
                        {teams?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                ) : (
                    <span className={`font-bold truncate ${isRedWin ? 'text-red-700' : 'text-gray-800'}`}>
                {match.redTeamName || "TBD"}
            </span>
                )}

                {/* ✨ 관리자일 때만 [승] 버튼 표시 */}
                {isAdmin && match.redTeamId && !match.winnerTeamId && (
                    <button onClick={() => handleWin(match.redTeamId)} className="ml-2 text-xs bg-red-500 text-white px-1 rounded hover:bg-red-600">승</button>
                )}
            </div>
        </div>
    );
}