import { describe, expect, it } from 'vitest'
import { handleTree2 } from '../../compat/utils/tree'

describe('handleTree2 compatibility', () => {
  it('returns an empty tree when the requested root has no children', () => {
    expect(handleTree2([{ id: 'child', parentId: 'other' }], 'id', 'parentId', 'children', '/')).toEqual([])
  })
})
