import{w as i}from"./app-CSxTN6z_.js";import{r}from"./ui-DxVcf8IW.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=[["rect",{x:"3",y:"8",width:"18",height:"4",rx:"1",key:"bkv52"}],["path",{d:"M12 8v13",key:"1c76mn"}],["path",{d:"M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7",key:"6wjy6b"}],["path",{d:"M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5",key:"1ihvrl"}]],v=i("Gift",u);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=[["circle",{cx:"8",cy:"21",r:"1",key:"jimo8o"}],["circle",{cx:"19",cy:"21",r:"1",key:"13723u"}],["path",{d:"M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12",key:"9zh506"}]],k=i("ShoppingCart",h);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=[["path",{d:"M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2",key:"wrbu53"}],["path",{d:"M15 18H9",key:"1lyqi6"}],["path",{d:"M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14",key:"lysw3i"}],["circle",{cx:"17",cy:"18",r:"2",key:"332jqn"}],["circle",{cx:"7",cy:"18",r:"2",key:"19iecd"}]],I=i("Truck",w);function b(){const[l,e]=r.useState(null),[c,t]=r.useState(!1),[d,a]=r.useState(!1);return r.useEffect(()=>{const n=()=>window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===!0||document.referrer.includes("android-app://");e(null),t(!1),a(n());const s=p=>{p.preventDefault(),e(p),t(!0),a(!1)},o=()=>{a(!0),t(!1),e(null)};return window.removeEventListener("beforeinstallprompt",s),window.removeEventListener("appinstalled",o),window.addEventListener("beforeinstallprompt",s),window.addEventListener("appinstalled",o),()=>{window.removeEventListener("beforeinstallprompt",s),window.removeEventListener("appinstalled",o)}},[window.location.pathname]),{isInstallable:c,isInstalled:d,install:async()=>{if(!l)return"unavailable";try{await l.prompt();const{outcome:n}=await l.userChoice;return e(null),t(!1),n==="accepted"&&a(!0),n}catch{return"unavailable"}},canInstall:c&&!d}}export{v as G,k as S,I as T,b as u};
