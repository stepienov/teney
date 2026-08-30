"use client";

import { Check, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { PageEmpty, pageRowClass } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import type {
  InviteDeliveryChannel,
  InviteIncomingDto,
} from "@/lib/types/invites";
import { cn } from "@/lib/utils";

type InviteIncomingListProps = {
  invites: InviteIncomingDto[];
  isLoading?: boolean;
  loadingMessage: string;
  emptyMessage: string;
  onAccept: (token: string) => void;
  onDecline: (token: string) => void;
  pending?: boolean;
};

function deliveryLabel(
  channel: InviteDeliveryChannel,
  t: ReturnType<typeof useTranslations<"invites">>,
): string {
  switch (channel) {
    case "EMAIL":
      return t("deliveryEmail");
    case "MESSENGER":
      return t("deliveryMessenger");
    case "LINK_COPY":
      return t("deliveryLink");
  }
}

export function InviteIncomingList({
  invites,
  isLoading,
  loadingMessage,
  emptyMessage,
  onAccept,
  onDecline,
  pending = false,
}: InviteIncomingListProps) {
  const t = useTranslations("invites");

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">{loadingMessage}</p>;
  }

  if (invites.length === 0) {
    return (
      <PageEmpty>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </PageEmpty>
    );
  }

  return (
    <ul className="space-y-2">
      {invites.map((invite) => (
        <li
          key={invite.inboxEntryId}
          className={cn(
            pageRowClass,
            "flex items-center justify-between gap-3",
            invite.unread && "border-brand/30 bg-brand-muted/30",
          )}
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">{invite.title}</p>
            <p className="text-xs text-muted-foreground">{invite.subtitle}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {invite.inviter.displayName ?? invite.inviter.email}
            </p>
            <p className="text-xs text-muted-foreground">
              {deliveryLabel(invite.deliveryChannel, t)}
              {invite.deliveryHint ? ` · ${invite.deliveryHint}` : null}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => onAccept(invite.token)}
              disabled={pending}
            >
              <Check className="size-3.5" aria-hidden />
              {t("accept")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onDecline(invite.token)}
              disabled={pending}
            >
              <X className="size-3.5" aria-hidden />
              {t("decline")}
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
