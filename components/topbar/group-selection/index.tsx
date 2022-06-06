import { useState } from "react";
import Select from "react-select";
import AsyncCreatableSelect from 'react-select/async-creatable';
import Styles from "./group-selection.module.sass";

export function GroupSelection(){
	return <AsyncCreatableSelect className={Styles.group_selection} onCreateOption={(opt)=>{
		console.log(opt)
	}} isValidNewOption={(text)=>{
		return false;
	}} formatCreateLabel={(value)=>{
		return "Create Group \"value\""
	}} defaultOptions={true} loadOptions={(query)=>{
		Promise.resolve([]);
	}}/>
}