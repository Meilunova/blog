# 🔣 Symbol Reference Guide
*v1.0 | Created: 2025-08-28 | Updated: 2025-08-28*

## 📁 File Symbols
- 📂 = `/memory-bank/` - 项目文档根目录
- 📦 = `/memory-bank/backups/` - 备份存储目录

## 🧠 Memory System Symbols (𝕄)
- 𝕄[0] = 📂projectbrief.md - σ₁ 项目简介文档
- 𝕄[1] = 📂systemPatterns.md - σ₂ 系统模式文档  
- 𝕄[2] = 📂techContext.md - σ₃ 技术上下文文档
- 𝕄[3] = 📂activeContext.md - σ₄ 活动上下文文档
- 𝕄[4] = 📂progress.md - σ₅ 进度跟踪文档

## 🔄 RIPER Mode Symbols (Ω)
- Ω₁ = 🔍**RESEARCH** - 研究模式，专注于信息收集和分析
- Ω₂ = 💡**INNOVATE** - 创新模式，专注于想法生成和可能性探索
- Ω₃ = 📝**PLAN** - 规划模式，专注于计划制定和规范定义
- Ω₄ = ⚙️**EXECUTE** - 执行模式，专注于代码实现和进度推进
- Ω₅ = 🔎**REVIEW** - 审查模式，专注于验证输出和计划对比

## 🏗️ Project Phase Symbols (Π)
- Π₁ = 🌱**UNINITIATED** - 未初始化阶段，框架已安装但项目未开始
- Π₂ = 🚧**INITIALIZING** - 初始化阶段，START 流程活跃，设置进行中
- Π₃ = 🏗️**DEVELOPMENT** - 开发阶段，主要开发工作，RIPER 模式活跃
- Π₄ = 🔧**MAINTENANCE** - 维护阶段，长期支持，RIPER 模式活跃

## 🛠️ Task Operation Symbols (𝕋)
- 𝕋[0:3] = [read_files, ask_questions, observe_code] - 信息收集操作
- 𝕋[4:6] = [suggest_ideas, explore_options, evaluate_approaches] - 创意生成操作
- 𝕋[7:9] = [create_plan, detail_specifications, sequence_steps] - 规划制定操作
- 𝕋[10:12] = [implement_code, follow_plan, test_implementation] - 执行实施操作
- 𝕋[13:15] = [validate_output, verify_against_plan, report_deviations] - 验证审查操作

## 📋 START Phase Symbols (S)
- S₀ = create_directory(📂) - 创建文档目录
- S₁ = gather(requirements) → create(𝕄[0]) - 需求收集，创建项目简介
- S₂ = select(technologies) → update(𝕄[2]) - 技术选择，更新技术上下文
- S₃ = define(architecture) → create(𝕄[1]) - 架构定义，创建系统模式
- S₄ = scaffold(project) → create(directories) - 项目脚手架，创建目录结构
- S₅ = setup(environment) → update(𝕄[2]) - 环境设置，更新技术上下文
- S₆ = initialize(memory) → create(𝕄[0:4]) - 内存初始化，创建所有文档

## 📄 Document Template Symbols (σ)
- σ₁ = Project Brief Template - 项目简介模板
- σ₂ = System Patterns Template - 系统模式模板
- σ₃ = Technical Context Template - 技术上下文模板
- σ₄ = Active Context Template - 活动上下文模板
- σ₅ = Progress Tracker Template - 进度跟踪模板

## ⚠️ Safety Protocol Symbols (Δ)
- Δ₁ = destructive_op(x) → warn ∧ confirm ∧ backup - 破坏性操作保护
- Δ₂ = phase_transition(Πₐ→Πᵦ) → verify ∧ backup ∧ update - 阶段转换保护
- Δ₃ = reinit_attempt ∧ ¬Π₁ → warn ∧ confirm ∧ backup - 重新初始化保护
- Δ₄ = error(x) → report ∧ suggest_recovery - 错误处理

## 🔄 System Operation Symbols (Φ)
- Φ_memory = Memory system operations - 内存系统操作
- Φ_file = File system operations - 文件系统操作
- Φ_mode_transition = Mode transition operations - 模式转换操作

## 💾 Backup System Symbols (Σ_backup)
- Σ_backup.create_backup() = 创建标准备份
- Σ_backup.emergency_backup() = 创建紧急备份
- backup_format = "YYYY-MM-DD_HH-MM-SS" - 备份文件命名格式

## 🔗 Cross-Reference Symbols (χ)
- χ_refs.standard = "[↗️σ₁:R₁]" - 标准交叉引用格式
- [↗️σₙ] = 引用文档 σₙ
- [↗️σₙ:Rₘ] = 引用文档 σₙ 中的需求 Rₘ
- [↗️σₙ:section] = 引用文档 σₙ 中的特定章节

## 🎯 Status Indicators
- ✅ = 已完成/成功
- 🔄 = 进行中/处理中
- ⏳ = 计划中/等待中
- ⚠️ = 需要注意/警告
- 🐛 = 问题/错误
- 💡 = 建议/想法
- 🔥 = 紧急/重要

## 📊 Progress Symbols
- **完成度百分比**: 用于表示任务或项目完成程度
- **里程碑标记**: 用于标记重要的项目节点
- **优先级标记**: 高/中/低优先级任务区分

## 🌐 Project Context Symbols
- **Mike_Tea** = 项目/博客名称
- **奶茶味的香草** = 项目作者
- **AnZhiYu** = 使用的 Hexo 主题
- **Hexo** = 静态站点生成器
- **GitHub Pages** = 部署平台

## 📝 Usage Examples

### 基本引用
```
[↗️σ₁:R₁] - 引用项目简介中的第一个需求
[↗️σ₂] - 引用整个系统模式文档
[↗️σ₃:技术栈] - 引用技术上下文中的技术栈章节
```

### 状态更新
```
Π: 🚧INITIALIZING → 🏗️DEVELOPMENT  # 阶段转换
Ω: 🔍RESEARCH → 💡INNOVATE         # 模式切换
Task: ⏳ → 🔄 → ✅                  # 任务状态流转
```

### 文档更新
```
*Π: 🏗️DEVELOPMENT | Ω: ⚙️EXECUTE*  # 文档头部状态标记
σ₄ += 新的进展内容                   # 内容增量更新
Σ_backup.create_backup()           # 备份操作
```
