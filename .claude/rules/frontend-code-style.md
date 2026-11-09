# 前端代码规范

## 目录层级

新建业务页面严格遵守三级：`views/{工作目录}/{页面目录}/index.vue`。

```
views/
├── system/              # 系统管理
│   ├── user/           # 用户管理
│   │   └── index.vue
│   └── role/           # 角色管理
│       └── index.vue
```

---

## 命名规范

| 类型 | 命名规则 | 示例 |
|------|----------|------|
| 页面入口 | 固定 `index.vue` | — |
| 子组件 | PascalCase | `AddEditDialog.vue` |
| API 文件 | 小写，与模块对应 | `user.js` |

---

## API 调用

```typescript
import { request } from 'yuheng-ui'

export const pageList = (params) => request.post('/api/user/page', params)
export const create = (data) => request.post('/api/user/create', data)
```

- 禁止自建 axios 实例
- 所有 API 封装到 `src/api/{module}.js`

---

## Store 使用

```typescript
import { useUserStore, useMenuStore } from 'yuheng-ui'

const userStore = useUserStore()
const currentUser = userStore.currentUser
```

---

## 样式

使用 `<style scoped>`，不在业务页面内重写框架基础样式。

---

**规则版本**: v1.0  
**更新时间**: 2024-11-09
