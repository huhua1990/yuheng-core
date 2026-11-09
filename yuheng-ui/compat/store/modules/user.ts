import { computed, reactive } from 'vue'
import { useUserStore as usePlatformUserStore } from 'yuheng-ui'
import { getPlatformContext } from '../../runtime'
const adapters = new WeakMap<object, any>()
export function useUserStore() {
 const context=getPlatformContext(); const source=usePlatformUserStore(context.pinia)
 let adapter=adapters.get(source)
 if (!adapter) {
  const user=computed(() => source.userInfo ?? { id:0, nickname:'', avatar:'', deptId:0 })
  adapter=reactive({
   user, getUser:user,
   permissions:computed(() => new Set(source.permissions)), getPermissions:computed(() => new Set(source.permissions)),
   roles:computed(() => source.roles), getRoles:computed(() => source.roles),
   getIsSetUser:computed(() => source.loaded),
   setUserInfoAction:() => source.fetchUserInfo(context),
   setUserAvatarAction:async (avatar:string) => { if(source.userInfo) source.userInfo.avatar=avatar },
   setUserNicknameAction:async (nickname:string) => { if(source.userInfo) source.userInfo.nickname=nickname },
   loginOut:() => source.logout(context), resetState:() => { source.userInfo=null;source.loaded=false;source.permissions=[];source.roles=[] }
  }); adapters.set(source,adapter)
 }
 return adapter
}
export const useUserStoreWithOut=useUserStore
