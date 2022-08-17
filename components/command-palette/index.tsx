import { RootState, setCommandPaletteModalOpen, setCreateGroupModalOpen, setCreatePostModalOpen, setSettingsModalOpen, store } from "lib/store"
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Styles from "./command-palette.module.sass";

interface Command {
	title: string;
	action: () => void;	
}

interface SearchResult<T> {
	value: T
}

class CommandsRegistry {
	registeredCommands: Command[] = [];
	register(command: Command) {
		this.registeredCommands.push(command);
	}
	search(text: string): SearchResult<Command>[] {
		const results: SearchResult<Command>[] = [];
		for (const command of this.registeredCommands) {
			if (command.title.toLowerCase().startsWith(text.toLowerCase())) {
				results.push({
					value: command
				})
			}
		}
		return results;
	}
}

export const commandsRegistry = new CommandsRegistry();
commandsRegistry.register({
	title: "Create Post",
	action: () => {
		store.dispatch(setCreatePostModalOpen(true));
	}
})
commandsRegistry.register({
	title: "Open Settings",
	action: () => {
		store.dispatch(setSettingsModalOpen(true));
	}
})

export function CommandPalette(){
	const inputRef = useRef<HTMLInputElement>(null);
	const [selected, setSelected] = useState(0);
	const [results, setResults] = useState<SearchResult<Command>[]>([]);
	const dispatch = useDispatch();
	const isOpen = useSelector((state: RootState) => state.main.commandPaletteModalOpen);
	function reset(){
		inputRef.current!.value = "";
		setSelected(0);
		setResults([]);
		dispatch(setCommandPaletteModalOpen(false));
	}

	useEffect(()=>{
		if (isOpen) {
			inputRef.current?.focus();
			setResults(commandsRegistry.search(""));
		}
	}, [isOpen]);

	if (isOpen) {
	return <div className={Styles.commandPalette}>
		<input onBlur={()=>{
			reset()
		}} ref={inputRef} onKeyDown={(event)=>{
			if (event.key === "ArrowDown") {
				setSelected((selected+1)%results.length);
				event.preventDefault();
			} else if (event.key === "ArrowUp") {
				setSelected((selected+results.length-1)%results.length);
				event.preventDefault();
			} else if (event.key === "Enter") {
				results[selected].value.action();
				reset();
				event.preventDefault();
			}
		}} onInput={(event)=>{
			const value = event.currentTarget.value;
			setResults(commandsRegistry.search(value));
			setSelected(0);
		}}></input>
		<div className={Styles.results}>
			{results.map((result, index) => {
				return <button data-selected={index===selected} key={index} onClick={() => {
					result.value.action();
					reset();
					dispatch(setCommandPaletteModalOpen(false));
				}}>{result.value.title}</button>
			})}
		</div>
	</div>
	} else {
		return <></>
	}
}