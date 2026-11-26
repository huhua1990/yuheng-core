import { watch, ref } from 'vue'
import { isString } from '../../utils/is.ts'
import { useAppStoreWithOut } from '../../store/modules/app.ts'

const appStore = useAppStoreWithOut()

export const useTitle = (newTitle?: string) => {
  const { t } = useI18n()
  const title = ref(
    newTitle ? `${appStore.getTitle} - ${t(newTitle as string)}` : appStore.getTitle
  )

  watch(
    title,
    (n, o) => {
      if (isString(n) && n !== o && document) {
        document.title = n
      }
    },
    { immediate: true }
  )

  return title
}
