/**
 * 技能系统 — SkillEntry 类型定义
 * 参照 CowAgent agent/skills/types.py
 */

export interface SkillFrontmatter {
  name: string;
  description: string;
  always?: boolean;
  default_enabled?: boolean;
  requires?: {
    binaries?: string[];
    env_vars?: string[];
  };
  install?: Array<{ kind: string; package?: string; script?: string }>;
  os?: string[];
}

export interface SkillEntry {
  name: string;
  description: string;
  content: string;
  source: 'builtin' | 'custom';
  enabled: boolean;
  always: boolean;
  path: string;
}
