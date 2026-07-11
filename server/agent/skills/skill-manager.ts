/**
 * SkillManager — 技能管理器
 * 参照 CowAgent agent/skills/manager.py
 *
 * 管理内置和自定义技能，构建技能提示词
 */
import fs from 'fs';
import path from 'path';
import { SkillEntry } from './types';
import { loadSkillsFromDir } from './skill-loader';

const ROOT_DIR = path.resolve(__dirname, '..', '..', '..');
const BUILTIN_SKILLS_DIR = path.join(ROOT_DIR, 'skills');
const CUSTOM_SKILLS_DIR = path.join(ROOT_DIR, 'agent', 'skills');

export class SkillManager {
  private static _instance: SkillManager;
  private skills: Map<string, SkillEntry> = new Map();

  static getInstance(): SkillManager {
    if (!SkillManager._instance) {
      SkillManager._instance = new SkillManager();
    }
    return SkillManager._instance;
  }

  /** 重新加载所有技能 */
  refresh(): void {
    this.skills.clear();

    // 加载内置技能
    const builtin = loadSkillsFromDir(BUILTIN_SKILLS_DIR, 'builtin');
    for (const s of builtin) this.skills.set(s.name, s);

    // 加载自定义技能（可覆盖同名内置）
    const custom = loadSkillsFromDir(CUSTOM_SKILLS_DIR, 'custom');
    for (const s of custom) this.skills.set(s.name, s);

    // 加载技能配置（启用/禁用状态）
    this.loadConfig();
  }

  /** 加载持久化配置 */
  private loadConfig(): void {
    const configPath = path.join(CUSTOM_SKILLS_DIR, 'skills_config.json');
    if (!fs.existsSync(configPath)) return;
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      for (const [name, enabled] of Object.entries(config)) {
        const skill = this.skills.get(name);
        if (skill) skill.enabled = enabled as boolean;
      }
    } catch { /* ignore */ }
  }

  /** 保存配置 */
  private saveConfig(): void {
    fs.mkdirSync(CUSTOM_SKILLS_DIR, { recursive: true });
    const config: Record<string, boolean> = {};
    this.skills.forEach((s, name) => { config[name] = s.enabled; });
    fs.writeFileSync(path.join(CUSTOM_SKILLS_DIR, 'skills_config.json'), JSON.stringify(config, null, 2), 'utf-8');
  }

  /** 设置技能启用/禁用 */
  setEnabled(name: string, enabled: boolean): void {
    const skill = this.skills.get(name);
    if (skill) { skill.enabled = enabled; this.saveConfig(); }
  }

  /** 列出所有技能 */
  list(): SkillEntry[] {
    return Array.from(this.skills.values());
  }

  /** 获取已启用技能 */
  getEnabled(): SkillEntry[] {
    return this.list().filter(s => s.enabled);
  }

  /** 构建技能提示词 (注入 Agent system prompt) */
  buildSkillsPrompt(): string {
    const enabled = this.getEnabled();
    if (enabled.length === 0) return '';

    let prompt = '\n\n## 已加载技能\n';
    for (const skill of enabled) {
      prompt += `### ${skill.name}: ${skill.description}\n${skill.content.slice(0, 500)}\n\n`;
    }
    return prompt;
  }

  /** 按名称获取技能 */
  get(name: string): SkillEntry | undefined {
    return this.skills.get(name);
  }
}

export const skillManager = SkillManager.getInstance();
