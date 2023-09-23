import { Button, Form, Input, message } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppSelector } from "../../../redux/store.ts";
import PeerService from "../../../services/peer.service.ts";
import styles from "./connect-form.module.css";
import { useLocation } from "react-router-dom";
export default function ConnectForm() {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const { peers, profile } = useAppSelector((state) => state.app);

	const onFinish = useCallback(
		(values: any) => {
			setLoading(true);
			if (peers.find((x) => x.username === values.peerId)) {
				setLoading(false);
				return message.error("Already connected to this peer");
			}
			PeerService.connect(values.peerId)
				.then(() => {
					message.success("Connected.");
					return setLoading(false);
				})
				.catch(() => {
					message.error("Failed to connect.");
					return setLoading(false);
				});
		},
		[peers]
	);

	const { search } = useLocation();
	const query = useMemo(() => new URLSearchParams(search), [search]);
	const queryRoom = query.get("room");

	useEffect(() => {
		if (queryRoom && profile) {
			setTimeout(() => {
				onFinish({
					peerId: queryRoom,
				});
			}, 500);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [profile]);

	return (
		<div>
			<Form form={form} onFinish={onFinish}>
				<div className={styles.connectRow}>
					<Form.Item className={styles.inputWrapper} name={"peerId"}>
						<Input disabled={loading} placeholder={"Other peer username..."} />
					</Form.Item>
					<Form.Item>
						<Button
							block
							type={"primary"}
							htmlType={"submit"}
							loading={loading}
						>
							Connect
						</Button>
					</Form.Item>
				</div>
			</Form>
		</div>
	);
}
