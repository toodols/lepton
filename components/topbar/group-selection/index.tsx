import { client } from "lib/client";
import { setCreateGroupModalOpen } from "lib/store";
import { useState } from "react";
import { useDispatch } from "react-redux";
import Select from "react-select";
import AsyncCreatableSelect from 'react-select/async-creatable';
import Styles from "./group-selection.module.sass";

export function GroupSelection(){
	const dispatch = useDispatch();
	return <AsyncCreatableSelect className={Styles.group_selection} classNamePrefix="react-select" onCreateOption={(opt)=>{
		dispatch(setCreateGroupModalOpen({open: true, name: opt}));
	}} formatCreateLabel={(value)=>{
		return `Create Group "${value}"`
	}} defaultOptions={true} loadOptions={async (query)=>{
		client.searchGroups(query)
		return [];
	}}/>
}