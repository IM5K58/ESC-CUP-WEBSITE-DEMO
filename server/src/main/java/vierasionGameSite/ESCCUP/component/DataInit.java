// src/main/java/vierasionGameSite/ESCCUP/component/DataInit.java

package vierasionGameSite.ESCCUP.component;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import vierasionGameSite.ESCCUP.entity.Player;
import vierasionGameSite.ESCCUP.entity.Team;
import vierasionGameSite.ESCCUP.repository.PlayerRepository;
import vierasionGameSite.ESCCUP.repository.TeamRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

//@Component
@RequiredArgsConstructor
public class DataInit {

    private final TeamRepository teamRepository;
    private final PlayerRepository playerRepository;

    // 서버가 시작되면 이 메서드가 자동으로 실행됩니다.
    @PostConstruct
    @Transactional
    public void init() {
        // 이미 데이터가 있다면 생성하지 않음 (중복 방지)
        if (teamRepository.count() > 0) {
            return;
        }

        System.out.println("====== [System] 초기 데이터 생성을 시작합니다... ======");

        // 1. 팀 6개 생성
        List<Team> teams = new ArrayList<>();
        for (int i = 1; i <= 6; i++) {
            Team team = new Team();
            team.setName("Team " + i); // 팀 이름: Team 1 ~ Team 6
            team.setDisplayOrder(i);
            teams.add(teamRepository.save(team));
        }

        // 2. 선수 30명 생성 (대기 명단)
        String[] positions = {"TOP", "JUG", "MID", "ADC", "SUP"};
        String[] tiers = {"Challenger", "GrandMaster", "Master", "Diamond", "Emerald"};
        Random random = new Random();

        for (int i = 1; i <= 30; i++) {
            Player player = new Player();
            player.setName("Player" + i); // 선수 이름: Player1 ~ Player30

            // 포지션과 티어는 랜덤으로 배정 (테스트용)
            player.setPosition(positions[random.nextInt(positions.length)]);
            player.setTier(tiers[random.nextInt(tiers.length)]);

            player.setOpggUrl("https://www.op.gg/summoners/kr/Hide%20on%20bush-KR1"); // 페이커 선수 링크(임시)

            // 처음엔 팀이 없는 상태(Null)로 시작
            player.setTeam(null);

            playerRepository.save(player);
        }

        System.out.println("====== [System] 팀 6개, 선수 30명 생성 완료! ======");
    }
}