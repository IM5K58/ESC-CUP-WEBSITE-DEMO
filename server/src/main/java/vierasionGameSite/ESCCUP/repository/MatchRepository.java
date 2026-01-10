package vierasionGameSite.ESCCUP.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vierasionGameSite.ESCCUP.entity.Match;
import java.util.List;

public interface MatchRepository extends JpaRepository<Match, Long> {
    // ID 순서대로 가져오기 (생성된 순서대로 대진표 표시)
    List<Match> findAllByOrderByIdAsc();
    //  round 값이 있는(토너먼트) 경기만 삭제하는 기능
    void deleteByRoundNotNull();
}