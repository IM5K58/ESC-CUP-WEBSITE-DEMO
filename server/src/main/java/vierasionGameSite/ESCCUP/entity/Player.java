package vierasionGameSite.ESCCUP.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter @Setter
@NoArgsConstructor
@Table(name = "players")
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; //고유 id
    @Column(nullable = false)
    private String name; // 소환사명
    private String tier; // 티어
    private String highestTier;
    private String position; // 주 포지션 (TOP, JUG 등)
    @Column(name = "opgg_url")
    private String opggUrl; // OPGG 링크

    // 선수는 하나의 팀에 소속됨.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private Team team; // 현재 소속된 팀 (Null이면 대기 명단)

    // 연관 관계 편의 메서드 (양쪽 다 데이터를 맞춰주기 위함)
    public void setTeam(Team team) {
        this.team = team;
        if (team != null && !team.getPlayers().contains(this)) {
            team.getPlayers().add(this);
        }
    }
    public Long getTeamId() {
        return team != null ? team.getId() : null;
    }
}