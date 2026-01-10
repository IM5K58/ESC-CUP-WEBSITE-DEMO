package vierasionGameSite.ESCCUP.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import vierasionGameSite.ESCCUP.entity.Match;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
public class MatchDto {
    private Long id;
    private String stage;
    private Long blueTeamId;
    private String blueTeamName;
    private Long redTeamId;
    private String redTeamName;
    private Long winnerTeamId;
    private String score;
    private String status;
    private int queueId; // 0: 사설, 420: 솔랭

    // 토너먼트 정보
    private Integer round;
    private Integer matchOrder;
    private Long nextMatchId;


    // 상세 통계 데이터 (오브젝트 & 밴)
    private int blueBaronKills;
    private int blueDragonKills;
    private int blueTowerKills;
    private String blueBans;

    private int redBaronKills;
    private int redDragonKills;
    private int redTowerKills;
    private String redBans;

    // 모달창에 띄울 선수별 상세 기록 리스트
    private List<MatchDetailDto> matchDetails = new ArrayList<>();

    // Entity -> DTO 변환 생성자
    public MatchDto(Match m) {
        this.id = m.getId();
        this.stage = m.getStage();
        this.score = m.getScore();
        this.status = m.getStatus();
        this.queueId = m.getQueueId();

        // [추가] Entity -> DTO 변환
        this.round = m.getRound();
        this.matchOrder = m.getMatchOrder();
        this.nextMatchId = m.getNextMatchId();

        // 1. 블루팀 처리 (DB에 없는 팀이면 "Blue Team"으로 표시)
        if (m.getBlueTeam() != null) {
            this.blueTeamId = m.getBlueTeam().getId();
            this.blueTeamName = m.getBlueTeam().getName();
        } else {
            this.blueTeamId = null;
            this.blueTeamName = "Blue Team"; // 기본값
        }

        // 2. 레드팀 처리 (DB에 없는 팀이면 "Red Team"으로 표시)
        if (m.getRedTeam() != null) {
            this.redTeamId = m.getRedTeam().getId();
            this.redTeamName = m.getRedTeam().getName();
        } else {
            this.redTeamId = null;
            this.redTeamName = "Red Team"; // 기본값
        }

        // 3. 승리팀 ID 처리
        if (m.getWinningTeam() != null) {
            this.winnerTeamId = m.getWinningTeam().getId();
        }

        // 4. 오브젝트 & 밴 정보 매핑
        this.blueBaronKills = m.getBlueBaronKills();
        this.blueDragonKills = m.getBlueDragonKills();
        this.blueTowerKills = m.getBlueTowerKills();
        this.blueBans = m.getBlueBans();

        this.redBaronKills = m.getRedBaronKills();
        this.redDragonKills = m.getRedDragonKills();
        this.redTowerKills = m.getRedTowerKills();
        this.redBans = m.getRedBans();

        // 5. 상세 기록 리스트 매핑 (중요: 이게 있어야 모달창이 뜸)
        if (m.getMatchDetails() != null) {
            this.matchDetails = m.getMatchDetails().stream()
                    .map(MatchDetailDto::new) // Detail Entity -> DTO 변환
                    .collect(Collectors.toList());
        }
    }
}