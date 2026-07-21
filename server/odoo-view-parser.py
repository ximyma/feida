"""
odoo-view-parser.py — Odoo XML 视图解析器
解析菜单、动作、表单视图、列表视图，提取结构化信息
用法: python odoo-view-parser.py <模块目录路径>
"""
import os, sys, json, re
import xml.etree.ElementTree as ET

def parse_xml_file(filepath):
    """解析单个 XML 文件，返回 { menus, actions, forms, trees, searches } """
    result = { 'menus': [], 'actions': [], 'forms': [], 'trees': [], 'searchs': [], 'kanbans': [] }
    try:
        tree = ET.parse(filepath)
        root = tree.getroot()
    except Exception:
        return result

    # 解析 menuitem
    for el in root.iter('menuitem'):
        menu = {
            'id': el.get('id', ''),
            'name': el.get('name', ''),
            'action': el.get('action', ''),
            'parent': el.get('parent', ''),
            'groups': el.get('groups', ''),
            'sequence': el.get('sequence', ''),
        }
        result['menus'].append(menu)

    # 解析 ir.actions.act_window
    for record in root.findall(".//record[@model='ir.actions.act_window']"):
        action = { 'id': record.get('id', '') }
        for field in record.findall('field'):
            name = field.get('name', '')
            if name in ('name','res_model','view_mode','context','domain'):
                val = field.text or ''
                action[name] = val
            elif name == 'view_id':
                ref = field.get('ref', '')
                if ref: action['view_id'] = ref
        if action.get('id') and action.get('res_model'):
            result['actions'].append(action)

    # 解析 ir.ui.view (form/tree/search)
    for record in root.findall(".//record[@model='ir.ui.view']"):
        view = { 'id': record.get('id', '') }
        model_ref = None
        for field in record.findall('field'):
            name = field.get('name', '')
            if name == 'model':
                view['model'] = field.text or ''
            elif name == 'name':
                view['name'] = field.text or ''
            elif name == 'inherit_id':
                view['inherit'] = field.get('ref', '')
            elif name == 'arch':
                arch_type = field.get('type', 'xml')
                # arch 内容可能是子元素 (<form>/<tree>/<search>) 而非文本
                arch_text = ''
                if field.text:
                    arch_text += field.text
                for child in field:
                    child_str = ET.tostring(child, encoding='unicode')
                    arch_text += child_str
                    if child.tail:
                        arch_text += child.tail
                if arch_text.strip():
                    parsed = parse_form_arch(arch_text)
                    view.update(parsed)
        if view.get('id'):
            vtype = view.get('view_type', '')
            if not vtype:
                # 推断类型
                vname = view.get('name', view.get('id', '')).lower()
                if 'tree' in vname or 'list' in vname:
                    vtype = 'tree'
                elif 'form' in vname:
                    vtype = 'form'
                elif 'search' in vname:
                    vtype = 'search'
                elif 'kanban' in vname:
                    vtype = 'kanban'
            view['view_type'] = vtype
            result[f"{vtype}s"].append(view) if vtype else None
    return result


def parse_form_arch(arch_text):
    """解析 <form>/<tree>/<search> 的 arch 字段内容"""
    result = { 'groups': [], 'pages': [], 'fields': [], 'tree_fields': [], 'one2many_inlines': [] }
    try:
        # 处理可能的 XML 声明
        clean = arch_text.strip()
        if clean.startswith('<?xml'):
            idx = clean.index('?>') + 2
            clean = clean[idx:].strip()
        root = ET.fromstring(clean)
    except Exception:
        return result

    # 提取顶层字段
    for el in root.iter('field'):
        name = el.get('name', '')
        if not name: continue
        fdef = {
            'name': name,
            'string': el.get('string', ''),
            'readonly': el.get('readonly', ''),
            'required': el.get('required', ''),
            'invisible': el.get('invisible', ''),
            'widget': el.get('widget', ''),
            'options': el.get('options', ''),
            'domain': el.get('domain', ''),
            'nolabel': el.get('nolabel', ''),
        }
        result['fields'].append(fdef)

    # 提取 group 分组
    for group in root.iter('group'):
        gname = group.get('string', '') or group.get('name', '')
        gfields = []
        for f in group.iter('field'):
            fn = f.get('name', '')
            if fn: gfields.append(fn)
        if gfields:
            result['groups'].append({ 'name': gname, 'fields': gfields })

    # 提取 page (notebook页签)
    for page in root.iter('page'):
        pname = page.get('string', '') or page.get('name', '')
        pfields = []
        for f in page.iter('field'):
            fn = f.get('name', '')
            if fn: pfields.append(fn)
        if pfields:
            result['pages'].append({ 'name': pname, 'fields': pfields })

    # 提取 tree 列
    for tree in root.iter('tree'):
        for f in tree.iter('field'):
            fn = f.get('name', '')
            if fn: result['tree_fields'].append(fn)
    # 如果 root 本身是 tree (arch直接是<tree>)
    if root.tag == 'tree':
        for f in root.iter('field'):
            fn = f.get('name', '')
            if fn and fn not in result['tree_fields']:
                result['tree_fields'].append(fn)

    # 提取 one2many 内嵌子表
    for f in root.iter('field'):
        widget = f.get('widget', '')
        if widget == 'one2many' or 'one2many' in (widget or ''):
            inline = { 'name': f.get('name', ''), 'columns': [] }
            for tree in f.iter('tree'):
                for col in tree.iter('field'):
                    cn = col.get('name', '')
                    if cn: inline['columns'].append(cn)
            result['one2many_inlines'].append(inline)
        # 也检查通过 mode 属性
        mode = f.get('mode', '')
        if mode and 'tree' in mode.split(','):
            result['tree_fields'].append(f.get('name', ''))

    return result


def parse_module(dirpath):
    """解析整个 Odoo 模块"""
    module_name = os.path.basename(dirpath.rstrip('/\\'))
    views_dir = os.path.join(dirpath, 'views')
    data_dir = os.path.join(dirpath, 'data')

    all_menus = []
    all_actions = []
    all_forms = []
    all_trees = []
    all_searchs = []

    # 解析 views/*.xml
    if os.path.isdir(views_dir):
        for fname in sorted(os.listdir(views_dir)):
            if fname.endswith('.xml'):
                fpath = os.path.join(views_dir, fname)
                parsed = parse_xml_file(fpath)
                all_menus.extend(parsed['menus'])
                all_actions.extend(parsed['actions'])
                all_forms.extend(parsed['forms'])
                all_trees.extend(parsed['trees'])
                all_searchs.extend(parsed['searchs'])

    # 解析 data/*.xml (有时也包含菜单/动作)
    if os.path.isdir(data_dir):
        for fname in sorted(os.listdir(data_dir)):
            if fname.endswith('.xml'):
                fpath = os.path.join(data_dir, fname)
                parsed = parse_xml_file(fpath)
                all_menus.extend(parsed['menus'])
                all_actions.extend(parsed['actions'])

    # 去重
    seen = set()
    unique_actions = []
    for a in all_actions:
        if a['id'] not in seen:
            seen.add(a['id'])
            unique_actions.append(a)

    # 确定用户操作模型 (通过 action 引用)
    user_models = set()
    for a in unique_actions:
        if a.get('res_model'):
            user_models.add(a['res_model'])

    # 构建菜单树
    # 找出顶级菜单 (没有 parent 且 menus 没有其他 menu 的 parent 指向它)
    all_ids = { m.get('id') for m in all_menus }
    # 找出被引用为 parent 的 id
    parent_ids = set()
    for m in all_menus:
        p = m.get('parent', '')
        if p: parent_ids.add(p)
    # 顶级菜单: id 不在任何 parent 引用中(=最顶层)
    top = [m for m in all_menus if m['id'] not in parent_ids and m.get('action')]

    # 构建层次: 按 parent 组装
    def build_tree(parent_id=''):
        children = []
        for m in all_menus:
            if m.get('parent', '') == parent_id:
                children.append({
                    'name': m['name'],
                    'action': m['action'],
                    'model': '',
                    'children': build_tree(m['id']),
                    'sequence': m.get('sequence', ''),
                })
        return sorted(children, key=lambda x: x['sequence'])

    # 为 action 补充 model
    action_map = { a['id']: a for a in unique_actions }
    def fill_models(node):
        if node['action'] and node['action'] in action_map:
            node['model'] = action_map[node['action']].get('res_model', '')
        for child in node.get('children', []):
            fill_models(child)

    menu_tree = build_tree()
    for node in menu_tree:
        fill_models(node)

    # 查找每个模型的表单/列表视图
    model_views = {}
    for a in unique_actions:
        model = a.get('res_model', '')
        if model not in model_views:
            model_views[model] = { 'form_groups': [], 'form_pages': [], 'tree_fields': [], 'search_fields': [], 'form_fields': [] }
        view_id = a.get('view_id', '')
        # 匹配表单
        for fv in all_forms:
            if fv.get('model') == model:
                model_views[model]['form_groups'] = fv.get('groups', [])
                model_views[model]['form_pages'] = fv.get('pages', [])
                model_views[model]['form_fields'] = [f['name'] for f in fv.get('fields', [])]
        for tv in all_trees:
            if tv.get('model') == model and tv.get('tree_fields'):
                model_views[model]['tree_fields'] = tv['tree_fields']

    # 从所有表单视图中获取内嵌子表
    for fv in all_forms:
        model = fv.get('model', '')
        if model:
            for inline in fv.get('one2many_inlines', []):
                if model not in model_views:
                    model_views[model] = {}
                model_views[model].setdefault('one2many_inlines', []).append(inline)

    return {
        'module': module_name,
        'user_models': sorted(user_models),
        'menu_tree': menu_tree,
        'actions': unique_actions,
        'model_views': model_views,
        'total_views': len(all_forms) + len(all_trees) + len(all_searchs),
    }


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("用法: python odoo-view-parser.py <Odoo模块目录>")
        sys.exit(1)
    dirpath = sys.argv[1]
    if not os.path.isdir(dirpath):
        print(f"错误: {dirpath} 不是目录")
        sys.exit(1)
    result = parse_module(dirpath)
    print(json.dumps(result, ensure_ascii=False, indent=2))
