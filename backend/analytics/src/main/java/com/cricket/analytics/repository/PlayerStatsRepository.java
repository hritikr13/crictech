
package com.cricket.analytics.repository;

import com.cricket.analytics.model.PlayerStats;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PlayerStatsRepository extends MongoRepository<PlayerStats, String> {

    List<PlayerStats> findByTeam(String team);

    List<PlayerStats> findByTeamIgnoreCase(String team);

    List<PlayerStats> findBySeason(int season);

    List<PlayerStats> findByTeamIgnoreCaseAndSeason(String team, int season);

    Page<PlayerStats> findByTeamIgnoreCase(String team, Pageable pageable);

    Page<PlayerStats> findBySeason(int season, Pageable pageable);

    Page<PlayerStats> findByTeamIgnoreCaseAndSeason(
            String team,
            int season,
            Pageable pageable
    );
}
