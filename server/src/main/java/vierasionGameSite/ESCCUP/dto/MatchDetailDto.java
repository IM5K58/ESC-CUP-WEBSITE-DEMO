package vierasionGameSite.ESCCUP.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import vierasionGameSite.ESCCUP.entity.MatchDetail;

@Data
@NoArgsConstructor
public class MatchDetailDto {
    private Long id;

    // 선수 정보
    private Long playerId;
    private String playerName; // "Hide on bush #KR1"

    // 기본 정보
    private String side;
    private String position;
    private String championName;

    // KDA
    private int kills;
    private int deaths;
    private int assists;

    // 상세 통계
    private int champLevel;
    private int totalDamage;
    private int totalGold;
    private int cs;

    // 아이템 (이미지 URL 생성을 위해 ID로 전달)
    private int item0;
    private int item1;
    private int item2;
    private int item3;
    private int item4;
    private int item5;
    private int item6; // 장신구

    // 스펠 & 룬
    private int spell1Id;
    private int spell2Id;
    private int mainRuneId;
    private int subRuneStyleId;

    //티어
    private String playerTier;

    // Entity -> DTO 변환 생성자
    public MatchDetailDto(MatchDetail detail) {
        this.id = detail.getId();

        // Player 객체가 연결되어 있으면 그 정보를 우선 사용
        if (detail.getPlayer() != null) {
            this.playerId = detail.getPlayer().getId();
            this.playerName = detail.getPlayer().getName();
        } else {
            // 연결된 Player가 없으면 백업된 닉네임 사용
            this.playerName = detail.getPlayerName();
        }

        if (detail.getPlayer() != null && detail.getPlayer().getTier() != null) {
            this.playerTier = detail.getPlayer().getTier();
        } else {
            this.playerTier = "Unranked";
        }

        this.side = detail.getSide();
        this.position = detail.getPosition();
        this.championName = detail.getChampionName();

        this.kills = detail.getKills();
        this.deaths = detail.getDeaths();
        this.assists = detail.getAssists();

        // 확장 데이터 매핑
        this.champLevel = detail.getChampLevel();
        this.totalDamage = detail.getTotalDamage();
        this.totalGold = detail.getTotalGold();
        this.cs = detail.getCs();

        this.item0 = detail.getItem0();
        this.item1 = detail.getItem1();
        this.item2 = detail.getItem2();
        this.item3 = detail.getItem3();
        this.item4 = detail.getItem4();
        this.item5 = detail.getItem5();
        this.item6 = detail.getItem6();

        this.spell1Id = detail.getSpell1Id();
        this.spell2Id = detail.getSpell2Id();
        this.mainRuneId = detail.getMainRuneId();
        this.subRuneStyleId = detail.getSubRuneStyleId();
    }
}