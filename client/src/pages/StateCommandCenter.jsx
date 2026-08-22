import React from 'react';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { Interactive3DGlobeMap } from '../components/map/Interactive3DGlobeMap';
import { NarvexAvatarCore } from '../components/assistant/NarvexAvatarCore';

/**
 * State Command Center - Landing View for State Admin
 * Pure, clean 2-column split viewport:
 * - Left Side: Interactive 3D Globe & Hierarchical Intelligence Map (GLOBAL -> INDIA -> TAMIL NADU)
 * - Right Side: Centralized NARVEX Voice/Text AI Copilot Core
 */

import { AdvancedIntelligenceHub } from '../components/analytics/AdvancedIntelligenceHub';

export function StateCommandCenter({ onSelectDistrict, onNavigateTab, onOpenFeed }) {
  return (
    <div className="w-full space-y-4 font-inter pb-8">
      {/* 2-Column Split: Interactive 3D Globe Map (Left 7 Cols) + NARVEX AI Assistant (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[540px]">
        {/* Left Side: Interactive 3D Globe Map */}
        <div className="lg:col-span-7 h-[540px]">
          <ErrorBoundary>
            <Interactive3DGlobeMap
              height="100%"
              onSelectDistrict={onSelectDistrict}
            />
          </ErrorBoundary>
        </div>

        {/* Right Side: Centralized NARVEX AI Assistant */}
        <div className="lg:col-span-5 h-[540px] flex flex-col justify-between">
          <ErrorBoundary>
            <NarvexAvatarCore
              activeDistrictId={2}
              onNavigateTab={onNavigateTab}
              onSelectDistrict={onSelectDistrict}
            />
          </ErrorBoundary>
        </div>
      </div>

      {/* Advanced Strategic Intelligence Hub (Modules 1-5) */}
      <ErrorBoundary>
        <AdvancedIntelligenceHub districtId="ALL" />
      </ErrorBoundary>
    </div>
  );
}
