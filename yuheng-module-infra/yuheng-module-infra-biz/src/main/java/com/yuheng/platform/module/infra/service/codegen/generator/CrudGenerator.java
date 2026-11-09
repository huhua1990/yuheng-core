package com.yuheng.platform.module.infra.service.codegen.generator;

import com.yuheng.platform.module.infra.service.codegen.engine.CodegenEngine;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * CRUD 代码生成器
 *
 * 生成标准的 8 类产物
 */
@Component
@RequiredArgsConstructor
public class CrudGenerator {

    private final CodegenEngine codegenEngine;

    /**
     * 生成完整 CRUD 代码
     *
     * @param config 生成配置
     * @return 生成的代码 Map<文件名, 代码内容>
     */
    public Map<String, String> generate(CrudGeneratorConfig config) {
        Map<String, String> result = new HashMap<>();

        // 1. 生成 DO
        result.put(config.getEntityName() + "DO.java", generateDO(config));

        // 2. 生成 Mapper
        result.put(config.getEntityName() + "Mapper.java", generateMapper(config));

        // 3. 生成 Mapper.xml
        if (config.getGenerateMapperXml()) {
            result.put(config.getEntityName() + "Mapper.xml", generateMapperXml(config));
        }

        // 4. 生成 Service
        result.put(config.getEntityName() + "Service.java", generateService(config));

        // 5. 生成 Controller
        result.put(config.getEntityName() + "Controller.java", generateController(config));

        // 6. 生成 DTO
        result.put(config.getEntityName() + "CreateReqDTO.java", generateCreateReqDTO(config));
        result.put(config.getEntityName() + "UpdateReqDTO.java", generateUpdateReqDTO(config));
        result.put(config.getEntityName() + "PageReqDTO.java", generatePageReqDTO(config));

        // 7. 生成 VO
        result.put(config.getEntityName() + "RespVO.java", generateRespVO(config));

        // 8. 生成 Convert
        result.put(config.getEntityName() + "Convert.java", generateConvert(config));

        // 9. 生成测试（可选）
        if (config.getGenerateTest()) {
            result.put(config.getEntityName() + "ServiceTest.java", generateServiceTest(config));
        }

        return result;
    }

    private String generateDO(CrudGeneratorConfig config) {
        Map<String, Object> dataModel = buildDataModel(config);
        return codegenEngine.generate("templates/java/do.ftl", dataModel);
    }

    private String generateMapper(CrudGeneratorConfig config) {
        Map<String, Object> dataModel = buildDataModel(config);
        return codegenEngine.generate("templates/java/mapper.ftl", dataModel);
    }

    private String generateMapperXml(CrudGeneratorConfig config) {
        Map<String, Object> dataModel = buildDataModel(config);
        return codegenEngine.generate("templates/xml/mapper.ftl", dataModel);
    }

    private String generateService(CrudGeneratorConfig config) {
        Map<String, Object> dataModel = buildDataModel(config);
        return codegenEngine.generate("templates/java/service.ftl", dataModel);
    }

    private String generateController(CrudGeneratorConfig config) {
        Map<String, Object> dataModel = buildDataModel(config);
        return codegenEngine.generate("templates/java/controller.ftl", dataModel);
    }

    private String generateCreateReqDTO(CrudGeneratorConfig config) {
        Map<String, Object> dataModel = buildDataModel(config);
        return codegenEngine.generate("templates/java/createReqDTO.ftl", dataModel);
    }

    private String generateUpdateReqDTO(CrudGeneratorConfig config) {
        Map<String, Object> dataModel = buildDataModel(config);
        return codegenEngine.generate("templates/java/updateReqDTO.ftl", dataModel);
    }

    private String generatePageReqDTO(CrudGeneratorConfig config) {
        Map<String, Object> dataModel = buildDataModel(config);
        return codegenEngine.generate("templates/java/pageReqDTO.ftl", dataModel);
    }

    private String generateRespVO(CrudGeneratorConfig config) {
        Map<String, Object> dataModel = buildDataModel(config);
        return codegenEngine.generate("templates/java/respVO.ftl", dataModel);
    }

    private String generateConvert(CrudGeneratorConfig config) {
        Map<String, Object> dataModel = buildDataModel(config);
        return codegenEngine.generate("templates/java/convert.ftl", dataModel);
    }

    private String generateServiceTest(CrudGeneratorConfig config) {
        Map<String, Object> dataModel = buildDataModel(config);
        return codegenEngine.generate("templates/test/serviceTest.ftl", dataModel);
    }

    private Map<String, Object> buildDataModel(CrudGeneratorConfig config) {
        Map<String, Object> dataModel = new HashMap<>();
        dataModel.put("config", config);
        dataModel.put("tableName", config.getTableName());
        dataModel.put("entityName", config.getEntityName());
        dataModel.put("entityNameLowerCamel", config.getEntityNameLowerCamel());
        dataModel.put("moduleName", config.getModuleName());
        dataModel.put("packageName", config.getPackageName());
        dataModel.put("author", config.getAuthor());
        dataModel.put("tableComment", config.getTableComment());
        dataModel.put("pkField", config.getPkField());
        dataModel.put("fields", config.getFields());
        return dataModel;
    }
}
