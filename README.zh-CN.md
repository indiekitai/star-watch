[English](README.md) | [中文](README.zh-CN.md)

# star-watch 🌟👀

监控你 GitHub star 过的仓库的归档状态。

**问题：** 你 star 了几百个仓库。当某个仓库被归档（比如 Algolia 的 hn-search），你往往要用到的时候才会发现。

**方案：** 一个简单的 CLI 工具，检查你 star 过的仓库，在有仓库被归档时提醒你。

## 安装

```bash
npm install -g @indiekitai/star-watch
# 或
npx @indiekitai/star-watch
```

## 用法

```bash
# 检查你 star 过的仓库（需要 GITHUB_TOKEN）
star-watch check

# 监控变化，发现新归档时输出
star-watch watch --interval 24h

# 列出你 star 过的所有已归档仓库
star-watch list-archived
```

## 配置

设置你的 GitHub token：
```bash
export GITHUB_TOKEN=your_token_here
```

## 为什么需要它？

- Algolia 的 hn-search 刚刚被归档了（2026 年 2 月）
- 很多好用的工具悄悄就消失了
- Fork 存在，但你得先知道才行
- 在为时已晚之前发现弃用

## 未来扩展方向

- Discord/Slack/Telegram 通知
- 推荐活跃的 fork
- 同时追踪依赖仓库
- RSS feed 输出
