---
name: yuheng-spec-to-plan
description: Convert specification to detailed implementation plan with bite-sized TDD tasks
---

# Yuheng Spec to Plan

将需求规格转换为详细的、可执行的实施计划。

假设工程师对代码库零了解，需要文档化他们需要知道的所有内容：每个任务要修改哪些文件、代码示例、测试方法。将计划拆解为细粒度任务。DRY. YAGNI. TDD. 频繁提交。

**声明开始**: "我正在使用 yuheng-spec-to-plan Skill 创建实施计划。"

---

## 输入

- 已冻结的需求规格说明书
- 设计文档（来自 brainstorming）

## 输出

- 详细的实施计划文档
- 细粒度任务（2-5分钟/步骤）
- 精确的文件路径
- TDD 强制步骤
- 可验证的检查点

---

## 核心原则

### 1. 细粒度任务（Bite-Sized Tasks）

**每个步骤是一个动作（2-5分钟）**:
- "编写失败测试" - 一步
- "运行测试确认红灯" - 一步
- "实现最小代码使测试通过" - 一步
- "运行测试确认绿灯" - 一步
- "提交" - 一步

### 2. 精确文件路径

**必须使用精确路径**:
- ✅ `com/yuheng/platform/module/system/service/UserService.java`
- ✅ `com/yuheng/platform/module/system/dal/mapper/UserMapper.xml:45-67`
- ❌ "创建 Service"
- ❌ "修改 Mapper"

### 3. 强制 TDD

**每个任务必须包含 5 步**:
1. 编写失败测试
2. 运行测试确认红灯
3. 实现最小代码
4. 运行测试确认绿灯
5. 提交

### 4. 无占位符

**禁止使用占位符**:
- ❌ "TBD", "TODO", "稍后实现"
- ❌ "添加适当的错误处理"（必须写出具体代码）
- ❌ "为上述功能编写测试"（必须写出测试代码）
- ❌ "类似 Task N"（必须重复完整代码）

---

## 执行流程

### 步骤 1: 范围检查

如果规格涵盖多个独立子系统，建议拆分为多个计划，每个子系统一个计划。每个计划应产生独立的、可测试的软件。

### 步骤 2: 文件结构规划

**在定义任务前，先规划文件结构**:

```markdown
## 文件结构

### 后端
- `yuheng-module-system/src/main/java/com/yuheng/platform/module/system/`
  - `controller/UserController.java` - REST API 控制器
  - `service/UserService.java` - 业务逻辑
  - `dal/dataobject/UserDO.java` - 数据对象
  - `dal/mapper/UserMapper.java` - MyBatis Mapper
  - `dal/mapper/UserMapper.xml` - SQL 映射
  - `controller/admin/user/vo/UserRespVO.java` - 响应 VO
  - `controller/admin/user/vo/UserCreateReqDTO.java` - 请求 DTO
  - `convert/UserConvert.java` - 对象转换

### 测试
- `yuheng-module-system/src/test/java/com/yuheng/platform/module/system/`
  - `service/UserServiceTest.java` - Service 单元测试

### 数据库
- `yuheng-module-system/src/main/resources/db/changelog/`
  - `changes/V1.0.1-create-user-table.yaml` - Liquibase changeset
```

**设计原则**:
- 每个文件职责单一明确
- 文件边界清晰，接口明确
- 相关变更的文件放在一起
- 遵循现有代码库模式

### 步骤 3: 任务拆解

将文件结构转换为任务序列，每个任务产生独立的、有意义的变更。

---

## 计划文档格式

### 文档头部（必须）

```markdown
# {功能名称} 实施计划

> **Yuheng 执行模式**: 计划批准后，使用 `yuheng-delivery-execution` 执行。步骤使用复选框 (`- [ ]`) 语法跟踪进度。

**目标**: [一句话描述要构建什么]

**架构**: [2-3句话描述实现方法]

**技术栈**: [关键技术/库]

**工期估算**: [X-Y 小时/天]

---
```

### 任务结构（标准格式）

````markdown
### Task N: {组件名称}

**Files:**
- Create: `exact/path/to/File.java`
- Modify: `exact/path/to/Existing.java:123-145`
- Test: `exact/path/to/FileTest.java`

**Duration**: 15-20 分钟

- [ ] **Step 1: 编写失败测试**

```java
@Test
void testCreateUser_success() {
    // Given
    UserCreateReqDTO reqDTO = new UserCreateReqDTO();
    reqDTO.setUsername("test");
    reqDTO.setNickname("测试用户");
    
    // When
    Long userId = userService.create(reqDTO);
    
    // Then
    assertNotNull(userId);
    UserDO user = userMapper.selectById(userId);
    assertEquals("test", user.getUsername());
}
```

- [ ] **Step 2: 运行测试确认红灯**

```bash
mvn test -Dtest=UserServiceTest#testCreateUser_success
```

Expected: FAIL - "方法 create 不存在"

- [ ] **Step 3: 实现最小代码**

在 `UserService.java` 中添加：

```java
@Transactional(rollbackFor = Exception.class)
public Long create(UserCreateReqDTO reqDTO) {
    // 转换 DTO
    UserDO user = UserConvert.INSTANCE.convert(reqDTO);
    
    // 插入数据库
    baseMapper.insert(user);
    
    return user.getId();
}
```

- [ ] **Step 4: 运行测试确认绿灯**

```bash
mvn test -Dtest=UserServiceTest#testCreateUser_success
```

Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add yuheng-module-system/src/main/java/com/yuheng/platform/module/system/service/UserService.java \
        yuheng-module-system/src/test/java/com/yuheng/platform/module/system/service/UserServiceTest.java
git commit -m "feat(user): add UserService.create method

- Implement user creation with DTO conversion
- Add unit test for success case
- Validate basic functionality

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**验证点**: 
- [ ] 测试通过
- [ ] 代码已提交
- [ ] 遵循 TDD 流程
````

---

## 完整示例：用户管理 CRUD

### 示例计划结构

```markdown
# 用户管理 CRUD 实施计划

> **Yuheng 执行模式**: 计划批准后，使用 `yuheng-delivery-execution` 执行。

**目标**: 实现用户管理的完整 CRUD 功能，包含列表、创建、更新、删除

**架构**: 标准三层架构，Controller → Service → Mapper，使用 MyBatis Plus，遵循 Yuheng 8类产物规范

**技术栈**: Spring Boot 3.5.15, MyBatis Plus 3.5.7, Liquibase

**工期估算**: 4-6 小时

---

## 文件结构

### 后端（8类产物）
- DO: `UserDO.java`
- Mapper: `UserMapper.java`
- Mapper.xml: `UserMapper.xml`
- Service: `UserService.java`
- Controller: `UserController.java`
- DTO: `UserCreateReqDTO.java`, `UserUpdateReqDTO.java`, `UserPageReqDTO.java`
- VO: `UserRespVO.java`
- Convert: `UserConvert.java`

### 数据库
- Changeset: `V1.0.1-create-user-table.yaml`

---

## 实施任务

### Task 1: 数据库表创建

**Files:**
- Create: `yuheng-module-system/src/main/resources/db/changelog/changes/V1.0.1-create-user-table.yaml`
- Modify: `yuheng-module-system/src/main/resources/db/changelog/db.changelog-master.yaml`

**Duration**: 10 分钟

- [ ] **Step 1: 创建 changeset 文件**

创建 `V1.0.1-create-user-table.yaml`:

```yaml
databaseChangeLog:
  - changeSet:
      id: V1.0.1-create-user-table
      author: yuheng
      preConditions:
        - onFail: MARK_RAN
        - not:
            tableExists:
              tableName: system_user
      changes:
        - sql:
            sql: |
              CREATE TABLE system_user (
                  id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
                  username VARCHAR(30) NOT NULL COMMENT '用户账号',
                  password VARCHAR(100) NOT NULL COMMENT '密码',
                  nickname VARCHAR(30) NOT NULL COMMENT '用户昵称',
                  status TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0正常 1停用',
                  creator VARCHAR(64) NOT NULL COMMENT '创建者',
                  create_time DATETIME NOT NULL COMMENT '创建时间',
                  updater VARCHAR(64) NOT NULL COMMENT '更新者',
                  update_time DATETIME NOT NULL COMMENT '更新时间',
                  deleted BIT DEFAULT 0 NOT NULL COMMENT '是否删除'
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
              
              CREATE INDEX idx_username ON system_user(username);
            splitStatements: true
            stripComments: false
      rollback:
        - sql: "DROP TABLE IF EXISTS system_user"
```

- [ ] **Step 2: 更新主 changelog**

在 `db.changelog-master.yaml` 中添加:

```yaml
  - include:
      file: db/changelog/changes/V1.0.1-create-user-table.yaml
```

- [ ] **Step 3: 验证迁移脚本**

```bash
mvn liquibase:validate
```

Expected: 验证通过，无错误

- [ ] **Step 4: 执行迁移（本地）**

```bash
mvn liquibase:update
```

Expected: 表创建成功

- [ ] **Step 5: 提交**

```bash
git add yuheng-module-system/src/main/resources/db/changelog/
git commit -m "feat(user): add system_user table migration

- Create system_user table with basic fields
- Add username index
- Include rollback support

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Task 2: 创建 UserDO

**Files:**
- Create: `yuheng-module-system/src/main/java/com/yuheng/platform/module/system/dal/dataobject/UserDO.java`

**Duration**: 5 分钟

- [ ] **Step 1: 创建 DO 类**

```java
package com.yuheng.platform.module.system.dal.dataobject;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.yuheng.platform.framework.mybatis.core.dataobject.BaseDO;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 用户 DO
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("system_user")
public class UserDO extends BaseDO {

    /**
     * 用户ID
     */
    @TableId
    private Long id;

    /**
     * 用户账号
     */
    private String username;

    /**
     * 密码
     */
    private String password;

    /**
     * 用户昵称
     */
    private String nickname;

    /**
     * 状态：0正常 1停用
     */
    private Integer status;
}
```

- [ ] **Step 2: 编译验证**

```bash
mvn compile -pl yuheng-module-system
```

Expected: 编译成功

- [ ] **Step 3: 提交**

```bash
git add yuheng-module-system/src/main/java/com/yuheng/platform/module/system/dal/dataobject/UserDO.java
git commit -m "feat(user): add UserDO entity

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Task 3: 创建 UserMapper

**Files:**
- Create: `yuheng-module-system/src/main/java/com/yuheng/platform/module/system/dal/mapper/UserMapper.java`
- Create: `yuheng-module-system/src/main/resources/mapper/system/UserMapper.xml`
- Test: `yuheng-module-system/src/test/java/com/yuheng/platform/module/system/dal/mapper/UserMapperTest.java`

**Duration**: 15 分钟

- [ ] **Step 1: 编写失败测试**

创建 `UserMapperTest.java`:

```java
@SpringBootTest
class UserMapperTest {

    @Autowired
    private UserMapper userMapper;

    @Test
    void testInsert() {
        // Given
        UserDO user = new UserDO();
        user.setUsername("test");
        user.setPassword("password");
        user.setNickname("测试");
        user.setStatus(0);
        
        // When
        userMapper.insert(user);
        
        // Then
        assertNotNull(user.getId());
    }
}
```

- [ ] **Step 2: 运行测试确认红灯**

```bash
mvn test -Dtest=UserMapperTest#testInsert
```

Expected: FAIL - "UserMapper 不存在"

- [ ] **Step 3: 实现 Mapper 接口**

创建 `UserMapper.java`:

```java
package com.yuheng.platform.module.system.dal.mapper;

import com.yuheng.platform.framework.mybatis.core.mapper.BaseMapperX;
import com.yuheng.platform.module.system.dal.dataobject.UserDO;
import org.apache.ibatis.annotations.Mapper;

/**
 * 用户 Mapper
 */
@Mapper
public interface UserMapper extends BaseMapperX<UserDO> {
}
```

创建 `UserMapper.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" 
  "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.yuheng.platform.module.system.dal.mapper.UserMapper">
</mapper>
```

- [ ] **Step 4: 运行测试确认绿灯**

```bash
mvn test -Dtest=UserMapperTest#testInsert
```

Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add yuheng-module-system/src/main/java/com/yuheng/platform/module/system/dal/mapper/UserMapper.java \
        yuheng-module-system/src/main/resources/mapper/system/UserMapper.xml \
        yuheng-module-system/src/test/java/com/yuheng/platform/module/system/dal/mapper/UserMapperTest.java
git commit -m "feat(user): add UserMapper

- Add MyBatis Mapper interface
- Add XML mapping file
- Add unit test for insert operation

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Task 4: 创建 DTO 和 VO

**Files:**
- Create: `UserCreateReqDTO.java`
- Create: `UserUpdateReqDTO.java`
- Create: `UserPageReqDTO.java`
- Create: `UserRespVO.java`

**Duration**: 10 分钟

[...继续按相同格式创建剩余任务...]

---

## 自我审查清单

完成计划后，进行自我审查：

### 1. 规格覆盖

浏览规格中的每个章节/需求，能否指向实现它的任务？列出任何缺口。

### 2. 占位符扫描

搜索计划中的红旗——"No Placeholders"部分的任何模式。修复它们。

### 3. 类型一致性

后续任务中使用的类型、方法签名、属性名称是否与早期任务中定义的匹配？

如果发现问题，内联修复。无需重新审查——修复后继续。如果发现规格需求没有对应任务，添加任务。

---

## 计划保存

**保存到**: `docs/plans/YYYY-MM-DD-{feature-name}.md`

示例: `docs/plans/2024-11-09-user-management.md`

---

## 执行交接

保存计划后，提供执行选择：

**"计划已完成并保存到 `docs/plans/<filename>.md`。准备执行。"**

**下一步**: 使用 `yuheng-delivery-execution` 按计划执行

---

## 关键要求总结

✅ **精确文件路径** - 始终使用完整路径  
✅ **完整代码** - 每步都要显示代码  
✅ **精确命令** - 带预期输出  
✅ **DRY, YAGNI, TDD** - 遵循原则  
✅ **频繁提交** - 每个任务提交  
✅ **细粒度** - 2-5分钟/步骤  
✅ **无占位符** - 所有内容完整  

---

## 相关规则

- `@rules/yuheng-phase-gate.md` - 计划必须冻结才能实现
- `@rules/yuheng-backend-tdd.md` - TDD 强制
- `@rules/backend-code-style.md` - 代码规范
- `@rules/yuheng-design-gate.md` - 设计门禁

## 下一步

计划冻结后，使用 `yuheng-delivery-execution` 执行交付。

---

**Skill 版本**: v2.0（增强版，参考 Athena writing-plans）  
**更新时间**: 2024-11-09
