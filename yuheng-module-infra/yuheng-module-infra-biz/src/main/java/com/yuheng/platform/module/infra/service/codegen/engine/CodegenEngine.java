package com.yuheng.platform.module.infra.service.codegen.engine;

import java.util.Map;

/**
 * 代码生成引擎接口
 *
 * 支持多种模板引擎（FreeMarker、Velocity、Thymeleaf）
 */
public interface CodegenEngine {

    /**
     * 生成代码
     *
     * @param templatePath 模板路径
     * @param dataModel 数据模型
     * @return 生成的代码
     */
    String generate(String templatePath, Map<String, Object> dataModel);

    /**
     * 批量生成代码
     *
     * @param templates 模板映射 Map<文件名, 模板路径>
     * @param dataModel 数据模型
     * @return 生成的代码 Map<文件名, 代码内容>
     */
    Map<String, String> batchGenerate(Map<String, String> templates, Map<String, Object> dataModel);
}
