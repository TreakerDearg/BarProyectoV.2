import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
} from "react-native";
import { X, QrCode, Keyboard } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Colors } from "../theme/colors";
import { Typography, Spacing, Radius, Elevation } from "../theme/";
import { lookupTableByCode } from "../api/tableApi";
import { useSessionStore } from "../stores/useSessionStore";
import { getErrorMessage } from "../api/client";

interface QRScannerScreenProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const QRScannerScreen: React.FC<QRScannerScreenProps> = ({ onClose, onSuccess }) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'camera' | 'keyboard'>('camera');
  const [scannedRef, setScannedRef] = useState(false);
  const setTableSession = useSessionStore((s) => s.setTableSession);

  // Camera permission
  const [permission, requestPermission] = useCameraPermissions();

  // Request permission on mount and switch to keyboard if denied
  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) {
      if (permission.canAskAgain) {
        requestPermission().then((result) => {
          if (!result.granted) setMode('keyboard');
        });
      } else {
        setMode('keyboard');
      }
    }
  }, [permission?.granted]);

  // Animations for keyboard mode
  const boxScaleAnims = useRef(
    Array.from({ length: 3 }, () => new Animated.Value(1))
  ).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  const handleValidateCode = async (codeToTest?: string) => {
    const finalCode = (codeToTest || code).trim();
    if (finalCode.length !== 3) {
      Alert.alert("Código inválido", "El código de mesa debe tener 3 dígitos.");
      return;
    }

    setLoading(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const res = await lookupTableByCode(finalCode);

      setTableSession(res.tableId, res.sessionId, res.tableNumber, res.tableCode);

      // Success animation (keyboard mode)
      Animated.stagger(80, boxScaleAnims.map((anim) =>
        Animated.sequence([
          Animated.timing(anim, { toValue: 1.05, duration: 100, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 1, duration: 100, useNativeDriver: true }),
        ])
      )).start();
      Animated.timing(successAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("¡Mesa Conectada!", `Te has vinculado a la Mesa #${res.tableNumber}. Ya puedes pedir directo a barra.`);
      onSuccess();
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error de conexión", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scannedRef) return;
    if (/^\d{3}$/.test(data)) {
      setScannedRef(true);
      handleValidateCode(data);
    } else {
      Alert.alert("Código inválido", "El QR no contiene un código de mesa válido.");
    }
  };

  const handleKeyPress = (num: string) => {
    if (code.length < 3) {
      Haptics.selectionAsync();
      const newCode = code + num;
      setCode(newCode);
      if (newCode.length === 3) {
        handleValidateCode(newCode);
      }
    }
  };

  const handleBackspace = () => {
    Haptics.selectionAsync();
    setCode((prev) => prev.slice(0, -1));
  };

  const toggleMode = () => {
    setMode((m) => (m === 'camera' ? 'keyboard' : 'camera'));
    setScannedRef(false);
    setCode('');
    successAnim.setValue(0);
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <QrCode size={22} color={Colors.primary} />
          <Text style={styles.headerTitle}>Conectar Mesa</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={toggleMode} style={styles.modeBtn}>
            {mode === 'camera' ? (
              <Keyboard size={20} color={Colors.onSurfaceVariant} />
            ) : (
              <QrCode size={20} color={Colors.onSurfaceVariant} />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={22} color={Colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
      </View>

      {/* CAMERA MODE */}
      {mode === 'camera' && (
        <View style={styles.cameraContainer}>
          {permission?.granted ? (
            <>
              <CameraView
                style={styles.cameraView}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={handleBarcodeScanned}
              />
              {/* Dark overlay with gold-bordered square */}
              <View style={styles.cameraOverlay}>
                <View style={styles.cameraTopDark} />
                <View style={styles.cameraMiddleRow}>
                  <View style={styles.cameraSideDark} />
                  <View style={styles.cameraScanBox} />
                  <View style={styles.cameraSideDark} />
                </View>
                <View style={styles.cameraBottomDark}>
                  <Text style={styles.cameraInstructions}>
                    Apuntá al código QR de tu mesa
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.cameraPermDenied}>
              <QrCode size={48} color={Colors.outline} />
              <Text style={styles.cameraPermText}>
                Permiso de cámara denegado. Usá el teclado numérico.
              </Text>
            </View>
          )}
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          )}
        </View>
      )}

      {/* KEYBOARD MODE */}
      {mode === 'keyboard' && (
        <View style={styles.content}>
          <Text style={styles.instructions}>
            Ingresá el código numérico de 3 dígitos visible en el posavasos o pantalla del camarero.
          </Text>

          {/* CODE DISPLAY */}
          <View style={styles.codeDisplay}>
            {[0, 1, 2].map((idx) => {
              const isFilled = !!code[idx];
              return (
                <Animated.View
                  key={idx}
                  style={[
                    styles.codeBox,
                    isFilled && styles.codeBoxFilled,
                    { transform: [{ scale: boxScaleAnims[idx] }] },
                  ]}
                >
                  {/* success overlay */}
                  <Animated.View
                    style={[styles.codeBoxSuccess, { opacity: successAnim }]}
                  />
                  <Text style={styles.codeText}>{code[idx] || "—"}</Text>
                </Animated.View>
              );
            })}
          </View>

          {loading && <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />}

          {/* NUMERIC KEYPAD */}
          <View style={styles.keypad}>
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((key) => (
              <TouchableOpacity
                key={key}
                style={styles.key}
                onPress={() => handleKeyPress(key)}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={styles.keyText}>{key}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.key, styles.backspaceKey]}
              onPress={handleBackspace}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.keyText}>C</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.key}
              onPress={() => handleKeyPress("0")}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.keyText}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.key, styles.okKey]}
              onPress={() => handleValidateCode()}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.okText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.gutter,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  headerTitle: {
    ...Typography.headlineSm,
    color: Colors.onSurface,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  modeBtn: {
    padding: 6,
  },
  closeBtn: {
    padding: 6,
  },

  // Camera mode
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  cameraView: {
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cameraTopDark: {
    flex: 1,
    backgroundColor: 'rgba(16,19,26,0.70)',
  },
  cameraMiddleRow: {
    flexDirection: 'row',
    height: 220,
  },
  cameraSideDark: {
    flex: 1,
    backgroundColor: 'rgba(16,19,26,0.70)',
  },
  cameraScanBox: {
    width: 220,
    height: 220,
    borderWidth: 2,
    borderColor: Colors.primaryContainer,
    borderRadius: Radius.xl,
  },
  cameraBottomDark: {
    flex: 1,
    backgroundColor: 'rgba(16,19,26,0.70)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: Spacing.lg,
  },
  cameraInstructions: {
    ...Typography.bodyMd,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  cameraPermDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.gutter,
  },
  cameraPermText: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(16,19,26,0.6)',
  },

  // Keyboard mode
  content: {
    flex: 1,
    padding: Spacing.gutter,
    alignItems: "center",
    justifyContent: "space-between",
  },
  instructions: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 10,
  },
  codeDisplay: {
    flexDirection: "row",
    gap: Spacing.md,
    marginVertical: Spacing.gutter,
  },
  codeBox: {
    width: 72,
    height: 84,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surfaceContainer,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    justifyContent: "center",
    alignItems: "center",
    position: 'relative',
    overflow: 'hidden',
  },
  codeBoxFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  codeBoxSuccess: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderColor: Colors.success,
    borderWidth: 2,
    borderRadius: Radius.xl,
    backgroundColor: 'rgba(52,185,100,0.08)',
  },
  codeText: {
    ...Typography.displayLg,
    color: Colors.onSurface,
  },
  keypad: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    maxWidth: 320,
    justifyContent: "center",
    gap: Spacing.smMd,
    marginBottom: Spacing.gutter,
  },
  key: {
    width: 80,
    height: 65,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceContainer,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    justifyContent: "center",
    alignItems: "center",
  },
  keyText: {
    ...Typography.headlineSm,
    color: Colors.onSurface,
  },
  backspaceKey: {
    backgroundColor: Colors.surfaceContainerHigh,
  },
  okKey: {
    backgroundColor: Colors.primaryContainer,
    ...(Elevation.goldCTA as object),
  },
  okText: {
    ...Typography.labelLg,
    color: Colors.onPrimary,
  },
});
