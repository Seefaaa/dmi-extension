import React, { useEffect, useRef } from 'react';

const dmiSize = Math.max(window.dmi.width, window.dmi.height);
const scale = 2;

export default function App() {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (containerRef.current) {
			containerRef.current.style.setProperty('--dmi-size', `${dmiSize}px`);
			containerRef.current.style.setProperty('--scale', scale.toString());
		}

		const setBoxSize = () => {
			if (containerRef.current) {
				const clientWidth = document.getElementById('root')!.clientWidth;

				const boxWidth = dmiSize * scale + 36; // 36 = line-height + padding * 2 + border * 2
				const columnCount = Math.floor(clientWidth / boxWidth);
				const extraWidth = clientWidth - boxWidth * columnCount;
				const finalWidth = Math.floor((extraWidth / columnCount + boxWidth - 18.01) * 100) / 100; // 18.01 = padding * 2 + border * 2 + 0.01

				containerRef.current.style.setProperty('--box-size', `${finalWidth}px`);
			}
		};

		setBoxSize();

		window.addEventListener('resize', setBoxSize);

		return () => {
			window.removeEventListener('resize', setBoxSize);
		};
	}, [containerRef]);

	const nameSet = new Set<string>();

	return (
		<div ref={containerRef}>
			{window.dmi.states.map((state, index) => (
				<State key={index} state={state} set={nameSet} />
			))}
		</div>
	);
}

type StateProps = {
	state: (typeof window.dmi.states)[number];
	set: Set<string>;
};

function State({ state, set }: StateProps) {
	const noName = !state.name;
	const duplicate = set.has(state.name);

	if (!duplicate) {
		set.add(state.name);
	}

	return (
		<div
			title={state.name || '(no name)'}
			{...{
				...(noName && { 'no-name': '' }),
				...(duplicate && { duplicate: '' }),
			}}
		>
			{state.frames.length > 0 ? <img src={state.frames[0]} /> : <div />}
			{state.name ? <span>{state.name}</span> : <span>{'no name'}</span>}
		</div>
	);
}
