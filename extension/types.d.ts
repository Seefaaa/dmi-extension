
export type Dmi = {
	width: number;
	height: number;
	states: State[];
}

export type State = {
	name: string,
	dirs: number,
	frames: string[],
	frame_count: number,
	delays: number[],
	loop: number,
	rewind: bool,
	movement: bool,
	hotspots: string[],
}

declare global {
	interface Window {
		dmi: Dmi | {};
	}
}
