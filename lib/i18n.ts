
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18n.use(LanguageDetector).init({
	resources: {
		en: {
			translation: {
				"hello": "Hello World",
				"goodbye": "Goodbye World"
			}
		}
	}
})