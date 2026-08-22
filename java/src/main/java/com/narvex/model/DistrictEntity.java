package com.narvex.model;

public class DistrictEntity {
    private Integer id;
    private String code;
    private String name;
    private Double centerLat;
    private Double centerLng;
    private String riskLevel;
    private Double confidenceScore;
    private String coverageStatus;

    public DistrictEntity(Integer id, String code, String name, Double centerLat, Double centerLng, String riskLevel, Double confidenceScore, String coverageStatus) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.centerLat = centerLat;
        this.centerLng = centerLng;
        this.riskLevel = riskLevel;
        this.confidenceScore = confidenceScore;
        this.coverageStatus = coverageStatus;
    }

    public Integer getId() { return id; }
    public String getCode() { return code; }
    public String getName() { return name; }
    public Double getCenterLat() { return centerLat; }
    public Double getCenterLng() { return centerLng; }
    public String getRiskLevel() { return riskLevel; }
    public Double getConfidenceScore() { return confidenceScore; }
    public String getCoverageStatus() { return coverageStatus; }
}
