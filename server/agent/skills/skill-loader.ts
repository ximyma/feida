/**
 * SkillLoader — 从目录加载 SKILL.md 文件
 * 参照 CowAgent agent/skills/loader.py
 */
import fs from 'fs';
import path from 'path';
import { SkillEntry } from './types';

/** 解析 YAML frontmatter (简单实现，不依赖 yaml 库) */
function parseFrontmatter(content: string): { data: Record<string, any>; body: string } {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { data: {}, body: content };

  const yamlBlock = match[1];
  const body = match[2];
  const data: Record<string, any> = {};

  for (const line of yamlBlock.split('\n')) {
    const kv = line.match(/^(\w[\w_-]*)\s*:\s*(.*)$/);
    if (kv) {
      const key = kv[1];
      let val: any = kv[2].trim();
      if (val === 'true') val = true;
      else if (val === 'false') val = false;
      else if (/^\d+$/.test(val)) val = parseInt(val);
      else if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
      data[key] = val;
    }
  }

  return { data, body };
}

/** 从目录加载技能 */
export function loadSkillsFromDir(dirPath: string, source: 'builtin' | 'custom'): SkillEntry[] {
  const skills: SkillEntry[] = [];
  if (!fs.existsSync(dirPath)) return skills;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      // 子目录中的 SKILL.md
      const skillMd = path.join(dirPath, entry.name, 'SKILL.md');
      if (fs.existsSync(skillMd)) {
        const skill = loadSkillFile(skillMd, source);
        if (skill) skills.push(skill);
      } else {
        // 递归搜索子目录
        skills.push(...loadSkillsFromDir(path.join(dirPath, entry.name), source));
      }
    } else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'README.md') {
      const skill = loadSkillFile(path.join(dirPath, entry.name), source);
      if (skill) skills.push(skill);
    }
  }

  return skills;
}

/** 加载单个 SKILL.md */
function loadSkillFile(filePath: string, source: 'builtin' | 'custom'): SkillEntry | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data, body } = parseFrontmatter(content);

    if (!data.name) return null; // 必须有 name

    return {
      name: data.name,
      description: data.description || '',
      content: body.trim(),
      source,
      enabled: data.default_enabled !== false,
      always: data.always === true,
      path: filePath,
    };
  } catch {
    return null;
  }
}
