# Yuheng 框架使用规则

适用范围：业务项目接入 `yuheng-server`、`yuheng-ui`，AI 需要理解 Yuheng 框架能力时。

---

## 强制规则

### 1. 先找本地 Yuheng knowledge，再编码

- 不要只凭记忆假设框架能力。
- 优先读取本地同步的 `ai-knowledge-core`。

### 2. 先判断任务属于哪条知识轨道

- 前端页面、Store、布局、权限、请求工具：优先读 `ai-knowledge-core/ui/`。
- 后端接口、服务、上下文、数据库关系：优先读 `ai-knowledge-core/server/`。
- 当前 build 版本与前后端版本不一致：先读 `ai-knowledge-core/release-matrix/release-matrix.json`。

### 3. 不要臆造 Yuheng API、Store、请求层或表结构

- 如果 knowledge 中没找到，就明确说明缺口。
- 不要编造不存在的 hook、service、controller、数据库字段或页面上下文。
- knowledge 缺失时先停止猜测，再决定是否补知识或人工确认。

### 4. 复用框架现成能力优先于重复建设

- 前端优先复用 `yuheng-ui` 导出的共享 Store。
- 前端 HTTP 请求统一复用 `import { request } from 'yuheng-ui'`。
- 后端优先复用 `UserService`、`RoleService`、`SecurityFrameworkUtils`、`CommonResult`。
- 系统参数、码表、主键生成优先走框架工具，而不是业务自建平替。

### 5. 输出时要引用具体符号

- 前端示例：`useUserStore`、`useMenuStore`、`request.get(...)`、`request.post(...)`
- 后端示例：`CommonResult.success(data)`、`SecurityFrameworkUtils.getLoginUserId()`
- 不要只写泛化描述，例如"读取用户上下文""调用统一请求封装"。

### 6. 如果在 `yuheng-core` 本体仓库工作，要遵守框架边界

- 不在 core 中沉淀业务逻辑。
- 业务实现应留在业务仓库，core 只保留框架共性能力。
- 修改 core 时要明确说明本次改动属于"框架能力"还是"业务定制"。

---

## 核心包路径

### 后端

- 统一返回：`com.yuheng.platform.framework.common.pojo.CommonResult`
- 分页结果：`com.yuheng.platform.framework.common.pojo.PageResult`
- 分页参数：`com.yuheng.platform.framework.common.pojo.PageParam`
- 用户工具：`com.yuheng.platform.framework.security.core.util.SecurityFrameworkUtils`

### 前端

```typescript
import { 
  request, 
  useUserStore, 
  useMenuStore,
  useRoleStore,
  useDeptStore,
  useDictStore
} from 'yuheng-ui'
```

---

## 禁止事项

- 凭记忆猜测框架 API
- 重复实现框架已有能力
- 绕过框架自建请求层
- 在 core 中写业务代码

---

**规则版本**: v1.0  
**更新时间**: 2024-11-09
