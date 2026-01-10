// client/src/api/draftApi.ts

import axios from 'axios';
// ✨ [수정] import 뒤에 type을 붙여야 에러가 사라집니다!
import type { Team, Player, Match } from '../types';

// 백엔드 주소 (CORS 설정해둔 곳)
const API_BASE_URL = '/api/draft';

// 팀 목록 가져오기
export const fetchTeams = async (): Promise<Team[]> => {
    const response = await axios.get<Team[]>(`${API_BASE_URL}/teams`);
    return response.data;
};

// 대기 선수 목록 가져오기
export const fetchStandbyPlayers = async (): Promise<Player[]> => {
    const response = await axios.get<Player[]>(`${API_BASE_URL}/standby`);
    return response.data;
};

// 선수 팀 배정 요청 (teamId가 null이면 대기 명단 이동)
export const assignPlayerToTeam = async (playerId: number, teamId: number | null): Promise<void> => {
    await axios.post(`${API_BASE_URL}/assign`, {
        playerId,
        teamId
    });
};

// ✨ [NEW] 전체 배치 상태 일괄 저장 (Batch)
// { playerId: 1, teamId: 2 } 형태의 배열을 보냅니다.
export const saveAllDraftState = async (requests: { playerId: number; teamId: number | null }[]): Promise<void> => {
    await axios.post(`${API_BASE_URL}/assign/all`, requests);
};

export const fetchMatches = async (): Promise<Match[]> => {
    const response = await axios.get<Match[]>(`/api/matches`);
    return response.data;
};

export const createMatch = async (data: { stage: string; blueTeamId: number; redTeamId: number }) => {
    await axios.post(`/api/matches`, data);
};

export const updateMatchResult = async (id: number, data: { score: string; winnerTeamId: number | null }) => {
    await axios.put(`/api/matches/${id}`, data);
};

export const deleteMatch = async (id: number) => {
    await axios.delete(`/api/matches/${id}`);
};
// ✨ [추가] 팀 정보 업데이트 함수
export const updateMatchTeams = async (matchId: number, blueTeamId: number | null, redTeamId: number | null) => {
    const payload = {
        // ID가 유효한 양수일 때만 보내고, 아니면 null 처리
        blueTeamId: blueTeamId && blueTeamId > 0 ? blueTeamId : null,
        redTeamId: redTeamId && redTeamId > 0 ? redTeamId : null
    };

    // 👇 여기가 수정된 부분입니다 (http://localhost:8080/api 직접 입력)
    await axios.patch(`/api/matches/${matchId}/teams`, payload);
};