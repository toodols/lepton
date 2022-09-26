import { RootState } from "store";
import { editSettings } from "store/settings";
import { useDispatch, useSelector } from "react-redux";
import { Section, SettingsSelect } from ".";

export function Appearance() {
	const settingValues = useSelector(
		(state: RootState) => state.settings.settings
	);
	const dispatch = useDispatch();
	return (
		<Section title="Appearance">
			<h3>Theme</h3>
			<SettingsSelect
				value={settingValues.theme}
				onChange={(value) => {
					dispatch(
						editSettings({
							theme: value,
						})
					);
				}}
				options={[
					{
						label: "Light",
						value: "light",
					},
					{
						label: "Dark",
						value: "dark",
					},
					{
						label: "Default",
						value: "default",
						description:
							"Theme is determined by system's user preferences",
					},
				]}
			/>
		</Section>
	);
}
