import { motion } from "framer-motion";
import Input from "../components/Input";
import { Loader, Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import { useAuthStore } from "../store/authStore";

const SignUpPage = () => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();

	const { signup, error, isLoading } = useAuthStore();

	const handleSignUp = async (e) => {
		e.preventDefault();

		try {
			await signup(email, password, name);
			navigate("/verify-email");
		} catch (error) {
			console.log(error);
		}
	};

	const handleGoogleLogin = () => {
		window.open(
			`http://localhost:5000/api/auth/google/callback`,
		);
	};


	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className="m-5"
		>

			<div className="max-w-3xl mx-auto  grid grid-cols-1 md:grid-cols-2  bg-gray-800 shadow-xl 
			overflow-hidden">
				<div>
					<dotlottie-player src="https://lottie.host/de8bf924-4829-48d5-a6dd-98c1d382dedf/odbnWfLaj7.lottie" background="transparent" speed="1" direction="1" style={{ width: '100%', height: '100%' }} playMode="normal" loop autoplay></dotlottie-player>
				</div>
				<div className='w-full border-t md:border-t-0 md:border-l  border-gray-500 mx-auto'>
					<div className='p-8'>
						<h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text'>
							Create Account
						</h2>

						<form onSubmit={handleSignUp}>
							<Input
								icon={User}
								type='text'
								placeholder='Full Name'
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
							<Input
								icon={Mail}
								type='email'
								placeholder='Email Address'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
							<Input
								icon={Lock}
								type='password'
								placeholder='Password'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
							{error && <p className='text-red-500 font-semibold mt-2'>{error}</p>}
							<PasswordStrengthMeter password={password} />

							<motion.button
								className='mt-5 w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
						font-bold rounded-lg shadow-lg hover:from-green-600
						hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
						 focus:ring-offset-gray-900 transition duration-200'
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								type='submit'
								disabled={isLoading}
							>
								{isLoading ? <Loader className=' animate-spin mx-auto' size={24} /> : "Sign Up"}
							</motion.button>
						<div className="flex items-center w-full my-4">
                            <hr className="w-full" />
                            <p className="px-3 text-white">OR</p>
                            <hr className="w-full" />
                        </div>
                        <div className="space-y-4">
                            <button 
							onClick={handleGoogleLogin}
							aria-label="Login with Google" type="button" className="flex items-center justify-center w-full p-2 space-x-4 border rounded-md">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /><path d="M1 1h22v22H1z" fill="none" /></svg>
                                <p className="text-white text-sm">Login with Google</p>
                            </button>
                        </div>
						</form>
					</div>

					<div className='px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center'>
						<p className='text-sm text-gray-400'>
							Already have an account?{" "}
							<Link to={"/login"} className='text-green-400 hover:underline'>
								Login
							</Link>
						</p>
					</div>
				</div>
			</div>
		</motion.div>
	);
};
export default SignUpPage;
