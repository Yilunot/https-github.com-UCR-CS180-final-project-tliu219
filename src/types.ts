/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Shot {
  id: string;
  score: number; // 0-10
  is_x?: boolean;
  distance: number; // in meters
  x: number; // 0-100 (relative to target center)
  y: number; // 0-100
  timestamp: number;
  notes?: string;
}

export interface Session {
  id: string;
  name: string;
  date: string;
  archer_id: string;
  shots: Shot[];
  distance: number;
  target_type: 'wa_122' | 'wa_80' | 'indoor_60' | 'indoor_40' | 'field_80' | 'field_65' | 'field_50' | 'field_35' | 'field_20' | 'foam_25x32' | 'foam_40x48' | '3d';
}

export interface FormAnalysis {
  id: string;
  timestamp: number;
  image_url: string;
  issues: string[];
  recommendations: string[];
  raw_analysis?: string;
}

export interface ArcherProfile {
  id: string;
  name: string;
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'pro';
  bow_type: 'recurve' | 'compound' | 'traditional' | 'barebow';
  draw_weight: number;
  height: number; // in cm
  wingspan: number; // in cm
  draw_length: number; // in inches
  point_weight?: number; // in grains
  riser_length?: number; // in inches
  limb_size?: 'short' | 'medium' | 'long';
  arrow_length?: number; // in inches
  arrow_spine?: number;
  anchor_point?: string;
  brace_height?: number; // in inches
  joined_date: number;
}

export type ViewState = 'dashboard' | 'log_session' | 'analyze_form' | 'history' | 'onboarding' | 'profile' | 'view_session' | 'arrow_tool';

export interface PerformanceStats {
  averageScore: number;
  totalShots: number;
  bestSession: number;
  consistencyScore: number; // 0-1
  progressTrend: 'up' | 'down' | 'steady';
}
