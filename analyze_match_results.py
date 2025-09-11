#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
分析巴斯大学认可名单的院校匹配结果
"""

import pandas as pd
import numpy as np
from collections import Counter

def analyze_excel_file(file_path):
    """分析Excel文件内容"""
    try:
        # 读取Excel文件
        df = pd.read_excel(file_path)
        
        print("=== 文件基本信息 ===")
        print(f"总行数: {len(df)}")
        print(f"总列数: {len(df.columns)}")
        print(f"列名: {list(df.columns)}")
        print()
        
        # 显示前几行数据
        print("=== 前5行数据 ===")
        print(df.head())
        print()
        
        # 分析匹配状态分布
        if '匹配状态' in df.columns:
            print("=== 匹配状态分布 ===")
            status_counts = df['匹配状态'].value_counts()
            print(status_counts)
            print(f"匹配成功率: {(status_counts.get('匹配成功', 0) / len(df) * 100):.1f}%")
            print()
        
        # 分析置信度分布
        if '匹配置信度' in df.columns:
            print("=== 置信度分布 ===")
            confidence_stats = df['匹配置信度'].describe()
            print(confidence_stats)
            print()
        
        # 分析匹配级别分布
        if '匹配级别' in df.columns:
            print("=== 匹配级别分布 ===")
            level_counts = df['匹配级别'].value_counts().sort_index()
            print(level_counts)
            print()
        
        # 抽取未匹配的案例
        if '匹配状态' in df.columns:
            print("=== 未匹配案例样本 ===")
            unmatched = df[df['匹配状态'] != '匹配成功']
            if len(unmatched) > 0:
                print(f"未匹配数量: {len(unmatched)}")
                # 显示前10个未匹配案例
                sample_size = min(10, len(unmatched))
                for i, (idx, row) in enumerate(unmatched.head(sample_size).iterrows()):
                    print(f"\n未匹配案例 {i+1}:")
                    for col in df.columns:
                        if col in ['院校名称', '匹配状态', '匹配置信度', '匹配级别', '匹配原因', '匹配院校名称']:
                            print(f"  {col}: {row[col]}")
            print()
        
        # 分析低置信度案例
        if '匹配置信度' in df.columns:
            print("=== 低置信度案例样本 (置信度<0.8) ===")
            low_confidence = df[pd.to_numeric(df['匹配置信度'], errors='coerce') < 0.8]
            if len(low_confidence) > 0:
                print(f"低置信度数量: {len(low_confidence)}")
                sample_size = min(5, len(low_confidence))
                for i, (idx, row) in enumerate(low_confidence.head(sample_size).iterrows()):
                    print(f"\n低置信度案例 {i+1}:")
                    for col in df.columns:
                        if col in ['院校名称', '匹配状态', '匹配置信度', '匹配级别', '匹配原因', '匹配院校名称']:
                            print(f"  {col}: {row[col]}")
            print()
        
        return df
        
    except Exception as e:
        print(f"读取文件失败: {e}")
        return None

def analyze_name_patterns(df):
    """分析院校名称的模式"""
    if '院校名称' not in df.columns:
        return
    
    print("=== 院校名称模式分析 ===")
    
    # 统计名称长度分布
    name_lengths = df['院校名称'].astype(str).str.len()
    print(f"名称长度统计:")
    print(f"  平均长度: {name_lengths.mean():.1f}")
    print(f"  最短: {name_lengths.min()}")
    print(f"  最长: {name_lengths.max()}")
    print()
    
    # 分析包含英文的比例
    has_english = df['院校名称'].astype(str).str.contains('[a-zA-Z]', na=False)
    print(f"包含英文字符的比例: {has_english.sum() / len(df) * 100:.1f}%")
    
    # 分析包含中文的比例
    has_chinese = df['院校名称'].astype(str).str.contains('[\u4e00-\u9fff]', na=False)
    print(f"包含中文字符的比例: {has_chinese.sum() / len(df) * 100:.1f}%")
    
    # 分析混合语言的比例
    mixed_lang = has_english & has_chinese
    print(f"中英文混合的比例: {mixed_lang.sum() / len(df) * 100:.1f}%")
    print()

if __name__ == "__main__":
    file_path = r"E:\小希\python脚本\智能专业匹配\巴斯大学认可名单导入-院校匹配结果-2025-9-8 (1).xlsx"
    
    print("开始分析巴斯大学认可名单匹配结果...")
    print("=" * 50)
    
    df = analyze_excel_file(file_path)
    
    if df is not None:
        analyze_name_patterns(df)
        
        print("=== 分析完成 ===")
        print("详细数据已输出，请查看上述统计信息")