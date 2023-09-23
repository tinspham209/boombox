import { message } from "antd";
import { useEffect } from "react";
import { enqueueTrack } from "../../redux/actions/player.actions.ts";
import {
	Profile,
	addPeer,
	removePeer,
	updatePeerProfile,
} from "../../redux/slices/app.slice.ts";
import { addMessage } from "../../redux/slices/chat.slice.ts";
import {
	removeTrack,
	syncPlayer,
	syncQueue,
	updatePlayer,
} from "../../redux/slices/player.slice.ts";
import { store, useAppDispatch, useAppSelector } from "../../redux/store.ts";
import PeerService from "../../services/peer.service.ts";

export default function PeerHelper() {
	const { profile } = useAppSelector((state) => state.app);
	const dispatch = useAppDispatch();

	useEffect(() => {
		PeerService.disconnect();
		if (profile && profile.username) {
			PeerService.initialize(profile.username);
			PeerService.onConnection.addListener((conn, isIncoming) => {
				const { currentTrack, currentTrackTime } = store.getState().player;
				dispatch(addPeer(conn.connectionId));
				conn.send(
					encodeURIComponent(
						JSON.stringify({
							action: "profile",
							data: profile,
						})
					)
				);
				conn.send(
					encodeURIComponent(
						JSON.stringify({
							action: "peers",
							data: store.getState().app.peers,
						})
					)
				);
				conn.send(
					encodeURIComponent(
						JSON.stringify({
							action: "queue",
							data: store.getState().player.queue,
						})
					)
				);
				if (isIncoming) {
					message.info(conn.peer + " has just connected.").then(() => null);
					conn.send(
						encodeURIComponent(
							JSON.stringify({
								action: "sync-player",
								data: {
									currentTrack,
									currentTrackTime,
								},
							})
						)
					);
				}
			});
			PeerService.onData.addListener((data, conn) => {
				const parsedData = JSON.parse(decodeURIComponent(data));
				switch (parsedData.action) {
					case "profile":
						dispatch(
							updatePeerProfile({
								profile: parsedData.data,
								connectionId: conn.connectionId,
							})
						);
						break;
					case "peers":
						// eslint-disable-next-line no-case-declarations
						const connectedPeers = store.getState().app.peers || [];
						// eslint-disable-next-line no-case-declarations
						const { data: peersList } = parsedData;
						peersList.forEach((peer: Profile) => {
							if (!peer || !peer.username) return;
							if (
								!connectedPeers.find(
									(p: Profile) => p.username === peer.username
								)
							) {
								PeerService.connect(peer.username).then(() => null);
							}
						});
						break;
					case "message":
						dispatch(addMessage(parsedData.data));
						break;
					case "enqueue":
						dispatch(enqueueTrack(parsedData.data));
						break;
					case "queue":
						dispatch(syncQueue(parsedData.data));
						break;
					case "sync-player":
						dispatch(syncPlayer(parsedData.data));
						break;
					case "update-player":
						dispatch(updatePlayer(parsedData.data));
						break;
					case "remove-track":
						dispatch(removeTrack(parsedData.data));
						break;
				}
			});
			PeerService.onClose.addListener((conn) => {
				dispatch(removePeer(conn.connectionId));
			});
		}
		return () => {
			PeerService.disconnect();
		};
	}, [dispatch, profile]);

	// useEffect(() => {
	// if (peers.length !== 0){}
	// }, [peers]);

	return <></>;
}
