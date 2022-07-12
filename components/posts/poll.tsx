import { Poll } from "../../lib/client";
export function Poll({poll}: {poll: Poll}){
	return <div>
		<h1>{poll.question}</h1>
		{poll.options.map((option, i)=>{
			return <button key={i}>
				{option}
			</button>
		})}
	</div>;
}