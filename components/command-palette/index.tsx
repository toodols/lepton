import { client } from "../../lib/client";
import { RootState, setCreateGroupModalOpen, setCreatePostModalOpen, setSettingsModalOpen, setSignInModalOpen, store } from "lib/store"
import { removeAllAccounts } from "../../lib/store/clientslice";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Styles from "./command-palette.module.sass";
import Router from 'next/router'

interface CommandProps {
	title: string;
	condition?: (this: Command)=>boolean;
	action: (this: Command) => void;	
}

class Command {
	run(){
		this.action.bind(this)();
	}
	
	constructor(public registry: CommandsRegistry, public title: string, private action: (this: Command) => void, public condition: () => boolean = ()=>true) {

	}
}

interface SearchResult<T> {
	value: T
}

class CommandsRegistry {
	registeredCommands: Command[] = [];
	register(props: CommandProps) {
		const command = new Command(this, props.title, props.action, props.condition);
		this.registeredCommands.push(command);
	}
	search(text: string): SearchResult<Command>[] {
		const results: SearchResult<Command>[] = [];
		for (const command of this.registeredCommands) {
			if (command.title.toLowerCase().includes(text.toLowerCase()) && command.condition.bind(command)()) {
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
	title: "Go Home",
	condition: ()=>Router.pathname !== "/",
	action: () => {
		Router.push("/");
	}
})
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
commandsRegistry.register({
	title: "Create Group",
	condition: ()=>Router.pathname==="/",
	action: () => {
		store.dispatch(setCreateGroupModalOpen({open: true, name: "New Group"}));
	}
});
commandsRegistry.register({
	title: "Sign Out",
	condition: ()=>!!client.clientUser,
	action: () => {
		store.dispatch(removeAllAccounts());
		client.signOut();
	}
})
commandsRegistry.register({
	title: "Add Account",
	condition: ()=>!!client.clientUser,
	action: () => {
		store.dispatch(setSignInModalOpen(true));
	}
})

commandsRegistry.register({
	title: "Sign In",
	condition: ()=>!client.clientUser,
	action: () => {
		store.dispatch(setSignInModalOpen(true));
	}
})
commandsRegistry.register({
	title: "Go To Profile",
	condition: ()=>{
		return client.clientUser!=null&&Router.pathname!==`/users/[userid]`
	},
	action: () => {
		Router.push(`/users/${client.clientUser!.id}`);
	}
})

export function CommandPalette(){
	const inputRef = useRef<HTMLInputElement>(null);
	const [selected, setSelected] = useState(0);
	const [results, setResults] = useState<SearchResult<Command>[]>([]);
	const dispatch = useDispatch();
	const [isOpen, setIsOpen] = useState(false);

	function reset(){
		inputRef.current!.value = "";
		setSelected(0);
		setResults([]);
		setIsOpen(false);
	}

	useEffect(()=>{
		if (isOpen) {
			inputRef.current?.focus();
			setResults(commandsRegistry.search(""));
		}
	}, [isOpen]);

	useEffect(()=>{
		document.addEventListener("keydown", (event)=>{
			const ctrl = event.ctrlKey || event.metaKey;
			if (ctrl && event.shiftKey && event.key === "p") {
				setIsOpen(true);
			}
		});
	}, [])

	if (isOpen) {
	return <div className={Styles.commandPalette}>
		<input placeholder="Type in command." onBlur={()=>{
			reset()
		}} ref={inputRef} onKeyDown={(event)=>{
			if (event.key === "ArrowDown") {
				setSelected((selected+1)%results.length);
				event.preventDefault();
			} else if (event.key === "ArrowUp") {
				setSelected((selected+results.length-1)%results.length);
				event.preventDefault();
			} else if (event.key === "Enter") {
				results[selected].value.run();
				reset();
				event.preventDefault();
			} else if (event.key === "Escape") {
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
					result.value.run();
					reset();
				}}>{result.value.title}</button>
			})}
		</div>
	</div>
	} else {
		return <></>
	}
}