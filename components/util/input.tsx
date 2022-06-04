import { forwardRef, useState } from "react";
import Styles from "./util.module.sass";

interface InputProps {	
	disabled?: boolean;
	defaultValue?: string;
	type?: "password" | "text";
	onChange?: (newValue: string) => void;
	name: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
	(
		{
			name,
			onChange = () => {},
			defaultValue = "",
			disabled = false,
			type = "text",
		},
		ref
	) => {
		const [value, setValue] = useState(defaultValue);
		return (
			<input
				ref={ref}
				disabled={disabled}
				placeholder={name}
				type={type}
				className={Styles.input}
				value={value}
				onChange={(event) => {
					setValue(event.target.value);
					onChange(event.target.value);
				}}
			/>
		);
	}
);
Input.displayName = "Input";