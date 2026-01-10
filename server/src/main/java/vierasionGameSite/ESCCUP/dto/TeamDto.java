// src/main/java/vierasionGameSite/ESCCUP/dto/TeamDto.java

package vierasionGameSite.ESCCUP.dto;
import lombok.NoArgsConstructor;
import lombok.Data;
import vierasionGameSite.ESCCUP.entity.Team;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
public class TeamDto {
    private Long id;
    private String name;
    private int displayOrder;
    private List<PlayerDto> players; // Player 대신 PlayerDto 리스트

    // Entity -> DTO 변환 생성자
    public TeamDto(Team team) {
        this.id = team.getId();
        this.name = team.getName();
        this.displayOrder = team.getDisplayOrder();
        // 팀에 소속된 선수들을 DTO로 변환해서 담음
        this.players = team.getPlayers().stream()
                .map(PlayerDto::new)
                .collect(Collectors.toList());
    }
}