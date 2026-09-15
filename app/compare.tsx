import * as Clipboard from "expo-clipboard";
import React, { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, TextInput, View } from "react-native";

import { BannerAdSlot } from "@/components/BannerAdSlot";
import { Button, Screen, Text } from "@/components/ui";
import { t } from "@/i18n";
import { siblingFit } from "@/logic/sound";
import { useShortlistStore } from "@/store/useShortlistStore";
import { useTheme } from "@/theme";

const MIN_TOUCH_TARGET = 44;

/**
 * The partner comparison and the sibling matcher.
 *
 * Neither touches a network. The partner code carries the list itself, and the sibling fit is
 * computed from the two names — so both work on a plane, and no name a couple is weighing up
 * is ever sent anywhere.
 */
export default function Compare() {
  const { colors, spacing, radius } = useTheme();

  const shortlist = useShortlistStore((s) => s.shortlist);
  const partner = useShortlistStore((s) => s.partner);
  const myCode = useShortlistStore((s) => s.myCode)();
  const setPartnerCode = useShortlistStore((s) => s.setPartnerCode);
  const clearPartner = useShortlistStore((s) => s.clearPartner);
  const agreed = useShortlistStore((s) => s.agreed)();

  const [code, setCode] = useState("");
  const [sibling, setSibling] = useState("");

  const copy = useCallback(() => {
    if (!myCode) return;
    void Clipboard.setStringAsync(myCode);
    Alert.alert(t("codeCopied"));
  }, [myCode]);

  const applyCode = useCallback(() => {
    if (setPartnerCode(code) === "empty") clearPartner();
  }, [code, setPartnerCode, clearPartner]);

  const fits = sibling.trim()
    ? shortlist.map((name) => ({ name, fit: siblingFit(sibling, name) }))
    : [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Screen scroll>

        <Text variant="micro" tone="faint" style={{ marginTop: spacing.lg }}>
          {t("myCodeLabel").toUpperCase()}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("copyCode")}
          onPress={copy}
          style={{
            minHeight: MIN_TOUCH_TARGET,
            justifyContent: "center",
            paddingHorizontal: spacing.base,
            marginTop: spacing.xs,
            borderRadius: radius.md,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text variant="caption" tone={myCode ? "default" : "faint"}>
            {myCode || t("shortlistEmpty")}
          </Text>
        </Pressable>

        <Text variant="micro" tone="faint" style={{ marginTop: spacing.lg }}>
          {t("partnerCodeLabel").toUpperCase()}
        </Text>
        <View style={[styles.row, { gap: spacing.sm, marginTop: spacing.xs }]}>
          <TextInput
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder={t("pasteCode")}
            placeholderTextColor={colors.textFaint}
            accessibilityLabel={t("partnerCodeLabel")}
            style={{
              flex: 1,
              minHeight: MIN_TOUCH_TARGET,
              color: colors.text,
              backgroundColor: colors.surfaceAlt,
              borderRadius: radius.md,
              paddingHorizontal: spacing.md,
            }}
          />
          <Button label={t("compareTitle")} onPress={applyCode} />
        </View>

        {partner.length > 0 ? (
          <>
            <Text
              variant="micro"
              tone="faint"
              style={{ marginTop: spacing.lg }}
            >
              {t("agreedTitle").toUpperCase()}
            </Text>
            {agreed.length === 0 ? (
              <Text
                variant="caption"
                tone="muted"
                style={{ marginTop: spacing.xs }}
              >
                {t("agreedEmpty")}
              </Text>
            ) : (
              agreed.map((name) => (
                <View
                  key={name}
                  style={{
                    minHeight: MIN_TOUCH_TARGET,
                    justifyContent: "center",
                    paddingHorizontal: spacing.base,
                    marginTop: spacing.xs,
                    borderRadius: radius.md,
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.accent,
                  }}
                >
                  <Text variant="bodyStrong">{name}</Text>
                </View>
              ))
            )}
          </>
        ) : null}

        <Text variant="micro" tone="faint" style={{ marginTop: spacing.xl }}>
          {t("siblingTitle").toUpperCase()}
        </Text>
        <TextInput
          value={sibling}
          onChangeText={setSibling}
          autoCapitalize="words"
          autoCorrect={false}
          placeholder={t("siblingPrompt")}
          placeholderTextColor={colors.textFaint}
          accessibilityLabel={t("siblingPrompt")}
          style={{
            minHeight: MIN_TOUCH_TARGET,
            marginTop: spacing.xs,
            color: colors.text,
            backgroundColor: colors.surfaceAlt,
            borderRadius: radius.md,
            paddingHorizontal: spacing.md,
          }}
        />

        {fits.length === 0 ? (
          <Text
            variant="caption"
            tone="muted"
            style={{ marginTop: spacing.sm }}
          >
            {t("shortlistEmpty")}
          </Text>
        ) : (
          [...fits]
            .sort((a, b) => b.fit.score - a.fit.score)
            .map(({ name, fit }) => (
              <View
                key={name}
                style={{
                  padding: spacing.base,
                  marginTop: spacing.sm,
                  borderRadius: radius.md,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <View style={styles.row}>
                  <Text variant="bodyStrong" style={{ flex: 1 }}>
                    {name}
                  </Text>
                  <Text variant="bodyStrong" tone="accent">
                    {t("fitScore", { n: String(fit.score) })}
                  </Text>
                </View>
                {/* The three flags are shown beside the score on purpose: a bare number
                    invites the reader to believe there is more behind it than there is. */}
                {fit.sameSyllables ? (
                  <Text variant="caption" tone="muted">
                    {t("fitSameSyllables")}
                  </Text>
                ) : null}
                {fit.endsAlike ? (
                  <Text variant="caption" tone="muted">
                    {t("fitSameEnding")}
                  </Text>
                ) : null}
                {fit.alliterates ? (
                  <Text variant="caption" tone="muted">
                    {t("fitSameInitial")}
                  </Text>
                ) : null}
              </View>
            ))
        )}

        <Text variant="micro" tone="faint" style={{ marginTop: spacing.md }}>
          {t("fitCaveat")}
        </Text>
      </Screen>
      <BannerAdSlot />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
});
