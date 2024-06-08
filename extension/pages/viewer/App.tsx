import React from 'react';

const cssVariables = {
	'--dmi-size': `${Math.max(window.dmi.width, window.dmi.height)}px`,
	'--scale': '2',
} as React.CSSProperties;

export default function App() {
	const names = new Set();

	return (
		<div style={cssVariables}>
			{window.dmi.states.map((state, index) => {
				const props: Record<string, any> = {};

				if (!names.has(state.name)) {
					names.add(state.name);
				} else {
					props['duplicate'] = '';
				}

				if (!state.name) {
					props['no-name'] = '';
				}

				return (
					<div key={index} title={state.name || '(no name)'} {...props}>
						{state.frames.length > 0 ? <img src={state.frames[0]} /> : <div />}
						{state.name ? <span>{state.name}</span> : <span>{'no name'}</span>}
					</div>
				);
			})}
		</div>
	);
}
