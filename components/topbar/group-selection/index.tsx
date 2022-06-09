import { client } from "lib/client";
import { RootState, setCreateGroupModalOpen } from "lib/store";
import { useRouter } from "next/router";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import AsyncCreatableSelect from "react-select/async-creatable";
import Styles from "./group-selection.module.sass";

export function GroupSelection() {
	const dispatch = useDispatch();
	const router = useRouter();
	const currentGroupId =
		router.pathname === "/groups/[groupid]"
			? String(router.query.groupid)
			: undefined;
	return (
		<AsyncCreatableSelect
			isValidNewOption={() => {
				return !!client.clientUser;
			}}
			onChange={(value: any) => {
				if (value.value) {
					router.push(`/groups/${value.value}`);
				} else {
					router.push("/");
				}
			}}
			allowCreateWhileLoading={true}
			value={{
				value: currentGroupId,
				label: currentGroupId
					? client.groupsCache.get(currentGroupId)?.name
					: "Home",
			}}
			styles={{
				control: (provided) => ({
					...provided,
					minHeight: "100%",
					height: "100%"
				}),
				valueContainer: (provided) => ({
					...provided,
					height: "100%",
					minHeight: "100%",
					display: "flex",
					padding: "0px 6px",
				}),
				indicatorsContainer: (provided) => ({
					...provided,
					height: "100%",
					minHeight: "100%",
				}),
				// indicatorsContainer: () => ({ height: "100%" }),
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
				const mapped = result.map((group) => ({
					value: group.id,
					label: group.name,
				}));
				mapped.unshift({
					value: undefined as any,
					label: "Home",
				});
				return mapped;
			}}
		/>
	);
}
