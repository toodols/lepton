import { addAccount } from "lib/store/clientslice";
import { createRef, useRef, useState } from "react";
import Modal from "react-modal";
import { useDispatch, useSelector } from "react-redux";
import { client } from "../../lib/client";
import { setSignInModalOpen, RootState, setSigninMenuType } from "../../lib/store";
import { Input } from "../util/input";
import Styles from "./sign-in-modal.module.sass";

export function Signin() {
	const {isOpen, menuType} = useSelector((state: RootState) => ({isOpen: state.main.signInMenuOpen, menuType: state.main.signInMenuType}));
	const isSignedIn = useSelector((state: RootState) => state.client.isSignedIn);

	const dispatch = useDispatch();
	const [isLoading, setIsLoading] = useState(false);
	

	const signInUsernameRef = useRef<HTMLInputElement>(null);
	const signInPasswordRef = useRef<HTMLInputElement>(null);

	const signUpUsernameRef = useRef<HTMLInputElement>(null);
	const signUpPasswordRef = useRef<HTMLInputElement>(null);
	const signupConfirmPasswordRef = useRef<HTMLInputElement>(null);

	const [error, setError] = useState<string | null>(null);

	return <Modal ariaHideApp={false} data={{
		error: !!error,
		menutype: menuType,
	}} className={Styles.signin_modal} isOpen={isOpen} closeTimeoutMS={300} onRequestClose={()=>{
		if (isLoading) return;
		dispatch(setSignInModalOpen(false));
	}}>
		<div key="signin" className={Styles.page} data-shown={menuType==="signin"}>
			<header>Sign In to Lepton</header>
			<Input disabled={isLoading} name="Username" ref={signInUsernameRef}/>
			<Input disabled={isLoading} name="Password" type="password" ref={signInPasswordRef}/>
			<button disabled={isLoading} onClick={()=>{
				setIsLoading(true);
				client.getToken(signInUsernameRef.current!.value, signInPasswordRef.current!.value).then((tok)=>{
					client.useToken(tok);
					dispatch(addAccount(tok))
					dispatch(setSignInModalOpen(false));
					
				}).catch((err)=>{
					setError(err.message);
				}).finally(()=>{
					setIsLoading(false);
				});
			}}>Sign In</button>
			<button disabled={isLoading} onClick={()=>{
				dispatch(setSigninMenuType("signup"));
			}}>Sign Up Instead</button>
		</div>
		<div key="signup" className={Styles.page} data-shown={menuType==="signup"}>
			<header>Sign Up for Lepton</header>
			<Input disabled={isLoading} name="Username" ref={signUpUsernameRef}/>
			<Input disabled={isLoading} name="Password" type="password" ref={signUpPasswordRef}/>
			<Input disabled={isLoading} name="Confirm Password" type="password" ref={signupConfirmPasswordRef}/>

			<button disabled={isLoading} onClick={()=>{
				dispatch(setSigninMenuType("signin"));
			}}>Sign In Instead</button>
			<button disabled={isLoading} onClick={()=>{
				if (signUpPasswordRef.current!.value !== signupConfirmPasswordRef.current!.value) {
					// passwords do not match
				} else {
					setIsLoading(true);
					client.signUp(signUpUsernameRef.current!.value, signUpPasswordRef.current!.value).then((token)=>{
						dispatch(addAccount(token));
						dispatch(setSignInModalOpen(false));
						client.useToken(token)
					}).catch((err)=>{
						setError(err.message);
					}).finally(()=>{
						setIsLoading(false);
					})
	
				}
			}}>Sign Up</button>
		</div>
		<div key="error" >{error}</div>
	</Modal>
}