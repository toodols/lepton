import { useRef } from "react";

export default function Test(){
	const ref = useRef<HTMLDivElement>(null);
	return <div ref={ref} contentEditable onInput={(e)=>{
		//@ts-ignore
		console.log(e.target.textContent);
	}}>
		
	</div>
}