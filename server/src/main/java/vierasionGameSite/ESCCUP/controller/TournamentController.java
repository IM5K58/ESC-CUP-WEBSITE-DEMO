package vierasionGameSite.ESCCUP.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import vierasionGameSite.ESCCUP.dto.MatchDto;
import vierasionGameSite.ESCCUP.entity.Match;
import vierasionGameSite.ESCCUP.entity.Team;
import vierasionGameSite.ESCCUP.repository.MatchRepository;
import vierasionGameSite.ESCCUP.repository.TeamRepository;

import java.util.List;

@RestController
@RequestMapping("/api/tournament")
@RequiredArgsConstructor
public class TournamentController {

    private final MatchRepository matchRepository;
    private final TeamRepository teamRepository;

    // 1. 빈 대진표 틀 생성 (관리자용)
    // teamCount: 4, 8, 16 중 하나
    @PostMapping("/create-empty")
    @Transactional
    public void createEmptyBracket(@RequestParam int teamCount) {
        // 기존 토너먼트 데이터만 삭제 (일반 전적 보호)
        matchRepository.deleteByRoundNotNull();

        // 결승전부터 역순으로 생성하여 ID를 연결합니다.

        // [결승] Round 2
        Match finalMatch = saveMatch(2, 1, "결승전", null);

        if (teamCount >= 4) {
            // [4강] 2경기
            Match semi1 = saveMatch(4, 1, "4강 1경기", finalMatch.getId());
            Match semi2 = saveMatch(4, 2, "4강 2경기", finalMatch.getId());

            if (teamCount >= 8) {
                // [8강] 4경기
                saveMatch(8, 1, "8강 1경기", semi1.getId());
                saveMatch(8, 2, "8강 2경기", semi1.getId());
                saveMatch(8, 3, "8강 3경기", semi2.getId());
                saveMatch(8, 4, "8강 4경기", semi2.getId());
            }
        }
    }

    // 2. 관리자가 특정 경기의 팀을 배치하거나 승리 처리를 했을 때
    @PutMapping("/{matchId}")
    @Transactional
    public void updateMatch(@PathVariable Long matchId, @RequestBody MatchDto dto) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("경기 없음"));

        // 1. 팀 수동 배치 (주로 1라운드용)
        if (dto.getBlueTeamId() != null) match.setBlueTeam(teamRepository.findById(dto.getBlueTeamId()).orElse(null));
        if (dto.getRedTeamId() != null) match.setRedTeam(teamRepository.findById(dto.getRedTeamId()).orElse(null));

        // 2. 승리팀 설정 및 다음 라운드 진출 로직
        if (dto.getWinnerTeamId() != null) {
            Team winner = teamRepository.findById(dto.getWinnerTeamId()).orElse(null);
            match.setWinningTeam(winner);
            match.setStatus("FINISHED");
            match.setScore(dto.getScore()); // 점수 업데이트

            // ✨ [핵심] 다음 경기로 승리팀 자동 진출
            if (match.getNextMatchId() != null) {
                Match nextMatch = matchRepository.findById(match.getNextMatchId()).orElseThrow();

                // 홀수(1,3)번째 경기는 다음 경기의 BLUE팀으로, 짝수(2,4)는 RED팀으로 진출
                if (match.getMatchOrder() % 2 != 0) {
                    nextMatch.setBlueTeam(winner);
                } else {
                    nextMatch.setRedTeam(winner);
                }
                matchRepository.save(nextMatch);
            }
        }

        matchRepository.save(match);
    }

    private Match saveMatch(int round, int order, String stage, Long nextId) {
        Match m = new Match();
        m.setRound(round);
        m.setMatchOrder(order);
        m.setStage(stage);
        m.setNextMatchId(nextId);
        m.setStatus("SCHEDULED");
        return matchRepository.save(m);
    }
}