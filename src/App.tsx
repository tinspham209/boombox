import { ConfigProvider, Space, theme } from "antd";
import { StrictMode } from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import "./App.css";
import ChatBox from "./components/app/Chatbox";
import PlayerCard from "./components/app/Player";
import ProfileCard from "./components/app/Profile";
import PeerHelper from "./components/helpers/PeerHelper.tsx";
import AppLayout from "./components/layout/AppLayout.tsx";
import CreateUserModal from "./components/modals/CreateUser";
import { store } from "./redux/store.ts";

function AppContent() {
	return (
		<ConfigProvider
			theme={{
				algorithm: theme.darkAlgorithm,
			}}
		>
			<PeerHelper />
			<AppLayout>
				<div style={{ flex: 1 }}>
					<PlayerCard />
				</div>
				<Space direction={"vertical"}>
					<ProfileCard />
					<ChatBox />
				</Space>
			</AppLayout>
			<CreateUserModal />
		</ConfigProvider>
	);
}

function App() {
	return (
		<StrictMode>
			<Provider store={store}>
				<BrowserRouter>
					<AppContent />
				</BrowserRouter>
			</Provider>
		</StrictMode>
	);
}

export default App;
