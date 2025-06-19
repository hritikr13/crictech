package com.cricket.analytics.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "player_stats")
public class PlayerStats {

    @Id
    private String id;
    private String player;
    private String team;
    private int season;
    private int runs;
    private int wickets;
    private double strikeRate;

    // Getters and Setters

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPlayer() { return player; }
    public void setPlayer(String player) { this.player = player; }

    public String getTeam() { return team; }
    public void setTeam(String team) { this.team = team; }

    public int getSeason() { return season; }
    public void setSeason(int season) { this.season = season; }

    public int getRuns() { return runs; }
    public void setRuns(int runs) { this.runs = runs; }

    public int getWickets() { return wickets; }
    public void setWickets(int wickets) { this.wickets = wickets; }

    public double getStrikeRate() { return strikeRate; }
    public void setStrikeRate(double strikeRate) { this.strikeRate = strikeRate; }
}
