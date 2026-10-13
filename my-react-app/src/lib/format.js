export const githubId = (url) => url?.replace(/\/+$/, '').split('/').pop()
export const formatPhone = (n) => n.replace(/^(\d{3})(\d{4})(\d{4})$/, '$1-$2-$3')
export const isExternal = (href) => /^https?:/.test(href)
export const scrollToId = (id) => document.getElementById(id)?.scrollIntoView()
