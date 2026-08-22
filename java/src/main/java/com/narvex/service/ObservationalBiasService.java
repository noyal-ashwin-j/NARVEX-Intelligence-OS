package com.narvex.service;

import java.util.HashMap;
import java.util.Map;

public class ObservationalBiasService {

    public Map<String, Object> calculateBiasAdjustedMetrics(int observedCount, int enforcementCount) {
        Map<String, Object> metrics = new HashMap<>();
        double enforcementRatio = observedCount > 0 ? (double) enforcementCount / observedCount : 0.0;
        double coverage = 1.0 - (1.0 / (1.0 + (observedCount / 10.0)));
        double adjustedScore = observedCount * (1.0 - 0.4 * enforcementRatio) * coverage;
        double confidence = Math.min(0.95, 0.4 + (observedCount * 0.03));

        metrics.put("observedCount", observedCount);
        metrics.put("enforcementRatio", Math.round(enforcementRatio * 100.0) / 100.0);
        metrics.put("adjustedScore", Math.round(adjustedScore * 100.0) / 100.0);
        metrics.put("confidence", Math.round(confidence * 100.0) / 100.0);
        return metrics;
    }
}
