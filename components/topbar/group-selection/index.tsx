import { client } from "lib/client";
import { RootState, setCreateGroupModalOpen } from "lib/store";
import { setViewingGroupId } from "lib/store/dataslice";
import { useRouter } from "next/router";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import AsyncCreatableSelect from "react-select/async-creatable";
import Styles from "./group-selection.module.sass";

export function GroupSelection() {
	const dispatch = useDispatch();
	const currentGroupId = useSelector((state: RootState) => state.data.viewingGroupId);
	const router = useRouter();
	return (
		<AsyncCreatableSelect
			isValidNewOption={() => {
				return !!client.clientUser;
			}}
			onChange={(value: any) => {
				console.log(value)
				dispatch(setViewingGroupId({id: value.value, router}));
			}}
			value={{
				value: currentGroupId,
				label: currentGroupId?client.groupsCache.get(currentGroupId)?.name:"..."
			}}
			className={Styles.group_selection}
			classNamePrefix="react-select"
			onCreateOption={(opt) => {
				dispatch(setCreateGroupModalOpen({ open: true, name: opt }));
			}}
			formatCreateLabel={(value) => {
				return `Create Group "${value}"`;
			}}
			defaultOptions={true}
			loadOptions={async (query) => {
				const result = await client.searchGroups(query);
				return result.map((group) => ({
					value: group.id,
					label: group.name,
				}));
			}}
		/>
	);
}
