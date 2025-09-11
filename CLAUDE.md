# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

本项目是一个集成的智能数据匹配工具平台，包含两大核心功能：

### 🎓 专业数据匹配与校验
- 智能专业数据匹配：通过4级渐进式算法将新数据与现有数据库进行匹配
- 数据格式校验与自动修正：对学制、开学时间、申请费用等字段进行标准化处理
- Excel文件处理：支持Excel文件的读取和导出

### 🏫 中国院校智能匹配
- 5级渐进式院校匹配：处理中英文混合、格式多样的院校名称
- 智能文本处理：包含繁简体转换、简称展开、关键词提取
- 置信度评估：基于匹配级别提供智能建议

## 技术架构

### 核心技术栈
- **前端**: 纯HTML5 + CSS3 + JavaScript (ES6+)
- **Excel处理**: SheetJS (xlsx.js) 库
- **无后端**: 所有处理完全在客户端浏览器完成，确保数据安全

### 主要文件结构
- `index.html` - 集成主应用文件，包含专业匹配和院校匹配双功能
- `index_integrated.html` - 集成版本的源文件（开发版本）
- `university_matcher.html` - 独立的院校匹配工具（单独版本）
- `university_matcher.js` - 中国院校匹配算法核心库
- `README.md` - 项目说明和使用指南
- `产品文档.md` - 详细的产品需求文档(PRD)
- `university_matcher_design.md` - 院校匹配算法设计文档
- `data_explorer.py` - 数据探索脚本（Python版）
- `simple_data_explorer.py` - 简化版数据探索脚本

## 核心业务逻辑

### 专业数据匹配算法 (4级渐进式)
1. **第一级**: 专业链接精确匹配 (最高优先级)
2. **第二级**: 课程编码精确匹配
3. **第三级**: 英文名+学位等级智能匹配
4. **第四级**: 英文名+学位名称模糊匹配 (相似度>95%)

### 中国院校匹配算法 (5级渐进式)
1. **Level 1**: 精确匹配 (100%置信度) - 完全相同的中英文名称
2. **Level 2**: 标准化匹配 (95%置信度) - 去除标点、统一大小写后匹配
3. **Level 3**: 关键词匹配 (85%置信度) - 提取地区+类型关键词匹配
4. **Level 4**: 模糊匹配 (70%置信度) - 编辑距离算法
5. **Level 5**: 语义匹配 (60%置信度) - 简称展开、核心词匹配

### 双路径匹配优化算法 (v2.0)
基于巴斯大学认可名单分析，发现中英文混合名称导致匹配准确率下降问题。优化方案采用**语言分离 + 双路径匹配 + 三级质量控制**架构：

#### 核心流程
```
输入："安徽理工大学Anhui University of Science"
                    ↓
              【语言分离器】
                ↙        ↘
    中文路径：安徽理工大学     英文路径：Anhui University of Science
              ↓                        ↓
        5级匹配算法                  5级匹配算法
              ↓                        ↓
        结果A (置信度)               结果B (置信度)
                ↘        ↙
              【智能决策器】
                    ↓
            【三级质量控制】
                    ↓
              最终匹配结果
```

#### 决策策略
1. **中文完全匹配优先**: 若中文达到Level 1-2匹配且置信度≥98%，直接采用
2. **英文完全匹配补充**: 若中文未完全匹配，英文达到完全匹配，采用英文结果
3. **择优选择**: 两者均未完全匹配时，选择置信度更高的结果

#### 三级质量控制
- **≥90%置信度**: ✅ 匹配成功 (绿色) - 自动通过
- **70-90%置信度**: ⚠️ 需人工审核 (橙色) - 智能排序后人工确认
- **<70%置信度**: ❌ 匹配失败 (红色) - 直接标记，需重新录入

#### 预期改进效果
- 自动通过率提升至25%
- 平均置信度从80%提升至92%
- 人工审核工作量减少35%
- 匹配准确性提升20%

### 数据校验规则
- **学制**: 标准格式为"数字/单位"，支持年、月、周、学期、学分
- **开学时间**: 标准格式为"YYYY-MM"，支持多个时间用逗号分隔
- **申请费用**: 标准格式为"数字+币种中文全称"，内置完整的币种映射表

### 关键函数说明

#### 专业匹配相关
- `performDataMatching()`: 执行专业数据匹配的核心函数
- `performDataValidation()`: 执行数据校验与修正
- `validateAndCorrectDuration()`: 学制字段校验
- `validateAndCorrectStartTime()`: 开学时间字段校验
- `validateAndCorrectApplicationFee()`: 申请费用字段校验

#### 院校匹配相关
- `UniversityMatcher`: 中国院校匹配算法核心类
  - `match(queryName, database)`: 主匹配函数
  - `exactMatch()`: 精确匹配 (Level 1)
  - `normalizedMatch()`: 标准化匹配 (Level 2)
  - `keywordMatch()`: 关键词匹配 (Level 3)
  - `fuzzyMatch()`: 模糊匹配 (Level 4)
  - `semanticMatch()`: 语义匹配 (Level 5)

#### 双路径匹配相关 (v2.0新增)
- `separateLanguages(text)`: 智能语言分离器，分离中英文内容
- `enhancedMatch(queryName, database)`: 增强版主匹配函数，集成双路径逻辑
- `selectBestResult(chineseResult, englishResult)`: 智能决策器，选择最优匹配结果
- `applyQualityControl(result)`: 三级质量控制函数
- `isExactMatch(result)`: 判断是否为完全匹配
- `detectConflict(result1, result2)`: 检测匹配结果冲突
- `generateReviewSuggestion(item)`: 生成人工审核建议

#### 通用工具函数
- `switchTab(tab)`: 功能标签切换
- `extractUniversityName(record)`: 从记录中提取院校名称
- `normalizeText()`: 文本标准化处理

## 常用开发任务

### 本地运行
```bash
# 在现代浏览器中直接打开index.html即可
# 推荐使用Chrome、Firefox或Edge
```

### 使用方法
1. 打开 `index.html` 文件
2. 选择功能：
   - **专业匹配校验**: 用于处理专业数据的匹配和格式校验
   - **中国院校匹配**: 用于中国院校名称的智能匹配
3. 上传对应的Excel文件
4. 点击开始处理
5. 查看结果并导出

### 测试数据格式

#### 专业匹配功能
- **现有数据库Excel**: 专业ID、专业链接、课程编码、专业英文名、学位等级、学位名称等字段
- **新数据Excel**: 专业英文名、学位等级、学制、开学时间、申请费用等字段

#### 院校匹配功能  
- **院校数据库Excel**: 院校ID、院校名称（中文/英文）等字段
- **认可名单Excel**: 院校名称（可包含中文、英文或混合格式）等字段

### 调试和开发建议
- 使用浏览器开发者工具监控JavaScript执行
- 重点关注文件读取、数据匹配和校验过程的console.log输出
- Excel文件处理依赖SheetJS，注意CDN链接的可用性

### 性能考虑
- 设计支持处理各包含5000行数据的Excel文件
- 所有处理在客户端完成，性能取决于用户设备
- 大文件处理时会显示进度条和状态提示

## 代码风格和约定

### JavaScript约定
- 使用ES6+语法
- 函数名采用驼峰命名法
- 异步操作使用async/await
- 错误处理使用try-catch块

### UI交互约定
- 使用颜色编码表示不同状态：绿色(成功)、黄色(需复核)、红色(错误)
- 冻结关键列(专业ID、匹配状态、格式校验问题)便于查看
- 支持拖拽上传和点击选择文件

## 安全考虑

- 所有数据处理完全在客户端进行，不上传任何服务器
- 使用CDN加载的外部依赖仅限于SheetJS库
- 文件处理仅支持Excel格式(.xlsx, .xls)，避免安全风险

## 扩展和维护

### 添加新的校验规则
在`performDataValidation()`函数中添加新的校验逻辑，按照现有模式创建对应的校验函数。

### 修改匹配算法
在`performDataMatching()`函数中调整匹配优先级或添加新的匹配规则。

### 界面修改
CSS样式集中在HTML文件的`<style>`标签中，支持响应式设计和现代浏览器特性。