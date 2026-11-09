---
name: yuheng-backend-delivery
description: Specialized backend development with TDD enforcement
---

# Yuheng Backend Delivery

专项后端开发交付，强制 TDD 流程。

## 输入

- 后端开发任务（从开发计划中提取）
- 数据库表设计
- API 接口设计

## 输出

- 完整的后端 CRUD 代码（8类产物）
- 通过的单元测试
- Mapper XML

## 执行流程

### 1. 读取任务

从开发计划中提取后端任务：
- 需要创建哪些表
- 需要开发哪些 API
- 需要哪些业务逻辑

### 2. 强制 TDD

遵守 `@rules/yuheng-backend-tdd.md`：

#### 步骤 1: 先写测试

```java
@SpringBootTest
class XxxServiceTest {
    
    @Autowired
    private XxxService xxxService;
    
    @Test
    void testCreate() {
        XxxCreateReqDTO reqDTO = new XxxCreateReqDTO();
        reqDTO.setName("test");
        
        Long id = xxxService.create(reqDTO);
        
        assertNotNull(id);
    }
}
```

#### 步骤 2: 运行测试（红灯）

```bash
mvn test -Dtest=XxxServiceTest#testCreate
```

确认失败：方法未实现。

#### 步骤 3: 创建实现

按照 `@rules/backend-code-style.md` 创建：

**1. DO（数据对象）**
```java
@Data
@TableName("biz_xxx")
public class XxxDO extends BaseDO {
    private Long id;
    private String name;
}
```

**2. Mapper**
```java
@Mapper
public interface XxxMapper extends BaseMapperX<XxxDO> {
    
    default PageResult<XxxDO> selectPage(XxxPageReqDTO reqDTO) {
        return selectPage(reqDTO, new LambdaQueryWrapperX<XxxDO>()
            .likeIfPresent(XxxDO::getName, reqDTO.getName()));
    }
}
```

**3. Mapper XML**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" 
  "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.yuheng.platform.module.xxx.dal.mapper.XxxMapper">
    
    <resultMap id="BaseResultMap" type="com.yuheng.platform.module.xxx.dal.dataobject.XxxDO">
        <id column="id" property="id" />
        <result column="name" property="name" />
    </resultMap>
    
</mapper>
```

**4. Service**
```java
@Service
public class XxxService extends ServiceImpl<XxxMapper, XxxDO> {
    
    @Transactional(rollbackFor = Exception.class)
    public Long create(XxxCreateReqDTO reqDTO) {
        XxxDO xxx = XxxConvert.INSTANCE.convert(reqDTO);
        baseMapper.insert(xxx);
        return xxx.getId();
    }
}
```

**5. Controller**
```java
@RestController
@RequestMapping("/xxx")
public class XxxController {
    
    @Resource
    private XxxService xxxService;
    
    @PostMapping("/create")
    public CommonResult<Long> create(@RequestBody XxxCreateReqDTO reqDTO) {
        return CommonResult.success(xxxService.create(reqDTO));
    }
}
```

**6. DTO**
```java
@Data
public class XxxCreateReqDTO {
    private String name;
}
```

**7. VO**
```java
@Data
public class XxxRespVO {
    private Long id;
    private String name;
}
```

**8. Convert**
```java
@Mapper(componentModel = "spring")
public interface XxxConvert {
    XxxConvert INSTANCE = Mappers.getMapper(XxxConvert.class);
    
    XxxDO convert(XxxCreateReqDTO bean);
    XxxRespVO convert(XxxDO bean);
}
```

#### 步骤 4: 再次运行测试（绿灯）

```bash
mvn test -Dtest=XxxServiceTest#testCreate
```

确认通过。

### 3. 完整性检查

确认生成了 8 类产物：
- [x] DO
- [x] Mapper
- [x] Mapper.xml
- [x] Service
- [x] Controller
- [x] DTO
- [x] VO
- [x] Convert

### 4. 交付检查

遵守 `@rules/yuheng-delivery-check.md`：
- [x] 编译通过
- [x] 测试通过
- [x] 使用 `CommonResult`
- [x] 无重复能力

## 8类产物说明

| 产物 | 说明 | 必须 |
|------|------|------|
| DO | 数据库对象，带 `@TableName` | ✅ |
| Mapper | 继承 `BaseMapperX` | ✅ |
| Mapper.xml | MyBatis XML 映射 | ✅ |
| Service | 继承 `ServiceImpl` | ✅ |
| Controller | REST API 控制器 | ✅ |
| DTO | 请求参数对象 | ✅ |
| VO | 响应数据对象 | ✅ |
| Convert | 对象转换（MapStruct） | ✅ |

## 使用方法

```
输入：后端开发任务
AI：按 TDD + 8类产物生成完整后端代码...
```

## 相关规则

- `@rules/yuheng-backend-tdd.md` - TDD 强制
- `@rules/backend-code-style.md` - 代码规范
- `@rules/yuheng-framework-usage.md` - 框架使用
- `@rules/yuheng-delivery-check.md` - 交付检查
