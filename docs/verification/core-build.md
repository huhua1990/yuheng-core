# yuheng-core 独立构建验证

验证日期：2026-10-25
工程：`/Users/huhua/study/ai/yuheng/yuheng-core`

## 结构验证

已建立以下发布工程：

- `pom.xml`
- `yuheng-dependencies`
- `yuheng-framework`（15 个 starter 子模块）
- `yuheng-module-infra`
- `yuheng-module-system`
- `yuheng-server`

所有 Maven XML 均可被 Python XML 解析器读取，framework 的 module 路径均有对应 POM。源代码统计保持为 framework 15 个 starter、system 435 个 Java 文件、infra 210 个 Java 文件。

坐标策略：

- Maven groupId：`com.yuheng`；
- 稳定入口：`com.yuheng:yuheng-server`；
- Java 包名：继续使用 `cn.iocoder.*`；
- 消费端启动类、运行配置、数据库迁移和业务模块：留在 `yuheng-demo`。

## Maven 验证

使用临时 settings 指向 Aliyun mirror 和本地 Maven repository：

```bash
mvn -s /tmp/yuheng-maven-settings.xml clean package -DskipTests \
  -f /Users/huhua/study/ai/yuheng/yuheng-core/pom.xml
mvn -s /tmp/yuheng-maven-settings.xml install -DskipTests \
  -f /Users/huhua/study/ai/yuheng/yuheng-core/pom.xml
```

结果：两个命令均通过，`com.yuheng:yuheng-server:0.1.0-SNAPSHOT` 已安装到：
`/Users/huhua/environment/mavenRepository`。

完整测试：

```bash
mvn -s /tmp/yuheng-maven-settings.xml test \
  -f /Users/huhua/study/ai/yuheng/yuheng-core/pom.xml
```

结果：存在 1 个已知基线失败：
`yuheng-module-infra` 的
`CodegenServiceImplTest.testUpdateCodegen_success` 对随机 `moduleName` 的断言不稳定。
本次执行统计为 235 个测试、1 个失败、10 个跳过。
该测试在源仓库中保持相同实现和断言，本次没有修改业务逻辑；其余测试没有发现新的失败。

## 发布边界验证

- `yuheng-demo` 只声明 `com.yuheng:yuheng-server:0.1.0-SNAPSHOT`；
- 消费端不引用 `yuheng-core` 源码目录或 core 内部模块；
- 治理 bundle、manifest 和同步脚本由独立 Python 验证命令检查。
