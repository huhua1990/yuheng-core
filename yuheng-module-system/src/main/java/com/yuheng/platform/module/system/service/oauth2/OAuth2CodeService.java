package com.yuheng.platform.module.system.service.oauth2;

import com.yuheng.platform.module.system.dal.dataobject.oauth2.OAuth2CodeDO;

import java.util.List;

/**
 * OAuth2.0 授权码 Service 接口
 *
 * 从功能上，和 Spring Security OAuth 的 JdbcAuthorizationCodeServices 的功能，提供授权码的操作
 *
 * @author 芋道源码
 */
public interface OAuth2CodeService {

    /**
     * 创建授权码
     *
     * 参考 JdbcAuthorizationCodeServices 的 createAuthorizationCode 方法
     *
     * @param userId 用户编号
     * @param userType 用户类型
     * @param clientId 客户端编号
     * @param scopes 授权范围
     * @param redirectUri 重定向 URI
     * @param state 状态
     * @return 授权码的信息
     */
    OAuth2CodeDO createAuthorizationCode(Long userId, Integer userType, String clientId,
                                         List<String> scopes, String redirectUri, String state);

    /**
     * 查询并锁定授权码，调用方必须在事务中完成后续校验和消费。
     *
     * @param code 授权码
     * @return 授权码信息
     */
    OAuth2CodeDO getAuthorizationCodeForUpdate(String code);

    /**
     * 删除已经完成校验的授权码。
     *
     * @param id 授权码编号
     */
    void deleteAuthorizationCode(Long id);

}
