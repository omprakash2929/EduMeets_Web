import { useContext, useRef, useState } from "react";
import { UserContext } from "../../../hooks/context/UserContext";
import { useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import { Client, Account, Storage, ID, Models } from "appwrite";
import { socket } from "../../../lib/socket";

interface IAuthData {
	email: string;
	password: string;
	full_name: string;
}

export const useSignup = () => {
	const { saveUser } = useContext(UserContext);
	const emailRef = useRef<HTMLInputElement>(null!);
	const passwordRef = useRef<HTMLInputElement>(null!);
	const nameRef = useRef<HTMLInputElement>(null!);
	const [photo, setPhoto] = useState<File | null>(null);
	const navigate = useNavigate();

	const client = new Client().setEndpoint("YOUR_APPWRITE_ENDPOINT").setProject("YOUR_PROJECT_ID");
	const account = new Account(client);
	const storage = new Storage(client);

	const { mutate, isLoading, error } = useMutation<Models.User<Models.Preferences>, Error, IAuthData>(
		async ({ email, password, full_name }: IAuthData): Promise<Models.User<Models.Preferences>> => {
			const user = await account.create(ID.unique(), email, password, full_name);
			
			// Upload the photo to Appwrite storage if available
			if (photo) {
				const photoFile = await storage.createFile("YOUR_BUCKET_ID", ID.unique(), photo);
				const photoUrl = storage.getFileView("YOUR_BUCKET_ID", photoFile.$id);
				user.prefs = { ...user.prefs, photoUrl };  // Save photo URL in user preferences
				await account.updatePrefs(user.prefs); // Update preferences with photo
			}
			return user;
		},
		{
			onSuccess: (data) => {
				saveUser(data);
				socket.emit("join-user-to-socket", data.$id);
				navigate("/");
			},
		}
	);

	const photoHandler = (e: React.ChangeEvent<HTMLInputElement>) => setPhoto(e.target?.files![0]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const userData: IAuthData = {
			email: emailRef?.current?.value || "",
			password: passwordRef?.current?.value || "",
			full_name: nameRef?.current?.value || "",
		};
		mutate(userData);
	};

	return { emailRef, nameRef, passwordRef, photo, photoHandler, handleSubmit, isLoading, error };
};
