<h1 align="center">Tab Group Lazy Restore</h1>

<p align="center">
  <a href="README.md">English</a> · 简体中文
</p>

你是否遇到过这样的情况：把一个包含几十个标签页的 Saved Tab Group 重新打开时，Chrome 可能会瞬间全部加载，内存甚至飙到 5GB 以上，而你其实只想看其中一个页面？

直接关闭这些页面会丢失内容，留着又会带来巨大的内存峰值。Tab Group Lazy Restore 正是为此设计：在恢复标签组时释放符合条件的后台标签页，尽量降低恢复后的内存占用。

## 安装

1. 从 [最新 Release](https://github.com/QXiaoLingShang/google-chrome-tab-group-lazy-restore/releases) 下载 ZIP 安装包。
2. 解压 ZIP 文件。
3. 在 Chrome 中打开 `chrome://extensions/`，启用**开发者模式**。
4. 点击**加载已解压的扩展程序（Load unpacked）**，选择包含 `manifest.json` 的解压文件夹。

## 使用

启用扩展后，正常打开一个超过 5 个标签页（默认门槛）的标签组时，扩展会识别本次恢复中新建的标签页，并释放符合条件的后台标签页，降低内存占用。

要调整设置，在 `chrome://extensions/` 中点击扩展的**详细信息**，再选择**扩展程序选项（Extension options）**。

## 局限

在扩展开始释放标签页之前，Chrome 可能已经开始加载多个页面。因此，扩展无法避免最初的内存高峰，也无法实现真正的懒加载。Chrome 回收内存和更新统计也需要时间。

## 开发

开发环境和构建步骤见[开发指南（英文）](docs/DEVELOP.md)。

## 项目结构

```text
better_group/
├── manifest.json
├── options.html           # 扩展设置页面
├── icons/                 # 扩展图标
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml    # 依赖安装脚本权限
├── tsconfig.json
├── vitest.config.mts      # 核心测试和覆盖率配置
├── .github/workflows/     # CI 和发布草稿流程
├── docs/                  # 英文项目文档
├── scripts/               # 构建、打包和工具版本检查
├── tests/                 # Chrome API 模拟和回归测试
├── src/
│   ├── background.ts      # 后台事件入口
│   ├── advanced-config.ts # 内部高级调参常量
│   ├── config.ts          # 恢复设置和存储读取
│   ├── group.ts           # 恢复批次跟踪和标签页检查
│   ├── discard.ts         # 限制并发数量的释放队列
│   ├── options.ts         # 设置页面逻辑
│   ├── i18n.ts            # 英文和简体中文文案
│   └── types.ts           # 共享类型
└── dist/                  # 构建生成的扩展脚本
```

## 项目文档

以下项目文档目前均为英文：[开发指南](docs/DEVELOP.md)、[贡献指南](docs/CONTRIBUTING.md)、[隐私说明](docs/PRIVACY.md)、[安全说明](docs/SECURITY.md)和[变更记录](docs/CHANGELOG.md)。

## 许可证

本项目采用 [MIT 许可证](LICENSE)。
