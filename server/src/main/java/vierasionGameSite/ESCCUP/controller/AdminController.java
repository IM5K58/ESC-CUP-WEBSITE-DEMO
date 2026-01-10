package vierasionGameSite.ESCCUP.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import vierasionGameSite.ESCCUP.dto.PlayerDto;
import vierasionGameSite.ESCCUP.dto.TeamDto;
import vierasionGameSite.ESCCUP.entity.Match;
import vierasionGameSite.ESCCUP.entity.Player;
import vierasionGameSite.ESCCUP.entity.Team;
import vierasionGameSite.ESCCUP.repository.MatchRepository;
import vierasionGameSite.ESCCUP.repository.PlayerRepository;
import vierasionGameSite.ESCCUP.repository.TeamRepository;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final PlayerRepository playerRepository;
    private final TeamRepository teamRepository;
    private final MatchRepository matchRepository;

    // --- [선수 관리 API] ---

    @GetMapping("/players")
    public List<PlayerDto> getAllPlayers() {
        return playerRepository.findAll().stream()
                .map(PlayerDto::new)
                .collect(Collectors.toList());
    }

    @PostMapping("/players")
    public PlayerDto createPlayer(@RequestBody PlayerDto dto) {
        Player player = new Player();
        player.setName(dto.getName());
        player.setTier(dto.getTier());
        player.setPosition(dto.getPosition());
        player.setOpggUrl(dto.getOpggUrl());

        // [수정] 최고 티어 저장 로직
        // 프론트에서 highestTier를 보내주면 그걸 쓰고, 없으면 현재 티어와 동일하게 설정
        if (dto.getHighestTier() != null && !dto.getHighestTier().isEmpty()) {
            player.setHighestTier(dto.getHighestTier());
        } else {
            player.setHighestTier(dto.getTier());
        }

        player.setTeam(null);
        return new PlayerDto(playerRepository.save(player));
    }

    // 개별 선수 삭제
    @DeleteMapping("/players/{id}")
    public void deletePlayer(@PathVariable Long id) {
        playerRepository.deleteById(id);
    }

    // 선수 전체 삭제 (안전 삭제)
    @DeleteMapping("/players/all")
    @Transactional
    public void deleteAllPlayers() {
        List<Team> teams = teamRepository.findAll();
        for (Team team : teams) {
            team.getPlayers().clear();
        }
        teamRepository.saveAll(teams);

        playerRepository.deleteAll();
    }


    // --- [팀 관리 API] ---

    // 1. 팀 목록 가져오기
    @GetMapping("/teams")
    public List<TeamDto> getAllTeams() {
        return teamRepository.findAll().stream()
                .map(TeamDto::new)
                .collect(Collectors.toList());
    }

    // 2. 팀 추가하기
    @PostMapping("/teams")
    public TeamDto createTeam() {
        long count = teamRepository.count();
        Team team = new Team();
        team.setName("Team " + (count + 1));
        team.setDisplayOrder((int) count + 1);
        return new TeamDto(teamRepository.save(team));
    }

    // 3. 팀 이름 수정하기
    @PutMapping("/teams/{id}")
    public TeamDto updateTeamName(@PathVariable Long id, @RequestBody TeamDto dto) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("팀이 없습니다."));
        team.setName(dto.getName());
        return new TeamDto(teamRepository.save(team));
    }

    // 4. 팀 삭제하기 (안전 삭제)
    @Transactional
    @DeleteMapping("/teams/{id}")
    public void deleteTeam(@PathVariable Long id) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("팀이 없습니다."));

        // 1. 소속 선수 방출
        for (Player player : team.getPlayers()) {
            player.setTeam(null);
        }

        // 2. 경기 기록 연결 끊기
        List<Match> matches = matchRepository.findAll();
        for (Match match : matches) {
            if (team.equals(match.getBlueTeam())) match.setBlueTeam(null);
            if (team.equals(match.getRedTeam())) match.setRedTeam(null);
            if (team.equals(match.getWinningTeam())) match.setWinningTeam(null);
        }
        matchRepository.saveAll(matches);

        // 3. 팀 삭제
        teamRepository.delete(team);
    }

    // 5. 팀 전체 삭제
    @Transactional
    @DeleteMapping("/teams/all")
    public void deleteAllTeams() {
        List<Match> matches = matchRepository.findAll();
        for (Match match : matches) {
            match.setBlueTeam(null);
            match.setRedTeam(null);
            match.setWinningTeam(null);
        }
        matchRepository.saveAll(matches);

        List<Team> teams = teamRepository.findAll();
        for (Team team : teams) {
            for (Player player : team.getPlayers()) {
                player.setTeam(null);
            }
        }

        teamRepository.deleteAll();
    }
}