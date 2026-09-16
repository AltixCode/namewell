import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, TextInput, View } from "react-native";

import { BannerAdSlot } from "@/components/BannerAdSlot";
import { Button, Screen, Text } from "@/components/ui";
import { t, type TranslationKey } from "@/i18n";
import { type Gender, filterNames, syllablesForEntry } from "@/logic/names";
import { syllablesOf } from "@/logic/sound";
import { FREE_SHORTLIST, useShortlistStore } from "@/store/useShortlistStore";
import { usePremiumStore } from "@/store/usePremiumStore";
import { useTheme } from "@/theme";

const MIN_TOUCH_TARGET = 44;

const GENDERS: { id: Gender | "all"; key: TranslationKey }[] = [
  { id: "all", key: "genderAll" },
  { id: "girl", key: "genderGirl" },
  { id: "boy", key: "genderBoy" },
  { id: "either", key: "genderEither" },
];

export default function Browse() {
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();

  const isPremium = usePremiumStore((s) => s.isPremium);
  const shortlist = useShortlistStore((s) => s.shortlist);
  const add = useShortlistStore((s) => s.add);
  const remove = useShortlistStore((s) => s.remove);

  const [query, setQuery] = useState("");
  const [gender, setGender] = useState<Gender | "all">("all");

  const results = useMemo(
    () => filterNames({ query, gender }, syllablesOf),
    [query, gender],
  );
  const listed = useMemo(
    () => new Set(shortlist.map((n) => n.toLowerCase())),
    [shortlist],
  );

  const toggle = useCallback(
    (name: string) => {
      if (listed.has(name.toLowerCase())) {
        remove(name);
        return;
      }
      if (add(name, isPremium) === "limit-reached") {
        Alert.alert(t("shortlistLimitTitle"), t("unlockBody"), [
          { text: t("cancel"), style: "cancel" },
          { text: t("removeAdsCta"), onPress: () => router.push("/paywall") },
        ]);
        return;
      }
      void Haptics.selectionAsync();
    },
    [listed, remove, add, isPremium, router],
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* topInset, because this route sets headerShown:false -- with no
          navigation header above it, nothing else pays the notch, and the
          title renders underneath the status bar. */}
      <Screen scroll topInset>
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text variant="display">{t("appName")}</Text>
            <Text variant="caption" tone="muted">
              {isPremium
                ? `${shortlist.length}`
                : t("shortlistCount", {
                    n: String(shortlist.length),
                    max: String(FREE_SHORTLIST),
                  })}
            </Text>
          </View>
          <Button
            label={t("compareTitle")}
            variant="ghost"
            onPress={() => router.push("/compare")}
          />
        </View>

        <TextInput
          value={query}
          onChangeText={setQuery}
          autoCapitalize="words"
          autoCorrect={false}
          placeholder={t("searchLabel")}
          placeholderTextColor={colors.textFaint}
          accessibilityLabel={t("searchLabel")}
          style={{
            minHeight: MIN_TOUCH_TARGET,
            marginTop: spacing.md,
            color: colors.text,
            backgroundColor: colors.surfaceAlt,
            borderRadius: radius.md,
            paddingHorizontal: spacing.md,
          }}
        />

        <View
          style={[styles.chips, { gap: spacing.sm, marginTop: spacing.sm }]}
        >
          {GENDERS.map((option) => (
            <Pressable
              key={option.id}
              accessibilityRole="radio"
              accessibilityLabel={t(option.key)}
              accessibilityState={{ selected: gender === option.id }}
              onPress={() => setGender(option.id)}
              style={{
                minHeight: MIN_TOUCH_TARGET,
                justifyContent: "center",
                paddingHorizontal: spacing.base,
                borderRadius: radius.full,
                backgroundColor: colors.surfaceAlt,
                borderWidth: gender === option.id ? 2 : 1,
                borderColor:
                  gender === option.id ? colors.accent : colors.border,
              }}
            >
              <Text variant="caption">{t(option.key)}</Text>
            </Pressable>
          ))}
        </View>

        {results.length === 0 ? (
          <Text
            variant="caption"
            tone="muted"
            style={{ marginTop: spacing.lg }}
          >
            {t("noResults")}
          </Text>
        ) : (
          results.map((entry) => {
            const saved = listed.has(entry.name.toLowerCase());
            return (
              <Pressable
                key={entry.name}
                accessibilityRole="button"
                accessibilityLabel={
                  saved
                    ? t("removeFromList", { name: entry.name })
                    : t("addToList", { name: entry.name })
                }
                onPress={() => toggle(entry.name)}
                style={{
                  minHeight: MIN_TOUCH_TARGET,
                  padding: spacing.base,
                  marginTop: spacing.sm,
                  borderRadius: radius.md,
                  backgroundColor: colors.surface,
                  borderWidth: saved ? 2 : 1,
                  borderColor: saved ? colors.accent : colors.border,
                }}
              >
                <Text variant="bodyStrong">{entry.name}</Text>
                <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>
                  {`${t("originLabel")}: ${entry.origin}`}
                </Text>
                <Text variant="caption" tone="muted">
                  {`${t("meaningLabel")}: ${entry.meaning}`}
                </Text>
                <Text variant="micro" tone="faint" style={{ marginTop: 2 }}>
                  {t("syllablesLabel", {
                    n: String(syllablesForEntry(entry, syllablesOf)),
                  })}
                </Text>
              </Pressable>
            );
          })
        )}

        <Text variant="micro" tone="faint" style={{ marginTop: spacing.lg }}>
          {t("englishNote")}
        </Text>
        <Text variant="micro" tone="faint" style={{ marginTop: spacing.xs }}>
          {t("noPopularityNote")}
        </Text>

        <Button
          label={t("settingsTitle")}
          variant="ghost"
          fullWidth
          onPress={() => router.push("/settings")}
          style={{ marginTop: spacing.md }}
        />
      </Screen>
      <BannerAdSlot />
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: "row", alignItems: "center" },
  chips: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
});
