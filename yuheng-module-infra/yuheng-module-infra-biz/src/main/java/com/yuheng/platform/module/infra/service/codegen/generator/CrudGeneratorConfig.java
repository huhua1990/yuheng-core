package com.yuheng.platform.module.infra.service.codegen.generator;

import lombok.Data;

import java.util.List;

/**
 * CRUD 生成器配置
 *
 * 定义 8 类产物的生成规则
 */
@Data
public class CrudGeneratorConfig {

    /**
     * 表名
     */
    private String tableName;

    /**
     * 实体名（大驼峰）
     */
    private String entityName;

    /**
     * 实体名（小驼峰）
     */
    private String entityNameLowerCamel;

    /**
     * 模块名
     */
    private String moduleName;

    /**
     * 包名
     */
    private String packageName;

    /**
     * 作者
     */
    private String author;

    /**
     * 表注释
     */
    private String tableComment;

    /**
     * 主键字段
     */
    private FieldConfig pkField;

    /**
     * 所有字段
     */
    private List<FieldConfig> fields;

    /**
     * 是否生成 Mapper.xml
     */
    private Boolean generateMapperXml = true;

    /**
     * 是否生成测试
     */
    private Boolean generateTest = true;

    /**
     * 字段配置
     */
    @Data
    public static class FieldConfig {
        /**
         * 字段名（数据库）
         */
        private String columnName;

        /**
         * 字段名（Java）
         */
        private String fieldName;

        /**
         * 字段类型（数据库）
         */
        private String columnType;

        /**
         * 字段类型（Java）
         */
        private String fieldType;

        /**
         * 字段注释
         */
        private String comment;

        /**
         * 是否主键
         */
        private Boolean isPk = false;

        /**
         * 是否必填
         */
        private Boolean isRequired = false;

        /**
         * 是否列表显示
         */
        private Boolean isList = true;

        /**
         * 是否查询条件
         */
        private Boolean isQuery = false;

        /**
         * 查询方式（eq/like/between）
         */
        private String queryType = "eq";
    }
}
