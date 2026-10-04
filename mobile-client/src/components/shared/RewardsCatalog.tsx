// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — RewardsCatalog
// Full-screen modal catalog for browsing and redeeming rewards.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Gift, Star } from 'lucide-react-native';

import { Colors }          from '../../theme/colors';
import { Typography }      from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';

import { usePointsStore }                 from '../../stores/usePointsStore';
import { getPublicRewards, redeemReward } from '../../api/rewardApi';
import type { Reward }                    from '../../api/rewardApi';

// ── Props ─────────────────────────────────────────────────────────────────────

interface RewardsCatalogProps {
  visible:  boolean;
  onClose:  () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function RewardsCatalog({ visible, onClose }: RewardsCatalogProps) {
  const balance = usePointsStore((s) => s.balance);

  const [rewards,   setRewards]   = useState<Reward[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [redeeming, setRedeeming] = useState<string | null>(null); // reward _id being redeemed

  const fetchRewards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPublicRewards();
      setRewards(data);
    } catch {
      setError('No se pudieron cargar las recompensas. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) fetchRewards();
  }, [visible, fetchRewards]);

  const handleRedeem = (reward: Reward) => {
    if (balance < reward.pointsCost) return;

    Alert.alert(
      'Canjear recompensa',
      `¿Querés canjear "${reward.name}" por ${reward.pointsCost} pts?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Canjear',
          onPress: async () => {
            setRedeeming(reward._id);
            try {
              await redeemReward(reward._id);
              usePointsStore.getState().addLocal(
                -reward.pointsCost,
                `Canje: ${reward.name}`,
              );
              Alert.alert('¡Listo!', `Canjeaste "${reward.name}" exitosamente.`);
            } catch (e: any) {
              Alert.alert(
                'Error al canjear',
                e?.response?.data?.message ?? e?.message ?? 'Intentá de nuevo.',
              );
            } finally {
              setRedeeming(null);
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: Reward }) => {
    const canRedeem = balance >= item.pointsCost;
    const isLoading = redeeming === item._id;
    const missing   = item.pointsCost - balance;

    return (
      <View style={styles.card}>
        {/* Image / icon */}
        <View style={styles.imageWrap}>
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imageFallback}>
              <Gift size={28} color={Colors.primary} />
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.cardBody}>
          <Text style={styles.rewardName} numberOfLines={1}>
            {item.name}
          </Text>
          {item.description ? (
            <Text style={styles.rewardDesc} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}

          <View style={styles.cardFooter}>
            {/* Points badge */}
            <View style={styles.pointsBadge}>
              <Star size={11} color={Colors.primary} />
              <Text style={styles.pointsBadgeText}>{item.pointsCost} pts</Text>
            </View>

            {/* Redeem button */}
            <TouchableOpacity
              style={[
                styles.redeemBtn,
                !canRedeem && styles.redeemBtnDisabled,
              ]}
              onPress={() => handleRedeem(item)}
              disabled={!canRedeem || isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={Colors.onPrimary} />
              ) : (
                <Text
                  style={[
                    styles.redeemBtnText,
                    !canRedeem && styles.redeemBtnTextDisabled,
                  ]}
                >
                  {canRedeem ? 'Canjear' : `Te faltan ${missing} pts`}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Mis Recompensas</Text>
            <View style={styles.balanceRow}>
              <Star size={14} color={Colors.primary} />
              <Text style={styles.balanceText}>{balance} pts disponibles</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <X size={20} color={Colors.onSurface} />
          </TouchableOpacity>
        </View>

        {/* Body */}
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Cargando recompensas...</Text>
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchRewards}>
              <Text style={styles.retryBtnText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : rewards.length === 0 ? (
          <View style={styles.centered}>
            <Gift size={40} color={Colors.outline} />
            <Text style={styles.emptyText}>No hay recompensas disponibles por ahora.</Text>
          </View>
        ) : (
          <FlatList
            data={rewards}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const GOLD = Colors.primary; // #f3be59

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Header
  header: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    paddingHorizontal: Spacing.gutter,
    paddingVertical:   Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(224,226,236,0.06)',
  },
  headerTitle: {
    ...Typography.headlineSm,
    color: Colors.onSurface,
    marginBottom: 2,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap: 4,
  },
  balanceText: {
    ...Typography.labelMd,
    color: GOLD,
  },
  closeBtn: {
    width:  36,
    height: 36,
    borderRadius:    Radius.full,
    backgroundColor: Colors.surfaceContainerHigh,
    justifyContent:  'center',
    alignItems:      'center',
  },

  // List
  list: {
    paddingHorizontal: Spacing.gutter,
    paddingTop:        Spacing.md,
    paddingBottom:     Spacing.xxl,
    gap: Spacing.md,
  },

  // Card
  card: {
    flexDirection:   'row',
    backgroundColor: Colors.surfaceContainer,
    borderRadius:    Radius.xl,
    borderWidth:     1,
    borderColor:     'rgba(224,226,236,0.06)',
    overflow:        'hidden',
  },
  imageWrap: {
    width:  80,
    height: 80,
    alignSelf: 'center',
    margin: Spacing.sm,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  image: {
    width:  '100%',
    height: '100%',
  },
  imageFallback: {
    width:           '100%',
    height:          '100%',
    backgroundColor: Colors.goldMuted,
    borderRadius:    Radius.md,
    justifyContent:  'center',
    alignItems:      'center',
  },
  cardBody: {
    flex:    1,
    padding: Spacing.sm,
    gap:     4,
    justifyContent: 'center',
  },
  rewardName: {
    ...Typography.labelLg,
    color: Colors.onSurface,
  },
  rewardDesc: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems:    'center',
    gap: Spacing.sm,
    marginTop: 6,
  },
  pointsBadge: {
    flexDirection:   'row',
    alignItems:      'center',
    gap: 3,
    backgroundColor: Colors.goldMuted,
    borderRadius:    Radius.full,
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderWidth:     1,
    borderColor:     Colors.goldBorder,
  },
  pointsBadgeText: {
    ...Typography.labelSm,
    color: GOLD,
  },
  redeemBtn: {
    flex: 1,
    alignItems:      'center',
    justifyContent:  'center',
    backgroundColor: GOLD,
    borderRadius:    Radius.full,
    paddingVertical: 6,
    paddingHorizontal: Spacing.sm,
  },
  redeemBtnDisabled: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: 'rgba(224,226,236,0.10)',
  },
  redeemBtnText: {
    ...Typography.labelSm,
    color: Colors.onPrimary,
    fontWeight: '700' as const,
  },
  redeemBtnTextDisabled: {
    color: Colors.onSurfaceVariant,
  },

  // States
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems:     'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.gutter,
  },
  loadingText: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
  },
  errorText: {
    ...Typography.bodyMd,
    color: Colors.error,
    textAlign: 'center',
  },
  emptyText: {
    ...Typography.bodyMd,
    color: Colors.outline,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical:   Spacing.sm,
    backgroundColor:   Colors.goldMuted,
    borderRadius:      Radius.full,
    borderWidth:       1,
    borderColor:       Colors.goldBorder,
  },
  retryBtnText: {
    ...Typography.labelMd,
    color: GOLD,
  },
});
