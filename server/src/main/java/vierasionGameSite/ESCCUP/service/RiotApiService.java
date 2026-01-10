package vierasionGameSite.ESCCUP.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // 트랜잭션 추가
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import vierasionGameSite.ESCCUP.entity.*;
import vierasionGameSite.ESCCUP.repository.*;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RiotApiService {

    @Value("${riot.api.key}")
    private String apiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();
    private final PlayerRepository playerRepository;
    private final MatchRepository matchRepository;

    @Transactional // DB 저장 시 정합성 보장
    public Match loadMatchFromRiot(String gameId, String stage) {
        // ID 포맷 보정
        if (!gameId.startsWith("KR_")) gameId = "KR_" + gameId;
        System.out.println("========== [Riot API] 경기 로드 시작: " + gameId + " ==========");

        try {
            // 1. API 호출
            String matchUrl = "https://asia.api.riotgames.com/lol/match/v5/matches/" + gameId + "?api_key=" + apiKey;
            String jsonResponse = restTemplate.getForObject(matchUrl, String.class);
            JsonNode root = objectMapper.readTree(jsonResponse);

            // 데이터 검증
            JsonNode info = root.path("info");
            if (info.isMissingNode()) {
                throw new RuntimeException("Riot API 응답에 'info' 데이터가 없습니다.");
            }

            // 2. Match 객체 생성
            Match match = new Match();
            match.setStage(stage);
            match.setStatus("FINISHED");

            // 날짜/시간 (선택 사항)
            // match.setMatchDate(LocalDateTime.now());

            // 3. 팀 데이터 파싱
            JsonNode teams = info.path("teams");
            boolean isBlueWin = false;

            for (JsonNode team : teams) {
                int teamId = team.path("teamId").asInt();
                boolean win = team.path("win").asBoolean();

                // 오브젝트 (칼바람/사설은 없을 수 있음 -> 0 처리)
                JsonNode objs = team.path("objectives");
                int baron = objs.path("baron").path("kills").asInt(0);
                int dragon = objs.path("dragon").path("kills").asInt(0);
                int tower = objs.path("tower").path("kills").asInt(0);

                // 밴 (없을 수 있음)
                StringBuilder banSb = new StringBuilder();
                if (team.has("bans")) {
                    for (JsonNode ban : team.path("bans")) {
                        int champId = ban.path("championId").asInt();
                        if (champId > 0) { // -1, 0 제외
                            if (banSb.length() > 0) banSb.append(",");
                            banSb.append(champId);
                        }
                    }
                }

                if (teamId == 100) { // BLUE
                    match.setBlueBaronKills(baron);
                    match.setBlueDragonKills(dragon);
                    match.setBlueTowerKills(tower);
                    match.setBlueBans(banSb.toString());
                    if (win) isBlueWin = true;
                } else { // RED
                    match.setRedBaronKills(baron);
                    match.setRedDragonKills(dragon);
                    match.setRedTowerKills(tower);
                    match.setRedBans(banSb.toString());
                }
            }

            // 4. 참가자 데이터 파싱
            List<MatchDetail> details = new ArrayList<>();
            Team detectedBlueTeam = null;
            Team detectedRedTeam = null;

            JsonNode participants = info.path("participants");
            if (participants.isMissingNode()) throw new RuntimeException("참가자 정보가 없습니다.");

            for (JsonNode p : participants) {
                try {
                    MatchDetail detail = new MatchDetail();
                    detail.setMatch(match);

                    // --- [ID 및 봇 감지] ---
                    String riotIdName = p.path("riotIdGameName").asText();
                    String summonerName = p.path("summonerName").asText();
                    String puuid = p.path("puuid").asText();

                    boolean isBot = "BOT".equals(puuid) || (riotIdName.isEmpty() && summonerName.isEmpty());
                    if (riotIdName.isEmpty()) riotIdName = summonerName;
                    if (riotIdName.isEmpty()) riotIdName = "Unknown Bot";

                    // --- [선수 DB 매핑 & 티어 스냅샷] ---
                    // DB에 없는 선수는 절대 새로 만들지 않고, null로 처리하여 기록만 남김
                    Player player = playerRepository.findByName(riotIdName).orElse(null);

                    String tierSnapshot = "Unranked";
                    if (isBot) {
                        tierSnapshot = "Bot";
                    } else if (player != null && player.getTier() != null) {
                        tierSnapshot = player.getTier(); // DB 정보 우선
                    } else {
                        // DB 미등록자는 API로 현재 티어만 조회
                        tierSnapshot = safeFetchTier(p.path("summonerId").asText());
                    }

                    detail.setPlayer(player); // player가 null이어도 됨 (Entity nullable=true)
                    detail.setPlayerName(riotIdName);
                    detail.setPlayerTier(tierSnapshot);

                    // --- [팀 자동 감지] ---
                    int teamId = p.path("teamId").asInt();
                    if (player != null && player.getTeam() != null) {
                        if (teamId == 100) detectedBlueTeam = player.getTeam();
                        else detectedRedTeam = player.getTeam();
                    }

                    // --- [상세 스탯] ---
                    detail.setChampionName(p.path("championName").asText());
                    detail.setKills(p.path("kills").asInt());
                    detail.setDeaths(p.path("deaths").asInt());
                    detail.setAssists(p.path("assists").asInt());
                    detail.setTotalDamage(p.path("totalDamageDealtToChampions").asInt());
                    detail.setTotalGold(p.path("goldEarned").asInt());
                    detail.setCs(p.path("totalMinionsKilled").asInt() + p.path("neutralMinionsKilled").asInt());
                    detail.setChampLevel(p.path("champLevel").asInt());

                    // 아이템
                    detail.setItem0(p.path("item0").asInt());
                    detail.setItem1(p.path("item1").asInt());
                    detail.setItem2(p.path("item2").asInt());
                    detail.setItem3(p.path("item3").asInt());
                    detail.setItem4(p.path("item4").asInt());
                    detail.setItem5(p.path("item5").asInt());
                    detail.setItem6(p.path("item6").asInt());

                    // 스펠
                    detail.setSpell1Id(p.path("summoner1Id").asInt(0));
                    detail.setSpell2Id(p.path("summoner2Id").asInt(0));

                    // [룬 데이터 파싱 추가]
                    JsonNode perks = p.path("perks");
                    JsonNode styles = perks.path("styles");
                    int mainRuneId = 0;
                    int subRuneStyleId = 0;

                    for (JsonNode style : styles) {
                        String desc = style.path("description").asText();
                        if ("primaryStyle".equals(desc)) {
                            // 핵심 룬은 selections의 첫 번째 값
                            mainRuneId = style.path("selections").path(0).path("perk").asInt(0);
                        } else if ("subStyle".equals(desc)) {
                            // 보조 룬은 style ID 자체
                            subRuneStyleId = style.path("style").asInt(0);
                        }
                    }
                    detail.setMainRuneId(mainRuneId);
                    detail.setSubRuneStyleId(subRuneStyleId);

                    // 진영 및 포지션
                    detail.setSide(teamId == 100 ? "BLUE" : "RED");

                    String pos = p.path("teamPosition").asText();
                    if (pos.isEmpty() || "Invalid".equalsIgnoreCase(pos)) {
                        pos = p.path("individualPosition").asText(); // 대체 필드
                    }
                    if (pos.isEmpty() || "Invalid".equalsIgnoreCase(pos)) {
                        pos = "ANY"; // 사설/칼바람 최후의 수단
                    }
                    detail.setPosition(pos);

                    details.add(detail);

                } catch (Exception e) {
                    System.out.println("  ❌ 참가자(" + p.path("participantId").asInt() + ") 파싱 오류 (Skipping): " + e.getMessage());
                    // 한 명 에러 나도 전체 중단하지 않음
                }
            }

            match.setBlueTeam(detectedBlueTeam);
            match.setRedTeam(detectedRedTeam);
            match.setWinningTeam(isBlueWin ? detectedBlueTeam : detectedRedTeam);
            match.setMatchDetails(details);
            match.setScore(isBlueWin ? "1:0" : "0:1");

            return matchRepository.save(match);

        } catch (HttpClientErrorException e) {
            System.out.println("❌ Riot API 오류 (" + e.getStatusCode() + "): " + e.getMessage());
            if (e.getStatusCode().value() == 404) {
                throw new RuntimeException("존재하지 않는 게임이거나, 기록이 남지 않은 사설 게임입니다.");
            } else if (e.getStatusCode().value() == 403) {
                throw new RuntimeException("API 키가 만료되었습니다. 갱신해주세요.");
            }
            throw new RuntimeException("Riot API 호출 실패");
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("경기 저장 중 내부 오류: " + e.getMessage());
        }
    }

    private String safeFetchTier(String summonerId) {
        if (summonerId == null || summonerId.isEmpty() || "0".equals(summonerId)) return "Unranked";
        try {
            String url = "https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/" + summonerId + "?api_key=" + apiKey;
            String response = restTemplate.getForObject(url, String.class);
            JsonNode leagues = objectMapper.readTree(response);

            for (JsonNode league : leagues) {
                if ("RANKED_SOLO_5x5".equals(league.get("queueType").asText())) {
                    return league.get("tier").asText() + " " + league.get("rank").asText();
                }
            }
            for (JsonNode league : leagues) {
                if ("RANKED_FLEX_SR".equals(league.get("queueType").asText())) {
                    return league.get("tier").asText() + " " + league.get("rank").asText();
                }
            }
        } catch (Exception e) {
            return "Unranked"; // 어떤 에러가 나도 무시하고 언랭크 처리
        }
        return "Unranked";
    }
}