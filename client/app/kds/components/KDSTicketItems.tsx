"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { KDSTicket } from "../types";

interface KDSTicketItemsProps {
  ticket: KDSTicket;
}

export default function KDSTicketItems({ ticket }: KDSTicketItemsProps) {
  const items = ticket.item_details?.length ? ticket.item_details : [];
  const hasAllergies = ticket.allergy_flags && ticket.allergy_flags.length > 0;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      {/* Allergy flags — always fully visible, never truncated */}
      {hasAllergies && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "var(--space-2)",
            padding: "var(--space-2) var(--space-3)",
            background: "var(--color-danger-subtle)",
            border: "1px solid var(--color-danger)",
            borderRadius: "var(--radius-sm)",
            marginBottom: "var(--space-1)",
          }}
          role="alert"
          aria-label="Allergy warning"
        >
          <AlertTriangle
            size={13}
            strokeWidth={2.5}
            style={{
              color: "var(--color-danger)",
              flexShrink: 0,
              marginTop: 1,
            }}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-1)" }}>
            {ticket.allergy_flags.map((flag) => (
              <span
                key={flag}
                style={{
                  fontSize: "var(--text-xs)",
                  fontWeight: "var(--weight-semibold)",
                  color: "var(--color-danger)",
                  background: "var(--color-bg-secondary)",
                  border: "1px solid var(--color-danger)",
                  borderRadius: "var(--radius-xs)",
                  padding: "1px var(--space-2)",
                  textTransform: "uppercase",
                  letterSpacing: "var(--tracking-wide)",
                }}
              >
                {flag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Item list */}
      {items.length === 0 ? (
        <span
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--color-text-muted)",
            fontStyle: "italic",
          }}
        >
          No items
        </span>
      ) : (
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-2)",
          }}
        >
          {items.map((item) => (
            <li
              key={item.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "var(--space-3)",
                padding: "var(--space-2) var(--space-3)",
                background: "var(--color-bg-tertiary)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-border)",
              }}
            >
              {/* Quantity badge */}
              <span
                style={{
                  minWidth: 22,
                  height: 22,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--color-accent-subtle)",
                  color: "var(--color-accent)",
                  borderRadius: "var(--radius-xs)",
                  fontSize: "var(--text-xs)",
                  fontWeight: "var(--weight-semibold)",
                  flexShrink: 0,
                }}
              >
                {item.quantity}
              </span>

              <div style={{ flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    fontSize: "var(--text-base)",
                    fontWeight: "var(--weight-medium)",
                    color: "var(--color-text-primary)",
                    display: "block",
                  }}
                >
                  {item.name}
                </span>
                {item.special_instructions && (
                  <span
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--color-text-muted)",
                      fontStyle: "italic",
                      display: "block",
                      marginTop: 2,
                    }}
                  >
                    {item.special_instructions}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Ticket-level special instructions */}
      {ticket.special_instructions && (
        <div
          style={{
            marginTop: "var(--space-1)",
            padding: "var(--space-2) var(--space-3)",
            background: "var(--color-warning-subtle)",
            border: "1px solid var(--color-warning)",
            borderRadius: "var(--radius-sm)",
            fontSize: "var(--text-xs)",
            color: "var(--color-text-primary)",
            fontStyle: "italic",
          }}
        >
          {ticket.special_instructions}
        </div>
      )}
    </div>
  );
}
