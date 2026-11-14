export default [{
  files: ['**/*.{js,mjs,jsx}'],
  languageOptions: {
    ecmaVersion: 'latest', sourceType: 'module', parserOptions: { ecmaFeatures: { jsx: true } },
    globals: Object.fromEntries(['window','document','localStorage','URL','URLSearchParams','Headers','fetch','AbortController','Uint8Array','TextDecoder','atob','btoa','crypto','navigator','Blob','prompt','setTimeout','clearTimeout','console','process','Buffer','structuredClone'].map(x=>[x,'readonly']))
  },
  rules: { 'no-undef': 'error', 'no-unreachable': 'error' }
}];
