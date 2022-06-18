import "../styles/globals.sass";
import "../styles/react-modal.sass";
import "../styles/vars.sass";
import type { AppProps } from "next/app";
import { I18nextProvider } from "react-i18next";
import i18n from "i18next";
import { Provider } from "react-redux";
import { store } from "../lib/store";
import { useEffect, useState, useCallback } from "react";



function MyApp({ Component, pageProps }: AppProps) {
	//@ts-ignore
	const getLayout: (page)=>JSX.Element = Component.getLayout || ((page) => page)

	useEffect(()=>{
		console.log(
			`
%cLepton
%c
Made by Ethan.
Inspect element doesn't make you a hacker and this project is open source anyways.
Please contribute: https://github.com/toodols/lepton
			`.trim(),
				"font-style: italic; font-size: 40px",
				"font-size: unset",
			);
	}, [])
	return (
		<I18nextProvider i18n={i18n}>
			<Provider store={store}>
				{getLayout(<Component {...pageProps} />)}
			</Provider>
		</I18nextProvider>
	);
}

export default MyApp;
