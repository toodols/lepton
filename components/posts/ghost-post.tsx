import Styles from "./posts.module.sass";

export function GhostPost(){
	return <>
		<div className={Styles.post}>
			I think it is trying to load some posts. Hold on okay...
		</div>
	</>
}