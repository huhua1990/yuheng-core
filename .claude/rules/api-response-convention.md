# API 响应规范

**关键词**: API响应、code=0、业务成功、分页模型、CommonResult

---

## 1. 响应状态判断

### 1.1 业务成功判断

**核心规则：`code === 0` 表示业务接口请求成功**

```javascript
// 前端响应判断
const res = await pageList(params)
if (res.code === 0) {
  // 业务成功，处理数据
  this.tableData = res.data.records
  this.total = res.data.total
}
```

### 1.2 判断方式说明

| 场景 | 判断条件 | 说明 |
|------|----------|------|
| 业务成功 | `res.code === 0` | code 为数字 0 |
| 业务失败 | `res.code !== 0` | 非 0 即失败，错误信息在 `msg` |
| HTTP 成功 | `axios` 自动处理 | HTTP 200-299 由框架统一处理 |

**注意：code 是数字类型 `0`，不是字符串 `"0"`**

---

## 2. 分页请求模型

### 2.1 请求参数

```javascript
{
  "pageNo": 1,      // 当前页码
  "pageSize": 10    // 每页条数
}
```

### 2.2 分页响应模型

```javascript
{
  "code": 0,
  "data": {
    "list": [...],    // 分页数据数组
    "total": 32       // 总记录数
  },
  "msg": "操作成功"
}
```

### 2.3 前端分页处理示例

```javascript
async function fetchData() {
  const res = await pageList({ pageNo: 1, pageSize: 10 })
  if (res.code === 0) {
    tableData.value = res.data.list
    total.value = res.data.total
  }
}
```

---

## 3. 非分页请求响应模型

### 3.1 响应结构

```javascript
{
  "code": 0,
  "data": {...} | [...],  // data可以是对象或数组
  "msg": "操作成功"
}
```

### 3.2 前端非分页处理示例

```javascript
// 列表请求
async function fetchList() {
  const res = await getList()
  if (res.code === 0) {
    listData.value = res.data  // res.data 是数组
  }
}

// 单条查询
async function fetchDetail(id) {
  const res = await get(id)
  if (res.code === 0) {
    detailData.value = res.data  // res.data 是对象
  }
}
```

---

## 4. 响应字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `code` | Integer | 业务状态码，`0` 表示成功 |
| `data` | Object/Array | 业务数据，分页时包含 `list`、`total` |
| `msg` | String | 提示信息 |

---

## 5. 后端返回规范

### 5.1 Controller 返回方式

```java
// 成功响应（有数据）
return CommonResult.success(data);

// 成功响应（无数据）
return CommonResult.success();

// 失败响应
return CommonResult.error(ErrorCodeConstants.XXX);
```

### 5.2 CommonResult 类约定

后端统一使用 `CommonResult` 包装响应，确保：
- `code` 字段为 Integer 类型
- 成功时 `code = 0`
- 失败时 `code` 为非 0 的错误码

---

## 6. AI 行为约束

当 AI 生成或修改 API 调用代码时，必须：

- 使用 `res.code === 0` 判断业务成功（数字 `0`，不是字符串 `"0"`）
- 分页数据从 `res.data.list` 获取，总数从 `res.data.total` 获取
- 非分页数据直接从 `res.data` 获取
- 错误信息从 `res.msg` 获取

---

**规则版本**: v1.0  
**更新时间**: 2024-11-09
