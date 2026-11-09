package com.yuheng.platform.module.infra.service.codegen;

import com.yuheng.platform.framework.common.pojo.PageResult;
import com.yuheng.platform.module.infra.controller.admin.codegen.vo.*;
import com.yuheng.platform.module.infra.dal.dataobject.codegen.CodegenTableDO;

import java.util.List;
import java.util.Map;

/**
 * 代码生成服务接口
 *
 * 提供基于数据库表的代码生成能力
 * 遵循 Yuheng 8类产物标准
 */
public interface CodegenService {

    /**
     * 生成完整 CRUD 代码
     *
     * 生成 8 类产物：
     * 1. DO - 数据对象
     * 2. Mapper - MyBatis Mapper 接口
     * 3. Mapper.xml - MyBatis XML 映射
     * 4. Service - 服务层
     * 5. Controller - 控制器
     * 6. DTO - 请求参数对象
     * 7. VO - 响应数据对象
     * 8. Convert - 对象转换器
     *
     * @param tableId 表ID
     * @return 生成的代码 Map<文件名, 代码内容>
     */
    Map<String, String> generateCode(Long tableId);

    /**
     * 预览生成代码
     *
     * @param tableId 表ID
     * @return 预览代码 Map<文件名, 代码内容>
     */
    Map<String, String> previewCode(Long tableId);

    /**
     * 获取数据库表分页
     *
     * @param reqVO 查询条件
     * @return 表分页结果
     */
    PageResult<CodegenTableDO> getTablePage(CodegenTablePageReqVO reqVO);

    /**
     * 创建代码生成配置
     *
     * @param reqVO 创建请求
     * @return 表ID
     */
    Long createTable(CodegenCreateReqVO reqVO);

    /**
     * 更新代码生成配置
     *
     * @param reqVO 更新请求
     */
    void updateTable(CodegenUpdateReqVO reqVO);

    /**
     * 删除代码生成配置
     *
     * @param tableId 表ID
     */
    void deleteTable(Long tableId);

    /**
     * 同步数据库表结构
     *
     * @param tableId 表ID
     */
    void syncTable(Long tableId);

    /**
     * 获取表详情
     *
     * @param tableId 表ID
     * @return 表详情
     */
    CodegenTableDO getTable(Long tableId);
}
