import React, { useState } from "react";
import { StyleSheet, View, Text, Modal, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { X, Minus, Plus, ShoppingBag } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Colors } from "../theme/colors";
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
    setNotes((prev) => {
      if (prev.includes(preset)) return prev;
      return prev ? `${prev}, ${preset}` : preset;
    });
  };

  const handleAdd = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onConfirm(product, quantity, notes);
    setQuantity(1);
    setNotes("");
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
              <X size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body}>
            <Text style={styles.description}>{product.description}</Text>

            {/* NOTAS DE PERSONALIZACIÓN */}
            <Text style={styles.sectionLabel}>Preferencias de Barra (Opcional)</Text>
            <View style={styles.presetContainer}>
              {PRESET_NOTES.map((preset) => (
                <TouchableOpacity
                  key={preset}
                  style={styles.presetChip}
                  onPress={() => handlePresetNote(preset)}
                >
                  <Text style={styles.presetText}>+ {preset}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="¿Alguna instrucción especial para el bartender?"
              placeholderTextColor={Colors.textMuted}
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </ScrollView>

          {/* FOOTER CON CANTIDAD Y BOTÓN DE AÑADIR */}
          <View style={styles.footer}>
            <View style={styles.stepper}>
              <TouchableOpacity style={styles.stepperBtn} onPress={handleDecrease}>
                <Minus size={16} color={Colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.stepperCount}>{quantity}</Text>
              <TouchableOpacity style={styles.stepperBtn} onPress={handleIncrease}>
                <Plus size={16} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.confirmBtn} onPress={handleAdd} activeOpacity={0.85}>
              <ShoppingBag size={18} color={Colors.textInverse} />
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
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  titleArea: {
    flex: 1,
  },
  productName: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "800",
  },
  productCategory: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    marginTop: 2,
  },
  closeButton: {
    padding: 6,
  },
  body: {
    padding: 20,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  sectionLabel: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
  },
  presetContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  presetChip: {
    backgroundColor: Colors.cardSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  presetText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  input: {
    backgroundColor: Colors.cardSecondary,
    color: Colors.textPrimary,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    minHeight: 70,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 14,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.cardSecondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 6,
  },
  stepperBtn: {
    padding: 10,
  },
  stepperCount: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "800",
    paddingHorizontal: 8,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  confirmBtnText: {
    color: Colors.textInverse,
    fontSize: 15,
    fontWeight: "800",
  },
});
