"""
odoo-parser.py — Odoo Python 模型定义解析器
将 Odoo 的 .py 模型文件解析为 JSON 中间格式
用法: python odoo-parser.py <目录路径>
"""
import re, json, sys, os

def parse_odoo_file(filepath):
    """解析单个 Odoo .py 模型文件"""
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    models = []
    
    # 匹配 class Xxx(models.Model): ... 
    # 简化匹配：找到 class 定义块
    class_pattern = r'class\s+(\w+)\s*\(\s*models?\s*\.\s*Model\s*\)\s*:\s*(.*?)(?=\nclass\s+\w+\s*\(|$)'
    
    for match in re.finditer(class_pattern, content, re.DOTALL):
        class_name = match.group(1)
        class_body = match.group(2)
        
        # 提取 _name
        name_match = re.search(r"""_name\s*=\s*['"]([^'"]+)['"]""", class_body)
        model_name = name_match.group(1) if name_match else class_name.lower()
        
        # 提取 _description
        desc_match = re.search(r"""_description\s*=\s*['"]([^'"]+)['"]""", class_body)
        description = desc_match.group(1) if desc_match else model_name
        
        # 提取 _inherit
        inherit_match = re.search(r"""_inherit\s*=\s*['"]([^'"]+)['"]""", class_body)
        
        # 提取字段: name = fields.Char('Label', ...)
        fields = {}
        field_pattern = r'(\w+)\s*=\s*fields\.(\w+)\(\s*'
        
        for line in class_body.split('\n'):
            fm = re.match(field_pattern, line.strip())
            if fm:
                field_name = fm.group(1)
                field_type = fm.group(2).lower()
                
                # 跳过系统字段
                if field_name.startswith('_'):
                    continue
                
                # 提取 label (第一个字符串参数)
                label_match = re.search(r"""['"]([^'"]+)['"]""", line[fm.end():])
                label = label_match.group(1) if label_match else field_name
                
                # 提取 required
                required = 'required=True' in line
                
                # 提取 relation (many2one/one2many/many2many)
                relation_match = re.search(r"""relation\s*=\s*['"]([^'"]+)['"]""", line)
                relation = relation_match.group(1) if relation_match else None
                
                # 提取 default
                default_match = re.search(r"""default\s*=\s*(['"].*?['"]|\w+)""", line)
                default = None
                if default_match:
                    dv = default_match.group(1)
                    if dv.startswith("'") or dv.startswith('"'):
                        default = dv[1:-1]
                    elif dv in ('True', 'False', 'None'):
                        default = {'True': True, 'False': False, 'None': None}[dv]
                
                # 类型映射
                type_map = {
                    'char': 'char', 'text': 'text', 'integer': 'integer',
                    'float': 'float', 'boolean': 'boolean', 'date': 'date',
                    'datetime': 'datetime', 'selection': 'selection',
                    'many2one': 'many2one', 'one2many': 'one2many',
                    'many2many': 'many2many', 'monetary': 'monetary',
                    'binary': 'text', 'html': 'html', 'image': 'text',
                }
                mapped_type = type_map.get(field_type, 'char')
                
                fd = {'type': mapped_type, 'label': label}
                if required: fd['required'] = True
                if relation: fd['relation'] = relation
                if default is not None: fd['default'] = default
                
                fields[field_name] = fd
        
        model_def = {
            '_name': model_name,
            '_description': description,
            '_auto': True,
            '_fields': fields,
        }
        if inherit_match:
            model_def['_inherit'] = inherit_match.group(1)
        
        # 如果有字段才加入
        if fields:
            models.append(model_def)
    
    return models


def parse_directory(dirpath):
    """解析整个目录的 Odoo 模型"""
    all_models = []
    module_name = os.path.basename(dirpath.rstrip('/\\'))
    
    if os.path.isdir(os.path.join(dirpath, 'models')):
        # Odoo 标准结构: models/*.py
        search_dir = os.path.join(dirpath, 'models')
    else:
        search_dir = dirpath
    
    for root, dirs, files in os.walk(search_dir):
        for fname in files:
            if fname.endswith('.py') and not fname.startswith('_'):
                fpath = os.path.join(root, fname)
                try:
                    models = parse_odoo_file(fpath)
                    all_models.extend(models)
                except Exception as e:
                    print(f"  ⚠️  解析失败: {fname}: {e}", file=sys.stderr)
    
    # 去重 (按 _name)
    seen = set()
    unique = []
    for m in all_models:
        if m['_name'] not in seen:
            seen.add(m['_name'])
            unique.append(m)
    
    return {'module': module_name, 'models': unique}


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("用法: python odoo-parser.py <Odoo模块目录>")
        sys.exit(1)
    
    dirpath = sys.argv[1]
    if not os.path.isdir(dirpath):
        print(f"错误: 目录不存在: {dirpath}")
        sys.exit(1)
    
    result = parse_directory(dirpath)
    print(json.dumps(result, ensure_ascii=False, indent=2))
