import React from 'react';

export default function App() {
	return (
		<div>
			{window.dmi.states.map((state, index) => (
				<div key={index} title={state.name} >
					{state.frames.length > 0 ? (
						<img src={state.frames[0]} />
					) : (
						<div style={{ width: window.dmi.width, height: window.dmi.height }} />
					)}
					<span style={{ maxWidth: window.dmi.width }}>{state.name}</span>
				</div>
			))}
		</div>
	);
}
