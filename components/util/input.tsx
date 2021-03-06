import { forwardRef, useState } from "react";
import Styles from "./util.module.sass";

interface InputProps {	
	disabled?: boolean;
	defaultValue?: string;
	type?: "password" | "text";
	onChange?: (newValue: string) => void;
	name: string;
	onSubmit?: (value: string) => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
	(
		{
			name,
			onChange = () => {},
			defaultValue = "",
			disabled = false,
			type = "text",
			onSubmit = ()=>{},
		},
		ref
	) => {
		return (
			<input
				defaultValue={defaultValue}
				ref={ref}
				disabled={disabled}
				placeholder={name}
				type={type}
				className={Styles.input}
				onKeyDown={(event) => {
					if (event.key === "Enter") {
						onSubmit(event.currentTarget.value);
					}
				}}
				onChange={(event) => {
					onChange(event.target.value);
				}}
			/>
		);
	}
);
Input.displayName = "Input";
