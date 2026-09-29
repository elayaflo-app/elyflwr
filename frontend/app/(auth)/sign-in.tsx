import { useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { colors, spacing, radius } from "@/src/theme";
import { useAuth } from "@/src/auth";

export default function SignIn() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSignIn = async () => {
    if (!email || !password) { setErr("Enter your email and password"); return; }
    setLoading(true); setErr(null);
    try {
      const u = await login(email.trim(), password, ["customer", "flower_owner"]);
      if (u.role === "customer") router.replace("/(customer)/home");
      else if (u.role === "flower_owner") router.replace("/(owner)/dashboard");
    } catch (e: any) { setErr(e.message || "Sign-in failed"); }
    finally { setLoading(false); }
  };

  const fillDemo = (role: "customer" | "owner") => {
    if (role === "customer") { setEmail("customer@elaya.ph"); setPassword("Customer123!"); }
    if (role === "owner") { setEmail("owner@elaya.ph"); setPassword("Owner123!"); }
  };

  return (
    <View style={styles.root}>
      <Image source={{ uri: "https://images.unsplash.com/photo-1561848355-890d054dc55a?w=1200" }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
      <LinearGradient colors={["rgba(255,117,140,0.2)", "rgba(43,30,34,0.75)"]} style={StyleSheet.absoluteFillObject} />
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Pressable testID="close-btn" onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={{ color: "#FFFFFF", fontSize: 18 }}>✕</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.sheetWrap}>
        <ScrollView contentContainerStyle={[styles.sheet, { paddingBottom: insets.bottom + spacing.xl }]} keyboardShouldPersistTaps="handled">
          <View style={styles.handle} />
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue to Elaya</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              testID="email-input"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="you@example.com"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              testID="password-input"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
          </View>

          <Pressable testID="forgot-btn"><Text style={styles.forgot}>Forgot Password?</Text></Pressable>

          {err ? <Text testID="signin-error" style={styles.err}>{err}</Text> : null}

          <Pressable testID="signin-btn" onPress={onSignIn} disabled={loading} style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}>
            <LinearGradient colors={["#FF7EB3", "#FF758C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctaBg}>
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.ctaText}>Sign In</Text>}
            </LinearGradient>
          </Pressable>

          <View style={styles.demoRow}>
            <Text style={styles.demoTitle}>Quick demo login:</Text>
            <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm, flexWrap: "wrap" }}>
              <Pressable testID="demo-customer-btn" onPress={() => fillDemo("customer")} style={styles.chip}><Text style={styles.chipText}>Customer</Text></Pressable>
              <Pressable testID="demo-owner-btn" onPress={() => fillDemo("owner")} style={styles.chip}><Text style={styles.chipText}>Shop Owner</Text></Pressable>
            </View>
          </View>

          <Pressable testID="go-signup-btn" onPress={() => router.push("/(auth)/sign-up")} style={{ marginTop: spacing.lg }}>
            <Text style={styles.footerLink}>New to Elaya? <Text style={{ color: colors.brandPrimary, fontWeight: "700" }}>Create an account</Text></Text>
          </Pressable>

          <Pressable testID="go-admin-signin-btn" onPress={() => router.push("/(auth)/admin-sign-in")} style={{ marginTop: spacing.md }}>
            <Text style={styles.adminLink}>🛡️ Administrator login</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#2B1E22" },
  header: { paddingHorizontal: spacing.lg },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  sheetWrap: { flex: 1, justifyContent: "flex-end" },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: spacing.xl, paddingTop: spacing.md, gap: spacing.md },
  handle: { alignSelf: "center", width: 44, height: 4, backgroundColor: colors.border, borderRadius: 2, marginBottom: spacing.md },
  title: { fontSize: 28, fontWeight: "300", color: colors.onSurface, fontStyle: "italic" },
  subtitle: { color: colors.muted, marginBottom: spacing.sm },
  field: { gap: spacing.xs },
  label: { color: colors.onSurfaceSecondary, fontSize: 13, fontWeight: "600" },
  input: { backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 14, fontSize: 15, color: colors.onSurface },
  forgot: { color: colors.brandPrimary, textAlign: "right", fontWeight: "600", fontSize: 13 },
  err: { color: colors.error, fontSize: 13 },
  cta: { borderRadius: radius.pill, overflow: "hidden", marginTop: spacing.sm },
  ctaBg: { paddingVertical: 16, alignItems: "center" },
  ctaText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  demoRow: { marginTop: spacing.md, padding: spacing.md, backgroundColor: colors.surfaceSecondary, borderRadius: radius.md },
  demoTitle: { color: colors.onSurfaceSecondary, fontSize: 12, fontWeight: "600" },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, backgroundColor: colors.brandTertiary, borderRadius: radius.pill },
  chipText: { color: colors.onBrandTertiary, fontSize: 12, fontWeight: "600" },
  footerLink: { textAlign: "center", color: colors.onSurfaceSecondary, fontSize: 14 },
  adminLink: { textAlign: "center", color: colors.muted, fontSize: 13, fontWeight: "600" },
});
