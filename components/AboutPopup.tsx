"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import CommunityRightPanel from "./CommunityRightPanel";

type Props = {
	open: boolean;
	onClose: () => void;
};

export default function AboutPopup({ open, onClose }: Props) {
	const [ignoreUntil, setIgnoreUntil] = useState(0);

	useEffect(() => {
		if (open) {
			setIgnoreUntil(Date.now() + 300);
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [open]);

	useEffect(() => {
		if (!open) return;
		console.debug("[AboutPopup] mounted");
		return () => console.debug("[AboutPopup] unmounted");
	}, [open]);

	if (!open || typeof document === "undefined") return null;

	const overlay = (
		<div
			onClick={(e) => {
				if (Date.now() < ignoreUntil) {
					e.stopPropagation();
					return;
				}
				onClose();
			}}
			onTouchEnd={(e) => {
				if (Date.now() < ignoreUntil) {
					e.stopPropagation();
					return;
				}
			}}
			style={{
				position: "fixed",
				inset: 0,
				background: "rgba(0,0,0,0.6)",
				zIndex: 9999,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding: 16,
			}}
		>
			<div
				role="dialog"
				aria-modal="true"
				onClick={(e) => e.stopPropagation()}
				style={{
					position: "relative",
					width: "100%",
					maxWidth: 720,
					maxHeight: "90vh",
					overflow: "auto",
					background: "#0b0b0b",
					borderRadius: 12,
					padding: 16,
					boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
				}}
			>
				<button
					onClick={onClose}
					aria-label="Close"
					style={{
						position: "absolute",
						top: -10,
						right: -10,
						width: 36,
						height: 36,
						borderRadius: 999,
						background: "rgba(255,255,255,0.06)",
						border: "none",
						color: "#fff",
						fontSize: 18,
					}}
				>
					✕
				</button>

				<CommunityRightPanel />
			</div>
		</div>
	);

	return createPortal(overlay, document.body);
}

