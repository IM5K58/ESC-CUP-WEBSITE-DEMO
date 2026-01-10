// src/main/java/vierasionGameSite/ESCCUP/repository/PlayerRepository.java

package vierasionGameSite.ESCCUP.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vierasionGameSite.ESCCUP.entity.Player;

import java.util.Optional;

public interface PlayerRepository extends JpaRepository<Player, Long> {
    Optional<Player> findByName(String name);
}