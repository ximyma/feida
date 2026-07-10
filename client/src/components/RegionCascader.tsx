import React, { useEffect, useState } from 'react';
import { Cascader } from 'antd';

interface RegionCascaderProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
}

// 省市区三级联动选择器：懒加载，数据来自 /api/shop-region
export default function RegionCascader({ value, onChange, placeholder = '请选择省 / 市 / 区' }: RegionCascaderProps) {
  const [options, setOptions] = useState<any[]>([]);

  const loadChildren = async (parentId: string): Promise<any[]> => {
    try {
      const res = await fetch(`/api/shop-region?parent_id=${encodeURIComponent(parentId)}`);
      const data = await res.json();
      return (Array.isArray(data) ? data : []).map((r: any) => ({
        value: r.name,
        label: r.name,
        id: r.id,
        isLeaf: r.level >= 3,
      }));
    } catch (e) {
      return [];
    }
  };

  useEffect(() => {
    loadChildren('0').then(setOptions);
  }, []);

  const loadData = async (selectedOptions: any[]) => {
    const target = selectedOptions[selectedOptions.length - 1];
    if (!target) return;
    target.loading = true;
    const children = await loadChildren(target.id);
    target.children = children;
    target.loading = false;
    setOptions([...options]);
  };

  return (
    <Cascader
      options={options}
      value={value}
      onChange={(v: any) => onChange?.(v || [])}
      loadData={loadData}
      placeholder={placeholder}
      expandTrigger="hover"
      style={{ width: '100%' }}
    />
  );
}
