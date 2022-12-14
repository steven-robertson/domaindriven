require('esbuild').build({
    entryPoints: ['src/index.jsx'],
    outfile: 'public/dist/bundle.js',
    bundle: true,
    sourcemap: true,
    define: {
        DEBUG: 'true',
        CODESPACE_NAME: process.env.CODESPACE_NAME
            ? JSON.stringify(process.env.CODESPACE_NAME) : 'undefined',
        GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN: process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN
            ? JSON.stringify(process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN) : 'undefined'
    },
    watch: {
        onRebuild(error, result) {
            if (error) console.error('watch build failed:', error)
            else console.log('watch build succeeded:', result)
        },
    },
}).then(result => {
    console.log('watching...')
})
