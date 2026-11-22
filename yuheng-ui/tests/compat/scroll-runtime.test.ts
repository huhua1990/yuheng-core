import { describe, expect, it, vi } from 'vitest'
import { useScrollTo } from '../../compat/hooks/event/useScrollTo'

describe('compat scrolling', () => {
  it('scrolls a tag into view without injected Vue globals', () => {
    const el = { scrollLeft: 0 } as HTMLElement
    const callback = vi.fn()
    const scroll = useScrollTo({ el, to: 40, position: 'scrollLeft', duration: 20, callback })
    scroll.start()
    expect(el.scrollLeft).toBe(40)
    expect(callback).toHaveBeenCalledOnce()
    scroll.stop()
  })
})
