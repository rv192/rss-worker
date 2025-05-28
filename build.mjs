import esbuild from 'esbuild';
import fs from 'fs/promises';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';

function buildWorker({ entry, out, debug, external } = {}) {
	return esbuild.build({
		plugins: [NodeModulesPolyfillPlugin()],
		platform: 'browser',
		conditions: ['worker', 'browser'],
		entryPoints: [entry],
		sourcemap: true,
		outfile: out,
		external, // 这个 external 参数会接收我们传入的外部依赖列表
		logLevel: 'warning',
		format: 'esm',
		target: 'es2022',
		bundle: true,
		minify: !debug,
		define: {
			IS_CLOUDFLARE_WORKER: 'true',
		},
		loader: {
			'.html': 'text',
			'.css': 'text',
			'.txt': 'text',
		},
		metafile: true,
		legalComments: 'external',
	});
}

let result = await buildWorker({
	entry: './src/worker.js',
	out: './dist/worker.js',
	debug: false,
    // 在这里添加 cloudflare:sockets 到 external 数组中
	external: ['cloudflare:sockets'],
});

if (result.metafile) {
	// use https://esbuild.github.io/analyze/ to analyses
	await fs.writeFile('./dist/metafile.json', JSON.stringify(result.metafile));
}
