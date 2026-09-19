import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Text } from "@/components/ui";
import { t } from "@/i18n";
import { PRIVACY_POLICY_URL, TERMS_URL } from "@/monetization/config";
import { usePremiumStore } from "@/store/usePremiumStore";
import { useTheme } from "@/theme";
import { useTabletColumn } from "../src/theme/useTabletColumn";

/**
 * The one purchase this app sells: a lifetime non-consumable that removes the ads and unlocks
 * everything. There is deliberately no plan picker — a second option would be a subscription,
 * and the portfolio does not sell those.
 */
const BENEFIT_KEYS = [
  { title: "feat1Title", desc: "feat1Desc" },
  { title: "feat2Title", desc: "feat2Desc" },
  { title: "feat3Title", desc: "feat3Desc" },
  { title: "feat4Title", desc: "feat4Desc" },
] as const;

// How much of the trailing card peeks past the viewport edge, as a fraction
// of the card's own width -- this is what makes the row read as "there is
// more" without a dot or an arrow telling you so.
const PEEK_FRACTION = 0.82;
const CARD_GAP = 14;

/**
 * A swipe-only benefit carousel with a scroll-position progress bar instead
 * of dots or arrows. No `Animated` value here on purpose: the bar only needs
 * to redraw at `scrollEventThrottle` cadence, which plain state easily
 * covers, and it keeps this file's carousel mechanics visibly different from
 * the sibling apps' (one uses a paging ScrollView with dots, one an
 * Animated.ScrollView with scaling cards, one a FlatList with arrow buttons).
 */
export default function Paywall() {
  /**
   * Only the claims this app can actually make.
   *
   * Four slots is what this template offers, not a quota to fill. An app whose
   * purchase removes the ads and nothing else has one honest thing to say about
   * it, and padding to four is how "Everything unlocked -- every level, every
   * mode and the full archive" ends up on a paywall for an app with no levels,
   * no modes and no archive.
   *
   * A benefit whose title is blank is dropped, so cutting a claim is a one-line
   * edit in `i18n` rather than a component change. Computed per render, not at
   * module load, so it follows the active locale.
   */
  const benefits = BENEFIT_KEYS.filter((b) => t(b.title).trim().length > 0);
  const router = useRouter();
  const tabletColumn = useTabletColumn(640);
  const insets = useSafeAreaInsets();
  const { colors, spacing, radius } = useTheme();

  const lifetime = usePremiumStore((s) => s.lifetime);
  const offeringsResolved = usePremiumStore((s) => s.offeringsResolved);
  const isPremium = usePremiumStore((s) => s.isPremium);
  const isPurchasing = usePremiumStore((s) => s.isPurchasing);
  const error = usePremiumStore((s) => s.error);
  const purchase = usePremiumStore((s) => s.purchase);
  const restore = usePremiumStore((s) => s.restore);
  // A restore that finds nothing must SAY so.
  // `restore()` returned 'none' and the screen rendered nothing at all, so
  // the button read as broken -- and App Review taps Restore on every
  // submission. The string already existed in all fourteen locales; it was
  // simply never shown on this paywall shape.
  const [restoreNotice, setRestoreNotice] = useState<string | null>(null);
  const refreshOfferings = usePremiumStore((s) => s.refreshOfferings);

  // Carousel geometry + swipe progress. `viewportWidth` is measured on layout
  // (it depends on the tablet column, not the raw screen width), and
  // `scrollX`/`contentWidth` come straight off the ScrollView's own events --
  // the progress bar is a pure function of those three numbers.
  const [viewportWidth, setViewportWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [scrollX, setScrollX] = useState(0);

  const cardWidth = viewportWidth > 0 ? viewportWidth * PEEK_FRACTION : 0;
  const maxScroll = Math.max(contentWidth - viewportWidth, 1);
  const progressPct = Math.min(1, Math.max(0, scrollX / maxScroll));

  const onCarouselLayout = (e: LayoutChangeEvent) => {
    setViewportWidth(e.nativeEvent.layout.width);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollX(e.nativeEvent.contentOffset.x);
  };

  useEffect(() => {
    void refreshOfferings();
  }, [refreshOfferings]);

  // A user who already owns it must never be left staring at a buy button.
  useEffect(() => {
    if (isPremium) router.back();
  }, [isPremium, router]);

  const price = lifetime?.product.priceString;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: insets.top,
      }}
    >
      <View style={{ alignItems: "flex-end", padding: spacing.base }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("close")}
          hitSlop={12}
          onPress={() => router.back()}
          style={{
            minWidth: 44,
            minHeight: 44,
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <Text variant="body" tone="muted">
            {t("close")}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: spacing.xl,
          paddingBottom: spacing["3xl"],
          ...tabletColumn,
          flexGrow: 1,
          justifyContent: "center",
        }}
      >
        <Text variant="micro" tone="accent">
          {t("antiSubTitle")}
        </Text>
        <Text variant="display" style={{ marginTop: spacing.xs }}>
          {t("paywallTitle")}
        </Text>
        <Text variant="body" tone="muted" style={{ marginTop: spacing.sm }}>
          {t("antiSubHeadline")}
        </Text>

        {/* Peek carousel: cards are sized to PEEK_FRACTION of the viewport so
            the next card is always visibly cut off at the trailing edge --
            that's the only "there's more" affordance here. No dot row, no
            arrow buttons; the thin bar under it is the sole progress cue,
            filled directly from scroll position. */}
        <View
          style={{ marginTop: spacing["2xl"] }}
          onLayout={onCarouselLayout}
          accessibilityRole="none"
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={cardWidth > 0 ? cardWidth + CARD_GAP : undefined}
            snapToAlignment="start"
            scrollEventThrottle={16}
            onScroll={onScroll}
            onContentSizeChange={(w) => setContentWidth(w)}
            contentContainerStyle={{ gap: CARD_GAP }}
          >
            {benefits.map((benefit) => (
              <View
                key={benefit.title}
                style={{
                  width: cardWidth || undefined,
                  minHeight: 132,
                  padding: spacing.lg,
                  borderRadius: radius.lg,
                  borderWidth: 1,
                  borderColor: colors.border,
                  justifyContent: "center",
                }}
              >
                <Text variant="bodyStrong">{t(benefit.title)}</Text>
                <Text
                  variant="caption"
                  tone="muted"
                  style={{ marginTop: spacing.xs }}
                >
                  {t(benefit.desc)}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View
            testID="paywall-progress-track"
            style={{
              marginTop: spacing.md,
              height: 4,
              borderRadius: radius.full,
              backgroundColor: colors.border,
              overflow: "hidden",
            }}
          >
            <View
              testID="paywall-progress-fill"
              style={{
                width: `${progressPct * 100}%`,
                height: "100%",
                borderRadius: radius.full,
                backgroundColor: colors.accent,
              }}
            />
          </View>
        </View>

        <View style={{ marginTop: spacing["2xl"] }}>
          {lifetime ? (
            <Button
              label={
                price
                  ? t("lifetimeAccess", { price })
                  : t("lifetimeAccessPlain")
              }
              size="lg"
              fullWidth
              loading={isPurchasing}
              onPress={() => void purchase(lifetime)}
            />
          ) : offeringsResolved ? (
            // Resolved, with no package: the store is genuinely unreachable or carries no
            // product yet. Say that, and keep Restore reachable below — a user who already
            // paid must still be able to get their purchase back.
            <View style={{ padding: spacing.xl, alignItems: "center" }}>
              <Text variant="caption" tone="muted" align="center">
                {t("storeUnavailable")}
              </Text>
            </View>
          ) : (
            <View style={{ padding: spacing.xl, alignItems: "center" }}>
              <ActivityIndicator color={colors.textMuted} />
              <Text
                variant="caption"
                tone="muted"
                style={{ marginTop: spacing.md }}
              >
                {t("loadingPrice")}
              </Text>
            </View>
          )}
          <Text
            variant="caption"
            tone="muted"
            align="center"
            style={{ marginTop: spacing.md }}
          >
            {t("oneTimePayment")}
          </Text>
        </View>

        {error ? (
          <Text
            variant="caption"
            tone="danger"
            align="center"
            style={{ marginTop: spacing.base }}
          >
            {error}
          </Text>
        ) : null}

        {restoreNotice ? (
          <Text
            accessibilityRole="alert"
            variant="caption"
            tone="muted"
            align="center"
            style={{ marginTop: spacing.base }}
          >
            {restoreNotice}
          </Text>
        ) : null}

        <Button
          label={t("restorePurchases")}
          variant="ghost"
          fullWidth
          onPress={() => {
            setRestoreNotice(null);
            void restore().then((outcome) => {
              if (outcome === "none") setRestoreNotice(t("noPriorPurchases"));
            });
          }}
          style={{ marginTop: spacing.lg }}
        />

        <Text
          variant="micro"
          tone="faint"
          align="center"
          style={{ marginTop: spacing.xl }}
        >
          {t("adsDisclosure")}
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: spacing.lg,
            marginTop: spacing.md,
          }}
        >
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={t("termsOfUse")}
            hitSlop={12}
            onPress={() => void Linking.openURL(TERMS_URL)}
          >
            <Text variant="micro" tone="faint">
              {t("termsOfUse")}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={t("privacyPolicy")}
            hitSlop={12}
            onPress={() => void Linking.openURL(PRIVACY_POLICY_URL)}
          >
            <Text variant="micro" tone="faint">
              {t("privacyPolicy")}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
