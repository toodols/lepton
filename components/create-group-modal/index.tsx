import { client } from "lib/client";
import { RootState, setCreateGroupModalOpen } from "lib/store";
import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Styles from "./group-modal.module.sass"
import Modal from "react-modal";

export function CreateGroupModal(){
	const dispatch = useDispatch();
	const {isOpen, name} = useSelector((state: RootState) => ({isOpen: state.main.createGroupModalOpen, name:state.main.createGroupModalNameValue}));

	return <Modal ariaHideApp={false} className={Styles.create_group_modal} isOpen={isOpen} closeTimeoutMS={300} onRequestClose={()=>{
		dispatch(setCreateGroupModalOpen({open: false}));
	}}>
		<header>Create Group</header>
		<input defaultValue={name}/>
		<button onClick={()=>{
			client.createGroup();
		}}>Create</button>
	</Modal>
}