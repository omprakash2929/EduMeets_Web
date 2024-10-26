import { useContext } from "react";
import { UIContext } from "../../../../hooks/context/UIContext";
import { RenderAvatar } from "../../../../utils/RenderAvatar";
import { useVideoPlayer } from "./useVideoPlayer";
import { IUser } from "../../../../types/users.interface";

export const VideoPlayer: React.FC<{
	stream?: MediaStream;
	streamTrack?: any;
	user?: IUser | null;
	avatarSize: string;
}> = ({ stream, streamTrack, user, avatarSize }) => {
	const { theme } = useContext(UIContext);
	const { videoRef } = useVideoPlayer(stream, user);
	return (
		<div className="w-full h-full object-cover relative z-0">
			<div
				className={`w-full h-full flex items-center justify-center absolute ${
					theme === "dark" ? "bg-blue-800" : "bg-white-100"
				}`}
				style={{ zIndex: streamTrack?.video ? 0 : 10 }}
			>
				<RenderAvatar
					photo={user?.photo ?? ""}
					fullName={user?.full_name ?? ""}
					hasExtraClass={`${avatarSize} rounded-full`}
				/>
			</div>
			<video
				autoPlay
				ref={videoRef}
				className={`w-full h-auto absolute`}
				style={{ zIndex: streamTrack?.video ? 10 : 0 }}
			/>
		</div>
	);
};
