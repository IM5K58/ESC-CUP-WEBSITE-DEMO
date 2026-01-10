// 1. 기본 모델 (선수, 팀)
export interface Player {
    id: number;
    name: string;
    position: string;
    tier: string;
    highestTier?: string;
    teamId: number | null;
}

export interface Team {
    id: number;
    name: string;
    players: Player[];
}

// 2. 경기 관련 상세 기록
export interface MatchDetail {
    id: number;
    matchId: number;
    side: 'BLUE' | 'RED';
    playerId: number;
    playerName: string;
    championName: string;
    kills: number;
    deaths: number;
    assists: number;
    damageDealt: number;
    totalDamage: number;
    totalGold: number;
    isMvp: boolean;
}

// 3. 경기 모델
export interface Match {
    id: number;
    stage: string;
    blueTeamId: number | null;
    redTeamId: number | null;
    blueTeamName?: string;
    redTeamName?: string;
    winnerTeamId?: number | null;
    score?: string;
    status: 'SCHEDULED' | 'FINISHED';
    matchDetails?: MatchDetail[];
    round?: number;

    // ✨ 물음표(?) 대신 | null을 명시하여 타입 불일치 해결
    blueTowerKills: number | null;
    blueDragonKills: number | null;
    blueBaronKills: number | null;
    redTowerKills: number | null;
    redDragonKills: number | null;
    redBaronKills: number | null;

    // ✨ 여기가 핵심 수정 부분입니다 (parseBans 에러 해결)
    blueBans: string | null;
    redBans: string | null;
}

// 4. 토너먼트용 모델
export type MatchDto = Match;