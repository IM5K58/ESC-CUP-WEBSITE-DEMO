// client/src/components/DroppableTeam.tsx

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { DraggablePlayer } from './DraggablePlayer';
import type { Team, Player } from '../types';

interface Props {
    team: Team;
}

export function DroppableTeam({ team }: Props) {
    const { setNodeRef, isOver, active } = useDroppable({
        id: `team-${team.id}`,
        data: { teamId: team.id },
    });

    const isFull = team.players.length >= 5;
    const isDraggingMember = active?.data.current?.player?.teamId === team.id;
    const showWarning = isOver && isFull && !isDraggingMember;

    let borderColor = '#e5e7eb';
    let bgColor = '#f9fafb';

    if (isOver) {
        if (showWarning) {
            borderColor = '#ef4444';
            bgColor = '#fef2f2';
        } else {
            borderColor = '#3b82f6';
            bgColor = '#eff6ff';
        }
    }

    // ✨ SortableContext에 넘겨줄 ID 목록 추출
    const playerIds = team.players.map(p => `player-${p.id}`);

    return (
        <div
            ref={setNodeRef}
            style={{ borderColor, backgroundColor: bgColor }}
            className="border-2 border-dashed rounded-lg p-3 transition-colors duration-200 relative"
        >
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg text-gray-700 flex items-center gap-2">
                    {team.name}
                    {isFull && <span className="text-green-500 text-xs">✅ Completed</span>}
                </h3>
                <span className={`text-sm font-bold ${isFull ? 'text-red-500' : 'text-gray-400'}`}>
          {team.players.length} / 5
        </span>
            </div>

            {showWarning && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 rounded-lg pointer-events-none">
                    <div className="bg-red-100 text-red-600 px-4 py-2 rounded-full font-bold shadow-sm border border-red-200 animate-pulse">
                        🚫 정원 초과
                    </div>
                </div>
            )}

            {/* ✨ [핵심] SortableContext로 감싸기 (가로 정렬 전략 사용) */}
            <SortableContext items={playerIds} strategy={horizontalListSortingStrategy}>
                <div className="grid grid-cols-5 gap-2 min-h-[60px]">
                    {team.players.length === 0 ? (
                        <div className="col-span-5 flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded py-4 bg-white/50">
                            드래그하여 팀 구성
                        </div>
                    ) : (
                        <>
                            {team.players.map((player: Player) => (
                                <div key={player.id} className="w-full h-full">
                                    <DraggablePlayer player={player} />
                                </div>
                            ))}
                            {Array.from({ length: 5 - team.players.length }).map((_, i) => (
                                <div key={`empty-${i}`} className="border border-gray-100 rounded bg-gray-50/50" />
                            ))}
                        </>
                    )}
                </div>
            </SortableContext>
        </div>
    );
}