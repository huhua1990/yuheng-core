<script lang="ts" setup>
import { useAppStore } from '../../../../store/modules/app.ts'

import { propTypes } from '../../../../utils/propTypes.ts'
import { useDesign } from '../../../../hooks/web/useDesign.ts'
import type { ElementPlusSize } from '../../../../types/elementPlus.d.ts'

defineOptions({ name: 'SizeDropdown' })

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('size-dropdown')

defineProps({
  color: propTypes.string.def('')
})

const { t } = useI18n()

const appStore = useAppStore()

const sizeMap = computed(() => appStore.sizeMap)

const setCurrentSize = (size: ElementPlusSize) => {
  appStore.setCurrentSize(size)
}
</script>

<template>
  <ElDropdown :class="prefixCls" trigger="click" @command="setCurrentSize">
    <Icon :color="color" :size="18" class="cursor-pointer" icon="mdi:format-size" />
    <template #dropdown>
      <ElDropdownMenu>
        <ElDropdownItem v-for="item in sizeMap" :key="item" :command="item">
          {{ t(`size.${item}`) }}
        </ElDropdownItem>
      </ElDropdownMenu>
    </template>
  </ElDropdown>
</template>
