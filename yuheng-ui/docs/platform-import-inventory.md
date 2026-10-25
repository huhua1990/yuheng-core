# Task 4 平台导入清单与边界分类

来源基线：`/Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3`（只读）。本阶段明确为**平台契约骨架/第一阶段**：建立包边界、可安装应用壳层、公共页面契约、插件注册和可审计边界；完整视觉迁移、基线全部组件行为和业务页面迁移留给后续任务。简化实现不会被描述为已完成全量迁移。

## 扫描范围与统计

使用 `rg` 扫描 `layout`、`components`、`styles` 和 `views/Login|Error|Redirect|Profile` 的 `@/` 导入，并逐文件记录归属：

```bash
rg -n "from ['\"]@/(api|store|router|views|components|utils|config|hooks)" \
  /Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3/src/layout \
  /Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3/src/components \
  /Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3/src/styles \
  /Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3/src/views/Login \
  /Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3/src/views/Error \
  /Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3/src/views/Redirect \
  /Users/huhua/study/ai/yuheng/yudao-ui-admin-vue3/src/views/Profile
```

| 基线目录 | 文件数 | 本阶段迁入 | 延后或排除 |
| --- | ---: | ---: | ---: |
| `src/layout/` | 48 | 见逐文件清单 | 见状态列 |
| `src/components/` | 330 | 见逐文件清单 | 见状态列 |
| `src/styles/` | 7 | 见逐文件清单 | 见状态列 |
| `src/views/Login/` | 11 | 见逐文件清单 | 见状态列 |
| `src/views/Error/` | 3 | 见逐文件清单 | 见状态列 |
| `src/views/Redirect/` | 1 | 见逐文件清单 | 见状态列 |
| `src/views/Profile/` | 7 | 见逐文件清单 | 见状态列 |

## 逐文件审计清单

状态含义：`迁入` 表示已重写到对应 `yuheng-ui/src` 输出路径；`延后` 表示仍由只读基线提供对照，后续继续迁移；`排除` 表示发现业务域依赖，归消费端所有。

| 基线文件 | 分类与输出路径 |
| --- | --- |
| `layout/Layout.vue` | 迁入（src/layout/Layout.vue） |
| `layout/components/AppView.vue` | 迁入（src/layout/components/AppView.vue） |
| `layout/components/Breadcrumb/index.ts` | 延后：平台壳层视觉迁移 |
| `layout/components/Breadcrumb/src/Breadcrumb.vue` | 延后：平台壳层视觉迁移 |
| `layout/components/Breadcrumb/src/helper.ts` | 延后：平台壳层视觉迁移 |
| `layout/components/Collapse/index.ts` | 延后：平台壳层视觉迁移 |
| `layout/components/Collapse/src/Collapse.vue` | 延后：平台壳层视觉迁移 |
| `layout/components/ContextMenu/index.ts` | 延后：平台壳层视觉迁移 |
| `layout/components/ContextMenu/src/ContextMenu.vue` | 延后：平台壳层视觉迁移 |
| `layout/components/Footer/index.ts` | 延后：平台壳层视觉迁移 |
| `layout/components/Footer/src/Footer.vue` | 延后：平台壳层视觉迁移 |
| `layout/components/LocaleDropdown/index.ts` | 延后：平台壳层视觉迁移 |
| `layout/components/LocaleDropdown/src/LocaleDropdown.vue` | 延后：平台壳层视觉迁移 |
| `layout/components/Logo/index.ts` | 延后：平台壳层视觉迁移 |
| `layout/components/Logo/src/Logo.vue` | 延后：平台壳层视觉迁移 |
| `layout/components/Menu/index.ts` | 延后：平台壳层视觉迁移 |
| `layout/components/Menu/src/Menu.vue` | 延后：平台壳层视觉迁移 |
| `layout/components/Menu/src/components/useRenderMenuItem.tsx` | 延后：平台壳层视觉迁移 |
| `layout/components/Menu/src/components/useRenderMenuTitle.tsx` | 延后：平台壳层视觉迁移 |
| `layout/components/Menu/src/helper.ts` | 延后：平台壳层视觉迁移 |
| `layout/components/Menu/src/menuRoute.ts` | 延后：平台壳层视觉迁移 |
| `layout/components/Message/index.ts` | 延后：平台壳层视觉迁移 |
| `layout/components/Message/src/Message.vue` | 延后：平台壳层视觉迁移 |
| `layout/components/Screenfull/index.ts` | 延后：平台壳层视觉迁移 |
| `layout/components/Screenfull/src/Screenfull.vue` | 延后：平台壳层视觉迁移 |
| `layout/components/Setting/index.ts` | 延后：平台壳层视觉迁移 |
| `layout/components/Setting/src/Setting.vue` | 延后：平台壳层视觉迁移 |
| `layout/components/Setting/src/components/ColorRadioPicker.vue` | 延后：平台壳层视觉迁移 |
| `layout/components/Setting/src/components/InterfaceDisplay.vue` | 延后：平台壳层视觉迁移 |
| `layout/components/Setting/src/components/LayoutRadioPicker.vue` | 延后：平台壳层视觉迁移 |
| `layout/components/Setting/src/useSetting.ts` | 延后：平台壳层视觉迁移 |
| `layout/components/SizeDropdown/index.ts` | 延后：平台壳层视觉迁移 |
| `layout/components/SizeDropdown/src/SizeDropdown.vue` | 延后：平台壳层视觉迁移 |
| `layout/components/TabMenu/index.ts` | 延后：平台壳层视觉迁移 |
| `layout/components/TabMenu/src/TabMenu.vue` | 延后：平台壳层视觉迁移 |
| `layout/components/TabMenu/src/helper.ts` | 延后：平台壳层视觉迁移 |
| `layout/components/TagsView/index.ts` | 延后：平台壳层视觉迁移 |
| `layout/components/TagsView/src/TagsView.vue` | 延后：平台壳层视觉迁移 |
| `layout/components/TagsView/src/helper.ts` | 延后：平台壳层视觉迁移 |
| `layout/components/TenantVisit/index.vue` | 延后：平台壳层视觉迁移 |
| `layout/components/ThemeSwitch/index.ts` | 延后：平台壳层视觉迁移 |
| `layout/components/ThemeSwitch/src/ThemeSwitch.vue` | 延后：平台壳层视觉迁移 |
| `layout/components/ToolHeader.vue` | 延后：平台壳层视觉迁移 |
| `layout/components/UserInfo/index.ts` | 延后：平台壳层视觉迁移 |
| `layout/components/UserInfo/src/UserInfo.vue` | 延后：平台壳层视觉迁移 |
| `layout/components/UserInfo/src/components/LockDialog.vue` | 延后：平台壳层视觉迁移 |
| `layout/components/UserInfo/src/components/LockPage.vue` | 延后：平台壳层视觉迁移 |
| `layout/components/useRenderLayout.tsx` | 延后：平台壳层视觉迁移 |
| `components/AppLinkInput/AppLinkSelectDialog.vue` | 排除：业务 API/页面依赖，留消费端 |
| `components/AppLinkInput/data.ts` | 延后：通用组件视觉/行为迁移 |
| `components/AppLinkInput/index.vue` | 延后：通用组件视觉/行为迁移 |
| `components/Backtop/index.ts` | 迁入（src/components/Backtop.vue） |
| `components/Backtop/src/Backtop.vue` | 延后：通用组件视觉/行为迁移 |
| `components/Card/index.ts` | 延后：通用组件视觉/行为迁移 |
| `components/Card/src/CardTitle.vue` | 延后：通用组件视觉/行为迁移 |
| `components/ColorInput/index.vue` | 延后：通用组件视觉/行为迁移 |
| `components/ConfigGlobal/index.ts` | 迁入（src/components/ConfigGlobal.vue） |
| `components/ConfigGlobal/src/ConfigGlobal.vue` | 延后：通用组件视觉/行为迁移 |
| `components/ContentDetailWrap/index.ts` | 迁入（src/components/ContentDetailWrap.vue） |
| `components/ContentDetailWrap/src/ContentDetailWrap.vue` | 延后：通用组件视觉/行为迁移 |
| `components/ContentWrap/index.ts` | 迁入（src/components/ContentWrap.vue） |
| `components/ContentWrap/src/ContentWrap.vue` | 延后：通用组件视觉/行为迁移 |
| `components/CountTo/index.ts` | 延后：通用组件视觉/行为迁移 |
| `components/CountTo/src/CountTo.vue` | 延后：通用组件视觉/行为迁移 |
| `components/Crontab/index.ts` | 延后：通用组件视觉/行为迁移 |
| `components/Crontab/src/Crontab.vue` | 延后：通用组件视觉/行为迁移 |
| `components/Cropper/index.ts` | 延后：通用组件视觉/行为迁移 |
| `components/Cropper/src/CopperModal.vue` | 延后：通用组件视觉/行为迁移 |
| `components/Cropper/src/Cropper.vue` | 延后：通用组件视觉/行为迁移 |
| `components/Cropper/src/CropperAvatar.vue` | 延后：通用组件视觉/行为迁移 |
| `components/Cropper/src/types.ts` | 延后：通用组件视觉/行为迁移 |
| `components/DeptSelectForm/index.vue` | 延后：通用组件视觉/行为迁移 |
| `components/Descriptions/index.ts` | 延后：通用组件视觉/行为迁移 |
| `components/Descriptions/src/Descriptions.vue` | 延后：通用组件视觉/行为迁移 |
| `components/Descriptions/src/DescriptionsItemLabel.vue` | 延后：通用组件视觉/行为迁移 |
| `components/Dialog/index.ts` | 迁入（src/components/Dialog.vue） |
| `components/Dialog/src/Dialog.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DictTag/index.ts` | 延后：通用组件视觉/行为迁移 |
| `components/DictTag/src/DictTag.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/ComponentContainer.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/ComponentContainerProperty.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/ComponentLibrary.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/Carousel/config.ts` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/Carousel/index.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/Carousel/property.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/CouponCard/component.tsx` | 排除：业务 API/页面依赖，留消费端 |
| `components/DiyEditor/components/mobile/CouponCard/config.ts` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/CouponCard/index.vue` | 排除：业务 API/页面依赖，留消费端 |
| `components/DiyEditor/components/mobile/CouponCard/property.vue` | 排除：业务 API/页面依赖，留消费端 |
| `components/DiyEditor/components/mobile/Divider/config.ts` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/Divider/index.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/Divider/property.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/FloatingActionButton/config.ts` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/FloatingActionButton/index.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/FloatingActionButton/property.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/HotZone/components/HotZoneEditDialog/controller.ts` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/HotZone/components/HotZoneEditDialog/index.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/HotZone/config.ts` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/HotZone/index.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/HotZone/property.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/ImageBar/config.ts` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/ImageBar/index.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/ImageBar/property.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/MagicCube/config.ts` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/MagicCube/index.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/MagicCube/property.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/MenuGrid/config.ts` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/MenuGrid/index.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/MenuGrid/property.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/MenuList/config.ts` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/MenuList/index.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/MenuList/property.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/MenuSwiper/config.ts` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/MenuSwiper/index.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/MenuSwiper/property.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/NavigationBar/components/CellProperty.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/NavigationBar/config.ts` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/NavigationBar/index.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/NavigationBar/property.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/NoticeBar/config.ts` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/NoticeBar/index.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/NoticeBar/property.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/PageConfig/config.ts` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/PageConfig/property.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/Popover/config.ts` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/Popover/index.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/Popover/property.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/ProductCard/config.ts` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/ProductCard/index.vue` | 排除：业务 API/页面依赖，留消费端 |
| `components/DiyEditor/components/mobile/ProductCard/property.vue` | 排除：业务 API/页面依赖，留消费端 |
| `components/DiyEditor/components/mobile/ProductList/config.ts` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/ProductList/index.vue` | 排除：业务 API/页面依赖，留消费端 |
| `components/DiyEditor/components/mobile/ProductList/property.vue` | 排除：业务 API/页面依赖，留消费端 |
| `components/DiyEditor/components/mobile/PromotionArticle/config.ts` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/PromotionArticle/index.vue` | 排除：业务 API/页面依赖，留消费端 |
| `components/DiyEditor/components/mobile/PromotionArticle/property.vue` | 排除：业务 API/页面依赖，留消费端 |
| `components/DiyEditor/components/mobile/PromotionCombination/config.ts` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/PromotionCombination/index.vue` | 排除：业务 API/页面依赖，留消费端 |
| `components/DiyEditor/components/mobile/PromotionCombination/property.vue` | 排除：业务 API/页面依赖，留消费端 |
| `components/DiyEditor/components/mobile/PromotionPoint/config.ts` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/PromotionPoint/index.vue` | 排除：业务 API/页面依赖，留消费端 |
| `components/DiyEditor/components/mobile/PromotionPoint/property.vue` | 排除：业务 API/页面依赖，留消费端 |
| `components/DiyEditor/components/mobile/PromotionSeckill/config.ts` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/PromotionSeckill/index.vue` | 排除：业务 API/页面依赖，留消费端 |
| `components/DiyEditor/components/mobile/PromotionSeckill/property.vue` | 排除：业务 API/页面依赖，留消费端 |
| `components/DiyEditor/components/mobile/SearchBar/config.ts` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/SearchBar/index.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/SearchBar/property.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/TabBar/config.ts` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/TabBar/index.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/TabBar/property.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/TitleBar/config.ts` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/TitleBar/index.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/TitleBar/property.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/UserCard/config.ts` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/UserCard/index.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/UserCard/property.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/UserCoupon/config.ts` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/UserCoupon/index.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/UserCoupon/property.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/UserOrder/config.ts` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/UserOrder/index.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/UserOrder/property.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/UserWallet/config.ts` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/UserWallet/index.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/UserWallet/property.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/VideoPlayer/config.ts` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/VideoPlayer/index.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/VideoPlayer/property.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/components/mobile/index.ts` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/index.vue` | 延后：通用组件视觉/行为迁移 |
| `components/DiyEditor/util.ts` | 延后：通用组件视觉/行为迁移 |
| `components/DocAlert/index.vue` | 延后：通用组件视觉/行为迁移 |
| `components/Draggable/index.vue` | 延后：通用组件视觉/行为迁移 |
| `components/Echart/index.ts` | 延后：通用组件视觉/行为迁移 |
| `components/Echart/src/Echart.vue` | 延后：通用组件视觉/行为迁移 |
| `components/Editor/index.ts` | 延后：通用组件视觉/行为迁移 |
| `components/Editor/src/Editor.vue` | 延后：通用组件视觉/行为迁移 |
| `components/Error/index.ts` | 迁入（src/components/Error.vue） |
| `components/Error/src/Error.vue` | 延后：通用组件视觉/行为迁移 |
| `components/FilePreview/index.ts` | 延后：通用组件视觉/行为迁移 |
| `components/FilePreview/src/FilePreview.vue` | 延后：通用组件视觉/行为迁移 |
| `components/Form/index.ts` | 迁入（src/components/Form.vue） |
| `components/Form/src/Form.vue` | 延后：通用组件视觉/行为迁移 |
| `components/Form/src/componentMap.ts` | 延后：通用组件视觉/行为迁移 |
| `components/Form/src/components/useRenderCheckbox.tsx` | 延后：通用组件视觉/行为迁移 |
| `components/Form/src/components/useRenderRadio.tsx` | 延后：通用组件视觉/行为迁移 |
| `components/Form/src/components/useRenderSelect.tsx` | 延后：通用组件视觉/行为迁移 |
| `components/Form/src/helper.ts` | 延后：通用组件视觉/行为迁移 |
| `components/Form/src/types.ts` | 延后：通用组件视觉/行为迁移 |
| `components/FormCreate/index.ts` | 延后：通用组件视觉/行为迁移 |
| `components/FormCreate/src/components/AreaSelect.vue` | 延后：通用组件视觉/行为迁移 |
| `components/FormCreate/src/components/DeptSelect.vue` | 延后：通用组件视觉/行为迁移 |
| `components/FormCreate/src/components/DictSelect.vue` | 延后：通用组件视觉/行为迁移 |
| `components/FormCreate/src/components/IframeComponent.vue` | 延后：通用组件视觉/行为迁移 |
| `components/FormCreate/src/components/useApiSelect.tsx` | 延后：通用组件视觉/行为迁移 |
| `components/FormCreate/src/config/index.ts` | 延后：通用组件视觉/行为迁移 |
| `components/FormCreate/src/config/selectRule.ts` | 延后：通用组件视觉/行为迁移 |
| `components/FormCreate/src/config/useAreaSelectRule.ts` | 延后：通用组件视觉/行为迁移 |
| `components/FormCreate/src/config/useDictSelectRule.ts` | 延后：通用组件视觉/行为迁移 |
| `components/FormCreate/src/config/useEditorRule.ts` | 延后：通用组件视觉/行为迁移 |
| `components/FormCreate/src/config/useIframeRule.ts` | 延后：通用组件视觉/行为迁移 |
| `components/FormCreate/src/config/useSelectRule.ts` | 延后：通用组件视觉/行为迁移 |
| `components/FormCreate/src/config/useUploadFileRule.ts` | 延后：通用组件视觉/行为迁移 |
| `components/FormCreate/src/config/useUploadImgRule.ts` | 延后：通用组件视觉/行为迁移 |
| `components/FormCreate/src/config/useUploadImgsRule.ts` | 延后：通用组件视觉/行为迁移 |
| `components/FormCreate/src/type/index.ts` | 延后：通用组件视觉/行为迁移 |
| `components/FormCreate/src/useFormCreateDesigner.ts` | 延后：通用组件视觉/行为迁移 |
| `components/FormCreate/src/utils/index.ts` | 延后：通用组件视觉/行为迁移 |
| `components/Highlight/index.ts` | 延后：通用组件视觉/行为迁移 |
| `components/Highlight/src/Highlight.vue` | 延后：通用组件视觉/行为迁移 |
| `components/IFrame/index.ts` | 延后：通用组件视觉/行为迁移 |
| `components/IFrame/src/IFrame.vue` | 延后：通用组件视觉/行为迁移 |
| `components/Icon/index.ts` | 迁入（src/components/Icon.vue） |
| `components/Icon/src/Icon.vue` | 延后：通用组件视觉/行为迁移 |
| `components/Icon/src/IconSelect.vue` | 延后：通用组件视觉/行为迁移 |
| `components/Icon/src/data.ts` | 延后：通用组件视觉/行为迁移 |
| `components/ImageViewer/index.ts` | 延后：通用组件视觉/行为迁移 |
| `components/ImageViewer/src/ImageViewer.vue` | 延后：通用组件视觉/行为迁移 |
| `components/ImageViewer/src/types.ts` | 延后：通用组件视觉/行为迁移 |
| `components/Infotip/index.ts` | 延后：通用组件视觉/行为迁移 |
| `components/Infotip/src/Infotip.vue` | 延后：通用组件视觉/行为迁移 |
| `components/InputPassword/index.ts` | 延后：通用组件视觉/行为迁移 |
| `components/InputPassword/src/InputPassword.vue` | 延后：通用组件视觉/行为迁移 |
| `components/InputWithColor/index.vue` | 延后：通用组件视觉/行为迁移 |
| `components/JsonEditor/index.ts` | 延后：通用组件视觉/行为迁移 |
| `components/JsonEditor/src/JsonEditor.vue` | 延后：通用组件视觉/行为迁移 |
| `components/JsonEditor/types/index.ts` | 延后：通用组件视觉/行为迁移 |
| `components/MagicCubeEditor/index.vue` | 延后：通用组件视觉/行为迁移 |
| `components/MagicCubeEditor/util.ts` | 延后：通用组件视觉/行为迁移 |
| `components/Map/index.ts` | 延后：通用组件视觉/行为迁移 |
| `components/Map/src/MapDialog.vue` | 延后：通用组件视觉/行为迁移 |
| `components/Map/src/utils.ts` | 延后：通用组件视觉/行为迁移 |
| `components/MarkdownView/index.vue` | 延后：通用组件视觉/行为迁移 |
| `components/OperateLogV2/index.ts` | 延后：通用组件视觉/行为迁移 |
| `components/OperateLogV2/src/OperateLogV2.vue` | 延后：通用组件视觉/行为迁移 |
| `components/Pagination/index.vue` | 迁入（src/components/Pagination.vue） |
| `components/Qrcode/index.ts` | 延后：通用组件视觉/行为迁移 |
| `components/Qrcode/src/Qrcode.vue` | 延后：通用组件视觉/行为迁移 |
| `components/RouterSearch/index.vue` | 延后：通用组件视觉/行为迁移 |
| `components/Search/index.ts` | 延后：通用组件视觉/行为迁移 |
| `components/Search/src/Search.vue` | 延后：通用组件视觉/行为迁移 |
| `components/ShortcutDateRangePicker/index.vue` | 延后：通用组件视觉/行为迁移 |
| `components/SimpleProcessDesignerV2/src/NodeHandler.vue` | 延后：通用组件视觉/行为迁移 |
| `components/SimpleProcessDesignerV2/src/ProcessNodeTree.vue` | 延后：通用组件视觉/行为迁移 |
| `components/SimpleProcessDesignerV2/src/SimpleProcessDesigner.vue` | 排除：业务 API/页面依赖，留消费端 |
| `components/SimpleProcessDesignerV2/src/SimpleProcessModel.vue` | 延后：通用组件视觉/行为迁移 |
| `components/SimpleProcessDesignerV2/src/SimpleProcessViewer.vue` | 延后：通用组件视觉/行为迁移 |
| `components/SimpleProcessDesignerV2/src/consts.ts` | 排除：业务 API/页面依赖，留消费端 |
| `components/SimpleProcessDesignerV2/src/index.ts` | 延后：通用组件视觉/行为迁移 |
| `components/SimpleProcessDesignerV2/src/node.ts` | 排除：业务 API/页面依赖，留消费端 |
| `components/SimpleProcessDesignerV2/src/nodes/ChildProcessNode.vue` | 延后：通用组件视觉/行为迁移 |
| `components/SimpleProcessDesignerV2/src/nodes/CopyTaskNode.vue` | 延后：通用组件视觉/行为迁移 |
| `components/SimpleProcessDesignerV2/src/nodes/DelayTimerNode.vue` | 延后：通用组件视觉/行为迁移 |
| `components/SimpleProcessDesignerV2/src/nodes/EndEventNode.vue` | 延后：通用组件视觉/行为迁移 |
| `components/SimpleProcessDesignerV2/src/nodes/ExclusiveNode.vue` | 延后：通用组件视觉/行为迁移 |
| `components/SimpleProcessDesignerV2/src/nodes/InclusiveNode.vue` | 延后：通用组件视觉/行为迁移 |
| `components/SimpleProcessDesignerV2/src/nodes/ParallelNode.vue` | 延后：通用组件视觉/行为迁移 |
| `components/SimpleProcessDesignerV2/src/nodes/RouterNode.vue` | 延后：通用组件视觉/行为迁移 |
| `components/SimpleProcessDesignerV2/src/nodes/StartUserNode.vue` | 延后：通用组件视觉/行为迁移 |
| `components/SimpleProcessDesignerV2/src/nodes/TriggerNode.vue` | 延后：通用组件视觉/行为迁移 |
| `components/SimpleProcessDesignerV2/src/nodes/UserTaskNode.vue` | 延后：通用组件视觉/行为迁移 |
| `components/SimpleProcessDesignerV2/src/nodes-config/ChildProcessNodeConfig.vue` | 排除：业务 API/页面依赖，留消费端 |
| `components/SimpleProcessDesignerV2/src/nodes-config/ConditionNodeConfig.vue` | 延后：通用组件视觉/行为迁移 |
| `components/SimpleProcessDesignerV2/src/nodes-config/CopyTaskNodeConfig.vue` | 延后：通用组件视觉/行为迁移 |
| `components/SimpleProcessDesignerV2/src/nodes-config/DelayTimerNodeConfig.vue` | 延后：通用组件视觉/行为迁移 |
| `components/SimpleProcessDesignerV2/src/nodes-config/RouterNodeConfig.vue` | 延后：通用组件视觉/行为迁移 |
| `components/SimpleProcessDesignerV2/src/nodes-config/StartUserNodeConfig.vue` | 延后：通用组件视觉/行为迁移 |
| `components/SimpleProcessDesignerV2/src/nodes-config/TriggerNodeConfig.vue` | 延后：通用组件视觉/行为迁移 |
| `components/SimpleProcessDesignerV2/src/nodes-config/UserTaskNodeConfig.vue` | 延后：通用组件视觉/行为迁移 |
| `components/SimpleProcessDesignerV2/src/nodes-config/components/Condition.vue` | 延后：通用组件视觉/行为迁移 |
| `components/SimpleProcessDesignerV2/src/nodes-config/components/ConditionDialog.vue` | 延后：通用组件视觉/行为迁移 |
| `components/SimpleProcessDesignerV2/src/nodes-config/components/HttpRequestParamSetting.vue` | 延后：通用组件视觉/行为迁移 |
| `components/SimpleProcessDesignerV2/src/nodes-config/components/HttpRequestSetting.vue` | 延后：通用组件视觉/行为迁移 |
| `components/SimpleProcessDesignerV2/src/nodes-config/components/UserTaskListener.vue` | 延后：通用组件视觉/行为迁移 |
| `components/SimpleProcessDesignerV2/src/utils.ts` | 延后：通用组件视觉/行为迁移 |
| `components/SimpleProcessDesignerV2/theme/iconfont.ttf` | 延后：通用组件视觉/行为迁移 |
| `components/SimpleProcessDesignerV2/theme/iconfont.woff` | 延后：通用组件视觉/行为迁移 |
| `components/SimpleProcessDesignerV2/theme/iconfont.woff2` | 延后：通用组件视觉/行为迁移 |
| `components/SimpleProcessDesignerV2/theme/simple-process-designer.scss` | 延后：通用组件视觉/行为迁移 |
| `components/Sticky/index.ts` | 延后：通用组件视觉/行为迁移 |
| `components/Sticky/src/Sticky.vue` | 延后：通用组件视觉/行为迁移 |
| `components/SummaryCard/index.vue` | 延后：通用组件视觉/行为迁移 |
| `components/Table/index.ts` | 迁入（src/components/Table.vue） |
| `components/Table/src/Table.vue` | 延后：通用组件视觉/行为迁移 |
| `components/Table/src/TableSelectForm.vue` | 延后：通用组件视觉/行为迁移 |
| `components/Table/src/helper.ts` | 延后：通用组件视觉/行为迁移 |
| `components/Table/src/types.ts` | 延后：通用组件视觉/行为迁移 |
| `components/Tinyflow/Tinyflow.vue` | 延后：通用组件视觉/行为迁移 |
| `components/Tinyflow/ui/index.css` | 延后：通用组件视觉/行为迁移 |
| `components/Tinyflow/ui/index.d.ts` | 延后：通用组件视觉/行为迁移 |
| `components/Tinyflow/ui/index.js` | 延后：通用组件视觉/行为迁移 |
| `components/Tinyflow/ui/index.umd.js` | 延后：通用组件视觉/行为迁移 |
| `components/Tooltip/index.ts` | 延后：通用组件视觉/行为迁移 |
| `components/Tooltip/src/Tooltip.vue` | 延后：通用组件视觉/行为迁移 |
| `components/UploadFile/index.ts` | 迁入（src/components/UploadFile.vue） |
| `components/UploadFile/src/UploadFile.vue` | 延后：通用组件视觉/行为迁移 |
| `components/UploadFile/src/UploadImg.vue` | 延后：通用组件视觉/行为迁移 |
| `components/UploadFile/src/UploadImgs.vue` | 延后：通用组件视觉/行为迁移 |
| `components/UploadFile/src/useUpload.ts` | 延后：通用组件视觉/行为迁移 |
| `components/UserSelectForm/index.vue` | 延后：通用组件视觉/行为迁移 |
| `components/Verifition/index.ts` | 延后：通用组件视觉/行为迁移 |
| `components/Verifition/src/Verify/VerifyPictureWord.vue` | 延后：通用组件视觉/行为迁移 |
| `components/Verifition/src/Verify/VerifyPoints.vue` | 延后：通用组件视觉/行为迁移 |
| `components/Verifition/src/Verify/VerifySlide.vue` | 延后：通用组件视觉/行为迁移 |
| `components/Verifition/src/Verify/index.ts` | 延后：通用组件视觉/行为迁移 |
| `components/Verifition/src/Verify.vue` | 延后：通用组件视觉/行为迁移 |
| `components/Verifition/src/utils/ase.ts` | 延后：通用组件视觉/行为迁移 |
| `components/Verifition/src/utils/util.ts` | 延后：通用组件视觉/行为迁移 |
| `components/VerticalButtonGroup/index.vue` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/designer/ProcessDesigner.vue` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/designer/ProcessViewer.vue` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/designer/index.ts` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/designer/index2.ts` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/designer/plugins/content-pad/contentPadProvider.js` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/designer/plugins/content-pad/index.js` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/designer/plugins/defaultEmpty.js` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/designer/plugins/descriptor/activitiDescriptor.json` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/designer/plugins/descriptor/camundaDescriptor.json` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/designer/plugins/descriptor/flowableDescriptor.json` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/designer/plugins/extension-moddle/activiti/activitiExtension.js` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/designer/plugins/extension-moddle/activiti/index.js` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/designer/plugins/extension-moddle/camunda/extension.js` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/designer/plugins/extension-moddle/camunda/index.js` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/designer/plugins/extension-moddle/flowable/flowableExtension.js` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/designer/plugins/extension-moddle/flowable/index.js` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/designer/plugins/palette/CustomPalette.js` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/designer/plugins/palette/index.js` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/designer/plugins/palette/paletteProvider.js` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/designer/plugins/translate/customTranslate.js` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/designer/plugins/translate/zh.js` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/index.ts` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/palette/ProcessPalette.vue` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/penal/PropertiesPanel.vue` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/penal/base/ElementBaseInfo.vue` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/penal/custom-config/ElementCustomConfig.vue` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/penal/custom-config/components/BoundaryEventTimer.vue` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/penal/custom-config/components/UserTaskCustomConfig.vue` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/penal/custom-config/data.ts` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/penal/flow-condition/FlowCondition.vue` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/penal/form/ElementForm.vue` | 排除：业务 API/页面依赖，留消费端 |
| `components/bpmnProcessDesigner/package/penal/index.js` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/penal/listeners/ElementListeners.vue` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/penal/listeners/ProcessListenerDialog.vue` | 排除：业务 API/页面依赖，留消费端 |
| `components/bpmnProcessDesigner/package/penal/listeners/UserTaskListeners.vue` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/penal/listeners/template.js` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/penal/listeners/utilSelf.ts` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/penal/multi-instance/ElementMultiInstance.vue` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/penal/other/ElementOtherConfig.vue` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/penal/properties/ElementProperties.vue` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/penal/signal-message/SignalAndMessage.vue` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/penal/task/ElementTask.vue` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/penal/task/data.ts` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/penal/task/task-components/CallActivity.vue` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/penal/task/task-components/HttpHeaderEditor.vue` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/penal/task/task-components/ProcessExpressionDialog.vue` | 排除：业务 API/页面依赖，留消费端 |
| `components/bpmnProcessDesigner/package/penal/task/task-components/ReceiveTask.vue` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/penal/task/task-components/ScriptTask.vue` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/penal/task/task-components/ServiceTask.vue` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/penal/task/task-components/UserTask.vue` | 排除：业务 API/页面依赖，留消费端 |
| `components/bpmnProcessDesigner/package/penal/time-event-config/CycleConfig.vue` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/penal/time-event-config/DurationConfig.vue` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/penal/time-event-config/TimeEventConfig.vue` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/theme/element-variables.scss` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/theme/index.scss` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/theme/process-designer.scss` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/theme/process-panel.scss` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/package/utils.ts` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/src/highlight/index.js` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/src/modules/custom-renderer/CustomRenderer.js` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/src/modules/custom-renderer/index.js` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/src/modules/rules/CustomRules.js` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/src/modules/rules/index.js` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/src/translations.ts` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/src/utils/directive/clickOutSide.js` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/src/utils/index.js` | 延后：通用组件视觉/行为迁移 |
| `components/bpmnProcessDesigner/src/utils/xml2json.js` | 延后：通用组件视觉/行为迁移 |
| `components/index.ts` | 延后：通用组件视觉/行为迁移 |
| `styles/FormCreate/fonts/fontello.woff` | 延后：平台壳层视觉迁移 |
| `styles/FormCreate/index.scss` | 延后：平台壳层视觉迁移 |
| `styles/global.module.scss` | 延后：平台壳层视觉迁移 |
| `styles/index.scss` | 延后：平台壳层视觉迁移 |
| `styles/theme.scss` | 延后：平台壳层视觉迁移 |
| `styles/var.css` | 延后：平台壳层视觉迁移 |
| `styles/variables.scss` | 延后：平台壳层视觉迁移 |
| `views/Login/Login.vue` | 迁入（src/pages/Login/Login.vue） |
| `views/Login/SocialLogin.vue` | 延后：平台公共页行为迁移（保留基线只读） |
| `views/Login/components/ForgetPasswordForm.vue` | 延后：平台公共页行为迁移（保留基线只读） |
| `views/Login/components/LoginForm.vue` | 延后：平台公共页行为迁移（保留基线只读） |
| `views/Login/components/LoginFormTitle.vue` | 延后：平台公共页行为迁移（保留基线只读） |
| `views/Login/components/MobileForm.vue` | 延后：平台公共页行为迁移（保留基线只读） |
| `views/Login/components/QrCodeForm.vue` | 延后：平台公共页行为迁移（保留基线只读） |
| `views/Login/components/RegisterForm.vue` | 延后：平台公共页行为迁移（保留基线只读） |
| `views/Login/components/SSOLogin.vue` | 延后：平台公共页行为迁移（保留基线只读） |
| `views/Login/components/index.ts` | 延后：平台公共页行为迁移（保留基线只读） |
| `views/Login/components/useLogin.ts` | 延后：平台公共页行为迁移（保留基线只读） |
| `views/Error/403.vue` | 迁入（src/pages/Error/403.vue） |
| `views/Error/404.vue` | 迁入（src/pages/Error/404.vue） |
| `views/Error/500.vue` | 迁入（src/pages/Error/500.vue） |
| `views/Redirect/Redirect.vue` | 迁入（src/pages/Redirect/Redirect.vue） |
| `views/Profile/Index.vue` | 迁入（src/pages/Profile/Index.vue） |
| `views/Profile/components/BasicInfo.vue` | 延后：平台公共页行为迁移（保留基线只读） |
| `views/Profile/components/ProfileUser.vue` | 延后：平台公共页行为迁移（保留基线只读） |
| `views/Profile/components/ResetPwd.vue` | 延后：平台公共页行为迁移（保留基线只读） |
| `views/Profile/components/UserAvatar.vue` | 延后：平台公共页行为迁移（保留基线只读） |
| `views/Profile/components/UserSocial.vue` | 延后：平台公共页行为迁移（保留基线只读） |
| `views/Profile/components/index.ts` | 延后：平台公共页行为迁移（保留基线只读） |

## 迁移边界

- 平台壳层：`src/layout/Layout.vue`、`src/layout/index.ts`、`src/layout/components/AppView.vue`，其余布局文件按逐文件清单延后视觉迁移。
- 公共页面：`src/pages/Login/**`、`src/pages/Error/**`、`src/pages/Redirect/**`、`src/pages/Profile/**` 已建立稳定入口；登录/个人中心的完整后端交互和基线视觉细节留后续任务。
- 无业务依赖的通用组件：`ConfigGlobal`、`ContentWrap`、`ContentDetailWrap`、`Form`、`Table`、`Pagination`、`Dialog`、`UploadFile`、`Icon`、`Error`、`Backtop` 已建立包内契约；其余组件逐文件迁移。
- 平台插件：Element Plus、Vue I18n、`v-focus` 指令、平台全局组件注册和图标注册表契约（`src/plugins/index.ts`）。
- 引用 `@/api/bpm/**`、`@/views/crm/**` 以及其它业务域 API、Store、页面的组件，留在消费端。`DiyEditor`、BPMN/流程设计器、商城/CRM/ERP/FMS 等业务组件不进入平台包。
- `views/infra/demo/**` 仅作为样例或测试页面，不进入平台默认路由。

`check-boundary.mjs` 会扫描 `yuheng-ui/src`，发现基线路径、消费端路径或业务导入时返回失败并打印文件与行号。