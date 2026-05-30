# Cloud Storage Uploader

[![CI](https://github.com/Bacteriawa/cloud-storage-uploader/actions/workflows/ci.yml/badge.svg)](https://github.com/Bacteriawa/cloud-storage-uploader/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## 项目背景

随着云原生的发展，开发者和企业需要一种轻量、快速且兼容 S3 协议的通用对象存储管理面板。**Cloud Storage Uploader** 是一款基于 Next.js 打造的现代化云存储面板，最初为 Cloudflare R2 设计，但完美兼容 AWS S3、阿里云 OSS、腾讯云 COS 及自建 MinIO。它提供了从文件上传、分片并发、预览到链路分享的一站式解决方案。

我们的目标是：**在浏览器中提供媲美原生应用的云存储管理体验。**

## 核心功能

- **极致性能**：基于 Next.js App Router 构建，提供极致的页面加载速度与交互体验。
- **大文件稳定上传**：内置智能切片与 `p-limit` 并发控制，支持千兆级别超大文件稳定上传，有效防止浏览器 OOM。
- **本地安全存储**：配置与密钥经 AES-256 加密后安全保存在浏览器本地，绝不经过第三方服务器，您的数据完全由您掌控。
- **全能文件预览**：无需下载即可在线预览图片、音视频、PDF、Office 文档（借助微软在线预览）甚至是字体文件。
- **多存储桶管理**：支持一键切换多个配置配置（Profile），轻松游走于不同的存储节点之间。

## 技术架构

- **核心框架**: Next.js 16 (App Router) + React 19
- **语言**: TypeScript (严格模式)
- **样式**: Framer Motion (交互动画) + Lucide React (图标)
- **底层 SDK**: `@aws-sdk/client-s3` (S3 API 兼容)
- **质量保证**: ESLint (代码规范) + Jest (单元测试，覆盖率 >90%)
- **部署环境**: 兼容 Vercel、Cloudflare Pages (OpenNext) 及传统 Node.js 容器。

## 快速上手指南

### 1. 本地运行

1. 克隆项目：
```bash
git clone https://github.com/Bacteriawa/cloud-storage-uploader.git
cd cloud-storage-uploader
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器：
```bash
npm run dev
```

4. 访问 `http://localhost:3000`。在首次打开时，点击界面上的“设置”图标，填入您的 S3/R2 的 Access Key、Secret Key 及 Endpoint 即可使用。

### 2. 生产环境构建与检查

在构建或部署前，我们推荐您使用内置的一键检查命令，它会按顺序执行代码格式、类型、单元测试及 Next.js 构建：
```bash
npm run check
```

## 使用场景示例

1. **图床与 CDN 管理**：配合 Cloudflare R2 绑定自定义域名，在面板中上传图片后，一键复制预签名 URL 或公开直链，直接用于博客或网站。
2. **企业级大文件分发**：将几十 GB 的视频素材通过面板的分片并发机制稳定上传至 OSS，然后生成有时效性的分享链接发给客户。
3. **多云融合操作平台**：开发者可以同时将 AWS S3（存放生产数据）和 MinIO（存放测试数据）的配置保存在面板中，随时无缝切换。

## 常见问题解答 (FAQ)

**Q: 我的密钥安全吗？**  
A: 非常安全。本面板属于“纯客户端渲染（Client-Side）+ 服务端 API 透传”架构。您的密钥保存在您自己浏览器的 LocalStorage 中，并经过了 AES 加密处理，甚至支持设置主密码防护。

**Q: 上传超过 1GB 的文件会崩溃吗？**  
A: 不会。Cloud Storage Uploader 会自动将大于 5MB 的文件切片，并将其放入由 `p-limit` 调度的并发池中（最高同时处理 3 个切片），从而严格控制内存开销并保证网络的稳定性。断网刷新后，还支持“幽灵缓存”清理或续传。

**Q: 为什么上传完图片后无法在线预览？**  
A: 这通常是因为您的云存储节点尚未配置跨域资源共享（CORS）。请前往您的云厂商控制台，允许 `GET` 跨域请求即可解决此问题。

---

*如果您喜欢这个项目，欢迎点亮 Star 支持我们！*
