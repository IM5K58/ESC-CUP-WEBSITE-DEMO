// src/main/java/vierasionGameSite/ESCCUP/dto/AssignRequest.java

package vierasionGameSite.ESCCUP.dto;

import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
public class AssignRequest {
    private Long playerId; // 옮길 선수 ID
    private Long teamId;   // 목적지 팀 ID (대기 명단이면 null)
}