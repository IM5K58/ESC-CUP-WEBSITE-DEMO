package vierasionGameSite.ESCCUP.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter @Setter
@NoArgsConstructor
@Table(name = "teams")
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // 팀 이름
    private int displayOrder; // 화면 표시 순서

    // 하나의 팀에는 여러 선수가 들어감.
    @OneToMany(mappedBy = "team")
    private List<Player> players = new ArrayList<>();
}
