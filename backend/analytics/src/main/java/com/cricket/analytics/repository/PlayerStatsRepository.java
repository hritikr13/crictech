package com.cricket.analytics.repository;

import com.cricket.analytics.model.PlayerStats;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface PlayerStatsRepository extends MongoRepository<PlayerStats, String> {
    List<PlayerStats> findByTeam(String team);
    List<PlayerStats> findBySeason(int season);
}
