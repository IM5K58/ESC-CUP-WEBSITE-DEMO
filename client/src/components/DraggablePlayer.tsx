// client/src/components/DraggablePlayer.tsx

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Player } from '../types';
import { PlayerCard } from './PlayerCard';

interface Props {
    player: Player;
}

export function DraggablePlayer({ player }: Props) {
    // ✨ [수정] useSortable 사용 (드래그 + 정렬 기능)
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: `player-${player.id}`,
        data: { player },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1, // 드래그 중인 원래 카드는 흐릿하게
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="h-full">
            <PlayerCard player={player} />
        </div>
    );
}