// client/src/components/PlayerCard.tsx

import React, { forwardRef } from 'react';
import type { Player } from '../types';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    player: Player;
    isOverlay?: boolean;
}

const getTierStyle = (tierStr: string | null | undefined) => {
    if (!tierStr) return "bg-gray-200 text-gray-500 border-gray-300";
    const tier = tierStr.toLowerCase();
    if (tier.includes('challenger')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (tier.includes('grandmaster')) return 'bg-red-100 text-red-700 border-red-200';
    if (tier.includes('master')) return 'bg-purple-100 text-purple-700 border-purple-200';
    if (tier.includes('diamond')) return 'bg-cyan-100 text-cyan-700 border-cyan-200';
    if (tier.includes('emerald')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (tier.includes('platinum')) return 'bg-teal-100 text-teal-700 border-teal-200';
    if (tier.includes('gold')) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (tier.includes('silver')) return 'bg-gray-200 text-gray-700 border-gray-300';
    if (tier.includes('bronze')) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-gray-50 text-gray-500 border-gray-100';
};

export const PlayerCard = forwardRef<HTMLDivElement, Props>(({ player, isOverlay, style, ...props }, ref) => {
    const tierStyle = getTierStyle(player.tier);

    // [NEW] 최고 티어 스타일 및 표시 여부 결정
    // 최고 티어가 있고, 현재 티어와 다를 때만 보여준다.
    const showHighest = player.highestTier && player.highestTier !== player.tier;
    const highestTierStyle = getTierStyle(player.highestTier);

    // OP.GG 링크 자동 생성 로직
    const generateOpggUrl = (fullId: string) => {
        if (!fullId.includes('#')) return 'https://www.op.gg';

        const [gameName, tagLine] = fullId.split('#');
        const encodedName = gameName.trim().replace(/\s+/g, '%20');
        const cleanTag = tagLine.trim();

        return `https://www.op.gg/summoners/kr/${encodedName}-${cleanTag}`;
    };

    const opggUrl = generateOpggUrl(player.name);

    return (
        <div
            ref={ref}
            style={style}
            {...props}
            className={`
        bg-white border p-2 rounded shadow-sm flex flex-col justify-center items-center gap-1.5 select-none transition-all
        ${isOverlay ? 'border-blue-500 shadow-xl scale-105 rotate-2 cursor-grabbing z-50 w-24 h-32' : 'border-gray-300 cursor-grab hover:bg-blue-50 hover:shadow-md h-full'}
      `}
        >
            {/* 1. 포지션 */}
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                {player.position}
            </div>

            {/* 2. 이름 (링크) */}
            <a
                href={opggUrl}
                target="_blank"
                rel="noreferrer"
                title="OP.GG 전적 보기"
                className="font-bold text-gray-800 text-sm truncate w-full text-center px-1 hover:text-blue-600 hover:underline cursor-pointer"
                onPointerDown={(e) => e.stopPropagation()}
            >
                {player.name}
            </a>

            {/* 3. ✨ [수정] 티어 표시 영역 (Flex Column) */}
            <div className="flex flex-col items-center gap-1 w-full">
                {/* 현재 티어 */}
                <div className={`text-[10px] font-bold px-2 py-0.5 rounded border w-fit whitespace-nowrap ${tierStyle}`}>
                    {player.tier}
                </div>

                {/* 최고 티어 (조건부 렌더링) */}
                {/* 공간 절약을 위해 조금 더 작게(text-[9px]) 표시하고 'Max:' 접두사 추가 */}
                {showHighest && (
                    <div className={`text-[9px] font-semibold px-1.5 py-[1px] rounded border w-fit whitespace-nowrap opacity-90 scale-95 ${highestTierStyle}`}>
                        Max: {player.highestTier}
                    </div>
                )}
            </div>
        </div>
    );
});

PlayerCard.displayName = 'PlayerCard';