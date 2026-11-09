# 后端代码规范

## 包结构

- `com.yuheng.platform.framework/` - 框架层
- `com.yuheng.platform.module.{module}/` - 业务模块层
  - `controller/` - 控制器
  - `service/` - 服务层
  - `dal/` - 数据访问层
  - `convert/` - 对象转换
  - `enums/` - 枚举

---

## 命名规范

| 类型 | 命名规则 | 示例 |
|------|----------|------|
| Controller | `{Entity}Controller` | `UserController` |
| Service | `{Entity}Service` | `UserService` |
| Mapper | `{Entity}Mapper` | `UserMapper` |
| DO | `{Entity}DO` | `UserDO` |
| DTO | `{Entity}CreateReqDTO` / `{Entity}PageReqDTO` | `UserCreateReqDTO` |
| VO | `{Entity}RespVO` | `UserRespVO` |

---

## Controller 约定

- **所有接口统一 POST**，参数走 `@RequestBody`
- 标准 CRUD：`page` / `get` / `create` / `update` / `delete`
- 返回值统一 `CommonResult.success(data)` / `CommonResult.error("msg")`

```java
@RestController
@RequestMapping("/system/user")
public class UserController {
    
    @PostMapping("/page")
    public CommonResult<PageResult<UserRespVO>> page(@RequestBody UserPageReqDTO reqDTO) {
        return CommonResult.success(userService.page(reqDTO));
    }
}
```

---

## Service 约定

- 继承 `ServiceImpl<Mapper, DO>`
- 事务注解：`@Transactional(rollbackFor = Exception.class)`
- 业务异常：`throw new ServiceException(ErrorCodeConstants.XXX)`

```java
@Service
public class UserService extends ServiceImpl<UserMapper, UserDO> {
    
    @Transactional(rollbackFor = Exception.class)
    public Long create(UserCreateReqDTO reqDTO) {
        // 业务逻辑
        UserDO user = UserConvert.INSTANCE.convert(reqDTO);
        baseMapper.insert(user);
        return user.getId();
    }
}
```

---

## Mapper 约定

- 继承 `BaseMapperX<DO>`
- 自定义方法参数用 `@Param` 注解

```java
@Mapper
public interface UserMapper extends BaseMapperX<UserDO> {
    
    default PageResult<UserDO> selectPage(UserPageReqDTO reqDTO) {
        return selectPage(reqDTO, new LambdaQueryWrapperX<UserDO>()
            .likeIfPresent(UserDO::getUsername, reqDTO.getUsername())
            .eqIfPresent(UserDO::getStatus, reqDTO.getStatus()));
    }
}
```

---

## 实体类

| 类型 | 后缀 | 说明 |
|------|------|------|
| DO（数据对象） | `DO` | 对应数据库表 |
| DTO（请求参数） | `ReqDTO` / `PageReqDTO` | 请求参数 |
| VO（响应数据） | `RespVO` | 响应数据 |

---

## 返回值

统一 `CommonResult.success(data)` / `CommonResult.error("msg")`。禁止返回裸对象。

---

**规则版本**: v1.0  
**更新时间**: 2024-11-09
