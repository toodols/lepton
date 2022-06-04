import Image from "next/image";
import Styles from "./util.module.sass";

export function Avatar({src, size=30, className}:{src: string, size?: number, className?: string}){
	return <Image layout="raw" className={Styles.avatar + " " + className} width={size} height={size} alt="Avatar" src={src}/>
}