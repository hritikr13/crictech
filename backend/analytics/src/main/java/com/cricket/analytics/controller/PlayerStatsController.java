
package com.cricket.analytics.controller;

import com.cricket.analytics.model.PlayerStats;
import com.cricket.analytics.service.PlayerStatsService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = "http://localhost:4200")
public class PlayerStatsController {

    private final PlayerStatsService playerStatsService;

    public PlayerStatsController(PlayerStatsService playerStatsService) {
        this.playerStatsService = playerStatsService;
    }

    @GetMapping("/players")
    public List<PlayerStats> getAllPlayers() {
        return playerStatsService.getAllPlayers();
    }

    @GetMapping("/team/{team}")
    public List<PlayerStats> getPlayersByTeam(@PathVariable String team) {
        return playerStatsService.getPlayersByTeam(team);
    }

    @GetMapping("/season/{season}")
    public List<PlayerStats> getPlayersBySeason(@PathVariable int season) {
        return playerStatsService.getPlayersBySeason(season);
    }

    @GetMapping("/search")
    public Page<PlayerStats> searchPlayers(
            @RequestParam(required = false) String team,
            @RequestParam(required = false) Integer season,
            @RequestParam(required = false) String playerName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "runs") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        return playerStatsService.searchPlayers(
                team,
                season,
                playerName,
                page,
                size,
                sortBy,
                direction
        );
    }
}
