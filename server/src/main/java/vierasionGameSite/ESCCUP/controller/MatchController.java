// src/main/java/vierasionGameSite/ESCCUP/controller/MatchController.java

package vierasionGameSite.ESCCUP.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vierasionGameSite.ESCCUP.dto.MatchDto;
import vierasionGameSite.ESCCUP.entity.Match;
import vierasionGameSite.ESCCUP.entity.Team;
import vierasionGameSite.ESCCUP.repository.MatchRepository;
import vierasionGameSite.ESCCUP.repository.TeamRepository;
import vierasionGameSite.ESCCUP.service.RiotApiService;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor

//  [핵심 수정] methods에 RequestMethod.PATCH를 꼭 포함시킬것!!!!!!!!!!!
@CrossOrigin(
        origins = "http://localhost:5173",
        allowedHeaders = "*",
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH}
)

public class MatchController {

    private final MatchRepository matchRepository;
    private final TeamRepository teamRepository;
    private final RiotApiService riotApiService;

    // 1. 대진표 조회
    @GetMapping
    public List<MatchDto> getAllMatches() {
        return matchRepository.findAllByOrderByIdAsc().stream()
                .map(MatchDto::new)
                .collect(Collectors.toList());
    }

    // 2. 대진표 생성 (관리자용) - "8강 1경기", 블루팀ID, 레드팀ID
    @PostMapping
    public MatchDto createMatch(@RequestBody Map<String, Object> payload) {
        String stage = (String) payload.get("stage");
        Long blueId = payload.get("blueTeamId") != null ? Long.valueOf(payload.get("blueTeamId").toString()) : null;
        Long redId = payload.get("redTeamId") != null ? Long.valueOf(payload.get("redTeamId").toString()) : null;

        Match match = new Match();
        match.setStage(stage);

        if (blueId != null) match.setBlueTeam(teamRepository.findById(blueId).orElse(null));
        if (redId != null) match.setRedTeam(teamRepository.findById(redId).orElse(null));

        return new MatchDto(matchRepository.save(match));
    }

    // 3. 경기 결과 업데이트 (관리자용) - 승리팀, 점수
    @PutMapping("/{id}")
    public MatchDto updateMatchResult(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Match match = matchRepository.findById(id).orElseThrow();

        String score = (String) payload.get("score"); // "2:1"
        Long winnerId = payload.get("winnerTeamId") != null ? Long.valueOf(payload.get("winnerTeamId").toString()) : null;

        match.setScore(score);
        match.setStatus("FINISHED");

        if (winnerId != null) {
            Team winner = teamRepository.findById(winnerId).orElse(null);
            match.setWinningTeam(winner);
        }

        return new MatchDto(matchRepository.save(match));
    }

    // 4. 경기 삭제
    @DeleteMapping("/{id}")
    public void deleteMatch(@PathVariable Long id) {
        matchRepository.deleteById(id);
    }

    // ✨ 라이엇 API로 경기 불러오기
    // POST /api/matches/load
    // body: { "gameId": "KR_12345", "blueTeamId": 1, "redTeamId": 2, "stage": "4강" }
    @PostMapping("/load")
    public MatchDto loadFromRiot(@RequestBody Map<String, Object> payload) {
        String gameId = (String) payload.get("gameId");
        String stage = (String) payload.get("stage");

        // 팀 ID 안 받음. 그냥 gameId랑 stage만 넘김
        Match match = riotApiService.loadMatchFromRiot(gameId, stage);
        return new MatchDto(match);
    }

    // ✨ [추가] 경기 팀 정보 수동 업데이트 API
    @PatchMapping("/{id}/teams")
    public ResponseEntity<Void> updateMatchTeams(@PathVariable Long id, @RequestBody Map<String, Long> teamIds) {
        Match match = matchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Match not found"));

        // 블루팀 업데이트
        if (teamIds.containsKey("blueTeamId")) {
            Long bId = teamIds.get("blueTeamId");
            Team blueTeam = (bId != null) ? teamRepository.findById(bId).orElse(null) : null;
            match.setBlueTeam(blueTeam);
        }

        // 레드팀 업데이트
        if (teamIds.containsKey("redTeamId")) {
            Long rId = teamIds.get("redTeamId");
            Team redTeam = (rId != null) ? teamRepository.findById(rId).orElse(null) : null;
            match.setRedTeam(redTeam);
        }

        matchRepository.save(match);
        return ResponseEntity.ok().build();
    }
}