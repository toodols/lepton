import { useRef, useState } from "react";
import Modal from "react-modal";
import Styles from "./image-upload.module.sass"
// file uploading doesnt exist so it will just be a url input box

export function ImageUpload(props: {onUrl: (url: string) => void}) {
	const [isOpen, setIsOpen] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	return <div>
		<button onClick={()=>{
			setIsOpen(true);
		}}>Upload Image</button>
		<Modal className={Styles.imageUpload} isOpen={isOpen} closeTimeoutMS={300} onRequestClose={()=>{
			setIsOpen(false);
		}}>
			<input ref={inputRef}></input>
			<button onClick={()=>{
				props.onUrl(inputRef.current!.value);
				setIsOpen(false);
			}}>Submit</button>
		</Modal>
	</div>
}