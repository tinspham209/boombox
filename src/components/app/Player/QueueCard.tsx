import { DeleteOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { Button, Card, List, Tag } from "antd";
import moment from "moment";
import { removeTrack, syncPlayer } from "../../../redux/slices/player.slice.ts";
import { useAppDispatch, useAppSelector } from "../../../redux/store.ts";
import peerService from "../../../services/peer.service.ts";
import EnqueueInput from "./EnqueueInput.tsx";
import styles from "./player.module.css";

export default function QueueCard() {
	const { queue } = useAppSelector((state) => state.player);
	const dispatch = useAppDispatch();
	return (
		<Card
			className={styles.queueCard}
			title={"Queue"}
			bodyStyle={{ padding: 0 }}
			extra={
				<>
					<EnqueueInput />
				</>
			}
		>
			<div className={styles.listWrapper}>
				<List
					dataSource={queue}
					renderItem={(item) => (
						<List.Item className={styles.queueItem}>
							<img src={item.picture} className={styles.queueItemPicture} />
							<div className={styles.queueItemName}>
								<div>{item.title}</div>
								<Tag>
									{moment
										.utc(item.duration * 1000)
										.format(item.duration > 3600 ? "HH:mm:ss" : "mm:ss")}
								</Tag>
							</div>
							<div className={styles.controls}>
								<Button
									shape={"circle"}
									type={"text"}
									danger
									onClick={() => {
										dispatch(removeTrack(item.id));
										peerService.sendAll(
											encodeURIComponent(
												JSON.stringify({
													action: "remove-track",
													data: item.id,
												})
											)
										);
									}}
								>
									<DeleteOutlined />
								</Button>
								<Button
									shape={"circle"}
									type={"text"}
									onClick={() => {
										const newState = {
											currentTrack: item.id,
											currentTrackTime: 0,
										};
										dispatch(syncPlayer(newState));
										peerService.sendAll(
											encodeURIComponent(
												JSON.stringify({
													action: "sync-player",
													data: newState,
												})
											)
										);
									}}
								>
									<PlayCircleOutlined />
								</Button>
							</div>
						</List.Item>
					)}
				/>
			</div>
		</Card>
	);
}
