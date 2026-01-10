// client/src/components/DroppableStandby.tsx

import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface Props {
    children: React.ReactNode;
    count: number;
}

export function DroppableStandby({ children, count }: Props) {
    const { setNodeRef, isOver } = useDroppable({
        id: 'standby-zone',
    });

    const style = {
        backgroundColor: isOver ? '#f0fdf4' : 'white',
        borderColor: isOver ? '#22c55e' : '#e5e7eb',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            // ✨ [수정됨] w-80 고정 너비를 제거하고, h-full로 높이를 꽉 채움
            className="flex-1 h-full p-4 rounded-xl shadow-lg border-2 transition-colors duration-200 flex flex-col"
        >
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2 flex justify-between">
                <span>대기 선수 명단</span>
                <span className="text-blue-600">{count}명</span>
            </h2>

            {/* ✨ [핵심] 리스트 대신 'Grid(바둑판)' 적용 */}
            {/* overflow-y-auto: 선수가 많으면 스크롤 */}
            <div className="flex-1 overflow-y-auto pr-2">
                {/* ✨ [수정됨] 반응형 그리드 적용 */}
                {/* 화면이 작을 땐 2~3개, 클 땐(xl) 4개씩 꽉 채우기 */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
                    {children}
                </div>
            </div>
        </div>
    );
}