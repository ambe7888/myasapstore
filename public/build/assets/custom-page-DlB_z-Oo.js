import{j as r}from"./ui-DxVcf8IW.js";import{K as _,L as k}from"./app-C3_NKeZC.js";import F from"./Header-fLSzrKJb.js";import C from"./Footer-BsrLRoJG.js";import{u as N}from"./use-favicon-C10VvRKD.js";import"./vendor-CxtKjBZA.js";import"./utils-DCj7OOX3.js";import"./menu-Dwgcbf-9.js";import"./mail-BtE6rHq0.js";import"./phone-Ep_MDdTx.js";import"./map-pin-F5OEA1js.js";import"./instagram-Jpr1efnU.js";import"./twitter-B5QMPWIS.js";function z(){var m,p,l,i,s,g,b,u,d,x,v,y,f;const h=`
    /* Fix form inputs */
    .custom-page-content input:focus, 
    .custom-page-content textarea:focus {
      --tw-ring-color: var(--primary-color) !important;
      border-color: var(--primary-color) !important;
    }
    
    /* Fix color issues */
    .custom-page-content .bg-blue-50 { background-color: rgba(var(--primary-color-rgb), 0.1) !important; }
    .custom-page-content .bg-purple-50 { background-color: rgba(var(--secondary-color-rgb), 0.1) !important; }
    .custom-page-content .bg-green-50 { background-color: rgba(var(--accent-color-rgb), 0.1) !important; }
    .custom-page-content .bg-red-50 { background-color: rgba(var(--accent-color-rgb), 0.1) !important; }
    
    .custom-page-content .text-blue-600 { color: var(--primary-color) !important; }
    .custom-page-content .text-purple-600 { color: var(--secondary-color) !important; }
    .custom-page-content .text-green-600 { color: var(--accent-color) !important; }
    .custom-page-content .text-red-600 { color: var(--accent-color) !important; }
    
    .custom-page-content .border-blue-500 { border-color: var(--primary-color) !important; }
    .custom-page-content .border-purple-500 { border-color: var(--secondary-color) !important; }
    .custom-page-content .border-green-500 { border-color: var(--accent-color) !important; }
    .custom-page-content .border-red-500 { border-color: var(--accent-color) !important; }
    
    .custom-page-content .bg-blue-600 { background-color: var(--primary-color) !important; }
    .custom-page-content .bg-purple-600 { background-color: var(--secondary-color) !important; }
    .custom-page-content .bg-green-600 { background-color: var(--accent-color) !important; }
    .custom-page-content .bg-red-500 { background-color: var(--accent-color) !important; }
    
    /* Fix border colors */
    .custom-page-content .border-blue-200 { border-color: rgba(var(--primary-color-rgb), 0.2) !important; }
    .custom-page-content .border-green-200 { border-color: rgba(var(--accent-color-rgb), 0.2) !important; }
    
    /* Fix hover states */
    .custom-page-content .hover:bg-blue-700:hover { background-color: var(--primary-color) !important; opacity: 0.9; }
    
    /* Fix form button */
    .custom-page-content .bg-blue-600 { background-color: var(--primary-color) !important; }
  `,{page:c,customPages:j=[],settings:o}=_().props,e=((p=(m=o==null?void 0:o.config_sections)==null?void 0:m.theme)==null?void 0:p.primary_color)||"#3b82f6",a=((i=(l=o==null?void 0:o.config_sections)==null?void 0:l.theme)==null?void 0:i.secondary_color)||"#8b5cf6",n=((g=(s=o==null?void 0:o.config_sections)==null?void 0:s.theme)==null?void 0:g.accent_color)||"#10b77f";return N(),r.jsxs(r.Fragment,{children:[r.jsxs(k,{children:[r.jsx("title",{children:c.meta_title||c.title}),c.meta_description&&r.jsx("meta",{name:"description",content:c.meta_description}),r.jsx("style",{children:h})]}),r.jsxs("div",{className:"min-h-screen bg-white",style:{"--primary-color":e,"--secondary-color":a,"--accent-color":n,"--primary-color-rgb":((b=e.replace("#","").match(/.{2}/g))==null?void 0:b.map(t=>parseInt(t,16)).join(", "))||"59, 130, 246","--secondary-color-rgb":((u=a.replace("#","").match(/.{2}/g))==null?void 0:u.map(t=>parseInt(t,16)).join(", "))||"139, 92, 246","--accent-color-rgb":((d=n.replace("#","").match(/.{2}/g))==null?void 0:d.map(t=>parseInt(t,16)).join(", "))||"16, 185, 129"},children:[r.jsx(F,{settings:o,customPages:j,sectionData:((v=(x=o==null?void 0:o.config_sections)==null?void 0:x.sections)==null?void 0:v.find(t=>t.key==="header"))||{},brandColor:e}),r.jsx("main",{className:"pt-16",children:r.jsx("div",{className:"container mx-auto px-4 py-12",children:r.jsxs("div",{className:"max-w-4xl mx-auto",children:[r.jsx("h1",{className:"text-4xl font-bold mb-8 text-gray-900",children:c.title}),r.jsx("div",{className:"custom-page-content prose prose-lg max-w-none",dangerouslySetInnerHTML:{__html:c.content}})]})})}),r.jsx(C,{settings:o,sectionData:((f=(y=o==null?void 0:o.config_sections)==null?void 0:y.sections)==null?void 0:f.find(t=>t.key==="footer"))||{},brandColor:e})]})]})}export{z as default};
