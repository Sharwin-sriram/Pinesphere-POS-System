"use client";

import React from "react";
import { CheckCheck, History, PauseCircle, PlayCircle } from "lucide-react";
import { KDSTicket } from "../types";

interface KDSTicketFooterProps {
  ticket: KDSTicket;
  onBump: () => void;
  onRecall: () => void;
  onHold: () => void;
}

export default function KDSTicketFooter({
  ticket,
  onBump,
  onRecall,
  onHold,
}: KDSTicketFooterProps) {
  const isBumped = ticket.status === "bumped";

  return (
    <div
      style={{
        display: "flex",
        gap: "var(--space-2)",
        paddingTop: "var(--space-3)",
        borderTop: "1px solid var(--color-border)",
        marginTop: "auto",
      }}
    >
      {isBumped ? (
        /* Recalled state — show Recall button only */
        <ActionButton
          id={`recall-${ticket.id}`}
          icon={<History size={13} strokeWidth={2} />}
          label="Recall"
          onClick={onRecall}
          style={{
            flex: 1,
            background: "var(--color-blue-subtle)",
            color: "var(--color-blue)",
            border: "1px solid var(--color-blue)",
          }}
          hoverStyle={{
            background: "var(--color-blue)",
            color: "#fff",
          }}
        />
      ) : (
        <>
          {/* Hold / Unhold */}
          <ActionButton
            id={`hold-${ticket.id}`}
            icon={
              ticket.hold ? (
                <PlayCircle size={13} strokeWidth={2} />
              ) : (
                <PauseCircle size={13} strokeWidth={2} />
              )
            }
            label={ticket.hold ? "Unhold" : "Hold"}
            onClick={onHold}
            style={{
              background: ticket.hold
                ? "var(--color-accent-subtle)"
                : "transparent",
              color: ticket.hold
                ? "var(--color-accent)"
                : "var(--color-text-secondary)",
              border: "1px solid var(--color-border)",
            }}
            hoverStyle={{
              background: "var(--color-accent-subtle)",
              color: "var(--color-accent)",
              borderColor: "var(--color-accent)",
            }}
          />

          {/* Bump */}
          <ActionButton
            id={`bump-${ticket.id}`}
            icon={<CheckCheck size={13} strokeWidth={2.5} />}
            label="Bump"
            onClick={onBump}
            style={{
              flex: 1,
              background: "var(--color-accent-green-subtle)",
              color: "var(--color-accent-green)",
              border: "1px solid var(--color-accent-green)",
              fontWeight: "var(--weight-semibold)",
            }}
            hoverStyle={{
              background: "var(--color-accent-green)",
              color: "#fff",
            }}
          />
        </>
      )}
    </div>
  );
}

interface ActionButtonProps {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  style?: React.CSSProperties;
  hoverStyle?: React.CSSProperties;
}

function ActionButton({ id, icon, label, onClick, style = {}, hoverStyle = {} }: ActionButtonProps) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <button
      id={id}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-1)",
        height: 32,
        padding: "0 var(--space-3)",
        borderRadius: "var(--radius-md)",
        fontSize: "var(--text-sm)",
        fontWeight: "var(--weight-medium)",
        fontFamily: "var(--font-ui)",
        cursor: "pointer",
        transition: `background var(--duration-base) var(--ease-base),
                     color var(--duration-base) var(--ease-base),
                     border-color var(--duration-base) var(--ease-base)`,
        ...(hovered ? { ...style, ...hoverStyle } : style),
      }}
    >
      {icon}
      {label}
    </button>
  );
}
