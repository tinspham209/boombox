import { Empty } from "antd";
import { useEffect, useRef, useState } from "react";
import YouTube, { YouTubePlayer } from "react-youtube";
import { moveToNextTrack } from "../../../redux/slices/player.slice.ts";
import { useAppDispatch, useAppSelector } from "../../../redux/store.ts";
import PeerService from "../../../services/peer.service.ts";
import QueueCard from "./QueueCard.tsx";
import styles from "./player.module.css";

export default function PlayerCard() {
	const { queue, currentTrack, currentTrackTime, state } = useAppSelector(
		(state) => state.player
	);
	const { peers } = useAppSelector((state) => state.app);
	const player = useRef<YouTubePlayer>(null);
	const [lastInteract, setLastInteract] = useState(new Date().getTime());
	const [playerReady, setPlayerReady] = useState(false);
	const [ready, setReady] = useState(false);

	const dispatch = useAppDispatch();

	useEffect(() => {
		if (state === YouTube.PlayerState.PLAYING) {
			player.current?.internalPlayer.playVideo();
		} else if (state === YouTube.PlayerState.PAUSED) {
			player.current?.internalPlayer.pauseVideo();
		}
	}, [state]);

	useEffect(() => {
		if (peers.length === 0) setReady(true);
	}, [peers]);

	useEffect(() => {
		PeerService.onData.addListener(async (data) => {
			const parsedData = JSON.parse(decodeURIComponent(data));
			if (
				parsedData.action === "sync-player" &&
				parsedData.data.timestamp > lastInteract &&
				ready
			) {
				setReady(true);
				const trackTime = await player.current?.internalPlayer.getCurrentTime();
				const timeDiff = Math.abs(
					(parsedData.data.currentTrackTime as number) - trackTime
				);
				if (timeDiff > 5) {
					player.current?.internalPlayer.seekTo(
						parsedData.data.currentTrackTime
					);
				}
			}
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		player.current?.internalPlayer.seekTo(currentTrackTime || 0);
	}, [currentTrackTime, playerReady]);

	return (
		<div className={styles.card}>
			<div className={styles.playerWrapper}>
				{queue.length === 0 ? (
					<Empty />
				) : (
					<YouTube
						ref={player}
						videoId={currentTrack}
						opts={{
							height: "400",
							width: "100%",
							playerVars: {
								autoplay: 1,
							},
						}}
						onReady={() => {
							setPlayerReady(true);
						}}
						onPlay={() => {
							setLastInteract(new Date().getTime());
						}}
						onStateChange={async (event) => {
							const state = event.data;

							if (
								state === YouTube.PlayerState.PLAYING ||
								state === YouTube.PlayerState.PAUSED
							) {
								const timestamp = new Date().getTime();
								if (timestamp - lastInteract < 500) return;
								const trackTime = await event.target.getCurrentTime();
								// send to other clients
								PeerService.sendAll(
									encodeURIComponent(
										JSON.stringify({
											action: "sync-player",
											data: {
												currentTrack,
												currentTrackTime: trackTime,
												state,
												timestamp,
											},
										})
									)
								);
								setLastInteract(timestamp);
							}
						}}
						onEnd={() => {
							dispatch(moveToNextTrack());
						}}
					/>
				)}
			</div>
			<QueueCard />
		</div>
	);
}
