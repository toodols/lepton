import "../styles/globals.sass";
import "../styles/vars.sass";
import "../styles/react-modal.sass";
import type { AppProps } from "next/app";
import { I18nextProvider } from "react-i18next";
import i18n from "i18next";
import { Provider } from "react-redux";
import { store } from "../lib/store";
import { Sidebar } from "../components/sidebar";
import { Topbar } from "../components/topbar";

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<I18nextProvider i18n={i18n}>
			<Provider store={store}>
				<Topbar />
				<Component {...pageProps} />
				<Sidebar />
			</Provider>
		</I18nextProvider>
	);
}

export default MyApp;
