import { useContext, useRef } from "react";
import { UserContext } from "../../../hooks/context/UserContext";
import { useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import { Client, Account, Models } from "appwrite";
import { socket } from "../../../lib/socket";

interface IAuthData {
	email: string;
	password: string;
}

export const useLogin = () => {
	const { saveUser } = useContext(UserContext);
	const emailRef = useRef<HTMLInputElement>(null!);
	const passwordRef = useRef<HTMLInputElement>(null!);
	const navigate = useNavigate();

	const client = new Client().setEndpoint("YOUR_APPWRITE_ENDPOINT").setProject("YOUR_PROJECT_ID");
	const account = new Account(client);

	const { mutate, isLoading, error } = useMutation<Models.User<Models.Preferences>, Error, IAuthData>(
		async ({ email, password }: IAuthData): Promise<Models.User<Models.Preferences>> => {
			await account.createSession(email, password);
			const user = await account.get(); // Fetch user data after session creation
			return user;
		},
		{
			onSuccess: (data: Models.User<Models.Preferences>) => {
				saveUser(data);
				socket.emit("join-user-to-socket", data.$id);
				navigate("/");
			},
		}
	);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const user: IAuthData = {
			email: emailRef?.current?.value || "",
			password: passwordRef?.current?.value || "",
		};
		mutate(user);
	};

	const handleTestAccountAuth = (user: IAuthData) => mutate(user);

	return { emailRef, passwordRef, handleSubmit, isLoading, error, handleTestAccountAuth };
};
