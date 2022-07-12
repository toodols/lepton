import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ReactElement } from "react";
import Styles from "./context-menu.module.sass";

export function ContextMenu(props: {
	items: ({text: string, color?: string, icon?: IconDefinition | ReactElement, onClick: ()=>void} | ReactElement)[][]
}){
	const elements: ReactElement[] = [];
	for (const section of props.items) {
		for (const item of section) {
			if ("text" in item) {
				elements.push(<button onClick={()=>{
					item.onClick();
				}}><span>{item.icon?("iconName" in item.icon?<FontAwesomeIcon icon={item.icon}/>:item.icon):<></>}</span>{item.text}</button>)
			} else {
				elements.push(item)
			}
		}
		elements.push(<div>--</div>)
	}
	// we don't need the last --
	elements.pop();
	return <div className={Styles.contextMenu}>
		{elements}
	</div>
}