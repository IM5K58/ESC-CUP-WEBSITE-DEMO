// src/main/java/vierasionGameSite/ESCCUP/service/DraftService.java

package vierasionGameSite.ESCCUP.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vierasionGameSite.ESCCUP.dto.PlayerDto;
import vierasionGameSite.ESCCUP.dto.TeamDto;
import vierasionGameSite.ESCCUP.entity.Player;
import vierasionGameSite.ESCCUP.entity.Team; // [중요] Team 엔티티 import 추가됨
import vierasionGameSite.ESCCUP.repository.PlayerRepository;
import vierasionGameSite.ESCCUP.repository.TeamRepository;
import vierasionGameSite.ESCCUP.dto.AssignRequest;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) // 기본적으로는 조회 모드 (성능 최적화)
public class DraftService {

    private final TeamRepository teamRepository;
    private final PlayerRepository playerRepository;

    // 1. 모든 팀 정보 가져오기 (팀에 속한 선수 포함)
    public List<TeamDto> getAllTeams() {
        return teamRepository.findAll().stream()
                .map(TeamDto::new) // Entity -> DTO 변환
                .collect(Collectors.toList());
    }

    // 2. 팀이 없는(대기 중인) 선수들만 가져오기
    public List<PlayerDto> getStandbyPlayers() {
        return playerRepository.findAll().stream()
                .filter(p -> p.getTeam() == null)
                .map(PlayerDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public PlayerDto assignPlayerToTeam(Long playerId, Long teamId) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new IllegalArgumentException("해당 ID의 선수가 없습니다: " + playerId));

        if (teamId == null) {
            player.setTeam(null);
        } else {
            Team team = teamRepository.findById(teamId)
                    .orElseThrow(() -> new IllegalArgumentException("해당 ID의 팀이 없습니다: " + teamId));
            player.setTeam(team);
        }

        //  변경된 내용을 DB에 강제로 저장 (Flush)
        Player savedPlayer = playerRepository.save(player);

        return new PlayerDto(savedPlayer);
    }

    //4. 전체 일괄 저장 (Batch) - 로그 추가
    @Transactional
    public void assignAllPlayers(List<AssignRequest> requests) {
        System.out.println("====== [Batch Save] 요청 들어옴: " + requests.size() + "건 ======");

        for (AssignRequest req : requests) {
            // 위에서 수정한 메서드를 호출 (save 포함됨)
            assignPlayerToTeam(req.getPlayerId(), req.getTeamId());
        }

        System.out.println("====== [Batch Save] 저장 완료 ======");
    }
}