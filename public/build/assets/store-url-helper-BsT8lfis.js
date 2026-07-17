const g=(u,n,l={})=>n!=null&&n.enable_custom_domain||n!=null&&n.enable_custom_subdomain?route(u,l):route(u,{storeSlug:n==null?void 0:n.slug,...l});export{g};
