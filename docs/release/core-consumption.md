# Yuheng core 消费方式

`yuheng-core` 的 Java 发布入口是 `com.yuheng:yuheng-server`，版本由 `yuheng-dependencies` BOM 统一管理。Java 包名首版仍保持 `cn.iocoder.*`，避免把坐标迁移与包名迁移叠加。

消费端只声明版本化依赖：

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>com.yuheng</groupId>
            <artifactId>yuheng-dependencies</artifactId>
            <version>0.1.0-SNAPSHOT</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<dependency>
    <groupId>com.yuheng</groupId>
    <artifactId>yuheng-server</artifactId>
</dependency>
```

消费端 bootstrap 负责 Spring Boot 启动类、运行配置、Liquibase 入口、数据库连接、业务模块和最终打包。消费端不能引用 `yuheng-core` 源码目录，也不能直接依赖 core 内部 starter 作为替代稳定入口。

当前版本线为 `0.1.0-SNAPSHOT`，因为 Maven 私有镜像和完整离线依赖尚未恢复，独立构建结果必须以验证报告为准。
