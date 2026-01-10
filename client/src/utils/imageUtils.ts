const DDRAGON_VER = "14.23.1"; // 주기적으로 최신 버전 확인 필요
const CDN_URL = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VER}/img`;

// 1. 챔피언 이미지
export const getChampImg = (champName: string) => {
    if (!champName) return "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Aatrox_0.jpg";
    return `${CDN_URL}/champion/${champName}.png`;
};

// 2. 아이템 이미지
export const getItemImg = (itemId: number) => {
    if (!itemId || itemId === 0) return "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="; // 투명 이미지
    return `${CDN_URL}/item/${itemId}.png`;
};

// 3. ✨ [수정] 스펠 ID -> 파일명 매핑 (완벽 정리)
export const getSpellImg = (spellId: number) => {
    const spellMap: Record<number, string> = {
        21: "SummonerBarrier",    // 배리어
        1:  "SummonerBoost",      // 정화
        14: "SummonerDot",        // 점화 (Ignite)
        3:  "SummonerExhaust",    // 탈진
        4:  "SummonerFlash",      // 점멸
        6:  "SummonerHaste",      // 유체화 (Ghost)
        7:  "SummonerHeal",       // 회복
        13: "SummonerMana",       // 총명 (칼바람 등)
        30: "SummonerPoroRecall", // 왕을 향해! (포로왕)
        31: "SummonerPoroThrow",  // 포로 던지기
        32: "SummonerSnowball",   // 표식 (칼바람 눈덩이)
        12: "SummonerTeleport",   // 텔레포트
        11: "SummonerSmite",      // 강타 (기본)
        // 강타 업그레이드 버전들 (라이엇이 ID를 바꾸기도 함, 기본 Smite로 처리하거나 아래 추가)
    };

    // 맵에 없는 ID면 기본 점멸 아이콘 대신 물음표나 투명 처리, 혹은 기본 강타
    const name = spellMap[spellId] || "SummonerFlash";
    return `${CDN_URL}/spell/${name}.png`;
};