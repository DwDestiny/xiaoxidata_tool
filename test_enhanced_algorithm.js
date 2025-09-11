// 测试v2.0双路径匹配算法效果
// 模拟巴斯大学认可名单的测试案例

// 模拟院校数据库
const mockDatabase = [
    { '中国院校ID': 530, '院校名称': '安徽理工大学' },
    { '中国院校ID': 531, '院校名称': '安徽理工大学' },
    { '中国院校ID': 551, '院校名称': '安徽科技学院' },
    { '中国院校ID': 572, '院校名称': '安徽艺术学院' },
    { '中国院校ID': 545, '院校名称': '安徽财经大学' },
    { '中国院校ID': 546, '院校名称': '宿州学院' },
    { '中国院校ID': 547, '院校名称': '巢湖学院' },
    { '中国院校ID': 555, '院校名称': '池州学院' },
    { '中国院校ID': 541, '院校名称': '淮北师范大学' },
    { '中国院校ID': 548, '院校名称': '淮南师范学院' },
    { '中国院校ID': 544, '院校名称': '滁州学院' }
];

// 模拟巴斯大学认可名单数据（问题案例）
const testCases = [
    "安徽理工大学Anhui University of Science",
    "安徽科技学院Anhui Science and Technology University", 
    "安徽艺术学院Anhui University of Arts",
    "安徽财经大学Anhui University of Finance & Economics",
    "宿州学院Suzhou University",
    "巢湖学院Chaohu University", 
    "池州学院Chizhou University",
    "淮北师范大学Huaibei Normal University",
    "淮南师范学院Huainan Normal University",
    "滁州学院Chuzhou University"
];

console.log("=== v2.0双路径匹配算法测试 ===\n");

// 模拟UniversityMatcher类的简化版本（仅用于测试展示）
class TestUniversityMatcher {
    constructor() {
        this.abbreviationMap = {
            "安徽理工": "安徽理工大学",
            "安徽科技": "安徽科技学院"
        };
    }

    // 语言分离测试
    separateLanguages(text) {
        if (!text) return { chinese: '', english: '' };
        
        const cleanText = text.toString().trim();
        
        // 提取中文部分
        const chineseMatches = cleanText.match(/[\u4e00-\u9fff]+/g);
        const chinese = chineseMatches ? chineseMatches.join('').trim() : '';
        
        // 提取英文部分
        const englishMatches = cleanText.match(/[a-zA-Z\s&]+/g);
        const english = englishMatches ? englishMatches.join(' ').replace(/\s+/g, ' ').trim() : '';
        
        return { chinese, english };
    }

    // 简化匹配（仅用于演示）
    simpleMatch(queryName, database) {
        for (const record of database) {
            if (record['院校名称'] === queryName) {
                return { match: record, confidence: 1.0, level: 1, reason: "精确匹配" };
            }
        }
        
        // 简化的模糊匹配
        for (const record of database) {
            if (record['院校名称'].includes(queryName) || queryName.includes(record['院校名称'])) {
                return { match: record, confidence: 0.8, level: 4, reason: "模糊匹配" };
            }
        }
        
        return { match: null, confidence: 0, level: 0, reason: "未找到匹配" };
    }

    // v2.0增强匹配
    enhancedMatch(queryName, database) {
        const { chinese, english } = this.separateLanguages(queryName);
        
        console.log(`输入: ${queryName}`);
        console.log(`分离结果: 中文="${chinese}" | 英文="${english}"`);
        
        let chineseResult = null;
        let englishResult = null;
        
        // 中文路径匹配
        if (chinese && chinese.length >= 2) {
            chineseResult = this.simpleMatch(chinese, database);
            console.log(`中文路径: ${chineseResult.confidence > 0 ? '匹配到' + chineseResult.match['院校名称'] : '无匹配'} (置信度: ${(chineseResult.confidence * 100).toFixed(0)}%)`);
        }
        
        // 英文路径匹配（简化处理）
        if (english && english.length >= 3) {
            englishResult = { match: null, confidence: 0.7, level: 4, reason: "英文模糊匹配" };
            console.log(`英文路径: 模糊匹配 (置信度: 70%)`);
        }
        
        // 决策选择
        let selectedResult;
        if (chineseResult && chineseResult.confidence >= 0.98) {
            selectedResult = { ...chineseResult, matchPath: 'chinese' };
            console.log(`决策: 选择中文路径 (完全匹配优先)`);
        } else if (chineseResult && chineseResult.confidence > 0) {
            selectedResult = { ...chineseResult, matchPath: 'chinese' };
            console.log(`决策: 选择中文路径 (仅有结果)`);
        } else {
            selectedResult = englishResult ? { ...englishResult, matchPath: 'english' } : { match: null, confidence: 0, level: 0 };
            console.log(`决策: ${englishResult ? '选择英文路径' : '无匹配结果'}`);
        }
        
        // 三级质量控制
        let status, statusColor, action;
        if (selectedResult.confidence >= 0.9) {
            status = "匹配成功";
            statusColor = "#26de81";
            action = "自动通过";
        } else if (selectedResult.confidence >= 0.7) {
            status = "需人工审核";
            statusColor = "#ffa502";
            action = "建议人工确认";
        } else {
            status = "匹配失败";
            statusColor = "#ff4757";
            action = "需重新录入";
        }
        
        console.log(`质量控制: ${status} | ${action}`);
        console.log(`最终结果: ${selectedResult.match ? selectedResult.match['院校名称'] + ' (ID: ' + selectedResult.match['中国院校ID'] + ')' : '无匹配'}`);
        console.log("---");
        
        return {
            ...selectedResult,
            status,
            statusColor,
            action,
            originalQuery: queryName
        };
    }
}

// 执行测试
const matcher = new TestUniversityMatcher();
const results = [];

testCases.forEach((testCase, index) => {
    console.log(`\n=== 测试案例 ${index + 1} ===`);
    const result = matcher.enhancedMatch(testCase, mockDatabase);
    results.push(result);
});

// 统计结果
console.log("\n=== 优化效果统计 ===");
const stats = {
    success: results.filter(r => r.status === "匹配成功").length,
    review: results.filter(r => r.status === "需人工审核").length,
    failed: results.filter(r => r.status === "匹配失败").length,
    chinese: results.filter(r => r.matchPath === 'chinese').length,
    english: results.filter(r => r.matchPath === 'english').length
};

console.log(`总数: ${results.length}`);
console.log(`自动通过: ${stats.success} (${(stats.success / results.length * 100).toFixed(1)}%)`);
console.log(`需人工审核: ${stats.review} (${(stats.review / results.length * 100).toFixed(1)}%)`);
console.log(`匹配失败: ${stats.failed} (${(stats.failed / results.length * 100).toFixed(1)}%)`);
console.log(`中文路径成功: ${stats.chinese} (${(stats.chinese / results.length * 100).toFixed(1)}%)`);
console.log(`英文路径成功: ${stats.english} (${(stats.english / results.length * 100).toFixed(1)}%)`);

console.log("\n=== 对比分析 ===");
console.log("✅ 优化前: 多数案例置信度73%-88%，Level 4匹配");
console.log("✅ 优化后: 通过语言分离，中文部分实现精确匹配");
console.log("✅ 质量控制: 自动化处理 + 智能审核建议");
console.log("✅ 用户体验: 透明的决策过程 + 详细的处理建议");

console.log("\n测试完成！请在浏览器中查看实际效果。");