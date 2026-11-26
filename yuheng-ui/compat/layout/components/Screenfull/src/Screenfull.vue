<script lang="ts" setup>
import { Icon } from '../../../../components/Icon/index.ts'
import { useFullscreen } from '@vueuse/core'
import { propTypes } from '../../../../utils/propTypes.ts'
import { useDesign } from '../../../../hooks/web/useDesign.ts'

defineOptions({ name: 'ScreenFull' })

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('screenfull')

defineProps({
  color: propTypes.string.def('')
})

const { toggle, isFullscreen } = useFullscreen()

const toggleFullscreen = () => {
  toggle()
}
</script>

<template>
  <div :class="prefixCls" @click="toggleFullscreen">
    <Icon
      :color="color"
      :icon="isFullscreen ? 'zmdi:fullscreen-exit' : 'zmdi:fullscreen'"
      :size="18"
    />
  </div>
</template>
