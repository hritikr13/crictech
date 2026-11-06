
package com.cricket.analytics.service;

import com.cricket.analytics.model.PlayerStats;
import com.cricket.analytics.repository.PlayerStatsRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

@Service
public class PlayerStatsService {

    private static final int MIN_SEASON = 2008;
    private static final int MAX_SEASON = 2025;
    private static final int MAX_PAGE_SIZE = 100;

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "player", "team", "season", "runs", "wickets", "strikeRate"
    );

    private final PlayerStatsRepository repository;
    private final MongoTemplate mongoTemplate;

    public PlayerStatsService(
            PlayerStatsRepository repository,
            MongoTemplate mongoTemplate
    ) {
        this.repository = repository;
        this.mongoTemplate = mongoTemplate;
    }

    public List<PlayerStats> getAllPlayers() {
        return repository.findAll();
    }

    public List<PlayerStats> getPlayersByTeam(String team) {
        validateTeam(team);
        return repository.findByTeamIgnoreCase(team.trim());
    }

    public List<PlayerStats> getPlayersBySeason(int season) {
        validateSeason(season);
        return repository.findBySeason(season);
    }

    public Page<PlayerStats> searchPlayers(
            String team,
            Integer season,
            String playerName,
            int page,
            int size,
            String sortBy,
            String direction
    ) {
        if (page < 0) {
            throw new IllegalArgumentException(
                    "Page number cannot be negative."
            );
        }

        if (size < 1 || size > MAX_PAGE_SIZE) {
            throw new IllegalArgumentException(
                    "Page size must be between 1 and " + MAX_PAGE_SIZE + "."
            );
        }

        if (team != null && !team.isBlank()) {
            validateTeam(team);
            team = team.trim();
        } else {
            team = null;
        }

        if (season != null) {
            validateSeason(season);
        }

        if (playerName != null) {
            playerName = playerName.trim();

            if (playerName.isBlank()) {
                playerName = null;
            } else if (playerName.length() > 100) {
                throw new IllegalArgumentException(
                        "Player search cannot exceed 100 characters."
                );
            }
        }

        String normalizedSortField =
                sortBy == null || sortBy.isBlank()
                        ? "runs"
                        : sortBy.trim();

        if (!ALLOWED_SORT_FIELDS.contains(normalizedSortField)) {
            throw new IllegalArgumentException(
                    "Invalid sort field. Allowed fields: "
                            + ALLOWED_SORT_FIELDS
            );
        }

        Sort.Direction sortDirection;

        try {
            sortDirection = Sort.Direction.fromString(
                    direction == null || direction.isBlank()
                            ? "desc"
                            : direction
            );
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException(
                    "Sort direction must be either asc or desc."
            );
        }

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(sortDirection, normalizedSortField)
                        .and(Sort.by(Sort.Direction.ASC, "id"))
        );

        List<Criteria> criteriaList = new ArrayList<>();

        if (team != null) {
            criteriaList.add(
                    Criteria.where("team").regex(
                            "^" + Pattern.quote(team) + "$",
                            "i"
                    )
            );
        }

        if (season != null) {
            criteriaList.add(
                    Criteria.where("season").is(season)
            );
        }

        if (playerName != null) {
            criteriaList.add(
                    Criteria.where("player").regex(
                            Pattern.quote(playerName),
                            "i"
                    )
            );
        }

        // Build an independent query for counting.
        Query countQuery = buildQuery(criteriaList);

        long totalElements = mongoTemplate.count(
                countQuery,
                PlayerStats.class
        );

        // Build another independent query for retrieving records.
        Query dataQuery = buildQuery(criteriaList);
        dataQuery.with(pageable);

        List<PlayerStats> content = mongoTemplate.find(
                dataQuery,
                PlayerStats.class
        );

        return new PageImpl<>(content, pageable, totalElements);
    }

    private Query buildQuery(List<Criteria> criteriaList) {
        Query query = new Query();

        if (!criteriaList.isEmpty()) {
            query.addCriteria(
                    new Criteria().andOperator(
                            criteriaList.toArray(new Criteria[0])
                    )
            );
        }

        return query;
    }

    private void validateTeam(String team) {
        if (team == null || team.isBlank()) {
            throw new IllegalArgumentException(
                    "Team name cannot be empty."
            );
        }
    }

    private void validateSeason(int season) {
        if (season < MIN_SEASON || season > MAX_SEASON) {
            throw new IllegalArgumentException(
                    "Season must be between " + MIN_SEASON
                            + " and " + MAX_SEASON + "."
            );
        }
    }
}
