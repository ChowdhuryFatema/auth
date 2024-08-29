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
