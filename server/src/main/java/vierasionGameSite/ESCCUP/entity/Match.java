// src/main/java/vierasionGameSite/ESCCUP/entity/Match.java

package vierasionGameSite.ESCCUP.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter @Setter
@NoArgsConstructor
@Table(name = "matches")
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 대진표 단계
    private String stage;

    // 토너먼트 구조용 필드
    private Integer round;      // 8 (8강), 4 (4강), 2 (결승)
    private Integer matchOrder; // 위에서부터 1, 2, 3, 4... 순서
    private Long nextMatchId;   // 이 경기 승자가 진출할 다음 경기 ID

    // 단순 이름(String) -> Team 객체와 연결(@ManyToOne)
    // 이렇게 해야 팀 이름이 바뀌어도 자동 반영되고, 팀 ID로 조회가 가능합니다.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blue_team_id")
    private Team blueTeam;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "red_team_id")
    private Team redTeam;

    // 승리팀도 객체로 저장 (기존 winningSide Enum 대체)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "winner_team_id")
    private Team winningTeam;

    // 점수 (예: "2:1", 단판이면 "1:0" 등)
    private String score;

    // [추가] 경기 상태 (SCHEDULED: 예정, FINISHED: 종료)
    private String status = "SCHEDULED";

    // 경기 날짜 (Riot API에서 가져온 시간 혹은 생성 시간 저장)
    private LocalDateTime matchDate;

    // 상세 기록 연결 (KDA, 아이템 등)
    @OneToMany(mappedBy = "match", cascade = CascadeType.ALL)
    private List<MatchDetail> matchDetails = new ArrayList<>();

    private int queueId;


    private int blueBaronKills;
    private int blueDragonKills;
    private int blueTowerKills;
    private String blueBans; // 챔피언ID를 콤마(,)로 구분해서 저장 (예: "1,2,3,4,5")

    //  레드팀 오브젝트 & 밴
    private int redBaronKills;
    private int redDragonKills;
    private int redTowerKills;
    private String redBans;
}