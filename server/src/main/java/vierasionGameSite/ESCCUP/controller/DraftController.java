// src/main/java/vierasionGameSite/ESCCUP/controller/DraftController.java

package vierasionGameSite.ESCCUP.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import vierasionGameSite.ESCCUP.dto.PlayerDto;
import vierasionGameSite.ESCCUP.dto.TeamDto;
import vierasionGameSite.ESCCUP.service.DraftService;
import vierasionGameSite.ESCCUP.dto.AssignRequest;

import java.util.List;

@RestController
@RequestMapping("/api/draft") // 모든 주소는 /api/draft 로 시작
@RequiredArgsConstructor
public class DraftController {

    private final DraftService draftService;

    // GET http://localhost:8080/api/draft/teams
    @GetMapping("/teams")
    public List<TeamDto> getTeams() {
        return draftService.getAllTeams();
    }

    // GET http://localhost:8080/api/draft/standby
    @GetMapping("/standby")
    public List<PlayerDto> getStandbyPlayers() {
        return draftService.getStandbyPlayers();
    }

    // 전체 배치 정보 한방에 저장하기 (Batch Insert)
    // POST http://localhost:8080/api/draft/assign/all
    @PostMapping("/assign/all")
    public void assignAllPlayers(@RequestBody List<AssignRequest> requests) {
        draftService.assignAllPlayers(requests);
    }
}