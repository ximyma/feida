#!/usr/bin/env python3
"""
Odoo Model Parser v2 — 解析 .py → JSON (修复版)
用法: python odoo-parser.py <file_or_dir>
"""
import re, sys, json, os, glob

FIELD_TYPE_MAP = {
    'Char': 'char', 'Text': 'text', 'Html': 'text',
    'Integer': 'integer', 'Float': 'float', 'Monetary': 'float',
    'Boolean': 'boolean', 'Date': 'date', 'Datetime': 'datetime',
    'Selection': 'selection', 'Many2one': 'many2one', 'Many2many': 'many2many',
    'One2many': 'one2many', 'Binary': 'text', 'Image': 'text',
}

def extract_class_blocks(content):
    """按 class Xxx(Model): 分割文件内容"""
    blocks = []
    pos = 0
    while True:
        m = re.search(r'(?:^class\s+(\w+)\([^)]*\):\s*$)', content[pos:], re.MULTILINE)
        if not m:
            break
        start = pos + m.start()
        end_line = pos + m.end()
        # 找到下一个class定义或文件结尾
        next_m = re.search(r'(?:^class\s+\w+\([^)]*\):\s*$)', content[end_line:], re.MULTILINE)
        end_body = end_line + next_m.start() if next_m else len(content)
        # 提取类体（跳过第一行class定义）
        body = content[end_line:end_body]
        # 去缩进
        blocks.append((m.group(1), body))
        pos = end_body
    return blocks

def parse_fields(body):
    """解析字段定义"""
    fields = {}
    # 匹配: name = fields.Char('Label', required=True, ...)
    # 也处理多行
    body_flat = body.replace('\n', ' ')
    pattern = re.compile(r'(\w+)\s*[:=]\s*fields\.(\w+)\(([^)]*)\)')
    for fm in pattern.finditer(body_flat):
        fname = fm.group(1)
        ftype = fm.group(2)
        fargs = fm.group(3)
        
        if fname.startswith('_') or ftype not in FIELD_TYPE_MAP:
            continue
        
        fd = {"type": FIELD_TYPE_MAP[ftype]}
        
        # Label (第一个字符串参数)
        label_m = re.search(r'[\x27\"]([^\x27\"]*)[\x27\"]', fargs)
        if label_m and label_m.group(1):
            fd["label"] = label_m.group(1)
        
        if re.search(r'required\s*=\s*True', fargs):
            fd["required"] = True
        if re.search(r'index\s*=\s*True', fargs):
            fd["index"] = True
        
        # Default
        d_m = re.search(r'default\s*=\s*([^,)]+)', fargs)
        if d_m:
            val = d_m.group(1).strip()
            if val == 'True': fd["default"] = True
            elif val == 'False': fd["default"] = False
            elif val.isdigit(): fd["default"] = int(val)
            elif val[0] in '\'"': fd["default"] = val[1:-1]
        
        # Selection
        sel_m = re.search(r'selection\s*=\s*\[([^\]]*)\]', fargs)
        if sel_m:
            opts = re.findall(r"\([\x27\"]([^\x27\"]+)[\x27\"]\s*,\s*[\x27\"]([^\x27\"]+)[\x27\"]\)", sel_m.group(1))
            if opts:
                fd["selection"] = [{"label": v, "value": k} for k, v in opts]
        
        # Many2one relation
        if ftype == 'Many2one':
            rel_m = re.search(r'[\x27\"]([\w.]+)[\x27\"]', fargs)
            if rel_m:
                fd["relation"] = rel_m.group(1).replace('.', '_')
        
        fields[fname] = fd
    
    return fields

def parse_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    models = []
    blocks = extract_class_blocks(content)
    
    for class_name, body in blocks:
        # 只解析有 _name 的类
        name_m = re.search(r'_name\s*=\s*[\x27\"]([^\x27\"]+)[\x27\"]', body)
        if not name_m:
            continue
        
        odoo_name = name_m.group(1)
        model = {
            "_name": odoo_name.replace('.', '_'),
            "_odoo_name": odoo_name,
            "_description": "",
            "_inherit": [],
            "_fields": {},
        }
        
        desc_m = re.search(r'_description\s*=\s*[\x27\"]([^\x27\"]+)[\x27\"]', body)
        if desc_m:
            model["_description"] = desc_m.group(1)
        
        # _inherit
        inh_single = re.search(r'_inherit\s*=\s*[\x27\"]([^\x27\"]+)[\x27\"]', body)
        if inh_single:
            model["_inherit"] = [inh_single.group(1).replace('.', '_')]
        
        model["_fields"] = parse_fields(body)
        
        if model["_fields"]:
            models.append(model)
    
    return models

def main():
    if len(sys.argv) < 2:
        print("Usage: python odoo-parser.py <file_or_dir>", file=sys.stderr)
        sys.exit(1)
    
    target = sys.argv[1]
    all_models = []
    
    if os.path.isfile(target):
        all_models = parse_file(target)
    else:
        for f in sorted(glob.glob(os.path.join(target, '*.py'))):
            fn = os.path.basename(f)
            if fn.startswith('__'): continue
            all_models.extend(parse_file(f))
    
    print(json.dumps(all_models, indent=2, ensure_ascii=False))

if __name__ == '__main__':
    main()
