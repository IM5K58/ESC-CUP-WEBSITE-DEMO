import { useEffect, useState } from 'react';
import {
    DndContext,
    type DragEndEvent,
    type DragStartEvent,
    DragOverlay,
    type DragOverEvent,
    pointerWithin // ✨ [수정] closestCenter 대신 pointerWithin 사용!
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Link } from 'react-router-dom';
import type { Team, Player } from '../types';
import { fetchTeams, fetchStandbyPlayers, assignPlayerToTeam, saveAllDraftState } from '../api/draftApi';
import { DraggablePlayer } from '../components/DraggablePlayer';
import { DroppableTeam } from '../components/DroppableTeam';
import { PlayerCard } from '../components/PlayerCard';
import { DroppableStandby } from '../components/DroppableStandby';

export default function DraftPage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [standbyPlayers, setStandbyPlayers] = useState<Player[]>([]);
    const [activePlayer, setActivePlayer] = useState<Player | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    // 1. 초기 데이터 로드
    useEffect(() => {
        const loadData = async () => {
            try {
                const teamData = await fetchTeams();
                const playerData = await fetchStandbyPlayers();
                setTeams(teamData);
                setStandbyPlayers(playerData);

                // ✨ [로직 수정] 'isAdmin' 문자열 대신 'token' 존재 여부로 관리자 판별
                const token = localStorage.getItem('token');
                setIsAdmin(!!token);
            } catch (error) {
                console.error("데이터 로드 실패", error);
            }
        };
        loadData();
    }, []);

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        if (active.data.current && active.data.current.player) {
            setActivePlayer(active.data.current.player);
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        // Sortable 기능이 handleDragEnd에서 arrayMove로 처리되므로 비워둡니다.
    };

    // ✨ 드래그 종료 핸들러 (순서 변경 + 팀 이동 로직 통합)
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActivePlayer(null);

        if (!over) return;

        const activeId = active.id.toString();
        const overId = over.id.toString();

        // ID에서 숫자만 추출
        const playerId = Number(activeId.replace('player-', ''));

        // --- [1] 같은 팀 내에서 순서 변경 (Reorder) 로직 ---
        const sourceTeam = teams.find(t => t.players.some(p => p.id === playerId));

        // 드롭한 대상이 '다른 선수'이고, 둘 다 '같은 팀' 소속이라면 -> 순서 바꾸기
        if (sourceTeam && overId.startsWith('player-')) {
            const overPlayerId = Number(overId.replace('player-', ''));
            const isSameTeam = sourceTeam.players.some(p => p.id === overPlayerId);

            if (isSameTeam) {
                if (playerId !== overPlayerId) {
                    setTeams(prevTeams => prevTeams.map(team => {
                        if (team.id === sourceTeam.id) {
                            const oldIndex = team.players.findIndex(p => p.id === playerId);
                            const newIndex = team.players.findIndex(p => p.id === overPlayerId);
                            // 배열 내 위치 이동 (Sortable 핵심 기능)
                            return {
                                ...team,
                                players: arrayMove(team.players, oldIndex, newIndex)
                            };
                        }
                        return team;
                    }));
                }
                return; // 순서 변경만 하고 종료
            }
        }

        // --- [2] 다른 곳으로 이동 (팀 간 이동 or 대기 명단 이동) ---

        let targetTeamId: number | null = null;
        let isTargetStandby = false;

        // 드롭한 곳이 '팀 박스(team-xx)'인지, '선수(player-yy)' 위인지, '대기 명단'인지 판별
        if (overId.startsWith('team-')) {
            targetTeamId = Number(overId.replace('team-', ''));
        } else if (overId.startsWith('player-')) {
            // 남의 팀 선수 위로 드롭했을 때 -> 그 선수의 팀으로 이동
            const overPlayerId = Number(overId.replace('player-', ''));
            const foundTeam = teams.find(t => t.players.some(p => p.id === overPlayerId));
            if (foundTeam) targetTeamId = foundTeam.id;
        } else if (overId === 'standby-zone') {
            isTargetStandby = true;
        }

        // 이동할 선수 객체 찾기
        let targetPlayer = standbyPlayers.find(p => p.id === playerId);
        let source = 'standby';

        if (!targetPlayer) {
            for (const team of teams) {
                const found = team.players.find(p => p.id === playerId);
                if (found) {
                    targetPlayer = found;
                    source = 'team';
                    break;
                }
            }
        }
        if (!targetPlayer) return;

        // A. 대기 명단으로 이동
        if (isTargetStandby) {
            if (source === 'standby') return;

            // 기존 팀에서 제거
            setTeams(prev => prev.map(t => ({...t, players: t.players.filter(p => p.id !== playerId)})));
            // 대기 명단 추가
            setStandbyPlayers(prev => [...prev, { ...targetPlayer!, teamId: null }]);
            return;
        }

        // B. 팀으로 이동
        if (targetTeamId !== null) {
            const targetTeam = teams.find(t => t.id === targetTeamId);
            if (!targetTeam) return;

            // 이미 그 팀에 있는 경우 (순서 변경 로직에서 처리 안 된 예외 케이스)
            if (targetTeam.players.some(p => p.id === playerId)) return;

            // 정원 5명 체크
            if (targetTeam.players.length >= 5) {
                return; // 꽉 찼으면 튕겨내기
            }

            // 1) 원래 자리에서 제거
            if (source === 'standby') {
                setStandbyPlayers(prev => prev.filter(p => p.id !== playerId));
            } else {
                setTeams(prev => prev.map(t => ({...t, players: t.players.filter(p => p.id !== playerId)})));
            }

            // 2) 새 팀에 추가
            setTeams(prev => prev.map(t => {
                if (t.id === targetTeamId) {
                    return {
                        ...t,
                        players: [...t.players, { ...targetPlayer!, teamId: targetTeamId! }]
                    };
                }
                return t;
            }));
        }
    };

    const handleSaveAll = async () => {
        if (!confirm("현재 배치된 상태로 서버에 저장하시겠습니까? (기존 데이터 덮어씀)")) return;
        try {
            const batchRequests: any[] = [];
            for (const team of teams) {
                for (const player of team.players) {
                    batchRequests.push({ playerId: player.id, teamId: team.id });
                }
            }
            for (const player of standbyPlayers) {
                batchRequests.push({ playerId: player.id, teamId: null });
            }
            await saveAllDraftState(batchRequests);
            alert("✅ 모든 팀 배치가 서버에 안전하게 저장되었습니다!");

            // 데이터 재로딩
            const teamData = await fetchTeams();
            const playerData = await fetchStandbyPlayers();
            setTeams(teamData);
            setStandbyPlayers(playerData);
        } catch (error) {
            console.error(error);
            alert("❌ 저장 중 오류가 발생했습니다.");
        }
    };

    return (
        <DndContext
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            // ✨ [수정] 박스 범위 안에만 들어오면 인식하도록 변경
            collisionDetection={pointerWithin}
        >
            <div className="bg-gray-100 h-screen font-sans flex flex-col overflow-hidden">
                {/* 헤더 */}
                <header className="bg-white shadow-sm py-4 px-8 flex justify-between items-center z-10 shrink-0">
                    <div>
                        <h1 className="text-2xl font-extrabold text-blue-900 flex items-center gap-2">
                            ESC CUP DRAFT <span className="text-sm font-normal text-gray-400 bg-gray-100 px-2 py-1 rounded">Beta</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* ✨ [추가 3] isAdmin이 true일 때만 저장 버튼 표시 */}
                        {isAdmin && (
                            <button onClick={handleSaveAll} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-full shadow transition-transform transform hover:scale-105 text-sm">
                                💾 현재 상태 확정 저장
                            </button>
                        )}
                    </div>
                </header>

                {/* 메인 컨텐츠 */}
                <div className="flex-1 p-6 flex gap-6 overflow-hidden">
                    {/* 👈 [왼쪽] 팀 박스 영역 (세로 1열 배치) */}
                    <div className="w-8/12 flex flex-col gap-4 h-full">
                        <h2 className="text-lg font-bold text-gray-700 shrink-0">📋 팀 편성 현황</h2>
                        <div className="flex-1 overflow-y-auto pr-2">
                            <div className="flex flex-col gap-3">
                                {teams.map((team) => (
                                    <DroppableTeam key={team.id} team={team} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 👉 [오른쪽] 대기 선수 영역 (그리드) */}
                    <div className="w-4/12 h-full">
                        <DroppableStandby count={standbyPlayers.length}>
                            {standbyPlayers.map((player) => (
                                <DraggablePlayer key={player.id} player={player} />
                            ))}
                        </DroppableStandby>
                    </div>
                </div>
            </div>

            <DragOverlay>
                {activePlayer ? <PlayerCard player={activePlayer} isOverlay /> : null}
            </DragOverlay>
        </DndContext>
    );
}