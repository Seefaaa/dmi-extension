import { join } from 'node:path';

import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import {
	chromeExtension,
	simpleReloader,
} from 'rollup-plugin-chrome-extension';
import { emptyDir } from 'rollup-plugin-empty-dir';
import replace from '@rollup/plugin-replace';
import wasm from '@rollup/plugin-wasm';
import css from 'rollup-plugin-import-css';

const isProduction = process.env.NODE_ENV === 'production';

export default {
	input: 'extension/manifest.ts',
	output: {
		dir: 'dist',
		format: 'esm',
		chunkFileNames: join('chunks', '[name]-[hash].js'),
	},
	plugins: [
		replace({
			'process.env.NODE_ENV': isProduction
				? JSON.stringify('production')
				: JSON.stringify('development'),
			preventAssignment: true,
		}),
		css(),
		chromeExtension(),
		resolve(),
		commonjs(),
		typescript(),
		wasm({ targetEnv: 'browser', fileName: 'background/[name][extname]' }),
		// Empties the output dir before a new build
		emptyDir(),
	],
};
