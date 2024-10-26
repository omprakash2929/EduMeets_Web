import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MeetingsProvider } from './hooks/context/meetings/MeetingsContext';
import Home from './pages/Home';
import { Layout } from './components/Layout';
import { UIProvider } from './hooks/context/UIContext';
import { NewMeeting } from './pages/NewMeeting';
import Meetings from './pages/Meetings';
import { Analytics } from './pages/Analytics';
import JoinMeeting from './pages/JoinMeeting';
import { MeetingRoom } from './pages/MeetingRoom';
import { Auth } from './pages/Auth';
import { UserProvider } from './hooks/context/UserContext';
import { RequireAuth, RequireNoAuth } from './hooks/custom/protectRoute';
import { MeetingRoomProvider } from './hooks/context/meetings/MeetingRoomContext';
import { GlobalComponents } from './components/GlobalComponents';
import { MeetingChatProvider } from './hooks/context/meetings/MeetingChatContext';
import { Invitations } from './pages/Invitations';

const App: React.FC = () => {
	const queryClient = new QueryClient();
	return (
		<BrowserRouter>
			<UIProvider>
				<QueryClientProvider client={queryClient}>
					<UserProvider>
						<MeetingsProvider>
							<Routes>
								<Route element={<RequireAuth />}>
									<Route path='/' element={<Layout />}>
										<Route index element={<Home />} />
										<Route path='meetings' element={<Meetings />} />
										<Route path='/meetings/:meetingId/room' element={<NewMeeting />} />
										<Route path='meetings/:meetingId/analytics' element={<Analytics />} />
										<Route path='/meetings/new' element={<NewMeeting />} />
										<Route path='invitations' element={<Invitations />} />
									</Route>
									<Route
										path='meeting-rooms/:roomId'
										element={
											<MeetingRoomProvider>
												<MeetingChatProvider>
													<MeetingRoom />
												</MeetingChatProvider>
											</MeetingRoomProvider>
										}
									/>
									<Route path='join-meeting/:sessionId?' element={<JoinMeeting />} />
								</Route>
								<Route element={<RequireNoAuth />}>
									<Route path='/auth' element={<Auth />} />
								</Route>
							</Routes>
							<GlobalComponents />
						</MeetingsProvider>
					</UserProvider>
				</QueryClientProvider>
			</UIProvider>
		</BrowserRouter>
	);
};

export default App;

