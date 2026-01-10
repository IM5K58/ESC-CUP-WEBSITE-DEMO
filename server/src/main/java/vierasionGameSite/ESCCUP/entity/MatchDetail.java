package vierasionGameSite.ESCCUP.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter @Setter
@NoArgsConstructor
@Table(name = "match_details") //경기 상세 기록 표시, 라이엇 api로 데이터 받아와서 저장됨
public class MatchDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id")
    private Match match;

    // DB에 없는 선수도 기록될 수 있도록 null 허용 필수
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_id", nullable = true)
    private Player player;
    private String playerName;
    private String playerTier; // 스냅샷 티어

    private String side;
    private String position; //포지션
    private String championName; //챔피언 이름

    private int kills;
    private int deaths; 
    private int assists;

    private int champLevel;
    private int totalDamage;
    private int totalGold;
    private int cs;

    private int item0;
    private int item1;
    private int item2;
    private int item3;
    private int item4;
    private int item5;
    private int item6;

    private int spell1Id;
    private int spell2Id;

    // 룬 정보
    private int mainRuneId;
    private int subRuneStyleId;
}