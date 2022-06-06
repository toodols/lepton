import "../styles/globals.sass";
import "../styles/react-modal.sass";
import "../styles/vars.sass";
import type { AppProps } from "next/app";
import { I18nextProvider } from "react-i18next";
import i18n from "i18next";
import { Provider } from "react-redux";
import { store } from "../lib/store";

function MyApp({ Component, pageProps }: AppProps) {
	//@ts-ignore
	const getLayout: (page)=>JSX.Element = Component.getLayout || ((page) => page)

	return (
		<I18nextProvider i18n={i18n}>
			<Provider store={store}>
				{getLayout(<Component {...pageProps} />)}
			</Provider>
		</I18nextProvider>
	);
}

export default MyApp;
