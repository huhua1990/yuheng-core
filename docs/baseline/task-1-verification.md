# Task 1 基线验证记录

验证日期：2026-10-25  
工作目录：`/Users/huhua/study/ai/yuheng`

## 仓库状态

以下仓库均保持无代码修改、无提交：

| 仓库 | 分支 | 基线提交 | 工作区 |
|---|---|---|---|
| `ruoyi-vue-pro` | `master-jdk17` | `128a0e3bd3` | 干净 |
| `yudao-ui-admin-vue3` | `master` | `050bac1ec` | 干净 |
| `yuheng-demo` | `main` | `2ab34ae` | 干净 |
| `demo` | `main` | `78e93ed` | 干净 |
| `yuheng-core` | `main` | `54600e6` | 只有本次未提交文档和治理文件 |

## 后端验证

执行：

```bash
mvn -o -DskipTests validate \
  -f /Users/huhua/study/ai/yuheng/ruoyi-vue-pro/pom.xml
```

结果：未完成构建验证，退出原因属于依赖环境阻塞。

- 本地 Maven 缓存缺少多个 BOM 和传递依赖；
- 离线模式无法访问私有仓库 `172.26.0.19:8081`；
- 缺失依赖涉及 Artemis、Brave、Cassandra、Jackson、Spring Framework、Spring Security、Spring AI 等；
- 该结果不能证明当前代码存在编译错误，也不能证明代码已经通过编译。

后续动作：配置可用 Maven mirror 或补齐离线依赖后，重新执行同一命令，并把完整输出追加到本文件。

## 前端验证

环境探针：

```text
node v22.0.0
pnpm 9.15.9
```

`/Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3/node_modules` 当前不存在，因此以下命令在工具入口处失败：

```bash
pnpm --dir /Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3 run ts:check
pnpm --dir /Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3 run build:local
```

失败信息是 `vue-tsc` 和 `vite` 模块不存在，并伴随 pnpm 的 `node_modules missing` 提示。未执行 `pnpm install`，也未修改 `pnpm-lock.yaml`。

## Task 1 门禁结论

- 基线文件：已齐全；
- 仓库身份：已固定；
- 后端、数据库、API、前端契约：已形成快照；
- 构建环境问题：已分类并记录；
- 业务代码和源仓库：未修改、未提交；
- 进入 Task 2：允许，后端 Maven 与前端依赖问题保留为后续构建门禁。
