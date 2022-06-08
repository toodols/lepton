import { client } from "lib/client";
import { RootState, setCreateGroupModalOpen } from "lib/store";
import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Styles from "./group-modal.module.sass"
import Modal from "react-modal";
import Select from "react-select";

export function CreateGroupModal(){
	const dispatch = useDispatch();
	const {isOpen, name} = useSelector((state: RootState) => ({isOpen: state.main.createGroupModalOpen, name:state.main.createGroupModalNameValue}));

	let nameRef = useRef<HTMLInputElement>(null);
	let descriptionRef = useRef<HTMLTextAreaElement>(null);
	const [publicity, setPublicity] = useState({label: "Public", value: "public"});

	return <Modal ariaHideApp={false} className={Styles.create_group_modal} isOpen={isOpen} closeTimeoutMS={300} onRequestClose={()=>{
		dispatch(setCreateGroupModalOpen({open: false}));
	}}>
		<header>Create Group</header>
		<input ref={nameRef} defaultValue={name}/>
		<textarea ref={descriptionRef} defaultValue="Losers"></textarea>
		<Select value={publicity} onChange={(value)=>{
			setPublicity(value as any);
		}} options={[{
			label: "Public",
			value: "public"
		}, {
			label: "Private",
			value: "private"
		}]}/>
		<button onClick={()=>{
			client.createGroup({
				isPublic: publicity.value === "public",
				name: nameRef.current!.value,
				description: descriptionRef.current!.value,
			});
		}}>Create</button>
	</Modal>
}