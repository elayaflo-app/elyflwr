import { useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing, radius } from "@/src/theme";
import { useAuth } from "@/src/auth";

export default function AdminSignIn() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSignIn = async () => {
    if (!email || !password) { setErr("Enter your administrator email and password"); return; }
    setLoading(true); setErr(null);
    try {
      const u = await login(email.trim(), password, ["admin"]);
      if (u.role === "admin") router.replace("/(admin)/overview");
    } catch (e: any) {
      setErr(e.message || "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root} testID="admin-signin-screen">
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Pressable testID="admin-back-btn" onPress={() => router.replace("/")} style={styles.closeBtn}>
          <Text style={{ color: "#FFFFFF", fontSize: 18 }}>←</Text>
        </Pressable>
        <Text style={styles.headerBadge}>SECURE AREA</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]} keyboardShouldPersistTaps="handled">
          <View style={styles.logoWrap}>
            <View style={styles.shield}><Text style={{ fontSize: 34 }}>🛡️</Text></View>
            <Text style={styles.brand}>Elaya Admin</Text>
            <Text style={styles.subtitle}>Administrator Portal — authorized access only</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.field}>
              <Text style={styles.label}>Admin Email</Text>
              <TextInput
                testID="admin-email-input"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="admin@elaya.ph"
                placeholderTextColor="rgba(255,255,255,0.4)"
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                testID="admin-password-input"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="••••••••"
                placeholderTextColor="rgba(255,255,255,0.4)"
                style={styles.input}
              />
            </View>

            {err ? <Text testID="admin-signin-error" style={styles.err}>{err}</Text> : null}

            <Pressable testID="admin-signin-btn" onPress={onSignIn} disabled={loading} style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}>
              <LinearGradient colors={["#FF7EB3", "#FF758C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctaBg}>
                {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.ctaText}>Sign In as Admin</Text>}
              </LinearGradient>
            </Pressable>
          </View>

          <Pressable testID="admin-to-signup" onPress={() => router.push("/(auth)/admin-sign-up")} style={{ marginTop: spacing.xl }}>
            <Text style={styles.footerLink}>Need an admin account? <Text style={{ color: colors.brandSecondary, fontWeight: "700" }}>Create one</Text></Text>
          </Pressable>

          <Pressable testID="admin-to-user-signin" onPress={() => router.replace("/(auth)/sign-in")} style={{ marginTop: spacing.md }}>
            <Text style={styles.footerLink}>Not an admin? <Text style={{ color: colors.brandSecondary, fontWeight: "700" }}>Customer / Shop Owner sign-in</Text></Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceInverse },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  headerBadge: { color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: "800", letterSpacing: 2 },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.xxl, flexGrow: 1 },
  logoWrap: { alignItems: "center", gap: spacing.sm, marginBottom: spacing.xl },
  shield: { width: 76, height: 76, borderRadius: 38, backgroundColor: "rgba(255,255,255,0.1)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  brand: { fontSize: 30, fontWeight: "300", fontStyle: "italic", color: "#FFFFFF", marginTop: spacing.sm },
  subtitle: { color: "rgba(255,255,255,0.6)", fontSize: 13, textAlign: "center" },
  card: { backgroundColor: "rgba(255,255,255,0.06)", borderRadius: radius.lg, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", padding: spacing.lg, gap: spacing.md },
  field: { gap: spacing.xs },
  label: { color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: "600" },
  input: { backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 14, fontSize: 15, color: "#FFFFFF" },
  err: { color: "#FFB3C0", fontSize: 13 },
  cta: { borderRadius: radius.pill, overflow: "hidden", marginTop: spacing.sm },
  ctaBg: { paddingVertical: 16, alignItems: "center" },
  ctaText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  footerLink: { textAlign: "center", color: "rgba(255,255,255,0.7)", fontSize: 14 },
});
