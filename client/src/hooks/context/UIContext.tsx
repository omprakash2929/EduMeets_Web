import { ReactNode, createContext, useEffect, useState } from "react";
import { ITheme } from "./types";
import { useLocation } from "react-router-dom";
import { capitalizeText } from "../../utils";

export const UIContext = createContext<ITheme>({} as ITheme);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	// Theme related logic
	const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

	const toggleTheme = () => {
		const newTheme = theme === "light" ? "dark" : "light";
		localStorage.setItem("theme", newTheme);
		setTheme(newTheme);
	};

	// Active page related logic
	const [activePage, setActivePage] = useState("Home");
	const location = useLocation();
	useEffect(() => {
		const path = location.pathname;

		if (path.includes("meetings/new")) return setActivePage("Schedule");
		if (path.includes("analytics")) return setActivePage("Analytics");
		let title = path.split("/")[1];
		title = title ? capitalizeText(title) : capitalizeText("Home");
		setActivePage(title);
	}, [location.pathname]);

	// modal logics
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalContent, setModalContent] = useState<ReactNode | null>(null);

	const openModal = (content: ReactNode) => {
		setModalContent(content);
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setModalContent(null);
	};

	// window size helpers
	const [isMobile, setIsMobile] = useState(false);
	const [isDesktop, setIsDesktop] = useState(false);
	const [isTablet, setIsTablet] = useState(false);

	useEffect(() => {
		const updateScreenSize = () => {
			setIsMobile(window.innerWidth <= 640);
			setIsDesktop(window.innerWidth > 992);
			setIsTablet(window.innerWidth <= 1024);
		};
		updateScreenSize();
		window.addEventListener("resize", updateScreenSize);
		return () => {
			window.removeEventListener("resize", updateScreenSize);
		};
	}, []);

	// sidebar handler

	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen);
	};

	// meeting room UI handlers
	const [isChatBubble, setIsChatBubble] = useState(false);
	const chatBubbleHandler = () => setIsChatBubble(!isChatBubble);

	return (
		<UIContext.Provider
			value={{
				theme,
				toggleTheme,
				activePage,
				isModalOpen,
				openModal,
				closeModal,
				modalContent,
				isDesktop,
				isMobile,
				isTablet,
				isSidebarOpen,
				toggleSidebar,
				isChatBubble,
				chatBubbleHandler,
			}}
		>
			{children}
		</UIContext.Provider>
	);
};
