# 参与贡献指南 (Contributing Guide)

欢迎来到 **Cloud Storage Uploader** 开源项目！我们非常高兴您有兴趣参与本项目的建设。这份指南将帮助您了解如何参与贡献，确保协作过程高效、标准化、愉快。

## 贡献流程全指南

为了保证主干分支的稳定性，我们采用标准的 GitHub Flow：

1. **Fork 本仓库**：点击 GitHub 页面右上角的 `Fork` 按钮，将项目复制到您的个人账户下。
2. **克隆代码到本地**：
   ```bash
   git clone https://github.com/<您的用户名>/cloud-storage-uploader.git
   cd cloud-storage-uploader
   ```
3. **添加上游仓库 (Upstream)**：
   ```bash
   git remote add upstream https://github.com/Bacteriawa/cloud-storage-uploader.git
   ```
4. **同步最新代码并创建分支**：
   在开始任何开发之前，请确保拉取最新的主分支代码，并创建一个**具有描述性的新分支**（不要直接在 main 分支开发）。
   ```bash
   git fetch upstream
   git checkout -b feature/your-feature-name upstream/main
   # 分支命名规范参考：
   # 新功能: feature/xxx
   # 修 Bug: fix/xxx
   # 文档: docs/xxx
   ```
5. **开发与提交**：完成代码修改并提交 Commit（请严格遵循下文的 Commit 规范）。
6. **推送到您的仓库**：`git push origin feature/your-feature-name`
7. **发起 Pull Request (PR)**：在 GitHub 页面上，向本项目的 `main` 分支发起 PR。

## 本地环境搭建与测试流程

提交代码前，您必须在本地保证代码能够成功编译与测试。

**环境要求**：
- Node.js >= 18
- npm >= 9

**搭建与验证步骤**：
1. **安装依赖**：
   ```bash
   npm install
   ```
2. **运行本地服务**：
   ```bash
   npm run dev
   ```
3. **【关键】运行全链路测试与检查**：
   我们提供了一键式的严格验证脚本，它会依次执行 ESLint、TSC 类型检查、Jest 单元测试和 Next 生产构建。**在发起 PR 前，您必须确保该命令 100% 绿色通过：**
   ```bash
   npm run check
   ```

## 代码规范 (Code Style)

- **强类型要求**：TypeScript 中禁止使用 `any`（特殊情况请使用 `unknown` 并添加类型守卫）。
- **React Hooks**：请遵循 `eslint-plugin-react-hooks` 的规则。如果使用了 `eslint-disable` 注释，必须在同一行用 `--` 追加详细的解释（如：`// eslint-disable-next-line react-hooks/exhaustive-deps -- Cleanup-only`）。
- **组件导入**：去除无用的 Import。优先使用 Lucide React 作为统一的图标库。

## Commit 信息提交标准

我们遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范，这将用于自动生成 Changelog。Commit 格式为：

```
<type>(<scope>): <subject>

<body>
```

**常用的 Type 包含**：
- `feat`: 新增功能
- `fix`: 修复 Bug
- `docs`: 仅仅修改了文档（如 README.md）
- `style`: 不影响代码含义的修改（空格、格式化、缺失的分号等）
- `refactor`: 代码重构（既不是新增功能，也不是修复 Bug）
- `perf`: 优化相关（性能提升）
- `test`: 增加或修改测试用例
- `chore`: 构建过程或辅助工具的变动（如 CI 配置，依赖升级）

**示例**：
- `feat(upload): add p-limit for concurrent multipart uploads`
- `fix(config): resolve AES decryption failing on legacy plaintext`

## PR 审核要求 (Pull Request Review)

当您发起 PR 后，Maintainer 会对您的代码进行 Review。一个高质量的 PR 应符合以下条件：

1. **标题清晰**：PR 标题同样应当遵循 Commit 信息规范（例如 `feat: support aliyun oss`）。
2. **描述详尽**：详细说明您解决了什么问题，采用了何种思路。如果是 UI 修改，**必须附带 Before / After 的截图**。
3. **CI 通过**：GitHub Actions 的所有检查项（Lint, Type Check, Jest, Build）必须呈 ✅ 状态。
4. **单职原则**：一个 PR 只解决一个特定的 Issue 或添加一个特定的功能。不要将不相关的重构与功能开发混在一个 PR 中。
5. **测试覆盖**：如果您的 PR 添加了新的业务逻辑，请务必在 `src/__tests__/` 目录下添加对应的 Jest 单元测试用例。

---

再次感谢您对 Cloud Storage Uploader 的贡献，开源因您而伟大！
