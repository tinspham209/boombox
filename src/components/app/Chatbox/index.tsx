import { Comment } from "@ant-design/compatible";
import { SendOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, Input, List, Tooltip } from "antd";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { Profile } from "../../../redux/slices/app.slice.ts";
import { ChatMessage, addMessage } from "../../../redux/slices/chat.slice.ts";
import { useAppDispatch, useAppSelector } from "../../../redux/store.ts";
import PeerService from "../../../services/peer.service.ts";
import styles from "./chat-box.module.css";

export default function ChatBox() {
	const { profile } = useAppSelector((state) => state.app);
	const { messages } = useAppSelector((state) => state.chat);
	const [message, setMessage] = useState("");
	const dispatch = useAppDispatch();
	const bottomRef = useRef<any>(null);

	const submitMessage = () => {
		if (message.trim() === "") return;
		const msgObject: ChatMessage = {
			author: profile as Profile,
			text: message,
			time: new Date().getTime(),
		};
		dispatch(addMessage(msgObject));
		PeerService.sendAll(
			encodeURIComponent(
				JSON.stringify({
					action: "message",
					data: msgObject,
				})
			)
		);
		setMessage("");
	};

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	return (
		<Card
			style={{ width: 360 }}
			bodyStyle={{
				height: 500,
				padding: 0,
				display: "flex",
				flexDirection: "column",
			}}
			title={"Live chat"}
		>
			<div className={styles.commentsList}>
				<List
					dataSource={messages}
					renderItem={(message) => (
						<Comment
							author={
								<a>
									{message.author.name} ({message.author.username})
								</a>
							}
							avatar={<Avatar icon={message.author.icon} />}
							content={<p>{message.text}</p>}
							datetime={
								<Tooltip title={moment(message.time).format()}>
									<span>{moment(message.time).fromNow()}</span>
								</Tooltip>
							}
						/>
					)}
				/>
				<div ref={bottomRef} />
			</div>
			<div className={styles.commentAction}>
				<Input
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					className={styles.commentInput}
					placeholder={"Leave message..."}
					onPressEnter={(e) => {
						e.preventDefault();
						submitMessage();
					}}
				/>
				<Button shape={"circle"} onClick={submitMessage}>
					<SendOutlined />
				</Button>
			</div>
		</Card>
	);
}
