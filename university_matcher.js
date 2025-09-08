/**
 * 中国院校智能匹配算法 - JavaScript实现
 * 实现5级渐进式匹配策略
 */

class UniversityMatcher {
    constructor() {
        // 常见院校简称映射
        this.abbreviationMap = {
            "北大": "北京大学",
            "清华": "清华大学",
            "复旦": "复旦大学",
            "上交": "上海交通大学",
            "西交": "西安交通大学", 
            "中科大": "中国科学技术大学",
            "哈工大": "哈尔滨工业大学",
            "北航": "北京航空航天大学",
            "北理工": "北京理工大学",
            "华科": "华中科技大学",
            "中大": "中山大学",
            "华南理工": "华南理工大学",
            "川大": "四川大学",
            "重大": "重庆大学",
            "西工大": "西北工业大学",
            "北师大": "北京师范大学",
            "华师大": "华东师范大学",
            "南师大": "南京师范大学",
            "华师": "华中师范大学",
            "陕师大": "陕西师范大学",
            "东师": "东北师范大学",
            "西南大学": "西南师范大学",
            "湖师大": "湖南师范大学",
            "华农": "华中农业大学",
            "南农": "南京农业大学",
            "西农": "西北农林科技大学",
            "中农": "中国农业大学",
        };

        // 常见英文缩写映射
        this.englishAbbreviations = {
            "univ": "university",
            "coll": "college",
            "inst": "institute",
            "tech": "technology",
            "sci": "science",
            "eng": "engineering",
            "med": "medical",
            "agri": "agriculture",
            "norm": "normal",
        };

        // 院校类型关键词
        this.universityTypes = [
            "大学", "学院", "学校", "university", "college", "institute", "school"
        ];

        // 地区关键词
        this.regionKeywords = [
            "北京", "上海", "天津", "重庆", "广东", "江苏", "浙江", "山东", 
            "河南", "湖北", "湖南", "河北", "安徽", "福建", "江西", "四川",
            "陕西", "山西", "辽宁", "吉林", "黑龙江", "广西", "云南", "贵州",
            "青海", "甘肃", "新疆", "西藏", "宁夏", "内蒙古", "海南", "台湾",
            "香港", "澳门"
        ];
    }

    /**
     * 主匹配函数
     * @param {string} queryName - 待匹配的院校名称
     * @param {Array} database - 院校数据库
     * @returns {Object} 匹配结果
     */
    match(queryName, database) {
        if (!queryName || !database || database.length === 0) {
            return { match: null, confidence: 0, level: 0, reason: "输入为空或数据库为空" };
        }

        // Level 1: 精确匹配
        let result = this.exactMatch(queryName, database);
        if (result.match) {
            return { ...result, level: 1, reason: "精确匹配" };
        }

        // Level 2: 标准化匹配
        result = this.normalizedMatch(queryName, database);
        if (result.match) {
            return { ...result, level: 2, reason: "标准化匹配" };
        }

        // Level 3: 关键词匹配
        result = this.keywordMatch(queryName, database);
        if (result.match) {
            return { ...result, level: 3, reason: "关键词匹配" };
        }

        // Level 4: 模糊匹配
        result = this.fuzzyMatch(queryName, database);
        if (result.match) {
            return { ...result, level: 4, reason: "模糊匹配" };
        }

        // Level 5: 语义匹配 (简化版)
        result = this.semanticMatch(queryName, database);
        if (result.match) {
            return { ...result, level: 5, reason: "语义匹配" };
        }

        return { match: null, confidence: 0, level: 0, reason: "未找到匹配" };
    }

    /**
     * Level 1: 精确匹配
     */
    exactMatch(queryName, database) {
        for (const record of database) {
            // 检查所有可能的名称字段
            const nameFields = this.extractNameFields(record);
            
            for (const field of nameFields) {
                if (field && field.trim() === queryName.trim()) {
                    return { match: record, confidence: 1.0 };
                }
            }
        }
        return { match: null, confidence: 0 };
    }

    /**
     * Level 2: 标准化匹配
     */
    normalizedMatch(queryName, database) {
        const normalizedQuery = this.normalizeText(queryName);
        
        for (const record of database) {
            const nameFields = this.extractNameFields(record);
            
            for (const field of nameFields) {
                if (field && this.normalizeText(field) === normalizedQuery) {
                    return { match: record, confidence: 0.95 };
                }
            }
        }
        return { match: null, confidence: 0 };
    }

    /**
     * Level 3: 关键词匹配
     */
    keywordMatch(queryName, database) {
        const queryKeywords = this.extractKeywords(queryName);
        if (queryKeywords.length === 0) {
            return { match: null, confidence: 0 };
        }

        let bestMatch = null;
        let bestScore = 0;

        for (const record of database) {
            const nameFields = this.extractNameFields(record);
            
            for (const field of nameFields) {
                if (!field) continue;
                
                const recordKeywords = this.extractKeywords(field);
                const similarity = this.calculateKeywordSimilarity(queryKeywords, recordKeywords);
                
                if (similarity > bestScore && similarity >= 0.8) {
                    bestScore = similarity;
                    bestMatch = record;
                }
            }
        }

        return bestMatch ? 
            { match: bestMatch, confidence: bestScore } : 
            { match: null, confidence: 0 };
    }

    /**
     * Level 4: 模糊匹配
     */
    fuzzyMatch(queryName, database) {
        const normalizedQuery = this.normalizeText(queryName);
        let bestMatch = null;
        let bestScore = 0;

        for (const record of database) {
            const nameFields = this.extractNameFields(record);
            
            for (const field of nameFields) {
                if (!field) continue;
                
                const normalizedField = this.normalizeText(field);
                
                // 编辑距离相似度
                const editSimilarity = this.calculateEditSimilarity(normalizedQuery, normalizedField);
                
                // 包含关系检查
                const containsSimilarity = this.calculateContainsSimilarity(normalizedQuery, normalizedField);
                
                // 取最高分
                const similarity = Math.max(editSimilarity, containsSimilarity);
                
                if (similarity > bestScore && similarity >= 0.7) {
                    bestScore = similarity;
                    bestMatch = record;
                }
            }
        }

        return bestMatch ? 
            { match: bestMatch, confidence: bestScore } : 
            { match: null, confidence: 0 };
    }

    /**
     * Level 5: 语义匹配 (简化版)
     */
    semanticMatch(queryName, database) {
        // 尝试简称映射
        const expandedName = this.expandAbbreviation(queryName);
        if (expandedName !== queryName) {
            return this.normalizedMatch(expandedName, database);
        }

        // 尝试部分匹配
        let bestMatch = null;
        let bestScore = 0;

        const queryCore = this.extractCoreWords(queryName);
        
        for (const record of database) {
            const nameFields = this.extractNameFields(record);
            
            for (const field of nameFields) {
                if (!field) continue;
                
                const recordCore = this.extractCoreWords(field);
                const similarity = this.calculateCoreSimilarity(queryCore, recordCore);
                
                if (similarity > bestScore && similarity >= 0.6) {
                    bestScore = similarity;
                    bestMatch = record;
                }
            }
        }

        return bestMatch ? 
            { match: bestMatch, confidence: bestScore } : 
            { match: null, confidence: 0 };
    }

    /**
     * 从记录中提取所有可能的名称字段
     */
    extractNameFields(record) {
        const fields = [];
        
        // 常见的名称字段
        const nameColumns = [
            'name', 'university_name', 'school_name', 'institution_name',
            '院校名称', '学校名称', '中文名称', '英文名称', 
            'chinese_name', 'english_name', '院校中文名', '院校英文名',
            '名称', '学校', '院校', 'Name', 'University', 'School'
        ];

        for (const col of nameColumns) {
            if (record[col]) {
                fields.push(record[col]);
            }
        }

        // 如果没有找到明确的名称字段，尝试第一个文本字段
        if (fields.length === 0) {
            const firstTextValue = Object.values(record).find(value => 
                typeof value === 'string' && value.trim().length > 0
            );
            if (firstTextValue) {
                fields.push(firstTextValue);
            }
        }

        return fields;
    }

    /**
     * 文本标准化处理
     */
    normalizeText(text) {
        if (!text) return '';
        
        return text.toString()
            .toLowerCase()
            // 去除标点符号
            .replace(/[.,;:!?'"()[\]{}—–-]/g, '')
            // 统一空格
            .replace(/\s+/g, ' ')
            .trim()
            // 全角转半角
            .replace(/[\uFF01-\uFF5E]/g, function(char) {
                return String.fromCharCode(char.charCodeAt(0) - 0xFEE0);
            })
            // 中文标点转换
            .replace(/[，。；：！？'"（）【】｛｝]/g, '');
    }

    /**
     * 提取关键词
     */
    extractKeywords(text) {
        if (!text) return [];
        
        const normalized = this.normalizeText(text);
        const keywords = [];

        // 提取中文地区词
        for (const region of this.regionKeywords) {
            if (normalized.includes(region)) {
                keywords.push(region);
            }
        }

        // 提取院校类型词
        for (const type of this.universityTypes) {
            if (normalized.includes(type.toLowerCase())) {
                keywords.push(type);
            }
        }

        // 提取其他重要词汇（长度>=2的词）
        const words = normalized.split(/[\s,，]+/).filter(word => 
            word.length >= 2 && 
            !this.universityTypes.includes(word) &&
            !this.regionKeywords.includes(word)
        );
        keywords.push(...words);

        return [...new Set(keywords)]; // 去重
    }

    /**
     * 计算关键词相似度
     */
    calculateKeywordSimilarity(keywords1, keywords2) {
        if (keywords1.length === 0 || keywords2.length === 0) {
            return 0;
        }

        const set1 = new Set(keywords1.map(k => k.toLowerCase()));
        const set2 = new Set(keywords2.map(k => k.toLowerCase()));
        
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        
        return intersection.size / union.size;
    }

    /**
     * 计算编辑距离相似度
     */
    calculateEditSimilarity(str1, str2) {
        if (str1 === str2) return 1.0;
        if (str1.length === 0 || str2.length === 0) return 0;

        const distance = this.levenshteinDistance(str1, str2);
        const maxLength = Math.max(str1.length, str2.length);
        
        return 1 - (distance / maxLength);
    }

    /**
     * 计算包含关系相似度
     */
    calculateContainsSimilarity(str1, str2) {
        const shorter = str1.length <= str2.length ? str1 : str2;
        const longer = str1.length > str2.length ? str1 : str2;
        
        if (longer.includes(shorter)) {
            return shorter.length / longer.length;
        }
        
        return 0;
    }

    /**
     * 编辑距离算法
     */
    levenshteinDistance(str1, str2) {
        const matrix = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // 替换
                        matrix[i][j - 1] + 1,     // 插入
                        matrix[i - 1][j] + 1      // 删除
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    }

    /**
     * 展开简称
     */
    expandAbbreviation(text) {
        if (!text) return text;
        
        // 中文简称展开
        for (const [abbr, full] of Object.entries(this.abbreviationMap)) {
            if (text.includes(abbr)) {
                return text.replace(abbr, full);
            }
        }

        return text;
    }

    /**
     * 提取核心词汇
     */
    extractCoreWords(text) {
        if (!text) return [];
        
        const normalized = this.normalizeText(text);
        const words = normalized.split(/[\s,，]+/);
        
        // 过滤掉常见的无意义词汇
        const stopWords = ['的', '和', '与', 'of', 'and', 'the', 'in', 'at', 'for'];
        
        return words.filter(word => 
            word.length >= 2 && 
            !stopWords.includes(word.toLowerCase())
        );
    }

    /**
     * 计算核心词相似度
     */
    calculateCoreSimilarity(core1, core2) {
        if (core1.length === 0 || core2.length === 0) {
            return 0;
        }

        let matches = 0;
        const maxLength = Math.max(core1.length, core2.length);

        for (const word1 of core1) {
            for (const word2 of core2) {
                if (word1 === word2 || 
                    word1.includes(word2) || 
                    word2.includes(word1)) {
                    matches++;
                    break;
                }
            }
        }

        return matches / maxLength;
    }

    /**
     * 批量匹配处理
     */
    batchMatch(queries, database, progressCallback = null) {
        const results = [];
        const total = queries.length;

        for (let i = 0; i < queries.length; i++) {
            const query = queries[i];
            const result = this.match(query.name || query, database);
            
            results.push({
                originalQuery: query,
                ...result
            });

            // 进度回调
            if (progressCallback) {
                progressCallback((i + 1) / total);
            }
        }

        return results;
    }
}

// 如果在Node.js环境中，导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UniversityMatcher;
}