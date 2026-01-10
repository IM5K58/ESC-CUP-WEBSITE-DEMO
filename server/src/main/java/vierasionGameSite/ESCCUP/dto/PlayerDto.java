// src/main/java/vierasionGameSite/ESCCUP/dto/PlayerDto.java

package vierasionGameSite.ESCCUP.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import vierasionGameSite.ESCCUP.entity.Player;

@Data
@NoArgsConstructor
public class PlayerDto {
    private Long id;
    private String name;
    private String tier;
    private String highestTier;
    private String position;
    private String opggUrl;
    private Long teamId; // 팀 객체 대신 ID만 보냅니다 (순환 참조 방지)

    // Entity -> DTO 변환 생성자
    public PlayerDto(Player player) {
        this.id = player.getId();
        this.name = player.getName();
        this.tier = player.getTier();
        this.highestTier = player.getHighestTier();
        this.position = player.getPosition();
        this.opggUrl = player.getOpggUrl();
        if (player.getTeam() != null) {
            this.teamId = player.getTeam().getId();
        }
    }
}