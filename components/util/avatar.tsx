import Image from "next/image";
import Styles from "./util.module.sass";

export function Avatar({src, size=30}:{src: string, size?: number}){
	return <Image className={Styles.avatar} width={size} height={size} alt="Avatar" src={src}/>
}