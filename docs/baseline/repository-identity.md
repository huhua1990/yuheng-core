# Yuheng 基线仓库身份

盘点日期：2026-10-25  
状态：Task 1 基线快照  
原则：本文件只记录当前工作区事实，不表示已经完成仓库拆分。

## 仓库映射

| 角色 | 路径 | Git 分支 | HEAD | 当前状态 |
|---|---|---|---|---|
| ruoyi 后端源仓库 | `/Users/huhua/study/ai/yuheng/ruoyi-vue-pro` | `master-jdk17` | `128a0e3bd3` | 干净 |
| Vue3 前端源仓库 | `/Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3` | `master` | `050bac1ec` | 干净 |
| Yuheng 消费端 | `/Users/huhua/study/ai/yuheng/yuheng-demo` | `main` | `2ab34ae` | 只有 README，尚未接入业务代码 |
| Yuheng core | `/Users/huhua/study/ai/yuheng/yuheng-core` | `main` | `54600e6` | 仅有 README 和未提交 docs |
| Athena 参考母版 | `/Users/huhua/study/ai/yuheng/demo` | `main` | `78e93ed` | 干净，不作为 Yuheng 消费端 |

## 当前身份决策

- `/Users/huhua/study/ai/yuheng/ruoyi-vue-pro` 是后端行为和数据库兼容基线。
- `/Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3` 是 Vue3 + Element Plus 前端基线，后续拆为平台 `yuheng-ui` 和消费端业务 UI。
- `/Users/huhua/study/ai/yuheng/yuheng-demo` 是 Yuheng 后端消费端目标工程，当前从空骨架开始接入版本化 core。
- `/Users/huhua/study/ai/yuheng/demo` 继续作为 Athena 规则、技能、同步脚本和知识组织方式的参考，不与 Yuheng 消费端混用。
- `/Users/huhua/study/ai/yuheng/yuheng-core` 是目标框架仓库，当前先承载设计、基线和后续发布模块。

## 基线操作限制

Task 1 没有修改上述源代码仓库，也没有提交 Git。后续代码迁移必须先引用本文件中的 commit 作为输入事实；如果源仓库 HEAD 变化，必须重新生成受影响的清单。
