package com.narvex;

/**
 * NARVEX Main Application Launcher
 * Author: Noyal Ashwin J (VBE Coding)
 */
public class NarvexApplication {
    public static void main(String[] args) {
        System.out.println("=================================================");
        System.out.println("🛡️ NARVEX JAVA ENTERPRISE SOVEREIGN ENGINE RUNNING");
        System.out.println("Author: Noyal Ashwin J (VBE Coding)");
        System.out.println("=================================================");
        com.narvex.controller.DistrictIntelligenceController controller = new com.narvex.controller.DistrictIntelligenceController();
        System.out.println("✅ Active Districts: " + controller.getDistrictOverview().size());
    }
}
