import React, { useState } from "react";
import { StyleSheet, View, Text, Modal, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { X, Minus, Plus, ShoppingBag } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Colors } from "../theme/colors";
import { Typography, Spacing, Radius, Elevation } from "../theme/";
import type { ProductPublicDTO } from "../types/api";

interface ModifierModalProps {
  visible: boolean;
  product: ProductPublicDTO | null;
  onClose: () => void;
  onConfirm: (product: ProductPublicDTO, quantity: number, notes: string) => void;
}

const PRESET_NOTES = ["Sin hielo", "Poco dulce", "Extra limón", "Sin sorbete", "Bien frío"];

export const ModifierModal: React.FC<ModifierModalProps> = ({
  visible,
  product,
  onClose,
  onConfirm,
}) => {
  if (!product) return null;

  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [selectedPresets, setSelectedPresets] = useState<Set<string>>(new Set());
  const [inputFocused, setInputFocused] = useState(false);

  const unitPrice = product.dynamicPrice || product.price;
  const totalPrice = unitPrice * quantity;

  const handleDecrease = () => {
    if (quantity > 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setQuantity((q) => q - 1);
    }
  };

  const handleIncrease = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setQuantity((q) => q + 1);
  };

  const handlePresetNote = (preset: string) => {
    Haptics.selectionAsync();
    setSelectedPresets((prev) => {
      const next = new Set(prev);
      if (next.has(preset)) {
        next.delete(preset);
      } else {
        next.add(preset);
      }
      // Rebuild notes from selected presets + any free text after comma
      const freeText = notes
        .split(", ")
        .filter((p) => !PRESET_NOTES.includes(p))
        .join(", ");
      const presetText = Array.from(next).join(", ");
      const combined = [presetText, freeText].filter(Boolean).join(", ");
      setNotes(combined);
      return next;
    });
  };

  const handleAdd = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onConfirm(product, quantity, notes);
    setQuantity(1);
    setNotes("");
    setSelectedPresets(new Set());
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.titleArea}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productCategory}>{product.category}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color={Colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body}>
            <Text style={styles.description}>{product.description}</Text>

            {/* NOTAS DE PERSONALIZACIÓN */}
            <Text style={styles.sectionLabel}>Preferencias de Barra (Opcional)</Text>
            <View style={styles.presetContainer}>
              {PRESET_NOTES.map((preset) => {
                const isSelected = selectedPresets.has(preset);
                return (
                  <TouchableOpacity
                    key={preset}
                    style={[styles.presetChip, isSelected && styles.presetChipSelected]}
                    onPress={() => handlePresetNote(preset)}
                  >
                    <Text style={[styles.presetText, isSelected && styles.presetTextSelected]}>
                      {isSelected ? preset : `+ ${preset}`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TextInput
              style={[styles.input, inputFocused && styles.inputFocused]}
              placeholder="¿Alguna instrucción especial para el bartender?"
              placeholderTextColor={Colors.outline}
              value={notes}
              onChangeText={setNotes}
              multiline
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
            />
          </ScrollView>

          {/* FOOTER CON CANTIDAD Y BOTÓN DE AÑADIR */}
          <View style={styles.footer}>
            <View style={styles.stepper}>
              <TouchableOpacity style={styles.stepperBtn} onPress={handleDecrease}>
                <Minus size={16} color={Colors.onSurface} />
              </TouchableOpacity>
              <Text style={styles.stepperCount}>{quantity}</Text>
              <TouchableOpacity style={styles.stepperBtn} onPress={handleIncrease}>
                <Plus size={16} color={Colors.onSurface} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.confirmBtn} onPress={handleAdd} activeOpacity={0.85}>
              <ShoppingBag size={18} color={Colors.onPrimary} />
              <Text style={styles.confirmBtnText}>
                Agregar · ${totalPrice.toLocaleString("es-AR")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.surfaceContainer,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    maxHeight: "85%",
    paddingBottom: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.outlineVariant,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.gutter,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
  },
  titleArea: {
    flex: 1,
  },
  productName: {
    ...Typography.headlineSm,
    color: Colors.onSurface,
  },
  productCategory: {
    ...Typography.labelMd,
    color: Colors.primary,
    textTransform: "uppercase" as const,
    marginTop: 2,
  },
  closeButton: {
    padding: 6,
  },
  body: {
    padding: Spacing.gutter,
  },
  description: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.gutter,
  },
  sectionLabel: {
    ...Typography.labelMd,
    color: Colors.onSurface,
    marginBottom: 10,
  },
  presetContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.smMd,
  },
  presetChip: {
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: Spacing.smMd,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  presetChipSelected: {
    borderColor: Colors.primaryContainer,
    backgroundColor: Colors.goldMuted,
  },
  presetText: {
    ...Typography.labelMd,
    color: Colors.onSurfaceVariant,
  },
  presetTextSelected: {
    color: Colors.primary,
  },
  input: {
    backgroundColor: Colors.surfaceContainerHigh,
    color: Colors.onSurface,
    borderRadius: Radius.md,
    padding: Spacing.smMd,
    ...Typography.bodyMd,
    minHeight: 70,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    marginBottom: Spacing.gutter,
  },
  inputFocused: {
    borderColor: Colors.primary,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.gutter,
    paddingTop: 10,
    gap: Spacing.smMd,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    paddingHorizontal: 6,
  },
  stepperBtn: {
    padding: 10,
  },
  stepperCount: {
    ...Typography.titleMd,
    color: Colors.onSurface,
    paddingHorizontal: Spacing.sm,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: Colors.primaryContainer,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: Radius.lg,
    gap: Spacing.sm,
    ...(Elevation.goldCTA as object),
  },
  confirmBtnText: {
    ...Typography.labelLg,
    color: Colors.onPrimary,
  },
});
