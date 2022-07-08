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
import { Appearance } from "./appearance";
import { Account } from "./account";
const SettingsSectionsContext = createContext<Record<string, HTMLElement>>({});

export function Section(props: { title: string; children: React.ReactNode }) {
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

export function CustomOption(
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

export function SettingsSelect(props: {
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
						<Appearance/>
						<Account/>
						<Section title="Privacy">
							<h3>Privacy</h3>
							<p>Something about blocking people goes here.</p>
						</Section>
						<Section title="Language">Language here</Section>
					</main>
				</SettingsSectionsContext.Provider>
			</div>
		</Modal>
	);
}
