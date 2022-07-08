import { ImageUpload } from "components/image-upload";
import { RootState } from "lib/store";
import { editSettings } from "lib/store/settings";
import { useDispatch, useSelector } from "react-redux";
import { Section, SettingsSelect } from ".";

export function Account() {
	const username = useSelector((state: RootState) => state.client.username);
	const dispatch = useDispatch();
	return (
		<Section title="Account">
			<h3>Username</h3>
			{username}
			<h3>Password</h3>
			Password
			<h3>Avatar</h3>
			<ImageUpload onUrl={(url)=>{
				dispatch(editSettings({
					avatar:url
				}))
			}}/>
			<h3>Banner</h3>
			<ImageUpload onUrl={(url)=>{
				dispatch(editSettings({
					banner: url
				}))
			}}/>
			<h3>Bio</h3>
			<textarea
				onChange={() => {
					dispatch(
						editSettings({
							description:
								document.querySelector("textarea")?.value,
						})
					);
				}}
			></textarea>
			<h3>Region</h3>
			<SettingsSelect
				onChange={() => {}}
				value={"i have rights you know"}
				options={[
					{
						label: "American 🇺🇸 ",
						value: "american",
					},
					{
						label: "Non American 🤢 ",
						value: "non-american",
					},
				]}
			/>
		</Section>
	);
}
