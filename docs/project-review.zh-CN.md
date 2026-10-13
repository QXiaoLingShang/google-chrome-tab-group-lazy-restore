# 恢复性能与开源仓库对照

调研日期：2026-10-13。基线提交：fa6dfd9。结论针对当前源码和公开仓库，不代表对其他项目的全面审计。

## 内存峰值的边界

当前 background.ts 监听 Chrome 的 onCreated/onUpdated/onActivated，源码没有调用 tabs.create 来恢复标签。原生“重新打开保存的标签组”由 Chrome 创建并加载网页，扩展是在事件发生后执行 discard。限制 discard 的并发不会限制 Chrome 的网页加载并发。

[Chrome tabs API](https://developer.chrome.com/docs/extensions/reference/api/tabs) 的创建参数没有 discarded；discard 发生在创建之后，且不能丢弃活动标签。单纯缩短定时器无法保证消除首次峰值。[Firefox 的 tabs.create](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/create) 有 discarded 创建参数，不能直接移植到 Chrome。

## 本次改进

| 问题                                            | 修改                                           | 验证方式                                    |
| ----------------------------------------------- | ---------------------------------------------- | ------------------------------------------- |
| 每个事件重置 300ms 检查延迟，持续恢复会一直延后 | 保留已经排定的检查，分批开始处理               | 持续每 100ms 创建标签，结束前已发生 discard |
| onCreated 已带 groupId 时可能漏检测             | 创建时也关联批次，同时支持后续 groupId 更新    | 两种 Chrome 事件序列                        |
| 没有活动成员的后台组不会处理                    | 去掉必须有活动成员的条件，队列仍逐次保护活动页 | 后台组和用户激活测试                        |
| pendingUrl 标签被跳过后缺少重新检查             | 加载状态、固定和声音状态更新触发检查           | 导航完成、取消固定、停止声音                |
| 标题早于异步配置读取到达                        | 对已跟踪标签记录早到标题                       | 实验性标题等待用例                          |
| 标题截止后 discard 失败重试变成零间隔           | 失败重试始终保留配置的退避间隔                 | 假时钟验证                                  |

这些改动减少扩展自身延迟和漏处理；实际峰值及回收时间需要浏览器测量，尚无测量结果。

## 同类项目对照

| 参考                                                                  | 公开源码可确认的做法                                                                                                                                          | 本项目采用                           |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| [Tab Session Manager](https://github.com/sienori/Tab-Session-Manager) | README 有开发及浏览器加载步骤、许可证和隐私链接；[package.json](https://github.com/sienori/Tab-Session-Manager/blob/master/package.json) 有格式及格式检查脚本 | 开发说明、隐私文档、格式检查         |
| [Simple Tab Groups](https://github.com/Drive4ik/simple-tab-groups)    | 有问题模板、构建 ZIP 说明、权限说明、许可证；[根 package.json](https://github.com/Drive4ik/simple-tab-groups/blob/master/package.json) 配置 ESLint            | 结构化问题模板、权限说明、可重复打包 |

检查到的入口并不足以证明这些项目具有完善的覆盖率或持续交付，因此本项目的测试、覆盖率和 CI 按自身风险设计，没有将其他项目当作完整标准。

本项目已有 MIT 许可证、双语 README、TypeScript 类型检查、开发/发布构建和锁文件。新增核心行为测试与覆盖率、跨平台 CI、草稿发布、贡献/隐私/安全说明、变更记录、PR/Issue 模板及依赖更新配置。不引入账号服务、遥测或新的扩展权限。

## 仍需真实浏览器验证

恢复识别仍是“近期创建并加入同一组”的启发式，不能证明每次都是原生恢复。手动快速创建多个分组标签可能触发相同行为。既有标签不进入候选集合。

扩展 service worker 停止会丢失内存批次及计时器；配置的长等待时间不能保证跨 worker 重启继续执行。真正的保存/恢复模式必须有持久化恢复状态，见[方案](true-lazy-restore.zh-CN.md)。浏览器测量步骤见[验证文档](validation.md)。
