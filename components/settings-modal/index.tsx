import {
	discardSettings,
	editSettings,
	saveSettings,
	Theme,
} from "../../lib/store/settings";
import { setSettingsModalOpen } from "../../lib/store";
import Select, { OptionProps, components } from "react-select";
import Modal from "react-modal";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../lib/store";
import Styles from "./settings-modal.module.sass";
import { createContext, useContext, useEffect, useRef } from "react";
const SettingsSectionsContext = createContext<Record<string, HTMLElement>>({});

function Section(props: { title: string; children: React.ReactNode }) {
	const ctx = useContext(SettingsSectionsContext);
	const ref = useRef<HTMLElement>(null);
	useEffect(() => {
		ctx[props.title] = ref.current!;
		return () => {
			delete ctx[props.title];
		};
	}, [ctx, ref, props.title]);

	return (
		<section ref={ref} className={Styles.section}>
			<h2>{props.title}</h2>
			{props.children}
		</section>
	);
}

function CustomOption(
	props: OptionProps<{ label: string; value: string; description?: string }>
) {
	return (
		<components.Option {...props}>
			{
				<>
					{props.children}
					{props.data.description ? (
						<span className={Styles.optionDescription}>
							{props.data.description}
						</span>
					) : (
						<></>
					)}
				</>
			}
		</components.Option>
	);
}

function SettingsSelect(props: {
	value: string;
	onChange: (newValue: string)=>void,
	options: { value: string; label: string; description?: string }[];
}) {
	return (
		<Select
			value={props.options.find((e) => e.value === props.value)}
			classNamePrefix="react-select"
			components={{ Option: CustomOption }}
			onChange={(value) => {
				//@ts-ignore
				props.onChange(value.value);
			}}
			options={props.options}
		/>
	);
}

export function Settings() {
	const { settingsModalOpen } = useSelector((state: RootState) => state.main);
	const isEditing = useSelector(
		(state: RootState) => state.settings.isEditing
	);
	const mainRef = useRef<HTMLDivElement>(null);

	const refs = useRef<Record<string, HTMLElement>>({});

	const dispatch = useDispatch();

	const settingValues = useSelector(
		(state: RootState) => state.settings.settings
	);
	const username = useSelector((state: RootState) => state.client.username);
	return (
		<Modal
			ariaHideApp={false}
			className={Styles.settingsModal}
			closeTimeoutMS={300}
			onRequestClose={() => {
				dispatch(discardSettings());
				dispatch(setSettingsModalOpen(false));
			}}
			isOpen={settingsModalOpen}
		>
			<header>Settings</header>
			<button
				data-shown={isEditing}
				className={Styles.save}
				onClick={() => {
					dispatch(saveSettings());
				}}
			>
				Save
			</button>
			<div className={Styles.container}>
				<SettingsSectionsContext.Provider value={{}}>
					<SettingsSectionsContext.Consumer>
						{(ctx) => (
							<aside>
								{[
									"Appearance",
									"Account",
									"Privacy",
									"Language",
									"Section 1",
									"Section 2",
								].map((e) => {
									return (
										<button
											key={e}
											className={Styles.navButton}
											onClick={() => {
												ctx[e]?.scrollIntoView({
													behavior: "smooth",
												});
											}}
										>
											{e}
										</button>
									);
								})}
							</aside>
						)}
					</SettingsSectionsContext.Consumer>
					<main ref={mainRef}>
						<Section title="Appearance">
							<h3>Theme</h3>
							<SettingsSelect
								value={settingValues.theme}
								onChange={(value)=>{
									dispatch(
										editSettings({
											theme: value
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
						<Section title="Account">
							<h3>Username</h3>
							{username}
							<h3>Password</h3>
							Password
							<h3>Avatar</h3>
							Avatar
							<h3>Bio</h3>
							<textarea
								onChange={() => {
									dispatch(
										editSettings({
											description:
												document.querySelector(
													"textarea"
												)?.value,
										})
									);
								}}
							></textarea>
							<h3>Region</h3>
							<SettingsSelect onChange={()=>{
								
							}} value={"i have rights you know"} options={[{
								label: "American 🇺🇸 ",
								value: "american",
							}, {
								label: "Non American 🤢 ",
								value: "non-american"
							}]}/>
						</Section>
						<Section title="Privacy">
							<h3>Privacy</h3>
							<p>Something about blocking people goes here.</p>
						</Section>
						<Section title="Language">Language here</Section>
						<Section title="Section 1">
							Lorem ipsum, dolor sit amet consectetur adipisicing
							elit. Nulla quibusdam natus, numquam nam tempora
							architecto modi voluptatem dicta neque consequatur
							praesentium nesciunt cum ex incidunt quam ut veniam
							officia blanditiis. Corporis autem optio soluta modi
							perferendis, quasi eveniet cumque accusantium vitae
							quaerat placeat molestias tempore dolor obcaecati
							praesentium officia sed explicabo? Repudiandae
							inventore totam molestias veritatis, accusantium
							odit maxime iusto? Voluptatum temporibus nobis dicta
							consectetur facilis. Magni eum tenetur voluptatum ab
							laboriosam harum, quo saepe nulla veritatis
							doloremque repellendus dignissimos, corrupti
							consequuntur obcaecati temporibus. Quidem, ad
							assumenda. Dolorum, veritatis voluptas!
						</Section>
						<Section title="Section 2">
							Lorem ipsum dolor sit, amet consectetur adipisicing
							elit. Eligendi dolore nihil totam deleniti quae
							libero incidunt, vero assumenda sunt repellendus
							ullam non possimus dolor facilis eos, dignissimos
							expedita veniam odio? Deserunt dolor velit
							voluptatem mollitia omnis incidunt. Omnis
							dignissimos quidem voluptas voluptate corrupti?
							Incidunt quis, nisi asperiores mollitia accusamus
							dolorum voluptatibus esse ipsum corporis perferendis
							doloribus neque aut dolor id! Esse quidem expedita
							nisi unde, reprehenderit alias consectetur quo
							mollitia pariatur fuga sunt architecto. Deleniti
							temporibus distinctio hic modi, cupiditate ut
							deserunt assumenda, repudiandae magni suscipit saepe
							alias et soluta!
						</Section>
					</main>
				</SettingsSectionsContext.Provider>
			</div>
		</Modal>
	);
}
