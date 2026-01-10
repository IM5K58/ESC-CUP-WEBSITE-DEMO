import { useEffect } from 'react';
import type { Match, MatchDetail } from '../types';
import { getChampImg, getItemImg, getSpellImg } from '../utils/imageUtils';

interface Props {
    match: Match;
    onClose: () => void;
}

// 밴(Ban) 챔피언 이미지를 ID로 가져오는 헬퍼
const getBanImgUrl = (champId: string) => {
    if (!champId || champId === "-1") return "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/-1.png";
    return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${champId}.png`;
};

// ✨ [추가] 티어별 텍스트 색상 매핑 함수
const getTierColor = (tier: string) => {
    if (!tier) return "text-gray-400";
    const t = tier.toUpperCase();
    if (t.includes("CHALLENGER")) return "text-yellow-600"; // 챌린저 (진한 금색)
    if (t.includes("GRANDMASTER")) return "text-red-600";    // 그마 (빨강)
    if (t.includes("MASTER")) return "text-purple-600";      // 마스터 (보라)
    if (t.includes("DIAMOND")) return "text-blue-500";       // 다이아 (파랑)
    if (t.includes("EMERALD")) return "text-green-600";      // 에메랄드 (녹색)
    if (t.includes("PLATINUM")) return "text-teal-500";      // 플래 (청록)
    if (t.includes("GOLD")) return "text-yellow-500";        // 골드
    if (t.includes("SILVER")) return "text-gray-500";        // 실버
    if (t.includes("BRONZE")) return "text-amber-700";       // 브론즈
    if (t.includes("IRON")) return "text-gray-400";          // 아이언
    return "text-gray-400"; // Unranked
};

export default function MatchDetailModal({ match, onClose }: Props) {
    const blueTeam = match.matchDetails?.filter(d => d.side === 'BLUE') || [];
    const redTeam = match.matchDetails?.filter(d => d.side === 'RED') || [];

    // 승패 판별 (스코어 문자열 기준)
    const blueWin = match.score === '1:0';

    // 팀별 총합 계산
    const getTotals = (team: MatchDetail[]) => ({
        kills: team.reduce((sum, d) => sum + d.kills, 0),
        gold: team.reduce((sum, d) => sum + d.totalGold, 0),
        damage: team.reduce((sum, d) => sum + d.totalDamage, 0),
    });

    const blueTotal = getTotals(blueTeam);
    const redTotal = getTotals(redTeam);
    const maxDamage = Math.max(blueTotal.damage, redTotal.damage, 1);

    const blueObjects = {
        tower: match.blueTowerKills,
        dragon: match.blueDragonKills,
        baron: match.blueBaronKills
    };
    const redObjects = {
        tower: match.redTowerKills,
        dragon: match.redDragonKills,
        baron: match.redBaronKills
    };

    const parseBans = (banStr: string | null) => {
        if (!banStr) return Array(5).fill("-1");
        return banStr.split(',');
    };
    const blueBans = parseBans(match.blueBans);
    const redBans = parseBans(match.redBans);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 font-sans backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white w-full max-w-6xl rounded-xl shadow-2xl overflow-hidden relative text-gray-700 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>

                {/* [헤더] 화이트 테마 */}
                <div className="flex justify-between items-center p-4 bg-white border-b border-gray-200 shrink-0">
                    <div className="flex gap-4 items-end">
                        <h2 className="text-gray-900 font-extrabold text-xl">{match.stage}</h2>
                        <span className="text-sm font-mono text-gray-400">ID: {match.id}</span>
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-bold border border-gray-200">{match.status}</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800 text-3xl leading-none transition-colors">&times;</button>
                </div>

                {/* [1] 상단 요약 바 */}
                <div className="shrink-0 bg-gray-50 border-b border-gray-200">
                    <SummaryBar
                        blueTotal={blueTotal}
                        redTotal={redTotal}
                        blueObjects={blueObjects}
                        redObjects={redObjects}
                    />
                </div>

                {/* [스크롤 영역] */}
                <div className="p-4 space-y-6 bg-gray-100 overflow-y-auto custom-scrollbar">

                    {/* 블루팀 */}
                    <TeamSection
                        teamName={match.blueTeamName || "Blue Team"}
                        details={blueTeam}
                        isWin={blueWin}
                        theme="blue"
                        totalKills={blueTotal.kills}
                        maxDamage={maxDamage}
                        bans={blueBans}
                        objects={blueObjects}
                    />

                    {/* 레드팀 */}
                    <TeamSection
                        teamName={match.redTeamName || "Red Team"}
                        details={redTeam}
                        isWin={!blueWin}
                        theme="red"
                        totalKills={redTotal.kills}
                        maxDamage={maxDamage}
                        bans={redBans}
                        objects={redObjects}
                    />
                </div>
            </div>
        </div>
    );
}

// ================= 하위 컴포넌트 =================

// [1] 종합 요약 바
function SummaryBar({ blueTotal, redTotal, blueObjects, redObjects }: any) {
    const totalKills = blueTotal.kills + redTotal.kills || 1;
    const totalGold = blueTotal.gold + redTotal.gold || 1;

    const blueKillPct = (blueTotal.kills / totalKills) * 100;
    const blueGoldPct = (blueTotal.gold / totalGold) * 100;

    return (
        <div className="p-4 flex items-center justify-between text-sm">
            {/* 블루팀 오브젝트 */}
            <ObjectIcons theme="blue" objects={blueObjects} />

            {/* 중앙 그래프 */}
            <div className="flex-1 mx-8 flex flex-col gap-3 max-w-xl">
                {/* Kill Graph */}
                <div className="flex items-center">
                    <span className="text-gray-800 font-bold w-12 text-right mr-3 text-lg">{blueTotal.kills}</span>
                    <div className="flex-1 h-3 bg-gray-200 relative rounded-sm overflow-hidden flex items-center justify-center">
                        <div className="absolute inset-y-0 left-0 bg-blue-500" style={{ width: `${blueKillPct}%` }}></div>
                        <div className="absolute inset-y-0 right-0 bg-red-500" style={{ width: `${100 - blueKillPct}%` }}></div>
                        <span className="z-10 text-white font-bold text-[10px] drop-shadow-md tracking-wider opacity-90">TOTAL KILLS</span>
                    </div>
                    <span className="text-gray-800 font-bold w-12 ml-3 text-lg">{redTotal.kills}</span>
                </div>
                {/* Gold Graph */}
                <div className="flex items-center">
                    <span className="text-gray-500 w-12 text-right mr-3">{(blueTotal.gold / 1000).toFixed(1)}k</span>
                    <div className="flex-1 h-3 bg-gray-200 relative rounded-sm overflow-hidden flex items-center justify-center">
                        <div className="absolute inset-y-0 left-0 bg-blue-400" style={{ width: `${blueGoldPct}%` }}></div>
                        <div className="absolute inset-y-0 right-0 bg-red-400" style={{ width: `${100 - blueGoldPct}%` }}></div>
                        <span className="z-10 text-white font-bold text-[10px] drop-shadow-md tracking-wider opacity-90">TOTAL GOLD</span>
                    </div>
                    <span className="text-gray-500 w-12 ml-3">{(redTotal.gold / 1000).toFixed(1)}k</span>
                </div>
            </div>

            {/* 레드팀 오브젝트 */}
            <ObjectIcons theme="red" objects={redObjects} />
        </div>
    );
}

// [2] 팀 섹션
function TeamSection({ teamName, details, isWin, theme, totalKills, maxDamage, bans, objects }: any) {
    const isBlue = theme === 'blue';

    // 밝은 배경색 설정
    const headerBg = isBlue ? 'bg-blue-50' : 'bg-red-50';
    const borderColor = isBlue ? 'border-blue-200' : 'border-red-200';
    const textColor = isBlue ? 'text-blue-700' : 'text-red-700';

    // 승패 텍스트 색상
    const resultColor = isWin ? (isBlue ? 'text-blue-600' : 'text-red-600') : 'text-gray-400';

    return (
        <div className={`flex rounded-lg overflow-hidden border ${borderColor} shadow-sm bg-white`}>
            {/* 왼쪽: 선수 테이블 */}
            <div className="flex-1">
                {/* 팀 헤더 */}
                <div className={`${headerBg} px-4 py-3 flex justify-between items-end border-b ${borderColor}`}>
                    <div className="flex items-baseline gap-2">
                        <span className={`font-black text-lg ${resultColor}`}>{isWin ? 'WIN' : 'LOSE'}</span>
                        <span className={`font-bold text-md ${textColor}`}>{teamName}</span>
                    </div>
                    <div className="text-xs font-bold text-gray-500">
                        Total Kills: <span className="text-gray-800 text-sm">{totalKills}</span>
                    </div>
                </div>

                {/* 테이블 헤더 */}
                <div className="bg-gray-50 text-gray-500 text-xs py-2 px-2 flex border-b border-gray-200">
                    <div className="w-48 pl-2">챔피언 / 유저</div>
                    <div className="w-20 text-center">KDA</div>
                    <div className="w-24 text-center">피해량</div>
                    <div className="w-16 text-center">CS</div>
                    <div className="w-16 text-center">골드</div>
                    <div className="flex-1 text-left pl-4">아이템</div>
                </div>

                {/* 선수 리스트 */}
                {details.map((player: MatchDetail) => (
                    <PlayerRow
                        key={player.id}
                        player={player}
                        theme={theme}
                        totalTeamKills={totalKills}
                        maxDamage={maxDamage}
                        borderColor="border-gray-100"
                    />
                ))}
            </div>

            {/* 오른쪽: 밴 & 오브젝트 패널 */}
            <div className={`${headerBg} w-44 border-l ${borderColor} p-4 flex flex-col gap-6 items-center`}>
                <div className="w-full">
                    <h4 className="text-gray-400 text-xs font-bold mb-2 uppercase text-center tracking-wider">Bans</h4>
                    <div className="flex flex-wrap justify-center gap-1">
                        {bans.map((champId: string, idx: number) => (
                            <div key={idx} className="w-7 h-7 rounded border border-gray-300 bg-white overflow-hidden relative" title={`Champion ID: ${champId}`}>
                                <img src={getBanImgUrl(champId)} className="w-full h-full object-cover grayscale opacity-80" alt="ban" />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="w-full">
                    <h4 className="text-gray-400 text-xs font-bold mb-2 uppercase text-center tracking-wider">Objectives</h4>
                    <ObjectIcons theme={theme} objects={objects} vertical />
                </div>
            </div>
        </div>
    );
}

// [3] 선수 행 (화이트 테마 + 티어 표시)
function PlayerRow({ player, theme, totalTeamKills, maxDamage, borderColor }: any) {
    const isBlue = theme === 'blue';
    const rowHover = isBlue ? 'hover:bg-blue-50' : 'hover:bg-red-50';

    // KDA 강조 색상
    const kdaColor = parseFloat(((player.kills + player.assists) / Math.max(1, player.deaths)).toFixed(2)) >= 3
        ? 'text-gray-900 font-bold' : 'text-gray-500';

    // 그래프 바 색상
    const barColor = isBlue ? 'bg-blue-500' : 'bg-red-500';

    return (
        <div className={`bg-white ${rowHover} p-2 flex items-center border-b ${borderColor} last:border-0 transition-colors h-[60px]`}>

            {/* 1. 챔피언 & 스펠 & 이름 & 티어 */}
            <div className="w-48 flex items-center gap-3 shrink-0 pl-1">
                {/* 챔피언 이미지 */}
                <div className="relative">
                    <img src={getChampImg(player.championName)} className="w-10 h-10 rounded-full border border-gray-300" alt={player.championName} />
                    <div className="absolute -bottom-1 -right-1 bg-white text-gray-600 text-[9px] w-4 h-4 flex items-center justify-center rounded-full border border-gray-300 shadow-sm font-bold">
                        {player.champLevel}
                    </div>
                </div>
                {/* 스펠/룬 */}
                <div className="flex flex-col gap-[2px]">
                    <div className="flex gap-[2px]">
                        <img src={getSpellImg(player.spell1Id)} className="w-4 h-4 rounded border border-gray-200" alt="spell1" />
                        <img src={getSpellImg(player.spell2Id)} className="w-4 h-4 rounded border border-gray-200" alt="spell2" />
                    </div>
                    <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-[7px] text-gray-500">R</div>
                </div>

                {/* ✨ 이름 및 티어 */}
                <div className="flex flex-col truncate ml-1">
                    <span className="text-gray-800 text-xs font-bold truncate w-24">{player.playerName}</span>
                    <span className={`text-[10px] font-bold ${getTierColor(player.playerTier)}`}>
                        {player.playerTier || "Unranked"}
                    </span>
                </div>
            </div>

            {/* 2. KDA */}
            <div className="w-20 flex flex-col items-center justify-center shrink-0">
                <div className="text-gray-600 text-xs">
                    <span className="text-gray-900 font-bold">{player.kills}</span> / <span className="text-red-500 font-bold">{player.deaths}</span> / <span className="text-gray-900">{player.assists}</span>
                </div>
                <div className={`text-[10px] mt-0.5 ${kdaColor}`}>
                    {player.deaths === 0 ? "Perfect" : `${((player.kills + player.assists) / player.deaths).toFixed(2)}:1`}
                </div>
            </div>

            {/* 3. 피해량 */}
            <div className="w-24 px-2 shrink-0 flex flex-col justify-center gap-1">
                <div className="text-[10px] text-gray-500 text-center">{player.totalDamage.toLocaleString()}</div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden w-full">
                    <div className={`h-full ${barColor}`} style={{ width: `${(player.totalDamage / maxDamage) * 100}%` }}></div>
                </div>
            </div>

            {/* 4. CS */}
            <div className="w-16 text-center shrink-0 text-xs text-gray-500">
                <div className="text-gray-700 font-bold">{player.cs}</div>
                <div className="text-[10px]">({(player.cs / 20).toFixed(1)})</div>
            </div>

            {/* 5. Gold */}
            <div className="w-16 text-center shrink-0 text-xs text-yellow-600 font-bold">
                {(player.totalGold / 1000).toFixed(1)}k
            </div>

            {/* 6. 아이템 */}
            <div className="flex-1 flex items-center justify-start gap-[2px] ml-4">
                {[player.item0, player.item1, player.item2, player.item3, player.item4, player.item5].map((item, idx) => (
                    <div key={idx} className="w-7 h-7 rounded bg-gray-100 overflow-hidden border border-gray-300">
                        <img src={getItemImg(item)} className="w-full h-full object-cover" alt="item" />
                    </div>
                ))}
                <div className="w-7 h-7 rounded-full bg-gray-100 overflow-hidden border border-gray-300 ml-1">
                    <img src={getItemImg(player.item6)} className="w-full h-full object-cover" alt="ward" />
                </div>
            </div>
        </div>
    );
}

// [4] 오브젝트 아이콘
function ObjectIcons({ theme, objects, vertical = false }: any) {
    const isBlue = theme === 'blue';
    const iconColor = isBlue ? 'text-blue-500' : 'text-red-500';
    const textColor = isBlue ? 'text-blue-700' : 'text-red-700';

    const containerClass = vertical
        ? 'flex flex-col gap-3 w-full px-4'
        : 'flex gap-4 items-center min-w-[120px] justify-center';

    const TowerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${iconColor}`}><path d="M12 2l-5 9h10l-5-9zM7 11v11h10v-11h-10z"/></svg>;
    const DragonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${iconColor}`}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5z"/></svg>;
    const BaronIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-purple-500"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 12.5l-2.5-2.75L12 11zm0 2.5l-5-2.5 5 2.5 5-2.5-5 2.5z"/></svg>;

    return (
        <div className={containerClass}>
            <div className="flex items-center justify-between w-full max-w-[80px]">
                <div className="flex items-center gap-1" title="Towers"><TowerIcon /><span className={`${textColor} font-bold text-xs`}>{objects.tower}</span></div>
                {vertical && <div className="text-[10px] text-gray-400 font-bold">TOWERS</div>}
            </div>
            <div className="flex items-center justify-between w-full max-w-[80px]">
                <div className="flex items-center gap-1" title="Dragons"><DragonIcon /><span className={`${textColor} font-bold text-xs`}>{objects.dragon}</span></div>
                {vertical && <div className="text-[10px] text-gray-400 font-bold">DRAGONS</div>}
            </div>
            <div className="flex items-center justify-between w-full max-w-[80px]">
                <div className="flex items-center gap-1" title="Barons"><BaronIcon /><span className="text-purple-700 font-bold text-xs">{objects.baron}</span></div>
                {vertical && <div className="text-[10px] text-gray-400 font-bold">BARONS</div>}
            </div>
        </div>
    );
}