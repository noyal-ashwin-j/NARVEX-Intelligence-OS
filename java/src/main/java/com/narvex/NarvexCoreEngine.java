package com.narvex;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;

/**
 * NARVEX High-Performance Java Core Security & Intelligence Engine
 * Author: Noyal Ashwin J (VBE Coding)
 * Purpose: Java sovereign backend core for SHA-256 block hash lineage validation,
 *          tripartite safeguard scoring, and multi-agency access policy enforcement.
 */
public class NarvexCoreEngine {

    public static String computeSHA256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes());
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 Algorithm not found", e);
        }
    }

    public static Map<String, Object> calculateTripartiteScore(double riskLevelScore, double confidenceScore, String coverageStatus) {
        Map<String, Object> result = new HashMap<>();
        
        String riskBadge;
        if (riskLevelScore >= 0.75) {
            riskBadge = "HIGH PREVENTIVE ATTENTION";
        } else if (riskLevelScore >= 0.45) {
            riskBadge = "EMERGING";
        } else {
            riskBadge = "STABLE";
        }

        result.put("riskBadge", riskBadge);
        result.put("confidenceScore", Math.min(0.95, confidenceScore));
        result.put("coverageStatus", coverageStatus);
        result.put("safeguardApproved", confidenceScore >= 0.50);
        
        return result;
    }

    public static void main(String[] args) {
        System.out.println("=================================================");
        System.out.println("🛡️ NARVEX JAVA SOVEREIGN CORE INTELLIGENCE ENGINE");
        System.out.println("Author: Noyal Ashwin J (VBE Coding)");
        System.out.println("=================================================");

        String sampleBlockData = "Block #302: Coimbatore-Peelamedu Seizure Exhibit #991";
        String blockHash = computeSHA256(sampleBlockData);
        System.out.println("✅ SHA-256 Ledger Block Hash: " + blockHash);

        Map<String, Object> score = calculateTripartiteScore(0.82, 0.88, "FULLY_COVERED");
        System.out.println("✅ Tripartite Score Evaluation: " + score);
    }
}
