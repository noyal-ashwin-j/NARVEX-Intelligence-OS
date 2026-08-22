package com.narvex.controller;

import com.narvex.model.DistrictEntity;
import com.narvex.service.ObservationalBiasService;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class DistrictIntelligenceController {

    private final ObservationalBiasService biasService = new ObservationalBiasService();

    public List<DistrictEntity> getDistrictOverview() {
        List<DistrictEntity> districts = new ArrayList<>();
        districts.add(new DistrictEntity(1, "TN-CBE", "Coimbatore", 11.0168, 76.9558, "EMERGING", 0.88, "FULLY_COVERED"));
        districts.add(new DistrictEntity(2, "TN-KPM", "Kanchipuram", 12.8342, 79.7036, "STABLE", 0.92, "FULLY_COVERED"));
        return districts;
    }

    public Map<String, Object> getDistrictBiasAnalysis(int districtId, int observed, int enforcement) {
        return biasService.calculateBiasAdjustedMetrics(observed, enforcement);
    }
}
