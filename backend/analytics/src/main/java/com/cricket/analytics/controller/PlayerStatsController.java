package com.cricket.analytics.controller;

import com.cricket.analytics.model.PlayerStats;
import com.cricket.analytics.repository.PlayerStatsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = "*")
public class PlayerStatsController {

    @Autowired
    private PlayerStatsRepository repo;

    @GetMapping("/players")
    public List<PlayerStats> getAll() {
        return repo.findAll();
    }

    @GetMapping("/team/{team}")
    public List<PlayerStats> getByTeam(@PathVariable String team) {
        return repo.findByTeam(team);
    }

    @GetMapping("/season/{season}")
    public List<PlayerStats> getBySeason(@PathVariable int season) {
        return repo.findBySeason(season);
    }
}
