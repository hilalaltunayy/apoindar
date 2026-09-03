import React, { useMemo, useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import {
  Screen,
  Header,
  SegmentedControl,
  Card,
  Text,
  Badge,
  Button,
  Avatar,
  SkeletonCard,
  ErrorState,
  EmptyState,
  Row,
} from "@/components";
import { useI18n, useDateFormat } from "@/i18n";
import { useAsync } from "@/lib/useAsync";
import { queries } from "@/lib/queries";
import { formatMoney } from "@/lib/money";
import { space } from "@/theme";
import type { StudentBookingDTO } from "@/lib/types";

type Tab = "upcoming" | "completed" | "cancelled";

export default function Bookings() {
  const { t } = useI18n();
  const df = useDateFormat();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("upcoming");
  const state = useAsync(() => queries.myBookings(), []);

  const grouped = useMemo(() => {
    const all = state.data?.bookings ?? [];
    return {
      upcoming: all.filter((b) => ["PENDING_PAYMENT", "CONFIRMED"].includes(b.status)),
      completed: all.filter((b) => ["COMPLETED", "NO_SHOW"].includes(b.status)),
      cancelled: all.filter((b) => ["CANCELLED", "REFUNDED"].includes(b.status)),
    };
  }, [state.data]);

  return (
    <Screen refreshing={state.reloading} onRefresh={state.refetch}>
      <Header title={t("bookings.title")} />
      <SegmentedControl
        value={tab}
        onChange={setTab}
        options={[
          { value: "upcoming", label: t("bookings.upcoming") },
          { value: "completed", label: t("bookings.completed") },
          { value: "cancelled", label: t("bookings.cancelled") },
        ]}
      />

      <View style={{ marginTop: space.lg, gap: space.md }}>
        {state.loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : state.error ? (
          <ErrorState kind={state.error} onRetry={state.refetch} />
        ) : grouped[tab].length === 0 ? (
          <EmptyState
            glyph="📅"
            title={t("bookings.empty")}
            body={t("bookings.emptyBody")}
            action={{ label: t("home.discover"), onPress: () => router.push("/(student)/search") }}
          />
        ) : (
          grouped[tab].map((b) => (
            <BookingRow key={b.id} booking={b} onPay={() => router.push(`/book/${b.listingId}?pay=${b.id}`)} dfDay={df.day} />
          ))
        )}
      </View>
    </Screen>
  );
}

function BookingRow({
  booking,
  onPay,
  dfDay,
}: {
  booking: StudentBookingDTO;
  onPay: () => void;
  dfDay: (d: Date) => string;
}) {
  const { t } = useI18n();
  const needsPayment = booking.status === "PENDING_PAYMENT" || booking.paymentStatus === "REQUIRES_PAYMENT";
  return (
    <Card>
      <Row style={{ justifyContent: "space-between" }}>
        <Row gap={space.sm}>
          <Avatar uri={booking.provider?.photoUrl} name={booking.provider?.displayName} size={40} />
          <View>
            <Text variant="label">{booking.listing.title}</Text>
            <Text variant="caption">{booking.provider?.displayName}</Text>
          </View>
        </Row>
        <Badge
          label={t(`status.${booking.status}`)}
          tone={booking.status === "CONFIRMED" ? "success" : needsPayment ? "danger" : "neutral"}
        />
      </Row>
      <Row style={{ justifyContent: "space-between", marginTop: space.sm }}>
        <Text variant="caption">
          {booking.scheduledAt ? dfDay(new Date(booking.scheduledAt)) : t("booking.toArrange")}
        </Text>
        <Text variant="label">{formatMoney(booking.grossAmount, booking.currency)}</Text>
      </Row>
      {needsPayment ? (
        <Button label={t("bookings.completePayment")} size="sm" onPress={onPay} style={{ marginTop: space.md }} />
      ) : null}
    </Card>
  );
}
