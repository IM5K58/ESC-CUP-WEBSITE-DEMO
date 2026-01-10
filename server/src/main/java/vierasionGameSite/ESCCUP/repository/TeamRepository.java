// src/main/java/vierasionGameSite/ESCCUP/repository/TeamRepository.java

package vierasionGameSite.ESCCUP.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vierasionGameSite.ESCCUP.entity.Team;

public interface TeamRepository extends JpaRepository<Team, Long> {
}