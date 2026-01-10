package vierasionGameSite.ESCCUP.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vierasionGameSite.ESCCUP.entity.Team;
import vierasionGameSite.ESCCUP.repository.TeamRepository;

import java.util.List;

@RestController
@RequestMapping("/api/teams") // ✨ 이 주소가 있어야 프론트엔드가 찾을 수 있습니다.
@RequiredArgsConstructor
public class TeamController {

    private final TeamRepository teamRepository;

    // 팀 전체 목록 조회
    @GetMapping
    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }
}